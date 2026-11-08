# Varmestart – designløsning for ny EasyStart GSM-app

Arbeidstittel: **Varmestart** (engelsk: WarmStart). «Eberspächer» og «EasyStart» er varemerker
og brukes ikke i appnavn eller ikon, bare i beskrivende tekst («Fungerer med EasyStart GSM»).

Versjon 1.0 · 8. november 2026 · Expo SDK 58 · Kun lokal lagring · 8 språk

---

## 0. Sammendrag

Varmestart er en app for iPhone og Android som styrer en Eberspächer-varmer med
EasyStart GSM 2G/4G CAN-modul via SMS. Den gjør tre ting godt: **start/stopp med ett trykk**,
**forhåndsprogrammert start** (enhetens egen 24-timers timer) og **faste dager** som en
vekkerklokke (ukeplan drevet fra telefonen). Eneste nødvendige oppsett er telefonnummeret
til modulen med landkode. Ingen konto, ingen server, ingen abonnement; alt lagres på telefonen.

### Hvorfor mye bedre enn Eberspächers egen app

| | Eberspächer «EasyStart GSM» | Varmestart |
|---|---|---|
| Språk | Engelsk/svensk | Norsk, engelsk, tysk, svensk, dansk, finsk, spansk, fransk |
| Faste dager (ukeplan) | Nei | Ja, med dager, avreisetid, forvarmingstid, pause, «hopp over i morgen» |
| Forhåndsprogrammering | Ja, men tidspunkt ble rapportert slettet ukentlig | Ja, regnet ut fra avreisetid; vises som nedtelling; lagres lokalt |
| Logg over sendte kommandoer | Nei | Ja, med tidspunkt, kommando og resultat |
| Status/temperatur | Les temperatur | TEMP + STATUS, svar vises i appen på Android Pro, guide på iOS |
| Sendemåte | Åpner SMS-app | Komponer (standard), Direkte (Android Pro), Automasjon (iOS Kortkommandoer), Påminnelse |
| Oppsett | Nummer | Nummer med landvelger, test-SMS i onboarding, ferdig på 60 sek |
| Plattformstabilitet | Brøt på iOS 14, fjernet fra Google Play en periode | Expo SDK 58, React Native 0.88, iOS 27-klar, EAS-bygg |
| Flere kjøretøy | Nei | Ja (bil, båt, bobil), valgfritt |
| Mørk modus, tilgjengelighet | Nei | Ja, dynamisk tekststørrelse, VoiceOver/TalkBack |

---

## 1. Mål, målgruppe og prinsipper

**Målgruppe:** eiere av Eberspächer-varmere med EasyStart GSM i bil, båt og bobil i Norden
og Europa. Typisk bruk: kalde morgener, bil parkert ute, ønsker varm kupé og isfrie ruter til
fast avreisetid på hverdager, pluss spontan start.

**Jobben appen skal gjøre:** «Bilen skal være varm når jeg går ut døra, uten at jeg må huske noe.»

**Prinsipper**
1. **Én innstilling.** Telefonnummer + landkode. Alt annet har gode standardverdier.
2. **Alltid ett trykk unna.** Start og stopp er aldri mer enn ett trykk fra hjem-skjermen.
3. **Ærlig om SMS.** Appen viser alltid nøyaktig hvilken tekst som sendes til hvilket nummer,
   og forklarer plattformbegrensningene i stedet for å late som.
4. **Enheten holder tiden.** Når det går, lar vi modulens egen timer (`STARThhmm`) styre
   tidspunktet. Telefonen må ikke være våken, ha dekning eller ha appen åpen.
5. **Null sky.** Ingen konto, ingen telemetri, ingen server. Sikkerhetskopi er en lokal fil.
6. **Samme app på begge plattformer**, med plattformspesifikk sendemotor under.

---

## 2. Funksjonsoversikt

| ID | Funksjon | Prioritet |
|---|---|---|
| F1 | Start og stopp med ett trykk, med kommando-forhåndsvisning og bekreftelse | MVP |
| F2 | Forhåndsprogrammert start (én gang) ut fra avreisetid og forvarmingstid | MVP |
| F3 | Faste dager (ukeplan) som vekkerklokke: dager, tid, forvarming, på/av, pause, hopp over | MVP |
| F4 | Oppsett: nummer + landkode, test-SMS, språk. Ferdig på under ett minutt | MVP |
| F5 | Språk: nb, en, de, sv, da, fi, es, fr i appen og i innstillinger, uavhengig av OS-språk | MVP |
| F6 | Sendemotor: Komponer / Direkte (Android Pro) / Automasjon (iOS) / Påminnelse | MVP |
| F7 | Status og temperatur (TEMP, STATUS), svar-parsing på Android Pro | MVP |
| F8 | Logg over alle sendte kommandoer og mottatte svar | MVP |
| F9 | Sommer/vinter-modus, feilkode-nullstilling, bekreftelses-SMS på/av, autoriserte numre | MVP (under «Avansert») |
| F10 | Flere kjøretøy | Fase 2 |
| F11 | Siri/Kortkommandoer-intents, hurtighandlinger på appikon, widget | Fase 2 |
| F12 | Smart forvarming: forslag til forvarmingstid fra utetemperatur (MET Norway, gratis, uten nøkkel) | Fase 3 |
| F13 | Sikkerhetskopi/gjenoppretting til fil (JSON), deling mellom familiemedlemmer via fil | Fase 2 |

---

## 3. Brukerreiser

### 3.1 Førstegangsoppsett (mål: < 60 sekunder)
1. Velkomst: «Varmestart styrer varmeren din med SMS. Du trenger bare modulens telefonnummer.»
   Språk velges automatisk fra telefonen, kan byttes her.
2. Nummer: landvelger (flagg + landkode, forhåndsvalgt fra SIM/locale, f.eks. +47) og
   nummerfelt. Validering med libphonenumber (E.164). Hjelpetekst: «Nummeret til SIM-kortet
   i EasyStart GSM-modulen, ikke ditt eget.»
3. Test: «Send STATUS for å sjekke at modulen svarer» → åpner SMS-komponering med `STATUS`.
   Hopp over er lov. Tips: «Modulen svarer bare numre som er registrert. Ditt nummer må være
   lagt inn med ACCLIM.» Lenke til hjelp.
4. Ferdig: hjem-skjermen med stor START-knapp.

### 3.2 Start nå
Hjem → trykk **Start** → ark viser «Sender START til +47 9xx xx xxx» → **Send** →
plattformens SMS-app åpnes (Komponer-modus) → brukeren trykker Send → appen logger
«START sendt 07:12» og viser statuskort «Varmer startet 07:12 (kjøretid settes på
varmeren)». I Direkte-modus (Android Pro) sendes den uten mellomsteg og med leveringsstatus.
Stopp fungerer likt med `STOP`.

Innstilling «Bekreft før sending» (på som standard i Komponer-modus) kan slås av; da går
Start rett til SMS-appen.

### 3.3 Forhåndsprogrammert start (én gang)
Planlegg-skjerm → velg **avreise** (tidsvelger, standard neste hele kvarter + 1 t) →
**forvarming** (10–120 min, standard 30) → appen viser «Varmeren starter 06:30 og
bilen er varm til 07:00. Sender START0630.» → **Planlegg** →
- Hvis starttid er innen 24 t: sender `START0630` nå. Hjem viser nedtellingskort
  «Starter om 9 t 18 min» med **Avbryt** (`STOP`).
- Hvis starttid er mer enn 24 t frem: appen lagrer planen og sender når den kommer innenfor
  24 t (påminnelse/direkte/automasjon, se §5). Kortet viser «Sendes i kveld 21:00».

### 3.4 Faste dager (ukeplan)
Faste dager-skjerm → **Ny plan** → dager (M T O T F L S-chips), avreisetid, forvarming,
navn (valgfritt, f.eks. «Jobb») → lagre. Listen ser ut som vekkerklokke-alarmer: tid stort,
dager under, bryter til høyre. Hver plan har «Hopp over neste» og «Pause til dato».
Planen utføres ved at appen sender `STARThhmm` kvelden før (standard 21:00) eller `START`
ved starttid, avhengig av innstilling og plattform (§5).
Hjem viser alltid «Neste: Tirsdag 06:30 (Jobb) – sendes i kveld 21:00».

### 3.5 Status og temperatur
Hjem → «Spør modulen» → `TEMP` eller `STATUS`. Android Pro leser svaret og viser
temperatur og driftsmodus på statuskortet. iOS: appen viser «Svaret kommer i Meldinger» med
en knapp som åpner Meldinger-tråden.

---

## 4. Skjermer

Navigasjon: fire tabs i bunn (native tabs i Expo Router 58): **Hjem**, **Planlegg**,
**Faste dager**, **Innstillinger**. Logg ligger som et kort på Hjem og som full skjerm fra Innstillinger.

### 4.1 Hjem
- Topp: kjøretøynavn (standard «Bilen»), nummer i grått, status-pille (Ukjent / Startet / Stoppet / Planlagt).
- Stor rund **Start**-knapp (176 pt). Når varmeren er startet blir den **Stopp**. Ved planlagt start
  står Start fortsatt (start nå), og Neste-kortet har **Avbryt** som sender `STOP`.
- **Neste**-kort: neste planlagte start fra F2/F3 med nedtelling, kilde (plan-navn) og Avbryt.
- Hurtigrad: **Start om 30 min** · **Temp** · **Status**.
- Siste hendelser (3 linjer fra loggen).
- Tilstander: ingen nummer (tom tilstand med «Legg inn nummer»), SMS ikke tilgjengelig
  (iPad/simulator: forklaring), ingen dekning (SMS køes av OS; appen viser «Sendt til
  meldingsappen»).

### 4.2 Planlegg (én gang)
- Tidsvelger for avreise (24-timers eller AM/PM etter locale), forvarmingstid-slider med
  trinn på 5 min, oppsummering med nøyaktig kommando, Planlegg-knapp.
- Under: aktiv forhåndsprogrammering (hvis noen) med Avbryt.

### 4.3 Faste dager
- Liste over planer (tid stort, dager, navn, bryter). Sveip for slett. «+» for ny.
- Global linje: «Sendes kvelden før kl. 21:00 · Endre».
- Tom tilstand: «Lag din første plan, f.eks. Jobb man–fre 07:00».
- Redigering: dager-chips, avreisetid, forvarming, navn, «Hopp over neste», «Pause til».

### 4.4 Innstillinger
1. **Modul**: Telefonnummer (landvelger + nummer), Test-SMS, Kommandoprofil (EasyStart GSM standard).
2. **Språk**: liste med 8 språk + «Følg telefonen».
3. **Sending**: Sendemodus (forklart per plattform), Bekreft før sending, Faste dager sendes
   «Kvelden før kl. HH:MM» / «Ved starttid», Påminnelser på/av.
4. **Varmer**: Standard forvarmingstid, Sommer/vinter-modus (sender SUMMER/WINTER).
5. **Avansert**: Modulens PIN (standard 1234, brukes bare til konfigurasjonskommandoer),
   Bekreftelses-SMS på/av (ASPONSE), Autoriserte numre (ACCLIM, maks 5), Temperaturalarm
   (LOTEMP/HITEMP), Slett feilkoder (CLEAR), Fabrikkinnstilling (SETDEFAULT, med dobbel bekreftelse).
6. **Data**: Logg, Eksporter sikkerhetskopi, Importer, Slett alle data.
7. **Om**: versjon, lisenser, «Ikke tilknyttet Eberspächer».

### 4.5 Kommando-ark (felles komponent)
Alle sendinger går gjennom samme ark: mottaker, nøyaktig tekst i monospace, forklaring i
klartekst («Starter varmeren 06:30»), knappen **Send** og lenke «Hvorfor åpnes Meldinger?».

---

## 5. Sendemotor

| Modus | iOS | Android (butikk) | Android Pro (APK) | Brukertrykk | Bakgrunn |
|---|---|---|---|---|---|
| Komponer (`expo-sms`) | Standard | Standard | Valgfritt | 1 (Send i SMS-app) | Nei |
| Direkte (egen Expo-modul, SmsManager) | Umulig | Ikke tillatt av Play | Standard | 0 | Ja, med eksakt alarm |
| Automasjon (Kortkommandoer «Tidspunkt» → «Send melding», Kjør umiddelbart) | Valgfritt for faste dager | – | – | 0 (etter oppsett) | Ja (iOS kjører) |
| Påminnelse (`expo-notifications` med «Send nå»-handling) | Alltid som fallback | Alltid | Fallback | 2 | Varsling ja, sending nei |

**Regler**
- Appen velger standardmodus automatisk og forklarer den i Innstillinger → Sending.
- Faste dager på iOS: standard = Påminnelse kvelden før (21:00) med «Send nå». Brukeren kan
  i tillegg sette opp Automasjon; appen genererer tekst, nummer og trinnvis guide med
  kopier-knapper. Én automasjon per unikt (dager, klokkeslett).
- Faste dager på Android Pro: Direkte ved starttid (`START`) som standard, med alternativet
  kvelden før (`STARThhmm`) hvis brukeren vil at modulen skal holde tiden.
- Direkte-modus bruker `SmsManager.createForSubscriptionId` når telefonen har to SIM, og
  spør hvilket SIM som skal brukes første gang.
- Direkte-modus krever at brukeren slår på «Alarmer og påminnelser» (Android 14+). Appen
  sjekker `canScheduleExactAlarms()` ved oppstart og viser et banner til det er gjort.
- Direkte-modus leser svar-SMS fra modulens nummer (RECEIVE_SMS) og oppdaterer status, temperatur
  og logg. Ingen andre SMS leses eller lagres.
- Alle sendinger logges med: tidspunkt, kommando, modus, resultat (sendt/avbrutt/ukjent/levert).

**Byggprofiler (EAS)**
- `store`: ingen SMS-tillatelser i manifestet. Lastes opp til App Store og Google Play.
- `pro`: Android med `SEND_SMS`, `RECEIVE_SMS`, `SCHEDULE_EXACT_ALARM`, `RECEIVE_BOOT_COMPLETED`.
  Distribueres som APK (EAS internal distribution). iOS Pro = store (ingen forskjell mulig).

---

## 6. Planleggingsmotor

**Beregning:** `starttid = avreise − forvarming`. `sendetid` avhenger av modus:
- Kvelden før: `sendetid = dagen før starttid kl. HH:MM (standard 21:00)`. Hvis starttid er
  mindre enn 24 t fra nå og sendetid allerede er passert, send nå.
- Ved starttid: `sendetid = starttid`, kommando `START`.
- 24-timers-grensen: `STARThhmm` sendes aldri mer enn 23 t 30 min før starttid (margin for
  klokkeavvik i modulen).

**Ukeplan:** ved hver endring og ved hver app-start regnes de neste 14 dagene ut til en liste
med «forekomster» (dato, starttid, kommando, sendetid, kilde). Påminnelser planlegges for de
neste 7 dagene med `expo-notifications` (maks 64 ventende på iOS; appen bruker inntil 30).
Android Pro planlegger eksakte alarmer for de samme forekomstene og re-planlegger etter omstart.

**Konflikter:** to planer samme morgen → den tidligste starttiden vinner, den andre markeres
«dekket av Jobb». Én-gangs-plan overstyrer ukeplan samme dag.

**Hopp over neste / Pause:** fjerner forekomster uten å endre planen. «Pause til dato» viser
en gul linje på planen til datoen er passert.

**Sommertid/vintertid:** alle tider lagres som lokal klokketid (ikke UTC) fordi avreise er
«07:00 lokal tid». Forekomster regnes ut med `Temporal`-polyfill/`date-fns-tz` i gjeldende tidssone.

**Tidssonebytte:** hvis telefonen bytter tidssone, viser Hjem et hint: «Du er i en annen
tidssone enn bilen?» og lar brukeren låse appen til én tidssone (Fase 2).

**Døgnskifte i STARThhmm:** sendes `START0630` kl. 21:00 betyr det 06:30 neste morgen
(innen 24 t). Sendes den kl. 05:00 samme morgen betyr det 06:30 i dag. Appen velger alltid
sendetid slik at tolkningen er entydig.

---

## 7. Datamodell (expo-sqlite)

```sql
CREATE TABLE vehicle (
  id TEXT PRIMARY KEY, name TEXT NOT NULL, phone_e164 TEXT NOT NULL,
  country_iso2 TEXT NOT NULL, profile TEXT NOT NULL DEFAULT 'easystart_gsm',
  pin TEXT DEFAULT '1234', mode TEXT DEFAULT 'winter', default_preheat_min INTEGER DEFAULT 30,
  created_at TEXT NOT NULL);

CREATE TABLE schedule (            -- faste dager
  id TEXT PRIMARY KEY, vehicle_id TEXT NOT NULL, name TEXT,
  days_mask INTEGER NOT NULL,      -- bit 0 = mandag … bit 6 = søndag
  depart_hhmm TEXT NOT NULL, preheat_min INTEGER NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1, skip_next INTEGER DEFAULT 0, paused_until TEXT,
  created_at TEXT NOT NULL);

CREATE TABLE one_shot (            -- forhåndsprogrammering én gang
  id TEXT PRIMARY KEY, vehicle_id TEXT NOT NULL, depart_at TEXT NOT NULL,
  preheat_min INTEGER NOT NULL, state TEXT NOT NULL);  -- pending|sent|cancelled|done

CREATE TABLE occurrence (          -- utregnede forekomster neste 14 dager
  id TEXT PRIMARY KEY, source_type TEXT, source_id TEXT, start_at TEXT, send_at TEXT,
  command TEXT, state TEXT, notification_id TEXT, alarm_id TEXT);

CREATE TABLE log (
  id TEXT PRIMARY KEY, vehicle_id TEXT, at TEXT NOT NULL, direction TEXT, -- out|in
  command TEXT, mode TEXT, result TEXT, raw_reply TEXT);
```

Innstillinger (språk, sendemodus, bekreft før sending, kveldstid, påminnelser) i
`expo-sqlite/kv-store`. PIN lagres i `expo-secure-store`. Ingen data forlater telefonen.
Eksport = én JSON-fil via `expo-file-system` + delingsark.

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
    numbers: (pin, nums) => `${pin}ACCLIM:${nums.join(':')}`,
    loTemp: (pin, c) => `${pin}LOTEMP:${c}`, hiTemp: (pin, c) => `${pin}HITEMP:${c}`,
    reset: (pin) => `${pin}SETDEFAULT`,
  },
  maxScheduleAheadMin: 24 * 60, caseSensitive: false, allowSpaces: false,
  replyParsers: [ /* regex for temperatur, starttid, Unknown Message! */ ],
};
```

Andre profiler: `easystart_call` (PIN-basert, 3 timere i enheten, ukedager) og `custom`
(brukeren skriver egne tekster for start/stopp/status). Profilen bestemmer også hvilke
funksjoner som vises (f.eks. ukedags-timere i enheten bare for EasyStart Call).

---

## 9. Språk og lokalisering

- Språk: **nb, en, de, sv, da, fi, es, fr**. `i18next` + `react-i18next`, ICU-flertall
  (`_one`/`_other`), `expo-localization` for startspråk. Språkvalg i Innstillinger overstyrer
  OS og lagres lokalt. Bytte skjer uten omstart.
- Datoer/klokkeslett med `Intl.DateTimeFormat` i valgt språk (24 t i nb/sv/da/fi/de/fr/es,
  12 t i en-US). Ukedager starter på mandag i alle åtte språk unntatt en-US (søndag).
- Landvelger: alle land, søkbar, flagg som emoji, standard fra `expo-localization` region
  (NO → +47). Nummer vises alltid i internasjonalt format (+47 9xx xx xxx).
- Kommandoene (START, STOP…) oversettes aldri; forklaringene gjør det.
- Alle 8 språkfiler ligger i `docs/i18n/` som del av dette designet (ca. 90 nøkler) og brukes
  også av mockupen, så oversettelsene er allerede kvalitetssikret for lengde og layout.
- Tilgjengelighet: `accessibilityLabel` på alle knapper, dynamisk tekststørrelse opp til 200 %,
  kontrast ≥ 4.5:1 i begge temaer, ingen informasjon bare i farge (status har alltid tekst).

---

## 10. Teknisk arkitektur

**Stack:** Expo SDK 58 (expo 58.0.23), React Native 0.88, TypeScript strict, Expo Router 58
(native tabs), Zustand for UI-tilstand, expo-sqlite for data, i18next, libphonenumber-js,
expo-sms, expo-notifications, expo-localization, expo-secure-store, expo-file-system,
expo-quick-actions (fase 2), expo-app-intents (fase 2). Ingen backend. Ingen analytics-SDK.

```
app/
  (tabs)/index.tsx          # Hjem
  (tabs)/plan.tsx           # Planlegg
  (tabs)/schedules/…        # Faste dager (liste, rediger)
  (tabs)/settings/…         # Innstillinger (grupper, språk, avansert, logg)
  onboarding/…
src/
  commands/profiles/        # easystartGsm.ts, easystartCall.ts, custom.ts
  engine/                   # occurrences.ts (utregning), scheduler.ts (notifications/alarmer)
  sms/                      # sender.ts (modusvalg), compose.ts, direct.android.ts, reminder.ts
  db/                       # schema.ts, migrations, repositories
  i18n/                     # i18next-oppsett, locales/*.json
  ui/                       # komponenter: BigButton, CommandSheet, ScheduleRow, DayChips …
modules/
  direct-sms/               # Expo Module (Kotlin): send, scheduleExact, cancel, replies
```

**Expo Module `direct-sms` (Android Pro)**
- `send(subId, number, text) → Promise<'sent'|'delivered'|'failed'>` via `SmsManager` +
  `PendingIntent` for sendt/levert.
- `scheduleExact(id, atEpochMs, subId, number, text)` med `setExactAndAllowWhileIdle`,
  lagret i `SharedPreferences` for re-planlegging ved `BOOT_COMPLETED`.
- `canScheduleExact()`, `openExactAlarmSettings()`.
- `onReply` event fra `BroadcastReceiver(SMS_RECEIVED)` filtrert på modulens nummer.

**app.config.ts (utdrag)**
```ts
export default ({ config }) => ({
  ...config, name: 'Varmestart', slug: 'varmestart', newArchEnabled: true,
  ios: { supportsTablet: false, infoPlist: { UIBackgroundModes: ['processing'] } },
  android: { permissions: process.env.APP_VARIANT === 'pro'
    ? ['SEND_SMS','RECEIVE_SMS','SCHEDULE_EXACT_ALARM','RECEIVE_BOOT_COMPLETED','POST_NOTIFICATIONS']
    : ['POST_NOTIFICATIONS'] },
  plugins: ['expo-router', 'expo-sqlite', 'expo-secure-store',
    ['expo-localization', { supportedLocales: ['nb','en','de','sv','da','fi','es','fr'] }],
    ['expo-notifications', { enableBackgroundRemoteNotifications: false }],
    ...(process.env.APP_VARIANT === 'pro' ? ['./modules/direct-sms/plugin'] : [])],
});
```

**EAS-profiler:** `store` (App Store + Play, AAB), `pro` (APK, `APP_VARIANT=pro`, internal
distribution), `development` (dev client). Expo Go kan brukes for alt unntatt Direkte-modus.

---

## 11. Personvern og sikkerhet

- Alt lagres lokalt. Ingen nettverkskall i fase 1 (fase 3 værdata er opt-in).
- PIN i `expo-secure-store`. Telefonnummer i SQLite (ikke sensitivt, men eksporteres bare på
  brukerens initiativ).
- Android Pro leser bare SMS fra modulens nummer og lagrer bare parsede verdier + rå tekst
  i loggen, som brukeren kan slette.
- Appen viser alltid teksten den sender. Ingen skjulte kommandoer. Fabrikkinnstilling og
  endring av autoriserte numre krever dobbel bekreftelse (kan låse brukeren ute av modulen).
- Personvernerklæring i appen og på butikksidene: «Ingen data samles inn».

---

## 12. Kanttilfeller

| Situasjon | Håndtering |
|---|---|
| Nummer mangler | Hjem i tom tilstand, alle sendeknapper deaktivert med forklaring |
| SMS ikke tilgjengelig (iPad, simulator) | Banner, knapper viser «Kopier kommando» i stedet |
| Bruker avbryter i SMS-appen | Logg «Avbrutt», status uendret, planen beholdes |
| Android gir `unknown` | Logg «Sendt til meldingsappen», status settes med «antatt» |
| Modul svarer «Unknown Message!» (Android Pro) | Rød linje i logg, forslag: sjekk kommandoprofil |
| Modul svarer ikke | Hjelpetekst om registrerte numre (ACCLIM) og SIM-aktivering |
| STARThhmm mer enn 24 t frem | Appen venter og sender innenfor vinduet |
| Starttid passert når påminnelse trykkes | Arket foreslår `START` i stedet for `STARThhmm` |
| To planer samme morgen | Tidligste vinner, den andre vises som dekket |
| Telefon omstartet (Android Pro) | Alarmer re-planlegges fra `BOOT_COMPLETED` |
| iOS «Kjør umiddelbart» spør likevel | Guide forklarer, fallback Påminnelse er alltid aktiv |
| Flymodus/ingen dekning | OS køer SMS; appen logger «Levert til meldingsapp» og minner om dekning |
| Bytte av telefon | Eksport/import av JSON-sikkerhetskopi |

---

## 13. Testplan

- Enhetstester (Jest): kommandoprofiler, utregning av forekomster (DST-overgang siste søndag i
  mars/oktober, 24-timers-grense, konflikter, skip/pause), nummer-validering for alle 8 land.
- Komponenttester: kommando-ark viser riktig tekst i alle 8 språk (snapshot per språk).
- Enhetstester for svar-parsing med ekte svar-SMS samlet fra brukerens modul.
- E2E (Maestro): onboarding, start, planlegg, lag ukeplan, bytt språk, eksporter.
- Fysisk enhetsmatrise: iPhone (siste iOS og iOS 16.4), Pixel (Android 14/15/16), Samsung med
  dual-SIM for Direkte-modus.
- Feltprøve: én uke med ukeplan man–fre mot ekte EasyStart GSM, logg sammenlignes med
  modulens bekreftelses-SMS.

---

## 14. Veikart

- **Fase 1 (MVP, 4–6 uker):** F1–F9, butikk-bygg + Android Pro APK, 8 språk.
- **Fase 2:** flere kjøretøy, App Intents/Siri, hurtighandlinger, widget, sikkerhetskopi,
  tidssone-lås.
- **Fase 3:** smart forvarming fra utetemperatur (MET Norway Locationforecast, opt-in),
  Apple Watch/Wear-komplikasjon for Start, EasyStart Call-profil.

---

## 15. Åpne spørsmål (til brukeren)

1. Eksakt tekst i bekreftelses-SMS fra din modul (send TEMP, STATUS, START0830 og lim inn
   svarene) så svar-parsingen blir riktig fra dag én.
2. Har du dual-SIM på Android-telefonen?
3. Skal appen publiseres i butikkene, eller bare brukes av deg og kjente (påvirker om Android
   Pro er hovedbygget)?
4. Appnavn: Varmestart er arbeidstittel.
