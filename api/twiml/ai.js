// The AI call, one turn at a time.
// Twilio fetches this URL when the call is answered, and again each time the customer finishes speaking
// (<Gather input="speech"> turns their speech into text and sends it here as SpeechResult).
// We keep the conversation so far in the URL itself (?h=...), so no database is needed.
import { isFromTwilio, xml, baseUrl } from '../_lib/twilio.js';
import { nextLine } from '../_lib/gemini.js';
import { outgoing } from '../../src/data/mock.js';

const MAX_TURNS = 6;
const encode = (h) => Buffer.from(JSON.stringify(h)).toString('base64url');
const decode = (s) => { try { return JSON.parse(Buffer.from(s, 'base64url').toString()); } catch { return []; } };

function persona(lead) {
  return `You are Avani, a friendly advisor at The Sleep Company (an Indian mattress brand), on a phone call with ${lead.name}.
What we know: ${lead.story}. Interested in: ${lead.product} (₹${lead.value}). Good add-on: ${lead.crossSell}. Financing: ${lead.emi}
Goal: find out if they are still interested and book a good time for a human advisor to call back, or answer a quick question.
Rules: this is spoken aloud, so use 1 or 2 short sentences, no lists, no emojis, no symbols. Be warm and natural.
If they want to stop, or a callback time is agreed, say a short goodbye and end your reply with [END].`;
}

export default async function handler(req, res) {
  const started = Date.now();
  const ok = await isFromTwilio(req);
  console.log(JSON.stringify({ step: 'verify', ok, ms: Date.now() - started, speech: Boolean(req.body?.SpeechResult) }));
  if (!ok) return res.status(403).send('Forbidden');

  const lead = outgoing.find((l) => l.id === Number(req.query.lead)) ?? outgoing[0];
  const history = decode(req.query.h ?? '');
  const heard = req.body?.SpeechResult;
  if (heard) history.push({ role: 'customer', text: heard });

  let line;
  let end = false;
  if (!history.length) {
    // First turn: a fixed greeting, so the call starts instantly.
    line = `Hi ${lead.name.split(' ')[0]}, this is Avani from The Sleep Company. You tried our ${lead.product} recently. Is this a good time for a quick chat?`;
  } else if (!heard) {
    // Silence. Ask once more; if it happens again, end politely.
    end = req.query.silent === '1';
    line = end ? "I'll let you go for now. An advisor will call you back. Goodbye!" : "Sorry, I didn't catch that. Could you say it again?";
  } else {
    try {
      line = await nextLine(persona(lead), history);
    } catch (err) {
      console.error(err);
      line = "Sorry, I'm having trouble on my side. An advisor will call you back shortly. Goodbye!";
      end = true;
    }
  }
  if (line.includes('[END]') || history.filter((m) => m.role === 'customer').length >= MAX_TURNS) end = true;
  line = line.replace('[END]', '').trim();
  if (heard || !history.length) history.push({ role: 'ai', text: line });

  // Full https URLs: the trial proxies every URL in our TwiML and rejects relative ones.
  const next = `${baseUrl(req)}/api/twiml/ai?lead=${lead.id}&amp;h=${encode(history)}`;
  const nextIfSilent = `${next}&amp;silent=1`;
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${end
    ? `<Say>${xml(line)}</Say><Hangup/>`
    : `<Gather input="speech" action="${next}"><Say>${xml(line)}</Say></Gather>
  <Redirect>${nextIfSilent}</Redirect>`}
</Response>`;
  console.log(JSON.stringify({ step: 'reply', totalMs: Date.now() - started, twiml }));
  res.setHeader('Content-Type', 'text/xml');
  res.send(twiml);
}
