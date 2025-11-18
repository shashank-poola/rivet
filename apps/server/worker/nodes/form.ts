import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient(); 

export const nodeDetails = {
  type: "form",
  name: "Form",
  description: "Pauses the workflow until a user submits a form.",
  category: "Triggers",
  icon: "📝",
};


export async function runFormNode(
  node: any,
  context: Record<string, any>,
  workflowId: string,
  executionId: string
) {
  try {
    if (!workflowId) throw new Error("workflowId required for form node");
    if (!node) throw new Error("Node is required");

    // lookup form entry based on workflowId + nodeId
    const formRecord = await prisma.form.findUnique({
      where: {
        workflowId_nodeId: {
          workflowId,
          nodeId: node.id,
        },
      },
    });

    if (!formRecord) {
      throw new Error("Form not found for this workflow node");
    }

    // returning this makes it easier for frontend
    return {
      formId: formRecord.id,
      url: `/forms/${formRecord.id}`,
      message: "Form node triggered. Workflow paused.",
    };
  } catch (err: any) {
    console.error("Form Node Error:", err.message);
    throw new Error("Form Node Runner failed");
  }
}
