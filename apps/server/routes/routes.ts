import { Router } from "express";
import type { Router as ExpressRouter } from "express";
import { signin, signup, logout } from "../controller/user.js";
import {
  deleteCredentials,
  getCredentials,
  postCredentials,
  updateCredentials,
} from "../controller/credentials.js";
import { requireAuth } from "../middleware/auth.js";

const router: ExpressRouter = Router();

router.post("/auth/signup", signup);
router.post("/auth/signin", signin);
router.post("/auth/logout", logout);

router.get("/personal", personal);
router.get("/overview", overview, requireAuth);

router.get("/workflows");
router.post("/workflows")
router.post("/workflows/{workflow:id}", workflows, requireAuth);
router.put("/workflows/{workflow:id       }")

router.get("/templates");

router.post("/credentials", requireAuth, postCredentials);
router.get("/credentials", requireAuth, getCredentials);
router.delete("/credentials/:credentialsId", requireAuth, deleteCredentials);
router.put("/credentials/:credentialsId", requireAuth, updateCredentials);

export default router;
