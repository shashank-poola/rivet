// apps/server/src/Workers/nodes/agent/geminiAgent.ts
import * as Mustache from "mustache";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { AgentExecutor, createToolCallingAgent } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { PrismaClient } from "@prisma/client";
import { tools } from "./tools/tools";

const prisma = new PrismaClient();

type RunAgentParams = {
  credentialId: string | null | undefined;
  template: any;
  context: Record<string, any>;
  workflowId?: string;
  executionId?: string;
  nodeId?: string;
  useMemory?: boolean;
};

function resolveTemplate(template: string, context: Record<string, any>): string {
  if (!template || typeof template !== "string") return template;
  // Mustache will handle most templating; we provide a tiny helper for $json / $node style if used
  // First, replace simple $json and $node placeholders if present, then run Mustache for general templates
  const replaced = template
    .replace(/\{\{\s*\$json\.body\.([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
      return context.$json?.body?.[key] ?? `{{${key}}}`;
    })
    .replace(/\{\{\s*\$node\.([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\s*\}\}/g, (_, nodeId, prop) => {
      return context.$node?.[nodeId]?.[prop] ?? `{{$node.${nodeId}.${prop}}}`;
    });

  try {
    return Mustache.render(replaced, context);
  } catch (e) {
    // fallback to replaced string on bad mustache input
    return replaced;
  }
}

/**
 * Create ChatGoogleGenerativeAI LLM from credential record
 * Credential record is expected to have geminiApiKey (string)
 */
function createGeminiModelFromCreds(credsData: any) {
  const data = typeof credsData === "string" ? JSON.parse(credsData) : credsData;
  const apiKey = data?.geminiApiKey ?? data?.api_key ?? data?.apiKey;
  if (!apiKey) throw new Error("Missing Gemini API key in credential data");

  return new ChatGoogleGenerativeAI({
    apiKey,
    model: data?.model ?? "gemini-2.0-flash",
    temperature: typeof data?.temperature === "number" ? data.temperature : 0.2,
  });
}

/**
 * Main entry: run the Gemini tool-calling agent
 */
export async function runGeminiAgent({
  credentialId,
  template,
  context,
  workflowId,
  executionId,
  nodeId,
  useMemory = false,
}: RunAgentParams) {
  try {
    // Validate prompt
    let rawPrompt = template?.prompt ?? template?.message ?? "";
    if (!rawPrompt || typeof rawPrompt !== "string" || rawPrompt.trim() === "") {
      throw new Error("Prompt must be provided in the template");
    }

    // Resolve templating (Mustache + small $json/$node helpers)
    const prompt = resolveTemplate(rawPrompt, context || {});

    // Load credentials from DB
    if (!credentialId) {
      throw new Error("credentialId required");
    }

    const creds = await prisma.credentials.findUnique({
      where: { id: credentialId },
    });

    if (!creds) {
      throw new Error("Gemini credentials not found");
    }

    const model = createGeminiModelFromCreds(creds.data);

    // TODO: Implement memory/history if needed
    // For now, no conversation history
    const history: { role: "user" | "assistant"; content: string }[] = [];

    // Build ChatPromptTemplate: system + history + user
    const systemMessage =
      "You are a helpful AI assistant with access to tools. Use tools when needed for facts, web lookups or summaries. " +
      "If asked to return JSON, return only valid JSON without explanatory text or code fences.";

    const messages: any[] = [
      ["system", systemMessage],
      // convert history to prompt entries
      ...history.map((h) => [h.role === "assistant" ? "assistant" : "user", h.content]),
      ["user", "{input}"],
      ["placeholder", "{agent_scratchpad}"],
    ];

    const promptTemplate = ChatPromptTemplate.fromMessages(messages as any);

    // create tool-calling agent
    const agent = await createToolCallingAgent({
      llm: model,
      tools,
      prompt: promptTemplate,
    });

    const executor = new AgentExecutor({
      agent,
      tools,
      verbose: true,
      maxIterations: 10,
    });

    // Invoke the agent with the resolved prompt
    const result = await executor.invoke({ input: String(prompt) });
    if (!result) throw new Error("Agent returned no result");

    // result.output often contains assistant-generated text (may include code fences or JSON)
    let rawText = String(result.output ?? "").trim();

    // strip common JSON code fences if any
    rawText = rawText.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();

    // TODO: Implement memory storage if needed
    // TODO: Implement event publishing for UI updates (use your own routing system)

    // Try to parse as JSON and return structured object when possible
    try {
      const parsed = JSON.parse(rawText);
      if (parsed && typeof parsed === "object") {
        return {
          text: parsed,
          query: String(prompt),
          intermediateSteps: result.intermediateSteps ?? [],
        };
      }
    } catch {
      // not valid JSON — fall through to returning raw text
    }

    return {
      text: rawText,
      query: String(prompt),
      intermediateSteps: result.intermediateSteps ?? [],
    };
  } catch (err: any) {
    console.error("runGeminiAgent error:", err?.message ?? err);
    // return error message similarly to Python code
    return { result: `Agent execution failed: ${err?.message ?? String(err)}` };
  }
}
