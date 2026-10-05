const {
  Client,
  GatewayIntentBits,
  Partials,
  PermissionFlagsBits,
  EmbedBuilder,
  REST,
  Routes,
  SlashCommandBuilder
} = require("discord.js");

const config = require("./config");
const { ask } = require("./services/ai");
const { generate } = require("./services/image");
const { getUpdates } = require("./services/social");
const { action: musicAction } = require("./services/music");
const { warn, listWarnings, warningEmbed } = require("./modules/moderation");
const { createTicket, closeTicket } = require("./modules/tickets");
const { cacheGuildInvites, record, count } = require("./modules/invites");

if (!config.token || !config.clientId || !config.guildId) {
  console.error("Missing DISCORD_TOKEN, CLIENT_ID or GUILD_ID in .env");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

const commands = [
  new SlashCommandBuilder().setName("help").setDescription("Show all bot features"),
  new SlashCommandBuilder().setName("ping").setDescription("Check bot latency"),
  new SlashCommandBuilder().setName("serverinfo").setDescription("Show server information"),
  new SlashCommandBuilder().setName("userinfo").setDescription("Show member information")
    .addUserOption(o => o.setName("user").setDescription("Member").setRequired(false)),

  new SlashCommandBuilder().setName("ai").setDescription("Ask the AI assistant")
    .addStringOption(o => o.setName("prompt").setDescription("Question or task").setRequired(true)),
  new SlashCommandBuilder().setName("imagine").setDescription("Generate an AI image")
    .addStringOption(o => o.setName("prompt").setDescription("Image description").setRequired(true)),

  new SlashCommandBuilder().setName("warn").setDescription("Warn a member")
    .addUserOption(o => o.setName("user").setDescription("Member").setRequired(true))
    .addStringOption(o => o.setName("reason").setDescription("Reason").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),
  new SlashCommandBuilder().setName("warnings").setDescription("View member warnings")
    .addUserOption(o => o.setName("user").setDescription("Member").setRequired(false)),
  new SlashCommandBuilder().setName("clear").setDescription("Delete messages")
    .addIntegerOption(o => o.setName("amount").setDescription("1-100").setMinValue(1).setMaxValue(100).setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  new SlashCommandBuilder().setName("ticket").setDescription("Create a private support ticket"),
  new SlashCommandBuilder().setName("close").setDescription("Close the current ticket"),
  new SlashCommandBuilder().setName("announce").setDescription("Send an announcement")
    .addStringOption(o => o.setName("message").setDescription("Announcement").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  new SlashCommandBuilder().setName("social").setDescription("Show latest connected social updates"),
  new SlashCommandBuilder().setName("invites").setDescription("Show tracked invites")
    .addUserOption(o => o.setName("user").setDescription("Member").setRequired(false)),

  new SlashCommandBuilder().setName("music").setDescription("Music provider controls")
    .addStringOption(o => o.setName("action").setDescription("Action").setRequired(true)
      .addChoices(
        { name: "play", value: "play" },
        { name: "pause", value: "pause" },
        { name: "resume", value: "resume" },
        { name: "stop", value: "stop" }
      ))
    .addStringOption(o => o.setName("query").setDescription("Song/query").setRequired(false))
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(config.token);
const inviteCache = new Map();

async function registerCommands() {
  await rest.put(
    Routes.applicationGuildCommands(config.clientId, config.guildId),
    { body: commands }
  );
}

client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  try {
    await registerCommands();
    console.log("Slash commands registered.");
  } catch (e) {
    console.error("Command registration failed:", e);
  }

  for (const guild of client.guilds.cache.values()) {
    inviteCache.set(guild.id, await cacheGuildInvites(guild));
  }
});

client.on("inviteCreate", async invite => {
  const map = inviteCache.get(invite.guild.id) || new Map();
  map.set(invite.code, invite.uses || 0);
  inviteCache.set(invite.guild.id, map);
});

client.on("guildMemberAdd", async member => {
  try {
    const before = inviteCache.get(member.guild.id) || new Map();
    const after = await member.guild.invites.fetch();
    const used = after.find(inv => (inv.uses || 0) > (before.get(inv.code) || 0));

    if (used?.inviter?.id) record(member.guild.id, used.inviter.id);
    inviteCache.set(member.guild.id, new Map(after.map(i => [i.code, i.uses || 0])));
  } catch {}

  const channel = member.guild.systemChannel;
  if (channel) {
    const embed = new EmbedBuilder()
      .setTitle("👋 Welcome!")
      .setDescription(`Welcome ${member} to **${member.guild.name}**!`)
      .setThumbnail(member.user.displayAvatarURL())
      .setTimestamp();

    channel.send({ embeds: [embed] }).catch(() => {});
  }
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  try {
    switch (interaction.commandName) {
      case "help": {
        const embed = new EmbedBuilder()
          .setTitle("🤖 Everything Bot")
          .setDescription([
            "**AI** — `/ai`, `/imagine`",
            "**Moderation** — `/warn`, `/warnings`, `/clear`",
            "**Community** — `/ticket`, `/close`, `/announce`",
            "**Social** — `/social`, `/invites`",
            "**Music** — `/music`",
            "**Info** — `/ping`, `/serverinfo`, `/userinfo`"
          ].join("\n"));
        return interaction.reply({ embeds: [embed] });
      }

      case "ping":
        return interaction.reply(`🏓 Pong! ${client.ws.ping}ms`);

      case "serverinfo": {
        const g = interaction.guild;
        const embed = new EmbedBuilder()
          .setTitle(g.name)
          .addFields(
            { name: "Members", value: String(g.memberCount), inline: true },
            { name: "Channels", value: String(g.channels.cache.size), inline: true },
            { name: "Created", value: `<t:${Math.floor(g.createdTimestamp / 1000)}:D>`, inline: true }
          )
          .setThumbnail(g.iconURL());
        return interaction.reply({ embeds: [embed] });
      }

      case "userinfo": {
        const user = interaction.options.getUser("user") || interaction.user;
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);
        const embed = new EmbedBuilder()
          .setTitle(user.tag)
          .setThumbnail(user.displayAvatarURL())
          .addFields(
            { name: "User ID", value: user.id, inline: true },
            { name: "Joined", value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>` : "Unknown", inline: true }
          );
        return interaction.reply({ embeds: [embed] });
      }

      case "ai": {
        await interaction.deferReply();
        const answer = await ask(interaction.options.getString("prompt"));
        return interaction.editReply(answer.slice(0, 1900));
      }

      case "imagine": {
        await interaction.deferReply();
        const result = await generate(interaction.options.getString("prompt"));
        if (!result.ok) return interaction.editReply(result.message);
        return interaction.editReply({ content: result.url });
      }

      case "warn": {
        const user = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason");
        warn(interaction.guildId, user.id, interaction.user.id, reason);
        return interaction.reply(`⚠️ ${user} has been warned. Reason: ${reason}`);
      }

      case "warnings": {
        const user = interaction.options.getUser("user") || interaction.user;
        return interaction.reply({ embeds: [warningEmbed(user, listWarnings(interaction.guildId, user.id))] });
      }

      case "clear": {
        const amount = interaction.options.getInteger("amount");
        const deleted = await interaction.channel.bulkDelete(amount, true);
        return interaction.reply({ content: `🧹 Deleted ${deleted.size} messages.`, ephemeral: true });
      }

      case "ticket": {
        const result = await createTicket(interaction.guild, interaction.user);
        if (result.existing) return interaction.reply({ content: `You already have ${result.existing}.`, ephemeral: true });
        await result.channel.send(`🎫 ${interaction.user}, describe your issue here. Use \`/close\` when finished.`);
        return interaction.reply({ content: `Ticket created: ${result.channel}`, ephemeral: true });
      }

      case "close": {
        if (!interaction.channel.name.startsWith("ticket-"))
          return interaction.reply({ content: "This is not a ticket channel.", ephemeral: true });

        await interaction.reply("🔒 Closing ticket...");
        setTimeout(() => closeTicket(interaction.channel).catch(() => {}), 1200);
        return;
      }

      case "announce": {
        const message = interaction.options.getString("message");
        const embed = new EmbedBuilder()
          .setTitle("📢 Announcement")
          .setDescription(message)
          .setFooter({ text: `Posted by ${interaction.user.tag}` })
          .setTimestamp();

        await interaction.channel.send({ embeds: [embed] });
        return interaction.reply({ content: "Announcement sent.", ephemeral: true });
      }

      case "social": {
        await interaction.deferReply();
        return interaction.editReply((await getUpdates()).slice(0, 1900));
      }

      case "invites": {
        const user = interaction.options.getUser("user") || interaction.user;
        return interaction.reply(`📨 ${user} has tracked **${count(interaction.guildId, user.id)}** invite(s).`);
      }

      case "music": {
        await interaction.deferReply();
        const result = await musicAction(
          interaction.options.getString("action"),
          interaction.options.getString("query") || ""
        );
        return interaction.editReply(result.slice(0, 1900));
      }
    }
  } catch (error) {
    console.error(error);
    const message = "❌ Something went wrong. Check the Termux console for details.";
    if (interaction.deferred || interaction.replied) {
      return interaction.editReply(message).catch(() => {});
    }
    return interaction.reply({ content: message, ephemeral: true }).catch(() => {});
  }
});

client.login(config.token);
