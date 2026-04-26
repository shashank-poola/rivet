import { Router } from "express";

const authRouter = Router();

authRouter.post("/signin");
authRouter.post("/signup");

export default authRouter;