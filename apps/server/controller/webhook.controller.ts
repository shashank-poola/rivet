import { Request, Response } from "express";
import prisma from "../db.js";
import { addToQueue } from "../redis/redis.js";

export async function handleWebhookCall(req: Request, res: Response) {
  try {
    const webhookId = req.params.webhookId;
    const headers = req.headers;
    const query = req.query;
    const rawBody = req.body;

    // 1. Find workflow by webhookId
    const workflow = await prisma.workflow.findUnique({
      where: { webhookId },
    });

    if (!workflow) {
      return res.status(404).json({
        error: "No workflow found for this webhook ID",
      });
    }

    const nodes = (workflow.nodesJson as Record<string, any>) ?? {};
    const connections = (workflow.connections as Record<string, string[]>) ?? {};

    // 2. Find trigger node
    let triggerNodeId: string | null = null;

    for (const nodeId in nodes) {
      const node = nodes[nodeId] as any;
      if (node.type === "webhook") {
        triggerNodeId = nodeId;
        break;
      }
    }

    if (!triggerNodeId) {
      return res.status(500).json({
        error: "Workflow does not contain a webhook node",
      });
    }

    // 3. Check if any form node exists
    const hasForm = Object.values(nodes).some(
      (node: any) =>
        node.type === "form" ||
        node.data?.nodeType === "form"
    );

    // 4. Create execution row
    const newExecution = await prisma.execution.create({
      data: {
        workflowId: workflow.id,
        status: "PENDING",
        totalTasks: Object.keys(nodes).length,
      },
    });

    // 5. Safely decode body
    let parsedBody = rawBody;
    try {
      if (typeof rawBody === "string") {
        parsedBody = JSON.parse(rawBody);
      }
    } catch {
      // keep rawBody
    }

    // Context passed to worker
    const webhookContext = {
      headers,
      body: parsedBody,
      query_params: query,
    };

    // 6. Create first job
    const firstJob = {
      id: `${triggerNodeId}-${newExecution.id}`,
      type: "webhook" as const,
      data: {
        executionId: newExecution.id,
        workflowId: workflow.id,
        nodeId: triggerNodeId,
        nodeData: (nodes[triggerNodeId] as any),
        context: webhookContext,
        connections: (connections[triggerNodeId] ?? []) as string[],
      },
    };

    // Push job to Redis queue
    await addToQueue(firstJob);

    // 7. Return execution info
    return res.json({
      execution_id: newExecution.id,
      workflow_id: workflow.id,
      has_form: hasForm,
    });

  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({ error: "Webhook handler failed" });
  }
}
