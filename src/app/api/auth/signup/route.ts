import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { email, password, nickname, english_level } = await request.json();

  if (!email || !password || !nickname || !english_level) {
    return NextResponse.json({ error: "필수 항목을 모두 입력해주세요." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "비밀번호는 6자 이상이어야 합니다." }, { status: 400 });
  }

  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nickname, english_level },
  });

  if (error) {
    if (error.message.includes("already registered") || error.message.includes("already been registered")) {
      return NextResponse.json({ error: "이미 사용 중인 이메일입니다." }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // trigger가 실패할 경우를 대비해 직접 삽입
  await admin.from("users").upsert({
    id: data.user.id,
    email,
    nickname,
    english_level,
  });

  return NextResponse.json({ ok: true });
}
