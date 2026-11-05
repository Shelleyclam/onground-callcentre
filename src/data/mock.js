// All sample data for the app lives here. Nothing is fetched from a server except real calls.

export const agent = { name: 'Arvind Rajan', initials: 'AR', company: 'The Sleep Company', team: 'Call Centre', score: 76, rank: 3 };

export const kpis = [
  { label: 'OG Score', value: '76', delta: '▲13', good: true },
  { label: 'Avg handle time', value: '4m 12s', delta: '▼8%', good: true },
  { label: 'CSAT today', value: '94%', delta: '▲2pt', good: true },
  { label: 'In queue', value: '2', delta: '● live', good: true },
];

export const progress = [
  { label: 'Leads created', value: 3, delta: '+1' },
  { label: 'Leads called', value: 2, delta: '+2' },
];

export const waiting = [
  { name: 'Priya Iyer', reason: 'Likely billing dispute, flagged before', wait: '4m 20s', urgent: true },
  { name: 'Suresh Nair', reason: 'Plan upgrade enquiry', wait: '1m 50s', urgent: false },
];

export const earnings = { amount: 5200, coached: 1700, slabMin: 800, slabMax: 6000 };

export const tasks = [
  { id: 'callbacks', icon: 'phone', count: 2, label: 'callbacks', hint: 'next 4:30pm' },
  { id: 'leads', icon: 'users', count: 2, label: 'hot leads', hint: 'untouched 24h' },
  { id: 'outcome', icon: 'note', count: 1, label: 'outcome', hint: 'to log' },
];

export const week = [
  { day: 'Mon', calls: 18, csat: 88 },
  { day: 'Tue', calls: 22, csat: 90 },
  { day: 'Wed', calls: 15, csat: 85 },
  { day: 'Thu', calls: 26, csat: 92 },
  { day: 'Fri', calls: 20, csat: 89 },
  { day: 'Sat', calls: 12, csat: 91 },
  { day: 'Today', calls: 14, csat: 94 },
];

// Outgoing calls, ranked by score (highest first) in the Plan screen.
export const outgoing = [
  { id: 1, name: 'Ritu S.', product: 'Smart Luxe Mattress', value: 13390, score: 96,
    story: 'Visited RT Nagar store, tried the Smart Luxe in person → called back after the visit, missed, needs a callback',
    crossSell: 'Mattress Protector · ₹1,999', emi: 'Not yet discussed. Raise it early, she asked about total cost.' },
  { id: 2, name: 'Mukunda', product: 'Ortho GRID', value: 8490, score: 90,
    story: 'Compared Ortho GRID with a competitor online → asked about back support on WhatsApp',
    crossSell: 'Ortho Pillow pair · ₹2,498', emi: 'Asked for 6-month no-cost EMI.' },
  { id: 3, name: 'Faizan A.', product: 'Luxe Recliner Bed', value: 24990, score: 88,
    story: 'Store walk-in, liked the recliner → wants delivery before the 20th',
    crossSell: 'Bed sheet set · ₹1,499', emi: 'Prefers card EMI, 9 months.' },
  { id: 4, name: 'Kavitha R.', product: 'Smart Ergo Chair', value: 24990, score: 84,
    story: 'Works from home, back pain → abandoned cart at payment',
    crossSell: 'Lumbar cushion · ₹999', emi: 'Not yet discussed.' },
  { id: 5, name: 'Divya P.', product: 'Ortho Mattress', value: 18490, score: 79,
    story: 'Downloaded size guide → no reply to two emails',
    crossSell: 'Mattress Protector · ₹1,999', emi: 'Not yet discussed.' },
  { id: 6, name: 'Arjun M.', product: 'Pillow bundle', value: 3990, score: 72,
    story: 'Repeat customer → browsing pillows this week',
    crossSell: 'Pillow covers · ₹799', emi: 'Not needed.' },
];

export const missed = [
  { name: 'Faizan A.', when: 'Today 10:05 AM', note: 'Visited store / in CRM', expected: 24990 },
  { name: 'Kavitha R.', when: 'Yesterday 4:40 PM', note: 'Warm lead', expected: 24990 },
  { name: 'Divya P.', when: 'Yesterday 2:15 PM', note: 'Cold lead', expected: 18490 },
  { name: 'Ritu S.', when: 'Today 11:20 AM', note: 'Visited store / in CRM', expected: 13390 },
  { name: 'Unknown', when: 'Yesterday', note: 'No prior record', expected: null },
];

// type: out = outgoing, in = incoming, missed
export const recent = [
  { name: 'Mukunda R.', type: 'out', when: '10:42 AM', length: '4m 12s' },
  { name: 'Kavitha R.', type: 'in', when: 'Yesterday', length: '2m 05s' },
  { name: 'Unknown', type: 'missed', when: 'Yesterday', length: null },
  { name: 'Ritu S.', type: 'missed', when: 'Today 11:20 AM', length: null },
  { name: 'Faizan A.', type: 'missed', when: 'Today 10:05 AM', length: null },
  { name: 'Faizan A.', type: 'in', when: 'Mon', length: '6m 40s' },
];

// Hot leads shown in the Leads modal (opened from "2 hot leads" on the dashboard).
export const hotLeads = [
  { name: 'Ritu S.', product: 'Smart Luxe Mattress', value: 13390, icp: 92, intent: 88, lastTouch: '26h ago',
    signals: ['Tried the mattress in store for 15 minutes', 'Asked about total cost and EMI', 'Opened price email twice', 'Missed our callback yesterday'] },
  { name: 'Faizan A.', product: 'Luxe Recliner Bed', value: 24990, icp: 85, intent: 91, lastTouch: '31h ago',
    signals: ['Store walk-in with family', 'Asked for delivery before the 20th', 'Viewed recliner page 4 times'] },
];

export const events = [
  { date: '2026-11-05', time: '4:30 PM', title: 'Callback: Priya Iyer', kind: 'call' },
  { date: '2026-11-12', time: '11:00 AM', title: 'Coaching with Sunita', kind: 'coaching' },
  { date: '2026-11-23', time: '10:00 AM', title: 'Store visit: RT Nagar', kind: 'visit' },
  { date: '2026-11-26', time: '3:00 PM', title: 'Team review', kind: 'meeting' },
  { date: '2026-11-28', time: '12:00 PM', title: 'Product training: Ergo range', kind: 'coaching' },
  { date: '2026-12-03', time: '2:00 PM', title: 'Quarterly targets', kind: 'meeting' },
];

export const roleAgents = [{ id: 'callcentre-agent', name: 'callcentre-agent', sub: 'Call Centre Agent', icon: 'headset', unread: 2 }];

export const taskAgents = [
  { id: 'cross-sell-agent', name: 'cross-sell-agent', sub: 'Your attach rate · 5 members', metric: '24%', icon: 'cart', unread: 2 },
  { id: 'sop-agent', name: 'sop-agent', sub: 'Your SOP adherence · 5 members', metric: '81%', icon: 'list', unread: 2 },
  { id: 'lead-conversion-agent', name: 'lead-conversion-agent', sub: 'Lead conversion agent', metric: null, icon: 'target', unread: 2 },
  { id: 'capture-agent', name: 'capture-agent', sub: 'Your capture coverage · 5 members', metric: '78%', icon: 'mic', unread: 2 },
];

export const channels = [
  { id: 'callcentre-team', name: 'callcentre-team', sub: 'Call Centre Team', unread: 1 },
  { id: 'all-stores', name: 'all-stores', sub: 'All Stores', unread: 0 },
];

export const kudos = { latest: '"Great work with Mukunda, closed that objection like a pro"', from: 'Sunita Rao', fresh: 3, total: 12 };

// Chat history per channel. from: 'me' = the agent using the app.
export const messages = {
  'callcentre-team': [
    { from: 'Sunita Rao', initials: 'SR', time: '2:05pm', text: 'Stakeholders: @You (Arvind R.) and the whole call centre shift.' },
    { from: 'Sunita Rao', initials: 'SR', time: '2:05pm', text: 'Issue: greeting-in-first-10s QA score is 71% this week, below our 85% target.' },
    { from: 'Sunita Rao', initials: 'SR', time: '2:05pm', text: "Suggested fix: open every call with the greeting script. I'll check back Friday." },
    { from: 'me', time: '2:10pm', text: 'On it! Will open every call with the greeting script.' },
    { from: 'Sunita Rao', initials: 'SR', time: '2:14pm', text: 'Great attitude Arvind' },
  ],
  'cross-sell-agent': [
    { from: 'cross-sell-agent', initials: 'AI', time: '9:00am', text: 'Your attach rate is 24% (team 31%). Mattress buyers say yes to a protector 2 in 5 times when it is offered before price.' },
  ],
};

// Pinned "Needs your input" cards per channel.
export const needsInput = {
  'callcentre-team': { title: 'Confirm the 4:30pm callback', sub: 'Priya Iyer · likely billing dispute', options: ['Confirmed', 'Reschedule'] },
  'cross-sell-agent': { title: 'Offer the protector on your next mattress call?', sub: 'Ritu S. · Smart Luxe', options: ['Yes', 'Not this one'] },
};

export const rupees = (n) => `₹${n.toLocaleString('en-IN')}`;
