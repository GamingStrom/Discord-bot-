const { socialApiUrl, socialApiKey } = require("../config");

async function getUpdates() {
  if (!socialApiUrl || !socialApiKey) {
    return "Social-media integration is not configured. Add SOCIAL_API_URL and SOCIAL_API_KEY to .env.";
  }

  const response = await fetch(socialApiUrl, {
    headers: { "Authorization": `Bearer ${socialApiKey}` }
  });

  if (!response.ok) throw new Error(`Social API HTTP ${response.status}`);
  const json = await response.json();

  if (Array.isArray(json)) {
    return json.map((x, i) => `${i + 1}. ${x.title || x.text || x.url || "New post"}`).join("\n");
  }

  return json?.message || json?.text || "No new social updates.";
}

module.exports = { getUpdates };
