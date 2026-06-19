import type { Response } from "express";
import prisma from "@rivet-n8n/prisma-db";
import { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user_id = req.user.id;

        const notifications = await prisma.notification.findMany({
            where: { user_id },
            orderBy: { created_at: "desc" },
            select: {
                id: true,
                title: true,
                message: true,
                read: true,
                created_at: true,
            },
        });

        res.status(200).json({
            success: true,
            message: "Notifications fetched!",
            notifications,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Error while fetching notifications",
            error: error.message,
        });
    }
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const notificationId = req.params.id;
        const user_id = req.user.id;

        const existing = await prisma.notification.findFirst({
            where: { id: notificationId, user_id },
        });

        if (!existing) {
            res.status(404).json({ success: false, message: "Notification not found" });
            return;
        }

        const updated = await prisma.notification.update({
            where: { id: notificationId },
            data: { read: true },
        });

        res.status(200).json({
            success: true,
            message: "Notification marked as read",
            notification: updated,
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Error while updating notification",
            error: error.message,
        });
    }
};

export const markAllAsRead = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const user_id = req.user.id;

        await prisma.notification.updateMany({
            where: { user_id, read: false },
            data: { read: true },
        });

        res.status(200).json({
            success: true,
            message: "All notifications marked as read",
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Error while updating notifications",
            error: error.message,
        });
    }
};

export const deleteNotification = async (req: AuthenticatedRequest, res: Response) => {
    try {
        const notificationId = req.params.id;
        const user_id = req.user.id;

        const existing = await prisma.notification.findFirst({
            where: { id: notificationId, user_id },
        });

        if (!existing) {
            res.status(404).json({ success: false, message: "Notification not found" });
            return;
        }

        await prisma.notification.delete({
            where: { id: notificationId },
        });

        res.status(200).json({
            success: true,
            message: "Notification deleted successfully",
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "Error while deleting notification",
            error: error.message,
        });
    }
};
