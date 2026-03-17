-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "tag" VARCHAR(10);

-- CreateIndex
CREATE INDEX "Message_tag_isDeleted_expiresAt_idx" ON "Message"("tag", "isDeleted", "expiresAt");
