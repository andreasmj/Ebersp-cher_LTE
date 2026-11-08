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

## 2. Selvvurdering (versjon 1.1, etter første iterasjon)

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

## 3. Ekstern review

_(fylles inn fra den uavhengige rapporten)_

## 4. Endringslogg etter review

_(fylles inn)_
