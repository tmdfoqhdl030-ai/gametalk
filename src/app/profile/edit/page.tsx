"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AnimalAvatar from "@/components/AnimalAvatar";
import { ANIMALS, MBTI_TYPES } from "@/lib/animals";
import { GAME_LABELS, GENDER_LABELS, type Game, type Gender } from "@/types";

const GAMES: Game[] = ["pubg", "lol", "overwatch", "valorant"];
const GENDERS: Gender[] = ["male", "female", "other", "secret"];

export default function ProfileEditPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [nickname, setNickname] = useState("");
  const [englishLevel, setEnglishLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [age, setAge] = useState<string>("");
  const [gender, setGender] = useState<Gender | "">("");
  const [mbti, setMbti] = useState<string>("");
  const [favoriteGames, setFavoriteGames] = useState<Game[]>([]);
  const [avatarAnimal, setAvatarAnimal] = useState("cat");

  // 게임 계정명 및 티어 상태
  const [lolUser, setLolUser] = useState("");
  const [pubgUser, setPubgUser] = useState("");
  const [overwatchUser, setOverwatchUser] = useState("");
  const [valorantUser, setValorantUser] = useState("");
  const [tftUser, setTftUser] = useState("");

  const [lolTier, setLolTier] = useState("");
  const [pubgTier, setPubgTier] = useState("");
  const [overwatchTier, setOverwatchTier] = useState("");
  const [valorantTier, setValorantTier] = useState("");
  const [tftTier, setTftTier] = useState("");

  const [syncingGame, setSyncingGame] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) { router.replace("/auth/login?next=/profile/edit"); return; }

      const { data } = await supabase.from("users").select("*").eq("id", authUser.id).single();
      if (data) {
        setNickname(data.nickname ?? "");
        setEnglishLevel(data.english_level ?? "beginner");
        setAge(data.age ? String(data.age) : "");
        setGender(data.gender ?? "");
        setMbti(data.mbti ?? "");
        setFavoriteGames(data.favorite_games ?? []);
        setAvatarAnimal(data.avatar_animal ?? "cat");

        // 티어 로딩
        setLolTier(data.lol_tier ?? "");
        setPubgTier(data.pubg_tier ?? "");
        setOverwatchTier(data.overwatch_tier ?? "");
        setValorantTier(data.valorant_tier ?? "");
        setTftTier(data.tft_tier ?? "");
      }
      setLoading(false);
    })();
  }, []);

  function toggleGame(game: Game) {
    setFavoriteGames((prev) =>
      prev.includes(game) ? prev.filter((g) => g !== game) : [...prev, game]
    );
  }

  async function syncTier(game: string, username: string) {
    if (!username.trim()) {
      alert("동기화할 게임 아이디 또는 플레이어 태그를 먼저 입력해주세요.");
      return;
    }
    setSyncingGame(game);
    try {
      const res = await fetch("/api/profile/sync-tier", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game, username: username.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        if (game === "lol") setLolTier(data.tier);
        else if (game === "pubg") setPubgTier(data.tier);
        else if (game === "overwatch") setOverwatchTier(data.tier);
        else if (game === "valorant") setValorantTier(data.tier);
        else if (game === "tft") setTftTier(data.tier);
        alert(`🎉 ${GAME_LABELS[game as Game]} 실시간 전적/티어 동기화 완료: ${data.tier}`);
      } else {
        alert(`⚠️ 동기화 실패: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("API 서버 통신 중 오류가 발생했습니다.");
    } finally {
      setSyncingGame(null);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nickname: nickname.trim(),
        english_level: englishLevel,
        age: age ? parseInt(age) : null,
        gender: gender || null,
        mbti: mbti || null,
        favorite_games: favoriteGames,
        avatar_animal: avatarAnimal,
        lol_tier: lolTier || null,
        pubg_tier: pubgTier || null,
        overwatch_tier: overwatchTier || null,
        valorant_tier: valorantTier || null,
        tft_tier: tftTier || null,
      }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "저장 실패");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-gray-900">내 프로필 편집</h1>
          <p className="text-sm text-gray-500 mt-1">게이머들에게 나를 소개해봐요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 동물 아바타 선택 */}
          <section className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="text-sm font-bold text-gray-700 mb-5">나의 캐릭터</h2>
            {/* 선택된 아바타 크게 미리보기 */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <AnimalAvatar animalId={avatarAnimal} size="xl" />
                {/* 반짝이 효과 */}
                <span className="absolute -top-1 -right-1 text-lg animate-bounce">✨</span>
              </div>
              <p className="mt-3 text-sm font-bold text-gray-800">
                {ANIMALS.find(a => a.id === avatarAnimal)?.name}
              </p>
            </div>
            {/* 동물 선택 그리드 - 6열 3행 */}
            <div className="grid grid-cols-6 gap-2.5">
              {ANIMALS.map((animal) => {
                const selected = avatarAnimal === animal.id;
                return (
                  <button
                    key={animal.id}
                    type="button"
                    onClick={() => setAvatarAnimal(animal.id)}
                    className={`relative flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all duration-150 ${
                      selected
                        ? "scale-110 shadow-md"
                        : "hover:scale-105 hover:bg-gray-50"
                    }`}
                    style={selected ? { background: `${animal.bg}18`, outline: `2.5px solid ${animal.bg}` } : {}}
                  >
                    {/* 선택 체크 배지 */}
                    {selected && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-white text-[9px] font-black rounded-full flex items-center justify-center shadow">
                        ✓
                      </span>
                    )}
                    <AnimalAvatar animalId={animal.id} size="sm" />
                    <span className="text-[9px] text-gray-500 font-semibold leading-tight">{animal.name}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 기본 정보 */}
          <section className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <h2 className="text-sm font-bold text-gray-700">기본 정보</h2>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">닉네임</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
                required
                className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">영어 실력</label>
              <div className="flex gap-2 mt-1">
                {(["beginner", "intermediate", "advanced"] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setEnglishLevel(level)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg border-2 transition-colors ${
                      englishLevel === level
                        ? "border-accent bg-accent text-white"
                        : "border-gray-200 text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    {level === "beginner" ? "초급" : level === "intermediate" ? "중급" : "고급"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">나이</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min={10}
                  max={99}
                  placeholder="예) 24"
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">성별</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Gender | "")}
                  className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent bg-white"
                >
                  <option value="">선택 안함</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>{GENDER_LABELS[g]}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* MBTI */}
          <section className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold text-gray-700 mb-3">MBTI</h2>
            <div className="grid grid-cols-4 gap-1.5">
              {MBTI_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setMbti(mbti === type ? "" : type)}
                  className={`py-1.5 text-xs font-bold rounded-lg border-2 transition-colors ${
                    mbti === type
                      ? "border-accent bg-accent text-white"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </section>

          {/* 좋아하는 게임 */}
          <section className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold text-gray-700 mb-3">좋아하는 게임</h2>
            <div className="flex gap-2">
              {GAMES.map((game) => (
                <button
                  key={game}
                  type="button"
                  onClick={() => toggleGame(game)}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl border-2 transition-colors ${
                    favoriteGames.includes(game)
                      ? "border-accent bg-accent text-white"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {GAME_LABELS[game]}
                </button>
              ))}
            </div>
          </section>

          {/* 실시간 게임 티어 연동 */}
          <section className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-gray-700">실시간 게임 티어 연동</h2>
              <p className="text-xs text-gray-400 mt-0.5">인증할 게임 아이디를 입력하고 동기화 버튼을 누르세요</p>
            </div>

            <div className="space-y-3.5">
              {/* LOL */}
              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1">⚔️ 리그오브레전드</span>
                  <span className="text-xs font-bold text-accent">{lolTier ? `🏆 ${lolTier}` : "연동 안됨"}</span>
                </div>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={lolUser}
                    onChange={(e) => setLolUser(e.target.value)}
                    placeholder="소환사명#태그 입력"
                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={() => syncTier("lol", lolUser)}
                    disabled={syncingGame !== null}
                    className="px-3.5 py-1.5 bg-accent text-white text-xs font-bold rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
                  >
                    {syncingGame === "lol" ? "동기화중..." : "동기화"}
                  </button>
                </div>
              </div>

              {/* PUBG */}
              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1">🪖 배틀그라운드</span>
                  <span className="text-xs font-bold text-accent">{pubgTier ? `🏆 ${pubgTier}` : "연동 안됨"}</span>
                </div>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={pubgUser}
                    onChange={(e) => setPubgUser(e.target.value)}
                    placeholder="배틀그라운드 캐릭터명 입력"
                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={() => syncTier("pubg", pubgUser)}
                    disabled={syncingGame !== null}
                    className="px-3.5 py-1.5 bg-accent text-white text-xs font-bold rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
                  >
                    {syncingGame === "pubg" ? "동기화중..." : "동기화"}
                  </button>
                </div>
              </div>

              {/* Overwatch */}
              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1">🎯 오버워치 2</span>
                  <span className="text-xs font-bold text-accent">{overwatchTier ? `🏆 ${overwatchTier}` : "연동 안됨"}</span>
                </div>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={overwatchUser}
                    onChange={(e) => setOverwatchUser(e.target.value)}
                    placeholder="BattleTag#숫자 입력"
                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={() => syncTier("overwatch", overwatchUser)}
                    disabled={syncingGame !== null}
                    className="px-3.5 py-1.5 bg-accent text-white text-xs font-bold rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
                  >
                    {syncingGame === "overwatch" ? "동기화중..." : "동기화"}
                  </button>
                </div>
              </div>

              {/* Valorant */}
              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1">🎯 발로란트</span>
                  <span className="text-xs font-bold text-accent">{valorantTier ? `🏆 ${valorantTier}` : "연동 안됨"}</span>
                </div>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={valorantUser}
                    onChange={(e) => setValorantUser(e.target.value)}
                    placeholder="플레이어명#태그 입력"
                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={() => syncTier("valorant", valorantUser)}
                    disabled={syncingGame !== null}
                    className="px-3.5 py-1.5 bg-accent text-white text-xs font-bold rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
                  >
                    {syncingGame === "valorant" ? "동기화중..." : "동기화"}
                  </button>
                </div>
              </div>

              {/* TFT */}
              <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700 flex items-center gap-1">♟️ 롤토체스</span>
                  <span className="text-xs font-bold text-accent">{tftTier ? `🏆 ${tftTier}` : "연동 안됨"}</span>
                </div>
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={tftUser}
                    onChange={(e) => setTftUser(e.target.value)}
                    placeholder="소환사명#태그 입력"
                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:border-accent"
                  />
                  <button
                    type="button"
                    onClick={() => syncTier("tft", tftUser)}
                    disabled={syncingGame !== null}
                    className="px-3.5 py-1.5 bg-accent text-white text-xs font-bold rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
                  >
                    {syncingGame === "tft" ? "동기화중..." : "동기화"}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-accent hover:bg-accent-hover text-white font-extrabold rounded-xl transition-colors disabled:opacity-50"
          >
            {saving ? "저장 중..." : "저장하기"}
          </button>
        </form>
      </div>
    </div>
  );
}
