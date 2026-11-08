# Varmestart – ny app for Eberspächer EasyStart GSM

Designpakke (fase 0) for en iPhone/Android-app som styrer en Eberspächer-varmer med
EasyStart GSM 2G/4G CAN-modul via SMS. Kun lokal lagring, ingen konto, 8 språk.

| Mappe | Innhold |
|---|---|
| `docs/design/DESIGN.md` | Designløsningen: mål, funksjoner, skjermer, sendemotor, planleggingsmotor, datamodell, arkitektur (Expo SDK 58), testplan, veikart |
| `docs/design/REVIEW.md` | Review med score per funksjon og endringslogg |
| `docs/design/ios-kortkommando-guide.md` | Oppskriften appen genererer for automatisk sending på iPhone (Kortkommandoer) |
| `docs/research/` | Kildenotater: SMS-protokollen til EasyStart GSM og hvordan SMS kan sendes fra Expo på iOS/Android |
| `docs/i18n/*.json` | Alle tekster i appen på nb, en, de, sv, da, fi, es, fr (én kilde, lik nøkkelstruktur) |
| `docs/mockup/` | Interaktiv mockup. `src/template.html` + `build.mjs` → `index.html` |

Bygg mockupen på nytt etter endringer i språkfiler eller mal:

```
node docs/mockup/build.mjs
```

Sjekk at språkfilene har like nøkler:

```
node -e 'const fs=require("fs");const f=(o,p="")=>Object.entries(o).flatMap(([k,v])=>typeof v==="object"?f(v,p+k+"."):[p+k]);const b=new Set(f(JSON.parse(fs.readFileSync("docs/i18n/nb.json"))));for(const l of ["en","de","sv","da","fi","es","fr"]){const s=new Set(f(JSON.parse(fs.readFileSync(`docs/i18n/${l}.json`))));console.log(l,[...b].filter(k=>!s.has(k)).length+[...s].filter(k=>!b.has(k)).length?"MISMATCH":"ok")}'
```

Varmestart er ikke tilknyttet Eberspächer. EasyStart er et varemerke som tilhører Eberspächer.
