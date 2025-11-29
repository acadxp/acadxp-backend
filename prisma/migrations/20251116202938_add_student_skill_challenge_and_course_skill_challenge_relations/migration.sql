/*
  Warnings:

  - You are about to drop the column `fieldOfStudy` on the `AcademicInfo` table. All the data in the column will be lost.
  - You are about to drop the `CourseEnrollment` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ProficiencyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT');

-- CreateEnum
CREATE TYPE "ChallengeDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'EXPERT');

-- CreateEnum
CREATE TYPE "ChallengeType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'ASSIGNMENT', 'QUIZ', 'PROJECT', 'ACHIEVEMENT');

-- CreateEnum
CREATE TYPE "ChallengeStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'ABANDONED');

-- DropForeignKey
ALTER TABLE "CourseEnrollment" DROP CONSTRAINT "CourseEnrollment_academicInfoId_fkey";

-- DropForeignKey
ALTER TABLE "CourseEnrollment" DROP CONSTRAINT "CourseEnrollment_courseId_fkey";

-- AlterTable
ALTER TABLE "AcademicInfo" DROP COLUMN "fieldOfStudy",
ADD COLUMN     "major" TEXT,
ADD COLUMN     "semester" TEXT;

-- DropTable
DROP TABLE "CourseEnrollment";

-- CreateTable
CREATE TABLE "StudentCourseEnrollment" (
    "id" TEXT NOT NULL,
    "academicInfoId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "completedStatus" BOOLEAN NOT NULL DEFAULT false,
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentCourseEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "xpValue" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseSkill" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "proficiencyLevel" "ProficiencyLevel" NOT NULL DEFAULT 'BEGINNER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentSkill" (
    "id" TEXT NOT NULL,
    "academicInfoId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "proficiencyLevel" "ProficiencyLevel" NOT NULL DEFAULT 'BEGINNER',
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "masteredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentSkill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Challenge" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "ChallengeType" NOT NULL,
    "difficulty" "ChallengeDifficulty" NOT NULL DEFAULT 'EASY',
    "xpReward" INTEGER NOT NULL,
    "criteria" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseChallenge" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentChallenge" (
    "id" TEXT NOT NULL,
    "academicInfoId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "status" "ChallengeStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "result" JSONB,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudentChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudentCourseEnrollment_id_key" ON "StudentCourseEnrollment"("id");

-- CreateIndex
CREATE UNIQUE INDEX "StudentCourseEnrollment_academicInfoId_courseId_key" ON "StudentCourseEnrollment"("academicInfoId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_id_key" ON "Skill"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_name_key" ON "Skill"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CourseSkill_id_key" ON "CourseSkill"("id");

-- CreateIndex
CREATE UNIQUE INDEX "CourseSkill_courseId_skillId_key" ON "CourseSkill"("courseId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentSkill_id_key" ON "StudentSkill"("id");

-- CreateIndex
CREATE INDEX "StudentSkill_academicInfoId_idx" ON "StudentSkill"("academicInfoId");

-- CreateIndex
CREATE INDEX "StudentSkill_skillId_idx" ON "StudentSkill"("skillId");

-- CreateIndex
CREATE INDEX "StudentSkill_proficiencyLevel_idx" ON "StudentSkill"("proficiencyLevel");

-- CreateIndex
CREATE UNIQUE INDEX "StudentSkill_academicInfoId_skillId_key" ON "StudentSkill"("academicInfoId", "skillId");

-- CreateIndex
CREATE UNIQUE INDEX "Challenge_id_key" ON "Challenge"("id");

-- CreateIndex
CREATE INDEX "Challenge_difficulty_idx" ON "Challenge"("difficulty");

-- CreateIndex
CREATE INDEX "Challenge_type_idx" ON "Challenge"("type");

-- CreateIndex
CREATE INDEX "Challenge_isActive_idx" ON "Challenge"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "CourseChallenge_id_key" ON "CourseChallenge"("id");

-- CreateIndex
CREATE INDEX "CourseChallenge_courseId_idx" ON "CourseChallenge"("courseId");

-- CreateIndex
CREATE INDEX "CourseChallenge_challengeId_idx" ON "CourseChallenge"("challengeId");

-- CreateIndex
CREATE UNIQUE INDEX "CourseChallenge_courseId_challengeId_key" ON "CourseChallenge"("courseId", "challengeId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentChallenge_id_key" ON "StudentChallenge"("id");

-- CreateIndex
CREATE INDEX "StudentChallenge_academicInfoId_idx" ON "StudentChallenge"("academicInfoId");

-- CreateIndex
CREATE INDEX "StudentChallenge_challengeId_idx" ON "StudentChallenge"("challengeId");

-- CreateIndex
CREATE INDEX "StudentChallenge_status_idx" ON "StudentChallenge"("status");

-- CreateIndex
CREATE UNIQUE INDEX "StudentChallenge_academicInfoId_challengeId_key" ON "StudentChallenge"("academicInfoId", "challengeId");

-- AddForeignKey
ALTER TABLE "StudentCourseEnrollment" ADD CONSTRAINT "StudentCourseEnrollment_academicInfoId_fkey" FOREIGN KEY ("academicInfoId") REFERENCES "AcademicInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentCourseEnrollment" ADD CONSTRAINT "StudentCourseEnrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseSkill" ADD CONSTRAINT "CourseSkill_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseSkill" ADD CONSTRAINT "CourseSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSkill" ADD CONSTRAINT "StudentSkill_academicInfoId_fkey" FOREIGN KEY ("academicInfoId") REFERENCES "AcademicInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentSkill" ADD CONSTRAINT "StudentSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "Skill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseChallenge" ADD CONSTRAINT "CourseChallenge_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseChallenge" ADD CONSTRAINT "CourseChallenge_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentChallenge" ADD CONSTRAINT "StudentChallenge_academicInfoId_fkey" FOREIGN KEY ("academicInfoId") REFERENCES "AcademicInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentChallenge" ADD CONSTRAINT "StudentChallenge_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
