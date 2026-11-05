// Twilio fetches this when each phone is answered. We reply with TwiML: the instructions for the call.
// Both phones join the same conference room, so the agent and customer can talk.
import { isFromTwilio, xml } from '../_lib/twilio.js';

export default async function handler(req, res) {
  if (!(await isFromTwilio(req))) return res.status(403).send('Forbidden');

  const { who, lead } = req.query;
  const greeting = who === 'agent'
    ? `Connecting you to ${lead}.`
    : 'Hello, this is The Sleep Company. Connecting you to your advisor.';

  res.setHeader('Content-Type', 'text/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>${xml(greeting)}</Say>
  <Dial timeLimit="600"><Conference endConferenceOnExit="true" beep="false">onground-call</Conference></Dial>
</Response>`);
}
