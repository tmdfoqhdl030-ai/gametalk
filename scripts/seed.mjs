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

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("⚠️ NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_SERVICE_ROLE_KEY가 없습니다.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const DUMMY_USERS = [
  { id: '00000000-0000-0000-0000-000000000001', email: 'gamer1@example.com', nickname: '총알배그왕', level: 'advanced' },
  { id: '00000000-0000-0000-0000-000000000002', email: 'gamer2@example.com', nickname: '롤초보탈출', level: 'beginner' },
  { id: '00000000-0000-0000-0000-000000000003', email: 'gamer3@example.com', nickname: 'OWDiamondKR', level: 'intermediate' },
  { id: '00000000-0000-0000-0000-000000000004', email: 'gamer4@example.com', nickname: '영어고수배그', level: 'advanced' },
  { id: '00000000-0000-0000-0000-000000000005', email: 'gamer5@example.com', nickname: '미드라이너KR', level: 'intermediate' }
];

const DUMMY_ROOMS = [
  {
    id: 'aaaaaaaa-0000-0000-0000-000000000001',
    title: '[배그] 스쿼드 영어로만! 초보 환영 🪖',
    game: 'pubg',
    max_players: 4,
    english_level: 'beginner',
    host_id: '00000000-0000-0000-0000-000000000001',
    discord_invite: 'https://discord.gg/example1',
    status: 'open'
  },
  {
    id: 'aaaaaaaa-0000-0000-0000-000000000002',
    title: '[롤] 영어 콜아웃 연습 스크림 ⚔️',
    game: 'lol',
    max_players: 5,
    english_level: 'intermediate',
    host_id: '00000000-0000-0000-0000-000000000002',
    discord_invite: 'https://discord.gg/example2',
    status: 'open'
  },
  {
    id: 'aaaaaaaa-0000-0000-0000-000000000003',
    title: '[오버워치] 경쟁전 영어 팀 🎯',
    game: 'overwatch',
    max_players: 6,
    english_level: 'advanced',
    host_id: '00000000-0000-0000-0000-000000000003',
    discord_invite: 'https://discord.gg/example3',
    status: 'open'
  },
  {
    id: 'aaaaaaaa-0000-0000-0000-000000000004',
    title: '[배그] 영어 연습 듀오 구해요 🪖',
    game: 'pubg',
    max_players: 2,
    english_level: 'intermediate',
    host_id: '00000000-0000-0000-0000-000000000004',
    discord_invite: null,
    status: 'open'
  },
  {
    id: 'aaaaaaaa-0000-0000-0000-000000000005',
    title: '[롤] All English 일반 게임 😊',
    game: 'lol',
    max_players: 5,
    english_level: 'beginner',
    host_id: '00000000-0000-0000-0000-000000000005',
    discord_invite: 'https://discord.gg/example5',
    status: 'open'
  },
  {
    id: 'aaaaaaaa-0000-0000-0000-000000000006',
    title: '[오버워치] 영어 캐주얼 6인 모집 🎯',
    game: 'overwatch',
    max_players: 6,
    english_level: 'intermediate',
    host_id: '00000000-0000-0000-0000-000000000003',
    discord_invite: 'https://discord.gg/example6',
    status: 'full'
  }
];

const DUMMY_MEMBERS = [
  { room_id: 'aaaaaaaa-0000-0000-0000-000000000001', user_id: '00000000-0000-0000-0000-000000000001' },
  { room_id: 'aaaaaaaa-0000-0000-0000-000000000002', user_id: '00000000-0000-0000-0000-000000000002' },
  { room_id: 'aaaaaaaa-0000-0000-0000-000000000003', user_id: '00000000-0000-0000-0000-000000000003' },
  { room_id: 'aaaaaaaa-0000-0000-0000-000000000004', user_id: '00000000-0000-0000-0000-000000000004' },
  { room_id: 'aaaaaaaa-0000-0000-0000-000000000005', user_id: '00000000-0000-0000-0000-000000000005' },
  { room_id: 'aaaaaaaa-0000-0000-0000-000000000006', user_id: '00000000-0000-0000-0000-000000000003' }
];

const GAME_EMOJI = { pubg: "🪖", lol: "⚔️", overwatch: "🎯", valorant: "🎯", tft: "♟️" };

async function createDiscordVoiceChannel(title, game, max_players) {
  const token = env.DISCORD_BOT_TOKEN;
  const guildId = env.DISCORD_GUILD_ID;
  if (!token || !guildId) return null;

  try {
    const channelRes = await fetch(`https://discord.com/api/v10/guilds/${guildId}/channels`, {
      method: "POST",
      headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${GAME_EMOJI[game] ?? "🎮"} ${title}`,
        type: 2, // voice channel
        user_limit: max_players,
      }),
    });
    if (!channelRes.ok) return null;

    const channel = await channelRes.json();

    const inviteRes = await fetch(`https://discord.com/api/v10/channels/${channel.id}/invites`, {
      method: "POST",
      headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ max_age: 86400, max_uses: max_players }),
    });
    if (!inviteRes.ok) return null;

    const invite = await inviteRes.json();
    return `https://discord.gg/${invite.code}`;
  } catch (error) {
    console.error("⚠️ Discord 시드 채널 생성 중 에러:", error.message);
    return null;
  }
}

async function seed() {
  console.log("🚀 Supabase 데이터베이스 시딩을 시작합니다...");

  // 1. 유저 삭제 및 재생성 (Cascade로 public.users와 room_members 등도 자동 정리됨)
  console.log("\n1단계: 기존 더미 유저 삭제 및 재생성...");
  for (const u of DUMMY_USERS) {
    try {
      // 1.1 기존 auth 유저 삭제 시도
      await supabase.auth.admin.deleteUser(u.id);
      console.log(`- 기존 유저 삭제 완료: ${u.email}`);
    } catch (e) {
      // 존재하지 않을 경우 무시
    }

    // 1.2 신규 auth 유저 생성
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      id: u.id,
      email: u.email,
      password: 'password123',
      email_confirm: true,
      user_metadata: {
        nickname: u.nickname,
        english_level: u.level
      }
    });

    if (authError) {
      console.error(`❌ 유저 생성 실패 (${u.email}):`, authError.message);
      continue;
    }
    console.log(`- 유저 생성 완료: ${u.email} (ID: ${authUser.user.id})`);

    // 1.3 트리거가 혹시 작동 안 했을 경우를 대비하여 public.users에 강제 upsert
    const { error: dbError } = await supabase.from('users').upsert({
      id: u.id,
      email: u.email,
      nickname: u.nickname,
      english_level: u.level
    });

    if (dbError) {
      console.warn(`⚠️ public.users 강제 upsert 실패 (${u.email}):`, dbError.message);
    }
  }

  // 2. 방 데이터 주입
  console.log("\n2단계: 방 데이터 주입...");
  for (const r of DUMMY_ROOMS) {
    let inviteUrl = r.discord_invite;
    if (inviteUrl && inviteUrl.includes("example")) {
      console.log(`- '${r.title}'의 실제 Discord 음성 채널 생성 시도...`);
      const realInvite = await createDiscordVoiceChannel(r.title, r.game, r.max_players);
      if (realInvite) {
        inviteUrl = realInvite;
        console.log(`  └ 생성 성공: ${realInvite}`);
      } else {
        console.warn(`  └ 생성 실패 (기존 더미 링크 유지)`);
      }
    }

    const { error } = await supabase.from('rooms').upsert({
      ...r,
      discord_invite: inviteUrl
    });
    if (error) {
      console.error(`❌ 방 생성 실패 (${r.title}):`, error.message);
    } else {
      console.log(`- 방 생성 완료: ${r.title}`);
    }
  }

  // 3. 방 멤버 데이터 주입
  console.log("\n3단계: 방 멤버 데이터 주입...");
  for (const m of DUMMY_MEMBERS) {
    const { error } = await supabase.from('room_members').upsert(m);
    if (error) {
      console.error(`❌ 멤버 추가 실패 (Room: ${m.room_id}, User: ${m.user_id}):`, error.message);
    } else {
      console.log(`- 멤버 추가 완료 (Room: ${m.room_id}, User: ${m.user_id})`);
    }
  }

  console.log("\n✨ 데이터베이스 시딩이 완료되었습니다!");
}

seed().catch(console.error);
