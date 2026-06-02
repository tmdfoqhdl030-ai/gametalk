"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface RoomNotificationProps {
  roomId: string;
  initialMemberIds: string[];
  currentUserId?: string;
}

interface JoinNotif {
  id: string;
  nickname: string;
  type: "join" | "leave";
}

type WebkitAudio = typeof AudioContext;
function getAudioCtx() {
  const AudioCtx: WebkitAudio =
    window.AudioContext ||
    ((window as unknown as Record<string, unknown>).webkitAudioContext as WebkitAudio);
  return new AudioCtx();
}

/** 입장: C5→E5→G5 밝은 화음 띠링~ */
function playJoinSound() {
  try {
    const ctx = getAudioCtx();
    // C5 → E5 → G5 순차 재생 — 밝고 명쾌한 "띠링~"
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      const t = ctx.currentTime + i * 0.1;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.start(t);
      osc.stop(t + 0.5);
    });
  } catch {
    // 오디오 미지원 환경 무시
  }
}

/** 퇴장: G5→E5→C5 내려가는 짧은 소리 */
function playLeaveSound() {
  try {
    const ctx = getAudioCtx();
    const notes = [783.99, 659.25, 523.25];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      const t = ctx.currentTime + i * 0.08;
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.1, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  } catch {
    // 오디오 미지원 환경 무시
  }
}

export default function RoomNotification({
  roomId,
  initialMemberIds,
  currentUserId,
}: RoomNotificationProps) {
  const [notifs, setNotifs] = useState<JoinNotif[]>([]);
  const knownIds = useRef(new Set(initialMemberIds));
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`room:${roomId}:notif`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "room_members",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const uid = payload.new.user_id as string;
          // 이미 알고 있던 멤버 or 본인 입장은 무시
          if (knownIds.current.has(uid)) return;
          if (uid === currentUserId) return;
          knownIds.current.add(uid);

          const { data: user } = await supabase
            .from("users")
            .select("nickname")
            .eq("id", uid)
            .single();

          if (!user) return;

          const nid = `${uid}-${Date.now()}`;
          playJoinSound();
          setNotifs((prev) => [...prev, { id: nid, nickname: user.nickname, type: "join" }]);

          setTimeout(() => {
            setNotifs((prev) => prev.filter((n) => n.id !== nid));
          }, 3300);
        }
      )
      // 퇴장 시 knownIds에서 제거 + 퇴장 알림
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "room_members",
          filter: `room_id=eq.${roomId}`,
        },
        async (payload) => {
          const uid = payload.old.user_id as string;
          knownIds.current.delete(uid);

          // 본인 퇴장은 알림 없음
          if (uid === currentUserId) return;

          const { data: user } = await supabase
            .from("users")
            .select("nickname")
            .eq("id", uid)
            .single();

          if (!user) return;

          const nid = `leave-${uid}-${Date.now()}`;
          playLeaveSound();
          setNotifs((prev) => [...prev, { id: nid, nickname: user.nickname, type: "leave" }]);

          setTimeout(() => {
            setNotifs((prev) => prev.filter((n) => n.id !== nid));
          }, 3300);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, currentUserId, supabase]);

  if (notifs.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {notifs.map((n) => (
        <div
          key={n.id}
          className="animate-slide-up animate-fade-out flex items-center gap-3 bg-gray-900/95 backdrop-blur text-white px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold"
        >
          <span className="text-xl">{n.type === "join" ? "🎮" : "👋"}</span>
          <span>
            <span className={n.type === "join" ? "text-accent font-black" : "text-gray-300 font-black"}>
              {n.nickname}
            </span>
            <span className="text-gray-200">
              {n.type === "join" ? "님이 입장했습니다!" : "님이 퇴장했습니다."}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}
