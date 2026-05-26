import type { Metadata } from "next";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { User } from "@/types";

export const metadata: Metadata = {
  title: "게임스피킹 — 게임하면서 영어 실력 UP",
  description: "배틀그라운드, 리그오브레전드, 오버워치를 영어로 함께 즐길 팀원을 찾아보세요",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  let user: User | null = null;
  if (authUser) {
    const { data } = await supabase
      .from("users")
      .select("id, email, nickname, english_level, age, gender, mbti, favorite_games, avatar_animal, created_at")
      .eq("id", authUser.id)
      .single();
    // users 테이블에 없으면 auth 정보로 임시 프로필 생성
    user = data ?? {
      id: authUser.id,
      email: authUser.email ?? "",
      nickname: authUser.user_metadata?.nickname ?? authUser.email?.split("@")[0] ?? "유저",
      english_level: authUser.user_metadata?.english_level ?? "beginner",
      created_at: authUser.created_at,
    };
  }

  return (
    <html lang="ko">
      <body>
        <Navbar user={user} />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
