import Link from "next/link";

// 현재 날짜 기준 D-day 계산
function getDday(endDateStr: string): string {
  const end = new Date(endDateStr);
  const now = new Date("2026-05-30");
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diff < 0) return "종료";
  if (diff === 0) return "D-Day";
  return `D-${diff}`;
}

const CURRENT_EVENT = {
  title: "이번 주 MVP 방장 이벤트 🏆",
  period: "2026.05.26 (월) ~ 2026.06.01 (일)",
  endDate: "2026-06-01",
  description:
    "이번 주 가장 많은 팀원을 모집한 방장 TOP 3를 선정합니다! 방을 만들고 팀원을 채워 MVP 방장에 도전하세요.",
  prizes: [
    { rank: "🥇 1등", name: "쿠팡 상품권", amount: "10,000원" },
    { rank: "🥈 2등", name: "쿠팡 상품권", amount: "5,000원" },
    { rank: "🥉 3등", name: "쿠팡 상품권", amount: "3,000원" },
  ],
  rules: [
    "5/26(월) 00:00 ~ 6/1(일) 23:59 사이 개설된 방만 집계",
    "방이 가득 찬(full) 횟수 기준으로 집계",
    "동점 시 먼저 달성한 유저가 우선",
    "비매너 신고 처리된 방은 집계 제외",
    "당첨자는 6/2(화) 공지사항 및 이메일로 개별 안내",
  ],
};

const PAST_EVENTS = [
  {
    id: 2,
    title: "영어 회화 챌린지 이벤트",
    period: "2026.05.12 ~ 2026.05.18",
    badge: "종료",
    description: "채팅에서 영어 문장을 가장 많이 보낸 유저에게 스타벅스 기프티콘 증정. 총 47명 참여 완료!",
    winner: "우승자: 닉네임 HeroGamer🎉",
  },
  {
    id: 1,
    title: "첫 가입 인증 이벤트",
    period: "2026.05.01 ~ 2026.05.11",
    badge: "종료",
    description: "정식 오픈 기념으로 첫 100명 가입자 전원에게 카카오페이 1,000원 증정 이벤트. 조기 마감!",
    winner: "총 100명 당첨 완료",
  },
];

// 현재 이벤트 가상 순위 (데이터 없으므로 더미)
const LEADERBOARD = [
  { rank: 1, nickname: "ProGamer_KR", count: 12, game: "배그" },
  { rank: 2, nickname: "영어천재_롤", count: 9, game: "롤" },
  { rank: 3, nickname: "Valorant_Ace", count: 7, game: "발로란트" },
  { rank: 4, nickname: "TFT마스터", count: 6, game: "롤토체스" },
  { rank: 5, nickname: "OW_신화", count: 5, game: "오버워치" },
];

export default function EventsPage() {
  const dday = getDday(CURRENT_EVENT.endDate);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">🏆 주간 이벤트</h1>
        <p className="text-sm text-gray-400 mt-1">매주 새로운 이벤트가 진행됩니다. 참여하고 상품을 받아가세요!</p>
      </div>

      {/* Current Event Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-accent to-blue-600 rounded-3xl p-8 text-white shadow-lg">
        <div className="absolute top-4 right-4">
          <span className={`text-sm font-black px-3 py-1.5 rounded-xl ${dday === "종료" ? "bg-white/20" : "bg-yellow-400 text-yellow-900"}`}>
            {dday}
          </span>
        </div>
        <p className="text-xs font-bold opacity-70 uppercase tracking-widest mb-2">🔴 진행 중</p>
        <h2 className="text-2xl font-extrabold mb-1">{CURRENT_EVENT.title}</h2>
        <p className="text-sm opacity-80 mb-5">{CURRENT_EVENT.period}</p>
        <p className="text-sm leading-relaxed opacity-90 mb-7">{CURRENT_EVENT.description}</p>

        {/* Prizes */}
        <div className="flex gap-3 mb-7">
          {CURRENT_EVENT.prizes.map((p) => (
            <div key={p.rank} className="flex-1 bg-white/15 backdrop-blur rounded-2xl p-4 text-center">
              <p className="text-lg font-black">{p.rank}</p>
              <p className="text-xs opacity-80 mt-1">{p.name}</p>
              <p className="text-base font-extrabold mt-0.5">{p.amount}</p>
            </div>
          ))}
        </div>

        <Link
          href="/rooms/new"
          className="inline-block px-6 py-3 bg-white text-accent text-sm font-extrabold rounded-xl hover:bg-gray-50 transition-colors shadow"
        >
          지금 방 만들러 가기 →
        </Link>
      </div>

      {/* Leaderboard */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-gray-900">🏅 이번 주 현황 순위</h3>
          <span className="text-xs text-gray-400">매 시간 업데이트</span>
        </div>
        <div className="divide-y divide-gray-50">
          {LEADERBOARD.map((u) => (
            <div key={u.rank} className={`flex items-center gap-4 px-6 py-3.5 ${u.rank <= 3 ? "bg-yellow-50/50" : ""}`}>
              <span className={`w-7 h-7 flex items-center justify-center text-sm font-black rounded-full flex-shrink-0
                ${u.rank === 1 ? "bg-yellow-400 text-white" : u.rank === 2 ? "bg-gray-300 text-white" : u.rank === 3 ? "bg-orange-300 text-white" : "bg-gray-100 text-gray-500"}`}>
                {u.rank}
              </span>
              <span className="flex-1 text-sm font-bold text-gray-900">{u.nickname}</span>
              <span className="text-xs text-gray-400">{u.game}</span>
              <span className="text-sm font-extrabold text-accent">{u.count}회</span>
            </div>
          ))}
        </div>
        <div className="px-6 py-3 bg-gray-50 text-xs text-gray-400 text-center">
          ※ 순위는 참고용 더미 데이터입니다. 실제 집계는 이벤트 종료 후 공지됩니다.
        </div>
      </div>

      {/* Rules */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
        <h3 className="text-sm font-extrabold text-gray-900 mb-4">📌 이벤트 참여 방법 & 유의 사항</h3>
        <ol className="space-y-2">
          {CURRENT_EVENT.rules.map((rule, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center bg-accent text-white text-[10px] font-black rounded-full mt-0.5">
                {i + 1}
              </span>
              {rule}
            </li>
          ))}
        </ol>
      </div>

      {/* Past Events */}
      <div>
        <h3 className="text-sm font-extrabold text-gray-500 uppercase tracking-widest mb-4">📁 지난 이벤트</h3>
        <div className="space-y-3">
          {PAST_EVENTS.map((e) => (
            <div key={e.id} className="bg-white border border-gray-200 rounded-2xl p-5 opacity-70">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold px-2 py-0.5 bg-gray-100 text-gray-500 rounded">{e.badge}</span>
                <h4 className="text-sm font-bold text-gray-700">{e.title}</h4>
              </div>
              <p className="text-xs text-gray-400 mb-2">{e.period}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{e.description}</p>
              <p className="text-xs font-bold text-accent mt-2">{e.winner}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
