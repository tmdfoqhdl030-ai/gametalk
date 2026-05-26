import { readFileSync } from "fs";
import { resolve } from "path";

// .env.local 파싱
const envPath = resolve(process.cwd(), ".env.local");
const env = Object.fromEntries(
  readFileSync(envPath, "utf-8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => l.split("=").map((s) => s.trim()))
    .map(([k, ...v]) => [k, v.join("=")])
);

const PROJECT_REF = env.NEXT_PUBLIC_SUPABASE_URL?.split("//")[1]?.split(".")[0];
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

const SQL = `
alter table public.users
  add column if not exists age int check (age between 10 and 99),
  add column if not exists gender text check (gender in ('male', 'female', 'other', 'secret')),
  add column if not exists mbti text check (mbti in (
    'INTJ','INTP','ENTJ','ENTP',
    'INFJ','INFP','ENFJ','ENFP',
    'ISTJ','ISFJ','ESTJ','ESFJ',
    'ISTP','ISFP','ESTP','ESFP'
  )),
  add column if not exists favorite_games text[] default '{}',
  add column if not exists avatar_animal text default 'cat';
`;

async function run() {
  console.log(`Supabase project: ${PROJECT_REF}`);

  // 1. Management API 시도
  const mgmtRes = await fetch(
    `https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: SQL }),
    }
  );
  const mgmtBody = await mgmtRes.text();

  if (mgmtRes.ok) {
    console.log("✅ 마이그레이션 성공 (Management API):", mgmtBody);
    return;
  }

  // 2. PostgREST rpc 시도 (pg_query 등)
  console.log("Management API 실패:", mgmtRes.status, mgmtBody);
  console.log("→ 다른 방법 시도...");

  // pg_query function 호출 시도
  const rpcRes = await fetch(
    `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rpc/pg_query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        apikey: SERVICE_ROLE_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: SQL }),
    }
  );
  const rpcBody = await rpcRes.text();

  if (rpcRes.ok) {
    console.log("✅ 마이그레이션 성공 (RPC):", rpcBody);
  } else {
    console.log("RPC 실패:", rpcRes.status, rpcBody);
    console.log("\n⚠️  자동 실행 실패. 아래 SQL을 Supabase Dashboard > SQL Editor에서 직접 실행하세요:\n");
    console.log(SQL);
  }
}

run().catch(console.error);
