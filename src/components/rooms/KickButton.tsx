"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface KickButtonProps {
  roomId: string;
  targetUserId: string;
  targetNickname: string;
}

export default function KickButton({ roomId, targetUserId, targetNickname }: KickButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleKick() {
    if (!confirm(`${targetNickname}님을 방에서 내보내시겠습니까?`)) return;
    setLoading(true);
    const res = await fetch(`/api/rooms/${roomId}/kick`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target_user_id: targetUserId }),
    });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  return (
    <button
      onClick={handleKick}
      disabled={loading}
      title={`${targetNickname} 강퇴`}
      className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold text-red-500 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors disabled:opacity-50"
    >
      {loading ? "..." : "👢 강퇴"}
    </button>
  );
}
