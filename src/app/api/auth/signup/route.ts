import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { email, password, nickname, english_level } = await request.json();

  if (!email || !password || !nickname || !english_level) {
    return NextResponse.json({ error: "필수 항목을 모두 입력해주세요." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "비밀번호는 6자 이상이어야 합니다." }, { status: 400 });
  }

  const admin = createAdminClient();

  // 이메일 인증 없이 즉시 가입
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

  // 가입 후 바로 로그인 세션 생성
  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

  if (signInError) {
    return NextResponse.json({ error: "가입은 됐지만 로그인에 실패했습니다. 로그인 페이지에서 다시 시도해주세요." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
