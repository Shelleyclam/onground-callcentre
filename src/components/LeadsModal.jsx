// Leads modal: one hot lead at a time, with ICP and intent scores,
// collapsible buying signals, and next / previous paging.
import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { hotLeads, rupees } from '../data/mock.js';

function ScoreBar({ label, value, color }) {
  return (
    <div className="kv" style={{ flex: 1 }}>
      <div className="k">{label}</div>
      <div className="v" style={{ color }}>{value}<span className="muted">/100</span></div>
      <div className="bar"><span style={{ width: `${value}%`, background: color }} /></div>
    </div>
  );
}

export default function LeadsModal({ onClose }) {
  const [i, setI] = useState(0);
  const [showSignals, setShowSignals] = useState(true);
  const lead = hotLeads[i];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal card" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Hot leads">
        <div className="modal-head">
          <span className="title">Hot leads · untouched 24h</span>
          <button onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="row" style={{ padding: '4px 0 12px' }}>
          <div className="round" style={{ background: '#fdeee4', color: '#c2410c' }}>{lead.name.split(' ').map((w) => w[0]).join('')}</div>
          <div className="grow">
            <div className="title">{lead.name}</div>
            <div className="muted">{lead.product} · {rupees(lead.value)} · last touch {lead.lastTouch}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <ScoreBar label="ICP fit" value={lead.icp} color="var(--green)" />
          <ScoreBar label="Intent" value={lead.intent} color="var(--blue)" />
        </div>

        <button className="signals-toggle" onClick={() => setShowSignals(!showSignals)}>
          Buying signals ({lead.signals.length}) {showSignals ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>
        {showSignals && (
          <ul className="signals">
            {lead.signals.map((s) => <li key={s}>{s}</li>)}
          </ul>
        )}

        <div className="pager">
          <button onClick={() => setI(i - 1)} disabled={i === 0} aria-label="Previous lead"><ChevronLeft size={16} /></button>
          Lead {i + 1} of {hotLeads.length}
          <button onClick={() => setI(i + 1)} disabled={i === hotLeads.length - 1} aria-label="Next lead"><ChevronRight size={16} /></button>
        </div>
      </div>
    </div>
  );
}
