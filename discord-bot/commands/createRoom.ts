import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const GAME_MAP: Record<string, string> = {
  배그: "pubg", 배틀그라운드: "pubg", pubg: "pubg",
  롤: "lol", "리그오브레전드": "lol", lol: "lol",
  오버워치: "overwatch", ow: "overwatch", overwatch: "overwatch",
};

const LEVEL_MAP: Record<string, string> = {
  초급: "beginner", beginner: "beginner",
  중급: "intermediate", intermediate: "intermediate",
  고급: "advanced", advanced: "advanced",
};

export const data = new SlashCommandBuilder()
  .setName("방만들기")
  .setDescription("게임방을 만듭니다")
  .addStringOption((o) => o.setName("게임").setDescription("pubg/lol/overwatch (또는 배그/롤/오버워치)").setRequired(true))
  .addStringOption((o) => o.setName("레벨").setDescription("초급/중급/고급").setRequired(true))
  .addIntegerOption((o) => o.setName("최대인원").setDescription("2~6명").setRequired(true).setMinValue(2).setMaxValue(6))
  .addStringOption((o) => o.setName("제목").setDescription("방 제목").setRequired(false));

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const gameInput = interaction.options.getString("게임", true).toLowerCase();
  const levelInput = interaction.options.getString("레벨", true).toLowerCase();
  const maxPlayers = interaction.options.getInteger("최대인원", true);
  const titleInput = interaction.options.getString("제목");

  const game = GAME_MAP[gameInput];
  const level = LEVEL_MAP[levelInput];

  if (!game) return interaction.editReply("❌ 지원하지 않는 게임입니다. (배그/롤/오버워치)");
  if (!level) return interaction.editReply("❌ 레벨을 확인하세요. (초급/중급/고급)");

  const discordUser = interaction.user;
  const title = titleInput ?? `[Discord] ${discordUser.username}의 ${gameInput} 방`;

  // Find or create user record
  const { data: existingUser } = await supabase
    .from("users")
    .select("id")
    .eq("nickname", discordUser.username)
    .single();

  let hostId = existingUser?.id;

  if (!hostId) {
    // Create a placeholder user for the Discord user
    const { data: newUser } = await supabase.auth.admin.createUser({
      email: `${discordUser.id}@discord.gametalk`,
      password: Math.random().toString(36),
      user_metadata: { nickname: discordUser.username, english_level: level },
      email_confirm: true,
    });
    hostId = newUser?.user?.id;
  }

  if (!hostId) return interaction.editReply("❌ 사용자 생성에 실패했습니다.");

  const { data: room, error } = await supabase
    .from("rooms")
    .insert({ title, game, max_players: maxPlayers, english_level: level, host_id: hostId })
    .select()
    .single();

  if (error) return interaction.editReply(`❌ 오류: ${error.message}`);

  await supabase.from("room_members").insert({ room_id: room.id, user_id: hostId });

  const GAME_LABELS: Record<string, string> = { pubg: "배틀그라운드", lol: "리그오브레전드", overwatch: "오버워치" };
  const LEVEL_LABELS: Record<string, string> = { beginner: "초급", intermediate: "중급", advanced: "고급" };

  const embed = new EmbedBuilder()
    .setColor(0x3d7eff)
    .setTitle("🎮 게임방이 생성되었습니다!")
    .addFields(
      { name: "방 제목", value: room.title, inline: false },
      { name: "게임", value: GAME_LABELS[game], inline: true },
      { name: "레벨", value: LEVEL_LABELS[level], inline: true },
      { name: "최대 인원", value: `${maxPlayers}명`, inline: true },
      { name: "웹사이트에서 보기", value: `https://gametalk.vercel.app/rooms/${room.id}`, inline: false },
    )
    .setFooter({ text: `방 ID: ${room.id}` })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}
