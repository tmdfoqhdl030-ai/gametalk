/**
 * 가상 방/유저 시딩 스크립트
 * 사이트가 활동적으로 보이도록 가상 방과 유저를 생성합니다.
 * 실행: node scripts/seed-fake-rooms.mjs
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// .env.local 파일 읽기
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
const DISCORD_GUILD_ID = envVars["DISCORD_GUILD_ID"];

const headers = {
  "apikey": SERVICE_ROLE_KEY,
  "Authorization": `Bearer ${SERVICE_ROLE_KEY}`,
  "Content-Type": "application/json",
  "Prefer": "return=representation",
};

// Supabase REST helper
async function supabaseRequest(method, path, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

// Supabase Auth Admin helper
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
  if (!res.ok) throw new Error(`Auth Admin ${method} ${path} → ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

const GAME_EMOJI = { pubg: "🪖", lol: "⚔️", overwatch: "🎯", valorant: "🔫", tft: "♟️" };

// Discord 음성채널 생성 후 초대 링크 반환
async function createDiscordVoiceChannel(title, game, max_players) {
  if (!DISCORD_BOT_TOKEN || !DISCORD_GUILD_ID) {
    console.warn("  ⚠️  Discord 토큰/길드ID 없음 — 채널 생성 스킵");
    return null;
  }
  try {
    const channelRes = await fetch(`https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/channels`, {
      method: "POST",
      headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${GAME_EMOJI[game] ?? "🎮"} ${title}`,
        type: 2,           // 2 = voice channel
        user_limit: max_players,
      }),
    });
    if (!channelRes.ok) {
      console.warn(`  ⚠️  Discord 채널 생성 실패 (${channelRes.status}): ${await channelRes.text()}`);
      return null;
    }
    const channel = await channelRes.json();

    const inviteRes = await fetch(`https://discord.com/api/v10/channels/${channel.id}/invites`, {
      method: "POST",
      headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({ max_age: 604800, max_uses: max_players }), // 7일 유효
    });
    if (!inviteRes.ok) {
      console.warn(`  ⚠️  Discord 초대 생성 실패 (${inviteRes.status})`);
      return null;
    }
    const invite = await inviteRes.json();
    return `https://discord.gg/${invite.code}`;
  } catch (err) {
    console.warn("  ⚠️  Discord 오류:", err.message);
    return null;
  }
}

// ─── 가상 유저 정의 ───────────────────────────────────────────────────
const FAKE_USERS = [
  { email: "bot.progamer@gamespeaking.internal", nickname: "ProGamer_KR",    english_level: "advanced",     avatar_animal: "wolf" },
  { email: "bot.rolmaster@gamespeaking.internal", nickname: "영어마스터롤",   english_level: "intermediate", avatar_animal: "lion" },
  { email: "bot.valoace@gamespeaking.internal",  nickname: "Valorant에이스",  english_level: "advanced",     avatar_animal: "tiger" },
  { email: "bot.ownoob@gamespeaking.internal",   nickname: "OW초보탈출중",   english_level: "beginner",     avatar_animal: "rabbit" },
  { email: "bot.tftchall@gamespeaking.internal", nickname: "TFT챌린저",       english_level: "advanced",     avatar_animal: "panda" },
];

// ─── 가상 방 정의 (5개, 전부 풀방) ───────────────────────────────────
// hostIdx: FAKE_USERS 배열 인덱스 (0-based)
// membersIdx: 추가 멤버 인덱스 (host 제외, host+membersIdx 합산 = max_players)
const FAKE_ROOMS = [
  {
    title: "배그 영어 스쿼드 중급",
    game: "pubg", max_players: 2, english_level: "intermediate",
    hostIdx: 0, membersIdx: [1],          // 1+1 = 2/2 FULL
    minsAgo: 95,
  },
  {
    title: "롤 5인팟 영어로 즐겜해요",
    game: "lol", max_players: 5, english_level: "intermediate",
    hostIdx: 1, membersIdx: [0, 2, 3, 4], // 1+4 = 5/5 FULL
    minsAgo: 210,
  },
  {
    title: "발로란트 고급 영어 5인팟",
    game: "valorant", max_players: 5, english_level: "advanced",
    hostIdx: 2, membersIdx: [0, 1, 3, 4], // 1+4 = 5/5 FULL
    minsAgo: 55,
  },
  {
    title: "오버워치 영어 초급 팀 모집",
    game: "overwatch", max_players: 2, english_level: "beginner",
    hostIdx: 3, membersIdx: [2],          // 1+1 = 2/2 FULL
    minsAgo: 330,
  },
  {
    title: "TFT 영어 연습 중급방",
    game: "tft", max_players: 2, english_level: "intermediate",
    hostIdx: 4, membersIdx: [0],          // 1+1 = 2/2 FULL
    minsAgo: 40,
  },
];

// ─── 메인 ───────────────────────────────────────────────────────────────
async function main() {
  console.log("🚀 가상 데이터 시딩 시작...\n");

  // 1. 기존 봇 유저가 있으면 삭제 (재실행 방지)
  console.log("🧹 기존 봇 유저 정리 중...");
  const existingUsers = await supabaseRequest("GET",
    `/users?email=like.bot.%25@gamespeaking.internal&select=id,email`
  ).catch(() => []);

  for (const u of (existingUsers || [])) {
    // 방 삭제 (cascade로 room_members, messages도 삭제됨)
    await supabaseRequest("DELETE", `/rooms?host_id=eq.${u.id}`).catch(() => {});
    // auth user 삭제
    await adminAuthRequest("DELETE", `/users/${u.id}`).catch(() => {});
    console.log(`  삭제: ${u.email}`);
  }

  // 2. 가상 유저 생성 (Auth Admin API)
  console.log("\n👤 가상 유저 생성 중...");
  const createdUserIds = [];

  for (const fakeUser of FAKE_USERS) {
    try {
      const result = await adminAuthRequest("POST", "/users", {
        email: fakeUser.email,
        password: "GS_fake_bot_2026!",
        email_confirm: true,
        user_metadata: {
          nickname: fakeUser.nickname,
          english_level: fakeUser.english_level,
          avatar_animal: fakeUser.avatar_animal,
        },
      });
      const userId = result.id;
      createdUserIds.push(userId);
      console.log(`  ✅ ${fakeUser.nickname} (${userId.substring(0, 8)}...)`);

      // public.users의 avatar_animal 업데이트 (trigger가 설정 안 하는 필드)
      await supabaseRequest("PATCH", `/users?id=eq.${userId}`, {
        avatar_animal: fakeUser.avatar_animal,
        nickname: fakeUser.nickname,
        english_level: fakeUser.english_level,
      });
    } catch (err) {
      console.error(`  ❌ ${fakeUser.nickname} 생성 실패:`, err.message);
      createdUserIds.push(null);
    }
  }

  if (createdUserIds.some(id => id === null)) {
    console.error("\n⚠️ 일부 유저 생성 실패. 중단합니다.");
    return;
  }

  // 3. 가상 방 생성
  console.log("\n🏠 가상 방 생성 중...");

  for (const room of FAKE_ROOMS) {
    const hostId = createdUserIds[room.hostIdx];
    const createdAt = new Date(Date.now() - room.minsAgo * 60 * 1000).toISOString();

    try {
      // 방 생성
      const [createdRoom] = await supabaseRequest("POST", "/rooms", {
        title: room.title,
        game: room.game,
        max_players: room.max_players,
        english_level: room.english_level,
        host_id: hostId,
        status: "open",
        created_at: createdAt,
      });

      const roomId = createdRoom.id;

      // Discord 음성채널 생성 후 room에 invite 링크 업데이트
      const discordInvite = await createDiscordVoiceChannel(room.title, room.game, room.max_players);
      if (discordInvite) {
        await supabaseRequest("PATCH", `/rooms?id=eq.${roomId}`, { discord_invite: discordInvite });
        console.log(`     🎮 Discord: ${discordInvite}`);
      }

      // 호스트를 room_members에 추가
      await supabaseRequest("POST", "/room_members", {
        room_id: roomId,
        user_id: hostId,
        joined_at: createdAt,
      });

      // 추가 멤버들 추가
      for (const memberIdx of room.membersIdx) {
        const memberId = createdUserIds[memberIdx];
        if (memberId && memberId !== hostId) {
          await supabaseRequest("POST", "/room_members", {
            room_id: roomId,
            user_id: memberId,
            joined_at: new Date(new Date(createdAt).getTime() + Math.random() * 30 * 60000).toISOString(),
          }).catch(() => {}); // 중복 무시
        }
      }

      const totalMembers = 1 + room.membersIdx.filter(i => createdUserIds[i] !== hostId).length;
      console.log(`  ✅ [${room.game.toUpperCase()}] "${room.title}" — ${totalMembers}/${room.max_players}명`);
    } catch (err) {
      console.error(`  ❌ "${room.title}" 생성 실패:`, err.message);
    }
  }

  console.log("\n✨ 완료! 사이트에서 확인해보세요: https://gametalk-six.vercel.app");
}

main().catch(console.error);
