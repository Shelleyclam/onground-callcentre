// Pulse: the team chat. Home lists AvaniBot, agents, channels and Kudos; tapping one opens the channel.
// Messages you send and answers to "Needs your input" are kept in this screen's state.
import { useState } from 'react';
import { Sparkles, Search, Headset, ShoppingCart, ListChecks, Target, Mic, MessageSquare, Hash, Trophy, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { roleAgents, taskAgents, channels, kudos, messages as seedMessages, needsInput as seedInput } from '../data/mock.js';
import Channel from '../components/Channel.jsx';

const icons = { headset: Headset, cart: ShoppingCart, list: ListChecks, target: Target, mic: Mic };
const accent = { 'callcentre-agent': 'var(--blue)', 'cross-sell-agent': 'var(--purple)', 'sop-agent': 'var(--green)', 'lead-conversion-agent': 'var(--red)', 'capture-agent': 'var(--green)' };

export default function Pulse() {
  const [open, setOpen] = useState(null); // channel id, or null for the home list
  const [agentsOpen, setAgentsOpen] = useState(true);
  const [messages, setMessages] = useState(seedMessages);
  const [pending, setPending] = useState(seedInput); // "Needs your input" cards not answered yet

  const now = () => new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }).replace(' ', '').toLowerCase();

  function send(channel, text) {
    setMessages((all) => ({ ...all, [channel]: [...(all[channel] ?? []), { from: 'me', time: now(), text }] }));
  }

  // Answering the card posts the answer as a message and removes the card.
  function answer(channel, text) {
    send(channel, `${pending[channel].title}: ${text}`);
    setPending(({ [channel]: _, ...rest }) => rest);
  }

  if (open) {
    return (
      <Channel
        id={open}
        messages={messages[open] ?? []}
        card={pending[open]}
        onBack={() => setOpen(null)}
        onSend={(text) => send(open, text)}
        onAnswer={(text) => answer(open, text)}
      />
    );
  }

  const AgentRow = ({ a }) => {
    const Icon = icons[a.icon];
    return (
      <button className="agent-row" style={{ borderLeftColor: accent[a.id] }} onClick={() => setOpen(a.id)}>
        <span className="ic" style={{ color: accent[a.id] }}><Icon size={15} /></span>
        <span className="grow">
          <span className="title"># {a.name}</span>
          <span className="muted" style={{ display: 'block' }}>{a.sub}</span>
        </span>
        {a.metric && <span className="metric">{a.metric}</span>}
        {(pending[a.id] || a.unread > 0) && <span className="pin-badge">📌 {pending[a.id] ? 1 : a.unread}</span>}
      </button>
    );
  };

  return (
    <>
      <section className="hero pulse-hero">
        <div className="hero-row" style={{ alignItems: 'center' }}>
          <div><h1 style={{ display: 'inline' }}>Pulse</h1> <span className="sub">The Sleep Company · Koramangala</span></div>
          <button className="icon-btn" style={{ background: '#fff', color: 'var(--purple)', borderRadius: '50%' }} aria-label="New message"><Plus size={16} /></button>
        </div>
      </section>
      <div className="page">
        <div className="card row" style={{ padding: '10px 12px' }}>
          <Sparkles size={16} color="var(--purple)" />
          <span className="grow muted" style={{ fontSize: 13.5 }}>Ask AvaniBot or search Pulse…</span>
          <Search size={15} color="#aaa" />
        </div>

        <div className="avani card">
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span className="round" style={{ background: 'rgba(255,255,255,.18)' }}><Sparkles size={16} /></span>
            <div>
              <div className="title">AvaniBot <span className="tag">ALWAYS ON</span></div>
              <div style={{ fontSize: 12.5, opacity: 0.85 }}>Ask me about anything happening in Pulse: daily briefs, action items, quick answers</div>
            </div>
          </div>
          <div className="grid-2" style={{ marginTop: 10, gap: 8 }}>
            <button className="avani-btn" onClick={() => setOpen('avanibot')}><Sparkles size={13} /> Daily Brief</button>
            <button className="avani-btn" onClick={() => setOpen('avanibot')}><MessageSquare size={13} /> Ask a question</button>
          </div>
        </div>

        <div className="card" style={{ marginTop: 12 }}>
          <button className="row" style={{ width: '100%', textAlign: 'left' }} onClick={() => setAgentsOpen(!agentsOpen)}>
            <span className="round" style={{ background: '#f1ebfb', color: 'var(--purple)', borderRadius: 8 }}><Sparkles size={15} /></span>
            <span className="grow"><span className="title">Custom Agents</span><span className="muted" style={{ display: 'block' }}>Set up by your manager, already live. Tap to open.</span></span>
            {agentsOpen ? <ChevronUp size={16} color="#aaa" /> : <ChevronDown size={16} color="#aaa" />}
          </button>
          {agentsOpen && (
            <div style={{ padding: '0 12px 12px' }}>
              <div className="group-label">ROLE AGENTS <span>run a team</span></div>
              {roleAgents.map((a) => <AgentRow key={a.id} a={a} />)}
              <div className="group-label">TASK AGENTS <span>move one metric</span></div>
              {taskAgents.map((a) => <AgentRow key={a.id} a={a} />)}
            </div>
          )}
        </div>

        <div className="section-label">Channels</div>
        <div className="list">
          {channels.map((c) => (
            <button key={c.id} className="card row" style={{ textAlign: 'left' }} onClick={() => setOpen(c.id)}>
              <Hash size={16} color="var(--muted)" />
              <span className="grow"><span className="title">{c.name}</span><span className="muted" style={{ display: 'block' }}>{c.sub}</span></span>
              {pending[c.id] ? <span className="pin-badge">📌 1</span> : c.unread > 0 && <span className="count">{c.unread}</span>}
            </button>
          ))}
        </div>

        <div className="kudos">
          <span className="round" style={{ background: 'rgba(255,255,255,.25)' }}><Trophy size={16} /></span>
          <div className="grow" style={{ minWidth: 0 }}>
            <div className="title">Kudos <span className="tag">{kudos.fresh} NEW</span></div>
            <div className="ellipsis" style={{ fontSize: 12.5 }}>{kudos.latest} · {kudos.from}</div>
          </div>
          <div style={{ textAlign: 'right' }}><div className="title" style={{ fontSize: 16 }}>{kudos.total}</div><div style={{ fontSize: 10, fontWeight: 700 }}>ALL-TIME</div></div>
        </div>
      </div>
    </>
  );
}
