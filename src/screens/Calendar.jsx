// Calendar: month grid with event dots, a Today button and month switching.
// Tap a day to see its events; the list below shows what's coming up.
import { useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Mail } from 'lucide-react';
import { events } from '../data/mock.js';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const kindColor = { call: 'var(--green)', coaching: 'var(--purple)', visit: '#c98a14', meeting: 'var(--blue)' };
// "2026-11-05" for a Date, using local time (not UTC, which can shift the day).
const key = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export default function Calendar() {
  const today = new Date();
  const [month, setMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(key(today));

  // Blank cells before the 1st, then one cell per day of the month.
  const firstWeekday = month.getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];

  const shift = (n) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));
  const goToday = () => { setMonth(new Date(today.getFullYear(), today.getMonth(), 1)); setSelected(key(today)); };

  const dayEvents = events.filter((e) => e.date === selected);
  const upcoming = events.filter((e) => e.date >= key(today)).slice(0, 4);

  return (
    <div className="page">
      <div className="plan-head" style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <CalendarDays size={16} style={{ marginTop: 2 }} />
        <div>
          <div className="title">Calendar</div>
          <div className="muted">Mirrored from your mailbox. Invites created here land there too.</div>
        </div>
      </div>
      <div className="card row" style={{ background: '#f2f6ff', borderColor: '#dfe7fb', marginBottom: 12 }}>
        <Mail size={16} color="var(--blue)" />
        <span style={{ fontSize: 13 }}>Store visits, coaching sessions and meeting invites all show up here and in your mailbox.</span>
      </div>

      <div className="card calendar">
        <div className="cal-head">
          <button className="cal-nav" onClick={() => shift(-1)} aria-label="Previous month"><ChevronLeft size={16} /></button>
          <span className="title">{month.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-small btn-outline" onClick={goToday}>Today</button>
            <button className="cal-nav" onClick={() => shift(1)} aria-label="Next month"><ChevronRight size={16} /></button>
          </div>
        </div>
        <div className="cal-grid">
          {DAYS.map((d, i) => <div key={i} className="cal-dow">{d}</div>)}
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const k = key(d);
            const dots = events.filter((e) => e.date === k);
            return (
              <button key={i} className={`cal-day ${k === key(today) ? 'today' : ''} ${k === selected ? 'selected' : ''}`} onClick={() => setSelected(k)}>
                {d.getDate()}
                <span className="cal-dots">{dots.map((e) => <i key={e.title} style={{ background: kindColor[e.kind] }} />)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="section-label">{new Date(selected + 'T00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</div>
      <div className="list">
        {dayEvents.length ? dayEvents.map((e) => <EventRow key={e.title} e={e} />) : <div className="muted" style={{ padding: '0 2px' }}>Nothing scheduled.</div>}
      </div>

      <div className="section-label">Upcoming</div>
      <div className="list">{upcoming.map((e) => <EventRow key={e.title} e={e} showDate />)}</div>
    </div>
  );
}

function EventRow({ e, showDate }) {
  return (
    <div className="card row">
      <span className="event-bar" style={{ background: kindColor[e.kind] }} />
      <div className="grow">
        <div className="title">{e.title}</div>
        <div className="muted">{showDate && `${new Date(e.date + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · `}{e.time}</div>
      </div>
    </div>
  );
}
