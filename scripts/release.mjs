#!/usr/bin/env node
// Release automation for WebDiablo — Constitution Principle VI (Green-to-Ship).
// Usage: node scripts/release.mjs <major|minor|patch> "commit message"
// Runs the FULL gate (build + unit + e2e). Only if green: bumps GAME_VERSION,
// commits, pushes to origin/master, then verifies the live GitHub Pages URL serves it.
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const bumpType = process.argv[2] || 'minor';
const message = process.argv[3] || 'release';
const LIVE_URL = 'https://konradhanus.github.io/WebDiablo/';

function run(cmd, opts = {}) {
  console.log(`\x1b[36m$ ${cmd}\x1b[0m`);
  return execSync(cmd, { cwd: root, stdio: 'inherit', ...opts });
}
function capture(cmd) { return execSync(cmd, { cwd: root }).toString().trim(); }

// ---- GATE: build + unit + e2e (must be green) ----
console.log('\n=== GATE 1/3: build-check ===');
run('node scripts/build-check.mjs');
console.log('\n=== GATE 2/3: unit tests ===');
run('node --test tests/*.test.mjs');
console.log('\n=== GATE 3/3: e2e tests ===');
run('node tests/e2e.mjs');
console.log('\n\x1b[32m✓ All gates green\x1b[0m');

// ---- BUMP version (single source of truth in index.html, mirror in package.json) ----
const indexPath = join(root, 'index.html');
let html = readFileSync(indexPath, 'utf8');
const cur = html.match(/const GAME_VERSION = '([^']+)'/)[1];
let [maj, min, pat] = cur.split('.').map(Number);
if (bumpType === 'major') { maj++; min = 0; pat = 0; }
else if (bumpType === 'patch') { pat++; }
else { min++; pat = 0; }
const next = `${maj}.${min}.${pat}`;
html = html.replace(/const GAME_VERSION = '[^']+'/, `const GAME_VERSION = '${next}'`);
writeFileSync(indexPath, html);

const pkgPath = join(root, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
pkg.version = next;
writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
console.log(`\n\x1b[32m✓ Bumped ${cur} → ${next} (${bumpType})\x1b[0m`);

// Re-verify build after bump (footer/version consistency)
run('node scripts/build-check.mjs');

// ---- COMMIT + PUSH ----
run('git add -A');
run(`git -c commit.gpgsign=false commit -m "release: v${next} — ${message}"`);
run('git push origin master');
console.log(`\n\x1b[32m✓ Pushed v${next} to origin/master\x1b[0m`);

// ---- VERIFY DEPLOY (poll live URL for the new version, up to ~3 min) ----
console.log(`\n=== Verifying deploy at ${LIVE_URL} ===`);
let deployed = false;
for (let i = 1; i <= 18; i++) {
  try {
    const body = capture(`curl -s --max-time 10 "${LIVE_URL}?cachebust=${Date.now()}"`);
    if (body.includes(`GAME_VERSION = '${next}'`)) { deployed = true; console.log(`\x1b[32m✓ Live site serving v${next}\x1b[0m`); break; }
    console.log(`  attempt ${i}/18: not yet live (still previous version)...`);
  } catch { console.log(`  attempt ${i}/18: fetch failed, retrying...`); }
  execSync('sleep 10');
}
if (!deployed) {
  console.error(`\n\x1b[33m⚠ Deploy not confirmed within timeout. Push succeeded; GitHub Pages may still be building.\x1b[0m`);
  process.exit(2);
}
console.log(`\n\x1b[32m🎉 RELEASE COMPLETE: WebDiablo v${next} is live.\x1b[0m`);
