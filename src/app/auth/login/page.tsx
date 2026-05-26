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

    const { error } = await supabase.auth.signInWithPassword(form);
    setLoading(false);

    if (error) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-extrabold text-accent">게임<span className="text-gray-900">톡</span></Link>
          <p className="text-sm text-gray-400 mt-2">로그인하고 게임방에 참여하세요</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
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
            {error && <p className="text-xs text-red-500">{error}</p>}
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
