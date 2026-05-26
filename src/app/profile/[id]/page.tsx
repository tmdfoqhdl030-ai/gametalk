import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import AnimalAvatar from "@/components/AnimalAvatar";
import { GAME_LABELS, LEVEL_LABELS, GENDER_LABELS, type Gender, type Game } from "@/types";
import GameIcon from "@/components/GameIcon";
import Link from "next/link";

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .single();

  if (!profile) notFound();

  const { data: { user: me } } = await supabase.auth.getUser();
  const isMe = me?.id === profile.id;

  const favoriteGames: string[] = profile.favorite_games ?? [];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-md mx-auto space-y-4">

        {/* 아바타 + 이름 카드 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col items-center text-center">
          <AnimalAvatar animalId={profile.avatar_animal} size="xl" />
          <h1 className="mt-4 text-2xl font-extrabold text-gray-900">{profile.nickname}</h1>
          <span className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold ${
            profile.english_level === "advanced"
              ? "bg-blue-100 text-blue-700"
              : profile.english_level === "intermediate"
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}>
            영어 {LEVEL_LABELS[profile.english_level as keyof typeof LEVEL_LABELS] ?? profile.english_level}
          </span>
          <p className="mt-1 text-xs text-gray-400">
            {new Date(profile.created_at).toLocaleDateString("ko-KR", { year: "numeric", month: "long" })} 가입
          </p>

          {isMe && (
            <Link
              href="/profile/edit"
              className="mt-4 px-5 py-2 text-sm font-bold text-accent border-2 border-accent rounded-xl hover:bg-accent hover:text-white transition-colors"
            >
              프로필 편집
            </Link>
          )}
        </div>

        {/* 개인 정보 */}
        {(profile.age || profile.gender || profile.mbti) && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">정보</h2>
            <div className="flex flex-wrap gap-2">
              {profile.age && (
                <Chip label="나이" value={`${profile.age}세`} />
              )}
              {profile.gender && profile.gender !== "secret" && (
                <Chip label="성별" value={GENDER_LABELS[profile.gender as Gender]} />
              )}
              {profile.mbti && (
                <Chip label="MBTI" value={profile.mbti} accent />
              )}
            </div>
          </div>
        )}

        {/* 좋아하는 게임 */}
        {favoriteGames.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">좋아하는 게임</h2>
            <div className="flex flex-wrap gap-2">
              {favoriteGames.map((game) => (
                <span
                  key={game}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent text-sm font-bold rounded-xl"
                >
                  <GameIcon game={game as Game} className="w-4 h-4" />
                  {GAME_LABELS[game as keyof typeof GAME_LABELS] ?? game}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 내 프로필이고 아직 정보가 없으면 유도 */}
        {isMe && !profile.age && !profile.mbti && favoriteGames.length === 0 && (
          <div className="bg-accent/5 border border-accent/20 rounded-2xl p-5 text-center">
            <p className="text-sm text-gray-600 mb-3">프로필을 완성하면 팀원들이 나를 더 잘 알 수 있어요!</p>
            <Link
              href="/profile/edit"
              className="inline-block px-5 py-2 text-sm font-bold text-white bg-accent hover:bg-accent-hover rounded-xl transition-colors"
            >
              프로필 완성하기
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function Chip({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold ${
      accent ? "bg-accent/10 text-accent" : "bg-gray-100 text-gray-700"
    }`}>
      <span className="text-xs text-gray-400">{label}</span>
      <span>{value}</span>
    </div>
  );
}
