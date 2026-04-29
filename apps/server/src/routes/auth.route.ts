import { Router, type RequestHandler } from "express";
import { signUpController, signInController, logout, getMe } from "../controller/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const authRouter = Router();

authRouter.post("/signup", signUpController);
authRouter.post("/signin", signInController);
authRouter.post("/logout", logout);
authRouter.get("/me", authMiddleware, getMe as unknown as RequestHandler);

export default authRouter;
