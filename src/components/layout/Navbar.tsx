"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { User } from "@/types";
import AnimalAvatar from "@/components/AnimalAvatar";

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
        <Link href="/" className="flex items-center gap-2 font-extrabold text-xl text-accent tracking-tight">
          <Image src="/logo.svg" alt="게임스피크 로고" width={32} height={32} className="rounded-lg" />
          <span>게임<span className="text-gray-900">스피크</span></span>
        </Link>

        <div className="flex items-center gap-2 flex-1">
          <Link 
            href="/" 
            className="px-3 py-1.5 text-sm font-bold text-gray-600 hover:text-accent rounded-lg hover:bg-gray-50 transition-all"
          >
            🏠 홈
          </Link>
          
          <Link 
            href="/notices" 
            className="px-3 py-1.5 text-sm font-bold text-gray-600 hover:text-accent rounded-lg hover:bg-gray-50 transition-all"
          >
            📢 공지사항
          </Link>
          
          <Link 
            href="/community" 
            className="px-3 py-1.5 text-sm font-bold text-gray-600 hover:text-accent rounded-lg hover:bg-gray-50 transition-all"
          >
            💬 자유게시판
          </Link>
          
          {user?.is_admin && (
            <Link 
              href="/admin" 
              className="px-3 py-1.5 text-sm font-black text-red-600 bg-red-50 border border-red-100 rounded-lg hover:bg-red-100 hover:text-red-700 transition-all flex items-center gap-1"
            >
              🛡️ 관리자 콘솔
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/rooms/new" className="px-3 py-1.5 text-sm font-bold text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors">
                + 방 만들기
              </Link>
              <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                <Link href={`/profile/${user.id}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <AnimalAvatar animalId={user.avatar_animal} size="sm" />
                  <span className="text-sm font-bold text-gray-900 max-w-[100px] truncate">{user.nickname}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors ml-1"
                >
                  로그아웃
                </button>
              </div>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="px-3 py-1.5 text-sm font-medium text-gray-500 border border-gray-200 rounded-lg hover:border-gray-300 hover:text-gray-900 transition-colors">
                로그인
              </Link>
              <Link href="/auth/signup" className="px-3 py-1.5 text-sm font-bold text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors">
                ⚡ 3초 가입
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
