import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user: reporter } } = await supabase.auth.getUser();

  if (!reporter) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { room_id, reported_id, reason } = body;

  if (!reported_id || !reason) {
    return NextResponse.json({ error: "Missing reported user or reason" }, { status: 400 });
  }

  // 1. DB에 신고 접수 기록 저장
  const { data: report, error: reportError } = await supabase
    .from("reports")
    .insert({
      room_id: room_id || null,
      reporter_id: reporter.id,
      reported_id: reported_id,
      reason: reason,
      status: "pending"
    })
    .select()
    .single();

  if (reportError) {
    return NextResponse.json({ error: reportError.message }, { status: 500 });
  }

  // 2. 유저 정보 조회 (신고자 및 피신고자 닉네임 획득용)
  const { data: reporterProfile } = await supabase.from("users").select("nickname").eq("id", reporter.id).single();
  const { data: reportedProfile } = await supabase.from("users").select("nickname").eq("id", reported_id).single();
  const { data: roomProfile } = room_id 
    ? await supabase.from("rooms").select("title").eq("id", room_id).single()
    : { data: null };

  const reporterName = reporterProfile?.nickname || reporter.email;
  const reportedName = reportedProfile?.nickname || "알 수 없는 유저";
  const roomName = roomProfile?.title || "개인 메시지/기타";

  // 3. 디스코드 웹훅 전송
  const webhookUrl = process.env.DISCORD_MODERATOR_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      const discordPayload = {
        embeds: [
          {
            title: "🚨 [게임톡] 비매너 신고 접수",
            color: 16711680, // Red
            description: "웹사이트에서 새로운 비매너 유저 신고가 접수되었습니다. 관리자 확인이 필요합니다.",
            fields: [
              { name: "신고 대상자 (피신고자)", value: `👤 **${reportedName}** (ID: ${reported_id})`, inline: true },
              { name: "신고자", value: `👤 **${reporterName}** (ID: ${reporter.id})`, inline: true },
              { name: "관련 방 제목", value: `🎮 ${roomName} (${room_id || "방 외"})`, inline: false },
              { name: "신고 사유 및 설명", value: `📝 ${reason}`, inline: false },
              { name: "어드민 패널 바로가기", value: `🔗 [관리자 패널로 이동](http://localhost:3000/admin)`, inline: false }
            ],
            timestamp: new Date().toISOString(),
            footer: {
              text: `신고 ID: ${report.id}`
            }
          }
        ]
      };

      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(discordPayload)
      });
      console.log(`✅ Discord 웹훅으로 신고 전송 완료 (Report ID: ${report.id})`);
    } catch (err) {
      console.error("⚠️ Discord 웹훅 전송 예외 발생:", err);
    }
  } else {
    console.warn("⚠️ DISCORD_MODERATOR_WEBHOOK_URL 환경변수가 존재하지 않아 웹훅 전송을 건너뜁니다.");
  }

  return NextResponse.json({ report }, { status: 201 });
}
