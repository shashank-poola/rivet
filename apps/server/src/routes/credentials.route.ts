import { Router, type RequestHandler } from "express";
import {
    createCredential,
    getAllCredentials,
    updateCredential,
    deleteCredential,
} from "../controller/credentials.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const credentialsRouter = Router();

credentialsRouter.post("/create", authMiddleware, createCredential as unknown as RequestHandler);
credentialsRouter.get("/", authMiddleware, getAllCredentials as unknown as RequestHandler);
credentialsRouter.put("/:id", authMiddleware, updateCredential as unknown as RequestHandler);
credentialsRouter.delete("/:id", authMiddleware, deleteCredential as unknown as RequestHandler);

export default credentialsRouter;
