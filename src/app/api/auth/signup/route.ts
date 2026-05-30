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

  // 1. 닉네임 중복 검사
  const { data: existingUser } = await admin
    .from("users")
    .select("id")
    .eq("nickname", nickname)
    .single();

  if (existingUser) {
    return NextResponse.json({ error: "이미 사용 중인 닉네임입니다." }, { status: 400 });
  }

  // DB 스키마 업데이트가 누락된 경우를 대비한 방어 로직 (제약 조건 오류 방지)
  const validDbLevels = ['beginner', 'intermediate', 'advanced'];
  const dbEnglishLevel = validDbLevels.includes(english_level) ? english_level : 'beginner';

  // 2. 사용자 계정 생성 (트리거가 알아서 users 테이블에 삽입함)
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nickname, english_level: dbEnglishLevel },
  });

  if (error) {
    if (error.message.includes("already registered") || error.message.includes("already been registered")) {
      return NextResponse.json({ error: "이미 사용 중인 이메일입니다." }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
