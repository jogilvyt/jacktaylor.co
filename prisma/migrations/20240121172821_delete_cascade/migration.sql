-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PostImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "contentType" TEXT NOT NULL,
    "blob" BLOB NOT NULL,
    "dataUri" TEXT,
    "postId" TEXT NOT NULL,
    CONSTRAINT "PostImage_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PostImage" ("blob", "contentType", "createdAt", "dataUri", "id", "postId", "updatedAt") SELECT "blob", "contentType", "createdAt", "dataUri", "id", "postId", "updatedAt" FROM "PostImage";
DROP TABLE "PostImage";
ALTER TABLE "new_PostImage" RENAME TO "PostImage";
CREATE UNIQUE INDEX "PostImage_postId_key" ON "PostImage"("postId");
CREATE TABLE "new_PostMeta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "postId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageAlt" TEXT NOT NULL,
    "imageCredit" TEXT NOT NULL,
    CONSTRAINT "PostMeta_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PostMeta" ("createdAt", "date", "description", "id", "imageAlt", "imageCredit", "imageUrl", "postId", "slug", "title", "updatedAt") SELECT "createdAt", "date", "description", "id", "imageAlt", "imageCredit", "imageUrl", "postId", "slug", "title", "updatedAt" FROM "PostMeta";
DROP TABLE "PostMeta";
ALTER TABLE "new_PostMeta" RENAME TO "PostMeta";
CREATE UNIQUE INDEX "PostMeta_postId_key" ON "PostMeta"("postId");
CREATE UNIQUE INDEX "PostMeta_slug_key" ON "PostMeta"("slug");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
