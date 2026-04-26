import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";

type User = {
    id : string,
    email : string
}

export interface AuthenticatedRequest extends Request {
    user: User;
}

export const authMiddleware = (req: AuthenticatedRequest, res : Response, next : NextFunction) => {
    try {
        const token = req.cookies.auth_token;

        if(!token){
            res.status(403).json({
                success : false,
                message : "Cookie not Found",
            })
            return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

        if(!decoded){
            res.json({
                success : false,
                message : "Failed to decode token"
            })
            return;
        }

        const user = {
            id : decoded.id,
            email : decoded.email
        }

        req.user = user;

        next();

    } catch (error : any) {
        res.status(500).json({
            success : false,
            message : "Failed authentication middleware",
            error : error?.message
        })
        return;
    }
};