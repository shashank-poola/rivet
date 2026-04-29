import { Router } from "express";
import { createTrigger, getAllTriggers } from "../controller/trigger.controller.js";

const triggerRouter = Router();

triggerRouter.post("/", createTrigger);
triggerRouter.get("/", getAllTriggers);

export default triggerRouter;
