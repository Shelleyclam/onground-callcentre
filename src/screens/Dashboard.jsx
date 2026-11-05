// Dashboard: KPIs, today's progress, who is waiting, earnings, tasks and 7-day charts.
import { useState } from 'react';
import { Headset, Phone, Users, NotebookPen, ChevronRight, CalendarDays } from 'lucide-react';
import { BarChart, Bar, XAxis, LabelList, ResponsiveContainer, Cell } from 'recharts';
import { agent, kpis, progress, waiting, earnings, tasks, week, rupees } from '../data/mock.js';
import LeadsModal from '../components/LeadsModal.jsx';

const taskIcons = { phone: Phone, users: Users, note: NotebookPen };

// One small bar chart; the last bar ("Today") is darker.
function WeekChart({ dataKey, color, today, suffix = '' }) {
  return (
    <div className="card chart-card">
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={week} margin={{ top: 18, right: 0, left: 0, bottom: 0 }}>
          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9aa0ab' }} />
          <Bar dataKey={dataKey} radius={[4, 4, 0, 0]}>
            {week.map((d) => <Cell key={d.day} fill={d.day === 'Today' ? today : color} />)}
            <LabelList dataKey={dataKey} position="top" formatter={(v) => v + suffix} style={{ fontSize: 11, fontWeight: 600, fill: '#555' }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Dashboard({ go }) {
  const [leadsOpen, setLeadsOpen] = useState(false);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const pct = ((earnings.amount - earnings.slabMin) / (earnings.slabMax - earnings.slabMin)) * 100;

  function openTask(id) {
    if (id === 'leads') setLeadsOpen(true);
    if (id === 'callbacks') go('plan', 'incoming');
    if (id === 'outcome') go('plan', 'recent');
  }

  return (
    <>
      <section className="hero">
        <div className="hero-row">
          <div>
            <div className="eyebrow">{greeting} 👋</div>
            <h1>{agent.name}</h1>
            <div className="sub">{agent.company} · {agent.team}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
            <span className="chip" style={{ color: 'var(--mint)' }}>● On queue</span>
            <span className="chip"><CalendarDays size={13} /> This week</span>
          </div>
        </div>
        <div className="kpis">
          {kpis.map((k) => (
            <div className="kpi" key={k.label}>
              <div className="v">{k.value}</div>
              <div className="l">{k.label}</div>
              <span className="d">{k.delta}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="page">
        <div className="grid-2">
          <div>
            <div className="progress-card">
              <div className="label">● MY PROGRESS · TODAY</div>
              <div className="progress-stats">
                {progress.map((p) => (
                  <div key={p.label}>
                    <div className="v">{p.value}</div>
                    <div className="d">▲ {p.delta}</div>
                    <div className="l">{p.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="section-head">
              <div className="section-label">Who's waiting</div>
              <button className="link" onClick={() => go('plan', 'outgoing')}>Open planner →</button>
            </div>
            <div className="list">
              {waiting.map((w) => (
                <div className="card row" key={w.name}>
                  <div className="round" style={{ background: 'var(--bg)', color: 'var(--muted)' }}><Headset size={16} /></div>
                  <div className="grow">
                    <div className="title">{w.name}</div>
                    <div className="muted ellipsis">{w.reason}</div>
                  </div>
                  <span className={`wait-badge ${w.urgent ? 'urgent' : 'calm'}`}>{w.wait}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="card earnings">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="title">💰 My earnings this month</span>
                <span className="muted">{rupees(earnings.slabMin)} to {rupees(earnings.slabMax)} slab</span>
              </div>
              <div><span className="amount">{rupees(earnings.amount)}</span> <span className="muted">{rupees(earnings.coached)} from coached moves</span></div>
              <div className="bar"><span style={{ width: `${pct}%` }} /></div>
            </div>

            <div className="tasks">
              <h3>📋 My Tasks <span className="count">{tasks.length}</span></h3>
              {tasks.map((t) => {
                const Icon = taskIcons[t.icon];
                return (
                  <button className="task" key={t.id} onClick={() => openTask(t.id)}>
                    <span className="ic"><Icon size={15} /></span>
                    <span style={{ flex: 1 }}><b>{t.count} {t.label}</b> <span className="muted">{t.hint}</span></span>
                    <ChevronRight size={16} color="#aaa" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="section-label">Calls handled · last 7 days</div>
        <WeekChart dataKey="calls" color="#5fcca5" today="#17795c" />
        <div className="section-label">CSAT trend · last 7 days</div>
        <WeekChart dataKey="csat" color="#93b0f0" today="#2457b8" suffix="%" />
      </div>

      {leadsOpen && <LeadsModal onClose={() => setLeadsOpen(false)} />}
    </>
  );
}
