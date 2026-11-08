# Hvordan appen kan sende SMS på iPhone og Android

Konklusjon først: **iOS tillater aldri at en app sender SMS uten at brukeren trykker «Send» i
Meldinger.** Android kan sende direkte, men Google Play godtar ikke SEND_SMS-tillatelsen for
vår type app. Designet må derfor ha tre sendemoduser og velge riktig per plattform og distribusjon.

## 1. Komponer-modus (begge plattformer, butikk-vennlig) – STANDARD

- Pakke: `expo-sms` (SDK 58: 58.0.2). `SMS.sendSMSAsync([nummer], tekst)` åpner systemets
  SMS-app med mottaker og tekst ferdig utfylt. Brukeren trykker Send (ett trykk).
- Resultat: iOS gir `sent` / `cancelled`; Android gir alltid `unknown` (plattformbegrensning).
- `SMS.isAvailableAsync()` er `false` i iOS-simulator og på web – må testes på fysisk enhet.
- Alternativ uten pakke: `Linking.openURL("sms:+4790000000&body=START")` (iOS bruker `&body=`,
  Android `?body=`; `?&body=` fungerer ofte på begge). `expo-sms` er mer robust og foretrekkes.
- Ingen tillatelser, ingen policy-problem, fungerer i Expo Go og i butikk-bygg.
- Begrensning: kan ikke kjøre i bakgrunnen. Krever at appen er i forgrunnen.

## 2. Direkte-modus (kun Android, kun «Pro»-bygg utenfor Google Play)

- Egen Expo Module (Kotlin, Expo Modules API) rundt `SmsManager.sendTextMessage()`.
  Dual-SIM: `SmsManager.createForSubscriptionId(subId)` så SMS går fra riktig SIM i bakgrunnen.
- Tidsstyrt sending: `AlarmManager.setExactAndAllowWhileIdle()` + `BroadcastReceiver`,
  `RECEIVE_BOOT_COMPLETED` for å re-planlegge etter omstart.
- Android 14+: `SCHEDULE_EXACT_ALARM` er nektet som standard; appen må be brukeren slå på
  «Alarmer og påminnelser» (`canScheduleExactAlarms()` → åpne innstilling).
  `USE_EXACT_ALARM` er forbeholdt klokke-/kalenderapper og kan ikke brukes.
- Lese svar-SMS fra enheten (`RECEIVE_SMS`) gir status/temperatur rett i appen.
- Google Play: SMS-tillatelser er begrenset til få unntak (standard SMS-app, nødvarsling,
  finansielle transaksjoner, osv.). «Device automation»/«initiate a text message» er
  rapportert som IKKE godkjent. Derfor: Direkte-modus kun i bygg distribuert som APK via
  EAS internal distribution (sideload). Butikk-bygget har ingen SMS-tillatelser i manifestet.
- Eksisterende pakker (`expo-sms-manager`, `react-native-background-sms`,
  `react-native-get-sms-android`) er små og lite vedlikeholdt. Egen modul (~150 linjer Kotlin)
  er tryggere og lar oss eie planleggingen.

## 3. Automasjons-modus (iOS) – for faste dager uten trykk

- iOS Kortkommandoer (Shortcuts): «Personlig automasjon» med utløser «Tidspunkt» (f.eks.
  man–fre 21:00), handling «Send melding» med fast tekst til fast nummer, og
  «Kjør umiddelbart» (uten «Spør før kjøring»). Dokumentert i iOS 17/18-guider; enkelte
  brukere rapporterer at iOS fortsatt spør. Må verifiseres på brukerens iOS-versjon.
- Appens rolle: regner ut nøyaktig tekst (`START0630`) og nummer, og viser en
  «Lag automasjon i Kortkommandoer»-guide med kopier-knapper. Én automasjon per unikt
  (dager, tidspunkt). iOS 18 «Send senere» i Meldinger gjelder bare iMessage (ikke SMS) og støtter ikke gjentakelse, og er derfor uaktuell.
- Når en plan er merket «Sendes av Kortkommandoer», er automasjonen eneste sender: appen
  planlegger ingen påminnelse for den (ingen dobbeltsending). Hopp over gir en bekreftelse og en
  STOP-påminnelse kl. 21:05 (etter automasjonen); pause ber brukeren slå av automasjonen.
- Lese svar på iPhone: Kortkommando-automasjon med utløser «Melding» fra modulens nummer og
  handlingen «Åpne URL varmestart://reply?text=[Meldingstekst]». Appen tar imot lenken
  (expo-linking) og parser svaret. Appen kommer kort i forgrunnen; ved låst skjerm kjøres det
  ved neste opplåsing.
- Må verifiseres på brukerens iOS: at utløseren «Melding» kan kjøre med «Kjør umiddelbart» (uten
  «Spør før kjøring»), at Kortkommandoer URL-koder meldingsteksten i «Åpne URL» (ellers må appen
  tåle rå tekst), og at kjøringen ved låst skjerm skjer ved neste opplåsing.
- Fase 2: `expo-app-intents` (0.5.x, alpha, krever iOS 16.4+) tar imot svarteksten uten å åpne
  appen, og lar Siri/Kortkommandoer spørre appen «hva skal sendes nå?» slik at én automasjon
  dekker alle planer.

## 4. Påminnelses-modus (begge plattformer, fallback) – alltid aktiv

- `expo-notifications` (58.1.8) lokal varsling på sendetidspunktet med handlingsknapp
  «Send nå». Trykk → appen åpner → Meldinger åpnes med riktig tekst → ett trykk Send.
  Totalt to trykk fra låst skjerm med standardinnstilling («Bekreft før sending» av i
  Via Meldinger-modus); tre hvis brukeren har slått bekreftelse på.
- Morgen-reserve: hvis forekomsten ikke er sendt ved starttid, vises en tidssensitiv varsling
  «Du sendte ikke START0630 i går. Send START nå?».
- Ukentlige triggere (`weekly`, weekday 1=søndag … 7=lørdag, hour, minute).
- Android 12+ eksakt varsling krever `SCHEDULE_EXACT_ALARM` (config plugin), også i
  butikk-bygget. Uten den kan varsling komme forsinket under Doze. Appen må informere og lenke
  til innstillingen (Android 14+ nekter som standard).
- iOS: lokale varslinger er presise; appen kan ikke sende SMS fra varslingen uten brukertrykk.

## Hvorfor «kvelden før» er standard for faste dager

Enheten har sin egen 24-timers forhåndsprogrammering (`STARThhmm`). Hvis appen sender
`START0630` kvelden før (standard 21:00, justerbart), er det enheten som holder tiden.
Da trenger ikke telefonen være våken, ha dekning eller ha appen åpen 06:30, og på iOS
får brukeren hele kvelden til å trykke Send. Avbestilling er ett trykk (`STOP`).
Alternativ «ved starttid» (`START` kl. 06:30) finnes som valg, og er standard i
Direkte-modus på Android der det ikke krever brukertrykk.

## Expo SDK 58 – versjoner (verifisert med `npm view <pakke> version` 8. nov 2026)

| Pakke | Versjon | Rolle |
|---|---|---|
| expo | 58.0.23 | SDK 58 (utgitt 15. okt 2026, React Native 0.88, iOS 27-støtte) |
| react-native | 0.88.1 | |
| expo-router | 58.0.30 | Filbasert navigasjon, native tabs (`expo-router/native-tabs`) |
| expo-sms | 58.0.2 | Komponer-modus |
| expo-notifications | 58.1.8 | Påminnelser, ukentlige triggere |
| expo-localization | 58.0.5 | Enhetsspråk, RTL default på i SDK 58 |
| expo-sqlite | 58.0.15 | Lokal lagring (tabeller + kv-store) |
| expo-app-intents | 0.5.16 (alpha) | Siri/Kortkommandoer (fase 2) |
| libphonenumber-js | 1.13.15 | Landkoder, E.164-validering |
| i18next + react-i18next | siste | Oversettelser, ICU-flertall |

Pakkenes versjonsnumre er lest direkte fra npm-registeret i denne økten. Minimumskrav for SDK 58
er bare rapportert av tredjepart og må verifiseres i docs.expo.dev-tabellen: iOS 16.4+, Android 7+
(compileSdk 37), Node 22.13+. Expo Go for SDK 58 støtter bare SDK 58. Kjør `npx expo install --fix`
ved prosjektstart.

## Kilder

- docs.expo.dev/versions/latest/sdk/sms – expo-sms API og begrensninger
- docs.expo.dev/versions/latest/sdk/background-task – 15 min minimum (Android), systemstyrt (iOS)
- docs.expo.dev/versions/latest/sdk/app-intents og expo.dev/blog/introducing-expo-app-intents
- docs.expo.dev/guides/localization – expo-localization, RTL i SDK 58
- expo.dev/changelog/sdk-58 og expo.dev/blog/how-to-upgrade-to-sdk-58
- developer.android.com/about/versions/14/changes/schedule-exact-alarms
- support.google.com/googleplay/android-developer/answer/10208820 – SMS/Call Log-policy
- Apple Support-diskusjoner og iOS 18-guider om «Kjør umiddelbart» for «Send melding»
- RFC 5724 (`sms:` URI) og community-rapporter om `&body=` på iOS
