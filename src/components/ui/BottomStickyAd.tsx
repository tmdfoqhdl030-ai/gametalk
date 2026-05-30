"use client";

import { useState, useEffect } from "react";

export default function BottomStickyAd() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show the bottom ad after a short delay (e.g. 1.5s) to trigger a beautiful slide-up animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slideUp">
      <div className="max-w-5xl mx-auto px-4 pb-4">
        <div className="relative bg-gray-900/95 backdrop-blur-md border border-gray-800 text-white rounded-2xl p-4 md:py-3.5 md:px-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 overflow-hidden group">
          {/* Subtle background glow */}
          <div className="absolute -left-10 -bottom-10 w-36 h-36 rounded-full bg-accent/20 blur-xl pointer-events-none group-hover:bg-accent/25 transition-all duration-500" />
          <div className="absolute right-10 -top-10 w-24 h-24 rounded-full bg-indigo-500/15 blur-lg pointer-events-none" />

          {/* Left: Ad Description */}
          <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
            <span className="w-10 h-10 rounded-xl bg-accent text-white flex items-center justify-center text-xl font-bold flex-shrink-0 animate-pulse">
              🎧
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-accent/20 border border-accent/30 text-[8px] font-black text-accent tracking-widest uppercase">
                  AD
                </span>
                <p className="text-sm font-extrabold tracking-tight">
                  ASUS ROG 게이밍 기어 30% 특별 할인 기획전
                </p>
              </div>
              <p className="text-xs text-gray-400 mt-0.5 font-medium leading-relaxed">
                해외 게이머들과의 완벽한 보이스챗을 위한 노이즈 캔슬링 마이크 헤드셋 & 기계식 키보드 한정 판매!
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 relative z-10 w-full md:w-auto justify-end">
            <a
              href="https://rog.asus.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-black rounded-lg transition-all duration-300 transform hover:scale-[1.03] shadow-md text-center w-full md:w-auto cursor-pointer"
            >
              특가 구경하기 ➔
            </a>
            
            {/* Close Button 'X' */}
            <button
              onClick={() => setIsVisible(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-all cursor-pointer flex-shrink-0"
              aria-label="광고 닫기"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
