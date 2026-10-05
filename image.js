const { imageApiUrl, imageApiKey } = require("../config");

async function generate(prompt) {
  if (!imageApiUrl || !imageApiKey) {
    return {
      ok: false,
      message: "Image generation is not configured. Add IMAGE_API_URL and IMAGE_API_KEY to .env."
    };
  }

  const response = await fetch(imageApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${imageApiKey}`
    },
    body: JSON.stringify({ prompt })
  });

  if (!response.ok) throw new Error(`Image API HTTP ${response.status}`);
  const json = await response.json();
  const url = json?.data?.[0]?.url || json?.url;

  if (!url) return { ok: false, message: "The image provider returned no image URL." };
  return { ok: true, url };
}

module.exports = { generate };
