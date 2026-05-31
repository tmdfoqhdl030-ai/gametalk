import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const title = searchParams.get("title") ?? "게임스피킹";
  const subtitle = searchParams.get("sub") ?? "게임하면서 영어 팀원 모집";
  const game = searchParams.get("game");

  const gameEmoji: Record<string, string> = {
    pubg: "🎯",
    lol: "⚔️",
    overwatch: "🛡️",
    valorant: "🔫",
    tft: "♟️",
  };
  const emoji = game ? (gameEmoji[game] ?? "🎮") : "🎮";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* 배경 패턴 */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(circle at 20% 50%, rgba(61,126,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(61,126,255,0.1) 0%, transparent 50%)",
          }}
        />

        {/* 메인 카드 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
            zIndex: 1,
            padding: "60px 80px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "24px",
            maxWidth: "960px",
            width: "100%",
          }}
        >
          {/* 이모지 */}
          <div style={{ fontSize: "80px", lineHeight: 1 }}>{emoji}</div>

          {/* 로고 */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "28px", fontWeight: 900, color: "#3d7eff" }}>
              게임스피킹
            </span>
          </div>

          {/* 제목 */}
          <div
            style={{
              fontSize: title.length > 20 ? "42px" : "54px",
              fontWeight: 900,
              color: "#ffffff",
              textAlign: "center",
              lineHeight: 1.2,
              letterSpacing: "-1px",
            }}
          >
            {title}
          </div>

          {/* 부제목 */}
          <div
            style={{
              fontSize: "22px",
              color: "rgba(255,255,255,0.6)",
              textAlign: "center",
            }}
          >
            {subtitle}
          </div>

          {/* 게임 태그 */}
          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            {["PUBG", "LoL", "Overwatch", "Valorant", "TFT"].map((g) => (
              <span
                key={g}
                style={{
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.5)",
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  padding: "4px 12px",
                }}
              >
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: "28px",
            right: "40px",
            fontSize: "16px",
            color: "rgba(255,255,255,0.3)",
            fontWeight: 600,
          }}
        >
          gametalk-six.vercel.app
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
