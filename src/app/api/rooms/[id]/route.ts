import { createClient } from "@/lib/supabase/server";
import { deleteDiscordChannel } from "@/lib/discord";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: room, error } = await supabase
    .from("rooms")
    .select(`
      *,
      host:users!rooms_host_id_fkey(id, nickname, english_level),
      room_members(user_id, joined_at, user:users(id, nickname, english_level))
    `)
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 404 });

  return NextResponse.json({ room });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { discord_invite, status } = body;

  const { data: room, error } = await supabase
    .from("rooms")
    .update({ discord_invite, status })
    .eq("id", id)
    .eq("host_id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 403 });

  return NextResponse.json({ room });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 닫기 전에 discord_invite(채널 ID) 먼저 조회
  const { data: room } = await supabase
    .from("rooms")
    .select("discord_invite")
    .eq("id", id)
    .eq("host_id", user.id)
    .single();

  const { error } = await supabase
    .from("rooms")
    .update({ status: "closed" })
    .eq("id", id)
    .eq("host_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 403 });

  if (room?.discord_invite) {
    await deleteDiscordChannel(room.discord_invite);
  }

  return NextResponse.json({ success: true });
}
