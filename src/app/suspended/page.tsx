import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function SuspendedPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let suspendedUntil: string | null = null;
  let isPermanent = false;

  if (user) {
    const { data } = await supabase
      .from("users")
      .select("suspended_until")
      .eq("id", user.id)
      .single();

    if (data?.suspended_until) {
      const until = new Date(data.suspended_until);
      isPermanent = until.getFullYear() === 9999;
      suspendedUntil = isPermanent
        ? "영구 정지"
        : until.toLocaleString("ko-KR", {
            year: "numeric", month: "long", day: "numeric",
            hour: "2-digit", minute: "2-digit",
          });
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🔒</div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">계정이 정지되었습니다</h1>
        <p className="text-sm text-gray-500 mb-4 leading-relaxed">
          비매너 행동으로 인해 계정이 일시 정지되었습니다.<br />
          이의가 있는 경우 문의 이메일로 연락해 주세요.
        </p>
        {suspendedUntil && (
          <div className="inline-block px-4 py-2 bg-red-50 border border-red-200 rounded-xl mb-8">
            <p className="text-sm text-red-600 font-bold">
              {isPermanent ? "영구 정지 계정" : `정지 해제일: ${suspendedUntil}`}
            </p>
          </div>
        )}
        <div className="flex items-center justify-center gap-3">
          <a
            href="mailto:tmdfoqhdl@naver.com"
            className="px-6 py-3 bg-accent text-white text-sm font-bold rounded-xl hover:bg-accent-hover transition-colors"
          >
            📧 이의 제기
          </a>
          <Link
            href="/"
            className="px-6 py-3 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:border-accent hover:text-accent transition-colors"
          >
            🏠 홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}
