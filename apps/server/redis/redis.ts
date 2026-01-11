import { redis } from "../../../packages/redis/redis.js";


interface Queue {
  id: string;
  type: "telegram" | "email" | "gemini" | "form" | "webhook" | "manual";
  data: {
    executionId: string;
    credentialId?: string;
    nodeId: string;
    workflowId: string;
    nodeData: any;
    context: Record<string, any>;
    connections: string[];
  };
}

// Use same queue name as worker for compatibility
const QUEUE_NAME = process.env.RIVET_QUEUE_KEY || process.env.WORKFLOW_QUEUE_NAME || "rivet:queue";

export const addToQueue = async (job: Queue) => {
  try {
    await redis.lPush(QUEUE_NAME, JSON.stringify(job));
    console.log(`Job of ${job.id} added to queue: ${job.type}`);
  } catch (error) {
    console.log(`Error while adding job to queue: ${error}`);
  }
};

export const getFromQueue = async (timeout: number = 0) => {
  try {
    const res = await redis.brPop(QUEUE_NAME, timeout);
    if (res) {
      return JSON.parse(res.element);
    }
    return null;
  } catch (error) {
    console.log(`Error while getting job from queue: ${error}`);
  }
};

export const clearQueue = async () => {
  try {
    await redis.del(QUEUE_NAME);
    console.log(`Queue: ${QUEUE_NAME} successfully deleted`);
  } catch (error) {
    console.log(`Erorr while clearing queue: ${error}`);
  }
}
async function run() {
  await redis.connect();
};

run();
