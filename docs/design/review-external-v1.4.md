# Ekstern review nr. 3, sluttbekreftelse: Varmestart v1.4

Reviewer: samme uavhengige reviewer som for v1.2 og v1.3. Dato: 8. november 2026.
Gjennomgått: `docs/design/REVIEW.md` §9–§10, `docs/design/DESIGN.md` v1.4 (diff mot v1.3, alle **[1.4]**-merker), guiden,
`docs/research/02-*.md` (diff), `docs/i18n/*.json` (8 × 278 nøkler, identisk nøkkelsett verifisert med hash),
`docs/mockup/src/template.html` (diff: `armOpts`/`armDone`, `sendTimeFor`, `missedOccurrence`, `skipDates`), `docs/mockup/checks/`
(diff), `docs/mockup/index.html` (bygget på nytt fra template + i18n i scratch-mappe: `cmp` identisk med repoet). Repoet er ikke endret.

Kjørt: forfatterens `node docs/mockup/checks/run.cjs` → **79 PASS, 0 FAIL** (23 + 29 + 27), ingen konsollfeil. Egne skript `r5_flows.cjs` (38 sjekker) og `r5_extra.cjs` (2), alle
tidsavhengige flyter med falsk klokke (`page.clock.install` før `goto`, `setFixedTime`; datoer bygget med eksplisitt `+01:00`, så
TZ-trikset i forfatterens skript er ikke nødvendig her). Logger `flows-v14.out`, `extra-v14.out`, `author-checks-v14.out`, skjermbilder
i `shots-v14/`.

**Kort konklusjon:** de tre gjenstående punktene fra v1.3 og alle småtingene er rettet og reprodusert i mockupen med falsk klokke.
Ingen regresjoner funnet. **Alle fjorten rader står på 9**, snitt 9,0. Pakken er klar for kundens egen review av designløsning og
mockup. Tre kosmetiske rester (versjonsraden i Om sier fortsatt «1.3», navnet `skip_date` henger igjen i DESIGN §13 og checks/README,
og simuleringsknappen «Morgen-reserve» bruker «glemt»-teksten også når ingenting er glemt) påvirker ikke poengene.

---

## 1. Status for punktene i review-external-v1.3 §3

| # | Funn i v1.3 §3 | Status | Bevis |
|---|---|---|---|
| 1 | Kveldspåminnelsens «Send nå» gikk utenom slot-sjekken; to starter kunne stå som sendt | **Rettet** | DESIGN §6.2 («hvis en sendt start ligger mellom sendetid og starttid: sendetid = den sendte starten + 1 min»), §6.3 «Invariant [1.4]: høyst én sendt STARThhmm», §12-rad, §13. Mockup: felles `armOpts`/`armDone` brukt av `armOneOff` og `showNotif`; `sendTimeFor` utsetter til armert start + 1 min; `armDone` setter `S.sent=[entry]` og kansellerer en overskrevet én-gangs-start uten re-sending. Reprodusert (klokke søn 20:50): Start om 30 min (START2120 armert) → «Påminnelse kvelden før» viser **21:21** → Send nå → ark «Modulen husker bare én planlagt start. START0630 erstatter START2120 (Planlegg start, i kveld kl. 21:20).» uten re-sendingsboks (`1A-reminder-slot-warning.png`) → Send → Hjem «Jobb · mandag · START0630 · Starter om 9 t 40 min», pille «Start planlagt · 06:30», ingen START2120, ingen aktiv én-gangs-plan, Jobb-raden «Sendt» (1A1–1A5). Samme utgangspunkt kl. 21:22: én-gangs-start utført, Jobb «Sendes nå», «Send nå» uten advarsel (slotet er ledig), START0630 armert (1B). Motsatt retning (klokke 21:30, START0630 armert → Start om 30 min): advarsel «START2200 erstatter START0630 (Jobb, i morgen kl. 06:30)» med forhåndsvalgt re-sending; med boksen **av** blir Jobb-forekomsten «ikke sendt» igjen (rad uten «Sendt», ingen ventende linje) og påminnelsen utsettes til etter den nye starten: kl. 22:01 «Sendes nå», påminnelse 22:01 (1C1–1C4). |
| 2 | Morgen-reserven registrerte neste dags forekomst som utført | **Rettet** | DESIGN §6.3 («reserven er alltid bundet til den konkrete forekomsten som ikke ble sendt (starttid passert for mindre enn to timer siden), aldri til neste dag [1.4]»). Mockup `missedOccurrence()` (i dag/i går, starttid passert < 2 t, ikke sendt, ikke hoppet over); uten glemt forekomst registreres ingenting. Reprodusert: man 06:35 → «Du sendte ikke START0630 i går» → Send → Neste **tirsdag**, pille «Varmer på · antatt 06:35», rad «Neste: tirsdag» (`2-reserve-mon-0635.png`); søn 12:05 → Neste **mandag** (ingen dag forsvinner); man 09:00 (> 2 t) → vanlig START, Neste tirsdag; man 06:35 med mandag allerede sendt → vanlig START, Neste tirsdag (2, 2D). |
| 3 | To trykk på «Hopp over neste» flyttet hoppet; ingen angre | **Rettet** | DESIGN §6.5/§7 `skip_dates` (liste; faller bort når starttiden er passert; «Angre hopp over»), guiden, ny nøkkel `sched.undoSkip` (278 × 8). Mockup: `s.skipDates.push`, filter på `startOn(s,k)>n`, redigeringsskjerm med én linje per dato + «Angre hopp over» og «+». Reprodusert (klokke søn 12:00): to trykk → Neste **onsdag**, rad «Neste gang hoppes over · 9. nov., 10. nov.»; Rediger plan viser «mandag 9. nov. · Angre hopp over», «tirsdag 10. nov. · Angre hopp over» og «+» (`3C-edit-skips.png`); «+» × 3 gir tre ulike datoer (man, tir, ons) uten duplikat → Neste torsdag; angre mandag → Neste mandag (3A–3E, `extra-v14.out`). Datoene faller bort ved starttid: man 06:31 → mandag borte, tirsdag står, Neste onsdag; tir 06:31 → listen tom (3F–3G). Hopp over på Kortkommando-plan (bekreftelse + STOP-påminnelse) og hopp over etter sending (STOP-ark, dato i listen) virker fortsatt (3H–3J). |
| 4 | Småting: research 02-linjene manglet (endringsloggen påsto dem), tautologisk round2-sjekk, §0 uten låst-skjerm-forbehold, versjon/§9/oppskrift/toast | **Rettet** (tre kosmetiske rester) | Research 02 §3 har nå «eneste sender», «lese svar» og «Må verifiseres på brukerens iOS: … «Kjør umiddelbart» … URL-koder … låst skjerm» (diff). `round2.cjs` breddeskann: `ok(…, scanned===64&&bad===0)` (diff). §0: «ved låst skjerm skjer det ved neste opplåsing». REVIEW §8 er rettet med forbehold om den tidligere påstanden. §9 «278 nøkler». **Rester:** (a) Innstillinger → Om viser fortsatt «1.3 · Expo SDK 58» (`template.html`, `'1.3 · Expo SDK 58'`; 5A); (b) DESIGN §13 l. 560 og `checks/README.md` l. 5 sier fortsatt «`skip_date`» (navnet er nå `skip_dates`); (c) simuleringsknappen «Morgen-reserve» viser teksten «Du sendte ikke START0630 i går» også søn 12:05 og man 09:00 når ingenting er glemt (kommandoen er riktig nok en vanlig START og ingen dag forsvinner; i appen vises reserven aldri uten en glemt forekomst, så dette gjelder bare mockup-panelet). |

**Ny nøkkel (`sched.undoSkip`, 8 språk):** nb «Angre hopp over», de «Überspringen rückgängig» (kort, men forståelig som lenke; «… rückgängig machen» er fullstendigere), fi «Kumoa ohitus», es «Deshacer omitir», fr «Annuler l’omission». Ingen betydningsfeil; lenkene får plass ved 360/390 px i de/fi/fr (4).

---

## 2. Sluttpoeng (v1.4)

| Punkt | v1.1 | v1.2 | v1.3 | **v1.4** | Begrunnelse (én linje) |
|---|---|---|---|---|---|
| F1 Start/Stopp | 8 | 9 | 9 | **9** | Uendret: ett trykk + Send, Start bytter aldri funksjon, status utløper, STOP advarer og re-sender, pille med starttid, «Hvorfor»-lenke. |
| F2 Forhåndsprogrammering | 8 | 8 | 9 | **9** | Modulens ene slot håndheves på alle sendeveier (Planlegg, Start om 30 min, Endre tid, re-sending, påminnelse) med advarsel og re-sending; vakter, kjøretid, én motor. |
| F3 Faste dager | 8 | 8 | 9 | **9** | `skip_dates` som liste med angre og automatisk bortfall ved starttid; Kortkommando-hopp over som bekreftelse + STOP-påminnelse; oppskrift lik motoren; konflikt på avreisedag. |
| F4 Oppsett | 9 | 9 | 9 | **9** | Uendret. |
| F5 Språk | 8 | 9 | 9 | **9** | 278 × 8 med full paritet; ny nøkkel riktig i de/fi/es/fr; ingen overflyt for de nye radene ved 360/390 px. |
| F6 SMS-strategi | 8 | 9 | 9 | **9** | Én historie i dokument, guide, i18n, panel, mockup og nå også research 02 (eneste sender, lesing av svar, verifiseringspunkter for Melding-utløser, URL-koding, låst skjerm). |
| F7 Status/temperatur | 8 | 9 | 9 | **9** | Uendret. |
| F8 Logg | 9 | 9 | 9 | **9** | Uendret. |
| F9 Avanserte kommandoer | 6 | 8 | 9 | **9** | Uendret fra v1.3 (låsesikker ACCLIM-test, to temperaturalarm-SMS, eget nummer). |
| Teknisk arkitektur / Expo SDK 58 | 9 | 9 | 9 | **9** | §7 `skip_dates`, §6.2-regelen for utsatt sendetid, §13 med alle nye enhetstester; 79 mockup-sjekker i repoet. |
| Lokal lagring / personvern | 9 | 9 | 9 | **9** | Uendret. |
| Kanttilfeller / planleggingsmotor | 7 | 8 | 8 | **9** | §12 dekker nå også «kveldspåminnelse mens en én-gangs-start er sendt for i kveld» (utsatt påminnelse + advarsel), invariantet «høyst én sendt STARThhmm» står i §6.3, morgen-reserven er bundet til den glemte forekomsten, hopp over er en liste som faller bort ved starttid. Alle reprodusert med falsk klokke; ingen nye hull funnet. |
| Mockup | 7 | 8 | 8 | **9** | 79/79 egne sjekker (runde 3 med falsk klokke), 40/40 egne; ingen overflyt, ingen konsollfeil; de tre logikkartefaktene fra v1.3 er borte (påminnelsesveien, morgen-reserven, dobbelt hopp over). Rester er kosmetiske (versjonsrad «1.3», reserve-tekst i simuleringsknappen). |
| «Mye bedre»-påstanden | 8 | 8 | 9 | **9** | §0 med forbehold inkl. låst skjerm, kilder og dato per plattform. |

Snitt: **9,0** (v1.3: 8,9; v1.2: 8,6; v1.1: 8,0; v1.0: 7,4). Ingen rader under 9.

---

## 3. Regresjoner

Ingen funnet. Spesielt sjekket etter refaktoreringen til `armOpts`/`armDone`: Start om 30 min med armert ukeplan-start gir fortsatt advarsel
med forhåndsvalgt re-sending (1C1); re-sendingsflyten etter STOP og «Endre tid» går gjennom samme funksjon (`1D0`: Planlegg i morgen med
armert én-gangs-start viser «Sender START1630 nå» og advarsel). Hopp over etter sending og på Kortkommando-plan virker med listen (3H–3J).
Rediger plan med to hopp over-datoer ved 360/390 px i de/fi/fr: ingen overflyt, begge angre-lenker synlige (4). Ingen konsoll- eller
sidefeil i noen kjøring. `index.html`/`artifact.html` identiske med ny bygging.

Kosmetiske rester (ikke poenggivende): (a) versjonsraden i Om bør bli «1.4 · Expo SDK 58»; (b) `skip_date` → `skip_dates` i DESIGN §13
og `checks/README.md`; (c) simuleringsknappen «Morgen-reserve» bør si «ingen glemt forekomst; sender vanlig START» (eller være
deaktivert) når `missedOccurrence()` er tom, så panelet ikke viser en «glemt»-tekst som appen aldri ville vist.

---

## 4. Konklusjon

**Klar for kundens egen review.** Alle fjorten rader står på 9 (snitt 9,0). De tre punktene fra v1.3 er rettet i dokument og mockup og
reprodusert med falsk klokke: (1) invariantet «høyst én sendt STARThhmm» gjelder alle sendeveier, kveldspåminnelsen utsettes til ett minutt
etter en armert start og advarer ved tidlig sending; (2) morgen-reserven er bundet til den glemte forekomsten og lar ikke en dag forsvinne;
(3) hopp over er en liste med angre som faller bort ved starttid. Småtingene fra v1.3 er rettet, inkludert research 02 og endringsloggens
tidligere feilpåstand. Det som gjenstår er tre kosmetiske rester (versjonsrad, `skip_date`-navn i §13/README, reserve-tekst i
simuleringsknappen) som kan tas uten ny ekstern runde. De åpne spørsmålene i DESIGN §15 (svartekster, ACCLIM-format, modulens klokke) må
fortsatt besvares mot fysisk enhet før implementering, som dokumentet selv sier.

---

## Vedlegg: hva som er kjørt

- `author-checks-v14.out`: `node docs/mockup/checks/run.cjs` → **79 PASS, 0 FAIL** (23 + 29 + 27), ingen konsollfeil.
- `r5_flows.cjs` → `flows-v14.out`: 1A (påminnelse 21:21, advarsel, bare én armert), 1B (21:22 uten advarsel), 1C (motsatt retning, ukeplan blir «ikke sendt», utsatt til 22:01), 1D (Planlegg via felles funksjon), 2 (morgen-reserve man 06:35 / søn 12:05 / man 09:00 / mandag sendt), 3A–3J (`skip_dates`, angre, «+», bortfall ved starttid, Kortkommando-hopp over, hopp over etter sending), 4 (Rediger plan de/fi/fr × 360/390), 5A (versjon).
- `r5_extra.cjs` → `extra-v14.out`: «+» × 3 i Rediger plan, Neste torsdag.
- Skjermbilder (`shots-v14/`): `1A-reminder-slot-warning`, `2-reserve-mon-0635`, `3C-edit-skips`, `4-fi-360-edit-skips`, pluss forfatterens egne fra `run.cjs`.
- `buildcheck14/`: ny bygging av `index.html`/`artifact.html`; `cmp` identisk med repoet.
