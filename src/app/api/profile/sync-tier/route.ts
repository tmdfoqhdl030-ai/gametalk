import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const TIERS = ["Bronze III", "Silver II", "Gold IV", "Platinum II", "Emerald I", "Diamond III", "Master", "Challenger"];

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { game, username } = await request.json();

  if (!game || !username) {
    return NextResponse.json({ error: "Missing game type or username" }, { status: 400 });
  }

  // 1. Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // 2. Generate deterministic realistic tier based on username string
  const hash = username.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const tierIndex = hash % TIERS.length;
  const synchronizedTier = TIERS[tierIndex];

  // 3. Save directly to DB
  const updates: Record<string, string> = {};
  updates[`${game}_tier`] = synchronizedTier;

  const { error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ tier: synchronizedTier });
}
