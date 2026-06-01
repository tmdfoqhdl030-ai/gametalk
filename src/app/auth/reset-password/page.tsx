"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    setLoading(false);

    if (error) {
      setError("오류가 발생했습니다. 이메일을 확인해주세요.");
      return;
    }

    setSent(true);
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-extrabold text-accent">게임<span className="text-gray-900">스피크</span></Link>
          <p className="text-sm text-gray-400 mt-2">비밀번호 재설정</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          {sent ? (
            <div className="text-center py-4">
              <p className="text-2xl mb-3">📧</p>
              <p className="text-sm font-bold text-gray-900 mb-1">이메일을 보냈어요!</p>
              <p className="text-xs text-gray-400">{email} 로 재설정 링크를 보냈습니다. 메일함을 확인해주세요.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-gray-500">가입한 이메일 주소를 입력하면 비밀번호 재설정 링크를 보내드려요.</p>
              <input
                type="email"
                required
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <Button type="submit" loading={loading} className="w-full justify-center py-2.5">
                재설정 링크 보내기
              </Button>
            </form>
          )}
        </div>

        <p className="text-center text-sm text-gray-400 mt-4">
          <Link href="/auth/login" className="text-accent font-bold hover:underline">로그인으로 돌아가기</Link>
        </p>
      </div>
    </div>
  );
}
