-- CreateEnum
CREATE TYPE "public"."Platform" AS ENUM ('EMAIL', 'TELEGRAM', 'GEMINI');

-- CreateEnum
CREATE TYPE "public"."TriggerType" AS ENUM ('MANUAL', 'WEBHOOK');

-- CreateTable of user login with juwt
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- creadentials of overall rivet
CREATE TABLE "public"."Credentials" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "platform" "public"."Platform" NOT NULL,
    "data" JSONB NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable of WorkFlow
CREATE TABLE "public"."Workflow" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "nodes" JSONB NOT NULL,
    "connections" JSONB NOT NULL,
    "webhookId" TEXT,
    "triggerType" "public"."TriggerType" NOT NULL,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable of individual Node
CREATE TABLE "public"."Node" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Node_pkey" PRIMARY KEY ("id")
);

-- CreateTable of Webhook like (EMAIL, TELEGRAM, GEMINI)
CREATE TABLE "public"."Webhook" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "secret" TEXT,

    CONSTRAINT "Webhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable of Execution of node to node connection which is execution
CREATE TABLE "public"."Execution" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT false,
    "tasksDone" INTEGER NOT NULL DEFAULT 0,
    "totalTasks" INTEGER,
    "result" JSONB,

    CONSTRAINT "Execution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Workflow_webhookId_key" ON "public"."Workflow"("webhookId");

-- AddForeignKey
ALTER TABLE "public"."Credentials" ADD CONSTRAINT "Credentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Workflow" ADD CONSTRAINT "Workflow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Workflow" ADD CONSTRAINT "Workflow_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "public"."Webhook"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Node" ADD CONSTRAINT "Node_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Execution" ADD CONSTRAINT "Execution_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
