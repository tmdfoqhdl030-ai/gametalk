"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

interface RoomActionsProps {
  roomId: string;
  isMember: boolean;
  isHost: boolean;
  isFull: boolean;
  isLoggedIn: boolean;
  currentDiscordInvite: string;
}

export default function RoomActions({ roomId, isMember, isHost, isFull, isLoggedIn, currentDiscordInvite }: RoomActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [discordUrl, setDiscordUrl] = useState(currentDiscordInvite);
  const [editingDiscord, setEditingDiscord] = useState(false);

  async function joinRoom() {
    setLoading(true);
    const res = await fetch(`/api/rooms/${roomId}/members`, { method: "POST" });
    setLoading(false);
    if (res.ok) router.refresh();
  }

  async function leaveRoom() {
    if (!confirm("방에서 나가시겠습니까?")) return;
    setLoading(true);
    const res = await fetch(`/api/rooms/${roomId}/members`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) router.push("/");
  }

  async function closeRoom() {
    if (!confirm("방을 닫으시겠습니까?")) return;
    setLoading(true);
    const res = await fetch(`/api/rooms/${roomId}`, { method: "DELETE" });
    setLoading(false);
    if (res.ok) router.push("/");
  }

  async function updateDiscord() {
    setLoading(true);
    const res = await fetch(`/api/rooms/${roomId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ discord_invite: discordUrl }),
    });
    setLoading(false);
    if (res.ok) { setEditingDiscord(false); router.refresh(); }
  }

  if (!isLoggedIn) {
    return (
      <a href="/auth/login" className="block w-full text-center py-2.5 bg-accent text-white text-sm font-bold rounded-lg hover:bg-accent-hover transition-colors">
        로그인 후 참여하기
      </a>
    );
  }

  return (
    <div className="space-y-2">
      {!isMember && (
        <Button
          className="w-full justify-center py-2.5"
          loading={loading}
          disabled={isFull}
          onClick={joinRoom}
        >
          {isFull ? "인원 마감" : "방 참여하기"}
        </Button>
      )}

      {isMember && (
        <>
          {isHost && (
            <>
              {editingDiscord ? (
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={discordUrl}
                    onChange={(e) => setDiscordUrl(e.target.value)}
                    placeholder="https://discord.gg/..."
                    className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-accent"
                  />
                  <Button size="sm" loading={loading} onClick={updateDiscord}>저장</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingDiscord(false)}>취소</Button>
                </div>
              ) : (
                <Button variant="ghost" className="w-full justify-center" onClick={() => setEditingDiscord(true)}>
                  디스코드 링크 {currentDiscordInvite ? "수정" : "추가"}
                </Button>
              )}
              <Button variant="danger" className="w-full justify-center" loading={loading} onClick={closeRoom}>
                방 닫기
              </Button>
            </>
          )}
          <Button variant="ghost" className="w-full justify-center" loading={loading} onClick={leaveRoom}>
            방 나가기
          </Button>
        </>
      )}
    </div>
  );
}
