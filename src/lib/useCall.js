// Everything about a real phone call, in one hook.
// start(lead)  -> asks our backend to ring the agent's and customer's phones
// then it checks the status every 2 seconds until the phones have hung up.
import { useEffect, useState } from 'react';

const DONE = ['completed', 'busy', 'failed', 'no-answer', 'canceled'];

export function useCall() {
  const [call, setCall] = useState(null); // { lead, sids, legs, error }

  async function start(lead) {
    setCall({ lead, sids: [], legs: [], error: null });
    try {
      const res = await fetch('/api/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Call failed');
      setCall((c) => ({ ...c, sids: data.calls }));
    } catch (err) {
      setCall((c) => ({ ...c, error: err.message }));
    }
  }

  // Poll the status of both phone legs while the call is live.
  const sids = call?.sids.join(',');
  const finished = call?.legs.length > 0 && call.legs.every((l) => DONE.includes(l.status));
  useEffect(() => {
    if (!sids || finished) return;
    const timer = setInterval(async () => {
      const res = await fetch(`/api/call-status?sids=${sids}`);
      if (res.ok) {
        const { calls } = await res.json();
        setCall((c) => (c ? { ...c, legs: calls } : c));
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [sids, finished]);

  return { call, finished, start, close: () => setCall(null) };
}
