-- DropIndex
DROP INDEX "Magazine_published_idx";

-- DropIndex
DROP INDEX "Product_section_idx";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "birthYear" SET DATA TYPE TEXT,
ALTER COLUMN "birthMonth" SET DATA TYPE TEXT,
ALTER COLUMN "birthDay" SET DATA TYPE TEXT;
