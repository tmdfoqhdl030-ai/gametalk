import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import RoomCard from "@/components/rooms/RoomCard";
import RoomFilter from "@/components/rooms/RoomFilter";
import GameIcon from "@/components/GameIcon";
import { Room } from "@/types";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ game?: string; level?: string }>;
}

async function getPageData() {
  const supabase = await createClient();

  const [
    { count: openRooms },
    { count: totalUsers },
    { data: { user: authUser } },
  ] = await Promise.all([
    supabase.from("rooms").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("users").select("*", { count: "exact", head: true }),
    supabase.auth.getUser(),
  ]);

  return {
    openRooms: openRooms ?? 0,
    totalUsers: totalUsers ?? 0,
    isLoggedIn: !!authUser,
  };
}

async function RoomList({ game, level }: { game?: string; level?: string }) {
  const supabase = await createClient();

  let query = supabase
    .from("rooms")
    .select(`*, host:users!rooms_host_id_fkey(id, nickname, english_level), member_count:room_members(count)`)
    .neq("status", "closed")
    .order("created_at", { ascending: false });

  if (game) query = query.eq("game", game);
  if (level) query = query.eq("english_level", level);

  const { data, error } = await query;
  if (error) return <p className="text-sm text-red-500">방 목록을 불러오지 못했습니다.</p>;

  const rooms: Room[] = (data ?? []).map((r) => ({
    ...r,
    member_count: (r.member_count as unknown as { count: number }[])?.[0]?.count ?? 0,
  }));

  if (rooms.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-5xl mb-4">🎮</p>
        <p className="text-base font-semibold text-gray-500">열린 방이 없습니다</p>
        <p className="text-sm mt-1 mb-5">첫 번째 방을 만들어보세요!</p>
        <Link href="/rooms/new" className="inline-block px-5 py-2.5 bg-accent text-white text-sm font-bold rounded-lg hover:bg-accent-hover transition-colors">
          + 방 만들기
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {rooms.map((room) => <RoomCard key={room.id} room={room} />)}
    </div>
  );
}

export default async function HomePage({ searchParams }: PageProps) {
  const { game, level } = await searchParams;
  const { openRooms, totalUsers, isLoggedIn } = await getPageData();

  return (
    <div className="bg-[#f8f9fa]">

      {/* ── Hero ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-14 flex flex-col lg:flex-row items-center gap-10">

          {/* Left copy */}
          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-light text-accent text-xs font-bold rounded-full mb-4">
              🎮 한국 게이머를 위한 영어 팀원 모집 플랫폼
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-[1.15] tracking-tight">
              게임하면서<br />
              <span className="text-accent">영어도 같이</span> 늘어요
            </h1>

            {/* 핵심 차별점: 디스코드 자동 생성 강조 */}
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-xl">
              <span className="text-indigo-500 text-base">🎙️</span>
              <span className="text-xs font-bold text-indigo-700">방 만들면 <span className="underline underline-offset-2">디스코드 음성채널이 자동 생성</span>돼요</span>
            </div>

            <p className="mt-4 text-gray-500 text-base leading-relaxed max-w-lg">
              배틀그라운드 · 롤 · 오버워치 · 발로란트 · 롤토체스에서<br />
              영어로 소통하는 팀원을 찾아보세요.<br />
              <span className="text-gray-700 font-medium">억지로 외우는 영어 NO, 게임하면서 자연스럽게.</span>
            </p>

            {/* 실시간 활성 지표 */}
            <div className="flex items-center gap-4 mt-5 mb-6">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                <span className="text-xs font-bold text-gray-500">
                  지금 <span className="text-green-600">{openRooms}개</span> 방 모집 중
                </span>
              </div>
              <span className="text-gray-200">|</span>
              <span className="text-xs font-bold text-gray-500">
                누적 <span className="text-accent">{totalUsers}명</span> 이용
              </span>
            </div>

            {/* 로그인 여부에 따라 CTA 분기 */}
            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <>
                  <Link href="/rooms/new" className="px-6 py-3 bg-accent text-white text-sm font-bold rounded-xl hover:bg-accent-hover transition-colors shadow-sm">
                    + 방 만들기
                  </Link>
                  <Link href="/#rooms" className="px-6 py-3 border-2 border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:border-accent hover:text-accent transition-all">
                    🔍 방 둘러보기
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/auth/signup" className="px-6 py-3 bg-accent text-white text-sm font-extrabold rounded-xl hover:bg-accent-hover transition-colors shadow-sm">
                    ⚡ 무료로 시작하기
                  </Link>
                  <Link href="/#rooms" className="px-6 py-3 border-2 border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:border-accent hover:text-accent transition-all">
                    방 먼저 구경하기
                  </Link>
                </>
              )}
            </div>

            {/* 비로그인: 3단계 가입 안내 */}
            {!isLoggedIn && (
              <div className="flex items-center gap-2 mt-4">
                {[
                  { step: "1", label: "이메일 입력" },
                  { step: "2", label: "닉네임 설정" },
                  { step: "3", label: "게임 시작 🎮" },
                ].map((s, i) => (
                  <div key={s.step} className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-accent text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">{s.step}</span>
                      <span className="text-xs font-semibold text-gray-500">{s.label}</span>
                    </div>
                    {i < 2 && <span className="text-gray-300 text-xs">→</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Game Quick Filter */}
          <div className="shrink-0 w-full lg:w-auto max-w-sm bg-white border border-gray-200 p-5 rounded-3xl shadow-xs space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 justify-center lg:justify-start text-center lg:text-left">
              <span>🎮</span> 게임별 빠른 매칭 필터
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {([
                { game: "pubg",      name: "배그 (PUBG)", desc: "PUBG",     color: "hover:border-yellow-400 hover:bg-yellow-50/20" },
                { game: "lol",       name: "롤 (LoL)",    desc: "League",   color: "hover:border-blue-400 hover:bg-blue-50/20"    },
                { game: "overwatch", name: "오버워치 2",  desc: "OW 2",     color: "hover:border-orange-400 hover:bg-orange-50/20"},
                { game: "valorant",  name: "발로란트",    desc: "Valorant", color: "hover:border-red-400 hover:bg-red-50/20"      },
                { game: "tft",       name: "롤토체스",    desc: "TFT",      color: "hover:border-purple-400 hover:bg-purple-50/20"},
              ] as const).map((g) => (
                <Link
                  key={g.game}
                  href={`/?game=${g.game}#rooms`}
                  className={`flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-2xl transition-all duration-200 hover:scale-[1.03] hover:shadow-sm cursor-pointer group ${g.color}`}
                >
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-gray-100 group-hover:border-transparent transition-colors overflow-hidden flex-shrink-0">
                    <GameIcon game={g.game} className="w-7 h-7" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold text-gray-900 group-hover:text-accent transition-colors leading-tight truncate">{g.name}</p>
                    <p className="text-[8px] text-gray-400 font-bold tracking-wider mt-0.5 uppercase">{g.desc}</p>
                  </div>
                </Link>
              ))}
              <Link href="/#rooms" className="flex items-center justify-center gap-2 p-3 bg-gray-100 hover:bg-gray-200 border border-transparent rounded-2xl transition-all duration-200 hover:scale-[1.03] cursor-pointer text-[11px] font-black text-gray-600 hover:text-gray-900">
                🔄 전체 보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Room List ── */}
      <section id="rooms" className="max-w-5xl mx-auto px-6 py-10 space-y-4 scroll-mt-20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">지금 모집 중인 방</h2>
            <p className="text-xs text-gray-400 mt-0.5">실시간으로 업데이트됩니다</p>
          </div>
          <Link href="/rooms/new" className="hidden sm:inline-flex px-4 py-2 bg-accent text-white text-sm font-bold rounded-lg hover:bg-accent-hover transition-colors">
            + 방 만들기
          </Link>
        </div>

        <Suspense fallback={null}><RoomFilter /></Suspense>

        <Suspense fallback={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse h-40" />
            ))}
          </div>
        }>
          <RoomList game={game} level={level} />
        </Suspense>
      </section>

      {/* ── How it Works ── */}
      <section className="bg-white border-b border-gray-100 mt-2">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <h2 className="text-xl font-extrabold text-gray-900 mb-8 text-center">이렇게 사용하세요</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: "01", icon: "🔍", title: "게임 · 레벨로 방 탐색", desc: "배그 · 롤 · 오버워치 등 원하는 게임과 내 영어 레벨에 맞는 방을 1초 만에 필터링." },
              { step: "02", icon: "💬", title: "채팅으로 팀원과 작전 짜기", desc: "방 참여 후 실시간 채팅으로 게임 전 소통. 모르는 영어 표현은 편하게 물어봐도 OK." },
              { step: "03", icon: "🎮", title: "디스코드 자동 연결 → 게임 시작", desc: "방 만들면 디스코드 음성채널이 자동 생성. 링크 하나로 팀원과 바로 실전 게임." },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-12 h-12 flex items-center justify-center bg-accent-light rounded-2xl text-2xl mb-4">{item.icon}</div>
                <span className="text-xs font-bold text-accent mb-1">STEP {item.step}</span>
                <h3 className="text-base font-extrabold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 영어 레벨 가이드 ── */}
      <section className="bg-white border-b border-gray-100 mt-2">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="text-center mb-6">
            <h2 className="text-lg font-extrabold text-gray-900">내 영어 레벨은?</h2>
            <p className="text-xs text-gray-400 mt-1">게임할 때 이 정도면 충분해요</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                emoji: "🌱",
                level: "초급",
                color: "border-green-200 bg-green-50",
                badge: "text-green-700 bg-green-100",
                desc: "간단한 게임 용어만 알아도 OK",
                examples: ["GG (Good Game)", "Rush B!", "Help!", "Enemy here!"],
              },
              {
                emoji: "🌿",
                level: "중급",
                color: "border-blue-200 bg-blue-50",
                badge: "text-blue-700 bg-blue-100",
                desc: "기본 소통과 전략 대화 가능",
                examples: ["Cover me, I'm pushing!", "Let's rotate to mid", "Nice shot!", "I'm low on ammo"],
              },
              {
                emoji: "🌳",
                level: "고급",
                color: "border-accent/30 bg-accent-light",
                badge: "text-accent bg-accent-light border border-accent/20",
                desc: "원어민과 자유롭게 대화 가능",
                examples: ["Let's bait them out and flank", "Hold your position until I flank", "We need to play for picks", "Save your ult for the fight"],
              },
            ].map((l) => (
              <div key={l.level} className={`rounded-2xl border-2 p-5 ${l.color}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">{l.emoji}</span>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-lg ${l.badge}`}>{l.level}</span>
                </div>
                <p className="text-sm font-bold text-gray-700 mb-3">{l.desc}</p>
                <ul className="space-y-1">
                  {l.examples.map((ex) => (
                    <li key={ex} className="text-xs text-gray-500 font-mono bg-white/60 px-2 py-1 rounded-lg">
                      "{ex}"
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 게임별 영어 콜아웃 ── */}
      <section className="bg-white border-b border-gray-100 mt-2">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="text-center mb-7">
            <span className="text-xs font-bold text-accent uppercase tracking-widest">실전 영어 표현</span>
            <h2 className="text-xl font-extrabold text-gray-900 mt-1">게임 중에 바로 쓰는 영어</h2>
            <p className="text-sm text-gray-500 mt-1">외울 필요 없어요. 게임하다 보면 자연스럽게 나와요.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                game: "pubg" as const,
                name: "배그 (PUBG)",
                color: "border-yellow-200",
                calls: [
                  { en: "Enemy spotted at 3 o'clock!", kr: "3시 방향에 적 발견!" },
                  { en: "Cover me, I'm looting!", kr: "나 루팅 중, 커버해줘!" },
                  { en: "Let's third-party them.", kr: "어부지리로 잡자." },
                ],
              },
              {
                game: "lol" as const,
                name: "롤 (LoL)",
                color: "border-blue-200",
                calls: [
                  { en: "I'm ganking mid, set up vision!", kr: "미드 갱킹 갈게, 와드 박아!" },
                  { en: "Dragon is spawning in 30!", kr: "30초 후 용 리스폰!" },
                  { en: "Group up for Baron!", kr: "바론 하러 모여!" },
                ],
              },
              {
                game: "overwatch" as const,
                name: "오버워치",
                color: "border-orange-200",
                calls: [
                  { en: "Save your ult for the next fight!", kr: "다음 한타 위해 궁 아껴!" },
                  { en: "They're holding high ground.", kr: "저쪽이 고지 잡고 있어." },
                  { en: "Focus the supports first!", kr: "서포터 먼저 잡아!" },
                ],
              },
              {
                game: "valorant" as const,
                name: "발로란트",
                color: "border-red-200",
                calls: [
                  { en: "Plant the spike on B site!", kr: "B 사이트에 스파이크 심어!" },
                  { en: "They're retaking, fall back!", kr: "리테이크 온다, 빠져!" },
                  { en: "Smoke CT, I'll push main.", kr: "CT 스모크, 나 메인 푸시할게." },
                ],
              },
              {
                game: "tft" as const,
                name: "롤토체스",
                color: "border-purple-200",
                calls: [
                  { en: "I'm hyper-rolling for 3-star!", kr: "3성 위해 하이퍼롤 간다!" },
                  { en: "What augment did you take?", kr: "어그멘트 뭐 골랐어?" },
                  { en: "Econ up, don't spend yet.", kr: "이코노미 올려, 아직 쓰지 마." },
                ],
              },
            ].map((g) => (
              <div key={g.game} className={`bg-white border-2 rounded-2xl p-5 ${g.color}`}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100">
                    <GameIcon game={g.game} className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-extrabold text-gray-900">{g.name}</span>
                </div>
                <ul className="space-y-2.5">
                  {g.calls.map((c) => (
                    <li key={c.en} className="space-y-0.5">
                      <p className="text-xs font-bold text-gray-900 font-mono">"{c.en}"</p>
                      <p className="text-[11px] text-gray-400">{c.kr}</p>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/?game=${g.game}#rooms`}
                  className="mt-4 w-full flex items-center justify-center text-xs font-bold text-accent bg-accent-light py-2 rounded-xl hover:bg-accent hover:text-white transition-colors"
                >
                  {g.name} 방 찾기 →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why GameSpeak ── */}
      <section className="bg-white border-b border-gray-100 mt-2">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="flex-1">
              <span className="text-xs font-bold text-accent uppercase tracking-widest">왜 게임스피크인가요?</span>
              <h2 className="text-2xl font-extrabold text-gray-900 mt-2 mb-4 leading-snug">
                영어 학원 말고,<br />
                <span className="text-accent">게임으로 배우세요</span>
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                게임 안에서는 자연스럽게 영어를 쓰게 됩니다. 공격, 수비, 작전 — 실전 상황에서 배운 영어는 잊히지 않아요.
                게임스피크는 영어 학습 앱이 아닙니다. 그냥 게임을 즐기다 보면 영어가 늘어 있어요.
              </p>
              <ul className="space-y-3">
                {[
                  "🏆 게임 실력에 맞는 팀원 매칭",
                  "💬 실시간 채팅으로 게임 전 소통",
                  "🎙️ 방 만들면 디스코드 음성채널 자동 생성",
                  "🌍 초급부터 고급까지 영어 레벨 선택",
                  "🔔 팀원 입장/퇴장 실시간 알림 + 소리",
                  "⭐ 매너 점수로 좋은 팀원 찾기",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-gray-700 font-medium">
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-3 w-full">
              {[
                { icon: "🎮", label: "게임 중심", desc: "영어보다 게임이 먼저" },
                { icon: "🚀", label: "즉시 시작", desc: "가입 후 바로 팀원 모집" },
                { icon: "🔒", label: "레벨 매칭", desc: "내 영어 수준에 맞게" },
                { icon: "🤝", label: "디스코드 연동", desc: "음성채널 자동 생성" },
              ].map((f) => (
                <div key={f.label} className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex flex-col gap-2">
                  <span className="text-2xl">{f.icon}</span>
                  <p className="text-sm font-extrabold text-gray-900">{f.label}</p>
                  <p className="text-xs text-gray-500">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Banner — 로그인 여부에 따라 분기 ── */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="relative overflow-hidden bg-gray-900 rounded-3xl p-10 text-center text-white">
          <div className="absolute inset-0 opacity-5 text-[160px] flex items-center justify-center pointer-events-none select-none leading-none">🎮</div>
          <div className="relative">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-white/80 text-xs font-bold rounded-full mb-4">
              🎙️ 방 만들면 디스코드 채널이 자동 생성돼요
            </span>
            {isLoggedIn ? (
              <>
                <p className="text-2xl font-extrabold mb-2">팀원을 찾고 있나요?</p>
                <p className="text-sm text-gray-400 mb-7 max-w-md mx-auto">지금 바로 방을 만들거나 모집 중인 방에 참여해보세요.</p>
                <div className="flex items-center justify-center gap-3">
                  <Link href="/rooms/new" className="px-7 py-3 bg-accent text-white text-sm font-extrabold rounded-xl hover:bg-accent-hover transition-colors shadow">+ 방 만들기</Link>
                  <Link href="/#rooms" className="px-7 py-3 border-2 border-white/30 text-white text-sm font-bold rounded-xl hover:bg-white/10 transition-colors">🔍 방 둘러보기</Link>
                </div>
              </>
            ) : (
              <>
                <p className="text-2xl font-extrabold mb-2">지금 무료로 시작하세요</p>
                <p className="text-sm text-gray-400 mb-7 max-w-md mx-auto">이메일만 있으면 30초 안에 팀원을 찾을 수 있어요. 영어 레벨 상관없이 누구나 환영합니다.</p>
                <div className="flex items-center justify-center gap-3">
                  <Link href="/auth/signup" className="px-7 py-3 bg-white text-gray-900 text-sm font-extrabold rounded-xl hover:bg-gray-100 transition-colors shadow">⚡ 무료로 시작하기</Link>
                  <Link href="/#rooms" className="px-7 py-3 border-2 border-white/30 text-white text-sm font-bold rounded-xl hover:bg-white/10 transition-colors">방 먼저 구경하기</Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
