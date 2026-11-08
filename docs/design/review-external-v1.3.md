# Ekstern review nr. 3, sluttverifisering: Varmestart v1.3

Reviewer: samme uavhengige reviewer som for v1.2 (`review-external-v1.2.md`). Dato: 8. november 2026.
Gjennomgått: `docs/design/REVIEW.md` §8 (endringslogg v1.2 → v1.3), `docs/design/DESIGN.md` v1.3 (diff mot v1.2, alle **[1.3]**-merker),
`docs/design/ios-kortkommando-guide.md`, `docs/research/01-*.md`, `docs/research/02-*.md` (uendret i v1.3), `docs/i18n/*.json`
(8 × 277 nøkler, identisk nøkkelsett verifisert med hash), `docs/mockup/src/template.html` (diff), `docs/mockup/index.html`
(bygget på nytt fra template + i18n i scratch-mappe: `cmp` identisk med repoet), `docs/mockup/checks/round3.cjs`.

Kjørt: forfatterens sjekker `node docs/mockup/checks/run.cjs` → **69 PASS, 0 FAIL** (23 + 29 + 17), ingen konsollfeil. Egne skript:
`r4_flows.cjs` (56 sjekker, 1A–8B) og `r4_extra.cjs` (10 sjekker), alle tidsavhengige flyter med Playwrights falske klokke
(`page.clock.install` før `goto`, `setFixedTime` for å flytte tiden), Chromium 1.63, `Europe/Oslo`. Logger `flows-v13.out`,
`extra-v13.out`, `author-checks-v13.out` og skjermbilder i `shots-v13/`. Repoet er ikke endret (`git status` ren).

**Kort konklusjon:** v1.3 retter alle de åtte punktene fra v1.2 §4 i hovedsak, sju helt og ett delvis; endringene er dokumentert i
DESIGN §3.3/§6.3/§6.5/§7/§12/§13 og speilet i mockupen, og alle flyter jeg ba om er reprodusert med falsk klokke. Snittet går
fra 8,6 til **8,9**, og tolv av fjorten rader står på 9. To rader står på 8 på grunn av tre gjenstående logikkhull som ble synlige
først nå: (a) kveldspåminnelsens «Send nå» går utenom den nye slot-sjekken, så en armert «Start om 30 min» overskrives uten advarsel
og appen tror begge er sendt; (b) morgen-reserven i mockupen markerer *neste* forekomst som utført i stedet for den uteblitte, så
mandag (eller tirsdag) forsvinner fra planen etter ett trykk på «Morgen-reserve» (regresjon som følge av den nye utført-regelen);
(c) to trykk på «Hopp over neste» flytter hopp over-datoen i stedet for å legge til. Alle tre er små og avgrensede.

---

## 1. Status for de åtte punktene i review-external-v1.2 §4

| # | Funn i v1.2 §4 | Status | Bevis |
|---|---|---|---|
| 1 | Én-gangs-start overskriver sendt morgenstart uten advarsel | **Delvis** | **Gjort:** DESIGN §3.3 «Modulens ene slot [1.3]», §12-rad, `armOneOff` (template l. 547–556: `other = armed() på annen dato`, `force`, `warn: sheet.slotWarning`, `rearm` bare når gammel start ligger etter ny), `S.rearmPending` med «Send nå» først ved `r.at = ny start + 1 min` (l. 508–509). Reprodusert (klokke søn 12:05): påminnelse → Send → Start om 30 min → ark «Modulen husker bare én planlagt start. START1235 erstatter START0630 (Jobb, i morgen kl. 06:30).» med forhåndsvalgt «Minn meg på å sende START0630 på nytt etterpå» (`1A-slot-sheet.png`) → Hjem «Jobb: START0630 sendes på nytt i dag kl. 12:36», ingen «Send nå» → kl. 12:41: én-gangs-starten er ute av kortet, pille «Varmer på · antatt 12:35», «Send nå» vises (`1A-rearm-due.png`) → ark START0630 → Send → «Jobb · mandag · START0630 · Starter om 17 t 49 min», pille «Start planlagt · 06:30», linjen borte. Planlegg 23:00 i dag kl. 21:30 gir samme advarsel og «sendes på nytt i kveld kl. 22:31» (1B). Motsatt retning via Planlegg (START2120 armert, Planlegg i morgen 07:00) gir advarsel uten boks, som §3.3 sier (1D, `1D-reverse-slot.png`). I de/fi/es/fr er teksten riktig og arket innenfor rammen ved 360/390 px (7). **Ikke gjort:** kveldspåminnelsens «Send nå» (`showNotif`, l. 759–762) går utenom slot-sjekken: klokke søn 20:50 → Start om 30 min (START2120 armert) → kl. 21:00 «Påminnelse kvelden før» → Send nå → rett til Meldinger uten advarsel; etterpå viser Hjem «START2120 · Starter om 20 min» *og* Jobb-raden «START0630 · Sendt» (1C, `1C-reminder-over-start30.png`), mens modulen bare husker START0630. Se §3 pkt. 1. |
| 2 | Sendt forekomst forblir «Neste» etter starttid («Starter om 0 min») | **Rettet** | DESIGN §6.3 ny tilstand **utført**, §7 `state … done`, §12-rad; `occurrenceFor` l. 424 (`if(armed.startAt<=n) continue`), `S.sent` beskjæres etter start + kjøretid (l. 454). Reprodusert (klokke): man 05:00 påminnelse → Send → man 06:45: pille «Varmer på · antatt 06:30», «Går til 07:00», Neste = tirsdag → man 08:00: «Varmer av · antatt 07:00», Neste tirsdag, ingen «Starter om 0 min», STOP-ark uten advarsel (2A–2D, `2-monday-0800.png`). Start om 30 min kl. 08:00 → 08:31: ute av Neste og av Planleggs liste, pille «Varmer på · antatt 08:30» → 09:02: «Varmer av · antatt 09:00» (2E–2F). |
| 3 | `skip_next` nullstilles aldri | **Rettet** (med to småavvik) | DESIGN §6.5/§7 `skip_date`; `occurrenceFor` l. 418 nullstiller når datoen er passert; Rediger plan-bryteren setter neste forekomsts dato (l. 607). Reprodusert (klokke søn 11:00): Hopp over → Neste tirsdag, rad «Neste gang hoppes over · 9. nov.», bryter PÅ med dato → man 12:00: Neste tirsdag, ikke onsdag (3A–3D) → tir 00:30: linjen borte (3G). Småavvik: linjen «Neste gang hoppes over · 9. nov.» står hele mandagen etter at forekomsten er passert (nullstilles ved midnatt, l. 418 bruker `<`, ikke «forekomst passert»); og to trykk på «Hopp over neste» flytter datoen til tirsdag og tar mandag *tilbake* (3E, se §3 pkt. 3). |
| 4 | Hopp over på automasjonsplan sendte STOP med en gang | **Rettet** | DESIGN §5/§6.5, guiden («Ingen SMS sendes før påminnelsen»), panelet «viser ikke». `skipOccurrence` l. 534: `confirmModal` uten kommando, setter `skipDate` + `S.stopReminder`; `showNotif` l. 753–756 viser STOP-påminnelsen. Reprodusert: «Hopp over mandag? Kortkommandoer sender START0630 kl. 21:00 uansett. Send STOP etterpå. Appen minner deg kl. 21:05.» uten kommando (`4A-skip-confirm.png`) → OK → Hjem «Neste tirsdag … Jobb: STOP-påminnelse kl. 21:05», ingen STOP i loggen, rad «Neste gang hoppes over · 9. nov. · STOP 21:05» → «Påminnelse kvelden før» = «Kortkommandoer sendte START0630 kl. 21:00. Send STOP nå?» kl. 21:05 (`4D-stop-reminder.png`) → Send nå → STOP-ark → Send → linjen borte, STOP i loggen, Neste fortsatt tirsdag (4A–4F). |
| 5 | Oppskrift ≠ motor ved starttid 21:00 | **Rettet** | `rRecipe` l. 667–669 bruker `sendTimeFor` og forskyver dagene ved å sammenligne sendedato med startdato; guiden forklarer regelen. Reprodusert: start 06:30 → «Tid 21:00», Søndag–Torsdag, START0630; start 21:00 → «Tid 21:30», forskjøvet, START2100; start 22:00 → «Tid 21:00», uforskjøvet, START2200 (5A–5C). |
| 6 | Konfliktregel på startdag; §15-nummerering; øvrige småting | **Rettet** | §6.5 «grupperes på avreisedag», `computeNext` l. 431 `sameDay(p.departAt,o.departAt)`. Reprodusert: ukeplan «Natt» (avreise man 00:15, start søn 23:45) + Jobb (man 07:00) → «Jobb: Dekket av Natt» (6A, `6-conflict-departure-day.png`). §15 nummerert 1–8. |
| 7 | ACCLIM-testen i §15 kan låse brukeren ute | **Rettet** | §15 pkt. 7: «Test låsesikkert: send alle tre formatene av ditt eget nummer i én kommando (`1234ACCLIM:91234567:4791234567:+4791234567`) eller test fra et annet allerede registrert nummer, siden ACCLIM erstatter hele listen»; research 01 «Må verifiseres» har samme punkt. Editorens hjelpetekst (`settings.numbersHelp`) er uendret; akseptabelt siden testen er et engangs-forskningssteg, men appen bør normalisere til det verifiserte formatet når det er kjent. |
| 8 | Småting (versjon, §9, §15, sjekk-tall, tautologi, panel-STATUS, §0-fotnote, verifiseringslinjer, dag-rekkefølge, toast) | **Delvis** | **Gjort:** Innstillinger → Om «1.3 · Expo SDK 58» (8A); §9 «277 nøkler»; §15 1–8; panelets STATUS-tekst «status (driftsmodus eller feilkoder, avhengig av firmware)» (8B); §0 «Forbehold [1.3]» (iOS kan be om bekreftelse; lesing av svar tar appen i forgrunnen); sjekk-tall «23 + 29 + 17» stemmer (69 PASS). **Ikke gjort:** (a) REVIEW §8 sier «Verifiseringsliste: «Kjør umiddelbart» for Melding-utløser og URL-koding i Kortkommandoer (research 02)», men `research/02-*.md` er uendret i v1.3 (ikke i diff-stat; grep «URL-kod»/«Melding» gir ingen treff) – endringsloggen påstår noe som ikke ligger i repoet; (b) den tautologiske sjekken i `round2.cjs` l. 64 (`ok('no evening reminder …', true)`) står fortsatt; (c) kosmetisk: oppskriften lister dagene mandag-først («Mandag, …, Torsdag, Søndag»), toast over hurtigraden. §0-fotnoten nevner ikke «ved låst skjerm kjøres det ved neste opplåsing» som §3.5 gjør (liten inkonsekvens). |

**Nye nøkler (6 × 8, stikkprøve de/fi/es/fr):** `sheet.slotWarning` de «Das Modul merkt sich nur einen geplanten Start. START1235 ersetzt START0630 (Arbeit, morgen um 06:30).» og fi «Moduuli muistaa vain yhden ajastetun käynnistyksen. START1235 korvaa komennon START0630 (Työ, huomenna klo 06.30).» er riktige og reprodusert i mockupen; `sched.skipConfirm` de «Montag überspringen?», es «¿Omitir el lunes?», fr «Ignorer lundi ?» reprodusert; `sheet.rearmLater`, `home.rearmPending`, `sched.stopReminder`, `notif.stopReminder` er riktige i alle fire (fi «Pikakomennot lähetti komennon {command} klo {time}» med riktig kasus). Ingen betydningsfeil.

---

## 2. Sluttpoeng (v1.3)

| Punkt | v1.1 | v1.2 | **v1.3** | Begrunnelse (én linje) | Gjenstår for 9 (der < 9) |
|---|---|---|---|---|---|
| F1 Start/Stopp | 8 | 9 | **9** | Uendret: ett trykk + Send, Start bytter aldri funksjon, status utløper, STOP advarer og re-sender, pille med starttid, «Hvorfor»-lenke. Start om 30 min respekterer nå modulens ene slot. | – |
| F2 Forhåndsprogrammering | 8 | 8 | **9** | Slot-advarsel med forhåndsvalgt re-sendingspåminnelse som først blir aktiv etter at den nye starten har gått; Endre tid samme dag uten advarsel (bevisst); vakter, kjøretid, én motor. Det ene gjenstående hullet (påminnelsens «Send nå») er ført under Kanttilfeller. | – |
| F3 Faste dager | 8 | 8 | **9** | `skip_date` med automatisk nullstilling, hopp over på Kortkommando-plan som bekreftelse + STOP-påminnelse kl. 21:05 (verifisert), oppskrift lik motoren (21:00-grensen), konflikt på avreisedag. Dobbelt «Hopp over neste» (§3 pkt. 3) er en liten UX-felle, ikke et funksjonshull. | – |
| F4 Oppsett | 9 | 9 | **9** | Uendret. | – |
| F5 Språk | 8 | 9 | **9** | 277 × 8 med full paritet, 6 nye nøkler riktige i de/fi/es/fr og reprodusert i mockupen; ingen overflyt for de nye tekstene ved 360/390 px. | – |
| F6 SMS-strategi | 8 | 9 | **9** | Én historie om automasjon/hopp over i §5, §6.5, guide, i18n, panel og mockup; oppskrift med motorens regel. Verifiseringslinjene for Melding-utløseren (research 02) mangler fortsatt, men det er en dokumentasjonsnit. | – |
| F7 Status/temperatur | 8 | 9 | **9** | Uendret. | – |
| F8 Logg | 9 | 9 | **9** | Uendret. | – |
| F9 Avanserte kommandoer | 6 | 8 | **9** | Låsesikker ACCLIM-test i §15 pkt. 7 og research 01 (alle tre formater i én kommando / fra annet registrert nummer); to temperaturalarm-SMS, eget nummer, format på verifiseringslisten. | – |
| Teknisk arkitektur / Expo SDK 58 | 9 | 9 | **9** | §7 `skip_date`/`done`, §6.4-budsjett, §13 med falsk klokke. | – |
| Lokal lagring / personvern | 9 | 9 | **9** | Uendret. | – |
| Kanttilfeller / planleggingsmotor | 7 | 8 | **8** | §12 har nå alle radene (slot, utført, hopp over-dato, Kortkommando-hopp over) og de virker i mockupen med falsk klokke. Men invariantet «høyst én sendt STARThhmm om gangen» håndheves ikke på alle sendeveier: kveldspåminnelsens «Send nå» overskriver en armert én-gangs-start uten advarsel og lar begge stå som sendt (§3 pkt. 1), og to trykk på «Hopp over neste» tar første hopp over tilbake (§3 pkt. 3). | Slot-sjekken (advarsel, eller bedre: utsett sendingen til armert start + 1 min) på *alle* sendeveier, inkl. påminnelse og re-sending; skriv invariantet i §6.3. `skip_date` som liste (eller «Hopp over neste» = legg til). |
| Mockup | 7 | 8 | **8** | 69/69 egne sjekker, ingen overflyt/konsollfeil, alle nye flyter virker med falsk klokke. Regresjon: «Morgen-reserve» registrerer *neste* forekomst som utført, så mandag (søndag 12:05) eller tirsdag (mandag 06:35) forsvinner fra Neste-kortet og Faste dager etter ett trykk (§3 pkt. 2); påminnelsesveien uten slot-sjekk (§3 pkt. 1); hopp over-linjen står ut dagen etter at forekomsten er passert (kosmetisk). | Bind morgen-reserven til den uteblitte forekomsten (den som nettopp passerte), slot-sjekk i `showNotif`. |
| «Mye bedre»-påstanden | 8 | 8 | **9** | §0 har nå forbeholdene (iOS kan be om bekreftelse; lesing tar appen i forgrunnen) med kilder og dato per plattform. | – |

Snitt: **8,9** (v1.2: 8,6; v1.1: 8,0; v1.0: 7,4). Under 9: Kanttilfeller og Mockup (to rader, begge 8).

---

## 3. Regresjoner og nye feil i v1.3 (med repro)

1. **Kveldspåminnelsens «Send nå» går utenom slot-sjekken (Kanttilfeller/Mockup; rest av v1.2 pkt. 1).** Repro (falsk klokke søndag 20:50, iPhone): Hjem → Start om 30 min → Send (pille «Start planlagt · 21:20») → sett klokken 21:00 → panel «Påminnelse kvelden før» («Send START0630 til Bilen nå?») → Send nå → Meldinger åpnes **uten** advarsel → Send. Etterpå: Neste-kortet «START2120 · Starter om 20 min» og Faste dager «Jobb … START0630 · Sendt» samtidig (`1C-reminder-over-start30.png`, `flows-v13.out` 1C1–1C2), men modulen husker bare START0630: 21:20-starten er borte. Årsak: `showNotif` (template l. 759–762) kaller `openSheet` uten `warn`/`force` og gjør `S.sent.push`, mens `armOneOff` erstatter. DESIGN §3.3 [1.3] dekker bare retningen «én-gangs-start mens ukeplanens start er sendt». Anbefalt regel (fjerner behovet for advarsel i det vanlige tilfellet): `sendetid = max(kveldstid, vindu, armert én-gangs-start + 1 min)` i §6.2, og invariantet «høyst én sendt STARThhmm» i §6.3 med slot-sjekk på alle veier (Start om 30 min, Planlegg, påminnelse, re-sending, Endre tid).
2. **Regresjon: «Morgen-reserve» markerer neste forekomst som utført (Mockup).** Repro: iPhone, klokke søndag 12:05 → panel «Morgen-reserve» («Du sendte ikke START0630 i går. Send START nå?») → Send nå → Send. Hjem: «Neste: Jobb · **tirsdag**», Faste dager «Neste: tirsdag kl. 07:00» – mandag er borte. Samme mandag 06:35: Neste blir **onsdag** (`extra-v13.out` 2G, `2G-after-reserve.png`). Årsak: `showMorning` (l. 764–767) tar `computeNext().find(x=>!x.sent)` (første *framtidige* forekomst) og registrerer den med `startAt: now()`, som den nye utført-regelen i `occurrenceFor` (l. 424) straks hopper over. I v1.2 ga samme kode «Starter om 0 min»; nå forsvinner en hel dag. Designet (§6.3) er riktig: reserven hører til den uteblitte forekomsten. Rett mockupen til å finne forekomsten med `startAt <= nå` (samme dag) og markere *den* utført; Neste skal da vise mandag (søndag) / tirsdag (mandag).
3. **To trykk på «Hopp over neste» flytter hopp over-datoen (F3/Kanttilfeller).** Repro (søndag 11:00): Hopp over neste → Neste tirsdag → Hopp over neste igjen → Neste **mandag**, rad «Neste gang hoppes over · 10. nov.» (`flows-v13.out` 3E). Brukeren som vil hoppe over to dager får første dag tilbake. `skipOccurrence` (l. 536) skriver `s.skipDate = n.dateKey`. Forslag: `skip_dates` som liste (hver dato nullstilles når den passerer), eller la Hjem-knappen bli «Angre hopp over» når neste viste forekomst følger en overhoppet dag, og vis til «Pause til dato» for flere dager.
4. **Småting.** (a) Hopp over-linjen «Neste gang hoppes over · 9. nov.» står hele den overhoppede dagen etter at forekomsten har passert (nullstilles først ved midnatt; `occurrenceFor` l. 418 sammenligner dato med `<`); Neste-kortet er riktig (3F). (b) REVIEW §8 oppgir en endring i research 02 som ikke finnes i repoet (se §1 pkt. 8). (c) `round2.cjs` l. 64 er fortsatt en tautologi. (d) §0-fotnoten utelater «ved låst skjerm ved neste opplåsing» (§3.5). (e) Oppskriften lister dagene mandag-først; toast over hurtigraden (kosmetisk, uendret).

**Verifisert OK i v1.3 (ingen funn):** slot-advarsel og utsatt re-sendingspåminnelse i begge retninger via Start om 30 min/Planlegg, med falsk klokke; sendt → utført for ukeplan, Start om 30 min og status-utløp (06:45/08:00/08:31/09:02); `skip_date` nullstilles neste dag; Kortkommando-hopp over som bekreftelse → STOP-påminnelse → STOP-ark → logg; oppskrift for 06:30/21:00/22:00; konflikt på avreisedag; versjon 1.3; panel-STATUS; §0-forbehold; §15 pkt. 7; 6 nye nøkler i de/fi/es/fr; slot-ark og Hjem med ventende linje innenfor viewport/ramme ved 360/390 px i nb/de/fi/fr; ingen konsoll- eller sidefeil; `index.html`/`artifact.html` identiske med ny bygging.

---

## 4. Konklusjon

Pakken er **nesten klar**, men ikke helt etter kravet «minst 9/10 på alle funksjoner»: tolv av fjorten rader står på 9, snittet er 8,9,
og to rader står på 8 (Kanttilfeller, Mockup) på grunn av tre avgrensede hull som ble synlige først nå. Det som gjenstår er
(1) slot-sjekken på kveldspåminnelsens «Send nå» (og invariantet «høyst én sendt STARThhmm» i §6.3, helst med regelen
`sendetid ≥ armert én-gangs-start + 1 min` i §6.2) slik at Start om 30 min om kvelden ikke overskrives uten advarsel og appen ikke
viser to sendte starter; (2) morgen-reserven i mockupen må binde seg til den uteblitte forekomsten, ikke den neste, slik at ikke en
dag forsvinner fra planen når klienten trykker «Morgen-reserve»; (3) «Hopp over neste» som liste av datoer (eller «Angre hopp over»),
og de fire småtingene i §3 pkt. 4, der (b) bør rettes fordi endringsloggen påstår en endring som ikke ligger i repoet. Når (1) og (2)
er gjort og verifisert i mockupen med falsk klokke (én sjekk hver i `round3.cjs`), vurderer jeg Kanttilfeller og Mockup til 9; da er
alle fjorten rader på 9 og pakken er klar for kundens egen review. (3) og småtingene kan tas i samme omgang uten ny ekstern runde.

---

## Vedlegg: hva som er kjørt

- `author-checks-v13.out`: `node docs/mockup/checks/run.cjs` → 23 + 29 + 17 = 69 PASS, 0 FAIL, ingen feil.
- `r4_flows.cjs` → `flows-v13.out`: 1A–1C (slot, falsk klokke søn 12:05 / 21:30 / 20:50), 2A–2G (sendt → utført, status-utløp, morgen-reserve), 3A–3E (`skip_date`, dobbelt hopp over), 4A–4G (Kortkommando-hopp over → STOP-påminnelse), 5A–5C (oppskrift 06:30/21:00/22:00), 6A (avreisedag), 7 (bredder nb/de/fi/fr × 360/390, tekster de/fi/es/fr), 8A–8B (versjon, panel).
- `r4_extra.cjs` → `extra-v13.out`: 2E–2F (Start om 30 min utført, status-utløp), 2G (morgen-reserve søn 12:05 og man 06:35), 1D (motsatt slot-retning via Planlegg), 3F–3G (hopp over-linje man 07:30 / tir 00:30), 1E (Pro).
- Skjermbilder (`shots-v13/`): `1A-slot-sheet`, `1A-rearm-due`, `1C-reminder-over-start30`, `1D-reverse-slot`, `2-monday-0800`, `2G-after-reserve`, `3-skipdate-monday`, `4A-skip-confirm`, `4D-stop-reminder`, `5-recipe-2200`, `6-conflict-departure-day`, `7-de-360-slot-sheet`, `7-fi-360-home-pending`, pluss forfatterens egne (`slot-warning`, `clock-wed`, `recipe-2100`, …).
- `buildcheck13/`: ny bygging av `index.html`/`artifact.html`; `cmp` identisk med repoet.
