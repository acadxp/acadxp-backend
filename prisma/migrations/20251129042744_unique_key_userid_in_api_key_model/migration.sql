/*
  Warnings:

  - A unique constraint covering the columns `[key,userId]` on the table `ApiKey` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "AcademicInfo_id_key";

-- DropIndex
DROP INDEX "Profile_userId_idx";

-- DropIndex
DROP INDEX "User_username_idx";

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_key_userId_key" ON "ApiKey"("key", "userId");
