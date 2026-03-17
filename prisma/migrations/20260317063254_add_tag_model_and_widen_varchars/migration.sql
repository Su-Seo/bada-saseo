-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "tag" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "bottleColor" SET DATA TYPE VARCHAR(20),
ALTER COLUMN "paperStyle" SET DATA TYPE VARCHAR(20);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(20) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "Tag_isActive_sortOrder_idx" ON "Tag"("isActive", "sortOrder");
