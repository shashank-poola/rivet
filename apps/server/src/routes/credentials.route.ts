import { Router } from "express";

const credentialsRouter = Router();

credentialsRouter.post("/create");
credentialsRouter.get("/");
credentialsRouter.put("/:id");
credentialsRouter.delete("/:id")

export default credentialsRouter;