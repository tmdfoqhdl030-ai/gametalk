import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// 로그인이 필요한 경로
const PROTECTED_PATHS = ["/rooms/new", "/community/new", "/profile/edit"];

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: 세션 갱신 및 auth 쿠키 전파 — 절대 삭제하지 말 것
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));

  // 미로그인 → 로그인 페이지로 리다이렉트
  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // 정지된 유저 → 정지 안내 페이지로 리다이렉트
  if (user && isProtected) {
    const { data: profile } = await supabase
      .from("users")
      .select("suspended_until")
      .eq("id", user.id)
      .single();

    if (
      profile?.suspended_until &&
      new Date(profile.suspended_until) > new Date() &&
      pathname !== "/suspended"
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/suspended";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/og|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
