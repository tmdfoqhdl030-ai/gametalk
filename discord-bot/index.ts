import "dotenv/config";
import {
  Client,
  Collection,
  GatewayIntentBits,
  REST,
  Routes,
  ChatInputCommandInteraction,
  AutocompleteInteraction,
} from "discord.js";
import * as createRoom from "./commands/createRoom";
import * as listRooms from "./commands/listRooms";
import * as joinRoom from "./commands/joinRoom";

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
