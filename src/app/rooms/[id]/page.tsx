import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Room, GAME_LABELS, GAME_EMOJI, LEVEL_LABELS } from "@/types";
import ChatBox from "@/components/chat/ChatBox";
import RoomActions from "./RoomActions";
import AnimalAvatar from "@/components/AnimalAvatar";
import ShareButton from "@/components/ShareButton";
import ReportButton from "@/components/rooms/ReportButton";
import RoomNotification from "@/components/rooms/RoomNotification";
import MemberList from "@/components/rooms/MemberList";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gamespeak.shop";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("rooms").select("title, game").eq("id", id).single();
  if (!data) return {};
  const ogUrl = `${BASE_URL}/api/og?title=${encodeURIComponent(data.title)}&game=${data.game}`;
  return {
    title: data.title,
    openGraph: { title: data.title, images: [{ url: ogUrl, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: data.title, images: [ogUrl] },
  };
}

export default async function RoomPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { created } = await searchParams;
  const isNewlyCreated = created === "true";
  const supabase = await createClient();

  const { data: { user: authUser } } = await supabase.auth.getUser();

  const { data: roomData, error } = await supabase
    .from("rooms")
    .select(`
      *,
      host:users!rooms_host_id_fkey(id, nickname, english_level),
      room_members(user_id, joined_at, user:users(id, nickname, english_level, avatar_animal))
    `)
    .eq("id", id)
    .single();

  if (error || !roomData) notFound();

  const room = roomData as unknown as Room & { room_members: { user_id: string; user: { id: string; nickname: string; english_level: string; avatar_animal?: string | null } }[] };

  const { data: messages } = await supabase
    .from("messages")
    .select(`*, user:users(id, nickname, english_level)`)
    .eq("room_id", id)
    .order("created_at")
    .limit(100);

  let currentUser = null;
  if (authUser) {
    const { data } = await supabase.from("users").select("*").eq("id", authUser.id).single();
    currentUser = data;
  }

  const isMember = room.room_members.some((m) => m.user_id === authUser?.id);
  const isHost = room.host_id === authUser?.id;
  const memberCount = room.room_members.length;

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

  const initialMemberIds = room.room_members.map((m) => m.user_id);

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      {/* 방 입장 소리 + 토스트 알림 */}
      <RoomNotification
        roomId={id}
        initialMemberIds={initialMemberIds}
        currentUserId={authUser?.id}
      />
      {/* Discord 자동 생성 안내 배너 */}
      {isNewlyCreated && room.discord_invite && (
        <div className="mb-6 flex items-start gap-3 bg-indigo-600 text-white rounded-xl px-5 py-4 shadow-lg">
          <span className="text-2xl flex-shrink-0">🎮</span>
          <div>
            <p className="font-extrabold text-base mb-0.5">디스코드 음성 채널이 자동으로 생성되었습니다!</p>
            <p className="text-sm text-indigo-200 mb-2">팀원들과 바로 게임을 시작하세요. 아래 링크로 입장할 수 있어요.</p>
            <a
              href={room.discord_invite}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-white text-indigo-600 font-bold text-sm px-4 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              🔗 디스코드 입장하기
            </a>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Room info + member list */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{GAME_EMOJI[room.game]}</span>
              <span className="text-xs font-bold text-gray-400 uppercase">{GAME_LABELS[room.game]}</span>
            </div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h1 className="text-base font-extrabold text-gray-900">{room.title}</h1>
              <ShareButton url={`/rooms/${id}`} title={room.title} variant="icon" className="flex-shrink-0" />
            </div>
            <p className="text-xs text-gray-400">방장: {room.host?.nickname ?? "—"}</p>

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <span className={`text-xs font-bold px-2 py-1 rounded ${LEVEL_COLORS[room.english_level]}`}>
                {LEVEL_LABELS[room.english_level]}
              </span>
              <span className="text-xs text-gray-400">👥 {memberCount}/{room.max_players}</span>
              <span className={`ml-auto text-xs font-bold ${room.status === "full" ? "text-red-500" : "text-green-500"}`}>
                {room.status === "full" ? "마감" : "모집 중"}
              </span>
            </div>
          </div>

          {room.discord_invite && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <p className="text-xs font-bold text-indigo-700 mb-2">🎮 디스코드 채널</p>
              <a
                href={room.discord_invite}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-600 hover:underline break-all"
              >
                {room.discord_invite}
              </a>
            </div>
          )}

          <MemberList
            roomId={id}
            hostId={room.host_id ?? ""}
            initialMembers={room.room_members}
            currentUserId={authUser?.id}
            isHost={isHost}
          />

          <RoomActions
            roomId={id}
            isMember={isMember}
            isHost={isHost}
            isFull={room.status === "full"}
            isLoggedIn={!!authUser}
            currentDiscordInvite={room.discord_invite ?? ""}
          />
        </div>

        {/* Right: Chat */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 flex flex-col h-[600px]">
          <h2 className="text-sm font-bold text-gray-900 mb-4">채팅</h2>
          <ChatBox
            roomId={id}
            currentUser={currentUser}
            initialMessages={messages ?? []}
          />
        </div>
      </div>
    </div>
  );
}
