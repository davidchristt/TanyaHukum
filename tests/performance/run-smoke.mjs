import fs from 'node:fs';
import path from 'node:path';
import { request } from 'undici';

const ROOT = process.cwd();
const REPORTS_DIR = path.join(ROOT, 'reports');
const OUT_FILE = path.join(REPORTS_DIR, 'performance-smoke.json');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const CONCURRENCY = Number(process.env.CONCURRENCY || 10);
const REQUESTS = Number(process.env.REQUESTS || 50);

fs.mkdirSync(REPORTS_DIR, { recursive: true });

const targets = [
  { name: 'dashboard', url: `${BASE_URL}/api/dashboard` },
  { name: 'regulations', url: `${BASE_URL}/api/regulations` },
  { name: 'payment_webhook_health', url: `${BASE_URL}/api/payment/webhook` },
];

async function timedGet(url) {
  const start = performance.now();
  const res = await request(url, { method: 'GET' });
  const end = performance.now();
  const bodyText = await res.body.text();
  return { statusCode: res.statusCode, ms: Math.round(end - start), bytes: bodyText.length };
}

const results = [];
let inFlight = 0;
let idx = 0;

await new Promise((resolve) => {
  const tick = () => {
    while (inFlight < CONCURRENCY && idx < REQUESTS) {
      inFlight++;
      const t = targets[idx % targets.length];
      timedGet(t.url)
        .then((r) => results.push({ target: t.name, ...r }))
        .catch((e) => results.push({ target: t.name, error: String(e) }))
        .finally(() => {
          inFlight--;
          idx++;
          if (idx >= REQUESTS && inFlight === 0) resolve();
          else tick();
        });
    }
  };
  tick();
});

const byTarget = results.reduce((acc, r) => {
  acc[r.target] = acc[r.target] || [];
  acc[r.target].push(r);
  return acc;
}, {});

const summary = Object.fromEntries(
  Object.entries(byTarget).map(([k, arr]) => {
    const ok = arr.filter((x) => !x.error);
    const ms = ok.map((x) => x.ms).sort((a, b) => a - b);
    const p = (q) => (ms.length ? ms[Math.floor((q / 100) * (ms.length - 1))] : null);
    return [
      k,
      {
        total: arr.length,
        errors: arr.length - ok.length,
        statusCodes: ok.reduce((m, x) => ((m[x.statusCode] = (m[x.statusCode] || 0) + 1), m), {}),
        p50_ms: p(50),
        p95_ms: p(95),
        p99_ms: p(99),
      },
    ];
  })
);

fs.writeFileSync(
  OUT_FILE,
  JSON.stringify(
    {
      baseUrl: BASE_URL,
      concurrency: CONCURRENCY,
      requests: REQUESTS,
      summary,
      samples: results.slice(0, 200),
      generatedAt: new Date().toISOString(),
    },
    null,
    2
  )
);

console.log(`[perf] wrote ${path.relative(ROOT, OUT_FILE)}`);

