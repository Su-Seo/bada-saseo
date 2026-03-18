-- DropIndex
DROP INDEX "Message_tag_isDeleted_expiresAt_idx";

-- AlterTable: tagId 컬럼 추가 (기존 tag은 아직 유지)
ALTER TABLE "Message" ADD COLUMN "tagId" TEXT;

-- 기존 tag 이름 → tagId로 데이터 이전
UPDATE "Message" m
SET "tagId" = t."id"
FROM "Tag" t
WHERE m."tag" = t."name";

-- 이전 완료 후 tag 컬럼 삭제
ALTER TABLE "Message" DROP COLUMN "tag";

-- CreateIndex
CREATE INDEX "Message_tagId_isDeleted_expiresAt_idx" ON "Message"("tagId", "isDeleted", "expiresAt");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE SET NULL ON UPDATE CASCADE;
