-- AlterEnum
ALTER TYPE "public"."ExecutionStatus" ADD VALUE 'PENDING';

-- AlterEnum
ALTER TYPE "public"."Platform" ADD VALUE 'GROQ';

-- AlterTable
ALTER TABLE "public"."Execution" ALTER COLUMN "status" DROP DEFAULT;
