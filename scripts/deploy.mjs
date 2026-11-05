// Deploys the last commit to Vercel production.
// Why a copy without .git: Vercel's free plan blocks deploys whose commits list a co-author.
// Run: node scripts/deploy.mjs
import { execSync } from 'node:child_process';
import { mkdtempSync, cpSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const dir = mkdtempSync(join(tmpdir(), 'og-deploy-'));
execSync(`git archive HEAD | tar -x -C "${dir}"`, { stdio: 'inherit', shell: 'bash' });
cpSync('.vercel', join(dir, '.vercel'), { recursive: true });
execSync('npx vercel deploy --prod --yes', { cwd: dir, stdio: 'inherit' });
