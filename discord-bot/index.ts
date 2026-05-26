import "dotenv/config";
import {
  Client,
  Collection,
  GatewayIntentBits,
  REST,
  Routes,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
  ChannelType,
} from "discord.js";
import { createClient } from "@supabase/supabase-js";
import * as createRoom from "./commands/createRoom";
import * as listRooms from "./commands/listRooms";
import * as joinRoom from "./commands/joinRoom";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const commands = [createRoom, listRooms, joinRoom];

interface Command {
  data: { name: string; toJSON: () => unknown };
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates, // 음성 채널 이동에 필요
  ],
});

const commandMap = new Collection<string, Command>();

for (const cmd of commands) {
  commandMap.set(cmd.data.name, cmd as Command);
}

async function registerCommands() {
  const rest = new REST().setToken(process.env.DISCORD_TOKEN!);
  await rest.put(
    Routes.applicationGuildCommands(
      process.env.DISCORD_CLIENT_ID!,
      process.env.DISCORD_GUILD_ID!
    ),
    { body: commands.map((c) => c.data.toJSON()) }
  );
  console.log("Slash commands registered.");
}

client.once("ready", async () => {
  console.log(`GameTalkBot online: ${client.user?.tag}`);
  await registerCommands();
  subscribeRoomClose();
});

function subscribeRoomClose() {
  supabase
    .channel("room-close-watcher")
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "rooms" },
      async (payload) => {
        const row = payload.new as { status?: string; discord_invite?: string | null };
        console.log(`[Realtime] rooms UPDATE 수신: status=${row.status}, discord_invite=${row.discord_invite}`);

        if (row.status !== "closed") return;

        const channelId = row.discord_invite ?? null;
        if (!channelId) return;

        // 초대 URL이 저장된 구형 방은 채널 ID 없음 → 스킵
        if (channelId.startsWith("http")) {
          console.log(`[Realtime] 구형 방(invite URL) — 채널 삭제 불가, 스킵: ${channelId}`);
          return;
        }

        const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID!);
        if (!guild) return;

        try {
          const ch = guild.channels.cache.get(channelId) ?? await guild.channels.fetch(channelId).catch(() => null);
          if (ch && ch.type === ChannelType.GuildVoice) {
            await ch.delete("게임방 종료");
            console.log(`음성 채널 삭제 완료: ${ch.name}`);
          }
        } catch (err) {
          console.error("음성 채널 삭제 실패:", err);
        }
      }
    )
    .subscribe((status) => {
      console.log("[Realtime] 구독 상태:", status);
    });
}

// 음성 채널에 마지막 인원이 나가면 채널 삭제
client.on("voiceStateUpdate", async (oldState, newState) => {
  // 채널을 떠난 경우만 처리
  if (!oldState.channelId || oldState.channelId === newState.channelId) return;

  const channel = oldState.channel;
  if (!channel || channel.type !== ChannelType.GuildVoice) return;

  // 채널에 아무도 없으면
  if (channel.members.size > 0) return;

  // Supabase에서 이 채널 ID를 가진 방 조회
  const { data: room } = await supabase
    .from("rooms")
    .select("id, status")
    .eq("discord_invite", channel.id)
    .single();

  if (!room || room.status === "closed") return;

  try {
    await channel.delete("음성 채널 인원 없음 - 자동 종료");
    console.log(`음성 채널 자동 삭제 (빈 채널): ${channel.name}`);

    // DB 방 상태도 closed로 변경
    await supabase.from("rooms").update({ status: "closed" }).eq("id", room.id);
  } catch (err) {
    console.error("빈 채널 삭제 실패:", err);
  }
});

client.on("interactionCreate", async (interaction) => {
  // 자동완성 처리
  if (interaction.isAutocomplete()) {
    const cmd = commandMap.get(interaction.commandName);
    if (cmd?.autocomplete) {
      try {
        await cmd.autocomplete(interaction);
      } catch (err) {
        console.error("Autocomplete error:", err);
      }
    }
    return;
  }

  if (!interaction.isChatInputCommand()) return;

  const cmd = commandMap.get(interaction.commandName);
  if (!cmd) return;

  try {
    await cmd.execute(interaction);
  } catch (err) {
    console.error(err);
    const reply = { content: "❌ 명령어 처리 중 오류가 발생했습니다.", ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(reply);
    } else {
      await interaction.reply(reply);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
