"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import AnimalAvatar from "@/components/AnimalAvatar";
import { LEVEL_LABELS } from "@/types";
import KickButton from "./KickButton";
import ReportButton from "./ReportButton";

interface Member {
  user_id: string;
  user: {
    id: string;
    nickname: string;
    english_level: string;
    avatar_animal?: string | null;
  };
}

interface MemberListProps {
  roomId: string;
  hostId: string;
  initialMembers: Member[];
  currentUserId?: string;
  isHost: boolean;
}

export default function MemberList({
  roomId,
  hostId,
  initialMembers,
  currentUserId,
  isHost,
}: MemberListProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`room:${roomId}:members-list`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "room_members", filter: `room_id=eq.${roomId}` },
        async (payload) => {
          const uid = payload.new.user_id as string;
          // 이미 목록에 있으면 무시
          setMembers((prev) => {
            if (prev.some((m) => m.user_id === uid)) return prev;
            return prev; // 일단 유지, 아래에서 user 정보 가져온 후 추가
          });

          const { data: user } = await supabase
            .from("users")
            .select("id, nickname, english_level, avatar_animal")
            .eq("id", uid)
            .single();

          if (!user) return;

          setMembers((prev) => {
            if (prev.some((m) => m.user_id === uid)) return prev;
            return [...prev, { user_id: uid, user }];
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "room_members", filter: `room_id=eq.${roomId}` },
        (payload) => {
          const uid = payload.old.user_id as string;
          setMembers((prev) => prev.filter((m) => m.user_id !== uid));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, supabase]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <p className="text-xs font-bold text-gray-400 uppercase mb-3">
        참여자 ({members.length}명)
      </p>
      <ul className="space-y-2">
        {members.map((m) => (
          <li
            key={m.user_id}
            className="flex items-center justify-between gap-2 p-1 rounded-lg hover:bg-gray-50/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <AnimalAvatar animalId={m.user.avatar_animal} size="xs" />
              <div>
                <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                  {m.user.nickname}
                  {m.user_id === hostId && (
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold">
                      방장
                    </span>
                  )}
                </p>
                <p className="text-xs text-gray-400">
                  {LEVEL_LABELS[m.user.english_level as keyof typeof LEVEL_LABELS] ??
                    m.user.english_level}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {isHost && m.user_id !== currentUserId && (
                <KickButton
                  roomId={roomId}
                  targetUserId={m.user_id}
                  targetNickname={m.user.nickname}
                />
              )}
              {currentUserId && m.user_id !== currentUserId && (
                <ReportButton
                  roomId={roomId}
                  reportedId={m.user_id}
                  reportedName={m.user.nickname}
                />
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
