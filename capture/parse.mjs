// Feeds every input to this runtime's JSON.parse and prints the exact error
// messages as JSON. Runs unchanged in Node and Bun; run.sh calls it once per
// runtime, inside that runtime's official Docker image.
import { readFileSync } from 'node:fs';

const inputs = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const messages = {};
for (const [id, text] of Object.entries(inputs)) {
  try {
    JSON.parse(text);
    messages[id] = null; // null means the runtime accepted the input
  } catch (e) {
    messages[id] = e.message;
  }
}
const version = typeof Bun === 'undefined' ? process.versions.node : Bun.version;
console.log(JSON.stringify({ version, messages }));
