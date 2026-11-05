# On-Ground Call Centre

A rebuild of the On-Ground.ai Call Centre app, with **real phone calls**: human-to-human through Twilio, and AI-to-human through Twilio speech recognition with Gemini.

- **Live:** https://onground-callcentre.vercel.app
- **Demo video:** _link in the submission email_

> **Calling on the live link is limited by design.** The server dials only numbers on its own allowlist. On this Twilio trial, that's my verified phone. A visitor can click **Place call**, but it can only ring my phone, a few times per 10 minutes.

## What's built

| Area | Done |
|---|---|
| App shell | Sidebar with Plan sub-navigation, top bar, phone-width layout with a slide-in menu |
| Dashboard | KPI cards, today's progress, who is waiting, earnings, My Tasks, two 7-day charts (Recharts) |
| Leads modal | Opens from "2 hot leads" in My Tasks. ICP and intent scores, collapsible buying signals, previous / next |
| Plan: Calls to make | Ranked by score, expandable rows (story, product, cross-sell, EMI), paging, **Place call** and **AI call** |
| Plan: Incoming | Missed calls, total value at stake, **Call back** on every row, which opens a prep screen with context and a suggested opener |
| Plan: Recent | Type, time and length; tap a call to see its SOP review |
| Plan: Practise a call | Pick a scenario. **An AI customer phones you**, you handle it, and you get a coaching tip at the end |
| Calendar | Month grid, event dots, Today button, month switcher, day agenda, upcoming list |
| Pulse home | AvaniBot, role and task agents, channels, Kudos |
| Pulse channel | Back button, header, pinned **Needs your input** card (two buttons and a reply box), chat bubbles with times, **sending messages**, **answering the card** |

**Skipped or simplified:**
- No log-in.
- Data is sample data from [src/data/mock.js](src/data/mock.js) and isn't saved: sent messages reset on reload.
- AvaniBot's "Ask a question" opens a canned daily brief rather than a live AI chat.
- The notification bell and OG score pills are display-only.
- There is no in-app **End call** button. The Twilio trial blocks hanging up a call remotely (see below), so the panel says to hang up on the phone.

## How calling works

### Human-to-human: a conference bridge

```
Browser ──POST /api/call {lead}──▶ server: allowlist + rate-limit check
                                      │  Twilio REST: create call → agent phone
                                      │  Twilio REST: create call → customer phone
Each phone answers ──▶ Twilio fetches /api/twiml/conference
                       ◀── TwiML: <Say>Connecting you…</Say><Dial><Conference>…
Both legs join one conference, so the two people talk.
Browser polls /api/call-status every 2s and shows Ringing / Connected / Ended.
```

The agent uses their own phone. This is a common click-to-call pattern, and it's what the Twilio trial allows: browser calling and `<Dial><Number>` are both blocked on trial.

### AI-to-human: a turn-by-turn conversation

```
POST /api/ai-call ──▶ Twilio calls the customer, with Url = /api/twiml/ai?lead=1
Answer ──▶ /api/twiml/ai returns: <Gather input="speech"><Say>greeting</Say></Gather>
Customer speaks ──▶ Twilio turns speech into text and POSTs it to /api/twiml/ai
                    server asks Gemini for the next line (persona + lead context + conversation so far)
                    ◀── <Gather><Say>reply</Say></Gather>   …repeat…
When a callback time is agreed, the AI says goodbye ──▶ <Hangup/>
```

- **No database.** The conversation so far is carried in the next webhook URL (`?h=…`, base64 JSON).
- **Speed.** Twilio waits about 5 seconds for each reply. The server asks two fast Gemini "flash-lite" models at once and uses the first answer (usually about 1 second). If both are slow, the AI asks the person to repeat rather than hanging up.
- **Practise a call** uses the same code with the roles swapped: the AI plays a customer from a scenario, rings the agent, and ends with a one-line coaching tip.

### Safety on a public link

- **Allowlist.** The browser never sends a phone number. The server dials only `AGENT_PHONE` and `CUSTOMER_PHONE`, and only if they appear in `ALLOWED_NUMBERS`.
- **Rate limit.** Before placing a call, the server asks Twilio how many calls the account started in the last 10 minutes, and refuses above the cap. This needs no database: Twilio is the counter.
- **Webhook check.** Normally Twilio signs every webhook (`X-Twilio-Signature`) and we verify it with HMAC-SHA1. On trial accounts Twilio fetches through a proxy that sends **no signature**. For those requests the server instead confirms that the `AccountSid` is ours and that the `CallSid` belongs to a **live call in our account**, by looking it up with the Twilio API.
- **Secrets.** All secrets live in `.env` locally and in Vercel environment variables. Nothing is in git.

### Twilio trial limits we found and designed around

| Symptom | Cause | Fix |
|---|---|---|
| Call refused: "limited parameter access" | Trial rejects inline `Twiml` and extras like `Timeout` | Send only `To`, `From`, `Url` |
| Call connects, silence | Trial rejects some TwiML (relative URLs, `Dial timeLimit`) | Absolute URLs, minimal attributes |
| "Please check your URL" | Trial webhooks arrive unsigned, so signature check failed | Live-call lookup (above) |
| End call does nothing | Trial blocks updating calls and kicking participants | Removed the button; hang up on the phone |

## Stack, and why

- **React and Vite.** The brief prefers React. Vite is the simplest standard setup.
- **Plain React state for navigation** instead of a router, because there are only four screens.
- **Recharts** for the charts, **lucide-react** for icons.
- **One CSS file** with colour variables. Easy to read, no framework to learn.
- **Vercel.** It hosts the static app, and each file in `api/` becomes a serverless function, with no server to run. WebSockets weren't needed, because the trial blocks media streams and the AI call uses speech-to-text webhooks instead.
- **Twilio REST API through `fetch`**, without the SDK, so every request is visible in [api/_lib/twilio.js](api/_lib/twilio.js).
- **Gemini, AI Studio free tier,** for the AI caller.

## Project structure

```
api/
  _lib/twilio.js        Twilio REST helper, webhook check, allowlist, rate limit
  _lib/gemini.js        asks Gemini for the AI's next line
  call.js               POST: ring agent + customer into a conference
  ai-call.js            POST: AI advisor call, or a practice call
  call-status.js        GET: status of each call leg
  twiml/conference.js   TwiML: greeting + join the conference
  twiml/ai.js           TwiML: one turn of the AI conversation
src/
  App.jsx               shell: sidebar, top bar, screen switching, call panel
  screens/              Dashboard, Plan (all four tabs), Calendar, Pulse
  components/           CallPanel, LeadsModal, Channel
  lib/useCall.js        start a call and poll its status
  data/mock.js          all sample data
scripts/
  first-call.mjs        the first standalone test call
  push-env.mjs          copy .env settings to Vercel without printing them
  deploy.mjs            deploy the last commit to Vercel
```

## Run it locally

Requires Node 20 or later.

```bash
npm install
npm run dev            # UI only, at http://localhost:5173 (calls need the API, see below)
```

Calling needs a public URL, because Twilio must reach the webhooks. So the API runs on Vercel:

1. Copy `.env.example` to `.env` and fill it in:
   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`
   - `TWILIO_FROM`: your Twilio number
   - `AGENT_PHONE`: the agent's phone
   - `CUSTOMER_PHONE`: optional
   - `ALLOWED_NUMBERS`: comma separated
   - `GEMINI_API_KEY`
2. Run `npx vercel link`, then `node scripts/push-env.mjs`, then `node scripts/deploy.mjs`.
3. On a Twilio trial, every number you call must be a Verified Caller ID, and the target country must be enabled in Voice geo-permissions.

`node --env-file=.env scripts/first-call.mjs` places one standalone test call.

## AI tools used

- **Claude Code (Claude Opus)** as a pair programmer in VS Code: scaffolding, writing code, debugging the Twilio trial limits from logs, and drafting this README. I directed the decisions and tested every call on a real phone.
- **Google Gemini** (`gemini-3.1-flash-lite`) is used *inside* the product, as the AI caller.
