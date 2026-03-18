import { getMessageStats, getTagStats, getWordFrequency } from "@/lib/message";
import StatsPage from "@/components/stats/StatsPage";

export const revalidate = 300;

export const metadata = {
  title: "바다사서 — 통계",
  description: "바다사서의 편지 통계를 확인해보세요.",
};

export default async function StatsRoute() {
  const [stats, tagStats, wordFrequency] = await Promise.all([
    getMessageStats(),
    getTagStats(),
    getWordFrequency(60),
  ]);

  return <StatsPage stats={stats} tagStats={tagStats} wordFrequency={wordFrequency} />;
}
