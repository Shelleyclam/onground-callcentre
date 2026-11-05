// Small helpers shared by the /api functions. No Twilio SDK: plain fetch keeps it easy to read.
import crypto from 'node:crypto';

const sid = () => process.env.TWILIO_ACCOUNT_SID;
const token = () => process.env.TWILIO_AUTH_TOKEN;

// Call Twilio's REST API. `params` (optional) is sent as a form, which is what Twilio expects.
export async function twilio(path, params, method = params ? 'POST' : 'GET') {
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid()}${path}`, {
    method,
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid()}:${token()}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params ? new URLSearchParams(params) : undefined,
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`Twilio ${body.code ?? res.status}: ${body.message ?? 'request failed'}`);
  return body;
}

// The public https address of this deployment, e.g. https://onground.vercel.app
export function baseUrl(req) {
  return `https://${req.headers['x-forwarded-host'] ?? req.headers.host}`;
}

// Is this request really from Twilio, about one of our calls?
// 1) Normally Twilio signs each request with our auth token; we recompute the signature and compare.
// 2) On trial accounts Twilio fetches through a proxy that sends NO signature. Then we take the
//    CallSid it sent and look it up in our own account: only a real, live call of ours passes.
export async function isFromTwilio(req) {
  const params = req.body && typeof req.body === 'object' ? req.body : {};
  const given = req.headers['x-twilio-signature'];
  if (given) {
    const data = baseUrl(req) + req.url + Object.keys(params).sort().map((k) => k + params[k]).join('');
    const expected = crypto.createHmac('sha1', token()).update(data).digest('base64');
    return given.length === expected.length && crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected));
  }
  if (params.AccountSid !== sid() || !/^CA[0-9a-f]{32}$/.test(params.CallSid ?? '')) return false;
  try {
    const call = await twilio(`/Calls/${params.CallSid}.json`);
    return ['ringing', 'in-progress'].includes(call.status);
  } catch {
    return false;
  }
}

// Only numbers listed in ALLOWED_NUMBERS (comma separated) can ever be dialled.
export function isAllowed(number) {
  const list = (process.env.ALLOWED_NUMBERS ?? '').split(',').map((n) => n.trim()).filter(Boolean);
  return Boolean(number) && list.includes(number);
}

// Rate limit without a database: ask Twilio how many calls this account started recently.
export async function tooManyRecentCalls({ maxCalls = 6, minutes = 10 } = {}) {
  const { calls } = await twilio('/Calls.json?PageSize=20');
  const since = Date.now() - minutes * 60_000;
  return calls.filter((c) => new Date(c.date_created).getTime() > since).length >= maxCalls;
}

// Escape text before putting it inside TwiML (XML).
export const xml = (s) => String(s).replace(/[<>&"']/g, (c) => `&#${c.charCodeAt(0)};`);
