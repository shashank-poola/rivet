import prisma from "@prisma/client"; 

export const nodeDetails = {
  type: "form",
  name: "Form",
  description: "Pauses the workflow until a user submits a form.",
  category: "Triggers",
  icon: "📝",
};

/**
 * Main Form Node Runner
 * 
 * The worker will pause the execution automatically.
 * This node simply returns the form metadata so the UI
 * can show the form link.
 */
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
    const form = await prisma.form.findUnique({
      where: {
        workflowId_nodeId: {
          workflowId,
          nodeId: node.id,
        },
      },
    });

    if (!form) {
      throw new Error("Form not found for this workflow node");
    }

    // returning this makes it easier for frontend
    return {
      formId: form.id,
      url: `/forms/${form.id}`,
      message: "Form node triggered. Workflow paused.",
    };
  } catch (err: any) {
    console.error("Form Node Error:", err.message);
    throw new Error("Form Node Runner failed");
  }
}
