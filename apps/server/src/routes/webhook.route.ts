import { Router } from "express";

const webhookRouter = Router();

webhookRouter.get("/:workflowId");

export default webhookRouter;