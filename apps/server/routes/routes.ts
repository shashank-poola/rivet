import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { signin, signup, logout } from "../controller/user.controller.js";
import {
  deleteCredentials,
  getCredentials,
  postCredentials,
  updateCredentials,
} from "./credentials.js";
import { requireAuth } from "../middleware/auth.js";
import {
  getWorkflows,
  createWorkflow,
  updateWorkflow,
  getWorkflowById,
  deleteWorkflow,
} from "../controller/workflows.js";
import { getTemplates, getPersonalData } from "../controller/templates.controller.js";

const router: ExpressRouter = Router();

router.post("/auth/signup", signup);
router.post("/auth/signin", signin);

router.get("/personal", requireAuth, getPersonalData);

router.get("/workflows", requireAuth, getWorkflows);
router.post("/workflows", requireAuth, createWorkflow);
router.get("/workflows/:workflowId", requireAuth, getWorkflowById);
router.put("/workflow-editor/:workflowId", requireAuth, updateWorkflow);
router.delete("/workflows/:workflowId", requireAuth, deleteWorkflow);

router.get("/templates", getTemplates);

router.post("/credentials", requireAuth, postCredentials);
router.get("/credentials", requireAuth, getCredentials);
router.delete("/credentials/:credentialsId", requireAuth, deleteCredentials);
router.put("/credentials/:credentialsId", requireAuth, updateCredentials);

export default router;
