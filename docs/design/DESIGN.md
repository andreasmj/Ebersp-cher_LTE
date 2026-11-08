# Varmestart – designløsning for ny EasyStart GSM-app

Arbeidstittel: **Varmestart** (engelsk: WarmStart). «Eberspächer» og «EasyStart» er varemerker
og brukes ikke i appnavn eller ikon, bare i beskrivende tekst («Fungerer med EasyStart GSM»).

Versjon 1.2 · 8. november 2026 · Expo SDK 58 · Kun lokal lagring · 8 språk
Endringer fra 1.0 er merket **[1.1]**, fra 1.1 **[1.2]**; begge er oppsummert i `REVIEW.md`.

---

## 0. Sammendrag

Varmestart er en app for iPhone og Android som styrer en Eberspächer-varmer med
EasyStart GSM 2G/4G CAN-modul via SMS. Den gjør tre ting godt: **start/stopp**,
**forhåndsprogrammert start** (modulens egen 24-timers timer) og **faste dager** som en
vekkerklokke (ukeplan drevet fra telefonen). Eneste nødvendige oppsett er telefonnummeret
til modulen med landkode. Ingen konto, ingen server, ingen abonnement; alt lagres på telefonen.

### Hva som blir bedre enn Eberspächers «EasyStart GSM»-app, per plattform **[1.1]**

| | Eberspächer-appen | Varmestart iPhone / Android (Google Play) | Varmestart Android Pro (APK) |
|---|---|---|---|
| Start/stopp | Åpner SMS-app | Ett trykk i appen + Send i Meldinger (2 trykk) | Ett trykk + bekreftelse (2), eller ett trykk |
| Forhåndsprogrammering | Ja, 24 t | Ja, regnet ut fra avreise og forvarming, med vakter (fortid, 24 t-vindu, kjøretid) | Samme, sendes uten trykk |
| Faste dager (ukeplan) | Nei | Ja: påminnelse kvelden før (ett trykk) + morgen-reserve, eller Kortkommando-automasjon på iPhone (null trykk etter oppsett) | Ja, null trykk, i bakgrunnen |
| Status/temperatur | Les temperatur | TEMP/STATUS ett trykk, svar i Meldinger. iPhone kan lese svar inn i appen med én Kortkommando-automasjon | Svar leses automatisk, status bekreftes |
| Logg | Nei | Ja, med «antatt» vs «bekreftet» | Ja |
| Språk | Engelsk/svensk | 8 språk | 8 språk |
| Oppsett | Nummer | Nummer med landvelger, test-SMS | Samme |
| Stabilitet | Se kilder under | Expo SDK 58, React Native 0.88, EAS Build, EAS Update for tekstfikser | Samme |

Kilder for påstandene om Eberspächer-appen (hentet 8. nov 2026): App Store-oppføring id476315065
(funksjonsliste «Start heater, Stop heater, Start heater at a given time, Get current temperature»;
anmeldelser «doesn't work with iOS 14» og «scheduled times erased weekly»), hastadklev.no
produktside EasyStart GSM 4G CAN NO («Google Play-appen er midlertidig fjernet, du kan sende SMS
manuelt»). Påstandene brukes ikke i markedsføring uten at sitatene tas med.

---

## 1. Mål, målgruppe og prinsipper

**Målgruppe:** eiere av Eberspächer-varmere med EasyStart GSM i bil, båt og bobil i Norden
og Europa. Typisk bruk: kalde morgener, bil parkert ute, ønsker varm kupé og isfrie ruter til
fast avreisetid på hverdager, pluss spontan start.

**Jobben appen skal gjøre:** «Bilen skal være varm når jeg går ut døra, uten at jeg må huske noe.»

**Prinsipper**
1. **Én innstilling.** Telefonnummer + landkode. Alt annet har gode standardverdier.
2. **Start er ett trykk i appen.** På iPhone og Google Play kommer ett trykk til i Meldinger,
   fordi plattformene krever det. Appen legger aldri til egne ekstra trykk som standard. **[1.1]**
3. **Ærlig om SMS.** Appen viser alltid nøyaktig hvilken tekst som sendes til hvilket nummer,
   og hva som er antatt kontra bekreftet.
4. **Modulen holder tiden.** Når det går, lar vi modulens egen timer (`STARThhmm`) styre
   tidspunktet. Telefonen må ikke være våken, ha dekning eller ha appen åpen om morgenen.
5. **Null sky.** Ingen konto, ingen telemetri, ingen server. Sikkerhetskopi er en lokal fil.
6. **Samme app på begge plattformer**, med plattformspesifikk sendemotor under.
7. **Kald morgen er testen.** Hver funksjon er vurdert mot «hva skjer hvis dette går galt kl. 06:30» (§12). **[1.1]**

---

## 2. Funksjonsoversikt

| ID | Funksjon | Prioritet |
|---|---|---|
| F1 | Start og stopp, kommando-ark, status med «antatt/bekreftet» og utløp | MVP |
| F2 | Forhåndsprogrammert start (én gang) fra avreise og forvarming, med vakter | MVP |
| F3 | Faste dager (ukeplan) som vekkerklokke: dager, tid, forvarming, på/av, pause, hopp over, Kortkommando-flagg | MVP |
| F4 | Oppsett: nummer + landkode, test-SMS, språk. Ferdig på under ett minutt | MVP |
| F5 | Språk: nb, en, de, sv, da, fi, es, fr i appen og i innstillinger, uavhengig av OS-språk | MVP |
| F6 | Sendemotor: Via Meldinger / Direkte (Android Pro) / Automasjon (iOS) / Påminnelse + morgen-reserve | MVP |
| F7 | Status og temperatur (TEMP, STATUS), svar-parsing på Android Pro og på iPhone via Kortkommando | MVP |
| F8 | Logg over alle sendte kommandoer og mottatte svar, retensjon, deling | MVP |
| F9 | Avansert: sommer/vinter, feilkoder, bekreftelser, autoriserte numre (editor), temperaturalarm, PIN, fabrikkinnstilling | MVP |
| F10 | Flere kjøretøy | Fase 2 |
| F11 | Siri/App Intents (bakgrunnslesing av svar), hurtighandlinger på appikon, widget | Fase 2 |
| F12 | Smart forvarming: forslag fra utetemperatur (MET Norway, gratis, uten nøkkel, opt-in) | Fase 3 |
| F13 | Sikkerhetskopi/gjenoppretting til fil (JSON) | MVP (eksport) / Fase 2 (import) |

---

## 3. Brukerreiser

### 3.1 Førstegangsoppsett (mål: < 60 sekunder)
1. Velkomst: språk velges automatisk fra telefonen, kan byttes her.
2. Nummer: landvelger (flagg + landkode, forhåndsvalgt fra SIM/region) og nummerfelt, validert
   med libphonenumber (E.164). Hjelpetekster **[1.1]**: «Nummeret til SIM-kortet i modulen, ikke
   ditt eget», «Første nummer registreres av installatøren eller med ACCLIM fra et allerede
   registrert nummer», «To SIM-kort? Meldinger må sende fra nummeret som er registrert i modulen».
3. Test: «Send STATUS til modulen og se at den svarer i Meldinger.» Hopp over er lov.
4. Ferdig: hjem-skjermen med stor Start-knapp.

### 3.2 Start nå **[1.1]**
Hjem → **Start** → Meldinger åpnes med `START` til modulens nummer → brukeren trykker Send →
appen logger «START sendt 07:12», status blir «Varmer på · antatt 07:12», og viser «Går til 07:42»
(kjøretid fra innstilling). På Android Pro sendes den direkte etter en bekreftelse i arket
(standard på i Direkte-modus, kan slås av).

«Bekreft før sending» finnes i alle moduser. Standard: **av** i Via Meldinger (Meldinger er
bekreftelsen), **på** i Direkte. Konfigurasjonskommandoer (ASPONSE, ACCLIM, SETDEFAULT, LOTEMP,
SUMMER/WINTER) og STOP med advarsel viser alltid arket.

**Stopp** er en egen sekundærknapp under Start. Start-knappen bytter aldri funksjon.
Hvis en forhåndsprogrammert start er sendt til modulen, viser STOP-arket advarselen
«STOP sletter også planlagt start 06:30» og en forhåndsvalgt boks «Send START0630 på nytt
etterpå». Da åpner appen arket for `START0630` rett etter at STOP er sendt.

### 3.3 Forhåndsprogrammert start (én gang)
Planlegg → **avreise** og **forvarming** (10–120 min, standard 30) → appen viser «Varmeren
starter 06:30, bilen er varm til 07:00. Sender START0630 nå.» → **Planlegg**.
- Vakt 1 **[1.1]**: starttid allerede passert → arket foreslår `START` i stedet.
- Vakt 2 **[1.1]**: forvarming lengre enn varmerens kjøretid → gul advarsel «Varmeren stopper
  06:30, før avreise 07:00. Kjøretiden er 30 min og settes på varmerens styreenhet.»
- Innen vinduet (starttid − 23 t 30 min ≤ nå): sender `STARThhmm` nå; Hjem viser nedtelling
  og **Avbryt** (`STOP`).
- Utenfor vinduet: planen lagres som en én-gangs-plan (samme motor som faste dager, §6) og
  sendes på sendetidspunktet.
- Én-gangs-plan samme dato erstatter ukeplanens forekomst (brukeren har valgt bevisst).
- **Endre tid** når en start allerede er sendt til modulen **[1.2]**: modulen har ett slot, så ny
  `STARThhmm` sendes med en gang (innen vinduet) og overskriver. Appen erstatter den sendte
  forekomsten med den nye, og STOP-arket tilbyr re-sending av den nye kommandoen.
- **Start om 30 min** er en én-gangs-plan med forvarming 0 **[1.2]**: den vises i Neste-kortet med
  nedtelling, og STOP advarer om at den slettes.

### 3.4 Faste dager (ukeplan)
Faste dager → **Ny plan** → dager (chips + snarveier hverdager/hver dag/helg), avreisetid,
forvarming, navn → lagre. Listen ser ut som vekkerklokke-alarmer. Hver plan har «Hopp over
neste», «Pause til dato» og på iPhone «Sendes av Kortkommandoer».
Hjem viser alltid «Neste: Varmeren starter 06:30 · Jobb · mandag · Sendes i kveld kl. 21:00»,
med **Endre tid** (lager én-gangs-plan for den dagen), **Hopp over neste** og, når starten
allerede er sendt, nedtelling.

**Hopp over etter at kveldens SMS er sendt [1.1]:** modulen ville ellers startet likevel.
Appen åpner arket for `STOP` med forklaringen «Starten er allerede sendt til modulen. Hopp over
sender STOP.»

### 3.5 Status og temperatur **[1.1]**
Hjem → **Temperatur** / **Status** → `TEMP` / `STATUS`.
- Android Pro: svaret leses automatisk, temperatur og driftsmodus vises, status blir «bekreftet».
- iPhone: standard er «Svaret kommer i Meldinger» med knapp som åpner tråden. Med innstillingen
  **Les svar fra modulen** på, viser appen oppskriften for én Kortkommando-automasjon: utløser
  «Melding fra +47 …» → handling «Åpne URL `varmestart://reply?text=[Meldingstekst]`» (Kjør
  umiddelbart). Kortkommandoer URL-koder teksten; appen dekoder den (expo-linking), parser
  svaret, oppdaterer status og logg. Innstillingen «Les svar fra modulen» slås først på etter at
  brukeren har bekreftet «Jeg har laget automasjonen» på oppskriftsskjermen. **[1.2]**
  Begrensning: appen kommer i forgrunnen i et øyeblikk, og ved låst skjerm kjøres det ved neste
  opplåsing. Fase 2 bytter til `expo-app-intents` som kan ta imot teksten i bakgrunnen.
- Android (Play): som iPhone uten lese-mulighet (RECEIVE_SMS er ikke tillatt i butikk-bygget).

Statuskortet viser alltid «Sist bekreftet {når}» der appen kan lese svar, ellers «Sist sendt
{når}», slik at en modul som har sluttet å svare (utløpt SIM, manglende saldo) oppdages.

---

## 4. Skjermer

Navigasjon: fire tabs i bunn (native tabs i Expo Router 58): **Hjem**, **Planlegg**,
**Faste dager**, **Innstillinger**. Logg og Autoriserte numre er underskjermer av Innstillinger.

### 4.1 Hjem
- Topp: kjøretøynavn, nummer, status-pille: «Status ukjent» / «Varmer på · antatt 07:12» /
  «Varmer på · bekreftet 07:13» / «Start planlagt · 06:30» (starttiden, ikke sendetiden) /
  «Varmer av». **[1.1]** **[1.2]**
- På iPhone/Play: lenke «Hvorfor åpnes Meldinger?» under Stopp-knappen, siden arket hoppes over
  som standard. **[1.2]**
- Stor rund **Start**-knapp (176 pt). Under: «Går til 07:42» når varmeren antas å være på,
  ellers «Starter varmeren nå». Deretter **Stopp** (full bredde, rød tone). **[1.1]**
- **Neste**-kort: neste forekomst fra én-gangs-plan eller ukeplan, med «Sendes {når}» eller
  nedtelling, kommando, **Endre tid**, **Hopp over neste** / **Avbryt**.
- Hurtigrad (min. 68 pt høye mål): **Start om 30 min** · **Temperatur** · **Status**.
- Modulkort: siste temperatur (der svar kan leses), «Sist bekreftet» / «Sist sendt»,
  SIM-advarsel når gyldighetsdato er nær. **[1.1]**
- Siste hendelser (3 linjer fra loggen).
- Tom tilstand uten nummer: kort «Legg inn modulens nummer», Start-knapp deaktivert.

### 4.2 Planlegg (én gang)
Tidsvelger for avreise (plattformens egen), forvarmingsslider, oppsummering med nøyaktig
kommando, vakter (§3.3), Planlegg-knapp, liste over aktive én-gangs-planer med Avbryt.

### 4.3 Faste dager
Liste (tid stort, dager eller «Hverdager», navn, forvarming, «Neste: mandag kl. 06:30 ·
START0630», bryter). Linjer for «Neste gang hoppes over», «Pauset til 15. des.»,
«Kortkommandoer». Global linje: «Sendes kvelden før kl. 21:00 · Endre». «+» for ny.

### 4.4 Innstillinger
1. **Modul**: Telefonnummer (landvelger + nummer), Kjøretøynavn, **Ditt nummer** (det som er
   registrert i modulen; brukes først i Autoriserte numre) **[1.2]**, Test-SMS, Kommandoprofil
   (valgark: EasyStart GSM / EasyStart Call / Egendefinert).
2. **Språk**: 8 språk + «Følg telefonen».
3. **Sending**: Sendemodus (forklart per plattform), Bekreft før sending, Faste dager sendes
   «Kvelden før kl. HH:MM» / «Ved starttid», Klokkeslett kvelden før, Påminnelser, Les svar fra
   modulen (iPhone: Kortkommando-oppskrift; Android Pro: automatisk), Tillat eksakte alarmer
   (Android), SIM-kortet gyldig til (påminnelse 7 dager før). **[1.1]**
4. **Varmer**: Varmerens kjøretid (10–120 min, settes på styreenheten, brukes til advarsler og
   status-utløp) **[1.1]**, Standard forvarmingstid, Sommer/vinter-modus.
5. **Avansert**: PIN (vis/endre), Bekreftelses-SMS (ASPONSE), **Autoriserte numre** (egen skjerm:
   eget nummer alltid først og låst, maks 5, advarsel om at alle numre sendes på nytt, én
   ACCLIM-kommando; Send er deaktivert til Ditt nummer er fylt ut) **[1.1]**, Temperaturalarm
   (tallfelt under/over, **to separate SMS** `1234LOTEMP:-5` og `1234HITEMP:35`, fordi én
   sammenslått tekst er tvetydig for modulen) **[1.2]**,
   Slett feilkoder (CLEAR), Fabrikkinnstilling (SETDEFAULT, bekreftelsesark med advarsel om at
   autoriserte numre forsvinner, deretter kommando-ark).
6. **Data**: Logg, Eksporter sikkerhetskopi (advarsel: inneholder telefonnumre; PIN bare med
   avkrysning), Importer (fase 2), Slett alle data (bekreftelse).
7. **Om**: versjon, lisenser, «Ikke tilknyttet Eberspächer», «Ingen data samles inn».

### 4.5 Kommando-ark (felles komponent)
Mottaker, nøyaktig tekst i monospace, forklaring i klartekst, eventuell advarsel (STOP) og
valg (re-sending), **Send** i full bredde, Avbryt som lenke, og i Via Meldinger-modus en
utvidbar «Hvorfor åpnes Meldinger?» med forklaringen inne i arket. **[1.1]**

---

## 5. Sendemotor

| Modus | iPhone | Android (Play) | Android Pro (APK) | Trykk for Start | Faste dager uten trykk |
|---|---|---|---|---|---|
| Via Meldinger (`expo-sms`) | Standard | Standard | Valgfritt | 1 i appen + 1 i Meldinger | Nei |
| Direkte (egen Expo-modul) | Umulig | Ikke tillatt av Play | Standard | 1 + bekreftelse (kan slås av) | Ja, eksakt alarm |
| Automasjon (Kortkommandoer) | Per plan | – | – | – | Ja, etter oppsett; iOS kan likevel spørre på enkelte versjoner |
| Påminnelse + morgen-reserve | Alltid | Alltid | Fallback | – | Nei (1 trykk kvelden før) |

**Regler**
- Appen velger standardmodus automatisk og forklarer den i Innstillinger → Sending.
- **Automasjon er «eneste sender» for en plan. [1.1]** Når en plan er merket «Sendes av
  Kortkommandoer», planlegger appen ingen påminnelse for den (ingen dobbeltsending), viser
  «Kortkommandoer» på planen og i Neste-kortet, og registrerer forekomsten som «sendt av
  automasjon (ubekreftet)» ved automasjonstidspunktet. Samme historie overalt **[1.2]**
  (dokument, hjelpetekst i appen, mockup): **Hopp over** → automasjonen sender likevel, så appen
  viser arket for `STOP` med forklaring og minner kl. 21:05 (kveldstid + 5 min). **Pause** →
  appen ber brukeren slå av automasjonen (lenke `shortcuts://`) og minner om å slå den på igjen.
  Endres planen, viser appen «Automasjonen på iPhone må oppdateres» med ny oppskrift.
  Oppskriften er en egen skjerm med trinn, utregnede dager (forskjøvet én dag bakover når
  sendingen skjer kvelden før og kveldstiden ligger før starttiden), klokkeslett, tekst og nummer
  med kopier-knapper, og knappen «Jeg har laget automasjonen» som setter flagget.
- Direkte-modus bruker `SmsManager.createForSubscriptionId` på dual-SIM og spør hvilket SIM
  som skal brukes første gang.
- Direkte-modus krever «Alarmer og påminnelser» (Android 14+). Appen sjekker
  `canScheduleExactAlarms()` ved oppstart og viser et banner til det er gjort. Butikk-bygget
  ber om samme tillatelse for presise påminnelser (Play tillater `SCHEDULE_EXACT_ALARM` for
  brukerstyrte påminnelser; `USE_EXACT_ALARM` er forbeholdt klokke-/kalenderapper). **[1.1]**
- Direkte-modus leser innkommende SMS gjennom en `BroadcastReceiver`. Alle SMS passerer
  mottakeren, men bare meldinger fra modulens nummer behandles; alt annet ignoreres og lagres aldri.
- Alle sendinger logges med: tidspunkt, kommando, modus, resultat (sendt / sendt til
  meldingsapp / levert / avbrutt / feilet) og «bekreftet av modulen» når et svar matcher.

**Byggprofiler (EAS)**
- `store`: `POST_NOTIFICATIONS`, `SCHEDULE_EXACT_ALARM`. Ingen SMS-tillatelser. App Store og Google Play.
- `pro`: Android med `SEND_SMS`, `RECEIVE_SMS`, `SCHEDULE_EXACT_ALARM`, `RECEIVE_BOOT_COMPLETED`,
  `POST_NOTIFICATIONS`. APK via EAS internal distribution. Oppdatering: JS/tekst via EAS Update,
  native endringer som ny APK; appen viser versjon og lenke til nedlastingssiden. **[1.1]**
- iOS Pro = store (ingen forskjell mulig).

---

## 6. Planleggingsmotor **[1.1]**

### 6.1 Én motor for én-gangs-planer og ukeplaner
En plan er `{repeat: true, days}` eller `{repeat: false, date}`. Begge gir **forekomster**
(dato, starttid, sendetid, kommando). Planlegg-skjermen lager én-gangs-planer; Faste dager
lager ukeplaner. Hjem viser den første forekomsten uansett type.

### 6.2 Beregning
```
starttid  = avreise − forvarming
vindu     = starttid − 23 t 30 min            // modulen godtar STARThhmm innen 24 t
kveldstid = siste forekomst av HH:MM før starttid   // standard 21:00 [1.2]
sendetid  = max(kveldstid, vindu)             // aldri mer enn 23 t 30 før start
            hvis sendetid < nå: nå
kommando  = "START" + hhmm(starttid)          // modus «kvelden før»
```
Modus «ved starttid»: `sendetid = starttid`, `kommando = START`.
Starttid i fortiden (én-gangs): kommando `START`, arket forklarer.
Eksempler **[1.2]**: avreise 07:00 mandag, 30 min forvarming → starttid 06:30 mandag → kveldstid
søndag 21:00 → `START0630` sendes søndag 21:00. Avreise 23:00 mandag → starttid 22:30 mandag →
kveldstid **mandag** 21:00 (siste 21:00 før starttid) → sendes mandag 21:00, 1,5 t før start.
Avreise 00:15 tirsdag → starttid 23:45 mandag → sendes mandag 21:00. Planens ukedag er
avreisedagen; Faste dager-listen viser «Neste: tirsdag 00:15 · START2345».

### 6.3 Tilstandsmaskin per forekomst
```
planlagt ──(sendetid: varsling vist)──▶ påminnet ──(bruker sender)──▶ sendt ──(svar fra modul)──▶ bekreftet
   │                                        │                            │
   │ (Android Pro / automasjon)             │ (ikke sendt før starttid)  │ (STOP / hopp over)
   └──────────────▶ sendt                   └──▶ ubesvart ──▶ morgen-reserve  └──▶ avbrutt
```
- **planlagt**: forekomst regnet ut, varsling planlagt for sendetid.
- **påminnet**: varsling vist (kvelden før). Handlinger: «Send nå», «Ikke i dag» (= hopp over).
- **sendt**: `STARThhmm` levert til meldingsapp/modul. Modulen holder tiden. Neste-kort viser nedtelling.
- **bekreftet**: svar matchet (Android Pro, iPhone med Kortkommando). Status-pille blir «bekreftet».
- **ubesvart → morgen-reserve**: hvis forekomsten fortsatt er «planlagt/påminnet» ved starttid,
  vises en tidssensitiv varsling «Du sendte ikke START0630 i går. Send START nå?» → `START`.
  Dette er sikkerhetsnettet for en oversett kveldspåminnelse. I Direkte-modus og «ved starttid»
  brukes reserven bare når sendingen feilet, med teksten «Sending av START feilet. Send START
  nå?». Etter reserven går forekomsten til **sendt** med kommando `START`, og status blir
  «Varmer på · antatt». **[1.2]**
- **avbrutt**: `STOP` sendt (Avbryt, Hopp over etter sending, Stopp-knappen). STOP med sendt
  forekomst tilbyr alltid re-sending av `STARThhmm`.

### 6.4 Horisont og fornyelse
Forekomster regnes ut 14 dager frem ved hver endring og hver app-start. Hver forekomst trenger
inntil **to** varslinger: kveldspåminnelse og morgen-reserve; reserven avbestilles når
forekomsten blir «sendt». Bare den vinnende forekomsten per dag får varslinger, så budsjettet
er maks 2 × 14 = 28 pluss én «fornyelsesvarsling» dag 13 («Åpne Varmestart for å fornye planene
for de neste to ukene»), godt under iOS-grensen på 64 ventende. **[1.2]** Android Pro planlegger eksakte alarmer for samme horisont og re-planlegger etter
omstart (`BOOT_COMPLETED`). Ingen bakgrunnsprosess er nødvendig i MVP.

### 6.5 Konflikter
Én-gangs-plan samme dato erstatter ukeplanens forekomst («Jobb: Erstattet av Planlegg start»).
Ellers vinner tidligste starttid, de andre vises som «Dekket av Jobb». Hopp over og pause fjerner
forekomster uten å endre planen; pause vises med dato på planen.

### 6.6 Status-utløp
`START` sendt kl. 07:12 gir «Varmer på · antatt 07:12», «Går til 07:42» (kjøretid). Etter
kjøretiden blir status «Varmer av · antatt 07:42». `STARThhmm` gir «Start planlagt», som går
over i «Varmer på» ved starttid og «Varmer av» etter kjøretid. Bekreftelse fra modulen
overstyrer antakelsen.

### 6.7 Tid og tidssone
Avreise lagres som lokal klokketid. Forekomster regnes ut i telefonens tidssone med
`date-fns-tz`. DST: starttid natt til siste søndag i mars/oktober regnes i lokal tid; modulens
klokkekilde (nett/NITZ eller intern) står på verifiseringslisten (research 01). Tidssonebytte
på telefonen gir hint på Hjem («Du er i en annen tidssone enn bilen?»); lås i fase 2.

---

## 7. Datamodell (expo-sqlite) **[1.1]**

```sql
CREATE TABLE vehicle (
  id TEXT PRIMARY KEY, name TEXT, phone_e164 TEXT NOT NULL, country_iso2 TEXT NOT NULL,
  profile TEXT NOT NULL DEFAULT 'easystart_gsm', mode TEXT DEFAULT 'winter',
  default_preheat_min INTEGER DEFAULT 30, heater_runtime_min INTEGER DEFAULT 30,
  sim_valid_until TEXT, created_at TEXT NOT NULL);           -- PIN ligger IKKE her

CREATE TABLE plan (                -- én-gangs og ukeplan i samme tabell
  id TEXT PRIMARY KEY, vehicle_id TEXT NOT NULL, name TEXT,
  repeat INTEGER NOT NULL,         -- 1 = ukeplan, 0 = én gang
  days_mask INTEGER,               -- bit 0 = mandag … bit 6 = søndag (ukeplan)
  date TEXT,                       -- YYYY-MM-DD (én gang)
  depart_hhmm TEXT NOT NULL, preheat_min INTEGER NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1, skip_next INTEGER DEFAULT 0, paused_until TEXT,
  automation INTEGER DEFAULT 0,    -- iPhone: sendes av Kortkommandoer
  created_at TEXT NOT NULL);

CREATE TABLE occurrence (          -- utregnede forekomster neste 14 dager
  id TEXT PRIMARY KEY, plan_id TEXT NOT NULL, date TEXT NOT NULL,
  start_at TEXT NOT NULL, send_at TEXT NOT NULL, command TEXT NOT NULL,
  state TEXT NOT NULL,             -- planned|reminded|sent|confirmed|cancelled|missed
  notification_id TEXT, alarm_id TEXT, sent_at TEXT, confirmed_at TEXT);

CREATE TABLE log (
  id TEXT PRIMARY KEY, vehicle_id TEXT, at TEXT NOT NULL, direction TEXT NOT NULL, -- out|in
  command TEXT, mode TEXT, result TEXT, confirmed INTEGER DEFAULT 0, raw_reply TEXT);
```

Innstillinger (språk, sendemodus, bekreft før sending, kveldstid, påminnelser, les svar,
autoriserte numre, temperaturalarm-terskler) i `expo-sqlite/kv-store`. **PIN bare i
`expo-secure-store`.** Logg beholdes 90 dager eller 500 rader; kan deles som tekst.
Eksport = én JSON-fil via `expo-file-system` + delingsark, med advarsel om telefonnumre og
PIN bare ved avkrysning. OS-sikkerhetskopi (iCloud/Google) tar med SQLite-databasen, ikke
secure-store; appen sier dette i Om.

---

## 8. Kommandoprofiler

```ts
export const easystartGsm: CommandProfile = {
  id: 'easystart_gsm', name: 'Eberspächer EasyStart GSM 2G/4G',
  start: () => 'START', stop: () => 'STOP',
  startAt: (hh, mm) => `START${hh}${mm}`,          // START0630
  temp: () => 'TEMP', status: () => 'STATUS',
  summer: () => 'SUMMER', winter: () => 'WINTER', clear: () => 'CLEAR',
  config: {
    ack: (pin, on) => `${pin}ASPONSE:${on ? 'ON' : 'OFF'}`,
    numbers: (pin, nums) => `${pin}ACCLIM:${nums.join(':')}`,   // alle numre, maks 5
    loTemp: (pin, c) => `${pin}LOTEMP:${c}`, hiTemp: (pin, c) => `${pin}HITEMP:${c}`,
    reset: (pin) => `${pin}SETDEFAULT`,
  },
  maxScheduleAheadMin: 23 * 60 + 30, caseSensitive: false, allowSpaces: false,
  replyParsers: [],   // fylles etter kalibrering mot ekte svar (§15 pkt. 1); «Unknown Message!» gir feil i logg
};
```

Andre profiler: `easystart_call` (PIN-basert, 3 timere i enheten, ukedager) og `custom`
(brukeren skriver egne tekster). Profilen bestemmer hvilke funksjoner som vises.

---

## 9. Språk og lokalisering **[1.1]**

- Språk: **nb, en, de, sv, da, fi, es, fr**. `i18next` + `react-i18next`, ICU-flertall,
  `expo-localization` for startspråk. Språkvalg i Innstillinger overstyrer OS. Bytte uten omstart.
- Alle tekster ligger i `docs/i18n/` (251 nøkler per språk, lik struktur, verifisert med skript)
  og brukes av mockupen, så lengde og layout er sjekket per språk.
- Sammensatte dato/tid-fraser har egne nøkler per språk (`common.dayAt`: «am {day} um {time}»,
  «{day}na klo {time}», «{day} à {time}»), slik at grammatikken blir riktig i tysk og finsk.
- Datoer/klokkeslett med `Intl.DateTimeFormat` i valgt språk (24 t i alle åtte; en-filen er
  en-GB). Ukedager starter på mandag i alle åtte språk.
- Landvelger: alle land, søkbar, flagg, standard fra region (NO → +47). Nummer vises i
  internasjonalt format.
- Kommandoene (START, STOP…) oversettes aldri; forklaringene gjør det.
- Morsmålsgjennomgang av de, fi, es er bestilt før butikklansering (ordvalg rettet etter review:
  Gesendet/Empfangen, Übersicht, Wochentage, «klo» i finsk, Enciende/encendido i spansk,
  Activado/Activé for På).
- Tilgjengelighet: `accessibilityLabel` på alle knapper, dynamisk tekststørrelse opp til 200 %,
  kontrast ≥ 4,5:1 i begge temaer (målt på tokens i mockupen: 4,9–14:1 lys, 4,6–8,5:1 mørk),
  ingen informasjon bare i farge, berøringsmål ≥ 44 pt (hurtigrad 68 pt).

---

## 10. Teknisk arkitektur **[1.1]**

**Stack:** Expo SDK 58 (expo 58.0.23, verifisert med `npm view` 8. nov 2026), React Native 0.88.1,
TypeScript strict, Expo Router 58.0.30 (native tabs), Zustand, expo-sqlite 58.0.15, i18next,
libphonenumber-js 1.13.15, expo-sms 58.0.2, expo-notifications 58.1.8, expo-localization 58.0.5,
expo-secure-store, expo-file-system, expo-linking, date-fns-tz. Fase 2: expo-quick-actions,
expo-app-intents (0.5.x, alpha). Ingen backend. Ingen analytics-SDK. EAS Update for JS/tekst.
Kjør `npx expo install --fix` ved prosjektstart for å låse pakkeversjoner til SDK-en.

```
app/
  (tabs)/index.tsx          # Hjem
  (tabs)/plan.tsx           # Planlegg
  (tabs)/schedules/…        # Faste dager (liste, rediger)
  (tabs)/settings/…         # Innstillinger (grupper, språk, numre, logg)
  onboarding/…
  reply.tsx                 # mottak av varmestart://reply?text= (iPhone Kortkommando)
src/
  commands/profiles/        # easystartGsm.ts, easystartCall.ts, custom.ts
  engine/                   # occurrences.ts, stateMachine.ts, scheduler.ts (varslinger/alarmer)
  sms/                      # sender.ts (modusvalg), compose.ts, direct.android.ts, reminder.ts
  db/                       # schema.ts, migrations, repositories
  i18n/                     # i18next-oppsett, locales/*.json
  ui/                       # BigButton, StopButton, CommandSheet, ScheduleRow, DayChips, StatusPill …
modules/
  direct-sms/               # Expo Module (Kotlin): send, scheduleExact, cancel, replies
```

**Expo Module `direct-sms` (Android Pro)**
- `send(subId, number, text) → Promise<'sent'|'failed'>` via `SmsManager` med `PendingIntent`
  for sendt-status. Leveringsrapport kommer som **event** `onDelivered(id)` når operatøren svarer.
- `scheduleExact(id, atEpochMs, subId, number, text)` med `setExactAndAllowWhileIdle`, lagret i
  `SharedPreferences` for re-planlegging ved `BOOT_COMPLETED`.
- `canScheduleExact()`, `openExactAlarmSettings()`.
- `onReply(text, from)` event fra `BroadcastReceiver(SMS_RECEIVED)` filtrert på modulens nummer.

**app.config.ts (utdrag)**
```ts
export default ({ config }) => ({
  ...config, name: 'Varmestart', slug: 'varmestart', scheme: 'varmestart', newArchEnabled: true,
  ios: { supportsTablet: false },
  android: { permissions: ['POST_NOTIFICATIONS', 'SCHEDULE_EXACT_ALARM',
    ...(process.env.APP_VARIANT === 'pro' ? ['SEND_SMS','RECEIVE_SMS','RECEIVE_BOOT_COMPLETED'] : [])] },
  plugins: ['expo-router', 'expo-sqlite', 'expo-secure-store',
    ['expo-localization', { supportedLocales: ['nb','en','de','sv','da','fi','es','fr'] }],
    'expo-notifications',
    ...(process.env.APP_VARIANT === 'pro' ? ['./modules/direct-sms/plugin'] : [])],
  updates: { url: 'https://u.expo.dev/<project-id>' },
});
```

**EAS-profiler:** `store`, `pro` (`APP_VARIANT=pro`, APK, internal distribution), `development`.

---

## 11. Personvern og sikkerhet **[1.1]**

- Alt lagres lokalt. Ingen nettverkskall i fase 1 utenom EAS Update (kan slås av i bygget).
- PIN bare i `expo-secure-store`. Telefonnumre i SQLite.
- Android Pro: alle SMS passerer `BroadcastReceiver`, bare meldinger fra modulens nummer behandles,
  og bare parsede verdier + rå tekst fra dem lagres i loggen, som brukeren kan slette.
- Eksport advarer om telefonnumre og tar bare med PIN ved avkrysning.
- OS-sikkerhetskopi: SQLite-filen kan havne i iCloud/Google-backup (brukerens eget valg);
  PIN gjør det ikke.
- Appen viser alltid teksten den sender. Fabrikkinnstilling og endring av autoriserte numre
  krever bekreftelse med forklaring av konsekvensen (kan låse brukeren ute av modulen).
- Personvernerklæring i appen og på butikksidene: «Ingen data samles inn».

---

## 12. Kanttilfeller (kald morgen) **[1.1]**

| Situasjon | Håndtering |
|---|---|
| Kveldspåminnelsen ble oversett | Morgen-reserve ved starttid: «Du sendte ikke START0630 i går. Send START nå?» (tidssensitiv varsling) |
| Forvarming lengre enn varmerens kjøretid | Advarsel i Planlegg/Rediger: «Varmeren stopper 06:30, før avreise 07:00» |
| Status «Varmer på» henger igjen | Status utløper etter kjøretid; Start-knappen bytter aldri funksjon |
| Spontan START + STOP om kvelden sletter morgendagens start | STOP-arket advarer og tilbyr «Send START0630 på nytt etterpå» (forhåndsvalgt) |
| «Hopp over neste» etter at STARThhmm er sendt | Appen sender STOP via arket med forklaring |
| Avreise flyttes om morgenen | «Endre tid» på Neste-kortet → ny STARThhmm overskriver (eller START hvis passert) |
| Modulen svarer ikke (utløpt SIM, saldo, nytt nummer ikke i ACCLIM, ingen dekning) | «Sist bekreftet for N dager siden», SIM-gyldighet med påminnelse, hjelpetekst om ACCLIM |
| Automasjon på iPhone og hopp over/pause | Automasjon er eneste sender for planen; hopp over = STOP-ark kl. 21:05, pause = slå av automasjonen med lenke |
| Dual-SIM på iPhone | Onboarding-hint: Meldinger må sende fra registrert nummer |
| Sen avreise (starttid etter kveldstiden) | kveldstid = siste 21:00 før starttid, sendetid = max(kveldstid, start − 23 t 30) |
| «Start om 30 min» og så Stopp | Er en én-gangs-plan; STOP advarer og tilbyr re-sending |
| Endre tid etter at START0630 er sendt | Ny STARThhmm sendes straks og overskriver modulens slot |
| Starttid passert i Planlegg | START i stedet for STARThhmm |
| To planer samme morgen | Én-gangs erstatter ukeplan; ellers tidligste vinner, andre «dekket» |
| Nummer mangler | Tom tilstand, sendeknapper deaktivert |
| SMS ikke tilgjengelig (iPad, simulator) | Banner, «Kopier kommando» |
| Bruker avbryter i Meldinger | Logg «Avbrutt», forekomst forblir «påminnet», morgen-reserve gjelder |
| Android Play gir `unknown` | Logg «Sendt til meldingsappen», status «antatt» |
| Modul svarer «Unknown Message!» (der svar leses) | Rød linje i logg, forslag: sjekk kommandoprofil |
| Telefon omstartet (Android Pro) | Alarmer re-planlegges fra BOOT_COMPLETED |
| iOS «Kjør umiddelbart» spør likevel | Guide forklarer; påminnelse kan slås på i tillegg per plan |
| Flymodus/ingen dekning | OS køer SMS; appen logger «Sendt til meldingsapp» |
| Sommertid/vintertid | Lokal tid i appen; modulens klokke verifiseres (research 01) |
| Bytte av telefon | Eksport/import av JSON |

---

## 13. Testplan **[1.1]**

- Enhetstester (Jest): kommandoprofiler; `sendTimeFor` (kveldstid = siste HH:MM før start, 23 t 30-vindu,
  avreise 23:00 og 00:15, fortid); tilstandsmaskin (alle overganger i §6.3, inkl. ubesvart → morgen-reserve); konflikter
  (én-gangs erstatter ukeplan, tidligste vinner); skip/pause; DST-overganger; status-utløp;
  nummer-validering for alle 8 land; eksport uten/med PIN.
- Komponenttester: kommando-ark i alle 8 språk (snapshot), STOP-ark med advarsel og re-sending,
  Planlegg med begge vakter.
- Svar-parsing med ekte svar-SMS fra brukerens modul (samles i §15 pkt. 1).
- E2E (Maestro): onboarding, start, planlegg, ukeplan, påminnelse → send, morgen-reserve,
  hopp over etter sending, Endre tid etter sending, Start om 30 min + Stopp, bytt språk, eksporter.
- Mockup-sjekker (Playwright, `docs/mockup/checks/`): 23 + 30 automatiserte sjekker av logikken over
  og av layout i 8 språk × 360/390/1280 px; kjøres med `node docs/mockup/checks/run.cjs`.
- Fysisk enhetsmatrise: iPhone (siste iOS og iOS 16.4), Pixel (Android 14/15/16), Samsung dual-SIM
  for Direkte-modus; Kortkommando-automasjon testes på brukerens iOS-versjon.
- Feltprøve: én uke med ukeplan man–fre mot ekte EasyStart GSM, logg sammenlignes med
  modulens bekreftelses-SMS, inkludert ett tilfelle med oversett kveldspåminnelse.

---

## 14. Veikart

- **Fase 1 (MVP, 5–7 uker):** F1–F9, F13 eksport, butikk-bygg + Android Pro APK, 8 språk,
  Kortkommando-oppskrifter (sending og lesing av svar).
- **Fase 2:** flere kjøretøy, App Intents (bakgrunnslesing av svar, Siri), hurtighandlinger,
  widget, import, tidssone-lås.
- **Fase 3:** smart forvarming fra utetemperatur (MET Norway, opt-in), Watch/Wear-komplikasjon,
  EasyStart Call-profil.

---

## 15. Åpne spørsmål (til brukeren)

1. Eksakt tekst i bekreftelses-SMS fra din modul (send TEMP, STATUS, START0830, STOP og en
   feilskrevet kommando, og lim inn svarene) så svar-parsingen blir riktig fra dag én.
2. Svarer STATUS/TEMP uavhengig av ASPONSE? (Påvirker onboarding-teksten.)
3. Hvor får modulen klokken fra, og hva skjer ved sommertidsskifte? (Send `START0630` kvelden
   før et skifte og se når den starter.)
4. Har du dual-SIM på Android-telefonen?
5. Skal appen publiseres i butikkene, eller bare brukes av deg og kjente? (Avgjør om Android Pro
   er hovedbygget.)
8. Hvilket nummerformat forventer `ACCLIM` (nasjonalt `91234567`, `4791234567` eller
   `+4791234567`)? Send ett og se hvilket som gir svar. **[1.2]**
6. Hvilken kjøretid er satt på varmerens styreenhet? (Standardverdi i appen.)
7. Appnavn: Varmestart er arbeidstittel.
