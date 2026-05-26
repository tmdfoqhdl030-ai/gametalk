import { createClient } from "@/lib/supabase/server";
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

  // discord_invite로 Discord 채널 삭제
  const discordInvite = room?.discord_invite;
  if (discordInvite) {
    let channelId: string | null = null;

    if (/^\d+$/.test(discordInvite)) {
      channelId = discordInvite;
    } else {
      const inviteCode = discordInvite.split("discord.gg/")[1]?.split("/")[0];
      if (inviteCode) {
        const res = await fetch(`https://discord.com/api/v10/invites/${inviteCode}`, {
          headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
        }).catch(() => null);
        if (res?.ok) {
          const data = await res.json();
          channelId = data?.channel?.id ?? null;
        }
      }
    }

    if (channelId) {
      await fetch(`https://discord.com/api/v10/channels/${channelId}`, {
        method: "DELETE",
        headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
      }).catch(() => null);
    }
  }

  return NextResponse.json({ success: true });
}
