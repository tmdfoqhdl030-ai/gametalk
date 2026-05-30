import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

// .env.local 파싱
const envPath = resolve(process.cwd(), ".env.local");
let env = {};
try {
  env = Object.fromEntries(
    readFileSync(envPath, "utf-8")
      .split("\n")
      .filter((l) => l.includes("="))
      .map((l) => l.split("=").map((s) => s.trim()))
      .map(([k, ...v]) => [k, v.join("=")])
  );
} catch (error) {
  console.error("⚠️ .env.local 파일을 읽을 수 없습니다:", error.message);
  process.exit(1);
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const DISCORD_BOT_TOKEN = env.DISCORD_BOT_TOKEN;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY || !DISCORD_BOT_TOKEN) {
  console.error("⚠️ 환경 변수(Supabase URL, Service Role Key, Discord Bot Token)가 누락되었습니다.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// 디스코드 채널 삭제 헬퍼 함수
async function deleteDiscordChannel(discordInvite) {
  if (!discordInvite) return false;

  let channelId = null;

  if (/^\d+$/.test(discordInvite)) {
    channelId = discordInvite;
  } else {
    const inviteCode = discordInvite.split("discord.gg/")[1]?.split("/")[0];
    if (inviteCode) {
      const res = await fetch(`https://discord.com/api/v10/invites/${inviteCode}`, {
        headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` },
      }).catch(() => null);
      if (res?.ok) {
        const data = await res.json();
        channelId = data?.channel?.id ?? null;
      }
    }
  }

  if (!channelId) return false;

  const res = await fetch(`https://discord.com/api/v10/channels/${channelId}`, {
    method: "DELETE",
    headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` },
  }).catch(() => null);

  return res?.ok ?? false;
}

const TARGET_ROOM_IDS = [
  'aaaaaaaa-0000-0000-0000-000000000001',
  'aaaaaaaa-0000-0000-0000-000000000002',
  'aaaaaaaa-0000-0000-0000-000000000003',
  'aaaaaaaa-0000-0000-0000-000000000004',
  'aaaaaaaa-0000-0000-0000-000000000005',
  'aaaaaaaa-0000-0000-0000-000000000006'
];

async function leaveAll() {
  console.log("🧹 모의 방 6개에서 모두 퇴장하여 디스코드 채널 삭제 및 방 닫기 시뮬레이션 시작...");

  for (const roomId of TARGET_ROOM_IDS) {
    console.log(`\n방 ID: ${roomId} 처리 중...`);

    // 1. 방 정보 조회 (디스코드 링크 획득)
    const { data: room, error: roomErr } = await supabase
      .from("rooms")
      .select("title, discord_invite")
      .eq("id", roomId)
      .single();

    if (roomErr || !room) {
      console.warn(`⚠️ 방을 조회하지 못했습니다:`, roomErr?.message);
      continue;
    }

    console.log(`- 대상 방: '${room.title}'`);

    // 2. 디스코드 채널 삭제
    if (room.discord_invite) {
      console.log(`- 디스코드 채널 삭제 중: ${room.discord_invite}`);
      const deleted = await deleteDiscordChannel(room.discord_invite);
      if (deleted) {
        console.log(`  └ ✅ 디스코드 채널이 정상 삭제되었습니다.`);
      } else {
        console.warn(`  └ ⚠️ 디스코드 채널 삭제에 실패했거나 이미 존재하지 않습니다.`);
      }
    } else {
      console.log(`- 생성된 디스코드 채널이 없는 방입니다.`);
    }

    // 3. 방 멤버 모두 삭제 (방을 나가는 상황 시뮬레이션)
    const { error: memberErr } = await supabase
      .from("room_members")
      .delete()
      .eq("room_id", roomId);

    if (memberErr) {
      console.error(`  └ ❌ 멤버 삭제 실패:`, memberErr.message);
    } else {
      console.log(`  └ 방 멤버 목록이 성공적으로 청소되었습니다.`);
    }

    // 4. 방 상태를 closed로 변경
    const { error: statusErr } = await supabase
      .from("rooms")
      .update({ status: "closed" })
      .eq("id", roomId);

    if (statusErr) {
      console.error(`  └ ❌ 방 상태 변경 실패:`, statusErr.message);
    } else {
      console.log(`  └ 방 상태가 'closed'로 변경되었습니다.`);
    }
  }

  console.log("\n✨ 모든 모의 방의 퇴장 및 디스코드 채널 삭제 정리가 완료되었습니다!");
}

leaveAll().catch(console.error);
