// Ask Google Gemini for the AI caller's next line.
// Works with both kinds of Google key:
//  - AI Studio keys ("AIza..."):     generativelanguage.googleapis.com
//  - Vertex express keys ("AQ..."): aiplatform.googleapis.com
const MODEL = 'gemini-2.5-flash';

function endpoint(key) {
  return key.startsWith('AIza')
    ? `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`
    : `https://aiplatform.googleapis.com/v1/publishers/google/models/${MODEL}:generateContent`;
}

// system: who the AI is. history: [{ role: 'ai' | 'customer', text }]
export async function nextLine(system, history) {
  const key = process.env.GEMINI_API_KEY;
  const res = await fetch(endpoint(key), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: history.map((m) => ({ role: m.role === 'ai' ? 'model' : 'user', parts: [{ text: m.text }] })),
      // Short, fast answers: a phone call can't wait long (Twilio gives us ~5 seconds).
      generationConfig: { maxOutputTokens: 120, temperature: 0.6, thinkingConfig: { thinkingBudget: 0 } },
    }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${body.error?.message ?? 'request failed'}`);
  return body.candidates?.[0]?.content?.parts?.map((p) => p.text).join('').trim() ?? '';
}
