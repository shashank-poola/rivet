import { Request, Response } from "express";
import { PrismaClient } from "../../prisma/generated/prisma";
import { CredentialsSchema, CredentialsUpdateSchema } from "../../../packages/utils";

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
    body: any;
    params: any;
}

export const postCredentials = async (req: AuthRequest, res: Response) => {
    const response = CredentialsSchema.safeParse(req.body);
    if (!response.success) {
        return res.status(400)
        .json({ message: "authentication failed, enter the valid credentials"});

    }
    if (!req.user?.id) {
        return res.status(401).json({ message: "User not found"})
    }
    const data = response.data;
    const newCredentials = await Prisma.credentials.create({
        data: {
            title: data.title,
            platform: data.platform,
            data: data.data,
            userId: req.user.id,
        }
    });
    return res.json({
        message: "Credentials created successfully",
        newCredentials,
    })
};

export const getCredentials = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401)
        .json({ message: "User not found"})
    }
    const credentials = await prisma.credentials.findMany({
        where: { userId },
    });
    return res.json({ message: "All Credentials fetched successfully", credentials})
    export const deleteCredentials = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "User not found" });
    }
    
    const { credentialsId } = req.params;
    const deleteCredentials = await prisma.credentials.delete({
        where: { 
            userId, 
            id: credentialsId,
        }
    });

    return res.json({
        message: "Credentials deleted successfully",
        deleteCredentials,
    });
};

export const updateCredentials = async (req: AuthRequest, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "User not found" });
    }
    
    const { credentialsId } = req.params;
    const response = CredentialsUpdateSchema.safeParse(req.body);
    if (!response.success) {
        return res.status(400).json({ 
            message: "Invalid credentials data", 
            errors: response.error.errors 
        });
    }
    
    const updatedCreds = response.data;
    const updatedCredentials = await prisma.credentials.update({
        where: { 
            userId, 
            id: credentialsId,
        },
        data: {
            ...(updatedCreds.title && { title: updatedCreds.title }),
            ...(updatedCreds.platform && { platform: updatedCreds.platform }),
            ...(updatedCreds.data && { data: updatedCreds.data }),
        }
    });
    
    return res.json({
        message: "Credentials updated successfully",
        updatedCredentials,
    });
};