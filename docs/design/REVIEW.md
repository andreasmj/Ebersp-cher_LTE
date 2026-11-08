# Review av designløsningen – Varmestart

Mål fra briefen: minst 9/10 på alle funksjoner før brukeren selv reviewer design og mockup.

To uavhengige vurderinger er gjort:
1. **Selvvurdering** av designeren mot fem kriterier per funksjon.
2. **Ekstern review** av en uavhengig reviewer som bare fikk briefen og filene, ikke
   selvvurderingen (rapport i §3). Avvik mellom de to er ført i endringsloggen (§4).

## 1. Kriterier

Hver funksjon scores 1–10 på fem kriterier; funksjonens score er den laveste av de fem:

| Kriterium | Betyr |
|---|---|
| Brukeropplevelse | Antall trykk, tydelighet, feiltoleranse, mørk modus, tilgjengelighet |
| Robusthet | Virker når telefonen sover, mangler dekning, bytter tidssone, omstartes |
| Gjennomførbarhet | Kan bygges med Expo SDK 58 og dokumenterte API-er uten hacks |
| Plattformparitet | iPhone og Android får samme resultat, eller forskjellen er forklart og håndtert |
| Lokalisering | Fungerer i alle 8 språk, inkl. tid/dato-format og tekstlengde i layout |

## 2. Selvvurdering (versjon 1.0, før ekstern review)

| Funksjon | Score | Laveste kriterium og hvorfor | Gjort for å nå 9+ |
|---|---|---|---|
| F1 Start/Stopp | 9 | Plattformparitet: iOS-status er «antatt» uten svar-parsing | Status-pille merkes «antatt» til svar bekrefter; Android Pro parser svar; iOS fase 2 via Kortkommando-utløser «Melding» |
| F2 Forhåndsprogrammering | 9 | Robusthet: 24-timers-grensen i modulen | Modulen holder tiden (`STARThhmm`); planer lenger frem lagres og sendes innenfor 23 t 30 min; entydig døgntolkning i §6 |
| F3 Faste dager | 9 | Plattformparitet: iPhone krever ett trykk kvelden før i standardmodus | Kortkommando-automasjon med generert oppskrift (dagforskyvning −1) er med i MVP, påminnelse som fallback; Android Pro null trykk |
| F4 Oppsett | 9 | Brukeropplevelse: brukeren må vite at eget nummer er registrert i modulen (ACCLIM) | Hjelpetekst i trinn 2 og 3, test-SMS, «Autoriserte numre» under Avansert |
| F5 Språk | 9 | Lokalisering: fi/es/fr bør korrekturleses av morsmålsbruker | 8 komplette filer med lik struktur, Intl-formatering, språk uavhengig av OS, mockup verifisert i alle språk |
| F6 SMS-sending | 9 | Gjennomførbarhet: Direkte-modus krever egen native modul og APK-distribusjon | Fire moduser, butikk/pro-bygg, eksakt alarm-flyt, dual-SIM, ærlig forklaring i app |
| F7 Status/temperatur | 9 | Plattformparitet: iOS kan ikke lese SMS | TEMP/STATUS ett trykk, «Åpne Meldinger», Android Pro parser, iOS fase 2 via Kortkommandoer + App Intents |
| F8 Logg | 9 | Robusthet: Android butikk gir alltid `unknown` | Resultat vises som «Sendt til meldingsappen», svar logges når tilgjengelig |
| F9 Avanserte kommandoer | 9 | Brukeropplevelse: risiko for å låse seg ute (ACCLIM/SETDEFAULT) | Dobbel bekreftelse, kommandoen vises alltid i klartekst, PIN i secure store |
| Arkitektur / Expo SDK 58 | 9 | Gjennomførbarhet: expo-app-intents er alpha | Holdt i fase 2; MVP bruker bare stabile SDK 58-pakker |
| Lokal lagring / personvern | 10 | – | Ingen nettverk i fase 1, eksport kun på brukerens initiativ |
| Planleggingsmotor / kanttilfeller | 9 | Robusthet: tidssonebytte | Lokal klokketid, DST-tester, tidssone-hint (lås i fase 2) |
| Mockup | 9 | Brukeropplevelse: forenklede tidsvelgere og landvelger | Alle skjermer, begge temaer, 8 språk, 3 plattformmoduser, påminnelse- og svar-simulering |

## 3. Ekstern review av versjon 1.0 (8. nov 2026)

Uavhengig reviewer fikk briefen og filene, kjørte mockupen headless i 8 språk × 3 plattformer ×
lys/mørk × 1280/390/360 px (94 skjermbilder), målte kontrast og reproduserte logikkfeil.
Full rapport: `docs/design/review-external-v1.0.md`.

| Punkt | Score v1.0 | Hovedfunn |
|---|---|---|
| F1 Start/Stopp | 8 | 3 trykk med standardinnstilling på iPhone/Play; antatt status uten utløp gjorde Start til Stopp |
| F2 Forhåndsprogrammering | 7 | Ingen vakt mot starttid i fortiden; forvarming ikke koblet til kjøretid; to motorer |
| F3 Faste dager | 7 | Pause ufullstendig; hopp over etter sending sendte ikke STOP; automasjon uvitende om hopp over/pause; 7-dagers horisont; sen avreise brøt 24 t-vinduet |
| F4 Oppsett | 9 | ACCLIM-«høna og egget» og ASPONSE-forbehold i test-tekst |
| F5 Språk | 7 | Ordfeil i de (Aus/Ein, «Start»-tab), fi (klo, kasus), es (Encender/Arranque, Sí/No), fr (Oui/Non); limte dato-fraser |
| F6 SMS-strategi | 8 | Automasjon kolliderte med påminnelse; trykk-telling feil; SCHEDULE_EXACT_ALARM manglet i butikk-bygg; ubrukt bakgrunnsmodus |
| F7 Status/temperatur | 6 | iPhone = «send TEMP og les i Meldinger»; status uten «antatt»-merking |
| F8 Logg | 8 | Manglet retensjon, deling, antatt/bekreftet, svar vist på iPhone |
| F9 Avansert | 7 | ACCLIM-editor, terskler og PIN-endring ikke designet |
| Arkitektur | 8 | PIN to steder; send() returnerte «delivered» synkront; versjoner uverifiserte |
| Personvern | 8 | Eksport med PIN uten advarsel; OS-backup ikke nevnt |
| Kanttilfeller | 6 | Kald-morgen-hull (oversett påminnelse, kjøretid, STOP sletter start, status henger) |
| Mockup | 7 | Modulsvar på iPhone; ark utenfor viewport på telefonbredde; quirks mode; døde rader; kontrast 3,3–4,0:1 i lys modus |
| «Mye bedre»-påstanden | 7 | §0-tabellen overselgende og plattformnøytral; konkurrentpåstander uten kilde |

Snitt 7,4. Reviewerens tre styrker som skulle beholdes: kvelden-før-prinsippet, kommando-arket
og oppsett/i18n-pakken.

## 4. Endringslogg v1.0 → v1.1

Alle funn under er rettet i `DESIGN.md`, `docs/i18n/*.json`, mockupen og research-notatene.

**Planleggingsmotor og kald morgen**
- Én motor for én-gangs-planer og ukeplaner (`plan.repeat`), tilstandsmaskin per forekomst
  (planlagt → påminnet → sendt → bekreftet / avbrutt / ubesvart) i DESIGN §6.3.
- Regel `sendetid = max(kveldstid, starttid − 23 t 30)`. Mockup verifisert: avreise 23:00 gir
  «Sendes i kveld kl. 23:00 · START2230», ikke 21:00.
- Morgen-reserve: ubesvart forekomst ved starttid gir «Du sendte ikke START0630 i går. Send START nå?».
- Vakt for starttid i fortiden (→ START) og advarsel når forvarming > varmerens kjøretid
  (ny innstilling «Varmerens kjøretid»).
- STOP med sendt forekomst: advarsel «STOP sletter også planlagt start 06:30» og forhåndsvalgt
  «Send START0630 på nytt etterpå» som åpner neste ark automatisk.
- «Hopp over neste» etter sending sender STOP via arket med forklaring.
- Status med «antatt {tid}» / «bekreftet {tid}», utløper etter kjøretid («Går til 07:42»).
  Start-knappen bytter aldri funksjon; Stopp er egen sekundærknapp.
- 14 dagers horisont + fornyelsesvarsling dag 13; ingen bakgrunnsmodus i MVP.
- Konfliktregel entydig: én-gangs erstatter ukeplan samme dato, ellers tidligste vinner.
  Mockup og dokument er like.
- «Endre tid» på Neste-kortet.

**SMS-strategi og ærlighet**
- «Bekreft før sending» gjelder alle moduser; standard av i Via Meldinger, på i Direkte.
  Trykk-telling i dokument, research og mockup-panel: 1 i appen + 1 i Meldinger.
- Automasjon (Kortkommandoer) er eneste sender for en plan: ingen dobbel påminnelse, hopp over
  = STOP-ark kl. 21:05, pause = slå av automasjon med lenke. Ubekreftet-merking.
- iPhone kan lese svar: Kortkommando «Melding fra modulen → Åpne URL varmestart://reply».
  Innstilling «Les svar fra modulen» med oppskrift. Fase 2: App Intents i bakgrunnen.
- `SCHEDULE_EXACT_ALARM` i butikk-bygget; `UIBackgroundModes` fjernet; `send()` gir «sent»,
  levering som event; EAS Update og oppdateringsvei for Pro-APK beskrevet.
- «Sist bekreftet / Sist sendt» på Hjem, SIM-gyldighet med påminnelse, dual-SIM-hint i oppsett,
  ACCLIM-registrering forklart, ASPONSE-forbehold fjernet fra test-teksten.
- §0-tabellen er plattformspesifikk, og påstandene om Eberspächer-appen har kilde og dato.

**Avansert, data og personvern**
- ACCLIM-editor (egen skjerm, eget nummer låst, maks 5, alt sendes på nytt), tallfelt for
  LOTEMP/HITEMP, PIN-endring, SETDEFAULT med bekreftelsesark, eksport med advarsel og PIN-avkrysning,
  Slett alle data med bekreftelse, loggretensjon (90 dager / 500 rader) og deling.
- PIN fjernet fra SQLite-skjemaet (kun secure-store). OS-backup og SMS-mottak presisert.

**Språk**
- 251 nøkler per språk (47 nye), fortsatt full paritet. Rettet: de Gesendet/Empfangen, Übersicht,
  Wochentage, «Wochenplan wird gesendet», «Wie Systemsprache»; fi «klo» i alle tidsfraser,
  «{day}na klo {time}»; es Enciende/encendido gjennomført, Activado/Desactivado, «Pasado a la app
  de mensajes»; fr Activé/Désactivé; nb «Via Meldinger» i stedet for «Komponer».
- Nye sammensatte nøkler `common.dayAt`, `common.todayAt`, `common.tomorrowAt` i alle språk.
- §9 rettet: 251 nøkler, en-GB 24 t, mandag først i alle språk.

**Mockup**
- Ingen modulsvar eller temperaturkort på iPhone/Play uten «Les svar»-innstillingen; svar-knappen
  gir bare «Svaret kommer i Meldinger».
- «Hvorfor åpnes Meldinger?» er en utvidbar tekst i arket, ikke toast.
- Telefonrammen har fast høyde også på mobil og scrolles inn når et ark åpnes; ark og
  Meldinger-simulering er innenfor viewport ved 360 og 390 px (verifisert).
- `build.mjs` lager både `index.html` med fullt HTML-skjelett (standards mode, UTF-8, viewport)
  og `artifact.html` for publisering.
- Alle rader virker: Navn (inline), PIN, Autoriserte numre, Temperaturalarm, Eksport, Slett alle
  data, Pause til dato, Fabrikkinnstilling. Tom tilstand kan vises fra panelet.
- Lys modus: tokens justert til 4,9–14:1 (hvit på aksent 4,90, god 4,91, info 5,80, advarsel 6,38,
  feil 4,92). Mørk modus 4,56–8,5.
- de Hjem-tab «Übersicht», Nullstill demo lukker alle lag, toast nullstilles ved nytt ark,
  onboarding trinn 2 uten dobbel overskrift, ingen nestet knapp i plan-rad, ingen `aria-pressed`
  på span, Start-knappen uten lang undertekst, større berøringsmål.
- 23 automatiserte sjekker (Playwright) dekker funnene over og passerer.

## 5. Ekstern review nr. 2 av versjon 1.1 (8. nov 2026)

Ny uavhengig reviewer fikk første rapport, endringsloggen og filene, og verifiserte hvert funn.
Full rapport: `docs/design/review-external-v1.1.md` (ca. 100 skjermbilder, kontrastmåling, flyt-tester).

| Punkt | v1.0 | v1.1 | Gjenstående funn (rettet i v1.2) |
|---|---|---|---|
| F1 Start/Stopp | 8 | 8 | «Start om 30 min» ikke sporet som sendt start (STOP advarte ikke); status-pille viste sendetid |
| F2 Forhåndsprogrammering | 7 | 8 | «Endre tid» etter sending ventet til kvelden i stedet for å overskrive straks |
| F3 Faste dager | 7 | 8 | Kveldstid-regel valgte feil kveld for starttider etter 21:00; automasjon + hopp over fortalt på tre måter; oppskrift var en toast med hardkodet «søn–tor» |
| F4 Oppsett | 9 | 9 | – |
| F5 Språk | 7 | 8 | es «supuesto», fr «présumé», fi «Pikakomennot lähettää», de «abfahrt» (kode), es «el» i dato-frase, `log.mode.compose` «Komponer» |
| F6 SMS-strategi | 8 | 8 | Morgen-reserve-tekst meningsløs i Direkte-modus; §6.4 varslingsbudsjett; iMessage-forbehold manglet i research |
| F7 Status/temperatur | 6 | 8 | «Les svar» slo på uten oppskrift; hjelpetekst avvek fra §3.5; STATUS-tekst lovet feilkoder |
| F8 Logg | 8 | 9 | – |
| F9 Avansert | 7 | 6 | LOTEMP+HITEMP i én tvetydig SMS; ACCLIM uten eget nummer og nummerformat uverifisert |
| Arkitektur | 8 | 9 | – |
| Personvern | 8 | 9 | – |
| Kanttilfeller | 6 | 7 | Som F2/F3 |
| Mockup | 7 | 7 | Temperaturalarm-raden sprengte bredden ved 360/390 px; døde rader (profil, import, eksakte alarmer, Åpne Meldinger, oppskrift); toast over ark; «Hvorfor åpnes Meldinger?» aldri synlig med standard |
| «Mye bedre» | 7 | 8 | Følger av F3/F7 |

Snitt 8,0. Første reviews funn: 8 rettet + 6 delvis (tabell), 13 rettet + 3 delvis + 1 ikke (risikoer),
9 rettet + 2 delvis (UX-hull), 9 av 10 mockup-feil rettet.

## 6. Endringslogg v1.1 → v1.2

- **Kveldstid = siste forekomst av HH:MM før starttid** (DESIGN §6.2 med tre eksempler; mockup
  `sendTimeFor`). Verifisert: avreise 23:00 → «Sendes i morgen kl. 21:00 · START2230»; avreise 00:15
  → «Sendes i kveld kl. 21:00 · START2345». Faste dager-listen viser avreisedag og -tid.
- **Endre tid etter sending** sender ny STARThhmm straks (overskriver modulens slot), erstatter den
  sendte forekomsten, og STOP-arket tilbyr re-sending av den nye kommandoen. Verifisert.
- **Start om 30 min** er en én-gangs-plan med forvarming 0: vises i Neste-kortet, STOP advarer.
- **Status-pille** «Start planlagt · 06:30» viser starttiden.
- **Automasjon + hopp over**: én historie i DESIGN §5, i18n `sched.automationHelp`/`sched.skipAutomation`
  og mockup (STOP-ark med «Kortkommandoer sender START0630 kl. 21:00 uansett … minner deg kl. 21:05»).
  **Oppskrift-skjerm** med trinn, utregnede dager (forskjøvet −1 når kvelden ligger før starttiden),
  klokkeslett, tekst, nummer, kopier-knapper og «Jeg har laget automasjonen».
- **Les svar fra modulen** på iPhone: toggle åpner oppskriften (Melding fra modulen → Åpne URL
  `varmestart://reply?text=`), slås på først etter bekreftelse; hjelpetekst lik §3.5; URL-koding nevnt.
- **LOTEMP/HITEMP** sendes som to separate SMS med egne Send-knapper; raden lagt om til rutenett
  (ingen bredde-overflyt i 8 språk × 360/390 px, verifisert med skann).
- **Ditt nummer** (Innstillinger → Modul) brukes først i ACCLIM-editoren; Send deaktivert uten;
  nummerformat lagt på verifiseringslisten (research 01).
- **Morgen-reserve** i Direkte/«ved starttid»: «Sending av START feilet. Send START nå?»; tilstand
  etter reserve definert (sendt, kommando START). §6.4 budsjett: 2 varslinger per forekomst, maks 29.
- Døde rader implementert: Kommandoprofil (valgark), Importer (forklaring, fase 2), Tillat eksakte
  alarmer (bryter), Åpne Meldinger (simulert tråd), oppskrift. «Hvorfor åpnes Meldinger?» som lenke
  på Hjem. Toast under ark. PIN-felt som passord. Bryter av-tilstand med synlig kant. Tomt plannavn
  gir ikke «· ·». Demo-loggen dateres til siste kveld før en hverdag.
- Språk: es «estimado», fr «estimé», fi «Lähetetään Pikakomennoilla», es `common.dayAt` «el {day}
  a las {time}», `log.mode.compose` = «Via Meldinger» i alle språk, `sheet.explain.status` lover
  ikke lenger feilkoder, 20 nye nøkler (271 per språk, full paritet).
- Research 02: iMessage-forbehold for «Send senere». Research 01: ACCLIM-format og LOTEMP/HITEMP
  på verifiseringslisten.
- Sjekkskriptene ligger nå i repoet: `docs/mockup/checks/` (round1: 23, round2: 29), kjøres med
  `node docs/mockup/checks/run.cjs`.

## 7. Ekstern review nr. 3 av versjon 1.2 (8. nov 2026)

Tredje uavhengige reviewer kjørte forfatterens 52 sjekker (alle grønne) pluss 70 egne flyt-sjekker
(inkl. falsk klokke), layout i 8 språk × 360/390 px × 9 skjermer, og verifiserte at `index.html` og
`artifact.html` er identiske med en fersk build. Full rapport: `docs/design/review-external-v1.2.md`.

| Punkt | v1.1 | v1.2 | Gjenstående (rettet i v1.3) |
|---|---|---|---|
| F1 Start/Stopp | 8 | 9 | – |
| F2 Forhåndsprogrammering | 8 | 8 | Én-gangs-start overskrev en allerede sendt START0630 i modulens ene slot uten advarsel |
| F3 Faste dager | 8 | 8 | Sendt forekomst forlot aldri Neste etter starttid; `skip_next` ble aldri nullstilt; hopp over på automasjonsplan sendte STOP med en gang; oppskrift og motor uenige ved starttid 21:00 |
| F4 Oppsett | 9 | 9 | – |
| F5 Språk | 8 | 9 | – |
| F6 SMS-strategi | 8 | 9 | – |
| F7 Status/temperatur | 8 | 9 | – |
| F8 Logg | 9 | 9 | – |
| F9 Avansert | 6 | 8 | ACCLIM-test i §15 kunne låse brukeren ute |
| Arkitektur | 9 | 9 | – |
| Personvern | 9 | 9 | – |
| Kanttilfeller | 7 | 8 | Som F2/F3 |
| Mockup | 7 | 8 | Reserve-kort viste «Starter om 0 min»; småting (versjon, nøkkeltall, STATUS-tekst) |
| «Mye bedre» | 8 | 8 | §0 manglet forbehold om at iOS kan spørre og at appen kommer i forgrunnen ved lesing av svar |

Snitt 8,6. 12 av 14 funn fra andre runde rettet, 2 delvis. Reviewerens konklusjon: med restlisten
gjort, 9 på alle 14 rader.

## 8. Endringslogg v1.2 → v1.3

- **Modulens ene slot**: én-gangs-start mens en start for en annen dag er sendt gir arket
  «Modulen husker bare én planlagt start. START1235 erstatter START0630 (Jobb, i morgen kl. 06:30)»
  med «Minn meg på å sende START0630 på nytt etterpå». Påminnelsen og «Send nå» kommer først
  ett minutt etter at den nye starten har gått (verifisert med falsk klokke). DESIGN §3.3, §12.
- **sendt → utført**: forekomster forlater Neste-kortet når starttiden er passert; sendte poster
  slettes etter starttid + kjøretid. Verifisert: mandag 08:00 viser tirsdag, ingen «Starter om 0 min»,
  status «Varmer av · antatt 07:00». Gjelder også morgen-reserve og «Start om 30 min». §6.3, §7.
- **Hopp over = dato** (`skip_date`), nullstilles automatisk når dagen er passert. Verifisert:
  onsdag 08:00 etter hopp over tirsdag viser «Neste: torsdag» uten hopp-over-linje. §6.5, §7.
- **Hopp over på Kortkommando-plan** er en bekreftelse uten SMS; STOP-påminnelsen kl. 21:05
  simuleres med «Påminnelse kvelden før» og åpner STOP-arket. Hjem viser «STOP-påminnelse kl. 21:05».
  Samme historie i DESIGN §5/§6.5, guiden og mockupen.
- **Oppskriften bruker motorens sendetid-regel**: starttid 21:00 gir automasjonstid 21:30 dagen før
  (vindu), ikke 21:00 (24 t). Verifisert.
- **Konfliktregel på avreisedag** (§6.5, mockup).
- **ACCLIM-test låsesikker** (§15 pkt. 7, research 01). Verifiseringsliste: «Kjør umiddelbart» for
  Melding-utløser og URL-koding i Kortkommandoer (research 02).
- **§0 forbehold**: iOS kan be om bekreftelse i automasjon; lesing av svar tar appen i forgrunnen.
- Småting: versjon 1.3 i Om, 277 nøkler i §9, §15 nummerert riktig, STATUS-tekst i panelet,
  sjekk-tall 23 + 29 + 17. 6 nye nøkler i alle 8 språk (277, full paritet).
- `docs/mockup/checks/round3.cjs` (17 sjekker med falsk klokke) lagt til i `run.cjs`.

## 9. Sluttscore versjon 1.3

_(fylles inn fra sluttverifisering)_
