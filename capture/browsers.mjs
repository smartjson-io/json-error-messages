// The browser side of parse.mjs: runs JSON.parse inside Chromium, Firefox and
// WebKit through Playwright. run.sh runs it in Playwright's Docker image, which
// has all three browsers and their system libraries.
import { readFileSync } from 'node:fs';
import { chromium, firefox, webkit } from 'playwright-core';

const inputs = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const result = {};
for (const [name, type] of Object.entries({ chromium, firefox, webkit })) {
  const browser = await type.launch({ headless: true });
  const page = await browser.newPage();
  const messages = await page.evaluate((all) => {
    const out = {};
    for (const [id, text] of Object.entries(all)) {
      try {
        JSON.parse(text);
        out[id] = null;
      } catch (e) {
        out[id] = e.message;
      }
    }
    return out;
  }, inputs);
  result[name] = { version: browser.version(), messages };
  await browser.close();
}
console.log(JSON.stringify(result));
