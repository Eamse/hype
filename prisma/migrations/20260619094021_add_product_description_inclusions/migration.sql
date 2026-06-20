/*
  Warnings:

  - You are about to drop the column `inclusions` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "inclusions",
ADD COLUMN     "inclusions" TEXT[];
