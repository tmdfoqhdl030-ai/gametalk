import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Post, PostCategory, POST_CATEGORY_LABELS, POST_CATEGORY_COLORS } from "@/types";
import AnimalAvatar from "@/components/AnimalAvatar";

interface PageProps {
  searchParams: Promise<{ category?: string }>;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return new Date(dateStr).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" });
}

const CATEGORIES: { key: string; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "free", label: "자유" },
  { key: "tip", label: "팁공유" },
  { key: "english", label: "영어공부" },
  { key: "recruit", label: "팀원구함" },
  { key: "chat", label: "잡담" },
];

async function PostList({ category }: { category?: string }) {
  const supabase = await createClient();

  let query = supabase
    .from("posts")
    .select(`*, author:users!posts_user_id_fkey(id, nickname, avatar_animal, english_level)`)
    .order("created_at", { ascending: false })
    .limit(30);

  if (category && category !== "all") {
    query = query.eq("category", category as PostCategory);
  }

  const { data, error } = await query;
  const posts = (data ?? []) as (Post & { author: { id: string; nickname: string; avatar_animal: string; english_level: string } | null })[];

  if (error) return <p className="text-sm text-red-500 py-4">게시글을 불러오지 못했습니다.</p>;

  if (posts.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-5xl mb-4">💬</p>
        <p className="text-base font-semibold text-gray-500">아직 게시글이 없습니다</p>
        <p className="text-sm mt-1 mb-5">첫 번째 글을 작성해보세요!</p>
        <Link href="/community/new" className="inline-block px-5 py-2.5 bg-accent text-white text-sm font-bold rounded-lg hover:bg-accent-hover transition-colors">
          ✏️ 글쓰기
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="divide-y divide-gray-100">
        {posts.map((post) => (
          <Link key={post.id} href={`/community/${post.id}`}>
            <div className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors group">
              {/* 카테고리 */}
              <span className={`hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0 ${POST_CATEGORY_COLORS[post.category]}`}>
                {POST_CATEGORY_LABELS[post.category]}
              </span>
              {/* 제목 */}
              <p className="flex-1 text-sm font-medium text-gray-900 group-hover:text-accent transition-colors truncate">
                {post.title}
              </p>
              {/* 작성자 */}
              <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                <AnimalAvatar animalId={post.author?.avatar_animal ?? "cat"} size="xs" />
                <span className="text-xs text-gray-400 max-w-[70px] truncate">{post.author?.nickname ?? "알 수 없음"}</span>
              </div>
              {/* 날짜/조회/좋아요 */}
              <div className="flex items-center gap-3 flex-shrink-0 text-xs text-gray-400">
                <span className="hidden md:block">{timeAgo(post.created_at)}</span>
                <span>👁 {post.view_count}</span>
                <span>❤️ {post.like_count}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default async function CommunityPage({ searchParams }: PageProps) {
  const { category } = await searchParams;
  const activeCategory = category ?? "all";

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">💬 자유게시판</h1>
          <p className="text-sm text-gray-400 mt-0.5">게임, 영어, 팀원 구인 — 자유롭게 이야기해요.</p>
        </div>
        <Link
          href="/community/new"
          className="px-4 py-2 bg-accent text-white text-sm font-bold rounded-lg hover:bg-accent-hover transition-colors"
        >
          ✏️ 글쓰기
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <Link
            key={c.key}
            href={c.key === "all" ? "/community" : `/community?category=${c.key}`}
            className={`px-3.5 py-1.5 text-sm font-bold rounded-lg flex-shrink-0 transition-colors ${
              activeCategory === c.key
                ? "bg-accent text-white"
                : "bg-white border border-gray-200 text-gray-500 hover:border-accent hover:text-accent"
            }`}
          >
            {c.label}
          </Link>
        ))}
      </div>

      {/* Post List */}
      <Suspense fallback={
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="px-5 py-4 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-3/4" />
            </div>
          ))}
        </div>
      }>
        <PostList category={activeCategory} />
      </Suspense>
    </div>
  );
}
