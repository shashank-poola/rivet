import sendEmail from "../email.js";
import { sendTelegramMessage } from "../telegram.js";
import { runGeminiAgent } from "../gemini/gemini.js";
import { runFormNode } from "../form.js";

export async function runNode(
  node: any,
  context: Record<string, any>
): Promise<any> {
  const nodeType = (node.type || "").toLowerCase();

  console.log(`[Runner] Executing node type: ${nodeType}`);

  try {
    switch (nodeType) {
      case "email":
        return await sendEmail(
          node.template || {},
          node.credentialId || "",
          context
        );

      case "telegram":
        return await sendTelegramMessage(
          node.credentialId || "",
          node.template || {},
          context
        );

      case "gemini":
      case "agent":
        return await runGeminiAgent({
          credentialId: node.credentialId,
          template: node.template || {},
          context,
          workflowId: context.workflowId,
          executionId: context.executionId,
          nodeId: context.nodeId,
          useMemory: node.template?.useMemory || false,
        });

      case "form":
        return await runFormNode(
          node,
          context,
          context.workflowId || "",
          context.executionId || ""
        );

      case "webhook":
        // Webhook jobs are handled specially in the worker
        // They just pass through their context
        return context;

      case "manual":
        // Manual triggers just pass through
        return { triggered: true, ...context };

      default:
        throw new Error(`Unknown node type: ${nodeType}`);
    }
  } catch (error: any) {
    console.error(`[Runner] Error executing ${nodeType} node:`, error);
    throw new Error(`Node execution failed: ${error.message || error}`);
  }
}
