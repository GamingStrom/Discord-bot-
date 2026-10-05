const { load, save } = require("../store");

async function cacheGuildInvites(guild) {
  const map = new Map();
  const invites = await guild.invites.fetch().catch(() => null);
  if (!invites) return map;

  invites.forEach(inv => map.set(inv.code, inv.uses || 0));
  return map;
}

function record(guildId, inviterId) {
  const data = load();
  data.invites[guildId] ||= {};
  data.invites[guildId][inviterId] = (data.invites[guildId][inviterId] || 0) + 1;
  save(data);
}

function count(guildId, userId) {
  return load().invites[guildId]?.[userId] || 0;
}

module.exports = { cacheGuildInvites, record, count };
