const { aiApiUrl, aiApiKey, aiModel } = require("../config");

async function ask(prompt) {
  if (!aiApiUrl || !aiApiKey) {
    return [
      "AI is not connected yet.",
      "",
      `Your prompt was: ${prompt}`,
      "",
      "Add AI_API_URL, AI_API_KEY and optionally AI_MODEL to .env to enable the external AI provider."
    ].join("\n");
  }

  const response = await fetch(aiApiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${aiApiKey}`
    },
    body: JSON.stringify({
      model: aiModel || undefined,
      messages: [
        {
          role: "system",
          content: "You are a helpful Discord community assistant. Answer questions, help with spelling and writing, and keep responses clear and safe."
        },
        { role: "user", content: prompt }
      ]
    })
  });

  if (!response.ok) throw new Error(`AI HTTP ${response.status}`);
  const json = await response.json();
  return json?.choices?.[0]?.message?.content || "The AI provider returned no answer.";
}

module.exports = { ask };
