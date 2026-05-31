/**
 * 가짜 방/유저 완전 삭제 스크립트
 * 실행: node scripts/cleanup-fake-rooms.mjs
 */

import { readFileSync } from "fs";
import { resolve } from "path";

const envPath = resolve(process.cwd(), ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const envVars = Object.fromEntries(
  envContent.split("\n")
    .filter(l => l.includes("=") && !l.startsWith("#"))
    .map(l => [l.split("=")[0].trim(), l.split("=").slice(1).join("=").trim()])
);

const SUPABASE_URL = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const SERVICE_ROLE_KEY = envVars["SUPABASE_SERVICE_ROLE_KEY"];
const DISCORD_BOT_TOKEN = envVars["DISCORD_BOT_TOKEN"];

const headers = {
  "apikey": SERVICE_ROLE_KEY,
  "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
};

async function supabaseRequest(method, path, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    method, headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

async function adminAuthRequest(method, path, body) {
  const res = await fetch(`${SUPABASE_URL}/auth/v1/admin${path}`, {
    method,
    headers: {
      "apikey": SERVICE_ROLE_KEY,
      "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Auth ${method} ${path} → ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

// Discord 채널 삭제
async function deleteDiscordChannel(inviteUrl) {
  if (!DISCORD_BOT_TOKEN || !inviteUrl) return;
  try {
    // 초대링크 코드에서 채널 ID 가져오기
    const code = inviteUrl.replace("https://discord.gg/", "");
    const inviteRes = await fetch(`https://discord.com/api/v10/invites/${code}`, {
      headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` },
    });
    if (!inviteRes.ok) return;
    const invite = await inviteRes.json();
    const channelId = invite.channel?.id;
    if (!channelId) return;

    // 채널 삭제
    await fetch(`https://discord.com/api/v10/channels/${channelId}`, {
      method: "DELETE",
      headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` },
    });
    console.log(`  🗑️  Discord 채널 삭제: ${inviteUrl}`);
  } catch (e) {
    // 이미 삭제됐거나 만료된 경우 무시
  }
}

async function main() {
  console.log("🧹 가짜 데이터 전체 삭제 시작...\n");

  // 1. 봇 유저 조회
  const botUsers = await supabaseRequest("GET",
    `/users?email=like.bot.%25@gamespeaking.internal&select=id,email,nickname`
  ).catch(() => []);

  if (!botUsers || botUsers.length === 0) {
    console.log("✅ 삭제할 가짜 데이터가 없습니다.");
    return;
  }

  console.log(`📋 봇 유저 ${botUsers.length}명 발견:`);
  botUsers.forEach(u => console.log(`  - ${u.nickname} (${u.email})`));

  // 2. 각 봇 유저의 방에 연결된 Discord 채널 먼저 삭제
  console.log("\n🎮 Discord 채널 삭제 중...");
  for (const u of botUsers) {
    const rooms = await supabaseRequest("GET",
      `/rooms?host_id=eq.${u.id}&select=id,title,discord_invite`
    ).catch(() => []);
    for (const room of (rooms || [])) {
      if (room.discord_invite) {
        await deleteDiscordChannel(room.discord_invite);
      }
    }
  }

  // 3. DB에서 방 삭제 (room_members, messages cascade 삭제됨)
  console.log("\n🏠 가짜 방 삭제 중...");
  for (const u of botUsers) {
    const deleted = await supabaseRequest("DELETE",
      `/rooms?host_id=eq.${u.id}&select=title`
    ).catch(() => []);
    (deleted || []).forEach(r => console.log(`  ✅ 방 삭제: "${r.title}"`));
  }

  // 4. Auth 유저 삭제 (public.users cascade 삭제됨)
  console.log("\n👤 봇 유저 삭제 중...");
  for (const u of botUsers) {
    await adminAuthRequest("DELETE", `/users/${u.id}`).catch(() => {});
    console.log(`  ✅ 유저 삭제: ${u.nickname}`);
  }

  console.log("\n✨ 완료! 가짜 데이터가 모두 삭제됐습니다.");
}

main().catch(console.error);
