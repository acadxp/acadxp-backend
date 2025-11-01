/*
  Warnings:

  - The primary key for the `WaitlistUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[id]` on the table `WaitlistUser` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."WaitlistUser_email_key";

-- AlterTable
ALTER TABLE "WaitlistUser" DROP CONSTRAINT "WaitlistUser_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "WaitlistUser_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "WaitlistUser_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "WaitlistUser_id_key" ON "WaitlistUser"("id");
