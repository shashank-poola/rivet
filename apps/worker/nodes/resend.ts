import { Resend } from "resend";
import Mustache from "mustache";

export async function sendEmail(config: any, apiKey: string, context: any) {
    try {
        const resend = new Resend(apiKey);

        const to = Mustache.render(config.to, context);
        const subject = Mustache.render(config.subject, context);
        const body = Mustache.render(config.body, context);

        const result = await resend.emails.send({
            from: "onboarding@resend.dev",
            to,
            subject,
            html: body
        });

        console.log("Email sent result:", result);

        return result;
    } catch (error) {
        throw new Error(`Failed to send Email: ${error.message}`);
    }
}

console.log("Starting email send...");

sendEmail(
    {
        to: "{{email}}",
        subject: "Welcome to FlowEngine",
        body: "Congrats {{name}}, you have successfully sent an email 🎉",
    },
    "re_QwYHoiZr_EBCLJgiAAKDxvDzYRg7C9ooq", // API key
    {
        name: "Shashank",
        email: "shashankpoola123@gmail.com"
    }
).then(result => {
    console.log("Email sent successfully:", result);
}).catch(error => {
    console.error("Error sending email:", error);
});
