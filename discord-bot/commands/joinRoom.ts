import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const data = new SlashCommandBuilder()
  .setName("참여")
  .setDescription("게임방에 참여합니다")
  .addStringOption((o) => o.setName("방id").setDescription("방 ID (UUID)").setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });

  const roomId = interaction.options.getString("방id", true).trim();

  const { data: room, error } = await supabase
    .from("rooms")
    .select(`*, host:users!rooms_host_id_fkey(nickname)`)
    .eq("id", roomId)
    .single();

  if (error || !room) return interaction.editReply("❌ 해당 방을 찾을 수 없습니다.");
  if (room.status === "full") return interaction.editReply("❌ 인원이 꽉 찼습니다.");
  if (room.status === "closed") return interaction.editReply("❌ 닫힌 방입니다.");

  const GAME_LABELS: Record<string, string> = { pubg: "배틀그라운드", lol: "리그오브레전드", overwatch: "오버워치" };
  const LEVEL_LABELS: Record<string, string> = { beginner: "초급", intermediate: "중급", advanced: "고급" };

  const embed = new EmbedBuilder()
    .setColor(0x3d7eff)
    .setTitle(`🎮 ${room.title}`)
    .addFields(
      { name: "게임", value: GAME_LABELS[room.game], inline: true },
      { name: "레벨", value: LEVEL_LABELS[room.english_level], inline: true },
      { name: "방장", value: (room.host as { nickname: string })?.nickname ?? "—", inline: true },
    );

  if (room.discord_invite) {
    embed.addFields({ name: "디스코드 초대 링크", value: room.discord_invite });
  }

  embed.addFields({ name: "웹사이트에서 참여하기", value: `https://gametalk.vercel.app/rooms/${room.id}` });

  await interaction.editReply({ embeds: [embed] });
}
