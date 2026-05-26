import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Room, GAME_LABELS, GAME_EMOJI, LEVEL_LABELS } from "@/types";
import ChatBox from "@/components/chat/ChatBox";
import RoomActions from "./RoomActions";
import ShareButton from "@/components/ShareButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RoomPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: { user: authUser } } = await supabase.auth.getUser();

  const { data: roomData, error } = await supabase
    .from("rooms")
    .select(`
      *,
      host:users!rooms_host_id_fkey(id, nickname, english_level),
      room_members(user_id, joined_at, user:users(id, nickname, english_level))
    `)
    .eq("id", id)
    .single();

  if (error || !roomData) notFound();

  const room = roomData as unknown as Room & { room_members: { user_id: string; user: { id: string; nickname: string; english_level: string } }[] };

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

  const LEVEL_COLORS = {
    beginner: "bg-green-100 text-green-800",
    intermediate: "bg-blue-100 text-blue-800",
    advanced: "bg-red-100 text-red-800",
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
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

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-xs font-bold text-gray-400 uppercase mb-3">참여자 ({memberCount}명)</p>
            <ul className="space-y-2">
              {room.room_members.map((m) => (
                <li key={m.user_id} className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {m.user.nickname[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                      {m.user.nickname}
                      {m.user_id === room.host_id && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded font-bold">방장</span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400">{LEVEL_LABELS[m.user.english_level as keyof typeof LEVEL_LABELS]}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

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
