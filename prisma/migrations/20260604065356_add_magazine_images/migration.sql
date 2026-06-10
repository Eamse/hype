/*
  Warnings:

  - You are about to drop the column `detailImageUrl` on the `Magazine` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "MagazineImage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "magazineId" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "MagazineImage_magazineId_fkey" FOREIGN KEY ("magazineId") REFERENCES "Magazine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Magazine" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Magazine" ("content", "createdAt", "id", "imageUrl", "published", "title", "updatedAt") SELECT "content", "createdAt", "id", "imageUrl", "published", "title", "updatedAt" FROM "Magazine";
DROP TABLE "Magazine";
ALTER TABLE "new_Magazine" RENAME TO "Magazine";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
