import { readFileSync } from "fs";
import { resolve } from "path";
import { createClient } from "@supabase/supabase-js";

const envPath = resolve(process.cwd(), ".env.local");
let env = Object.fromEntries(
  readFileSync(envPath, "utf-8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => l.split("=").map((s) => s.trim()))
    .map(([k, ...v]) => [k, v.join("=")])
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.from('users').select('manner_score').limit(1);
  if (error) {
    console.log("❌ manner_score 컬럼이 존재하지 않습니다. 마이그레이션이 필요합니다.", error.message);
  } else {
    console.log("✅ manner_score 컬럼이 이미 존재합니다!");
  }
}

check();
