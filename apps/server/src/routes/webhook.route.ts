import { Router } from "express";
import { webhookTrigger } from "../controller/webhook.controller.js";

const webhookRouter = Router();

webhookRouter.get("/:workflowId", webhookTrigger);
webhookRouter.post("/:workflowId", webhookTrigger);

export default webhookRouter;
