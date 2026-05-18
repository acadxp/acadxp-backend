/*
  Warnings:

  - You are about to drop the column `proimptVersion` on the `AICourseBluePrint` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED', 'DRAFT');

-- AlterTable
ALTER TABLE "AICourseBluePrint" DROP COLUMN "proimptVersion",
ADD COLUMN     "promptVersion" TEXT;

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT';
