/*
  Warnings:

  - The values [EMAIL] on the enum `Platform` will be removed. If these variants are still used in the database, this will fail.
  - The `status` column on the `Execution` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `nodes` on the `Workflow` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Execution` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "public"."ExecutionStatus" AS ENUM ('RUNNING', 'PAUSED', 'COMPLETED', 'FAILED');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."Platform_new" AS ENUM ('TELEGRAM', 'RESEND_EMAIL', 'GEMINI');
ALTER TABLE "public"."Credentials" ALTER COLUMN "platform" TYPE "public"."Platform_new" USING ("platform"::text::"public"."Platform_new");
ALTER TYPE "public"."Platform" RENAME TO "Platform_old";
ALTER TYPE "public"."Platform_new" RENAME TO "Platform";
DROP TYPE "public"."Platform_old";
COMMIT;

-- AlterTable
ALTER TABLE "public"."Execution" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "pausedNodeId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "public"."ExecutionStatus" NOT NULL DEFAULT 'RUNNING';

-- AlterTable
ALTER TABLE "public"."Workflow" DROP COLUMN "nodes",
ADD COLUMN     "nodesJson" JSONB,
ALTER COLUMN "connections" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."Form" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "fields" JSONB NOT NULL,

    CONSTRAINT "Form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FormSubmission" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormSubmission_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Form" ADD CONSTRAINT "Form_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FormSubmission" ADD CONSTRAINT "FormSubmission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "public"."Form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
