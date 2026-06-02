import { createClient, createAdminClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// 방장이 특정 유저를 강퇴
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
  if (targetUserId === user.id) {
    return NextResponse.json({ error: "Cannot kick yourself" }, { status: 400 });
  }

  // RLS 우회해서 강퇴
  const admin = createAdminClient();
  const { error } = await admin
    .from("room_members")
    .delete()
    .eq("room_id", room_id)
    .eq("user_id", targetUserId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
