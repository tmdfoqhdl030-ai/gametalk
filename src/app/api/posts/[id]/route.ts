import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface Params { params: Promise<{ id: string }> }

// GET /api/posts/[id]  — 조회수도 같이 증가
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();

  // 조회수 증가 (RPC)
  await supabase.rpc("increment_post_view", { p_post_id: id });

  const { data, error } = await supabase
    .from("posts")
    .select(`*, author:users!posts_user_id_fkey(id, nickname, avatar_animal, english_level)`)
    .eq("id", id)
    .single();

  if (error || !data) return NextResponse.json({ error: "게시글을 찾을 수 없습니다" }, { status: 404 });
  return NextResponse.json({ post: data });
}

// PATCH /api/posts/[id]  — 좋아요 토글
export async function PATCH(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });

  // 이미 좋아요 눌렀는지 확인
  const { data: existing } = await supabase
    .from("post_likes")
    .select("id")
    .eq("post_id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("post_likes").delete().eq("id", existing.id);
  } else {
    await supabase.from("post_likes").insert({ post_id: id, user_id: user.id });
  }

  // post_likes 실제 카운트로 동기화 (race condition 방지)
  const { count } = await supabase
    .from("post_likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", id);

  const newCount = count ?? 0;
  await supabase.from("posts").update({ like_count: newCount }).eq("id", id);

  return NextResponse.json({ liked: !existing, like_count: newCount });
}
