# Automatiserte sjekker av mockupen

`round1.cjs` dekker funnene fra første review (23 sjekker), `round2.cjs` funnene fra andre review
(30 sjekker inkl. breddeskann i 8 språk × 360/390 px). Begge kjører headless Chromium via Playwright
mot `docs/mockup/index.html` og skriver PASS/FAIL per sjekk.

```
node docs/mockup/checks/run.cjs [mappe-for-skjermbilder]
```
