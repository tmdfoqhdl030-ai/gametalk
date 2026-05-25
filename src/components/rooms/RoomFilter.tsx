"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Game, EnglishLevel, GAME_LABELS, GAME_EMOJI, LEVEL_LABELS } from "@/types";

const GAMES: { value: Game | "all"; label: string; emoji?: string }[] = [
  { value: "all", label: "전체 게임" },
  { value: "pubg", label: GAME_LABELS.pubg, emoji: GAME_EMOJI.pubg },
  { value: "lol", label: GAME_LABELS.lol, emoji: GAME_EMOJI.lol },
  { value: "overwatch", label: GAME_LABELS.overwatch, emoji: GAME_EMOJI.overwatch },
];

const LEVELS: { value: EnglishLevel | "all"; label: string }[] = [
  { value: "all", label: "전체 레벨" },
  { value: "beginner", label: LEVEL_LABELS.beginner },
  { value: "intermediate", label: LEVEL_LABELS.intermediate },
  { value: "advanced", label: LEVEL_LABELS.advanced },
];

export default function RoomFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentGame = searchParams.get("game") ?? "all";
  const currentLevel = searchParams.get("level") ?? "all";

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete(key);
    else params.set(key, value);
    router.push(`/?${params.toString()}`);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs font-bold text-gray-400 mr-1">게임</span>
        {GAMES.map((g) => (
          <button
            key={g.value}
            onClick={() => updateFilter("game", g.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              currentGame === g.value
                ? "bg-accent border-accent text-white font-bold"
                : "bg-gray-50 border-gray-200 text-gray-500 hover:border-accent hover:text-accent"
            }`}
          >
            {g.emoji && <span className="mr-1">{g.emoji}</span>}{g.label}
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-gray-200 hidden sm:block" />

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-xs font-bold text-gray-400 mr-1">영어 레벨</span>
        {LEVELS.map((l) => (
          <button
            key={l.value}
            onClick={() => updateFilter("level", l.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              currentLevel === l.value
                ? "bg-accent border-accent text-white font-bold"
                : "bg-gray-50 border-gray-200 text-gray-500 hover:border-accent hover:text-accent"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}
