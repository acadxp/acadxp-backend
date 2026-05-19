/*
  Warnings:

  - You are about to drop the `ApiKey` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ApiKey" DROP CONSTRAINT "ApiKey_userId_fkey";

-- AlterTable
ALTER TABLE "account" ADD COLUMN     "deviceName" TEXT,
ADD COLUMN     "deviceType" TEXT,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "lastActiveAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "profile" ADD COLUMN     "preferences" JSONB DEFAULT '{"theme":"system","accentColor":"#4f46e5"}';

-- DropTable
DROP TABLE "ApiKey";

-- CreateTable
CREATE TABLE "notification_preference" (
    "id" TEXT NOT NULL,
    "academicInfoId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "notification_preference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_key" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT,
    "userId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "api_key_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notification_preference_academicInfoId_type_key" ON "notification_preference"("academicInfoId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "api_key_id_key" ON "api_key"("id");

-- CreateIndex
CREATE UNIQUE INDEX "api_key_key_key" ON "api_key"("key");

-- CreateIndex
CREATE UNIQUE INDEX "api_key_key_userId_key" ON "api_key"("key", "userId");

-- AddForeignKey
ALTER TABLE "notification_preference" ADD CONSTRAINT "notification_preference_academicInfoId_fkey" FOREIGN KEY ("academicInfoId") REFERENCES "AcademicInfo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_key" ADD CONSTRAINT "api_key_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
