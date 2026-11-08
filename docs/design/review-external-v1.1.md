# Ekstern review nr. 2: Varmestart v1.1 (etter første review)

Reviewer: uavhengig produkt/design/teknisk gjennomgang, andre runde. Dato: 8. november 2026.
Gjennomgått: `docs/design/review-external-v1.0.md` (grunnlag), `docs/design/REVIEW.md` §4 (endringslogg),
`docs/design/DESIGN.md` v1.1, `docs/design/ios-kortkommando-guide.md`, `docs/research/01-*.md`, `docs/research/02-*.md`,
`docs/i18n/*.json` (8 × 251 nøkler), `docs/mockup/index.html` (+ `src/template.html`, `build.mjs`).
Mockupen er kjørt headless (Chromium/Playwright 1.63, `Europe/Oslo`, søndag 8. nov 2026 kl. 11:02–11:11) i 8 språk,
3 plattformer, lys og mørk modus, 1280 px og 320/360/375/390/412/430 px bredde. Skjermbilder og logger ligger i samme
mappe som denne rapporten (`*.png`, `flows.out`, `layout.log`). Kjente harde begrensninger (iOS sender aldri SMS selv,
Play avviser SEND_SMS, modulen har én `STARThhmm` innen 24 t) er ikke trukket for; det er vurdert om de håndteres ærlig.

Kort konklusjon: v1.1 er en reell forbedring (snitt 7,4 → 8,0) og nesten alle funn fra første review er rettet i
dokumentet. Men kravet «minst 9/10 på alle funksjoner» er fortsatt ikke nådd: ti punkter ligger på 6–8 (tre av dem under 8) på grunn av
(a) én ny logikkfeil i sendetids-regelen for sene/nattlige avreiser, (b) tre hull i «sendt»-sporingen (Start om 30 min,
Endre tid etter sending, automasjon + hopp over), (c) en ugyldig sammenslått temperaturalarm-SMS og uavklart
ACCLIM-format i Avansert, og (d) en ny layoutfeil i mockupen (Temperaturalarm-raden stikker ut av telefonrammen og
gir horisontal scroll ved 360/390 px). Alle er konkrete og avgrensede.

---

## 1. Status for hvert funn i første review

Status: **Rettet** / **Delvis rettet** / **Ikke rettet**, med én linje bevis.

### 1.1 Poengtabellen (§1 i v1.0, kolonnen «Hva som må til for 9+»)

| Punkt | Status | Bevis |
|---|---|---|
| F1 Start/Stopp | **Rettet** | DESIGN §3.2: ark hoppes over som standard i Via Meldinger (mockup `flows.out` A: «sheet hidden by default? true»), Start bytter aldri funksjon, Stopp er egen `.stopbtn`, status utløper (`effectiveStatus`, E: «Varmer på · antatt 11:04 / Går til 11:34»). |
| F2 Forhåndsprogrammering | **Rettet** | Vakt for fortid (K: «Starttiden er passert. Sender START i stedet»), kjøretidsadvarsel (L: «Varmeren stopper 06:30, før avreise 07:00. Kjøretiden er 30 min …»), én motor (DESIGN §6.1, `plan.repeat`). |
| F3 Faste dager | **Delvis rettet** | Tilstandsmaskin §6.3, 14 dager §6.4, STOP ved hopp over etter sending (D: STOP-ark «Starten er allerede sendt til modulen. Hopp over sender STOP.» → neste = tirsdag), morgen-reserve (E). Ikke ferdig: automasjon + hopp over i mockup/i18n (se §3 pkt. 4), og regelen `max(kveldstid, start − 23 t 30)` gir feil sendetid for starttider etter kveldstid (§3 pkt. 1). |
| F4 Oppsett | **Rettet** | `onboarding.number.register` («Første nummer registreres av installatøren eller med ACCLIM …»), `onboarding.test.body` uten ASPONSE-forbehold, dual-SIM-hint (Q: onb2-tekst). |
| F5 Språk | **Delvis rettet** | Alle oppførte feil er rettet (de Gesendet/Empfangen, Übersicht, Wochentage, «Wochenplan wird gesendet», «am Montag um 21:00», «Wie Systemsprache»; fi «klo» + «maanantaina»; es Enciende/Activado/«Pasado a la app»; fr Activé). `common.dayAt` finnes i alle språk. Gjenstår: morsmålsgjennomgang er «bestilt», ikke gjort, og stikkprøven i §4 finner nye småfeil (de «abfahrt» i liten bokstav, es «supuesto»). |
| F6 SMS-strategi | **Delvis rettet** | DESIGN §5: automasjon = eneste sender, trykk «1 i appen + 1 i Meldinger» (panel og research 02 §4), `SCHEDULE_EXACT_ALARM` i `store` (§10), `UIBackgroundModes` borte (grep: 0 treff i DESIGN), Pro-APK-oppdatering (§5). Gjenstår: i18n `sched.automationHelp` og mockupen forteller en annen historie om hopp over/pause enn §5 (§3 pkt. 4). |
| F7 Status/temperatur | **Rettet** | Status-pille «antatt {tid}»/«bekreftet {tid}» (G: «Varmer på · antatt 11:04» → «bekreftet 11:04» etter svar), «Sist bekreftet/Sist sendt» (A), SIM-gyldighet (§4.4), Kortkommando «Melding → Åpne URL» (§3.5), «Unknown Message!» i §12. |
| F8 Logg | **Rettet** | §7: 90 dager / 500 rader, deling som tekst; «bekreftet av modulen» i logg (G); ingen svar på iPhone (A: `.event.in` = 0). |
| F9 Avanserte kommandoer | **Delvis rettet** | ACCLIM-editor (S: egen skjerm, eget nummer låst, maks 5), tallfelt LOTEMP/HITEMP, PIN-endring, SETDEFAULT med dobbel bekreftelse (T2). Men tallfeltene produserer én ugyldig SMS og editoren har ingen kilde for «eget nummer» (§3 pkt. 5–6). |
| Teknisk arkitektur | **Rettet** | §10: `npx expo install --fix` ved prosjektstart, PIN bare i secure-store (§7), `send()` → `'sent'` + `onDelivered`-event, EAS Update. Versjonene er «verifisert med npm view» ifølge research 02; kan ikke etterprøves offline, men dokumentet skiller nå npm-lest fra tredjeparts-opplysninger. |
| Lokal lagring / personvern | **Rettet** | §7 «PIN ligger IKKE her», eksport med advarsel + PIN-avkrysning (R: PIN mangler i forhåndsvisning til boksen hukes), OS-backup nevnt (§7/§11), «ignoreres og lagres aldri» (§5). |
| Kanttilfeller / planleggingsmotor | **Delvis rettet** | §12 har alle de etterlyste radene og §13 tester dem. Men nye hull: sendetid for sene starttider, «Endre tid» etter sending, «Start om 30 min» spores ikke som sendt (§3 pkt. 1–3). |
| Mockup | **Delvis rettet** | Alle ti punkter i v1.0 §4 er rettet (se 1.4). Ny regresjon: Temperaturalarm-raden stikker ut av rammen og gir horisontal scroll ved 360/390 px (§3 pkt. 7). |
| «Mye bedre»-påstanden | **Rettet** | §0-tabellen er per plattform og har kilder med dato. |

### 1.2 Faktiske og logiske risikoer (§2 i v1.0)

| # | Status | Bevis |
|---|---|---|
| 1 Svarformater oppdiktet | **Delvis rettet** | §8 `replyParsers: []` med kommentar, §15 pkt. 1, panel «Svar fra modulen er eksempeltekster». Android Pro-loggen i mockupen viser fortsatt «Heater started, temp 4C» uten merking i selve appen; kan ikke løses uten enhet. |
| 2 STATUS-semantikk | **Delvis rettet** | Panelet sier «Driftsmodus / feilkoder (varierer med firmware)», men `sheet.explain.status` lover fortsatt «status og feilkoder» i alle 8 språk. |
| 3 Onboarding-tekst | **Rettet** | `onboarding.test.body`: «Send STATUS til modulen og se at den svarer i Meldinger.» |
| 4 PIN to steder | **Rettet** | §7 kommentar «PIN ligger IKKE her», `vehicle` uten `pin`-kolonne. |
| 5 Eksakte alarmer i butikk | **Rettet** | §5 og §10 `app.config.ts`: `SCHEDULE_EXACT_ALARM` i begge varianter. |
| 6 23,5 t vs kvelden før | **Rettet** | §6.2 `sendetid = max(kveldstid, vindu)`; mockup B: avreise 23:00 → «Sendes i kveld kl. 23:00 · START2230» (= 23,5 t). Se likevel §3 pkt. 1 om at regelen er riktig vindu, men feil kveld. |
| 7 Konfliktregel | **Rettet** | §6.5 og `computeNext` er like; B4: «Jobb: Erstattet av Planlegg start». |
| 8 Trykk-telling | **Rettet** | Research 02 §4, DESIGN §0/§1/§5, panel «1 i appen + 1 Send i Meldinger» (G: bytter til «1 i appen (Direkte)» når bekreftelse slås av). |
| 9 Automasjon ufullstendig | **Delvis rettet** | §5 og guiden definerer eneste sender, STOP-ark 21:05, pause via `shortcuts://`. Mockup og i18n følger ikke (§3 pkt. 4). |
| 10 Expo-versjoner | **Rettet** (med forbehold) | Research 02: «lest direkte fra npm-registeret», minimumskrav merket som uverifiserte, `expo install --fix` i §10. Ikke etterprøvbart her. |
| 11 Påstander om Eberspächer-appen | **Rettet** | §0: sitater fra App Store-oppføring og hastadklev.no, dato 8. nov 2026, «brukes ikke i markedsføring uten sitater». |
| 12 `UIBackgroundModes` | **Rettet** | Ikke lenger i §10; §6.4 «Ingen bakgrunnsprosess er nødvendig i MVP». |
| 13 `send()` returnerer delivered | **Rettet** | §10: `Promise<'sent'|'failed'>`, levering som event `onDelivered(id)`. |
| 14 Modulens klokke | **Rettet** | Research 01 «Må verifiseres» har punktet; §6.7 og §15 pkt. 3. |
| 15 iOS «Send senere» | **Ikke rettet** | Research 02 §3 sier fortsatt bare «støtter ikke gjentakelse»; at funksjonen kun gjelder iMessage, ikke SMS, står ingen steder. |
| 16 §9 vs i18n | **Rettet** | §9: 251 nøkler, en-GB 24 t, mandag først i alle språk (`meta.locale` = en-GB bekreftet). |
| 17 Play-status uten «antatt» | **Rettet** | `statusBadge` viser «antatt {tid}» på alle plattformer (G play: «Varmer på · antatt 11:04»). |

### 1.3 UX-hull en kald morgen (§3 i v1.0)

| # | Status | Bevis |
|---|---|---|
| 1 Påminnelse oversett | **Rettet** | Morgen-reserve §6.3/§12, mockup E: «Du sendte ikke START0630 i går. Send START nå?» → START → «Varmer på · antatt». |
| 2 Forvarming > kjøretid | **Rettet** | Innstilling «Varmerens kjøretid», advarsel i Planlegg og Rediger (L). |
| 3 Status henger igjen | **Rettet** | `effectiveStatus` utløper etter kjøretid; Start alltid Start. |
| 4 START+STOP sletter morgendagen | **Rettet** | C: STOP-ark «STOP sletter også planlagt start 06:30» + forhåndsvalgt «Send START0630 på nytt etterpå» → nytt ark åpnes automatisk → logg START0630/STOP/START0630. |
| 5 Hopp over etter sending | **Rettet** | D (se 1.1 F3). |
| 6 Avreise flyttes om morgenen | **Delvis rettet** | «Endre tid» finnes (N: lager én-gangs-plan 07:15 som erstatter Jobb). Men når START0630 allerede er sendt, sendes ikke ny `START0715` straks; den venter til kl. 21:00, og STOP-arket tilbyr fortsatt «Send START0630 på nytt» (N2). Se §3 pkt. 2. |
| 7 Modulen svarer ikke | **Rettet** | «Sist bekreftet/Sist sendt», SIM-gyldighet med 7-dagers varsel, ACCLIM-hjelpetekst. |
| 8 Automasjon + hopp over | **Delvis rettet** | Dokumentet ja, mockup/i18n nei (§3 pkt. 4). |
| 9 Dual-SIM på iPhone | **Rettet** | `onboarding.number.sim` i alle språk. |
| 10 Hansker/mørkt | **Rettet** | Hurtigrad 68 pt, Send i full bredde, Avbryt som lenke, undertekst flyttet ut av Start-knappen (alle språk: innhold ≤ 157 px i 176 px). |
| 11 Sommertid | **Rettet** | Verifiseringspunkt i research 01, §6.7, §15 pkt. 3. |

### 1.4 Mockup-feil (§4 i v1.0)

| # | Status | Bevis |
|---|---|---|
| 1 Modulsvar på iPhone/Play | **Rettet** | A: iOS Hjem 0 innkommende rader, modulkort «Sist sendt lørdag kl. 21:00 · 7. nov.», `simReply` gir bare toast «Svaret kommer i Meldinger»; Android (Play) har ingen «Les svar»-bryter. |
| 2 «Hvorfor»-toast uleselig | **Rettet** | Utvidbar `details.why` i arket (G play: synlig og lesbar). Merk: arket vises ikke som standard, så forklaringen møter brukeren først når bekreftelse er på eller ved STOP/konfig-kommandoer. |
| 3 Starttid i fortiden | **Rettet** | K. |
| 4 Sen avreise utenfor vindu | **Rettet** | B: 23:00 → sendes 23:00 kvelden før (23,5 t). |
| 5 Planen overstyrer seg selv | **Rettet** | C: etter «Send nå» viser Hjem «Jobb · Starter om 19 t 25 min», ikke en ny plan (`S.sent` sporer sendte forekomster). |
| 6 Bekreft før sending ignorert | **Rettet** | G: Android Pro av → ingen ark, fremdriftsark direkte; Play på → ark deretter SMS-app. |
| 7 Ark utenfor viewport | **Rettet** | `layout.log`: 360/fi, 360/nb, 390/nb, 390/fr, 390/de: ark, Send-knapp, Meldinger-knapp, FAB og varsling alle innenfor viewport (`W360-fi-sheet.png`). |
| 8 Doctype/charset/viewport | **Rettet** | `document.compatMode === 'CSS1Compat'`, `<meta charset>` og viewport i `index.html`; `build.mjs` lager begge filer. |
| 9 Døde rader | **Delvis rettet** | Navn (inline), PIN, Autoriserte numre, Temperaturalarm, Eksport, Slett alle data, Pause til dato, Fabrikkinnstilling virker (R, S, T, T2). Fortsatt bare toast: Kommandoprofil, Importer, Tillat eksakte alarmer, «Åpne Meldinger ›», «Oppskrift for Kortkommandoer» (T3, O). Panelet «Hva mockupen viser og ikke viser» nevner ingen av dem. |
| 10 Kontrast i lys modus | **Rettet** | Målt på tokens: hvit på aksent 4,90, god 4,91, info 5,80, advarsel 6,38 (5,30 på aksent-soft), feil 4,92, dempet 4,79–5,24; mørk 4,56–8,5. To unntak §9 ikke nevner: Start-teksten på gradientens lyse senter 3,58:1 (34 px fet = stor tekst, OK for AA men ikke «≥ 4,5») og bryter-spor i av-posisjon 1,25:1 mot flaten (ikke-tekst, WCAG 1.4.11 krever 3:1). |
| Mindre: de tab «Start» | **Rettet** | V: «Übersicht Planen Wochenplan Einstellungen». |
| Mindre: Nullstill med åpent ark | **Rettet** | P: ark og OS-lag lukket, onboarding 1 vises. |
| Mindre: toast over neste ark | **Delvis rettet** | `hideToast()` ved nytt ark, men svar-toasten «Svaret kommer i Meldinger» kommer 1,8 s etter STOP og legger seg over Send-knappen i re-sendingsarket (`C-rearm-sheet-toast.png`). |
| Mindre: onboarding 2 dobbel overskrift | **Rettet** | Q: én `h2`. |
| Mindre: a11y (nestet knapp, `aria-pressed` på span) | **Rettet** | `.rowbtn` + søsken-`switch`, chips er `button[aria-pressed]`. |
| Mindre: lang undertekst i Start | **Rettet** | Hint ligger under knappen. |
| Oversettelsesfeil (de/fi/es/fr/nb) | **Rettet** | Se 1.1 F5. nb «Komponer» → «Via Meldinger» i Innstillinger, men `log.mode.compose` heter fortsatt «Komponer» i loggen («START0630 Sendt · Komponer»); tilsvarende «Verfassen/Redactar/Rédiger/Skriv». |

---

## 2. Ny poengtabell (v1.1)

| Punkt | Poeng | Begrunnelse (én linje) | Hva som må til for 9+ |
|---|---|---|---|
| F1 Start/Stopp | **8** | Ett trykk + Send, Start bytter aldri, status utløper, STOP advarer og tilbyr re-sending. Men «Start om 30 min» spores ikke som sendt: etterpå går STOP rett til Meldinger uten advarsel selv om pillen viser «Start planlagt» (M), og pillen «Start planlagt · antatt 11:04» viser sendetidspunkt, ikke starttid. | Registrer alle `STARThhmm` (også hurtigknappen) som sendt forekomst; pille «Start planlagt 11:35 · sendt 11:04». |
| F2 Forhåndsprogrammering | **8** | Vakter, kjøretidsadvarsel og én motor er på plass og virker i mockupen. Men «Endre tid» etter at `STARThhmm` er sendt venter til kveldstid med ny kommando mens modulen holder gammel tid (N2), og STOP-arket tilbyr den gamle kommandoen. | Når en sendt forekomst erstattes samme dato: send ny `STARThhmm` straks (overskriver) og oppdater `S.sent`. |
| F3 Faste dager | **8** | Tilstandsmaskin, morgen-reserve, STOP ved hopp over etter sending, pause med dato, 14 dager: alt virker i mockupen. Men sendetid-regelen bruker «dagen før starttid kl. 21:00» også når starttiden er sen på kvelden: avreise 23:00 gir påminnelse kl. 23:00 kvelden før (ikke 21:00 samme kveld), og avreise 00:15 gir «Sendes nå» (B2). Automasjon + hopp over er ikke gjennomført utenfor dokumentet. | `kveldstid = siste HH:MM før starttid` (samme dag hvis start > HH:MM), så `max(kveldstid, vindu)`. Gjør hopp over på automasjonsplan til STOP-ark/21:05-påminnelse i mockup, og rett `sched.automationHelp`. |
| F4 Oppsett | **9** | Nummer + land, ACCLIM-setning, dual-SIM-hint, test uten ASPONSE-forbehold, < 60 s. | Behold. (Se F9 om eget nummer.) |
| F5 Språk | **8** | 251 nøkler × 8, sammensatte dato-fraser, alle meldte feil rettet, ingen rå nøkler eller tekstoverflyt i 8 × 9 skjermer × 2 plattformer. Gjenstår: de «Arbeit · Montag · abfahrt 07:00» (substantiv i liten bokstav fra `toLowerCase()`), es «supuesto 11:11», fi «Pikakomennot lähettää», log-modus «Komponer/Verfassen/Redactar» ≠ «Via Meldinger». | Ikke `toLowerCase()` på substantiv (egen nøkkel «avreise {time}»), es «estimado», fi «Lähetetään Pikakomennoilla», `log.mode.compose` = «Via Meldinger». Gjennomfør bestilt morsmålsgjennomgang. |
| F6 SMS-strategi | **8** | Dokumentet er nå konsistent og ærlig (eneste sender, trykk, tillatelser, Pro-oppdatering, Kortkommando for lesing). Men hopp over på automasjonsplan fortelles på tre måter: DESIGN §5 (STOP-ark 21:05), i18n `sched.automationHelp» («må gjøres i Kortkommandoer»), mockup (bare «Neste gang hoppes over», O). Oppskriften er en toast med hardkodet «søn–tor» i alle språk (de: «am søn–tor um 21:00»). | Én historie i alle tre; ekte oppskriftsskjerm med dagforskyvning fra planens dager. Legg URL-koding av `[Meldingstekst]` og «Kjør umiddelbart» for Melding-utløseren på verifiseringslisten. |
| F7 Status/temperatur | **8** | «antatt/bekreftet» med tid og utløp, «Sist bekreftet/Sist sendt», SIM-varsel, lesing på iPhone via Kortkommando med ærlig begrensning. Men «Les svar»-bryteren i mockupen viser svar umiddelbart uten oppskrift (og nullstiller demo-loggen), `settings.readRepliesHelpIos` sier «Åpne Varmestart» mens §3.5 sier «Åpne URL varmestart://reply?text=», og `sheet.explain.status` lover fortsatt feilkoder. | Vis oppskriften når bryteren slås på; samle i18n og §3.5 på URL-varianten; «status (varierer med firmware)». |
| F8 Logg | **9** | Retensjon, deling, «bekreftet av modulen», ingen svar på iPhone/Play, logg for Pro med svar. | Behold; bytt «Komponer» til «Via Meldinger» i loggen. |
| F9 Avanserte kommandoer | **6** | Editor, tallfelt, PIN og dobbel bekreftelse finnes. Men (1) temperaturalarm sendes som én SMS `1234LOTEMP:-51234HITEMP:35` (T), som modulen ikke kan dele entydig (−5 eller −51234?), (2) ACCLIM sendes som `4740000000` uten at nummerformatet (+/00/nasjonalt) står på verifiseringslisten – feil format låser brukeren ute, (3) «eget nummer alltid først og låst» har ingen kilde: iOS kan ikke lese eget nummer og onboarding spør ikke, (4) Temperaturalarm-raden stikker ut av telefonrammen, Send-knappen er usynlig (T-settings-tempalarm-de.png). | To separate SMS (eller verifisert sammenslåing), ACCLIM-format på «Må verifiseres», felt «Ditt eget nummer» i onboarding/editor, rett layouten. |
| Teknisk arkitektur / Expo SDK 58 | **9** | Motsigelser rettet, `send()`/event, EAS Update, `reply.tsx`, profiler. Merk at §6.4 teller «inntil 40» varslinger uten å regne morgen-reserven: to planer «hver dag» gir 28 forekomster × 2 varsler = 56 (+ fornyelse, SIM) nær iOS-taket 64. | Skriv budsjettet som 2 per forekomst og regelen «morgen-reserve forhåndsplanlegges og avbestilles ved sending». |
| Lokal lagring / personvern | **9** | PIN kun i secure-store, eksport med advarsel/avkrysning (R), OS-backup, mottaker «ignoreres og lagres aldri». | Behold. |
| Kanttilfeller / planleggingsmotor | **7** | §12 dekker nå kald-morgen-listen og mockupen beviser de fleste. Nye hull: sendetid for start etter kveldstid/over midnatt (F3), «Endre tid» etter sending (F2), «Start om 30 min» utenfor sporing (F1), morgen-reserve-tekst i «ved starttid»/Direkte («Du sendte ikke START i går», E2) og udefinert tilstand etter morgen-reserve, `skip_next` tilbakestilles aldri, konflikt sammenlignes på startdag (00:15-plan merket «Hverdager» viser «Neste: søndag»). | Rett regelen, definer tilstand «sendt (reserve)», tilbakestill `skip_next` når forekomsten passerer, sammenlign på avreisedato, egen reservetekst for Direkte/ved starttid. Legg alle i §12 og §13. |
| Mockup | **7** | Alle ti feil fra v1.0 er rettet, ingen konsoll-/sidefeil, overlays innenfor viewport ved 360/390, standards mode, kontrast OK. Men ny regresjon: Innstillinger gir dokumentbredde 523–542 px ved 360 og 390 px i alle språk (Temperaturalarm-raden har min-bredde ≈ 440 px, telefonen vokser til 390 px), og Send-knappen i raden ligger utenfor rammen også ved full bredde. I tillegg: logikkfeilene i F1–F3/F9 reproduseres her, oppskrift = toast «søn–tor», tom plannavn gir «· ·» og «· søndag», toast over re-sendingsark, 00:15-plan «Sendes nå», de/fi Planlegg spiser høyre marg ved 360 px (ramme 343 px). REVIEW.md lover «23 automatiserte sjekker (Playwright)», men ingen sjekkfil ligger i repoet. | Rett raden (stack felt vertikalt, `min-width:0` på inputs), rett logikkhullene, ekte oppskriftsskjerm, sjekk-skriptet inn i `docs/mockup/`. |
| Påstanden «mye bedre» | **8** | §0 er plattformspesifikk med kilder og dato; iPhone-raden er ærlig om «ett trykk». Men §0 sier «Kortkommando-automasjon … null trykk etter oppsett» og «iPhone kan lese svar inn i appen» uten forbeholdene §5/§3.5 tar (iOS kan spørre; appen må i forgrunnen/låses opp). | Ta forbeholdene inn i tabellen (fotnote). |

Snitt: 8,0 (v1.0: 7,4). Under 8: F9, Kanttilfeller og Mockup (v1.0 hadde åtte); under 9: ti av fjorten.

---

## 3. Nye feil i v1.1 (regresjoner og ting første review ikke fant)

1. **Sendetid-regelen velger feil kveld for sene starttider (F3/Kanttilfeller).** DESIGN §6.2 definerer `kveldstid = dagen før starttid kl. HH:MM`. For en ukeplan med avreise 23:00 (start 22:30 mandag) gir det søndag 21:00, som ligger utenfor vinduet, så `max()` gir søndag 23:00 = 23,5 t før start, selv om mandag 21:00 (1,5 t før) er riktig kveld. Repro: Faste dager → slå av Jobb → + → +1 h × 16 (23:00) → Lagre → Hjem: «Sendes i kveld kl. 23:00 · START2230» (`B-home-23.png`). Verre: avreise 00:15 (start 23:45 søndag) gir `kveldstid` = lørdag 21:00, `vindu` = søndag 00:15 < nå → «Sendes nå» midt på dagen (`B2-home-0015.png`, raden viser «Neste: søndag kl. 23:45» for en plan merket «Hverdager»). Regel: `kveldstid` = siste HH:MM før starttid; hvis starttid > HH:MM samme dag, bruk samme dag.
2. **«Endre tid» etter at kveldens START0630 er sendt sender ikke ny tid (F2).** Repro: Påminnelse kvelden før → Send nå → Send; Hjem → Endre tid → −5 min × 3 → Planlegg. Hjem viser «Planlegg start · Sendes i kveld kl. 21:00 · START0715» mens modulen holder 06:30; Stopp-arket sier fortsatt «STOP sletter også planlagt start 06:30 · Send START0630 på nytt» (`N2-stop-after-change.png`). §12 lover «ny STARThhmm overskriver»; mockup og §6 gjør det ikke når sendetid ligger fram i tid.
3. **«Start om 30 min» registreres ikke som sendt start (F1).** Repro: Hjem → Start om 30 min → Send. Pillen viser «Start planlagt · antatt 11:05», men Stopp går rett til Meldinger uten advarsel/re-sending (`M-stop-after-start30.png`, `flows.out` M: «sheet with warning? false»). `armed()` leser bare `S.sent`, hurtigknappen skriver bare `S.status`.
4. **Automasjon + hopp over fortelles på tre måter (F3/F6).** DESIGN §5: «Hopp over → appen viser arket for STOP kl. 21:05». i18n `sched.automationHelp` (alle språk): «Hopp over og pause må gjøres i Kortkommandoer; appen viser hvordan». Mockup: Rediger plan → «Sendes av Kortkommandoer» på → Lagre → Hjem → Hopp over neste → toast «Neste gang hoppes over», Hjem hopper til tirsdag, ingen STOP (`O-home-automation-skip.png`); Kortkommandoer sender likevel søndag 21:00. «Oppskrift for Kortkommandoer» er en toast med hardkodet «søn–tor» i alle språk (de: «Anleitung für Kurzbefehle: am søn–tor um 21:00 → START0630», fi: «søn–torna klo 21.00»), uavhengig av valgte dager (`O-edit-automation.png`).
5. **Temperaturalarm sendes som én tvetydig SMS (F9).** Innstillinger → Temperaturalarm → Send: `1234LOTEMP:-51234HITEMP:35` (`T-tempalarm-sheet.png`, `template.html` linje 619). Research 01 sier bare at kommandoer kan skrives etter hverandre; etter et tall uten skilletegn kan modulen ikke vite om terskelen er −5 eller −51234. Må være to SMS eller verifiseres eksplisitt.
6. **ACCLIM: format og «eget nummer» er uavklart (F9).** Editoren sender `1234ACCLIM:4740000000` (strippet «+»; `S-acclim-sheet.png`). Om modulen vil ha `+47…`, `0047…` eller nasjonalt format står ikke på «Må verifiseres» i research 01; feil format låser brukeren ute av modulen. «Eget nummer alltid først og låst» (DESIGN §4.4) forutsetter at appen kjenner brukerens nummer; iOS gir ikke tilgang til det, onboarding spør ikke, og mockupen hardkoder `+47 400 00 000` (`rNumbers`).
7. **Regresjon: Temperaturalarm-raden sprenger telefonrammen (Mockup).** `layout.log`/widthscan: Innstillinger ved 360 og 390 px gir `document.scrollWidth` 523–542 px i alle 8 språk og 2 plattformer (telefonen vokser fra 328/358 til 390 px); ved 1280 px ligger «Varsle over»-feltet halvt utenfor og Send-knappen helt utenfor rammen (`T-settings-tempalarm-de.png`). Årsak: `.row` med to `input[type=number]` (intrinsisk ≈ 150 px hver) + knapp uten `min-width:0`. Ingen horisontal scroll på andre skjermer; de/fi Planlegg og Rediger plan ved 360 px vokser rammen til 343–344 px (høyre marg borte, ingen scroll).
8. **Morgen-reserve i «ved starttid»/Direkte gir meningsløs tekst (Kanttilfeller).** Android Pro: «Du sendte ikke START i går. Send START nå?» (`E2-pro-morning-sheet.png`). I Direkte-modus er en ubesvart forekomst en feilet sending, ikke et glemt trykk; §6.3 definerer heller ikke hvilken tilstand forekomsten får etter at reserven er sendt.
9. **Varslingsbudsjett i §6.4 regner ikke med morgen-reserven (Arkitektur).** Hver forekomst trenger to forhåndsplanlagte varslinger (kveld + reserve); «inntil 40» holder ikke for to daglige planer i 14 dager (56). Reserven må også avbestilles når brukeren sender; det står ikke.
10. **«Les svar fra modulen» i mockupen viser svar uten oppskrift (F7).** Innstillinger → bryter på → Hjem: 2 innkommende rader og «4 °C» umiddelbart (`A-ios-home-readreplies.png`); ingen oppskrift vises, og `seedLog()` nullstiller demo-loggen. i18n-hjelpeteksten («→ Åpne Varmestart») avviker fra §3.5 («Åpne URL varmestart://reply?text=[Meldingstekst]»), som også trenger URL-koding av teksten.
11. **Status-pillen bruker sendetidspunkt som «antatt»-tid (F1).** «Start planlagt · antatt 11:04» (C) kan leses som start 11:04; starten er 06:30. Vis starttid, og sendetid sekundært.
12. **«Hvorfor åpnes Meldinger?» vises aldri med standardinnstillinger (F1/F6).** Siden arket hoppes over i Via Meldinger-modus, møter en ny iPhone-bruker Meldinger uten forklaring; forklaringen finnes bare i arket (vises ved STOP/konfig) og i Innstillinger → Sendemodus. Én setning i onboarding 3 eller et engangshint første gang løser det.
13. **Småting i mockupen.** Ukeplan uten navn gir «23:00 Hverdager · · 30 min» og «· søndag · avreise 00:15» (`B-sched-23.png`, `B2-home-0015.png`); toast «Svaret kommer i Meldinger» legger seg over Send i re-sendingsarket 1,8 s etter STOP (`C-rearm-sheet-toast.png`); demo-loggen sier START0630 sendt lørdag 21:00 selv om Jobb er man–fre; «Åpne Meldinger ›», Kommandoprofil, Importer og Tillat eksakte alarmer er fortsatt toasts og mangler i panelets «viser ikke»-liste; PIN-feltet er `type="text"`; `input[type=time]` viser «09:00 PM» i nettlesere med engelsk locale uavhengig av appspråk (nettleserartefakt, men det er dette klienten ser).
14. **Dokumentasjon.** REVIEW.md §4 påstår «23 automatiserte sjekker (Playwright) … passerer», men repoet inneholder ingen sjekkfil (kun `build.mjs`); påstanden kan ikke etterprøves. Research 02 §3 mangler fortsatt iMessage-forbeholdet (v1.0 §2 pkt. 15).

Verifisert OK i v1.1 (ingen funn): starttid 23:00 holder 24-timersvinduet; STOP med sendt start gir advarsel + re-sending på iOS/Play/Pro; hopp over etter sending gir STOP og neste dag; morgen-reserve → START → «Varmer på · antatt» med «Går til»; iPhone og Play viser ingen modulsvar som standard; Android Pro «Bekreft før sending» på/av; alle overlays (ark, Meldinger-simulering, varsling, FAB) innenfor viewport ved 360 × 740 og 390 × 844 i nb/fi/fr/de; språkbytte til de/fi/es/fr på Hjem/Innstillinger/Rediger/Planlegg/Faste dager/Logg uten rå nøkler, uten tekst utenfor rammen (unntatt Temperaturalarm) og uten konsollfeil; lys modus 4,79–16,9:1 på alle tekst-tokens; mørk modus 4,56–16:1; tom tilstand (`X-empty.png`) med deaktivert Start og «—» som mottaker.

---

## 4. Stikkprøve av de nye nøklene (de, fi, es, fr)

| Nøkkel | de | fi | es | fr |
|---|---|---|---|---|
| `common.dayAt` | «am {day} um {time}» → «Wird heute Abend um 21:00 gesendet», «Nächster: am Montag um 06:30». Riktig. | «{day}na klo {time}» → «maanantaina klo 06.30», «lauantaina klo 21.00». Riktig for alle sju dager. | «{day} a las {time}» → «Próximo: lunes a las 06:30» OK; «Último envío sábado a las 21:00» mangler artikkel («el sábado»). | «{day} à {time}» → «lundi à 06:30», «Dernier envoi samedi à 21:00». Greit. |
| `home.status.assumed` / `confirmed` | «angenommen {time}» / «bestätigt {time}». Forståelig; «vermutlich seit» er mer naturlig. | «oletettu {time}» / «vahvistettu {time}». OK. | **«supuesto 11:11»** er unaturlig som statusord → «estimado» eller «previsto». «confirmado» OK. | «présumé 11:11» er stivt → «estimé». «confirmé» OK. |
| `plan.runtimeWarning` | «Die Heizung stoppt um {stop}, vor der Abfahrt um {depart}. Die Laufzeit beträgt {count} Min und wird am Bedienelement der Heizung eingestellt.» Riktig. | «Lämmitin sammuu klo {stop}, ennen lähtöä klo {depart}. Käyntiaika on {count} min ja se asetetaan lämmittimen ohjaimesta.» Riktig. | Riktig. | Riktig. |
| `settings.heaterRuntime` / `Help` | «Laufzeit der Heizung»; hjelp «… lässt den Status danach ablaufen» er tungt, men forståelig. | «Lämmittimen käyntiaika»; «tilan vanhentamiseen» er teknisk. | «Tiempo de funcionamiento del calefactor»; «para caducar el estado» er uvanlig («para que el estado caduque»). | «Durée de fonctionnement du chauffage»; «pour faire expirer l’état» OK. |
| `settings.readReplies` / `HelpIos` / `HelpPro` | Riktig; «→ Varmestart öffnen» avviker fra §3.5 (URL). | Riktig; samme avvik. | Riktig; samme avvik. | Riktig; samme avvik. |
| `sheet.stopWarning` | «STOP löscht auch den geplanten Start um {time}.» Riktig. | «STOP poistaa myös ajastetun käynnistyksen klo {time}.» Riktig. | «STOP también borra el encendido programado a las {time}.» Riktig (men `sheet.explain.stop` sier «arranque programado» – metaforen spriker igjen). | «STOP annule aussi le démarrage programmé à {time}.» Riktig. |
| `sheet.rearm` | «{command} danach erneut senden». Riktig. | «Lähetä {command} uudelleen jälkeenpäin». OK («jälkeenpäin» kan sløyfes). | «Enviar {command} de nuevo después». OK. | «Renvoyer {command} ensuite». Riktig. |
| `sched.skipSendsStop` | Riktig. | Riktig. | Riktig. | Riktig. |
| `sched.automation` / `automationHelp` | «Wird von Kurzbefehlen gesendet» riktig; hjelpen sier det motsatte av DESIGN §5. | **«Pikakomennot lähettää»** er klønete → «Lähetetään Pikakomennoilla»; hjelp som de. | «Lo envía Atajos» OK (muntlig); hjelp som de. | «Envoyé par Raccourcis» riktig; hjelp som de. |
| `notif.morningReserve` | «Du hast gestern {command} nicht gesendet. Jetzt START senden?» Riktig, konsekvent «du». | «Et lähettänyt {command} eilen. Lähetetäänkö START nyt?» Riktig. | «Ayer no enviaste {command}. ¿Enviar START ahora?» Riktig, konsekvent «tú». | «Vous n’avez pas envoyé {command} hier. Envoyer START maintenant ?» Riktig, konsekvent «vous». |
| Utenfor listen, men funnet i mockup | **«Arbeit · Montag · abfahrt 07:00»**: `plan.departure` kjøres gjennom `toLowerCase()` → tysk substantiv i liten bokstav. Feil. | «Työ · maanantai · lähtöaika 07.00» OK. | «salida 07:00» OK. | «départ 07:00» OK. |

Konklusjon F5: ingen betydningsfeil igjen; to ordvalg (es «supuesto», fi «Pikakomennot lähettää»), én grammatikkfeil fra kode (de «abfahrt»), én innholdsfeil som gjelder alle språk (`sched.automationHelp` vs §5) og én inkonsekvens (`log.mode.compose`).

---

## 5. Konklusjon

Pakken er ikke klar for kundens egen review av design og mockup etter kravet «minst 9/10 på alle funksjoner»: ti av fjorten punkter ligger på 6–8, og snittet er 8,0. Det som gjenstår er avgrenset og kan gjøres i én runde: (1) rett sendetid-regelen i DESIGN §6.2 og `sendTimeFor` slik at kveldstid er siste HH:MM før starttid (sene/nattlige avreiser), (2) spor alle sendte `STARThhmm` som forekomst (Start om 30 min) og send ny `STARThhmm` straks ved «Endre tid» når forrige er sendt, (3) gjør hopp over/pause på automasjonsplaner likt i DESIGN §5, `sched.automationHelp` og mockupen, med en ekte oppskriftsskjerm uten hardkodet «søn–tor», (4) del temperaturalarmen i to SMS, legg ACCLIM-nummerformat på «Må verifiseres», og gi appen en kilde for brukerens eget nummer, (5) rett Temperaturalarm-raden så Innstillinger ikke gir horisontal scroll ved 360/390 px og Send-knappen er synlig, (6) rett de «abfahrt», es «supuesto», fi «Pikakomennot lähettää» og «Komponer» i loggen, (7) rett morgen-reserve-teksten for Direkte/ved starttid, varslingsbudsjettet i §6.4, iMessage-forbeholdet i research 02 og legg Playwright-sjekkene inn i repoet. Når disse er gjort og verifisert i mockupen, vurderer jeg F1–F3, F5–F7, Kanttilfeller, Mockup og «mye bedre» til 9 og F9 til 8–9 avhengig av om ACCLIM-formatet er bekreftet; da er pakken klar.

---

## Vedlegg: hva som er kjørt

- `r2_flows.cjs` (flyt A–V, `flows.out`), `r2_layout.cjs` (overlays ved 360/390, språk × skjermer, overflyt, rå nøkler, mørk modus, `layout.log`), `r2_width.cjs` (dokumentbredde 320–860 px, v1.0 vs v1.1), `r2_widthscan.cjs` (per skjerm/språk ved 360/390), `r2_strings.cjs`/`r2_strings2.cjs` (lokaliserte tekster de/fi/es/fr), `contrast.cjs` (WCAG-kontrast på alle token-par i begge temaer), `dbg360.cjs`.
- Ingen konsoll- eller sidefeil i noen kombinasjon. Ingen rå i18n-nøkler i noen skjerm. Horisontal scroll kun på Innstillinger (Temperaturalarm-raden).
- Skjermbilder: `A-*` (iPhone-svar), `B-*`/`B2-*`/`B3-*`/`B4-*` (sen avreise, midnatt, én-gangs), `C-*` (STOP/re-sending, alle fire språk), `D-*` (hopp over etter sending), `E-*`/`E2-*` (morgen-reserve), `G-*` (Pro/Play bekreftelse), `K-*` (fortid), `L-*` (kjøretidsadvarsel; språk-skjermer `L-{de,fi,es,fr,nb}-*`), `M-*` (Start om 30 min + STOP), `N-*`/`N2-*` (Endre tid), `O-*` (automasjon), `P-*`/`Q-*` (nullstill/onboarding), `R-*`/`S-*`/`T-*`/`T2-*` (eksport, ACCLIM, temperaturalarm, SETDEFAULT), `T-settings-tempalarm-{de,fi,es,fr}.png` (overflyt), `W360-*`/`W390-*` (overlays ved telefonbredde), `dark-*`, `X-empty.png`.
