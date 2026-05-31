import Link from "next/link";
import GameIcon from "@/components/GameIcon";
import { type Game } from "@/types";

const GAMES: { value: Game; label: string; desc: string }[] = [
  { value: "pubg",      label: "배틀그라운드",     desc: "PUBG: Battlegrounds" },
  { value: "lol",       label: "리그오브레전드",   desc: "League of Legends"   },
  { value: "overwatch", label: "오버워치 2",        desc: "Overwatch 2"         },
  { value: "valorant",  label: "발로란트",          desc: "Valorant"            },
  { value: "tft",       label: "롤토체스",          desc: "Teamfight Tactics"   },
];

export default function Footer() {
  return (
    <footer className="bg-[#111827] text-gray-400 mt-2">

      {/* ── 메인 푸터 ── */}
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

        {/* ── 브랜드 ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-white tracking-tight">게임스피킹</span>
          </div>
          <p className="text-sm leading-relaxed text-gray-400 max-w-xs">
            한국 게이머를 위한 영어 팀원 모집 플랫폼.<br />
            게임하면서 자연스럽게 영어 실력을 키워보세요.
          </p>

          {/* 지원 게임 */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">지원 게임</p>
            <div className="flex items-center gap-2 flex-wrap">
              {GAMES.map((g) => (
                <Link key={g.value} href={`/?game=${g.value}`}>
                  <span title={g.label} className="w-8 h-8 rounded-lg overflow-hidden hover:ring-2 hover:ring-[#3d7eff] transition-all block">
                    <GameIcon game={g.value} className="w-8 h-8" />
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* SNS */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">소셜</p>
            <div className="flex items-center gap-3">
              <a href="https://discord.gg" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[#5865F2]/20 border border-[#5865F2]/30 flex items-center justify-center hover:bg-[#5865F2]/40 transition-colors text-[#5865F2]">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.055a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors text-gray-300">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* ── 게임 ── */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white">게임</h3>
          <ul className="space-y-2.5">
            {GAMES.map((g) => (
              <li key={g.value}>
                <Link href={`/?game=${g.value}`}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group">
                  <GameIcon game={g.value} className="w-5 h-5 rounded" />
                  <span>{g.label}</span>
                  <span className="hidden group-hover:inline text-xs text-gray-500">{g.desc}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── 서비스 ── */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white">서비스</h3>
          <ul className="space-y-2.5 text-sm">
            {[
              { href: "/rooms/new",   label: "방 만들기",          badge: ""       },
              { href: "/",            label: "팀원 찾기",          badge: ""       },
              { href: "/?level=beginner",   label: "초급 방 모음",  badge: "🟢"   },
              { href: "/?level=intermediate", label: "중급 방 모음", badge: "🔵"  },
              { href: "/?level=advanced",   label: "고급 방 모음",  badge: "🔴"   },
              { href: "/auth/signup", label: "무료 가입",          badge: "FREE"   },
            ].map((item) => (
              <li key={item.href + item.label}>
                <Link href={item.href}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                  {item.label}
                  {item.badge && item.badge !== "FREE" && (
                    <span className="text-xs">{item.badge}</span>
                  )}
                  {item.badge === "FREE" && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#3d7eff]/20 text-[#3d7eff] border border-[#3d7eff]/30">FREE</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── 고객지원 ── */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white">고객지원</h3>
          <ul className="space-y-2.5 text-sm">
            {[
              { href: "/notices",  label: "공지사항"          },
              { href: "/terms",    label: "이용약관"           },
              { href: "/privacy",  label: "개인정보처리방침"   },
              { href: "mailto:tmdfoqhdl@naver.com", label: "이메일 문의" },
              { href: "https://discord.gg", label: "Discord 서버" },
            ].map((item) => (
              <li key={item.label}>
                <Link href={item.href}
                  className="text-gray-400 hover:text-white transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* 영어 레벨 안내 박스 */}
          <div className="mt-6 p-3 rounded-xl bg-white/5 border border-white/10 space-y-1.5">
            <p className="text-xs font-bold text-white">영어 레벨 안내</p>
            {[
              { color: "bg-green-400",  label: "초급", desc: "일상 표현 가능"   },
              { color: "bg-blue-400",   label: "중급", desc: "게임 전략 소통 가능" },
              { color: "bg-red-400",    label: "고급", desc: "자유롭게 대화 가능" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full shrink-0 ${l.color}`} />
                <span className="font-medium text-gray-300">{l.label}</span>
                <span className="text-gray-500">{l.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 구분선 ── */}
      <div className="border-t border-white/10" />

      {/* ── 하단 법적 정보 ── */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="text-xs text-gray-500 space-y-1.5 leading-relaxed">
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-semibold text-gray-400">게임스피킹 (GameSpeaking)</span>
              <span>|</span>
              <span>서비스 운영팀</span>
              <span>|</span>
              <span>이메일: tmdfoqhdl@naver.com</span>
            </p>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <Link href="/terms" className="hover:text-gray-300 transition-colors">이용약관</Link>
              <span>|</span>
              <Link href="/privacy" className="hover:text-gray-300 transition-colors">개인정보처리방침</Link>
            </p>
            <p>
              게임스피킹은 Riot Games, Blizzard Entertainment, Krafton과 공식 제휴 관계가 아닙니다.<br className="hidden sm:block" />
              각 게임의 상표 및 저작권은 해당 회사에 귀속됩니다.
            </p>
          </div>
          <p className="text-xs text-gray-600 shrink-0">
            © 2026 게임스피킹. All rights reserved.
          </p>
        </div>
      </div>

    </footer>
  );
}
