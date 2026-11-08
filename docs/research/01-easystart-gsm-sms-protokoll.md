# EasyStart GSM (2G/4G CAN) – SMS-protokoll

Status: samlet fra Eberspächer Sverige/Norge sine bruksanvisninger (TC202 Rev. 11/2015 og
«EasyStart GSM CAN 2G/4G Bruksanvisning SE 2023 V1»), Eberspächers komfortguide og
forhandlersider. Eksakt ordlyd i svar-SMS må verifiseres mot egen enhet (se «Må verifiseres»).

## Enheten

| Felt | Verdi |
|---|---|
| Produkt | Eberspächer EasyStart GSM 2/4G CAN |
| Norsk artikkelnr. | 29.2490.00.0301 («EasyStart GSM 2/4G CAN NO») |
| Nett | 2G og 4G (LTE), vanlig SIM-kort som må aktiveres i en mobil først |
| Autorisasjon | Enheten reagerer bare på SMS fra registrerte numre (inntil 5) |
| Oppstart | Inntil ca. 5 min etter spenning før den er klar (knapp blinker 1 Hz) |
| Offisiell app | «EasyStart GSM» (iOS id476315065, Android se.frontwalker.easystartgsm). Sender SMS. Funksjoner: start, stopp, start på tidspunkt, les temperatur |

## Kommandoer (drift) – sendes uten PIN

Regler: kommandoer skrives uten mellomrom, store/små bokstaver spiller ingen rolle.
Flere kommandoer kan skrives etter hverandre uten mellomrom. Feilskrevet kommando gir
svaret «Unknown Message!» (TC202-manualen).

| Kommando | Effekt | Kilde |
|---|---|---|
| `START` | Starter varmeren nå (kjøretid styres av varmerens styreenhet/innstilling) | Komfortguide, 2023-manual |
| `STOP` | Stopper varmeren. Sletter også en forhåndsprogrammert start | 2023-manual |
| `STARThhmm` | Forhåndsprogrammert start innen 24 timer. Eks. `START0830` = start 08:30. Ny SMS overskriver tidspunktet | TC202, komfortguide |
| `TEMP` | Svarer med temperatur i enheten samt MAX/MIN-grenser | TC202 |
| `STATUS` | Svarer med driftsmodus (TC202) / feilkoder og status på inn-/utganger (2023) | TC202, 2023 |
| `SUMMER` | Bytter fra varme til ventilasjon | 2023-manual |
| `WINTER` | Bytter tilbake til varme (fabrikkinnstilling) | 2023-manual |
| `CLEAR` | Sletter feilkoder | 2023-manual |

## Kommandoer (konfigurasjon) – PIN-prefiks (standard `1234`)

| Kommando | Effekt |
|---|---|
| `1234ASPONSE:ON` / `1234ASPONSE:OFF` | Slår bekreftelses-SMS på/av |
| `1234ACCLIM:nr1:nr2:…` | Lagrer autoriserte telefonnumre (maks 5). Alle numre må skrives inn på nytt ved endring |
| `1234LOTEMP:xx` / `1234HITEMP:xx` | Temperaturalarm under/over xx °C. SMS sendes til lagrede alarmnumre |
| `1234SETDEFAULT` | Fabrikkinnstillinger |

## Svar fra enheten (når ASPONSE:ON)

- Etter `STARThhmm`: bekreftelse med varmerens starttid, nåværende klokkeslett og temperatur.
- Etter `START`/`STOP`: bekreftelse på utført kommando.
- Lavspenning: enheten kan sende SMS-varsel om lavt batteri (forhandlerinfo, finn.no-annonse).
- Feil kommando: `Unknown Message!`

## Hva enheten IKKE kan (viktig for designet)

1. **Ingen ukeplan i enheten.** Bare én forhåndsprogrammert start, maks 24 t frem.
   Faste dager må derfor drives fra telefonen.
2. **Ingen kjent SMS-kommando for kjøretid.** Kjøretiden settes på varmerens egen styreenhet
   (EasyStart Timer/Select/CAN). Appens «forvarmingstid» er bare en offset for å regne ut
   starttidspunkt = avreise − forvarming.
3. **Ingen datoangivelse.** `STARThhmm` tolkes som neste forekomst av klokkeslettet innen 24 t.

## Sekundær profil: EasyStart Call (eldre, 2G) – for brukere med annen enhet

Kommandoformat `pin:1234 heater:on,run:45,temp:21`, timere `pin:1234 t1:on,time:TU.06.30,mode:heater,run:45`,
ukedager MO TU WE TH FR SA SU, `t2:off`, `heater?`, `devicetime?`. Appen bør kunne bytte
kommandoprofil, men EasyStart GSM er standard.

## Må verifiseres på fysisk enhet før implementering

- [ ] Eksakt tekst i bekreftelses-SMS (for parsing på Android)
- [ ] Om `STATUS` i 2G/4G-versjonen gir driftsmodus eller feilkoder
- [ ] Om `START` under en aktiv forhåndsprogrammering overstyrer eller legger til
- [ ] Oppførsel ved `STARThhmm` med klokkeslett som allerede er passert i dag (antatt: neste døgn)
- [ ] Om PIN kreves for `ASPONSE` i 2023-versjonen (TC202 krever det)
- [ ] Om `STATUS`/`TEMP` svarer uavhengig av `ASPONSE` (spørringer kontra bekreftelser)
- [ ] Hvor modulen får klokken fra (nett/NITZ eller intern) og hva som skjer med `STARThhmm`
      sendt kvelden før et sommertidsskifte
- [ ] Eksakt feilmelding ved ukjent kommando i 2G/4G-versjonen («Unknown Message!» er fra TC202)
- [ ] Om `START` under en aktiv `STARThhmm` sletter forhåndsprogrammeringen (antatt: nei)
- [ ] Nummerformat i `ACCLIM` (nasjonalt, med landkode uten +, eller E.164 med +)
- [ ] Om `LOTEMP` og `HITEMP` kan stå i samme SMS (appen sender dem alltid hver for seg)

## Kilder

- Eberspächer Sverige: Bruksanvisning EasyStart GSM TC202 Rev2 (eberspaecher.com/fileadmin/data/countrysites/EB_Schweden/Bruksvisning_EasyStart_GSM_TC202_Rev2.pdf)
- Eberspächer AB Norge via marineshop.no: EasyStart GSM CAN 2G/4G Bruksanvisning SE 2023 V1 og Monteringsanvisning 2022 V4
- Eberspächer Sverige: Komfortguide EasyStart (START/STOP/START0830-eksempler)
- Dravia.no: Monteringsanvisning EasyStart GSM CAN 2G/4G (NO-artikkelnr.)
- App Store: EasyStart GSM (id476315065) – funksjonsliste og brukeranmeldelser
- Hastadklev.no: produktside (Google Play-app midlertidig fjernet, SMS kan sendes manuelt)
- Butler Technik: EasyStart Call Operating Instructions (sekundær profil)
