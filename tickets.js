const { ChannelType } = require("discord.js");

async function createTicket(guild, user) {
  const existing = guild.channels.cache.find(
    c => c.type === ChannelType.GuildText && c.name === `ticket-${user.id}`
  );

  if (existing) return { existing };

  const channel = await guild.channels.create({
    name: `ticket-${user.id}`,
    type: ChannelType.GuildText,
    permissionOverwrites: [
      { id: guild.roles.everyone.id, deny: ["ViewChannel"] },
      { id: user.id, allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"] }
    ]
  });

  return { channel };
}

async function closeTicket(channel) {
  if (!channel.name.startsWith("ticket-")) return false;
  await channel.delete();
  return true;
}

module.exports = { createTicket, closeTicket };
