import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { nickname, english_level, age, gender, mbti, favorite_games, avatar_animal } = body;

  const updates: Record<string, unknown> = {};
  if (nickname !== undefined) updates.nickname = nickname;
  if (english_level !== undefined) updates.english_level = english_level;
  if (age !== undefined) updates.age = age;
  if (gender !== undefined) updates.gender = gender;
  if (mbti !== undefined) updates.mbti = mbti;
  if (favorite_games !== undefined) updates.favorite_games = favorite_games;
  if (avatar_animal !== undefined) updates.avatar_animal = avatar_animal;

  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ user: data });
}
