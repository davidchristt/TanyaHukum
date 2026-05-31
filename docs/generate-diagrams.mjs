/**
 * PlantUML Diagram Generator
 * Membaca semua file .puml, extract tiap diagram, generate PNG + SVG
 * via PlantUML public server (tidak perlu install Java/PlantUML lokal)
 *
 * Cara pakai:
 *   node docs/generate-diagrams.mjs
 *   node docs/generate-diagrams.mjs --format png
 *   node docs/generate-diagrams.mjs --format svg
 *   node docs/generate-diagrams.mjs --file dfd.puml
 */

import { createWriteStream, mkdirSync, readFileSync, existsSync } from 'fs';
import { deflateRaw } from 'zlib';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import { promisify } from 'util';
import { pipeline } from 'stream';

const deflateRawAsync = promisify(deflateRaw);
const streamPipeline  = promisify(pipeline);
const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Config ───────────────────────────────────────────────────────────────────

const PLANTUML_SERVER = 'https://www.plantuml.com/plantuml';

const PUML_FILES = [
  'diagrams.puml',   // ERD, Arsitektur, UseCase, Context, Sequence (existing)
  'sequences.puml',  // Sequence Diagrams lengkap (SEQ-07~23)
  'dfd.puml',        // DFD Level 0, 1, 2
  'flowchart.puml',  // Flowchart semua alur
  'deployment.puml', // Deployment Diagram infrastruktur
  'whitebox.puml',   // Whitebox Control Flow Diagrams (WB-01~20)
];

const OUTPUT_DIR = join(__dirname, 'output');

// ─── PlantUML Encoder ─────────────────────────────────────────────────────────
// Implementasi encoder custom PlantUML (deflate + base64 kustom)

const PLANTUML_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_';

function encode6bit(b) {
  return PLANTUML_CHARS[b & 0x3F];
}

function append3bytes(b1, b2, b3) {
  const c1 = b1 >> 2;
  const c2 = ((b1 & 0x3) << 4) | (b2 >> 4);
  const c3 = ((b2 & 0xF) << 2) | (b3 >> 6);
  const c4 = b3 & 0x3F;
  return encode6bit(c1) + encode6bit(c2) + encode6bit(c3) + encode6bit(c4);
}

function encodeBuffer(buffer) {
  let result = '';
  for (let i = 0; i < buffer.length; i += 3) {
    result += append3bytes(buffer[i] ?? 0, buffer[i + 1] ?? 0, buffer[i + 2] ?? 0);
  }
  return result;
}

async function encodeDiagram(text) {
  const compressed = await deflateRawAsync(Buffer.from(text, 'utf8'), { level: 9 });
  return encodeBuffer(compressed);
}

// ─── Parser: extract @startuml blocks ────────────────────────────────────────

function extractDiagrams(fileContent) {
  const diagrams = [];
  const regex = /@startuml[ \t]+(\S+)([\s\S]*?)@enduml/g;
  let match;
  while ((match = regex.exec(fileContent)) !== null) {
    diagrams.push({
      name:    match[1].trim(),
      content: match[0].trim(),
    });
  }
  return diagrams;
}

// ─── Generator ───────────────────────────────────────────────────────────────

async function generateImage(diagram, format, outputDir) {
  const encoded  = await encodeDiagram(diagram.content);
  const url      = `${PLANTUML_SERVER}/${format}/${encoded}`;
  const filePath = join(outputDir, `${diagram.name}.${format}`);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Server returned ${response.status} ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('text/plain') || contentType.includes('text/html')) {
    // PlantUML returns error page as text when diagram has syntax error
    const body = await response.text();
    throw new Error(`Diagram error: ${body.slice(0, 120).replace(/\n/g, ' ')}`);
  }

  const fileStream = createWriteStream(filePath);
  await streamPipeline(response.body, fileStream);
  return filePath;
}

// ─── CLI args ─────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { formats: ['png', 'svg'], files: null };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--format' && args[i + 1]) {
      opts.formats = [args[++i]];
    }
    if (args[i] === '--file' && args[i + 1]) {
      opts.files = [args[++i]];
    }
  }
  return opts;
}

// ─── Progress helpers ─────────────────────────────────────────────────────────

const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN   = '\x1b[36m';
const DIM    = '\x1b[2m';
const RESET  = '\x1b[0m';

function pad(str, len) {
  return str.length >= len ? str : str + ' '.repeat(len - str.length);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs();

  console.log(`\n${CYAN}╔══════════════════════════════════════════╗${RESET}`);
  console.log(`${CYAN}║   PlantUML Diagram Generator             ║${RESET}`);
  console.log(`${CYAN}║   TanyaHukum — Dokumentasi Teknis        ║${RESET}`);
  console.log(`${CYAN}╚══════════════════════════════════════════╝${RESET}\n`);

  // Buat output directory
  mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`${DIM}Output dir : ${OUTPUT_DIR}${RESET}`);
  console.log(`${DIM}Formats    : ${opts.formats.join(', ')}${RESET}`);
  console.log(`${DIM}Server     : ${PLANTUML_SERVER}${RESET}\n`);

  const targetFiles = opts.files ?? PUML_FILES;
  let totalSuccess = 0;
  let totalFail    = 0;

  for (const fileName of targetFiles) {
    const filePath = join(__dirname, fileName);

    if (!existsSync(filePath)) {
      console.log(`${YELLOW}⚠  File tidak ditemukan: ${fileName}${RESET}`);
      continue;
    }

    const content  = readFileSync(filePath, 'utf8');
    const diagrams = extractDiagrams(content);

    if (diagrams.length === 0) {
      console.log(`${YELLOW}⚠  Tidak ada diagram ditemukan di ${fileName}${RESET}`);
      continue;
    }

    // Buat sub-folder per file
    const subDir = join(OUTPUT_DIR, basename(fileName, '.puml'));
    mkdirSync(subDir, { recursive: true });

    console.log(`${CYAN}📄 ${fileName}${RESET} ${DIM}(${diagrams.length} diagram)${RESET}`);
    console.log('─'.repeat(60));

    for (const diagram of diagrams) {
      const label = pad(diagram.name, 36);
      process.stdout.write(`  ${label}`);

      const results = [];
      let hasError  = false;

      for (const format of opts.formats) {
        try {
          await generateImage(diagram, format, subDir);
          results.push(`${GREEN}${format.toUpperCase()}✓${RESET}`);
          totalSuccess++;
        } catch (err) {
          results.push(`${RED}${format.toUpperCase()}✗${RESET}`);
          hasError = true;
          totalFail++;
          // Tulis error detail di bawah
          process.stdout.write(`\n${' '.repeat(38)}${RED}Error: ${err.message.slice(0, 60)}${RESET}`);
        }
      }

      console.log(`  ${results.join('  ')}`);
    }

    console.log('');
  }

  // Summary
  console.log('─'.repeat(60));
  console.log(`\n${GREEN}✅ Berhasil : ${totalSuccess} file${RESET}`);
  if (totalFail > 0) {
    console.log(`${RED}❌ Gagal    : ${totalFail} file${RESET}`);
  }
  console.log(`\n${DIM}Semua gambar tersimpan di:${RESET}`);
  console.log(`${CYAN}  ${OUTPUT_DIR}/${RESET}`);

  // Tampilkan struktur folder output
  console.log(`\n${DIM}Struktur output:${RESET}`);
  for (const fileName of targetFiles) {
    const filePath = join(__dirname, fileName);
    if (!existsSync(filePath)) continue;
    const content  = readFileSync(filePath, 'utf8');
    const diagrams = extractDiagrams(content);
    const subName  = basename(fileName, '.puml');
    console.log(`  ${CYAN}${subName}/${RESET}`);
    for (const d of diagrams) {
      for (const fmt of opts.formats) {
        console.log(`  ${DIM}  ├─ ${d.name}.${fmt}${RESET}`);
      }
    }
  }

  console.log('');
}

main().catch((err) => {
  console.error(`\n${RED}Fatal error: ${err.message}${RESET}`);
  process.exit(1);
});
