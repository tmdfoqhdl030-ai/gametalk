"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">⚠️</div>
        <h1 className="text-2xl font-black text-gray-900 mb-2">오류가 발생했어요</h1>
        <p className="text-sm text-gray-400 mb-8 leading-relaxed">
          일시적인 오류입니다. 잠시 후 다시 시도하거나<br />
          홈으로 돌아가 주세요.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-6 py-3 bg-accent text-white text-sm font-bold rounded-xl hover:bg-accent-hover transition-colors"
          >
            🔄 다시 시도
          </button>
          <Link
            href="/"
            className="px-6 py-3 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:border-accent hover:text-accent transition-colors"
          >
            🏠 홈으로
          </Link>
        </div>
        {error.digest && (
          <p className="mt-6 text-[10px] text-gray-300 font-mono">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
