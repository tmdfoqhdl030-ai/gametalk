import Link from "next/link";

interface Notice {
  id: number;
  pinned?: boolean;
  category: string;
  categoryColor: string;
  title: string;
  date: string;
  content: string;
}

const NOTICES: Notice[] = [
  {
    id: 1,
    pinned: true,
    category: "서비스 공지",
    categoryColor: "bg-accent-light text-accent",
    title: "🎉 게임스피킹 정식 서비스 오픈!",
    date: "2026.05.01",
    content: `안녕하세요, 게임스피킹 팀입니다!

오늘부터 게임스피킹이 정식 서비스를 시작합니다. 🎮

게임스피킹은 한국 게이머들이 영어로 소통하는 팀원을 쉽게 찾을 수 있는 플랫폼입니다. 배틀그라운드, 리그오브레전드, 오버워치, 발로란트, 롤토체스 — 내가 즐기는 게임에서 영어로 대화할 팀원을 지금 바로 찾아보세요.

✅ 주요 기능
• 게임 / 영어 레벨별 팀원 모집 방 개설
• 실시간 채팅으로 게임 전 소통
• 디스코드 음성채널 자동 연결
• 매너 온도 시스템으로 신뢰 있는 커뮤니티

앞으로 더 많은 기능과 이벤트로 찾아오겠습니다. 많은 이용 부탁드립니다. 감사합니다! 🙏`,
  },
  {
    id: 2,
    pinned: true,
    category: "이용 규칙",
    categoryColor: "bg-red-100 text-red-700",
    title: "📋 커뮤니티 이용 규칙 및 매너 가이드",
    date: "2026.05.01",
    content: `게임스피킹을 즐겁고 건전하게 이용하기 위한 규칙을 안내드립니다.

🚫 금지 행위
• 욕설, 비하, 혐오 표현 사용
• 다른 유저에 대한 허위 신고 또는 악의적 신고
• 개인정보 수집 / 스팸 메시지 발송
• 게임 핵 / 불법 프로그램 관련 내용 공유

⭐ 매너 온도 시스템
비매너 행동으로 신고가 접수·처리되면 매너 온도가 하락합니다. 매너 온도가 지속적으로 낮아지면 서비스 이용이 제한될 수 있습니다.

📮 신고 방법
비매너 유저를 발견하면 방 상세 페이지에서 신고 버튼을 이용해주세요. 운영팀이 24시간 이내 검토합니다.

건강한 커뮤니티를 함께 만들어나가요! 💪`,
  },
  {
    id: 3,
    category: "업데이트",
    categoryColor: "bg-blue-100 text-blue-700",
    title: "🔧 v1.2 업데이트 — 발로란트·롤토체스 추가 / 프로필 아바타",
    date: "2026.05.20",
    content: `v1.2 업데이트 내역을 안내드립니다.

✨ 신규 기능
• 발로란트 / 롤토체스(TFT) 게임 지원 추가
• 동물 아바타 프로필 시스템 도입 (고양이, 강아지 등 20종)
• 프로필 페이지 리뉴얼 (MBTI, 선호 게임, 영어 레벨 표시)
• 자유게시판 오픈

🛠️ 개선 사항
• 방 목록 로딩 속도 개선
• 모바일 UI 최적화
• 채팅 메시지 실시간 반응성 향상

🐛 버그 수정
• 방 참여 후 멤버 수 미반영 이슈 수정
• 로그아웃 후 새로고침 시 오류 수정`,
  },
  {
    id: 4,
    category: "업데이트",
    categoryColor: "bg-blue-100 text-blue-700",
    title: "🎮 디스코드 음성채널 자동 생성 기능 오픈",
    date: "2026.05.15",
    content: `이제 게임스피킹에서 방을 만들면 디스코드 음성채널이 자동으로 생성됩니다!

🔗 작동 방식
1. 웹에서 "방 만들기" 클릭
2. 게임스피킹 봇이 디스코드 서버에 전용 음성채널 자동 생성
3. 방 상세 페이지에 디스코드 초대링크 자동 표시
4. 팀원들이 초대링크로 바로 입장

기존에 Discord 링크를 직접 입력해야 했던 불편함이 해소됩니다. 더 빠르고 편하게 팀원을 모아 게임을 시작하세요! 🚀`,
  },
  {
    id: 5,
    category: "안내",
    categoryColor: "bg-yellow-100 text-yellow-700",
    title: "🌡️ 매너 온도 시스템 도입 안내",
    date: "2026.05.10",
    content: `게임스피킹에 매너 온도 시스템이 도입됩니다.

🌡️ 매너 온도란?
당근마켓의 매너 온도와 유사한 시스템으로, 커뮤니티 내 신뢰도를 수치화한 지표입니다. 기본값은 36.5°C이며, 비매너 행동 신고 처리 시 하락합니다.

📈 온도가 높아지려면?
• 현재는 신고 처리로만 하락하며, 추후 긍정적 평가 시스템을 통해 상승 기능도 추가할 예정입니다.

⚠️ 제재 기준
• 30°C 미만 : 경고
• 20°C 미만 : 일시 정지
• 10°C 미만 : 영구 정지 검토

건강한 게임 문화를 함께 만들어 주세요!`,
  },
];

export default function NoticesPage() {
  const pinned = NOTICES.filter((n) => n.pinned);
  const regular = NOTICES.filter((n) => !n.pinned);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">📢 공지사항</h1>
        <p className="text-sm text-gray-400 mt-1">게임스피킹의 주요 공지 및 업데이트 내역을 확인하세요.</p>
      </div>

      {/* Pinned */}
      <div className="mb-2">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">📌 고정 공지</p>
        <div className="space-y-2">
          {pinned.map((n) => (
            <NoticeItem key={n.id} notice={n} />
          ))}
        </div>
      </div>

      <div className="my-6 border-t border-gray-100" />

      {/* Regular */}
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">📋 전체 공지</p>
        <div className="space-y-2">
          {regular.map((n) => (
            <NoticeItem key={n.id} notice={n} />
          ))}
        </div>
      </div>

      <div className="mt-12 text-center text-xs text-gray-300">
        문의사항은{" "}
        <a href="mailto:tmdfoqhdl@naver.com" className="underline hover:text-accent transition-colors">
          tmdfoqhdl@naver.com
        </a>
        으로 보내주세요.
      </div>
    </div>
  );
}

function NoticeItem({ notice }: { notice: Notice }) {
  return (
    <details className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-accent/40 transition-colors">
      <summary className="flex items-center gap-3 px-5 py-4 cursor-pointer list-none">
        {notice.pinned && (
          <span className="text-[10px] font-black text-accent bg-accent-light px-1.5 py-0.5 rounded flex-shrink-0">
            고정
          </span>
        )}
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0 ${notice.categoryColor}`}>
          {notice.category}
        </span>
        <span className="flex-1 text-sm font-bold text-gray-900 group-open:text-accent transition-colors">
          {notice.title}
        </span>
        <span className="text-xs text-gray-400 flex-shrink-0">{notice.date}</span>
        <svg
          className="w-4 h-4 text-gray-400 flex-shrink-0 transition-transform group-open:rotate-180"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="px-5 pb-5 pt-1 border-t border-gray-100">
        <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
          {notice.content}
        </pre>
      </div>
    </details>
  );
}
