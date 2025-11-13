/*
  Warnings:

  - Added the required column `ownerId` to the `Shared_Files` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Shared_Files" ADD COLUMN     "ownerId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Shared_Files" ADD CONSTRAINT "Shared_Files_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
