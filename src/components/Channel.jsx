// One Pulse channel: header with back button, pinned "Needs your input" card,
// chat bubbles (others on the left, you on the right) and a message box.
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Pin, ChevronUp, ChevronDown, Send } from 'lucide-react';

export default function Channel({ id, messages, card, onBack, onSend, onAnswer }) {
  const [draft, setDraft] = useState('');
  const [reply, setReply] = useState('');
  const [cardOpen, setCardOpen] = useState(true);
  const bottom = useRef(null);

  // Keep the newest message in view.
  useEffect(() => { bottom.current?.scrollIntoView({ block: 'end' }); }, [messages.length]);

  function submit(e) {
    e.preventDefault();
    if (draft.trim()) { onSend(draft.trim()); setDraft(''); }
  }
  function submitReply(e) {
    e.preventDefault();
    if (reply.trim()) { onAnswer(reply.trim()); setReply(''); }
  }

  const name = id === 'avanibot' ? 'AvaniBot' : `#${id}`;
  const shown = messages.length || id !== 'avanibot' ? messages
    : [{ from: 'AvaniBot', initials: 'AI', time: 'now', text: 'Daily brief: 2 callbacks today (next 4:30pm, Priya Iyer). 2 hot leads untouched for 24h: Ritu S. and Faizan A. Your CSAT is up 2 points.' }];

  return (
    <div className="channel">
      <header className="channel-head">
        <button className="icon-btn" onClick={onBack} aria-label="Back"><ArrowLeft size={17} /></button>
        <span className="title" style={{ fontSize: 15 }}>{name}</span>
      </header>

      {card && (
        <div className="needs-input">
          <button className="needs-head" onClick={() => setCardOpen(!cardOpen)}>
            <Pin size={14} /> <b>Needs your input</b> <span className="count">1</span> <span className="muted">pinned</span>
            <span style={{ marginLeft: 'auto' }}>{cardOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}</span>
          </button>
          {cardOpen && (
            <div className="needs-card">
              <div className="title">{card.title}</div>
              <div className="muted">{card.sub}</div>
              <div style={{ display: 'flex', gap: 6, margin: '8px 0' }}>
                {card.options.map((o) => <button key={o} className="btn btn-small btn-outline" onClick={() => onAnswer(o)}>{o}</button>)}
              </div>
              <form onSubmit={submitReply} style={{ display: 'flex', gap: 6 }}>
                <input className="input" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Or type your answer" />
                <button className="btn btn-small" style={{ background: 'var(--amber)', color: '#fff' }}>Send</button>
              </form>
            </div>
          )}
        </div>
      )}

      <div className="messages">
        <div className="muted" style={{ textAlign: 'center' }}>Today</div>
        {shown.map((m, i) => m.from === 'me' ? (
          <div key={i} className="msg mine">
            <div className="msg-meta"><b>You</b> {m.time}</div>
            <div className="bubble">{m.text}</div>
          </div>
        ) : (
          <div key={i} className="msg">
            <span className="avatar small">{m.initials}</span>
            <div>
              <div className="msg-meta"><b>{m.from}</b> {m.time}</div>
              <div className="bubble">{m.text}</div>
            </div>
          </div>
        ))}
        <div ref={bottom} />
      </div>

      <form className="composer" onSubmit={submit}>
        <input className="input" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={`Message ${name}…`} />
        <button className="send" aria-label="Send" disabled={!draft.trim()}><Send size={16} /></button>
      </form>
    </div>
  );
}
