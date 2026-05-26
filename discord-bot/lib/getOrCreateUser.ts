import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * 디스코드 유저에 대응하는 Supabase 유저 ID를 가져오거나 생성한다.
 * - public.users에 있으면 바로 반환
 * - auth.users에만 있으면 public.users에 upsert 후 반환
 * - 둘 다 없으면 신규 생성
 */
export async function getOrCreateDiscordUser(
  discordId: string,
  discordUsername: string,
  englishLevel = "beginner"
): Promise<string | null> {
  const email = `${discordId}@discord.gametalk`;
  // 닉네임 충돌 방지: 디스코드 ID 뒤 4자리 붙임
  const nickname = `${discordUsername}_${discordId.slice(-4)}`;

  // 1. public.users에서 찾기
  const { data: existing } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (existing?.id) return existing.id;

  // 2. auth.users에 이미 있는지 확인 (이전 실패로 반쪽 생성된 경우)
  const { data: authList } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const existingAuth = authList?.users?.find((u) => u.email === email);

  let authId = existingAuth?.id ?? null;

  // 3. auth.users에도 없으면 신규 생성
  if (!authId) {
    const { data: created, error } = await supabase.auth.admin.createUser({
      email,
      password: Math.random().toString(36),
      user_metadata: { nickname, english_level: englishLevel },
      email_confirm: true,
    });
    if (error) {
      console.error("auth.admin.createUser 실패:", error.message);
      return null;
    }
    authId = created?.user?.id ?? null;
  }

  if (!authId) return null;

  // 4. public.users에 upsert (트리거가 안 돌았거나 실패한 경우 대비)
  const { data: upserted } = await supabase
    .from("users")
    .upsert(
      { id: authId, email, nickname, english_level: englishLevel },
      { onConflict: "id" }
    )
    .select("id")
    .single();

  return upserted?.id ?? null;
}
