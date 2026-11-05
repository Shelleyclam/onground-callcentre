// Ask Google Gemini (AI Studio API) for the AI caller's next line.
// A phone call can't wait: Twilio gives our server ~5 seconds per turn. The free tier is usually
// ~1s but sometimes slow, so we ask two fast "flash-lite" models at once and use the first answer.
const MODELS = ['gemini-3.1-flash-lite', 'gemini-flash-lite-latest'];

async function ask(model, system, history) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: history.map((m) => ({ role: m.role === 'ai' ? 'model' : 'user', parts: [{ text: m.text }] })),
      generationConfig: { maxOutputTokens: 120, temperature: 0.6 },
    }),
    signal: AbortSignal.timeout(3500), // give up before Twilio does, so we can still speak
  });
  const body = await res.json();
  const text = body.candidates?.[0]?.content?.parts?.map((p) => p.text).join('').trim();
  if (!res.ok || !text) throw new Error(`Gemini ${model} ${res.status}: ${body.error?.message ?? 'empty reply'}`);
  return text;
}

// system: who the AI is. history: [{ role: 'ai' | 'customer', text }]
export function nextLine(system, history) {
  return Promise.any(MODELS.map((m) => ask(m, system, history)));
}
