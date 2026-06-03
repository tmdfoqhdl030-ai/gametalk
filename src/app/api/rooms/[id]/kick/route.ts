import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: room_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const targetUserId: string | undefined = body?.target_user_id;

  if (!targetUserId) {
    return NextResponse.json({ error: "target_user_id required" }, { status: 400 });
  }
  if (targetUserId === user.id) {
    return NextResponse.json({ error: "Cannot kick yourself" }, { status: 400 });
  }

  // 방장 여부 확인
  const { data: room } = await supabase
    .from("rooms")
    .select("host_id")
    .eq("id", room_id)
    .single();

  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  if (room.host_id !== user.id) {
    return NextResponse.json({ error: "Only host can kick members" }, { status: 403 });
  }

  // Supabase REST API 직접 호출 (RLS 완전 우회, 라이브러리 의존 없음)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const deleteRes = await fetch(
    `${supabaseUrl}/rest/v1/room_members?room_id=eq.${room_id}&user_id=eq.${targetUserId}`,
    {
      method: "DELETE",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!deleteRes.ok) {
    const errText = await deleteRes.text();
    return NextResponse.json({ error: `DB 오류: ${errText}` }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
