import Link from "next/link";
import { Room, GAME_LABELS, GAME_EMOJI, LEVEL_LABELS } from "@/types";

const LEVEL_COLORS = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-blue-100 text-blue-800",
  advanced: "bg-red-100 text-red-800",
};

const GAME_COLORS = {
  pubg: "bg-yellow-100 text-yellow-800",
  lol: "bg-amber-100 text-amber-800",
  overwatch: "bg-orange-100 text-orange-800",
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
          <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wide ${GAME_COLORS[room.game]}`}>
            {GAME_EMOJI[room.game]} {GAME_LABELS[room.game]}
          </span>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className={`w-2 h-2 rounded-full ${isFull ? "bg-red-400" : "bg-green-400"}`} />
            {isFull ? "마감" : "모집 중"}
          </div>
        </div>

        <h3 className="text-sm font-bold text-gray-900 mb-1 line-clamp-2">{room.title}</h3>
        <p className="text-xs text-gray-400 mb-3">방장: {room.host?.nickname ?? "—"}</p>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">👥 {memberCount}/{room.max_players}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${LEVEL_COLORS[room.english_level]}`}>
              {LEVEL_LABELS[room.english_level]}
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
