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

// Twilio signs every webhook it sends. We recompute the signature with our auth token;
// if it matches, the request really came from Twilio (and not from someone guessing our URL).
export function isFromTwilio(req) {
  const given = req.headers['x-twilio-signature'];
  if (!given) return false;
  const url = baseUrl(req) + req.url;
  const params = req.body && typeof req.body === 'object' ? req.body : {};
  const data = url + Object.keys(params).sort().map((k) => k + params[k]).join('');
  const expected = crypto.createHmac('sha1', token()).update(data).digest('base64');
  return given.length === expected.length && crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected));
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
