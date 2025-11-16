// apps/server/src/Workers/nodes/agent/tools/tools.ts

import { z } from "zod";
import { tool } from "@langchain/core/tools";

/**
 * Basic calculation utilities (sync)
 */
function calculateSum(a: number, b: number) {
  return a + b;
}

function calculateProduct(a: number, b: number) {
  return a * b;
}

function calculatePower(base: number, exponent: number) {
  return Math.pow(base, exponent);
}

/**
 * Content writer utility (sync mock)
 * – Gemini will decide whether to use this tool automatically
 */
function generateContent(
  topic: string,
  style: string = "neutral",
  length: number = 300
) {
  return `Here is a ${style} article about "${topic}" with approx ${length} words. [Generated content]\n\n(This is placeholder; Gemini may rewrite it.)`;
}

/**
 * Exported tools for the Gemini Agent
 * --------------------------------------------------------------------------------
 * These tools are used by createToolCallingAgent() in geminiAgent.ts.
 * Gemini automatically chooses the correct tool based on intent.
 * --------------------------------------------------------------------------------
 */

export const tools = [

  /**
   * SUM TOOL
   */
  tool(
    async (input: any) => {
      const { a, b } = input;
      const result = calculateSum(a, b);
      console.log(`[Tool SUM] ${a} + ${b} = ${result}`);
      return String(result);
    },
    {
      name: "sum",
      description: "Calculate the sum of two numbers.",
      schema: z.object({
        a: z.number().describe("First number"),
        b: z.number().describe("Second number"),
      }),
    }
  ),

  /**
   * MULTIPLY TOOL
   */
  tool(
    async (input: any) => {
      const { a, b } = input;
      const result = calculateProduct(a, b);
      console.log(`[Tool MULTIPLY] ${a} × ${b} = ${result}`);
      return String(result);
    },
    {
      name: "multiply",
      description: "Multiply two numbers.",
      schema: z.object({
        a: z.number().describe("First number"),
        b: z.number().describe("Second number"),
      }),
    }
  ),

  /**
   * POWER TOOL
   */
  tool(
    async (input: any) => {
      const { base, exponent } = input;
      const result = calculatePower(base, exponent);
      console.log(`[Tool POWER] ${base}^${exponent} = ${result}`);
      return String(result);
    },
    {
      name: "power",
      description: "Raise a base number to a given exponent.",
      schema: z.object({
        base: z.number().describe("Base number"),
        exponent: z.number().describe("Exponent"),
      }),
    }
  ),

  /**
   * CONTENT WRITER TOOL
   */
  tool(
    async (input: any) => {
      const { topic, style, length } = input;
      const result = generateContent(topic, style, length);
      console.log(
        `[Tool CONTENT_WRITER] Generating content topic="${topic}", style="${style}", length=${length}`
      );
      return String(result);
    },
    {
      name: "content_writer",
      description: `
        Generates content on any topic (blogs, posts, essays, summaries, articles, etc).
        Gemini should automatically use this when writing content.
      `,
      schema: z.object({
        topic: z.string().describe("Topic to write about"),
        style: z.string().optional().describe("Writing style (formal, casual, etc.)"),
        length: z.number().optional().describe("Approx word count"),
      }),
    }
  ),
];
