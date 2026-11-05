// The AI call, one turn at a time. Two modes share this code:
//  - advisor  (?lead=1):         the AI is Avani, an advisor phoning a customer about their lead
//  - practice (?practise=price): the AI plays a customer, and the agent practises handling them
// Twilio fetches this URL when the call is answered, and again each time the person finishes speaking
// (<Gather input="speech"> turns their speech into text and sends it here as SpeechResult).
// We keep the conversation so far in the URL itself (?h=...), so no database is needed.
import { isFromTwilio, xml, baseUrl } from '../_lib/twilio.js';
import { nextLine } from '../_lib/gemini.js';
import { outgoing, practiceScenarios } from '../../src/data/mock.js';

const MAX_TURNS = 6;
const encode = (h) => Buffer.from(JSON.stringify(h)).toString('base64url');
const decode = (s) => { try { return JSON.parse(Buffer.from(s, 'base64url').toString()); } catch { return []; } };

const RULES = 'Rules: this is spoken aloud. Keep each reply under 25 words, 1 or 2 short sentences, no lists, no emojis, no symbols. Be warm and natural.';

// Advisor mode: Avani calls a lead to book a callback or answer a quick question.
function advisor(lead) {
  return {
    query: `lead=${lead.id}`,
    persona: `You are Avani, a friendly advisor at The Sleep Company (an Indian mattress brand), on a phone call with ${lead.name}.
What we know: ${lead.story}. Interested in: ${lead.product} (₹${lead.value}). Good add-on: ${lead.crossSell}. Financing: ${lead.emi}
Goal: find out if they are still interested and book a good time for a human advisor to call back, or answer a quick question.
${RULES}
Ask one question at a time. When the customer has agreed a specific callback time, or clearly wants to stop,
reply with a short goodbye (no question) and add [END] at the very end. Never add [END] to a reply that asks a question.`,
    greeting: `Hi ${lead.name.split(' ')[0]}, this is Avani from The Sleep Company. You tried our ${lead.product} recently. Is this a good time for a quick chat?`,
    silentAgain: "Sorry, I didn't catch that. Could you say it again?",
    silentBye: "I'll let you go for now. An advisor will call you back. Goodbye!",
    turnLimitBye: 'Thanks so much for your time. One of our advisors will call you back soon. Goodbye!',
  };
}

// Practice mode: the AI is a customer; at the end it gives the agent one coaching tip.
function practice(scenario) {
  return {
    query: `practise=${scenario.id}`,
    persona: `${scenario.persona} You are on a phone call with an agent from The Sleep Company, who is practising.
Stay in character as the customer. ${RULES}
When your concern is resolved, or after about 5 exchanges, step out of character and say one sentence starting with "Coach tip:" about what the agent did well or should improve, then add [END].`,
    greeting: scenario.opener,
    silentAgain: 'Hello? Are you still there?',
    silentBye: 'I think we got cut off. That ends this practice call.',
    turnLimitBye: "That's the end of this practice call. Well done, try another scenario next.",
  };
}

export default async function handler(req, res) {
  const started = Date.now();
  const ok = await isFromTwilio(req);
  console.log(JSON.stringify({ step: 'verify', ok, ms: Date.now() - started, speech: Boolean(req.body?.SpeechResult) }));
  if (!ok) return res.status(403).send('Forbidden');

  const scenario = practiceScenarios.find((s) => s.id === req.query.practise);
  const mode = scenario ? practice(scenario) : advisor(outgoing.find((l) => l.id === Number(req.query.lead)) ?? outgoing[0]);
  const history = decode(req.query.h ?? '');
  const heard = req.body?.SpeechResult;
  if (heard) history.push({ role: 'person', text: heard });

  let line;
  let end = false;
  let retry = false; // true when we only ask them to repeat (nothing new to remember)
  const silences = Number(req.query.silent ?? 0);
  if (!history.length) {
    // First turn: a fixed opening line, so the call starts instantly.
    line = mode.greeting;
  } else if (!heard) {
    // Silence (Twilio heard nothing). Ask again once; on the second silence, end politely.
    end = silences >= 2;
    line = end ? mode.silentBye : mode.silentAgain;
  } else {
    try {
      line = await nextLine(mode.persona, history);
    } catch (err) {
      // Both models were too slow or failed. Don't hang up: ask them to repeat, like on a bad line.
      console.error(err.errors ?? err);
      history.pop();
      retry = true;
      line = 'Sorry, I missed that. Could you say it once more?';
    }
  }
  const asksQuestion = line.replace('[END]', '').trim().endsWith('?');
  if (line.includes('[END]') && !asksQuestion) end = true;
  if (!end && history.filter((m) => m.role === 'person').length >= MAX_TURNS) {
    end = true;
    line = mode.turnLimitBye;
  }
  line = line.replace('[END]', '').trim();
  if ((heard && !retry) || !history.length) history.push({ role: 'ai', text: line });

  // Full https URLs: the trial proxies every URL in our TwiML and rejects relative ones.
  const next = `${baseUrl(req)}/api/twiml/ai?${mode.query}&amp;h=${encode(history)}`;
  const nextIfSilent = `${next}&amp;silent=${heard ? 1 : silences + 1}`;
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  ${end
    ? `<Say>${xml(line)}</Say><Hangup/>`
    : `<Gather input="speech" action="${next}"><Say>${xml(line)}</Say></Gather>
  <Redirect>${nextIfSilent}</Redirect>`}
</Response>`;
  console.log(JSON.stringify({ step: 'reply', totalMs: Date.now() - started, end })); // timings only: no call content in logs
  res.setHeader('Content-Type', 'text/xml');
  res.send(twiml);
}
