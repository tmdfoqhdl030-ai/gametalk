"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setError("오류가 발생했습니다. 링크가 만료됐을 수 있어요.");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-extrabold text-accent">게임<span className="text-gray-900">톡</span></Link>
          <p className="text-sm text-gray-400 mt-2">새 비밀번호 설정</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              required
              minLength={6}
              placeholder="새 비밀번호 (6자 이상)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent transition-colors"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <Button type="submit" loading={loading} className="w-full justify-center py-2.5">
              비밀번호 변경
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
