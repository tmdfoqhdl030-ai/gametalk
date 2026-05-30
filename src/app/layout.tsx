import type { Metadata } from "next";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { User } from "@/types";
import BottomStickyAd from "@/components/ui/BottomStickyAd";

export const metadata: Metadata = {
  title: "게임스피킹 — 게임하면서 영어 실력 UP",
  description: "배틀그라운드, 리그오브레전드, 오버워치를 영어로 함께 즐길 팀원을 찾아보세요",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  let user: User | null = null;
  if (authUser) {
    const rawNickname = 
      authUser.user_metadata?.nickname ?? 
      authUser.user_metadata?.full_name ?? 
      authUser.user_metadata?.name ?? 
      authUser.email?.split("@")[0] ?? 
      "유저";

    // DB 스키마 제약조건 대비 레벨 방어 매핑
    const validDbLevels = ["beginner", "intermediate", "advanced"];
    const rawLevel = authUser.user_metadata?.english_level ?? "beginner";
    const dbEnglishLevel = validDbLevels.includes(rawLevel) ? rawLevel : "beginner";

    try {
      // 1. select * 를 사용하여 컬럼 미스매치로 인한 쿼리 에러 원천 방지
      const { data, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authUser.id)
        .single();
      
      if (data) {
        user = data as User;
      } else {
        // 데이터가 없는 경우 프로필 생성(upsert) 시도
        const { data: upsertedData, error: upsertError } = await supabase
          .from("users")
          .upsert(
            {
              id: authUser.id,
              email: authUser.email ?? "",
              nickname: rawNickname,
              english_level: dbEnglishLevel,
            },
            { onConflict: "id", ignoreDuplicates: false }
          )
          .select()
          .single();

        if (upsertError) {
          console.error("Upsert failed inside layout fallback:", upsertError);
          throw upsertError;
        }
        user = upsertedData as User;
      }
    } catch (err) {
      console.error("Critical error fetching/upserting user profile in RootLayout:", err);
      // DB 오류가 나도 로그인을 유지하고 헤더에 프로필이 뜨도록 보장하는 최후의 오프라인 fallback
      user = {
        id: authUser.id,
        email: authUser.email ?? "",
        nickname: rawNickname,
        english_level: dbEnglishLevel as any,
        created_at: authUser.created_at,
        avatar_animal: authUser.user_metadata?.avatar_animal ?? "cat",
        is_admin: false,
      };
    }
  }

  return (
    <html lang="ko">
      <body>
        <Navbar user={user} />
        <main>{children}</main>
        <Footer />
        <BottomStickyAd />
      </body>
    </html>
  );
}
