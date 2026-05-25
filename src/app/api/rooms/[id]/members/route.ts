import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Join a room
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: room_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: room } = await supabase
    .from("rooms")
    .select("status")
    .eq("id", room_id)
    .single();

  if (!room) return NextResponse.json({ error: "Room not found" }, { status: 404 });
  if (room.status === "full") return NextResponse.json({ error: "Room is full" }, { status: 409 });
  if (room.status === "closed") return NextResponse.json({ error: "Room is closed" }, { status: 410 });

  const { error } = await supabase
    .from("room_members")
    .insert({ room_id, user_id: user.id });

  if (error) {
    if (error.code === "23505") return NextResponse.json({ error: "Already joined" }, { status: 409 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 201 });
}

// Leave a room
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: room_id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabase
    .from("room_members")
    .delete()
    .eq("room_id", room_id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If host left, transfer to next member
  const { data: room } = await supabase
    .from("rooms")
    .select("host_id")
    .eq("id", room_id)
    .single();

  if (room?.host_id === user.id) {
    const { data: nextMember } = await supabase
      .from("room_members")
      .select("user_id")
      .eq("room_id", room_id)
      .order("joined_at")
      .limit(1)
      .single();

    if (nextMember) {
      await supabase.from("rooms").update({ host_id: nextMember.user_id }).eq("id", room_id);
    } else {
      await supabase.from("rooms").update({ status: "closed" }).eq("id", room_id);
    }
  }

  return NextResponse.json({ success: true });
}
