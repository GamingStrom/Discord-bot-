const { EmbedBuilder } = require("discord.js");
const { load, save } = require("../store");

function warn(guildId, userId, moderatorId, reason) {
  const data = load();
  data.warnings[guildId] ||= {};
  data.warnings[guildId][userId] ||= [];
  data.warnings[guildId][userId].push({
    reason,
    moderator: moderatorId,
    timestamp: Date.now()
  });
  save(data);
}

function listWarnings(guildId, userId) {
  return load().warnings[guildId]?.[userId] || [];
}

function warningEmbed(user, warnings) {
  const text = warnings.length
    ? warnings.map((w, i) => `**${i + 1}.** ${w.reason} — <@${w.moderator}>`).join("\n")
    : "No warnings.";

  return new EmbedBuilder()
    .setTitle(`Warnings — ${user.tag}`)
    .setDescription(text)
    .setTimestamp();
}

module.exports = { warn, listWarnings, warningEmbed };
