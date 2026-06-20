/*
  Warnings:

  - You are about to drop the column `description` on the `ProductImage` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "description" TEXT,
ADD COLUMN     "inclusions" TEXT[];

-- AlterTable
ALTER TABLE "ProductImage" DROP COLUMN "description";
