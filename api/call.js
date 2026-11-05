// POST /api/call  { lead: "Ritu S." }
// Rings two phones, the agent and the customer, and puts them in the same conference call.
// The browser never sends a phone number: the server only dials the numbers in its own settings,
// and only if they are on the allowlist.
import { twilio, baseUrl, isAllowed, tooManyRecentCalls } from './_lib/twilio.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  const agent = process.env.AGENT_PHONE;
  const customer = process.env.CUSTOMER_PHONE;
  // CUSTOMER_PHONE may be left empty while testing: then only the agent's phone rings.
  if (!isAllowed(agent) || (customer && !isAllowed(customer))) {
    return res.status(403).json({ error: 'Calling is not configured for these numbers.' });
  }

  try {
    if (await tooManyRecentCalls()) {
      return res.status(429).json({ error: 'Too many calls in the last 10 minutes. Try again shortly.' });
    }

    // Lead name is only used for the spoken greeting. Keep it short and plain.
    const lead = String(req.body?.lead ?? 'your customer').replace(/[^\p{L}\p{N} .'-]/gu, '').slice(0, 40);
    const twimlUrl = (who) => `${baseUrl(req)}/api/twiml/conference?who=${who}&lead=${encodeURIComponent(lead)}`;
    // Only To, From and Url: trial accounts reject extra settings such as Timeout.
    const ring = (to, who) => twilio('/Calls.json', { To: to, From: process.env.TWILIO_FROM, Url: twimlUrl(who) });

    // Agent first, so the agent is already in the room when the customer picks up.
    const agentCall = await ring(agent, 'agent');
    const customerCall = customer ? await ring(customer, 'customer') : null;
    res.status(200).json({ calls: [agentCall.sid, customerCall?.sid].filter(Boolean) });
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: err.message });
  }
}
