// Builds two files from src/template.html + the 8 language files in docs/i18n:
//   index.html    – standalone page with a full HTML skeleton (open directly in a browser)
//   artifact.html – fragment without skeleton, for publishing as a claude.ai artifact
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const i18nDir = join(here, '..', 'i18n');
const langs = {};
for (const f of readdirSync(i18nDir).filter(f => f.endsWith('.json')).sort()) {
  langs[f.replace('.json', '')] = JSON.parse(readFileSync(join(i18nDir, f), 'utf8'));
}
const tpl = readFileSync(join(here, 'src', 'template.html'), 'utf8');
const fragment = tpl.replace('/*__I18N__*/', 'const I18N = ' + JSON.stringify(langs) + ';');
writeFileSync(join(here, 'artifact.html'), fragment);
const cut = fragment.indexOf('<header class="top">');
const head = fragment.slice(0, cut), body = fragment.slice(cut);
const page = `<!doctype html>\n<html lang="nb">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${head}</head>\n<body>\n${body}\n</body>\n</html>\n`;
writeFileSync(join(here, 'index.html'), page);
console.log('built index.html + artifact.html with', Object.keys(langs).join(', '), `(${(page.length/1024).toFixed(0)} kB)`);
