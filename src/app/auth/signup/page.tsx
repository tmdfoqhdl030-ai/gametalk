"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { EnglishLevel, LEVEL_LABELS } from "@/types";

const LEVELS: EnglishLevel[] = ["beginner", "intermediate", "advanced"];

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
    nickname: "",
    english_level: "beginner" as EnglishLevel,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const json = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(json.error ?? "오류가 발생했습니다.");
      return;
    }

    router.push("/?welcome=1");
    router.refresh();
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-extrabold text-accent">게임<span className="text-gray-900">톡</span></Link>
          <p className="text-sm text-gray-400 mt-2">게임하면서 자연스럽게 영어 실력 UP</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">이메일 *</label>
              <input
                type="email"
                required
                placeholder="example@gmail.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">비밀번호 * (6자 이상)</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">닉네임 *</label>
              <input
                type="text"
                required
                maxLength={20}
                placeholder="게임에서 쓰는 닉네임"
                value={form.nickname}
                onChange={(e) => setForm({ ...form, nickname: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">현재 영어 레벨 *</label>
              <div className="grid grid-cols-3 gap-2">
                {LEVELS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setForm({ ...form, english_level: l })}
                    className={`py-2 rounded-lg text-xs font-medium border transition-all ${
                      form.english_level === l
                        ? "bg-accent text-white border-accent font-bold"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:border-accent hover:text-accent"
                    }`}
                  >
                    {LEVEL_LABELS[l]}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <Button type="submit" loading={loading} className="w-full justify-center py-2.5">
              무료 가입하기
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-4">
          이미 계정이 있으신가요?{" "}
          <Link href="/auth/login" className="text-accent font-bold hover:underline">로그인</Link>
        </p>
      </div>
    </div>
  );
}
