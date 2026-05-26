import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ChannelType,
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
  .setName("방만들기")
  .setDescription("게임방과 디스코드 음성 채널을 함께 만듭니다")
  .addStringOption((o) =>
    o.setName("게임").setDescription("게임 선택").setRequired(true)
      .addChoices(
        { name: "🪖 배틀그라운드", value: "pubg" },
        { name: "⚔️ 리그오브레전드", value: "lol" },
        { name: "🎯 오버워치", value: "overwatch" }
      )
  )
  .addStringOption((o) =>
    o.setName("레벨").setDescription("영어 레벨").setRequired(true)
      .addChoices(
        { name: "초급 (Beginner)", value: "beginner" },
        { name: "중급 (Intermediate)", value: "intermediate" },
        { name: "고급 (Advanced)", value: "advanced" }
      )
  )
  .addIntegerOption((o) =>
    o.setName("최대인원").setDescription("2~6명").setRequired(true).setMinValue(2).setMaxValue(6)
  )
  .addStringOption((o) =>
    o.setName("제목").setDescription("방 제목 (없으면 자동 생성)").setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const game = interaction.options.getString("게임", true);
  const level = interaction.options.getString("레벨", true);
  const maxPlayers = interaction.options.getInteger("최대인원", true);
  const titleInput = interaction.options.getString("제목");

  const discordUser = interaction.user;
  const title = titleInput ?? `${GAME_EMOJI[game]} ${discordUser.username}의 ${GAME_LABELS[game]}`;

  const hostId = await getOrCreateDiscordUser(discordUser.id, discordUser.username, level);
  if (!hostId) return interaction.editReply("❌ 사용자 생성에 실패했습니다.");

  // DB에 방 생성
  const { data: room, error } = await supabase
    .from("rooms")
    .insert({ title, game, max_players: maxPlayers, english_level: level, host_id: hostId })
    .select()
    .single();

  if (error) return interaction.editReply(`❌ 방 생성 오류: ${error.message}`);

  await supabase.from("room_members").insert({ room_id: room.id, user_id: hostId });

  // 디스코드 음성 채널 자동 생성
  let voiceChannelId: string | null = null;

  if (interaction.guild) {
    try {
      const voiceChannel = await interaction.guild.channels.create({
        name: `${GAME_EMOJI[game]} ${title}`,
        type: ChannelType.GuildVoice,
        userLimit: maxPlayers,
      });

      voiceChannelId = voiceChannel.id;

      // 기존 discord_invite 컬럼에 채널 ID 저장 (별도 마이그레이션 불필요)
      await supabase.from("rooms").update({ discord_invite: voiceChannelId }).eq("id", room.id);

      // 방 만든 사람이 이미 음성 채널에 있으면 자동으로 이동
      try {
        const member = await interaction.guild.members.fetch(discordUser.id);
        if (member.voice.channelId) {
          await member.voice.setChannel(voiceChannel);
        }
      } catch {
        // 이동 실패해도 방 생성은 성공
      }
    } catch (err) {
      console.error("음성 채널 생성 실패:", err);
    }
  }

  const embed = new EmbedBuilder()
    .setColor(0x3d7eff)
    .setTitle("🎮 게임방이 열렸습니다!")
    .addFields(
      { name: "방 제목", value: room.title, inline: false },
      { name: "게임", value: GAME_LABELS[game], inline: true },
      { name: "레벨", value: LEVEL_LABELS[level], inline: true },
      { name: "최대 인원", value: `${maxPlayers}명`, inline: true },
    );

  if (voiceChannelId) {
    embed.addFields({
      name: "🔊 음성 채널",
      value: `<#${voiceChannelId}> — 클릭하면 바로 입장!`,
      inline: false,
    });
  }

  embed.addFields({
    name: "🌐 웹에서 채팅하기",
    value: `https://gametalk.vercel.app/rooms/${room.id}`,
    inline: false,
  });

  embed.setFooter({ text: `/참여 를 입력하면 방을 검색해서 들어올 수 있습니다` }).setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}
