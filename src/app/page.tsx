import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import RoomCard from "@/components/rooms/RoomCard";
import RoomFilter from "@/components/rooms/RoomFilter";
import { Room } from "@/types";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ game?: string; level?: string }>;
}

async function RoomList({ game, level }: { game?: string; level?: string }) {
  const supabase = await createClient();

  let query = supabase
    .from("rooms")
    .select(`
      *,
      host:users!rooms_host_id_fkey(id, nickname, english_level),
      member_count:room_members(count)
    `)
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
            <p className="mt-4 text-gray-500 text-base leading-relaxed max-w-lg">
              배틀그라운드 · 리그오브레전드 · 오버워치에서<br />
              영어로 소통하는 팀원을 찾아보세요.<br />
              <span className="text-gray-700 font-medium">억지로 외우는 영어 NO, 게임하면서 자연스럽게.</span>
            </p>
            <div className="flex items-center gap-3 mt-7">
              <Link href="/rooms/new" className="px-6 py-3 bg-accent text-white text-sm font-bold rounded-xl hover:bg-accent-hover transition-colors shadow-sm">
                + 방 만들기
              </Link>
              <Link href="/auth/signup" className="px-6 py-3 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:border-accent hover:text-accent transition-colors">
                무료 가입하기
              </Link>
            </div>
            <p className="mt-4 text-xs text-gray-400">회원가입 무료 · 3초면 완료</p>
          </div>

          {/* Right: game cards */}
          <div className="flex flex-col gap-3 shrink-0 w-full lg:w-auto">
            {[
              { emoji: "🔫", name: "배틀그라운드 (PUBG)", desc: "스쿼드 · 듀오 모집", color: "border-yellow-300 bg-yellow-50" },
              { emoji: "⚔️", name: "리그오브레전드", desc: "솔랭 파티 · 칼바람", color: "border-blue-200 bg-blue-50" },
              { emoji: "🎯", name: "오버워치 2", desc: "경쟁전 팀 모집", color: "border-orange-200 bg-orange-50" },
            ].map((g) => (
              <div key={g.name} className={`flex items-center gap-4 border rounded-2xl px-5 py-4 ${g.color} min-w-[240px]`}>
                <span className="text-3xl">{g.emoji}</span>
                <div>
                  <p className="text-sm font-extrabold text-gray-900">{g.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{g.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-white border-b border-gray-100 mt-2">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <h2 className="text-xl font-extrabold text-gray-900 mb-8 text-center">이렇게 사용하세요</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                icon: "🔍",
                title: "방 탐색",
                desc: "게임 · 영어 레벨로 필터링해서 나에게 맞는 방을 찾아보세요.",
              },
              {
                step: "02",
                icon: "🚪",
                title: "방 참여",
                desc: "마음에 드는 방에 참여하고 디스코드 링크로 바로 연결돼요.",
              },
              {
                step: "03",
                icon: "🎮",
                title: "게임 시작",
                desc: "팀원들과 영어로 소통하며 게임을 즐겨보세요!",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center p-6 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-12 h-12 flex items-center justify-center bg-accent-light rounded-2xl text-2xl mb-4">
                  {item.icon}
                </div>
                <span className="text-xs font-bold text-accent mb-1">STEP {item.step}</span>
                <h3 className="text-base font-extrabold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why GameTalk ── */}
      <section className="bg-white border-b border-gray-100 mt-2">
        <div className="max-w-5xl mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="flex-1">
              <span className="text-xs font-bold text-accent uppercase tracking-widest">왜 게임톡인가요?</span>
              <h2 className="text-2xl font-extrabold text-gray-900 mt-2 mb-4 leading-snug">
                영어 학원 말고,<br />
                <span className="text-accent">게임으로 배우세요</span>
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">
                게임 안에서는 자연스럽게 영어를 쓰게 됩니다. 공격, 수비, 작전 — 실전 상황에서 배운 영어는 잊히지 않아요.
                게임톡은 영어 학습 앱이 아닙니다. 그냥 게임을 즐기다 보면 영어가 늘어 있어요.
              </p>
              <ul className="space-y-3">
                {[
                  "🏆 게임 실력에 맞는 팀원 매칭",
                  "💬 실시간 채팅으로 게임 전 소통",
                  "🔗 디스코드 연동으로 바로 게임 시작",
                  "🌍 초급부터 고급까지 영어 레벨 선택",
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
                { icon: "🤝", label: "디스코드 연동", desc: "디스코드로 바로 연결" },
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

      {/* ── Room List ── */}
      <section className="max-w-5xl mx-auto px-6 py-10 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-gray-900">지금 모집 중인 방</h2>
            <p className="text-xs text-gray-400 mt-0.5">실시간으로 업데이트됩니다</p>
          </div>
          <Link href="/rooms/new" className="hidden sm:inline-flex px-4 py-2 bg-accent text-white text-sm font-bold rounded-lg hover:bg-accent-hover transition-colors">
            + 방 만들기
          </Link>
        </div>

        <Suspense fallback={null}>
          <RoomFilter />
        </Suspense>

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

      {/* ── CTA Banner ── */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="relative overflow-hidden bg-accent rounded-3xl p-10 text-center text-white">
          <div className="absolute inset-0 opacity-10 text-[120px] flex items-center justify-center pointer-events-none select-none">
            🎮
          </div>
          <p className="text-2xl font-extrabold mb-2 relative">지금 바로 시작해보세요</p>
          <p className="text-sm opacity-80 mb-7 relative">무료 가입 후 영어 레벨을 선택하고 팀원을 찾아보세요</p>
          <div className="flex items-center justify-center gap-3 relative">
            <Link href="/auth/signup" className="px-7 py-3 bg-white text-accent text-sm font-extrabold rounded-xl hover:bg-gray-50 transition-colors shadow">
              무료 가입하기
            </Link>
            <Link href="/rooms/new" className="px-7 py-3 border-2 border-white text-white text-sm font-bold rounded-xl hover:bg-white/10 transition-colors">
              방 만들기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
