// Ask Google Gemini (AI Studio API) for the AI caller's next line.
// Model choice: a "flash-lite" model answers in ~1.5s. A phone call can't wait long:
// Twilio gives our server about 5 seconds to reply each turn.
const MODEL = 'gemini-3.1-flash-lite';
const URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// system: who the AI is. history: [{ role: 'ai' | 'customer', text }]
export async function nextLine(system, history) {
  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: history.map((m) => ({ role: m.role === 'ai' ? 'model' : 'user', parts: [{ text: m.text }] })),
      generationConfig: { maxOutputTokens: 120, temperature: 0.6 },
    }),
    signal: AbortSignal.timeout(4000), // give up before Twilio does, so we can still say sorry
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${body.error?.message ?? 'request failed'}`);
  return body.candidates?.[0]?.content?.parts?.map((p) => p.text).join('').trim() ?? '';
}
