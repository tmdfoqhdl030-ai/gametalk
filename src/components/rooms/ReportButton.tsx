"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";

interface ReportButtonProps {
  roomId: string;
  reportedId: string;
  reportedName: string;
  className?: string;
  variant?: "ghost" | "secondary" | "danger";
  size?: "sm" | "md";
}

export default function ReportButton({
  roomId,
  reportedId,
  reportedName,
  className = "",
  variant = "ghost",
  size = "sm"
}: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [reason, setReason] = useState("욕설 및 비속어 사용");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const fullReason = details.trim() 
      ? `[${reason}] ${details.trim()}` 
      : reason;

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_id: roomId,
          reported_id: reportedId,
          reason: fullReason
        })
      });

      if (res.ok) {
        alert(`🚨 ${reportedName}님에 대한 신고가 정상적으로 접수되었습니다. 관리자가 신속히 검토하겠습니다.`);
        setIsOpen(false);
        setDetails("");
      } else {
        const err = await res.json();
        alert(`⚠️ 신고 접수 실패: ${err.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("⚠️ 서버와의 통신 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`text-[10px] font-bold text-red-500 hover:text-red-700 px-2 py-0.5 border border-red-200 hover:border-red-400 rounded-md bg-red-50/50 transition-colors ${className}`}
      >
        신고
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-sm mx-4 bg-white border border-gray-100 rounded-2xl shadow-2xl p-6 animate-scaleUp">
            
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-1.5">
                🚨 비매너 사용자 신고
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <p className="text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wide">신고 대상자</p>
                <p className="text-sm font-extrabold text-gray-900 bg-gray-50 border border-gray-100 rounded-lg px-3 py-2">
                  👤 {reportedName}
                </p>
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wide">신고 사유 *</label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-accent bg-white"
                >
                  <option value="욕설 및 비속어 사용">욕설 및 비속어 사용</option>
                  <option value="고의적인 트롤링 및 게임 방해">고의적인 트롤링 및 게임 방해</option>
                  <option value="마이크 미사용 또는 영어 대화 거부">마이크 미사용 또는 영어 대화 거부</option>
                  <option value="광고, 도배, 스팸 행위">광고, 도배, 스팸 행위</option>
                  <option value="기타 비매너 행위">기타 비매너 행위</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-semibold mb-1 uppercase tracking-wide">상세 설명</label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  maxLength={500}
                  placeholder="당시 상황이나 추가 정보를 최대한 구체적으로 적어주세요. (최대 500자)"
                  className="w-full h-24 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:border-accent resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  loading={loading}
                  className="flex-1 justify-center py-2 text-xs font-bold bg-red-600 hover:bg-red-700"
                >
                  신고 접수하기
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 justify-center py-2 text-xs font-bold border border-gray-200"
                >
                  취소
                </Button>
              </div>
            </form>

          </div>
        </div>
      )}
    </>
  );
}
