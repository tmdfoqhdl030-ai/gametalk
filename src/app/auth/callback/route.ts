import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const cookieStore = await cookies();
    const response = NextResponse.redirect(`${origin}${next}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.user) {
      const authUser = data.user;
      
      try {
        // [FAIL-SAFE] Check if the user already has a public.users profile row
        const { data: existingProfile } = await supabase
          .from("users")
          .select("id")
          .eq("id", authUser.id)
          .single();

        if (!existingProfile) {
          // Determine a friendly, clean nickname from OAuth metadata or email
          const rawNickname = 
            authUser.user_metadata?.nickname ?? 
            authUser.user_metadata?.full_name ?? 
            authUser.user_metadata?.name ?? 
            authUser.email?.split("@")[0] ?? 
            "게이머";

          let finalNickname = rawNickname;

          // Check for nickname duplicate to prevent unique constraint failures
          const { data: duplicateUser } = await supabase
            .from("users")
            .select("id")
            .eq("nickname", finalNickname)
            .single();

          if (duplicateUser) {
            // Append the last 4 characters of user's UUID to guarantee uniqueness
            const uniqueSuffix = authUser.id.substring(0, 4);
            finalNickname = `${rawNickname}_${uniqueSuffix}`;
          }

          // Insert into public.users
          await supabase.from("users").insert({
            id: authUser.id,
            email: authUser.email ?? "",
            nickname: finalNickname,
            english_level: authUser.user_metadata?.english_level ?? "beginner",
          });
        }
      } catch (dbErr) {
        console.error("Failed to automatically create user profile during OAuth login:", dbErr);
        // We continue redirecting even if profile creation fails, to avoid bricking user login
      }

      return response;
    }
  }

  // Redirect to login with error query param
  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
