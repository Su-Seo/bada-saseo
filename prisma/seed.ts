import { PrismaClient } from "../app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

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
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
