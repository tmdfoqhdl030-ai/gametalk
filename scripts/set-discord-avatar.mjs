/**
 * Discord 봇 아바타를 게임스피킹 로고로 설정
 * 실행: node scripts/set-discord-avatar.mjs
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import sharp from "sharp";

// .env.local 읽기
const envContent = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
const envVars = Object.fromEntries(
  envContent.split("\n")
    .filter(l => l.includes("=") && !l.startsWith("#"))
    .map(l => [l.split("=")[0].trim(), l.split("=").slice(1).join("=").trim()])
);
const DISCORD_BOT_TOKEN = envVars["DISCORD_BOT_TOKEN"];

// SVG → PNG (512x512) 변환
const svgBuffer = readFileSync(resolve(process.cwd(), "public/logo.svg"));
const pngBuffer = await sharp(svgBuffer).resize(512, 512).png().toBuffer();
const pngBase64 = `data:image/png;base64,${pngBuffer.toString("base64")}`;

console.log("🎨 로고 PNG 변환 완료 (512×512)");

// Discord API로 봇 아바타 설정
const res = await fetch("https://discord.com/api/v10/users/@me", {
  method: "PATCH",
  headers: {
    Authorization: `Bot ${DISCORD_BOT_TOKEN}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ avatar: pngBase64 }),
});

const data = await res.json();
if (res.ok) {
  console.log(`✅ Discord 봇 아바타 설정 완료! (봇 이름: ${data.username})`);
} else {
  console.error(`❌ 실패 (${res.status}): ${data.message}`);
}
