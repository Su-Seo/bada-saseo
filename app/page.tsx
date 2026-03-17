import Link from "next/link";
import OceanBackground from "@/components/animations/OceanBackground";

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center px-6 text-white overflow-hidden">
      <OceanBackground />

      <div className="relative z-10 flex flex-col items-center gap-8 text-center max-w-sm">
        {/* 타이틀 */}
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-4xl font-light tracking-[0.3em] text-white/90">
            바다사서
          </h1>
          <p className="text-sm text-white/50 tracking-wider">
            누구에게도 말 못한 마음,
            <br />
            바다에 흘려보내세요.
          </p>
        </div>

        {/* 유리병 아이콘 */}
        <div className="text-6xl animate-bounce" style={{ animationDuration: "3s" }}>
          🍾
        </div>

        {/* 메뉴 버튼 */}
        <div className="flex flex-col gap-4 w-full">
          <Link
            href="/throw"
            className="w-full py-4 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 text-white text-sm tracking-widest hover:bg-white/25 transition-all active:scale-95"
          >
            고민 던지기
          </Link>
          <Link
            href="/pick"
            className="w-full py-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-white/70 text-sm tracking-widest hover:bg-white/15 hover:text-white transition-all active:scale-95"
          >
            유리병 줍기
          </Link>
        </div>

        <p className="text-xs text-white/25 leading-relaxed">
          No Login · No Profile · No Judgment
        </p>
      </div>
    </main>
  );
}
