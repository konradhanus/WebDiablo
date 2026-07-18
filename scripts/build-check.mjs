#!/usr/env node
// Build/structure validation for WebDiablo 3D (Three.js isometric).
// Zero external CDN deps; three is vendored locally. Single GAME_VERSION source.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const errors = [], ok = [];

// 1. Single GAME_VERSION, valid semver
const v = html.match(/const GAME_VERSION = '([^']+)'/);
if (!v) errors.push('GAME_VERSION const missing');
else if (!/^\d+\.\d+\.\d+$/.test(v[1])) errors.push(`GAME_VERSION "${v[1]}" not semver`);
else ok.push(`GAME_VERSION = ${v[1]}`);

// 2. Three.js vendored locally (no external CDN script/module)
if (!/import \* as THREE from '\.\/vendor\/three\.module\.js'/.test(html))
  errors.push('Three.js must be imported from local ./vendor (no CDN)');
else ok.push('Three.js imported from local vendor (offline-safe)');
const ext = [...html.matchAll(/(?:src|href)=["'](https?:\/\/[^"']+)["']/g)].map(m=>m[1]);
if (ext.length) errors.push(`External CDN dep found: ${ext.join(', ')}`);
else ok.push('No external CDN dependencies');

// 3. window.game exposed + version footer
if (!/window\.game\s*=\s*game/.test(html)) errors.push('window.game not exposed');
else ok.push('window.game exposed for tests');
if (!/WebDiablo v'\+GAME_VERSION/.test(html)) errors.push('version footer missing');
else ok.push('Version footer present');

// 4. Vendor file present
try { readFileSync(join(root, 'vendor/three.module.js'), 'utf8'); ok.push('vendor/three.module.js present'); }
catch { errors.push('vendor/three.module.js missing — run fetch step'); }

console.log('WebDiablo 3D build-check');
console.log('============================');
for (const o of ok) console.log('  \x1b[32m✓\x1b[0m ' + o);
for (const e of errors) console.log('  \x1b[31m✗\x1b[0m ' + e);
if (errors.length) { console.error(`\nBUILD FAILED: ${errors.length} error(s)`); process.exit(1); }
console.log('\nBUILD OK');
