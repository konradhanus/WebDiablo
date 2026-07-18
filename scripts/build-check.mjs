#!/usr/bin/env node
// Build/structure validation for WebDiablo (zero deps, Node stdlib only).
// Enforces Constitution Principle II/III/VI: no external deps, all DOM refs exist,
// single GAME_VERSION source of truth, script parses.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');

const errors = [];
const ok = [];

// 1. No external <script src> / <link href> to http(s)
const ext = [...html.matchAll(/(?:src|href)=["'](https?:\/\/[^"']+)["']/g)].map(m => m[1]);
if (ext.length) errors.push(`External dependency found (violates zero-dep): ${ext.join(', ')}`);
else ok.push('No external dependencies');

// 2. Exactly one GAME_VERSION definition, valid semver
const verDefs = [...html.matchAll(/const\s+GAME_VERSION\s*=\s*['"]([^'"]+)['"]/g)];
if (verDefs.length !== 1) errors.push(`Expected exactly 1 GAME_VERSION const, found ${verDefs.length}`);
else {
  const v = verDefs[0][1];
  if (!/^\d+\.\d+\.\d+$/.test(v)) errors.push(`GAME_VERSION "${v}" is not semver`);
  else ok.push(`GAME_VERSION = ${v} (single source of truth)`);
}

// 3. Version footer bar present
if (!/id=['"]versionBar['"]|id='versionBar'|versionBar/.test(html)) errors.push('Version footer bar (#versionBar) missing');
else ok.push('Version footer bar present');

// 4. Every getElementById('X') has a matching id="X" in the HTML
//    (dynamic ids created at runtime via JS are whitelisted by prefix)
const DYNAMIC_ID_PREFIXES = ['skill-']; // skill bar slots built in buildSkillBar()
const isDynamic = (id) => DYNAMIC_ID_PREFIXES.some(p => id.startsWith(p));
const scriptStart = html.indexOf('<script>');
const htmlPart = html.slice(0, scriptStart);
const definedIds = new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map(m => m[1]));
const refIds = new Set([...html.matchAll(/getElementById\(['"]([^'"]+)['"]\)/g)].map(m => m[1]));
const missing = [...refIds].filter(id => !definedIds.has(id) && !isDynamic(id));
if (missing.length) errors.push(`getElementById refers to missing DOM ids: ${missing.join(', ')}`);
else ok.push(`All ${[...refIds].filter(id=>!isDynamic(id)).length} static getElementById refs resolve`);

// 5. Script body must parse as JS (syntax check via vm compile, no execution)
const bodyMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!bodyMatch) errors.push('No <script> block found');
else {
  try {
    new vm.Script(bodyMatch[1], { filename: 'index.html:inline' });
    ok.push('Inline script parses (syntax OK)');
  } catch (e) {
    errors.push(`Script syntax error: ${e.message}`);
  }
}

// Report
console.log('WebDiablo build-check');
console.log('=====================');
for (const o of ok) console.log('  \x1b[32m✓\x1b[0m ' + o);
for (const e of errors) console.log('  \x1b[31m✗\x1b[0m ' + e);
if (errors.length) { console.error(`\nBUILD FAILED: ${errors.length} error(s)`); process.exit(1); }
console.log('\nBUILD OK');
