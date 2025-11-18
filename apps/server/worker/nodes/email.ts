import * as mustache from "mustache";
import { Resend } from "resend";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function sendEmail(
    template: any,
    credentialId: string,
    Context: any,
) {
    try {
        const credentials = await prisma.credentials.findMany({
            where: { id: credentialId },
        });
        if (!credentials) {
            throw new Error("Email credentials was not found");
        }
        const data = credentials[0].data as { apiKey: string };
        if (!data.apiKey) {
            throw new Error("Email API key was not found");
        }
        const resend = new Resend(data.apiKey);
        const to = mustache.render(template.to, Context);
        const subject = mustache.render(template.subject, Context);
        const body = mustache.render(template.body, Context)

        await resend.emails.send({
            from: "onboarding@resend.dev",
            to,
            subject,
            html: body,
        });
        return { to, subject, body };
    } catch (error) {
        throw new Error(`Failed to send email: ${error}`)
    }
}