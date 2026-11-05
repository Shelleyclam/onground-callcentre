// GET /api/call-status?sids=CA...,CA...  -> current status of each call leg (ringing, in-progress, completed...)
import { twilio } from './_lib/twilio.js';

const valid = (s) => /^CA[0-9a-f]{32}$/.test(s);

export default async function handler(req, res) {
  const list = String(req.query.sids ?? '').split(',').filter(valid).slice(0, 2);
  if (!list.length) return res.status(400).json({ error: 'No call ids' });

  try {
    const calls = await Promise.all(list.map((s) => twilio(`/Calls/${s}.json`)));
    res.status(200).json({ calls: calls.map((c) => ({ sid: c.sid, status: c.status, duration: c.duration })) });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
}
