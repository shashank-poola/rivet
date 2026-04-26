import { Router } from "express";

const workflowRouter = Router();

workflowRouter.post("/create");
workflowRouter.get("/");
workflowRouter.get("/:id");
workflowRouter.put("/:id");
workflowRouter.delete("/:id");

export default workflowRouter;