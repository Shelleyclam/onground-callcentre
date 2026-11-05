// POST /api/ai-call  { leadId: 1 }
// An AI advisor phones the customer and talks with them, turn by turn.
// Same safety as /api/call: numbers come only from server settings and must be allowlisted.
// For the demo, the "customer" is CUSTOMER_PHONE if set, otherwise the agent's own phone.
import { twilio, baseUrl, isAllowed, tooManyRecentCalls } from './_lib/twilio.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  const to = process.env.CUSTOMER_PHONE || process.env.AGENT_PHONE;
  if (!isAllowed(to)) return res.status(403).json({ error: 'Calling is not configured for this number.' });
  if (!process.env.GEMINI_API_KEY) return res.status(503).json({ error: 'AI calling is not configured.' });

  try {
    if (await tooManyRecentCalls()) {
      return res.status(429).json({ error: 'Too many calls in the last 10 minutes. Try again shortly.' });
    }
    const leadId = Number(req.body?.leadId) || 1;
    const call = await twilio('/Calls.json', { To: to, From: process.env.TWILIO_FROM, Url: `${baseUrl(req)}/api/twiml/ai?lead=${leadId}` });
    res.status(200).json({ calls: [call.sid] });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: err.message });
  }
}
