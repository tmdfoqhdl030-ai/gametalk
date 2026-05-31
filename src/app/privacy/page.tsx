import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "개인정보처리방침 — 게임스피킹",
};

export default function PrivacyPage() {
  const updated = "2026년 5월 31일";

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <Link href="/" className="text-sm text-gray-400 hover:text-accent transition-colors">← 홈으로</Link>
        <h1 className="text-3xl font-extrabold text-gray-900 mt-4">개인정보처리방침</h1>
        <p className="text-sm text-gray-400 mt-2">최종 업데이트: {updated}</p>
      </div>

      <div className="prose prose-sm max-w-none space-y-8 text-gray-700 leading-relaxed">

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">1. 개인정보처리방침 개요</h2>
          <p>
            게임스피킹(이하 "서비스")은 이용자의 개인정보를 소중히 여기며, 「개인정보 보호법」 및 관련 법령을 준수합니다.
            본 방침은 서비스가 수집·이용·보관·파기하는 개인정보의 처리에 관한 내용을 안내합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">2. 수집하는 개인정보 항목</h2>
          <div className="bg-gray-50 rounded-xl p-5 space-y-3 border border-gray-100">
            <div>
              <p className="font-bold text-gray-800 text-sm mb-1">필수 항목</p>
              <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                <li>이메일 주소 (회원가입 시)</li>
                <li>닉네임</li>
                <li>영어 레벨 선택 정보</li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm mb-1">선택 항목</p>
              <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                <li>나이, 성별, MBTI (프로필 설정 시)</li>
                <li>게임 티어 정보 (직접 입력)</li>
                <li>프로필 아바타 선택</li>
              </ul>
            </div>
            <div>
              <p className="font-bold text-gray-800 text-sm mb-1">자동 수집 항목</p>
              <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                <li>서비스 이용 기록, 방문 일시</li>
                <li>IP 주소 (Supabase 인프라를 통해 자동 처리)</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">3. 개인정보의 수집 및 이용 목적</h2>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>회원 가입 및 서비스 제공 (팀원 모집방 개설·참여)</li>
            <li>서비스 내 실시간 채팅 기능 제공</li>
            <li>비매너 신고 처리 및 서비스 운영·개선</li>
            <li>공지사항, 이벤트 안내</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">4. 개인정보의 보유 및 이용 기간</h2>
          <p className="text-sm">
            회원 탈퇴 시 즉시 파기를 원칙으로 합니다. 단, 관계 법령에 의해 보존이 필요한 경우 법령에 규정된 기간 동안 보관됩니다.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 mt-3 border border-gray-100 text-sm space-y-1">
            <p>• 소비자 불만 또는 분쟁 처리 기록: 3년 (전자상거래법)</p>
            <p>• 접속 로그: 3개월 (통신비밀보호법)</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">5. 개인정보의 제3자 제공</h2>
          <p className="text-sm">
            서비스는 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다.
            단, 다음의 경우에는 예외로 합니다.
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm mt-2">
            <li>법령에 따라 수사기관의 요청이 있는 경우</li>
            <li>이용자가 사전에 동의한 경우</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">6. 개인정보 처리 위탁</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 font-bold text-gray-700">수탁사</th>
                  <th className="text-left px-4 py-2 font-bold text-gray-700">위탁 업무</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 py-2">Supabase, Inc.</td>
                  <td className="px-4 py-2">데이터베이스 및 인증 서비스 운영</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">Vercel, Inc.</td>
                  <td className="px-4 py-2">웹 서버 호스팅</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">7. 이용자의 권리 및 행사 방법</h2>
          <p className="text-sm">
            이용자는 언제든지 자신의 개인정보를 조회·수정·삭제·처리 정지를 요청할 수 있습니다.
            마이페이지에서 직접 수정하거나, 아래 이메일로 요청하시면 지체 없이 처리합니다.
          </p>
          <div className="mt-3 px-4 py-3 bg-accent-light rounded-xl text-sm">
            📧 개인정보 처리 문의: <strong>tmdfoqhdl@naver.com</strong>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">8. 쿠키(Cookie) 사용</h2>
          <p className="text-sm">
            서비스는 로그인 세션 유지를 위해 쿠키를 사용합니다.
            브라우저 설정에서 쿠키 저장을 거부할 수 있으나, 일부 서비스 기능이 제한될 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">9. 개인정보 보호책임자</h2>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm space-y-1">
            <p><span className="font-bold">담당자:</span> 게임스피킹 운영팀</p>
            <p><span className="font-bold">이메일:</span> tmdfoqhdl@naver.com</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">10. 개인정보처리방침 변경</h2>
          <p className="text-sm">
            본 방침은 법령 변경 또는 서비스 정책 변경에 따라 사전 공지 후 수정될 수 있습니다.
            변경 사항은 공지사항 페이지와 서비스 내 알림을 통해 안내합니다.
          </p>
        </section>

      </div>
    </div>
  );
}
