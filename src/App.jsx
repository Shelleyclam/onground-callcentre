// The app shell: sidebar + top bar, and which screen is showing.
// Navigation is plain React state (no router) to keep things simple.
import { useState } from 'react';
import { LayoutGrid, Phone, PhoneIncoming, PhoneOutgoing, History, Mic, CalendarDays, MessagesSquare, Bell, Menu, Star } from 'lucide-react';
import { agent } from './data/mock.js';
import { useCall } from './lib/useCall.js';
import CallPanel from './components/CallPanel.jsx';
import Dashboard from './screens/Dashboard.jsx';
import Plan from './screens/Plan.jsx';
import Calendar from './screens/Calendar.jsx';
import Pulse from './screens/Pulse.jsx';

const planTabs = [
  { id: 'outgoing', label: 'Calls to make', icon: PhoneOutgoing },
  { id: 'incoming', label: 'Incoming', icon: PhoneIncoming },
  { id: 'recent', label: 'Recent', icon: History },
  { id: 'practise', label: 'Practise a call', icon: Mic },
];

export default function App() {
  const [screen, setScreen] = useState('dash');
  const [planTab, setPlanTab] = useState('outgoing');
  const [menuOpen, setMenuOpen] = useState(false);
  const phone = useCall();

  function go(next, tab) {
    setScreen(next);
    if (tab) setPlanTab(tab);
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }

  const NavItem = ({ id, label, icon: Icon, color }) => (
    <button className={`nav-item ${screen === id ? 'active' : ''}`} style={{ '--icon-bg': color }} onClick={() => go(id)}>
      <span className="nav-icon"><Icon size={16} /></span>
      {label}
    </button>
  );

  return (
    <div className="app">
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="brand">On-Ground.ai</div>
        <NavItem id="dash" label="Dashboard" icon={LayoutGrid} color="var(--green)" />
        <NavItem id="plan" label="Plan" icon={Phone} color="var(--blue)" />
        <div className="subnav">
          {planTabs.map(({ id, label, icon: Icon }) => (
            <button key={id} className={screen === 'plan' && planTab === id ? 'active' : ''} onClick={() => go('plan', id)}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
        <NavItem id="calendar" label="Calendar" icon={CalendarDays} color="#c98a14" />
        <NavItem id="pulse" label="Pulse" icon={MessagesSquare} color="var(--purple)" />
      </aside>

      <div className="main" onClick={() => menuOpen && setMenuOpen(false)}>
        <header className="topbar">
          <div className="logo">
            <button className="icon-btn menu-btn" aria-label="Menu" onClick={(e) => { e.stopPropagation(); setMenuOpen(true); }}><Menu size={18} /></button>
            <span className="logo-mark">OG</span> On-Ground.ai
          </div>
          <div className="topbar-right">
            <button className="icon-btn" aria-label="Notifications"><Bell size={17} /><span className="dot" /></button>
            <span className="pill">{agent.score}</span>
            <span className="pill hide-phone"><Star size={12} fill="#ffd166" color="#ffd166" /> #{agent.rank}</span>
            <span className="avatar">{agent.initials}</span>
          </div>
        </header>

        {screen === 'dash' && <Dashboard go={go} />}
        {screen === 'plan' && <Plan tab={planTab} onCall={phone.start} calling={Boolean(phone.call && !phone.finished)} />}
        {screen === 'calendar' && <Calendar />}
        {screen === 'pulse' && <Pulse />}
      </div>

      <CallPanel call={phone.call} finished={phone.finished} onHangUp={phone.hangUp} onClose={phone.close} />
    </div>
  );
}
