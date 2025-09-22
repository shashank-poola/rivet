import { Router } from "express";
import { signin, signup } from "../controller/user.js";
import { deleteCredentials, getCredentials, postCredentials, updateCredentials } from "../controller/credentials.js";
import { requireAuth } from "../middleware/auth.js";

const {router: Router} = Router();

router.post("/auth/signup", signup);
router.post("/auth/signin", signin);

// Placeholder auth middleware reading req.user from cookie/JWT would go here
// For now, routes assume upstream middleware attaches req.user
router.post("/credentials", requireAuth, postCredentials);
router.get("/credentials", requireAuth, getCredentials);
router.delete("/credentials/:credentialsId", requireAuth, deleteCredentials);
router.put("/credentials/:credentialsId", requireAuth, updateCredentials);

export default router;

