"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const supabase = createClient();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    });

    if (signInError) {
      setLoading(false);
      // 에러 종류에 따라 구체적인 메시지 표시
      if (signInError.message.includes("Email not confirmed")) {
        setError("이메일 인증이 필요합니다. 가입 시 받은 인증 메일을 확인해주세요.");
      } else if (signInError.message.includes("Invalid login credentials")) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다. 회원가입을 먼저 해주세요.");
      } else {
        setError(`로그인 실패: ${signInError.message}`);
      }
      return;
    }

    if (!data.session) {
      setLoading(false);
      setError("세션을 가져오지 못했습니다. 다시 시도해주세요.");
      return;
    }

    // Hard redirect — full page reload so server picks up the new session cookie
    window.location.href = next;
  }



  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-extrabold text-accent">게임<span className="text-gray-900">스피킹</span></Link>
          <p className="text-sm text-gray-400 mt-2">로그인하고 게임방에 참여하세요</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              required
              placeholder="이메일"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
            />
            <input
              type="password"
              required
              placeholder="비밀번호"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
            />

            {/* 에러 메시지 */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-600 font-medium">{error}</p>
              </div>
            )}

            <Button type="submit" loading={loading} className="w-full justify-center py-2.5">
              로그인
            </Button>
          </form>


        </div>

        <p className="text-center text-sm text-gray-400 mt-4">
          계정이 없으신가요?{" "}
          <Link href="/auth/signup" className="text-accent font-bold hover:underline">무료 가입</Link>
        </p>
        <p className="text-center text-xs text-gray-400 mt-2">
          <Link href="/auth/reset-password" className="hover:underline hover:text-gray-600">비밀번호를 잊으셨나요?</Link>
        </p>
      </div>
    </div>
  );
}
