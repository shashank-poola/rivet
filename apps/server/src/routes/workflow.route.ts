import { Router, type RequestHandler } from "express";
import {
    createWorkflow,
    getWorkflow,
    getAllWorkflow,
    updateWorkflow,
    deleteWorkflow,
} from "../controller/workflow.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const workflowRouter = Router();

workflowRouter.post("/create", authMiddleware, createWorkflow as unknown as RequestHandler);
workflowRouter.get("/", authMiddleware, getAllWorkflow as unknown as RequestHandler);
workflowRouter.get("/:id", authMiddleware, getWorkflow as unknown as RequestHandler);
workflowRouter.put("/:id", authMiddleware, updateWorkflow as unknown as RequestHandler);
workflowRouter.delete("/:id", authMiddleware, deleteWorkflow as unknown as RequestHandler);

export default workflowRouter;
