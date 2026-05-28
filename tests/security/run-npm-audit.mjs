import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORTS_DIR = path.join(ROOT, 'reports');
const OUT_FILE = path.join(REPORTS_DIR, 'npm-audit.json');

fs.mkdirSync(REPORTS_DIR, { recursive: true });

let json = null;
try {
  const out = execSync('npm audit --json', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  json = JSON.parse(out);
} catch (e) {
  // npm audit exits non-zero when vulns found; still produces JSON on stdout in many cases.
  const stdout = e?.stdout?.toString?.() ?? '';
  try {
    json = JSON.parse(stdout);
  } catch {
    json = { error: 'Failed to parse npm audit output', raw: stdout.slice(0, 10_000) };
  }
}

fs.writeFileSync(
  OUT_FILE,
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      ...json,
    },
    null,
    2
  )
);

console.log(`[security] wrote ${path.relative(ROOT, OUT_FILE)}`);

