import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "이용약관 — 게임스피킹",
};

export default function TermsPage() {
  const updated = "2026년 5월 31일";

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <Link href="/" className="text-sm text-gray-400 hover:text-accent transition-colors">← 홈으로</Link>
        <h1 className="text-3xl font-extrabold text-gray-900 mt-4">이용약관</h1>
        <p className="text-sm text-gray-400 mt-2">최종 업데이트: {updated} · 시행일: 2026년 6월 1일</p>
      </div>

      <div className="space-y-8 text-gray-700 leading-relaxed text-sm">

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">제1조 (목적)</h2>
          <p>
            본 약관은 게임스피킹(이하 "서비스")이 제공하는 게임 팀원 모집 및 커뮤니티 서비스의 이용 조건 및 절차에 관한 사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">제2조 (정의)</h2>
          <ul className="space-y-2">
            <li><span className="font-bold">"서비스"</span>: 게임스피킹이 제공하는 웹사이트 및 제반 서비스</li>
            <li><span className="font-bold">"회원"</span>: 본 약관에 동의하고 서비스에 가입한 자</li>
            <li><span className="font-bold">"방"</span>: 게임 팀원 모집을 위해 생성되는 모집 공간</li>
            <li><span className="font-bold">"게시물"</span>: 회원이 서비스 내에 작성한 텍스트, 이미지 등 일체의 콘텐츠</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">제3조 (약관의 효력 및 변경)</h2>
          <p>
            본 약관은 서비스 내 공지를 통해 효력이 발생합니다. 서비스는 합리적인 사유가 있을 경우 관련 법령을 위반하지 않는 범위 내에서 약관을 변경할 수 있으며, 변경 7일 전 공지합니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">제4조 (회원 가입)</h2>
          <ol className="list-decimal list-inside space-y-2">
            <li>만 14세 이상인 자는 회원으로 가입할 수 있습니다.</li>
            <li>회원은 정확한 정보를 입력해야 하며, 허위 정보 제공으로 인한 불이익은 회원 본인에게 귀속됩니다.</li>
            <li>타인의 정보를 무단 사용하거나 부정한 방법으로 가입한 경우 계정이 즉시 삭제될 수 있습니다.</li>
          </ol>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">제5조 (서비스 이용)</h2>
          <p className="mb-3">회원은 서비스를 이용함에 있어 다음 행위를 금지합니다.</p>
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 space-y-2">
            {[
              "타인을 비방·모욕·혐오하는 발언",
              "스팸, 광고성 게시물 반복 작성",
              "성적 수치심을 유발하는 콘텐츠 게시",
              "타인의 개인정보 무단 수집·공유",
              "서비스 시스템을 악용하거나 방해하는 행위",
              "허위 신고 남용",
              "사기, 기망 등 부당한 행위",
            ].map((item) => (
              <p key={item} className="flex items-start gap-2 text-red-700">
                <span className="shrink-0 mt-0.5">❌</span>
                <span>{item}</span>
              </p>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">제6조 (매너 시스템 및 제재)</h2>
          <p className="mb-3">
            서비스는 건전한 커뮤니티 유지를 위해 매너 온도 시스템을 운영합니다.
          </p>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
            <p>• 비매너 신고 누적 시 매너 온도 하락</p>
            <p>• 운영자 확인 후 경고 → 일시 정지(24시간~) → 영구 정지 순으로 제재</p>
            <p>• 영구 정지 계정은 동일 이메일로 재가입이 제한될 수 있습니다</p>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">제7조 (게시물 저작권)</h2>
          <p>
            회원이 서비스 내에 게시한 콘텐츠에 대한 저작권은 해당 회원에게 있습니다.
            단, 서비스는 서비스 운영·개선·홍보 목적으로 해당 콘텐츠를 무상으로 이용할 수 있습니다.
            위법·불건전한 게시물은 사전 통보 없이 삭제될 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">제8조 (서비스 중단)</h2>
          <p>
            서비스는 시스템 점검, 서버 장애, 천재지변 등 불가피한 사유로 서비스 제공이 일시 중단될 수 있습니다.
            서비스 중단으로 인한 손해에 대해 서비스는 고의·중과실이 없는 한 책임을 지지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">제9조 (면책 조항)</h2>
          <p>
            서비스는 회원 간 거래·대화·팀플레이 등에서 발생한 분쟁에 대해 중개자로서 관여하지 않으며 책임을 부담하지 않습니다.
            서비스는 게임 내 결과, 디스코드 연결 이후 발생하는 문제에 대해 책임을 지지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">제10조 (준거법 및 관할)</h2>
          <p>
            본 약관은 대한민국 법령을 준거법으로 하며, 서비스와 회원 간 분쟁이 발생할 경우 서울중앙지방법원을 제1심 관할 법원으로 합니다.
          </p>
        </section>

        <div className="mt-10 p-4 bg-accent-light rounded-xl text-sm text-accent font-medium">
          📧 약관 관련 문의: <strong>contact@gametalk.gg</strong>
        </div>

      </div>
    </div>
  );
}
