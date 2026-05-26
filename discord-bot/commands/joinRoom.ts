import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  EmbedBuilder,
} from "discord.js";
import { createClient } from "@supabase/supabase-js";
import { getOrCreateDiscordUser } from "../lib/getOrCreateUser";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const GAME_EMOJI: Record<string, string> = { pubg: "🪖", lol: "⚔️", overwatch: "🎯" };
const GAME_LABELS: Record<string, string> = { pubg: "배틀그라운드", lol: "리그오브레전드", overwatch: "오버워치" };
const LEVEL_LABELS: Record<string, string> = { beginner: "초급", intermediate: "중급", advanced: "고급" };

export const data = new SlashCommandBuilder()
  .setName("참여")
  .setDescription("게임방에 참여하고 음성 채널로 이동합니다")
  .addStringOption((o) =>
    o.setName("방").setDescription("참여할 방을 선택하세요").setRequired(true).setAutocomplete(true)
  );

// 방 이름으로 자동완성 — UUID 직접 입력 불필요
export async function autocomplete(interaction: AutocompleteInteraction) {
  const focused = interaction.options.getFocused().toLowerCase();

  const { data: rooms } = await supabase
    .from("rooms")
    .select("id, title, game, max_players, english_level")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(25);

  const filtered = (rooms ?? []).filter((r) =>
    r.title.toLowerCase().includes(focused) ||
    GAME_LABELS[r.game]?.includes(focused) ||
    focused === ""
  );

  await interaction.respond(
    filtered.map((r) => ({
      name: `${GAME_EMOJI[r.game] ?? "🎮"} ${r.title} [${LEVEL_LABELS[r.english_level]}]`,
      value: r.id,
    }))
  );
}

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const roomId = interaction.options.getString("방", true).trim();
  const discordUser = interaction.user;

  const { data: room, error } = await supabase
    .from("rooms")
    .select(`*, host:users!rooms_host_id_fkey(nickname), member_count:room_members(count)`)
    .eq("id", roomId)
    .single();

  if (error || !room) return interaction.editReply("❌ 해당 방을 찾을 수 없습니다.");
  if (room.status === "closed") return interaction.editReply("❌ 닫힌 방입니다.");
  if (room.status === "full") return interaction.editReply("❌ 인원이 꽉 찼습니다.");

  const userId = await getOrCreateDiscordUser(discordUser.id, discordUser.username);
  if (!userId) return interaction.editReply("❌ 사용자 처리에 실패했습니다.");

  // 이미 참여 중인지 확인
  const { data: existingMember } = await supabase
    .from("room_members")
    .select("id")
    .eq("room_id", roomId)
    .eq("user_id", userId)
    .single();

  if (!existingMember) {
    const { error: joinError } = await supabase
      .from("room_members")
      .insert({ room_id: roomId, user_id: userId });

    if (joinError) return interaction.editReply(`❌ 참여 실패: ${joinError.message}`);
  }

  const memberCount = (room.member_count as { count: number }[])?.[0]?.count ?? 0;
  const displayCount = existingMember ? memberCount : memberCount + 1;
  // discord_invite 컬럼에 채널 ID가 저장됨 (http로 시작하면 일반 초대링크, 아니면 채널 ID)
  const rawInvite = room.discord_invite as string | null;
  const discordChannelId = rawInvite && !rawInvite.startsWith("http") ? rawInvite : null;

  const embed = new EmbedBuilder()
    .setColor(0x3d7eff)
    .setTitle(existingMember ? "🎮 이미 참여 중인 방입니다" : "✅ 방에 참여했습니다!")
    .addFields(
      { name: "방 제목", value: room.title, inline: false },
      { name: "게임", value: GAME_LABELS[room.game], inline: true },
      { name: "레벨", value: LEVEL_LABELS[room.english_level], inline: true },
      { name: "인원", value: `${displayCount}/${room.max_players}명`, inline: true },
      { name: "방장", value: (room.host as { nickname: string })?.nickname ?? "—", inline: true },
    );

  // 음성 채널 자동 이동
  if (interaction.guild && discordChannelId) {
    let movedToVoice = false;

    try {
      const member = await interaction.guild.members.fetch(discordUser.id);

      if (member.voice.channelId) {
        // 이미 음성 채널에 있으면 자동으로 이동
        await member.voice.setChannel(discordChannelId);
        movedToVoice = true;
      }
    } catch {
      // 이동 실패 무시
    }

    embed.addFields({
      name: "🔊 음성 채널",
      value: movedToVoice
        ? `<#${discordChannelId}> 으로 이동했습니다!`
        : `<#${discordChannelId}>\n위 채널을 클릭해서 입장하세요!`,
      inline: false,
    });
  }

  embed.addFields({
    name: "🌐 웹에서 채팅하기",
    value: `https://gametalk.vercel.app/rooms/${room.id}`,
    inline: false,
  });

  await interaction.editReply({ embeds: [embed] });
}
