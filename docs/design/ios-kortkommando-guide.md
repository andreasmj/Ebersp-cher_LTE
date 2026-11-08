# iPhone: faste dager uten trykk med Kortkommandoer

iOS lar ingen app sende SMS på egen hånd. Appen Kortkommandoer (Shortcuts) kan derimot sende
en melding fra en personlig automasjon med utløser «Tidspunkt» når «Kjør umiddelbart» er valgt
(iOS 17 og nyere; enkelte brukere rapporterer at iOS likevel spør, derfor er Påminnelse alltid
aktiv som fallback). Varmestart genererer oppskriften under for hver plan, med riktige dager,
klokkeslett og tekst, og viser den med kopier-knapper på plan-siden («Automatiser på iPhone»).

## Regelen appen bruker

Planen «Jobb», man–fre, avreise 07:00, forvarming 30 min gir starttid 06:30 og kommandoen
`START0630`. Siden SMS-en skal sendes **kvelden før**, forskyves dagene én dag bakover:

| Plan-dag (avreise) | Automasjonsdag (sending kl. 21:00) |
|---|---|
| Mandag | Søndag |
| Tirsdag | Mandag |
| Onsdag | Tirsdag |
| Torsdag | Onsdag |
| Fredag | Torsdag |

`automasjonsdager = plandager forskjøvet −1` (søndag → lørdag). Velger brukeren «Ved starttid»
i stedet, brukes plandagene uendret, klokkeslettet er starttiden og teksten er `START`.

## Oppskriften appen viser (eksempel)

1. Åpne **Kortkommandoer** → **Automatisering** → **+** → **Tidspunkt**.
2. Tid: **21:00**. Gjenta: **Ukentlig**, dager: **søn, man, tir, ons, tor**.
3. Velg **Kjør umiddelbart** (ikke «Spør før kjøring»). Trykk **Neste**.
4. Legg til handlingen **Send melding**.
   - Melding: `START0630` (kopier-knapp)
   - Mottaker: `+47 912 34 567` (kopier-knapp)
   - Trykk pilen på handlingen og slå av **Vis når den kjøres**.
5. Trykk **Ferdig**. Test ved å trykke på automasjonen og velge **Kjør**.

Én automasjon per unikt (dager, klokkeslett, tekst). Endrer brukeren planen i appen, viser appen
en gul linje «Automasjonen på iPhone må oppdateres» med ny oppskrift.

Når planen er merket «Sendes av Kortkommandoer», er automasjonen eneste sender: appen planlegger
ingen påminnelse for planen, registrerer forekomsten som «sendt av automasjon (ubekreftet)» ved
automasjonstidspunktet, og viser «Kortkommandoer» på planen. Brukeren kan slå på påminnelse i
tillegg for en plan hvis iOS-versjonen viser seg å spørre før kjøring.

## Hopp over og pause

Automasjonen vet ikke om «Hopp over neste» (lagret som en liste med datoer som kan angres). Appen løser det slik: når brukeren hopper over, viser
appen en bekreftelse («Hopp over mandag? Kortkommandoer sender START0630 kl. 21:00 uansett. Appen
minner deg kl. 21:05 om å sende STOP»), og kl. 21:05 samme kveld en påminnelse med «Send STOP»
(ett trykk) som sletter den forhåndsprogrammerte starten i modulen. Ingen SMS sendes før
påminnelsen. Ved «Pause til dato» ber appen brukeren slå av automasjonen i Kortkommandoer (lenke
`shortcuts://`) og minner om å slå den på igjen.

Oppskriften bruker nøyaktig samme sendetid-regel som planleggingsmotoren (kveldstid = siste
HH:MM før starttid, aldri mer enn 23 t 30 min før). En plan med starttid 21:00 får derfor
automasjonstid 21:30 dagen før, ikke 21:00 (som ville vært 24 timer før).

## Fase 2: svar fra modulen rett i appen (iOS)

Kortkommandoer har også utløseren **Melding** («Når jeg mottar en melding fra +47 912 34 567»).
Med `expo-app-intents` kan Varmestart tilby handlingen «Registrer svar i Varmestart» som tar
meldingsteksten som parameter og kjører uten å åpne appen. Da får iOS-brukere status, temperatur
og bekreftelser i appen på samme måte som Android Pro. Krever iOS 16.4+ og én automasjon.
