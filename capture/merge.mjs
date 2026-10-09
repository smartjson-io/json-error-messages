// Combines run.sh's per-runtime output into data/messages.json and
// data/messages.csv. Fails if any runtime is missing a result for any input.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const [raw, outDir] = process.argv.slice(2);
const read = (name) => JSON.parse(readFileSync(join(raw, name), 'utf8'));
const inputs = JSON.parse(readFileSync(new URL('./inputs.json', import.meta.url), 'utf8'));
const browsers = read('browsers.json');
const major = (v) => v.split('.')[0];

// Display order on the pages: browsers first, then servers.
const runtimes = [
  { id: 'chrome', label: `Chrome ${major(browsers.chromium.version)}`, engine: 'V8', ...browsers.chromium },
  { id: 'firefox', label: `Firefox ${major(browsers.firefox.version)}`, engine: 'SpiderMonkey', ...browsers.firefox },
  { id: 'safari', label: `Safari ${major(browsers.webkit.version)} (WebKit)`, engine: 'JavaScriptCore', ...browsers.webkit },
  ...['24', '22', '20', '18'].map((v) => ({ id: `node${v}`, label: `Node ${v}`, engine: 'V8', ...read(`node${v}.json`) })),
  { id: 'bun', label: 'Bun', engine: 'JavaScriptCore', ...read('bun.json') },
  ...['3.13', '3.12', '3.10'].map((v) => ({
    id: `python${v.replace('.', '')}`,
    label: `Python ${v}`,
    engine: 'CPython json',
    ...read(`python${v}.json`),
  })),
];

for (const r of runtimes) {
  for (const id of Object.keys(inputs)) {
    if (!(id in r.messages)) throw new Error(`${r.id} has no result for ${id}`);
  }
}

const dataset = {
  captured: new Date().toISOString().slice(0, 10),
  inputs,
  runtimes: runtimes.map(({ id, label, engine, version, messages }) => ({ id, label, engine, version, messages })),
};
writeFileSync(join(outDir, 'messages.json'), JSON.stringify(dataset, null, 2) + '\n');

// One row per input and runtime. An empty message means the runtime accepted the input.
const cell = (v) => (/[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
const rows = [['input_id', 'input', 'runtime', 'engine', 'version', 'message']];
for (const id of Object.keys(inputs))
  for (const r of dataset.runtimes) rows.push([id, inputs[id], r.label, r.engine, r.version, r.messages[id] ?? '']);
writeFileSync(join(outDir, 'messages.csv'), rows.map((row) => row.map(cell).join(',')).join('\r\n') + '\r\n');
console.log(`wrote ${outDir}: ${runtimes.length} runtimes x ${Object.keys(inputs).length} inputs`);
