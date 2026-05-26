/**
 * discord_invite 값(채널 ID 또는 초대 URL)으로 Discord 음성 채널을 삭제한다.
 * 실패해도 오류를 던지지 않고 null을 반환한다.
 */
export async function deleteDiscordChannel(discordInvite: string): Promise<boolean> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return false;

  let channelId: string | null = null;

  if (/^\d+$/.test(discordInvite)) {
    channelId = discordInvite;
  } else {
    const inviteCode = discordInvite.split("discord.gg/")[1]?.split("/")[0];
    if (inviteCode) {
      const res = await fetch(`https://discord.com/api/v10/invites/${inviteCode}`, {
        headers: { Authorization: `Bot ${token}` },
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
    headers: { Authorization: `Bot ${token}` },
  }).catch(() => null);

  return res?.ok ?? false;
}
