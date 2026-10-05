require("dotenv").config();

module.exports = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,
  guildId: process.env.GUILD_ID,
  ownerId: process.env.OWNER_ID,
  aiApiUrl: process.env.AI_API_URL || "",
  aiApiKey: process.env.AI_API_KEY || "",
  aiModel: process.env.AI_MODEL || "",
  imageApiUrl: process.env.IMAGE_API_URL || "",
  imageApiKey: process.env.IMAGE_API_KEY || "",
  socialApiUrl: process.env.SOCIAL_API_URL || "",
  socialApiKey: process.env.SOCIAL_API_KEY || "",
  musicApiUrl: process.env.MUSIC_API_URL || "",
  musicApiKey: process.env.MUSIC_API_KEY || ""
};
