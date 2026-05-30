import { readFileSync } from "fs";
import { resolve } from "path";

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

const DISCORD_BOT_TOKEN = env.DISCORD_BOT_TOKEN;
const DISCORD_GUILD_ID = env.DISCORD_GUILD_ID;

console.log("Token exists:", !!DISCORD_BOT_TOKEN);
console.log("Guild ID:", DISCORD_GUILD_ID);

if (!DISCORD_BOT_TOKEN || !DISCORD_GUILD_ID) {
  console.error("⚠️ DISCORD_BOT_TOKEN 또는 DISCORD_GUILD_ID가 없습니다.");
  process.exit(1);
}

async function testDiscord() {
  console.log("\n🧪 Discord 채널 생성 테스트 시작...");
  try {
    const channelRes = await fetch(`https://discord.com/api/v10/guilds/${DISCORD_GUILD_ID}/channels`, {
      method: "POST",
      headers: { 
        Authorization: `Bot ${DISCORD_BOT_TOKEN}`, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({
        name: "🔊 테스트 채널",
        type: 2, // voice
        user_limit: 4,
      }),
    });

    console.log("채널 생성 응답 코드:", channelRes.status);
    const body = await channelRes.json();
    console.log("채널 생성 응답 바디:", JSON.stringify(body, null, 2));

    if (channelRes.ok) {
      console.log(`✅ 테스트 채널 생성 성공! ID: ${body.id}`);
      
      // 초대장 생성 테스트
      const inviteRes = await fetch(`https://discord.com/api/v10/channels/${body.id}/invites`, {
        method: "POST",
        headers: { 
          Authorization: `Bot ${DISCORD_BOT_TOKEN}`, 
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ max_age: 86400, max_uses: 4 }),
      });
      
      console.log("초대장 생성 응답 코드:", inviteRes.status);
      const inviteBody = await inviteRes.json();
      console.log("초대장 생성 응답 바디:", JSON.stringify(inviteBody, null, 2));
      
      if (inviteRes.ok) {
        console.log(`✅ 초대장 생성 성공! URL: https://discord.gg/${inviteBody.code}`);
      }

      // 채널 삭제 테스트 (정리)
      const deleteRes = await fetch(`https://discord.com/api/v10/channels/${body.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bot ${DISCORD_BOT_TOKEN}` }
      });
      console.log("테스트 채널 삭제 결과:", deleteRes.status);
    }
  } catch (error) {
    console.error("❌ 예외 발생:", error);
  }
}

testDiscord();
