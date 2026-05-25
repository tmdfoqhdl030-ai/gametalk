import type { Metadata } from "next";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";
import { User } from "@/types";

export const metadata: Metadata = {
  title: "게임톡 — 게임하면서 영어 실력 UP",
  description: "배틀그라운드, 리그오브레전드, 오버워치를 영어로 함께 즐길 팀원을 찾아보세요",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  let user: User | null = null;
  if (authUser) {
    const { data } = await supabase.from("users").select("*").eq("id", authUser.id).single();
    user = data;
  }

  return (
    <html lang="ko">
      <body>
        <Navbar user={user} />
        <main>{children}</main>
      </body>
    </html>
  );
}
