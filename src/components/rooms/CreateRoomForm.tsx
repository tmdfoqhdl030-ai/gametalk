"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import GameIcon from "@/components/GameIcon";
import { Game, EnglishLevel, GAME_LABELS, LEVEL_LABELS } from "@/types";

const GAMES: Game[] = ["pubg", "lol", "overwatch", "valorant", "tft"];
const LEVELS: EnglishLevel[] = ["beginner", "intermediate", "advanced"];

export default function CreateRoomForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    game: "pubg" as Game,
    max_players: 4,
    english_level: "beginner" as EnglishLevel,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "방 생성에 실패했습니다.");
      return;
    }

    router.push(`/rooms/${data.room.id}?created=true`);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">방 제목 *</label>
        <input
          type="text"
          required
          maxLength={60}
          placeholder="예: [배그] 영어 초보 환영 스쿼드 구해요"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2">게임 *</label>
        <div className="grid grid-cols-3 gap-2">
          {GAMES.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setForm({ ...form, game: g })}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium border transition-all ${
                form.game === g
                  ? "bg-accent text-white border-accent font-bold"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:border-accent hover:text-accent"
              }`}
            >
              <GameIcon game={g} className="w-5 h-5" />
              {GAME_LABELS[g]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">최대 인원 *</label>
          <select
            value={form.max_players}
            onChange={(e) => setForm({ ...form, max_players: Number(e.target.value) })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent transition-colors bg-white"
          >
            {[2, 3, 4, 5, 6].map((n) => (
              <option key={n} value={n}>{n}명</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">영어 레벨 *</label>
          <select
            value={form.english_level}
            onChange={(e) => setForm({ ...form, english_level: e.target.value as EnglishLevel })}
            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent transition-colors bg-white"
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>{LEVEL_LABELS[l]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-2.5 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-600">
        <span>🎙️</span>
        <span>방을 만들면 디스코드 음성 채널이 자동으로 생성됩니다</span>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" loading={loading} className="w-full justify-center py-3">
        방 만들기
      </Button>
    </form>
  );
}
