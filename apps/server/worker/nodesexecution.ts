import { createClient } from "redis";
import { PrismaClient } from "@prisma/client";
import { runNode } from "./nodes/runNode/runner";
import { setTimeout as sleep } from "timers/promises";

const prisma = new PrismaClient();

// redis client
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const QUEUE_KEY = process.env.RIVET_QUEUE_KEY || "rivet:queue";

const redisClient = createClient({ url: REDIS_URL });

redisClient.on("error", (error: any) => {
  console.error("Redis Client Error", error);
});

async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

// Adding job to redis queue
export async function addToQueue(job: unknown) {
  await connectRedis();
  const payload = JSON.stringify(job);
  await redisClient.rPush(QUEUE_KEY, payload);
}


export async function getFromQueue(timeoutSeconds = 2) {
  await connectRedis();
  // BLPOP returns { key, element } or null in redis v5
  try {
    const res = await redisClient.blPop(QUEUE_KEY, timeoutSeconds);
    if (!res) return null;
    const payload = typeof res.element === 'string' ? res.element : res.element.toString();
    if (!payload) return null;
    try {
      return JSON.parse(payload);
    } catch (e) {
      console.warn("Failed to parse job JSON:", e);
      return null;
    }
  } catch (err) {
    console.error("Error while blpop:", err);
    return null;
  }
}

function nowMs() {
  return Date.now();
}


async function updateExecution(
  executionId: string,
  nodeId: string,
  nodeResult: unknown
) {
  if (!executionId) return;

  const exec = await prisma.execution.findUnique({ where: { id: executionId } });
  if (!exec) return;

  // current result or default structure
  const curResult = (exec.result as any) ?? { nodeResults: {} };
  const nodeResults = curResult.nodeResults ?? {};

  const newTasksDone = (exec.tasks_done ?? 0) + 1;
  const totalTasks = exec.total_tasks ?? 0;
  const isComplete = newTasksDone >= totalTasks;

  nodeResults[nodeId] = {
    result: nodeResult,
    completedAt: nowMs(),
  };

  const newResult = { ...curResult, nodeResults };
  const updatePayload: any = {
    tasks_done: newTasksDone,
    result: newResult,
  };

  if (isComplete) {
    updatePayload.status = "COMPLETED";
    newResult.completedAt = nowMs();
  }

  await prisma.execution.update({
    where: { id: executionId },
    data: updatePayload,
  });

  console.log(`Execution updated: ${executionId}, tasks_done=${newTasksDone}, total=${totalTasks}`);
}


async function processJobs() {
  console.log("Worker started...");
  await connectRedis();

  while (true) {
    try {
      console.log("Waiting for a job...");
      const job = await getFromQueue(2); 
      if (!job) {
        // no job found, small sleep to avoid tight loop
        await sleep(100);
        continue;
      }

      console.log("--- Received a job ---");
      console.log("Job data:", job);

      const jobType: string = (job as any).type;
      let nodeResult: any = {};


      if (jobType === "form") {
        try {
          const executionId = (job as any).data?.executionId;
          if (executionId) {
            const exec = await prisma.execution.findUnique({ where: { id: executionId } });
            if (exec) {
              await prisma.execution.update({
                where: { id: executionId },
                data: {
                  status: "PAUSED",
                  paused_node_id: (job as any).data?.nodeId,
                },
              });
              console.log(
                `Execution ${executionId} paused for form input at node ${(job as any).data?.nodeId}.`
              );
            }
          }
        } catch (err) {
          console.error("Error pausing execution for form job:", err);
        }
        continue; // don't do further processing for form jobs
      }

      if (jobType === "webhook") {
        nodeResult = (job as any).data?.context ?? {};
      } else if (jobType !== "manual") {

        const nodeData = (job as any).data?.nodeData ?? {};
        const config =
          typeof nodeData?.data === "object" && nodeData?.data !== null
            ? nodeData.data?.config ?? {}
            : {};

        const node = {
          type: jobType,
          template: config?.template ?? {},
          credentialId: config?.credentialId ?? "",
        };

        const context = {
          ...( (job as any).data?.context ?? {} ),
          executionId: (job as any).data?.executionId,
        };

        console.log(`Processing ${jobType} node with config:`, config);
        console.log(`Context keys:`, Object.keys(context));

        try {
          nodeResult = await runNode(node, context);
          console.log(`${jobType} node completed with result:`, nodeResult);
        } catch (nodeError) {
          console.error(`ERROR processing ${jobType} node:`, nodeError);
          // mark execution failed
          try {
            const executionId = (job as any).data?.executionId;
            if (executionId) {
              const exec = await prisma.execution.findUnique({ where: { id: executionId } });
              if (exec) {
                await prisma.execution.update({
                  where: { id: executionId },
                  data: { status: "FAILED" },
                });
              }
            }
          } catch (uerr) {
            console.error("Error marking execution failed:", uerr);
          }
          continue;
        }
      }

      // If nodeResult signals pause
      if (nodeResult && nodeResult.status === "PAUSED") {
        try {
          const executionId = (job as any).data?.executionId;
          if (executionId) {
            await prisma.execution.update({
              where: { id: executionId },
              data: {
                status: "PAUSED",
                paused_node_id: (job as any).data?.nodeId,
              },
            });
            console.log(`Execution ${executionId} paused at node ${(job as any).data?.nodeId}`);
          }
        } catch (err) {
          console.error("Error while setting paused status:", err);
        }
        continue;
      }

      // Update execution state after node completes
      try {
        await updateExecution(
          (job as any).data?.executionId,
          (job as any).data?.nodeId,
          nodeResult
        );
      } catch (err) {
        console.error("Error updating execution:", err);
      }

      // Enqueue next nodes from workflow connections
      try {
        const workflowId = (job as any).data?.workflowId;
        if (workflowId && Array.isArray((job as any).data?.connections) && (job as any).data?.connections.length > 0) {
          const workflow = await prisma.workflow.findUnique({ where: { id: workflowId } });
          if (workflow) {
            const nodes = (workflow.nodes as any) ?? {};
            const connections = (workflow.connections as any) ?? {};
            const updatedContext = {
              ...( (job as any).data?.context ?? {} ),
              ...( nodeResult || {} ),
            };

            for (const nextNodeId of (job as any).data.connections) {
              const nextNodeData = nodes?.[nextNodeId];
              if (!nextNodeData) continue;

              const nodeType =
                ((nextNodeData?.data?.nodeType as string) ?? (nextNodeData?.type as string) ?? "")
                  .toString()
                  .toLowerCase();

              const nextJob = {
                id: `${nextNodeId}-${(job as any).data?.executionId}`,
                type: nodeType,
                data: {
                  ...(job as any).data,
                  nodeId: nextNodeId,
                  nodeData: nextNodeData,
                  credentialId: nextNodeData?.credentials,
                  context: updatedContext,
                  connections: connections?.[nextNodeId] ?? [],
                },
              };

              console.log(`Adding ${nodeType} job to queue for node ${nextNodeId}`);
              await addToQueue(nextJob);
            }
          }
        }
      } catch (err) {
        console.error("Error enqueuing next nodes:", err);
      }
    } catch (exe) {
      console.error("Error occured while processing the job:", exe);
      // small backoff
      await sleep(100);
    }
  }
}

// starting worker
(async () => {
  try {
    await connectRedis();
    console.log("Connected to Redis:", REDIS_URL);
    await processJobs();
  } catch (err) {
    console.error("Fatal worker error:", err);
    process.exit(1);
  }
})();
