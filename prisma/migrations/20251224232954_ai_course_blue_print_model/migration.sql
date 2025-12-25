-- CreateEnum
CREATE TYPE "AIBlueprintStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'PARTIALLY_ACCEPTED');

-- CreateEnum
CREATE TYPE "XPSourceType" AS ENUM ('COURSE', 'CHALLENGE', 'SKILL', 'BADGE', 'MANUAL');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('STREAK', 'DEADLINE', 'GOAL', 'LEVEL_UP', 'BADGE');

-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('XP', 'SKILL', 'CHALLENGE', 'COURSE', 'STREAK');

-- CreateTable
CREATE TABLE "XPEvent" (
    "id" TEXT NOT NULL,
    "academicInfoId" TEXT NOT NULL,
    "sourceType" "XPSourceType" NOT NULL,
    "sourceId" TEXT,
    "xp" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "XPEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AICourseBluePrint" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "status" "AIBlueprintStatus" NOT NULL DEFAULT 'PENDING',
    "generatedChallenges" JSONB NOT NULL,
    "generatedSkills" JSONB NOT NULL,
    "generatedBadges" JSONB,
    "aiModel" TEXT NOT NULL,
    "aiVersion" TEXT,
    "proimptVersion" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AICourseBluePrint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "xpReward" INTEGER NOT NULL DEFAULT 0,
    "criteria" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentBadge" (
    "id" TEXT NOT NULL,
    "academicInfoId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentBadge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "academicInfoId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "academicInfoId" TEXT NOT NULL,
    "type" "GoalType" NOT NULL,
    "target" JSONB NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "XPEvent_academicInfoId_idx" ON "XPEvent"("academicInfoId");

-- CreateIndex
CREATE INDEX "XPEvent_sourceType_idx" ON "XPEvent"("sourceType");

-- CreateIndex
CREATE UNIQUE INDEX "AICourseBluePrint_id_key" ON "AICourseBluePrint"("id");

-- CreateIndex
CREATE UNIQUE INDEX "AICourseBluePrint_courseId_key" ON "AICourseBluePrint"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "StudentBadge_academicInfoId_badgeId_key" ON "StudentBadge"("academicInfoId", "badgeId");

-- CreateIndex
CREATE INDEX "Notification_academicInfoId_isRead_idx" ON "Notification"("academicInfoId", "isRead");

-- AddForeignKey
ALTER TABLE "XPEvent" ADD CONSTRAINT "XPEvent_academicInfoId_fkey" FOREIGN KEY ("academicInfoId") REFERENCES "AcademicInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AICourseBluePrint" ADD CONSTRAINT "AICourseBluePrint_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentBadge" ADD CONSTRAINT "StudentBadge_academicInfoId_fkey" FOREIGN KEY ("academicInfoId") REFERENCES "AcademicInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentBadge" ADD CONSTRAINT "StudentBadge_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_academicInfoId_fkey" FOREIGN KEY ("academicInfoId") REFERENCES "AcademicInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_academicInfoId_fkey" FOREIGN KEY ("academicInfoId") REFERENCES "AcademicInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
