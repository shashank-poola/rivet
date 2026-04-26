import { Router } from "express";
import authRouter from "./auth.route.js";
import analyticRouter from "./analytic.route.js";
import credentialsRouter from "./credentials.route.js";
import executionRouter from "./execution.route.js";
import triggerRouter from "./trigger.route.js";
import webhookRouter from "./webhook.route.js";
import workflowRouter from "./workflow.route.js";

const mainRouter = Router();

mainRouter.use("/auth", authRouter);
mainRouter.use("/analytic", analyticRouter);
mainRouter.use("/cred", credentialsRouter);
mainRouter.use("/execution", executionRouter);
mainRouter.use("/trigger", triggerRouter);
mainRouter.use()

export default mainRouter;