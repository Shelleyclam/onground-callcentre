// Plan: Calls to make (ranked, expandable, paged), Incoming (missed calls), Recent (call log).
import { useState } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Phone, PhoneMissed, PhoneIncoming, PhoneOutgoing, Sparkles, Mic } from 'lucide-react';
import { outgoing, missed, recent, practiceScenarios, rupees } from '../data/mock.js';

const PAGE_SIZE = 2;
const initials = (name) => name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
const today = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });

function CallsToMake({ onCall, calling }) {
  const ranked = [...outgoing].sort((a, b) => b.score - a.score);
  const pages = Math.ceil(ranked.length / PAGE_SIZE);
  const [page, setPage] = useState(0);
  const [open, setOpen] = useState(null);
  const shown = ranked.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <>
      <div className="plan-head">
        <div className="title">Planned outgoing calls</div>
        <div className="muted">Ranked by lead score, highest first. Tap a lead for the full picture.</div>
      </div>
      <div className="list">
        {shown.map((l) => (
          <div className="card" key={l.id}>
            <button className="row" style={{ width: '100%', textAlign: 'left' }} onClick={() => setOpen(open === l.id ? null : l.id)} aria-expanded={open === l.id}>
              <div className="round" style={{ background: '#fdeee4', color: '#c2410c' }}>{initials(l.name)}</div>
              <div className="grow">
                <div className="title">{l.name}</div>
                <div className="muted ellipsis">Interested: {l.product} · {rupees(l.value)}</div>
              </div>
              <div className="score"><div className="v">{l.score}</div><div className="l">SCORE</div></div>
              {open === l.id ? <ChevronUp size={16} color="#aaa" /> : <ChevronDown size={16} color="#aaa" />}
            </button>
            {open === l.id && (
              <div className="expand">
                <div>
                  <div className="section-label" style={{ margin: '0 0 4px' }}>Story so far</div>
                  <div>{l.story}</div>
                </div>
                <div className="grid-2" style={{ gap: 8 }}>
                  <div className="kv"><div className="k">Preferred product</div><div className="v">{l.product}</div></div>
                  <div className="kv"><div className="k">Cross-sell</div><div className="v">{l.crossSell}</div></div>
                </div>
                <div className="kv warn"><div className="k">EMI / financing</div><div>{l.emi}</div></div>
                <div className="call-actions">
                  <button className="btn btn-primary" onClick={() => onCall(l.name)} disabled={calling}>
                    <Phone size={15} /> {calling ? 'Call in progress…' : 'Place call'}
                  </button>
                  <button className="btn btn-ai" onClick={() => onCall(l.name, { leadId: l.id })} disabled={calling} title="An AI advisor calls the customer for you">
                    <Sparkles size={15} /> AI call
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="pager">
        <button onClick={() => setPage(page - 1)} disabled={page === 0} aria-label="Previous page"><ChevronLeft size={16} /></button>
        Page {page + 1} of {pages}
        <button onClick={() => setPage(page + 1)} disabled={page === pages - 1} aria-label="Next page"><ChevronRight size={16} /></button>
      </div>
    </>
  );
}

// Call back: a short prep screen before returning a missed call.
function CallBack({ m, onCall, calling, onBack }) {
  const lead = outgoing.find((l) => l.name === m.name);
  const opener = lead
    ? `Hi ${m.name.split(' ')[0]}, this is Arvind from The Sleep Company returning your call. You were looking at the ${lead.product}. Is now a good time?`
    : 'Hi, this is Arvind from The Sleep Company returning your call. How can I help you today?';
  return (
    <>
      <button className="link" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}><ChevronLeft size={15} /> Missed calls</button>
      <div className="card" style={{ padding: 14 }}>
        <div className="row" style={{ padding: 0 }}>
          <div className="round" style={{ background: 'var(--red-bg)', color: 'var(--red)' }}><PhoneMissed size={16} /></div>
          <div className="grow">
            <div className="title">Call back {m.name}</div>
            <div className="muted">Missed {m.when} · {m.note}</div>
          </div>
          {m.expected && <span className="money">{rupees(m.expected)} at stake</span>}
        </div>
        <div className="expand" style={{ padding: '12px 0 0', marginTop: 12 }}>
          {lead ? (
            <>
              <div><div className="section-label" style={{ margin: '0 0 4px' }}>What we know</div><div>{lead.story}</div></div>
              <div className="grid-2" style={{ gap: 8 }}>
                <div className="kv"><div className="k">Interested in</div><div className="v">{lead.product}</div></div>
                <div className="kv"><div className="k">Cross-sell</div><div className="v">{lead.crossSell}</div></div>
              </div>
            </>
          ) : <div className="muted">No prior record. Find out who they are and what they need, then log a lead.</div>}
          <div className="kv warn"><div className="k">Suggested opener</div><div>"{opener}"</div></div>
          <div className="call-actions">
            <button className="btn btn-primary" onClick={() => onCall(m.name)} disabled={calling}><Phone size={15} /> {calling ? 'Call in progress…' : 'Call back now'}</button>
            {lead && <button className="btn btn-ai" onClick={() => onCall(m.name, { leadId: lead.id })} disabled={calling}><Sparkles size={15} /> AI call</button>}
          </div>
        </div>
      </div>
    </>
  );
}

// Practise a call: pick a scenario; an AI customer phones you and you handle the conversation.
function Practise({ onCall, calling }) {
  const levelColor = { Easy: 'var(--green)', Medium: 'var(--amber)', Hard: 'var(--red)' };
  return (
    <>
      <div className="plan-head">
        <div className="title">Practise a call</div>
        <div className="muted">Pick a scenario. An AI customer calls your phone, you handle it, and you get a coaching tip at the end.</div>
      </div>
      <div className="list">
        {practiceScenarios.map((s) => (
          <div className="card row" key={s.id}>
            <div className="round" style={{ background: '#f1ebfb', color: 'var(--purple)' }}><Mic size={16} /></div>
            <div className="grow">
              <div className="title">{s.title} <span style={{ color: levelColor[s.level], fontSize: 11, fontWeight: 700, marginLeft: 4 }}>{s.level.toUpperCase()}</span></div>
              <div className="muted ellipsis">{s.sub}</div>
            </div>
            <button className="btn btn-ai btn-small" onClick={() => onCall(`Practice: ${s.title}`, { practise: s.id })} disabled={calling}>
              <Phone size={12} /> Start
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

function Incoming({ onCall, calling }) {
  const [callback, setCallback] = useState(null);
  if (callback) return <CallBack m={callback} onCall={onCall} calling={calling} onBack={() => setCallback(null)} />;
  const atStake = missed.reduce((sum, m) => sum + (m.expected ?? 0), 0);
  return (
    <>
      <div className="plan-head">
        <div className="title">Missed calls</div>
        <div className="muted">Ranked by expected value. Call the highest-value leads back first.</div>
      </div>
      <div className="card summary" style={{ marginBottom: 8 }}>
        <div><div className="v">{missed.length}</div><div className="l">Missed today</div></div>
        <div><div className="v" style={{ color: 'var(--green)' }}>{rupees(atStake)}</div><div className="l">Expected value at stake</div></div>
      </div>
      <div className="list">
        {missed.map((m, i) => (
          <div className="card row" key={i}>
            <div className="round" style={{ background: 'var(--red-bg)', color: 'var(--red)' }}><PhoneMissed size={16} /></div>
            <div className="grow">
              <div className="title">{m.name}</div>
              <div className="muted ellipsis">Missed {m.when} · {m.note}</div>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
              <span className="money">{m.expected ? `${rupees(m.expected)} expected` : <span className="muted">New contact</span>}</span>
              <button className="btn btn-primary btn-small" onClick={() => setCallback(m)}><Phone size={12} /> Call back</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

const typeStyle = {
  out: { icon: PhoneOutgoing, bg: '#e6f6ef', color: 'var(--green)', label: 'Outgoing' },
  in: { icon: PhoneIncoming, bg: '#e8efff', color: 'var(--blue)', label: 'Incoming' },
  missed: { icon: PhoneMissed, bg: 'var(--red-bg)', color: 'var(--red)', label: 'Missed' },
};

function Recent() {
  const [open, setOpen] = useState(null);
  return (
    <>
      <div className="plan-head">
        <div className="title">Recent calls</div>
        <div className="muted">Tap a call to review it against the SOP.</div>
      </div>
      <div className="list">
        {recent.map((r, i) => {
          const t = typeStyle[r.type];
          return (
            <div className="card" key={i}>
              <button className="row" style={{ width: '100%', textAlign: 'left' }} onClick={() => setOpen(open === i ? null : i)}>
                <div className="round" style={{ background: t.bg, color: t.color }}><t.icon size={16} /></div>
                <div className="grow">
                  <div className="title">{r.name}</div>
                  <div className="muted">{t.label} · {r.when} · {r.length ?? '—'}</div>
                </div>
                <ChevronRight size={16} color="#aaa" />
              </button>
              {open === i && (
                <div className="expand muted">
                  {r.length ? 'Greeting in first 10s ✓ · Needs identified ✓ · Cross-sell offered ✗ · Next step agreed ✓' : 'Not connected. Nothing to review yet; call back from Incoming.'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default function Plan({ tab, onCall, calling }) {
  return (
    <>
      <section className="hero">
        <div className="hero-row">
          <div>
            <div className="eyebrow">Today's calling plan</div>
            <h1>Planner</h1>
          </div>
          <span className="chip">{today}</span>
        </div>
      </section>
      <div className="page">
        {tab === 'outgoing' && <CallsToMake onCall={onCall} calling={calling} />}
        {tab === 'incoming' && <Incoming onCall={onCall} calling={calling} />}
        {tab === 'recent' && <Recent />}
        {tab === 'practise' && <Practise onCall={onCall} calling={calling} />}
      </div>
    </>
  );
}
