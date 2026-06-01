"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Report {
  id: string;
  room_id: string | null;
  reporter_id: string;
  reported_id: string;
  reason: string;
  status: "pending" | "resolved" | "dismissed";
  created_at: string;
  reporter: { nickname: string; email: string } | null;
  reported: { nickname: string; email: string } | null;
  room: { title: string } | null;
}

interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  manner_score: number;
  is_admin: boolean;
  suspended_until: string | null;
  created_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeRooms: 0,
    pendingReports: 0,
  });

  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      // 1. Check Admin status
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        router.replace("/auth/login?next=/admin");
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", authUser.id)
        .single();

      if (!profile || !profile.is_admin) {
        alert("🔒 관리자 권한이 필요합니다. 메인 페이지로 이동합니다.");
        router.replace("/");
        return;
      }

      setIsAdmin(true);
      await refreshData();
      setLoading(false);
    })();
  }, []);

  const refreshData = async () => {
    // 2. Fetch stats
    const { count: userCount } = await supabase.from("users").select("*", { count: "exact", head: true });
    const { count: roomCount } = await supabase.from("rooms").select("*", { count: "exact", head: true }).neq("status", "closed");
    const { count: reportCount } = await supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending");

    setStats({
      totalUsers: userCount ?? 0,
      activeRooms: roomCount ?? 0,
      pendingReports: reportCount ?? 0,
    });

    // 3. Fetch reports with joined profiles
    const { data: reportsData } = await supabase
      .from("reports")
      .select(`
        *,
        reporter:users!reports_reporter_id_fkey(nickname, email),
        reported:users!reports_reported_id_fkey(nickname, email),
        room:rooms!reports_room_id_fkey(title)
      `)
      .order("created_at", { ascending: false });

    setReports((reportsData as unknown as Report[]) ?? []);

    // 4. Fetch users
    const { data: usersData } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    setUsers((usersData as unknown as UserProfile[]) ?? []);
  };

  // Actions
  const handleReportStatus = async (reportId: string, status: "resolved" | "dismissed") => {
    setActionLoading(reportId);
    const { error } = await supabase
      .from("reports")
      .update({ status })
      .eq("id", reportId);

    if (error) {
      alert(`에러 발생: ${error.message}`);
    } else {
      await refreshData();
    }
    setActionLoading(null);
  };

  const handleWarnUser = async (reportId: string, userId: string, currentScore: number) => {
    setActionLoading(reportId);
    const newScore = Math.max(0.0, currentScore - 1.0);
    const { error } = await supabase
      .from("users")
      .update({ manner_score: newScore })
      .eq("id", userId);

    if (error) {
      alert(`경고 부여 실패: ${error.message}`);
    } else {
      alert(`ℹ️ 해당 유저의 매너 온도가 1.0°C 하락하여 ${newScore}°C가 되었습니다.`);
      await refreshData();
    }
    setActionLoading(null);
  };

  const handleSuspendUser = async (reportId: string, userId: string, hours: number | "permanent") => {
    setActionLoading(reportId);
    
    let suspensionTime = null;
    if (hours === "permanent") {
      suspensionTime = new Date("9999-12-31T23:59:59Z").toISOString();
    } else {
      const now = new Date();
      now.setHours(now.getHours() + hours);
      suspensionTime = now.toISOString();
    }

    const { error } = await supabase
      .from("users")
      .update({ suspended_until: suspensionTime })
      .eq("id", userId);

    if (error) {
      alert(`정지 처리 실패: ${error.message}`);
    } else {
      alert(`🔒 유저가 정지되었습니다. (기한: ${hours === "permanent" ? "영구 정지" : `${hours}시간`})`);
      await refreshData();
    }
    setActionLoading(null);
  };

  const handleUnsuspendUser = async (userId: string) => {
    setActionLoading(userId);
    const { error } = await supabase
      .from("users")
      .update({ suspended_until: null })
      .eq("id", userId);

    if (error) {
      alert(`정지 해제 실패: ${error.message}`);
    } else {
      alert(`🔓 해당 유저의 정지가 해제되었습니다.`);
      await refreshData();
    }
    setActionLoading(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">🛠️ 게임스피크 관리자 패널</h1>
            <p className="text-xs text-gray-500 mt-1">시스템 실시간 현황 모니터링 및 비매너 유저 규제 센터</p>
          </div>
          <button 
            onClick={refreshData}
            className="px-4 py-2 bg-white border border-gray-200 text-xs font-bold text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            새로고침 🔄
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">가입 유저 수</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">{stats.totalUsers}명</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">활성 대기 방</p>
            <p className="text-3xl font-extrabold text-accent mt-1">{stats.activeRooms}개</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">미해결 신고 건수</p>
            <p className="text-3xl font-extrabold text-red-500 mt-1">{stats.pendingReports}건</p>
          </div>
        </div>

        {/* Reports Management */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-extrabold text-gray-900">🚨 비매너 유저 신고 대기열</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-400 uppercase border-b border-gray-100">
                  <th className="p-4 font-bold">시간</th>
                  <th className="p-4 font-bold">신고자</th>
                  <th className="p-4 font-bold">피신고자</th>
                  <th className="p-4 font-bold">방 제목 / 신고 사유</th>
                  <th className="p-4 font-bold">상태</th>
                  <th className="p-4 font-bold text-right">관리 액션</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-gray-400">
                      접수된 신고가 없습니다. 깨끗한 서비스 운영 중입니다! ✨
                    </td>
                  </tr>
                ) : (
                  reports.map((r) => {
                    const reportedMannerScore = users.find(u => u.id === r.reported_id)?.manner_score ?? 36.5;
                    return (
                      <tr key={r.id} className="hover:bg-gray-50/50">
                        <td className="p-4 whitespace-nowrap text-gray-400">
                          {new Date(r.created_at).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="p-4 font-bold text-gray-900">
                          {r.reporter?.nickname || "유저"}
                        </td>
                        <td className="p-4">
                          <span className="font-extrabold text-red-500">{r.reported?.nickname || "유저"}</span>
                          <p className="text-[10px] text-gray-400">온도: {reportedMannerScore}°C</p>
                        </td>
                        <td className="p-4 max-w-xs">
                          <p className="font-bold text-gray-500 mb-0.5">🎮 {r.room?.title || "방 외"}</p>
                          <p className="leading-relaxed text-gray-800">{r.reason}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            r.status === "pending" 
                              ? "bg-red-100 text-red-700" 
                              : r.status === "resolved" 
                              ? "bg-green-100 text-green-700" 
                              : "bg-gray-100 text-gray-500"
                          }`}>
                            {r.status === "pending" ? "대기중" : r.status === "resolved" ? "해결됨" : "기각"}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-1 whitespace-nowrap">
                          {r.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleWarnUser(r.id, r.reported_id, reportedMannerScore)}
                                disabled={actionLoading !== null}
                                className="px-2 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-bold rounded text-[10px] transition-colors"
                              >
                                경고 (-1°C)
                              </button>
                              <button
                                onClick={() => handleSuspendUser(r.id, r.reported_id, 24)}
                                disabled={actionLoading !== null}
                                className="px-2 py-1 bg-orange-100 hover:bg-orange-200 text-orange-800 font-bold rounded text-[10px] transition-colors"
                              >
                                24h 정지
                              </button>
                              <button
                                onClick={() => handleSuspendUser(r.id, r.reported_id, "permanent")}
                                disabled={actionLoading !== null}
                                className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded text-[10px] transition-colors"
                              >
                                영구 정지
                              </button>
                              <button
                                onClick={() => handleReportStatus(r.id, "resolved")}
                                disabled={actionLoading !== null}
                                className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white font-bold rounded text-[10px] transition-colors"
                              >
                                해결완료
                              </button>
                              <button
                                onClick={() => handleReportStatus(r.id, "dismissed")}
                                disabled={actionLoading !== null}
                                className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-600 font-bold rounded text-[10px] transition-colors"
                              >
                                기각
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users Management */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-extrabold text-gray-900">👥 유저 상태 및 권한 제어 목록</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-400 uppercase border-b border-gray-100">
                  <th className="p-4 font-bold">닉네임/이메일</th>
                  <th className="p-4 font-bold">매너 온도</th>
                  <th className="p-4 font-bold">권한</th>
                  <th className="p-4 font-bold">정지 기간</th>
                  <th className="p-4 font-bold text-right">정지 관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {users.map((u) => {
                  const isSuspended = u.suspended_until && new Date(u.suspended_until) > new Date();
                  return (
                    <tr key={u.id} className="hover:bg-gray-50/50">
                      <td className="p-4">
                        <p className="font-extrabold text-gray-900">{u.nickname}</p>
                        <p className="text-[10px] text-gray-400">{u.email}</p>
                      </td>
                      <td className="p-4 font-extrabold text-accent">
                        {u.manner_score ?? 36.5}°C
                      </td>
                      <td className="p-4">
                        {u.is_admin ? (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-black rounded">ADMIN</span>
                        ) : (
                          <span className="text-gray-400">일반 유저</span>
                        )}
                      </td>
                      <td className="p-4">
                        {isSuspended ? (
                          <span className="text-red-500 font-extrabold">
                            {new Date(u.suspended_until!).getFullYear() === 9999
                              ? "영구 정지 중"
                              : `${new Date(u.suspended_until!).toLocaleString("ko-KR")}까지 정지`}
                          </span>
                        ) : (
                          <span className="text-green-500">정상 활동 중</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {isSuspended ? (
                          <button
                            onClick={() => handleUnsuspendUser(u.id)}
                            disabled={actionLoading !== null}
                            className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg text-[10px] transition-colors"
                          >
                            정지 즉시 해제
                          </button>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
