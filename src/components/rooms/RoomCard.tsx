"use client";

import Link from "next/link";
import { Room, GAME_LABELS, LEVEL_LABELS, LEVEL_EMOJI } from "@/types";
import GameIcon from "@/components/GameIcon";
import ShareButton from "@/components/ShareButton";

const LEVEL_COLORS: Record<string, string> = {
  beginner: "bg-green-50 text-green-700 border border-green-200",
  intermediate: "bg-blue-50 text-blue-700 border border-blue-200",
  advanced: "bg-red-50 text-red-700 border border-red-200",
  iron: "bg-slate-50 text-slate-600 border border-slate-200",
  bronze: "bg-amber-50 text-amber-700 border border-amber-200",
  silver: "bg-zinc-50 text-zinc-600 border border-zinc-200",
  gold: "bg-yellow-50 text-yellow-700 border border-yellow-200 font-bold",
  platinum: "bg-teal-50 text-teal-700 border border-teal-200 font-bold",
  diamond: "bg-sky-50 text-sky-700 border border-sky-200 font-extrabold",
  master: "bg-purple-50 text-purple-700 border border-purple-200 font-extrabold",
  grandmaster: "bg-red-50 text-red-700 border border-red-200 font-extrabold animate-pulse",
  challenger: "bg-blue-50 text-blue-700 border border-blue-200 font-black animate-pulse"
};

const GAME_COLORS = {
  pubg:      "bg-yellow-100 text-yellow-800",
  lol:       "bg-blue-100 text-blue-800",
  overwatch: "bg-orange-100 text-orange-800",
  valorant:  "bg-red-100 text-red-800",
  tft:       "bg-purple-100 text-purple-800",
};

interface RoomCardProps {
  room: Room;
}

export default function RoomCard({ room }: RoomCardProps) {
  const isFull = room.status === "full";
  const memberCount = room.member_count ?? 0;

  return (
    <Link href={`/rooms/${room.id}`}>
      <div className={`bg-white border rounded-xl p-4 hover:border-accent hover:shadow-md transition-all duration-150 cursor-pointer ${isFull ? "opacity-60" : ""}`}>
        <div className="flex items-start justify-between mb-3">
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide ${GAME_COLORS[room.game]}`}>
            <GameIcon game={room.game} className="w-4 h-4" />
            {GAME_LABELS[room.game]}
          </span>
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className={`w-2 h-2 rounded-full ${isFull ? "bg-red-400" : "bg-green-400"}`} />
              {isFull ? "마감" : "모집 중"}
            </div>
            <ShareButton url={`/rooms/${room.id}`} title={room.title} variant="icon" />
          </div>
        </div>

        <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2">{room.title}</h3>
        <p className="text-xs text-gray-400 mb-3">방장: {room.host?.nickname ?? "—"}</p>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">👥 {memberCount}/{room.max_players}</span>
            <span className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded border ${
              LEVEL_COLORS[room.english_level] ?? "bg-gray-100 text-gray-600"
            }`}>
              <span>{LEVEL_EMOJI[room.english_level] ?? "🌱"}</span>
              <span>{LEVEL_LABELS[room.english_level] ?? room.english_level}</span>
            </span>
          </div>
          <span className={`text-xs font-bold px-3 py-1 rounded-lg ${isFull ? "text-gray-400 bg-gray-100" : "text-accent bg-accent-light"}`}>
            {isFull ? "마감" : "참여하기"}
          </span>
        </div>
      </div>
    </Link>
  );
}
