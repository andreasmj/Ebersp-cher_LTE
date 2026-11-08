// Runs both check rounds against docs/mockup/index.html. Needs Playwright with Chromium installed
// (require('playwright') must resolve). Screenshots go to the folder given as argv[2] or the OS temp dir.
const { execFileSync } = require('node:child_process');
const path = require('node:path');
for (const f of ['round1.cjs', 'round2.cjs', 'round3.cjs']) {
  console.log('==', f);
  execFileSync(process.execPath, [path.join(__dirname, f), ...process.argv.slice(2)], { stdio: 'inherit' });
}
