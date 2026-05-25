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

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, game, max_players, english_level, discord_invite } = body;

  if (!title || !game || !max_players || !english_level) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { data: room, error } = await supabase
    .from("rooms")
    .insert({ title, game, max_players, english_level, discord_invite, host_id: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // host automatically joins the room
  await supabase.from("room_members").insert({ room_id: room.id, user_id: user.id });

  return NextResponse.json({ room }, { status: 201 });
}
