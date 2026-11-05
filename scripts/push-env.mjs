// Copies settings from .env into Vercel (production). Never prints values.
// Run: node scripts/push-env.mjs
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split(/\r?\n/)
    .filter((line) => /^[A-Z_]+=/.test(line))
    .map((line) => [line.slice(0, line.indexOf('=')), line.slice(line.indexOf('=') + 1).trim()]),
);

const keys = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_FROM', 'AGENT_PHONE', 'CUSTOMER_PHONE', 'ALLOWED_NUMBERS', 'GEMINI_API_KEY'];

for (const key of keys) {
  if (!env[key]) { console.log(`${key}: empty, skipped`); continue; }
  spawnSync('npx', ['vercel', 'env', 'rm', key, 'production', '--yes'], { shell: true, stdio: 'ignore' });
  const result = spawnSync('npx', ['vercel', 'env', 'add', key, 'production'], { shell: true, input: env[key], encoding: 'utf8' });
  console.log(`${key}: ${result.status === 0 ? 'added' : 'FAILED'}`);
}
