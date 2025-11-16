import { Request, Response } from "express";
import { prisma } from "@prisma/client"; 
import Mustache from "mustache";
import fetch from "node-fetch";
import { z } from "zod";

export const nodeDetails = {
  type: "telegram",
  name: "Telegram Bot",
  description: "Send messages via Telegram Bot API",
  category: "Communication",
  icon: "📱",
};

// ----------------------
// Validators
// ----------------------
const templateSchema = z.object({
  message: z.string().optional(),
});

const contextSchema = z.record(z.any());

// ----------------------
// Telegram Send Function
// ----------------------
export async function sendTelegramMessage(
  credentialId: string,
  template: any,
  context: any
) {
  // 1. Fetch credential from DB
  const credential = await prisma.credentials.findFirst({
    where: { id: credentialId },
  });

  if (!credential) {
    throw new Error("Telegram credential not found");
  }

  const data = credential.data as any;

  const apiKey: string | undefined = data?.apiKey;
  const chatId: string | undefined = data?.chatId;

  if (!apiKey || !chatId) {
    throw new Error("You have not provided both the botToken and chatId");
  }

  // 2. Render Mustache template
  const msg = Mustache.render(template?.message || "", context);

  // 3. Call Telegram API
  const url = `https://api.telegram.org/bot${apiKey}/sendMessage`;

  const payload = {
    chat_id: chatId,
    text: msg,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error("Telegram API error");
  }

  return {
    msg,
    msg_sent: text,
  };
}

// ----------------------
// Express Route
// ----------------------
export const telegramHandler = async (req: Request, res: Response) => {
  try {
    const { credentialId, template, context } = req.body;

    templateSchema.parse(template);
    contextSchema.parse(context);

    const result = await sendTelegramMessage(
      credentialId,
      template,
      context
    );

    return res.json(result);
  } catch (err: any) {
    return res.status(400).json({
      error: err.message || "Something went wrong",
    });
  }
};
