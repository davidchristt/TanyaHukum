import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const REPORTS_DIR = path.join(ROOT, 'reports');
const OUT_FILE = path.join(REPORTS_DIR, 'security-report.md');

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), 'utf8');
}

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function finding({ id, severity, title, evidence, recommendation }) {
  return [
    `### ${id} — ${title}`,
    ``,
    `- **Severity**: ${severity}`,
    `- **Evidence**: \`${evidence}\``,
    `- **Recommendation**: ${recommendation}`,
    ``,
  ].join('\n');
}

ensureDir(REPORTS_DIR);

const findings = [];

// S1: Hardcoded fallback secret in middleware
try {
  const mw = read('middleware.js');
  if (mw.includes('fallback_secret_key_sementara')) {
    findings.push(
      finding({
        id: 'S1',
        severity: 'CRITICAL',
        title: 'Hardcoded JWT secret fallback enables token forgery',
        evidence: 'middleware.js uses process.env.JWT_SECRET || fallback_secret_key_sementara',
        recommendation:
          'Remove fallback, fail closed when JWT_SECRET missing, and add startup validation to prevent running without secret.',
      })
    );
  }
} catch {}

// S2: Webhook signature bypass outside production
try {
  const wh = read('app/api/payment/webhook/route.js');
  if (wh.includes('SANDBOX BYPASS') || wh.includes('without signature check')) {
    findings.push(
      finding({
        id: 'S2',
        severity: 'CRITICAL',
        title: 'Midtrans webhook signature verification bypass in non-production',
        evidence: 'app/api/payment/webhook/route.js has non-production bypass branch',
        recommendation:
          'Always verify signature (sandbox included). If gross_amount formatting is the issue, normalize gross_amount format instead of bypassing verification.',
      })
    );
  }
} catch {}

// S3: Auth mismatch (jose vs jsonwebtoken) risk
try {
  const jose = read('lib/auth.js');
  const jwt = read('src/lib/auth-server.js');
  if (jose.includes('jose') && jwt.includes('jsonwebtoken')) {
    findings.push(
      finding({
        id: 'S3',
        severity: 'HIGH',
        title: 'Mixed JWT libraries may cause verification inconsistencies',
        evidence: 'lib/auth.js uses jose; src/lib/auth-server.js uses jsonwebtoken',
        recommendation:
          'Standardize on one JWT implementation (prefer jose for edge compatibility) and ensure issuer/audience/alg are consistent across middleware + API routes.',
      })
    );
  }
} catch {}

const content = [
  `## Security Validation Report`,
  ``,
  `Generated: ${new Date().toISOString()}`,
  ``,
  findings.length ? findings.join('\n') : `No findings detected by static heuristics.`,
  ``,
].join('\n');

fs.writeFileSync(OUT_FILE, content);
console.log(`[security] wrote ${path.relative(ROOT, OUT_FILE)}`);

