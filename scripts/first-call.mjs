// Places one real call and prints status until it ends.
// Run: node --env-file=.env scripts/first-call.mjs
const { TWILIO_ACCOUNT_SID: sid, TWILIO_AUTH_TOKEN: token, TWILIO_FROM: from, CALL_TO: to } = process.env;

const missing = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM', 'CALL_TO'].filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing in .env: ${missing.join(', ')}`);
  process.exit(1);
}
const e164 = /^\+[1-9]\d{7,14}$/;
if (!e164.test(from) || !e164.test(to)) {
  console.error('TWILIO_FROM and CALL_TO must look like +14155550123 / +919876543210');
  process.exit(1);
}

const base = `https://api.twilio.com/2010-04-01/Accounts/${sid}`;
const auth = `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`;
// Trial accounts only accept Twilio's template call scripts.
const twimlUrl = 'https://webhooks.twilio.com/v1/Voice/Template/voice_text_to_speech';

async function twilio(path, options = {}) {
  const res = await fetch(`${base}${path}`, { ...options, headers: { Authorization: auth, ...options.headers } });
  const body = await res.json();
  if (!res.ok) throw new Error(`Twilio ${body.code ?? res.status}: ${body.message ?? 'request failed'}${body.more_info ? ` (${body.more_info})` : ''}`);
  return body;
}

const call = await twilio('/Calls.json', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ To: to, From: from, Url: twimlUrl }),
});
console.log(`Call created: ${call.sid}`);

const done = new Set(['completed', 'busy', 'failed', 'no-answer', 'canceled']);
let last = '';
for (;;) {
  const { status, duration, price, price_unit: unit } = await twilio(`/Calls/${call.sid}.json`);
  if (status !== last) console.log(`Status: ${(last = status)}`);
  if (done.has(status)) {
    console.log(`Duration: ${duration ?? 0}s  Price: ${price ?? 'pending'} ${unit ?? ''}`);
    process.exit(status === 'completed' ? 0 : 1);
  }
  await new Promise((r) => setTimeout(r, 2000));
}
