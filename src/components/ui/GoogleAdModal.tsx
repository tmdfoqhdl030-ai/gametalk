"use client";

import { useState, useEffect } from "react";

interface GoogleAdModalProps {
  onClose?: () => void;
  triggerDelay?: number; // ms
}

export default function GoogleAdModal({ onClose, triggerDelay = 500 }: GoogleAdModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, triggerDelay);

    return () => clearTimeout(timer);
  }, [triggerDelay]);

  useEffect(() => {
    if (!isOpen) return;

    if (countdown > 0) {
      const interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen, countdown]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300 animate-fadeIn">
      <div className="relative w-full max-w-md mx-4 overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-2xl transition-transform duration-300 transform scale-100 animate-scaleUp">
        
        {/* Top bar indicating it's an ad */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 bg-gray-50 text-[10px] text-gray-400 font-semibold tracking-wider">
          <span>SPONSORED ADVERTISEMENT</span>
          <div className="flex items-center gap-1">
            <span>Google Ads</span>
            <span className="w-3 h-3 flex items-center justify-center rounded-full bg-gray-200 text-[8px] font-bold">i</span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          disabled={countdown > 0}
          className={`absolute top-10 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white text-sm font-bold transition-all hover:bg-black/70 ${
            countdown > 0 ? "opacity-50 cursor-not-allowed" : "opacity-100 cursor-pointer"
          }`}
        >
          {countdown > 0 ? countdown : "✕"}
        </button>

        {/* Ad Content */}
        <div className="p-6 text-center">
          <div className="aspect-video w-full rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-600 to-purple-600 p-6 flex flex-col justify-between text-white shadow-inner relative overflow-hidden group">
            {/* Visual element */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-white/10 blur-xl transition-all duration-500 group-hover:scale-125" />
            <div className="absolute -left-10 -top-10 w-24 h-24 rounded-full bg-pink-400/20 blur-lg" />

            <div className="text-left relative z-10">
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-[9px] font-extrabold uppercase tracking-wider">GAMING SPONSOR</span>
              <h4 className="text-lg font-black mt-2 leading-tight">ASUS ROG 게이밍 기어<br /><span className="text-yellow-300 font-black">최대 30% 한정수량 특별전</span></h4>
            </div>

            <div className="flex items-end justify-between relative z-10">
              <div className="text-left">
                <p className="text-[10px] opacity-75 font-semibold">노이즈캔슬링 게이밍 헤드셋</p>
                <p className="text-xs font-bold text-yellow-300">★ 4.9 게이머 평점</p>
              </div>
              <span className="px-3.5 py-1.5 bg-white text-indigo-600 text-xs font-black rounded-lg shadow hover:bg-yellow-300 hover:text-gray-900 transition-all duration-200 transform hover:scale-105">
                특가 구매 ➔
              </span>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <h3 className="text-base font-extrabold text-gray-900 leading-tight">해외 게이머들과 완벽하게 보이스 챗!</h3>
            <p className="text-xs text-gray-500 leading-relaxed px-4">
              주변 소음을 완벽히 지워주는 AI 노이즈 캔슬링 마이크 헤드셋으로 원어민 팀원들과 깨끗하고 또렷하게 소통하세요.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-400 font-medium">광고는 서비스 운영에 큰 도움이 됩니다.</span>
          <button
            onClick={handleClose}
            disabled={countdown > 0}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              countdown > 0 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-900"
            }`}
          >
            {countdown > 0 ? `${countdown}초 후 닫기` : "광고 건너뛰기"}
          </button>
        </div>
      </div>
    </div>
  );
}
