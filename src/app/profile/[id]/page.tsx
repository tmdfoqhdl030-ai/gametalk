import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import AnimalAvatar from "@/components/AnimalAvatar";
import { GAME_LABELS, LEVEL_LABELS, GENDER_LABELS, LEVEL_EMOJI, type Gender, type Game, type EnglishLevel } from "@/types";
import GameIcon from "@/components/GameIcon";
import Link from "next/link";

const TIER_BADGE_STYLES: Record<string, string> = {
  beginner: "bg-green-150 text-green-700 border border-green-200",
  intermediate: "bg-blue-100 text-blue-700 border border-blue-200",
  advanced: "bg-red-100 text-red-700 border border-red-200",
  iron: "bg-slate-100 text-slate-700 border border-slate-200",
  bronze: "bg-amber-100 text-amber-800 border border-amber-200",
  silver: "bg-zinc-100 text-zinc-700 border border-zinc-200",
  gold: "bg-yellow-100 text-yellow-800 border border-yellow-200 font-bold",
  platinum: "bg-teal-100 text-teal-800 border border-teal-200 font-bold",
  diamond: "bg-sky-100 text-sky-800 border border-sky-200 font-extrabold",
  master: "bg-purple-100 text-purple-800 border border-purple-200 font-extrabold",
  grandmaster: "bg-red-100 text-red-800 border border-red-200 font-extrabold animate-pulse",
  challenger: "bg-blue-100 text-blue-800 border border-blue-200 font-black animate-pulse"
};

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
          <span className={`mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
            TIER_BADGE_STYLES[profile.english_level as EnglishLevel] ?? "bg-gray-100 text-gray-600"
          }`}>
            <span>{LEVEL_EMOJI[profile.english_level as EnglishLevel] ?? "🌱"}</span>
            <span>영어 {LEVEL_LABELS[profile.english_level as EnglishLevel] ?? profile.english_level}</span>
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



        {/* 매너 온도 (당근마켓 스타일) */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide">매너 온도</h2>
            <span className="text-sm font-extrabold text-accent">
              {profile.manner_score ?? 36.5}°C {parseFloat(profile.manner_score ?? 36.5) >= 36.5 ? "😊" : "👤"}
            </span>
          </div>
          
          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-accent h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(99.9, Math.max(0, profile.manner_score ?? 36.5))}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-2">첫 매너 온도는 36.5°C에서 시작합니다.</p>
        </div>

        {/* 연동된 게임 티어 */}
        {(profile.lol_tier || profile.pubg_tier || profile.overwatch_tier || profile.valorant_tier || profile.tft_tier) && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">연동된 게임 티어</h2>
            <div className="grid grid-cols-1 gap-2.5">
              {profile.lol_tier && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">⚔️ 리그오브레전드</span>
                  <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-black rounded-full">🏆 {profile.lol_tier}</span>
                </div>
              )}
              {profile.pubg_tier && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">🪖 배틀그라운드</span>
                  <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-black rounded-full">🏆 {profile.pubg_tier}</span>
                </div>
              )}
              {profile.overwatch_tier && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">🎯 오버워치 2</span>
                  <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-black rounded-full">🏆 {profile.overwatch_tier}</span>
                </div>
              )}
              {profile.valorant_tier && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">🎯 발로란트</span>
                  <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-black rounded-full">🏆 {profile.valorant_tier}</span>
                </div>
              )}
              {profile.tft_tier && (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">♟️ 롤토체스</span>
                  <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-black rounded-full">🏆 {profile.tft_tier}</span>
                </div>
              )}
            </div>
          </div>
        )}

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
