import { Response } from "express";

export const getTemplates = async (req: any, res: Response) => {
    const templates = [
        {
            id: "1",
            title: "Email Notification Bot",
            description: "Send automated email notifications based on triggers",
            category: "Communication",
            icon: "Mail",
        },
        {
            id: "2",
            title: "AI Text Generator",
            description: "Generate text using AI models",
            category: "AI",
            icon: "Bot",
        },
        {
            id: "3",
            title: "Data Sync Pipeline",
            description: "Sync data between multiple platforms",
            category: "Integration",
            icon: "RefreshCw",
        },
        {
            id: "4",
            title: "Social Media Scheduler",
            description: "Schedule and post content to social media",
            category: "Marketing",
            icon: "Calendar",
        },
        {
            id: "5",
            title: "Webhook Handler",
            description: "Process incoming webhook data",
            category: "Integration",
            icon: "Webhook",
        },
        {
            id: "6",
            title: "Form Processor",
            description: "Process and store form submissions",
            category: "Data",
            icon: "FileText",
        },
    ];

    return res.json({
        message: "Templates fetched successfully",
        templates,
    });
};

export const getPersonalData = async (req: any, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: "User not found" });
    }

    return res.json({
        message: "Personal data fetched successfully",
        user: {
            id: userId,
            email: req.user.email,
        },
    });
};
