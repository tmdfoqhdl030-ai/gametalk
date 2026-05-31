import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Post, POST_CATEGORY_LABELS, POST_CATEGORY_COLORS } from "@/types";
import AnimalAvatar from "@/components/AnimalAvatar";
import LikeButton from "./LikeButton";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gametalk-six.vercel.app";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("posts").select("title, content").eq("id", id).single();
  if (!data) return {};
  const desc = data.content.slice(0, 100).replace(/\n/g, " ");
  const ogUrl = `${BASE_URL}/api/og?title=${encodeURIComponent(data.title)}&sub=${encodeURIComponent(desc)}`;
  return {
    title: data.title,
    description: desc,
    openGraph: { title: data.title, description: desc, images: [{ url: ogUrl, width: 1200, height: 630 }] },
    twitter: { card: "summary_large_image", title: data.title, images: [ogUrl] },
  };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "방금 전";
  if (mins < 60) return `${mins}분 전`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  return days < 7
    ? `${days}일 전`
    : new Date(dateStr).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // 조회수 증가 (서버에서 직접 RPC 호출)
  await supabase.rpc("increment_post_view", { p_post_id: id });

  const { data, error } = await supabase
    .from("posts")
    .select(`*, author:users!posts_user_id_fkey(id, nickname, avatar_animal, english_level)`)
    .eq("id", id)
    .single();

  if (error || !data) notFound();

  const post = data as Post & {
    author: { id: string; nickname: string; avatar_animal: string; english_level: string } | null;
  };

  const { data: { user: authUser } } = await supabase.auth.getUser();

  // 현재 유저가 이미 좋아요 눌렀는지 확인
  let initialLiked = false;
  if (authUser) {
    const { data: likeData } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", id)
      .eq("user_id", authUser.id)
      .maybeSingle();
    initialLiked = !!likeData;
  }

  // 같은 카테고리 다른 글 (최근 5개)
  const { data: related } = await supabase
    .from("posts")
    .select("id, title, created_at")
    .eq("category", post.category)
    .neq("id", id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 space-y-6">
      {/* Back */}
      <Link href="/community" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-accent transition-colors">
        ← 목록으로
      </Link>

      {/* Post */}
      <article className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${POST_CATEGORY_COLORS[post.category]}`}>
              {POST_CATEGORY_LABELS[post.category]}
            </span>
          </div>
          <h1 className="text-xl font-extrabold text-gray-900 leading-snug">{post.title}</h1>
          <div className="flex items-center gap-3 mt-3">
            <div className="flex items-center gap-2">
              <AnimalAvatar animalId={post.author?.avatar_animal ?? "cat"} size="sm" />
              <span className="text-sm font-bold text-gray-700">{post.author?.nickname ?? "알 수 없음"}</span>
            </div>
            <span className="text-xs text-gray-400">{timeAgo(post.created_at)}</span>
            <span className="ml-auto text-xs text-gray-400 flex items-center gap-2">
              <span>👁 {post.view_count}</span>
              <span>❤️ {post.like_count}</span>
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Like */}
        <div className="px-6 pb-6 flex justify-center">
          <LikeButton
            postId={id}
            initialCount={post.like_count}
            initialLiked={initialLiked}
            isLoggedIn={!!authUser}
          />
        </div>
      </article>

      {/* Related */}
      {related && related.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              같은 카테고리 다른 글
            </p>
          </div>
          <div className="divide-y divide-gray-50">
            {related.map((r) => (
              <Link key={r.id} href={`/community/${r.id}`}>
                <div className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors">
                  <p className="text-sm text-gray-700 hover:text-accent transition-colors truncate">{r.title}</p>
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-3">{timeAgo(r.created_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
