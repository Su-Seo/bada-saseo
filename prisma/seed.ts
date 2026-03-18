import { PrismaClient } from "../app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

const INITIAL_STOPWORDS = [
  // 지시어
  "이것", "저것", "그것", "이거", "저거", "그거",
  "이게", "그게", "저게", "이건", "그건", "저건",
  "이런", "저런", "그런", "이렇게", "저렇게", "그렇게",
  // 접속사
  "그리고", "그래서", "하지만", "그런데", "근데", "그러면",
  "따라서", "그래도", "왜냐면", "그러나", "또한", "또는",
  "그렇지만", "그러므로",
  // 부사
  "정말로", "진짜로",
];

const INITIAL_BAD_WORDS = [
  "씨발", "씨팔", "시발", "ㅅㅂ",
  "개새끼", "개색끼", "ㄱㅅㄲ",
  "병신", "ㅂㅅ",
  "지랄", "ㅈㄹ",
  "미친놈", "미친년", "미친새끼",
  "존나", "ㅈㄴ",
  "좆", "보지", "자지",
  "창녀", "걸레",
  "nigger", "nigga",
];

const INITIAL_TAGS = [
  { name: "연애",   sortOrder: 0 },
  { name: "진로",   sortOrder: 1 },
  { name: "가족",   sortOrder: 2 },
  { name: "친구",   sortOrder: 3 },
  { name: "건강",   sortOrder: 4 },
  { name: "일상",   sortOrder: 5 },
  { name: "기타",   sortOrder: 6 },
];

async function main() {
  console.log("Seeding tags...");
  for (const tag of INITIAL_TAGS) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      update: { sortOrder: tag.sortOrder },
      create: tag,
    });
  }
  console.log(`Seeded ${INITIAL_TAGS.length} tags.`);

  console.log("Seeding word lists...");
  for (const word of INITIAL_STOPWORDS) {
    await prisma.wordList.upsert({
      where: { type_word: { type: "stopword", word } },
      update: {},
      create: { type: "stopword", word },
    });
  }
  for (const word of INITIAL_BAD_WORDS) {
    await prisma.wordList.upsert({
      where: { type_word: { type: "badword", word } },
      update: {},
      create: { type: "badword", word },
    });
  }
  console.log(`Seeded ${INITIAL_STOPWORDS.length} stopwords, ${INITIAL_BAD_WORDS.length} bad words.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
