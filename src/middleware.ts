import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// 로그인이 필요한 경로
const PROTECTED_PATHS = ["/rooms/new", "/community/new", "/profile/edit"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 보호된 경로인지 확인
  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Supabase 세션 확인
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 정지된 유저 차단
  const { data: profile } = await supabase
    .from("users")
    .select("suspended_until")
    .eq("id", user.id)
    .single();

  if (profile?.suspended_until && new Date(profile.suspended_until) > new Date()) {
    const suspendedUrl = new URL("/suspended", request.url);
    return NextResponse.redirect(suspendedUrl);
  }

  return response;
}

export const config = {
  matcher: ["/rooms/new", "/community/new", "/profile/edit"],
};
