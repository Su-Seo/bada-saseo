-- CreateTable
CREATE TABLE "WordList" (
    "id" TEXT NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "word" VARCHAR(100) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WordList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WordList_type_isActive_idx" ON "WordList"("type", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "WordList_type_word_key" ON "WordList"("type", "word");
