import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  const game = searchParams.get("game");
  const level = searchParams.get("level");

  let query = supabase
    .from("rooms")
    .select(`
      *,
      host:users!rooms_host_id_fkey(id, nickname, english_level),
      member_count:room_members(count)
    `)
    .neq("status", "closed")
    .order("created_at", { ascending: false });

  if (game) query = query.eq("game", game);
  if (level) query = query.eq("english_level", level);

  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rooms = data?.map((r) => ({
    ...r,
    member_count: (r.member_count as unknown as { count: number }[])?.[0]?.count ?? 0,
  }));

  return NextResponse.json({ rooms });
}

const GAME_EMOJI: Record<string, string> = { pubg: "🪖", lol: "⚔️", overwatch: "🎯" };

async function createDiscordVoiceChannel(
  title: string,
  game: string,
  max_players: number
): Promise<string | null> {
  const token = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;
  if (!token || !guildId) return null;

  try {
    const channelRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
      method: "POST",
      headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${GAME_EMOJI[game] ?? "🎮"} ${title}`,
        type: 2,
        user_limit: max_players,
      }),
    });
    if (!channelRes.ok) return null;

    const channel = await channelRes.json();

    const inviteRes = await fetch(`https://discord.com/api/v10/channels/${channel.id}/invites`, {
      method: "POST",
      headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ max_age: 86400, max_uses: max_players }),
    });
    if (!inviteRes.ok) return null;

    const invite = await inviteRes.json();
    return `https://discord.gg/${invite.code}`;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, game, max_players, english_level } = body;

  if (!title || !game || !max_players || !english_level) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data: room, error } = await supabase
    .from("rooms")
    .insert({ title, game, max_players, english_level, host_id: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.from("room_members").insert({ room_id: room.id, user_id: user.id });

  const discordInvite = await createDiscordVoiceChannel(title, game, max_players);
  if (discordInvite) {
    await supabase.from("rooms").update({ discord_invite: discordInvite }).eq("id", room.id);
    room.discord_invite = discordInvite;
  }

  return NextResponse.json({ room }, { status: 201 });
}
