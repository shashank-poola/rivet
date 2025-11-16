import { Request, Response } from "express";
import prisma from "../../../packages/prisma-db/index.js";
import { addToQueue } from "../redis/redis.js";

export const executeWorkflow = async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params;
    const context = req.body || {};
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      include: { user: true },
    });
    if (!workflow) {
      return res.status(404).json({ message: "Workflow not found" });
    }
    const nodes = workflow.nodes as Record<string, any>;
    const connections = workflow.connections as Record<string, any>;
    const totalTasks = Object.keys(nodes).length;
    const execution = await prisma.execution.create({
      data: {
        workflowId,
        totalTasks,
        tasksDone: 0,
        status: false,
        result: { triggerPayload: context, nodeResults: {} },
      },
    });
    const startingNodes = findStartingNodes(nodes, connections);
    for (const nodeId of startingNodes) {
      const nodeData = nodes[nodeId];
      await addToQueue({
        id: `${nodeId}-${execution.id}`,
        type: nodeData.type.toLowerCase(),
        data: {
          executionId: execution.id,
          workflowId,
          nodeId,
          credentialId: nodeData.credentials,
          nodeData: nodeData,
          context,
          connections: connections[nodeId] || [],
        },
      });
    }

    res.json({
      message: "Workflow execution started",
      executionId: execution.id,
      workflowId,
      totalTasks,
    });
  } catch (error) {
    console.error("Error executing workflow:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const findStartingNodes = (
  nodes: Record<string, any>,
  connections: Record<string, string[]>
) => {
  const hasIncomingConnection = new Set<string>();
  Object.values(connections).forEach((targets) => {
    targets.forEach((target) => hasIncomingConnection.add(target));
  });
  return Object.keys(nodes).filter(
    (nodeId) => !hasIncomingConnection.has(nodeId)
  );
};