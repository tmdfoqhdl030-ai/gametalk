"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PostCategory, POST_CATEGORY_LABELS } from "@/types";

const CATEGORIES: { key: PostCategory; label: string }[] = [
  { key: "free",    label: "💬 자유" },
  { key: "tip",     label: "💡 팁공유" },
  { key: "english", label: "📚 영어공부" },
  { key: "recruit", label: "🎮 팀원구함" },
  { key: "chat",    label: "☕ 잡담" },
];

export default function NewPostPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<PostCategory>("free");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.replace("/auth/login?next=/community/new");
      } else {
        setLoggedIn(true);
      }
    });
  }, []);

  if (loggedIn === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setError("제목과 내용을 모두 입력해주세요.");
      return;
    }
    setLoading(true);
    setError("");

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, category }),
    });

    const json = await res.json();
    if (!res.ok) {
      setError(json.error ?? "오류가 발생했습니다.");
      setLoading(false);
      return;
    }

    router.push(`/community/${json.post.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold text-gray-900">✏️ 글쓰기</h1>
        <p className="text-sm text-gray-400 mt-1">자유게시판에 글을 작성합니다.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 카테고리 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">카테고리</label>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                className={`px-3.5 py-1.5 text-sm font-bold rounded-lg border transition-colors ${
                  category === c.key
                    ? "bg-accent text-white border-accent"
                    : "bg-white text-gray-500 border-gray-200 hover:border-accent hover:text-accent"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* 제목 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">제목</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목을 입력해주세요"
            maxLength={100}
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all"
          />
          <p className="text-right text-xs text-gray-400 mt-1">{title.length}/100</p>
        </div>

        {/* 내용 */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">내용</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="내용을 입력해주세요"
            rows={12}
            maxLength={5000}
            className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 transition-all resize-none"
          />
          <p className="text-right text-xs text-gray-400 mt-1">{content.length}/5000</p>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-3 border border-gray-200 text-sm font-bold text-gray-500 rounded-xl hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 bg-accent text-white text-sm font-bold rounded-xl hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {loading ? "등록 중..." : "게시하기"}
          </button>
        </div>
      </form>
    </div>
  );
}
