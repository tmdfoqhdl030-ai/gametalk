import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const GAME_LABELS: Record<string, string> = { pubg: "🪖 배틀그라운드", lol: "⚔️ 리그오브레전드", overwatch: "🎯 오버워치" };
const LEVEL_LABELS: Record<string, string> = { beginner: "초급", intermediate: "중급", advanced: "고급" };

export const data = new SlashCommandBuilder()
  .setName("방목록")
  .setDescription("현재 열린 게임방 목록을 봅니다")
  .addStringOption((o) =>
    o.setName("게임").setDescription("pubg/lol/overwatch").setRequired(false)
      .addChoices(
        { name: "배틀그라운드", value: "pubg" },
        { name: "리그오브레전드", value: "lol" },
        { name: "오버워치", value: "overwatch" }
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const game = interaction.options.getString("게임");

  let query = supabase
    .from("rooms")
    .select(`*, host:users!rooms_host_id_fkey(nickname), member_count:room_members(count)`)
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(10);

  if (game) query = query.eq("game", game);

  const { data: rooms, error } = await query;

  if (error) return interaction.editReply(`❌ 오류: ${error.message}`);
  if (!rooms || rooms.length === 0) return interaction.editReply("현재 열린 방이 없습니다. `/방만들기`로 첫 방을 만들어보세요!");

  const embed = new EmbedBuilder()
    .setColor(0x3d7eff)
    .setTitle("🎮 현재 열린 게임방")
    .setTimestamp();

  for (const room of rooms) {
    const count = (room.member_count as { count: number }[])?.[0]?.count ?? 0;
    embed.addFields({
      name: `${GAME_LABELS[room.game]} | ${room.title}`,
      value: `레벨: ${LEVEL_LABELS[room.english_level]} | 인원: ${count}/${room.max_players} | 방장: ${(room.host as { nickname: string })?.nickname ?? "—"}\n[웹에서 참여하기](https://gametalk.vercel.app/rooms/${room.id})`,
      inline: false,
    });
  }

  await interaction.editReply({ embeds: [embed] });
}
