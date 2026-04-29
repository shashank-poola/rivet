import { Router, type RequestHandler } from "express";
import { execute, getExecutions } from "../controller/execution.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const executionRouter = Router();

executionRouter.post("/", authMiddleware, execute as unknown as RequestHandler);
executionRouter.get("/", authMiddleware, getExecutions as unknown as RequestHandler);

export default executionRouter;
