// Floating panel that shows a live call: who we're calling and each phone's status.
// There is no "End call" button: Twilio trial accounts can't hang up a call remotely,
// so the call ends when someone hangs up their phone (or after 10 minutes).
import { Phone, X } from 'lucide-react';

const label = { queued: 'Dialling…', initiated: 'Dialling…', ringing: 'Ringing…', 'in-progress': 'Connected', completed: 'Ended', busy: 'Busy', failed: 'Failed', 'no-answer': 'No answer', canceled: 'Cancelled' };

export default function CallPanel({ call, finished, onClose }) {
  if (!call) return null;
  const [agent, customer] = call.legs;
  const live = call.legs.length > 0 && call.legs.every((l) => l.status === 'in-progress');
  const status = call.error ? 'Could not place call'
    : finished ? 'Call ended'
    : live ? (customer ? 'Live: you and the customer are connected' : 'Live: your phone is connected')
    : call.sids.length ? 'Ringing your phone…' : 'Starting…';

  return (
    <div className="call-panel" role="status">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div className="round" style={{ background: 'var(--green)' }}><Phone size={16} /></div>
        <div style={{ flex: 1 }}>
          <div className="title">{call.lead}</div>
          <div className="status">{status}</div>
        </div>
        {(finished || call.error) && <button onClick={onClose} aria-label="Close"><X size={18} /></button>}
      </div>

      {call.error && <p className="err">{call.error}</p>}

      {call.legs.length > 0 && (
        <div className="legs">
          <div className="leg"><span>Your phone</span><span>{label[agent?.status] ?? '…'}</span></div>
          {customer && <div className="leg"><span>Customer</span><span>{label[customer.status] ?? '…'}{customer.duration ? ` · ${customer.duration}s` : ''}</span></div>}
        </div>
      )}

      {!finished && !call.error && <p className="hint">Answer on your phone. Hang up there to end the call.</p>}
    </div>
  );
}
