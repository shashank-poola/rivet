import { Router, type RequestHandler } from "express";
import { getAnalytics } from "../controller/analytics.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const analyticRouter = Router();

analyticRouter.get("/", authMiddleware, getAnalytics as unknown as RequestHandler);

export default analyticRouter;
