// Builds docs/mockup/index.html from src/template.html and the 8 language files in docs/i18n.
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
const out = tpl.replace('/*__I18N__*/', 'const I18N = ' + JSON.stringify(langs) + ';');
writeFileSync(join(here, 'index.html'), out);
console.log('built index.html with languages:', Object.keys(langs).join(', '), `(${(out.length/1024).toFixed(0)} kB)`);
