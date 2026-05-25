"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User } from "@/types";

interface NavbarProps {
  user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.refresh();
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 h-14">
      <div className="max-w-5xl mx-auto px-6 h-full flex items-center gap-8">
        <Link href="/" className="font-extrabold text-xl text-accent tracking-tight">
          게임<span className="text-gray-900">톡</span>
        </Link>

        <div className="flex items-center gap-1 flex-1">
          <Link href="/" className="px-3 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-100">홈</Link>
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="text-sm text-gray-500 font-medium">{user.nickname}</span>
              <Link href="/rooms/new" className="px-3 py-1.5 text-sm font-bold text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors">
                + 방 만들기
              </Link>
              <button
                onClick={handleSignOut}
                className="px-3 py-1.5 text-sm font-medium text-gray-500 border border-gray-200 rounded-lg hover:border-gray-300 hover:text-gray-900 transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="px-3 py-1.5 text-sm font-medium text-gray-500 border border-gray-200 rounded-lg hover:border-gray-300 hover:text-gray-900 transition-colors">
                로그인
              </Link>
              <Link href="/auth/signup" className="px-3 py-1.5 text-sm font-bold text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors">
                무료 가입
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
