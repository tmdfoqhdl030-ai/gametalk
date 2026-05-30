import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

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

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function verify() {
  console.log("🔍 DB 시딩 데이터 검증 시작...");

  const { data: users, error: userError } = await supabase.from('users').select('id, email, nickname');
  if (userError) {
    console.error("❌ 유저 조회 실패:", userError.message);
  } else {
    console.log(`✅ 유저 수: ${users.length}명`);
    users.forEach(u => console.log(`  - [${u.nickname}] ${u.email} (ID: ${u.id})`));
  }

  const { data: rooms, error: roomError } = await supabase.from('rooms').select('id, title, game, status');
  if (roomError) {
    console.error("❌ 방 조회 실패:", roomError.message);
  } else {
    console.log(`✅ 방 수: ${rooms.length}개`);
    rooms.forEach(r => console.log(`  - [${r.game}] ${r.title} (Status: ${r.status})`));
  }

  const { data: members, error: memberError } = await supabase.from('room_members').select('room_id, user_id');
  if (memberError) {
    console.error("❌ 방 멤버 조회 실패:", memberError.message);
  } else {
    console.log(`✅ 방 멤버 매핑 수: ${members.length}개`);
  }
}

verify().catch(console.error);
