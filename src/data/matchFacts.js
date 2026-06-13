// WK 2026 – Wedstrijdfeiten per groepswedstrijd
// Categorieën: 🏆 WK-historie | 🤝 Onderling | 🏟️ Stadion/stad | ⚽ Spelers | 🌍 Land

const MATCH_FACTS = {
  // ─── GROEP A ──────────────────────────────────────────────────────────────
  A1: "🤝 Mexico en Zuid-Afrika troffen elkaar exact in de openingswedstrijd van WK 2010 — ook een 1-1. Zuid-Afrika werd desondanks het eerste gastland ooit dat in de groepsfase werd uitgeschakeld.",
  A2: "⚽ Tsjechisch voetbal produceerde de meest gekopieerde penalty-techniek aller tijden: Antonín Panenka chippte de bal in 1976 rustig door het midden. De 'Panenka' is sindsdien vernoemd naar hem — van Zidane tot Pirlo deed het hem na.",
  A3: "🏆 Tsjechoslowakije bereikte tweemaal de WK-finale (1934, 1962) maar verloor beide keren. Na de opsplitsing in 1993 kwamen zowel Tsjechië als Slowakije meerdere keren op WK's — maar alleen Tsjechië stond er dit keer.",
  A4: "🏆 Mexico bereikte van 1994 tot 2018 élk WK de achtste finale — maar nooit verder. Dit beruchte patroon staat bekend als het 'Quinto partido'-syndroom: de vijfde wedstrijd die nooit komt.",
  A5: "⚽ Mexico's doelman Jorge Campos speelde begin jaren '90 soms ook als aanvaller en scoorde 35 officiële goals voor club en land. Hij ontwierp zijn eigen felle keeperskleding — een unicum in de voetbalgeschiedenis.",
  A6: "🌍 Zuid-Afrika's haven van Durban is de drukste containerhaven van Afrika. Zuid-Korea's haven van Busan is de zesde drukste ter wereld. Twee landen met een sterke maritieme economie — ver van huis, maar dicht bij de oceaan.",

  // ─── GROEP B ──────────────────────────────────────────────────────────────
  B1: "🏟️ Vancouver, speelstad van dit duel, is de grootste zeehaven van Canada en verwerkt jaarlijks ruim 3,4 miljoen containers. De vaarroute van hier naar Rotterdam beslaat meer dan 8.500 zeemijl — genoeg voor iedere havenliefhebber om trots op te zijn.",
  B2: "🏆 Qatar was op WK 2022 het eerste gastland ooit dat uitgeschakeld werd in de groepsfase zonder een enkel punt. Ze gaven meer uit aan WK-infrastructuur (>€200 miljard) dan alle voorgaande WK's bij elkaar — en verloren toch alle drie wedstrijden.",
  B3: "🌍 Meer dan 300.000 Bosniërs wonen in Zwitserland — een van de grootste Bosnische diasporagemeenschappen ter wereld. In de Zwitserse WK-selectie spelen dan ook regelmatig spelers met een Bosnische achtergrond — die dan liever voor Bosnië spelen.",
  B4: "⚽ Alphonso Davies vluchtte als kind met zijn familie uit een vluchtelingenkamp in Ghana naar Canada. Hij groeide op in Edmonton en speelt nu voor Bayern München. In 2022 was hij de bepalende speler bij Canada's eerste WK-kwalificatie in 36 jaar.",
  B5: "🏆 Zwitserland heeft een opmerkelijk patroon: ze overleven nagenoeg altijd de groepsfase maar worden dan uitgeschakeld — elfmaal in de achtste finale. Meer dan welk ander land ter wereld.",
  B6: "🏆 Bosnië-Herzegovina debuteerde op WK 2014. Ze verloren hun eerste wedstrijd van Argentinië, maar wonnen wél van Iran. Tot op heden staat er precies één WK-overwinning op hun naam — van hetzelfde Iran.",

  // ─── GROEP C ──────────────────────────────────────────────────────────────
  C1: "🏆 Marokko bereikte op WK 2022 als eerste Afrikaans land de halve finales. Opmerkelijk detail: ze slikten het hele toernooi in reguliere speeltijd slechts één tegentreffer — en dat was een eigen doelpunt. Geen enkele tegenstander scoorde in 90 minuten op hen.",
  C2: "🏆 Haïti debuteerde op WK 1974 als eerste Caribisch eilandland. Aanvaller Emmanuel Sanon doorbrak daarbij de 1.142 minuten durende serie van de Duitse keeper Sepp Maier zonder tegentreffer — tot op heden een record in WK-openingswedstrijden.",
  C3: "🏆 Schotland miste de WK-kwartfinale van 1978 door slechts één doelpunt. Ze wonnen van Zaïre met 3-2, maar hadden minstens 4 goals nodig voor doelsaldo. Daarna volgde een afwezigheid van 28 jaar. Dit WK is hun terugkeer.",
  C4: "🌍 Haïti is het armste land van het westelijk halfrond — maar één van de sterkste voetbalculturen van de Caraïben. Een groot deel van de WK 1974-selectie was actief als arts, advocaat of ingenieur. Amateurs die een profploeg kloppen.",
  C5: "🤝 Schotland en Brazilië troffen elkaar op WK 1998. Craig Burley scoorde voor Schotland, maar een eigen doelpunt van Tom Boyd bezorgde Brazilië de winst. Het was Schotlands laatste WK-wedstrijd voor 28 jaar.",
  C6: "🤝 Marokko versloeg op WK 2022 niet alleen Spanje en Portugal, maar ook België — drie Europese toplanden in één toernooi. Haïti's sterkste voetbalperiode was halverwege de 20e eeuw, toen ze twee keer de finale van de CONCACAF Championship bereikten.",

  // ─── GROEP D ──────────────────────────────────────────────────────────────
  D1: "🏟️ Houston, speelstad voor meerdere WK 2026-duels, is de grootste zeehaven van de VS gemeten naar lading: meer dan 200 miljoen ton per jaar. De Texaanse oliestad verbindt Noord-Amerika via de Golf van Mexico met de wereldzeeën.",
  D2: "⚽ Turkije's Hakan Şükür scoorde op WK 2002 het snelste goal in WK-geschiedenis: na slechts 11 seconden in de troostfinale tegen Zuid-Korea. Het record staat tot op heden en wordt zelden zelfs maar aangevochten.",
  D3: "🤝 Turkije en Paraguay troffen elkaar op WK 2002 in de kwartfinale — en leverden daarna een massale vechtpartij op het veld. Meerdere spelers en coaches werden uitgesteld. Turkije won uiteindelijk en bereikte de halve finale.",
  D4: "🏆 Australië bereikte in 2006 voor het eerst de achtste finale. Tim Cahill scoorde twee snelle goals tegen Japan na een moeilijke eerste helft. De VS klopten in 2002 de toenmalige wereldkampioen Portugal — onderweg naar hun eigen kwartfinale.",
  D5: "🌍 Australië heet officieel 'the Socceroos' — een samentrekking van 'soccer' en 'kangaroos'. De naam bestaat al sinds de jaren 60. Turkije's nationale ploeg heet de 'Ay-Yıldızlılar' — de Ster-en-Maan-dragers, verwijzend naar de nationale vlag.",
  D6: "⚽ Paraguay's keeper Justo Villar stopte op WK 2010 drie penalty's in één kwartfinale-strafschoppenserie — op zijn 33ste. Het record voor meeste gestopte penalty's in één WK-shoot-out door een keeper. Paraguay verloor de halve finale van Spanje.",

  // ─── GROEP E ──────────────────────────────────────────────────────────────
  E1: "🏟️ Curaçao was jarenlang thuisland van Shell's grootste olieraffinaderij buiten Nederland. De haven van Willemstad — ook UNESCO-werelderfgoed — is één van de diepste natuurlijke havens van het Caraïbisch gebied. Het eiland telt 155.000 inwoners: vergelijkbaar met Rotterdam-Noord.",
  E2: "⚽ Ecuador's thuisstadion in Quito ligt op 2.850 meter hoogte. Tegenstanders presteren er statistisch 8% slechter dan op zeeniveau. Buiten Quito speelt Ecuador op normaal niveau — maar niemand vergeet die eerste uitwedstrijd.",
  E3: "🤝 Duitsland en Ivoorkust speelden op WK 2006 in dezelfde groep: 3-0 voor Duitsland. Drie jaar later won Ivoorkust in een oefenwedstrijd met 5-2 — het moment waarop velen besloten dat de gouden generatie rondom Didier Drogba en Yaya Touré eindelijk volwassen was.",
  E4: "🌍 Curaçao maakt deel uit van het Koninkrijk der Nederlanden maar speelt onder zijn eigen FIFA-lidmaatschap. Mede daardoor groeide het eiland uit tot een exporteur van voetbaltalent: spelers als Leandro Bacuna, Cuco Martina en Riechedly Bazoer kozen allemaal voor de blauw-gele kleuren.",
  E5: "🏆 Ecuador debuteerde op WK 2002 en eindigde boven Italië in hun groep — een van de grotere verrassingen van dat toernooi. Duitsland heeft het hoogste totale aantal WK-doelpunten ooit gescoord (meer dan 220), maar Ecuador scoorde zijn doelpunten met een hogere doelpunten-per-inwoner ratio.",
  E6: "🌍 Ivoorkust had op WK 2006 de driehoek Drogba–Yaya Touré–Kolo Touré tegelijk in de ploeg. Curaçao is met 155.000 inwoners de kleinste deelnemer van WK 2026 — kleiner dan het WK-stadion in Mexico City dat er tegenover staat.",

  // ─── GROEP F ──────────────────────────────────────────────────────────────
  F1: "🤝 Nederland en Japan troffen elkaar op WK 2010 in de achtste finale. Nederland won met 1-0, maar Japan hield 87 minuten stand. Op WK 2022 versloeg Japan vervolgens Duitsland én Spanje in de groepsfase — twee voormalige wereldkampioenen op rij.",
  F2: "🏆 Tunesië was in 1978 het eerste Arabisch-Afrikaanse land dat een WK-groepswedstrijd won: 3-1 van Mexico. Zweden speelde op WK 2018 zonder Zlatan Ibrahimović en bereikte toch de kwartfinale. Emil Forsberg was topscorer met 3 goals en 3 assists — onopgemerkt door velen.",
  F3: "🤝 Zweden versloeg Nederland op WK 1994 in de kwartfinale met 2-1 — een zware strop. Daarna behaalde Zweden de derde plek, hun beste WK-resultaat na de finale van 1958. Nederland won sindsdien nooit meer een WK-wedstrijd tegen Zweden.",
  F4: "🤝 Tunesië en Japan speelden op WK 2002 gelijk: 2-2. Japan haalde dat jaar als eerste Aziatisch team de kwartfinale. Tunesië heeft nog nooit de WK-groepsfase overleefd — maar ze staan er dit toernooi voor de vijfde keer.",
  F5: "🏆 Japan versloeg op WK 2022 in de groepsfase Duitsland én Spanje — twee voormalige wereldkampioenen. Het zijn de enige twee opeenvolgende grote WK-upset-overwinningen in de geschiedenis van hetzelfde team in hetzelfde toernooi.",
  F6: "⚽ Virgil van Dijk is met 1,93 meter de langste aanvoerder in de WK-geschiedenis van Nederland. Tunesië speelde hun beste WK op het eigen continent in 1978 — dit toernooi in Noord-Amerika is hun eerste kans dat record te breken.",

  // ─── GROEP G ──────────────────────────────────────────────────────────────
  G1: "🏆 Egypte debuteerde in 1934 als het allereerste Afrikaanse én Arabische land op een WK-eindronde. Ze verloren van Hongarije met 4-2 maar scoorden zelf twee keer. Daarna duurde het 56 jaar voor ze weer op een WK stonden.",
  G2: "🏆 Iran versloeg de VS op WK 1998 met 2-1 — een wedstrijd die politiek zo geladen was dat ze vooraf handschoenen wisselden als vredesgebaar. Nieuw-Zeeland nam deel aan WK 1982 en verloor alle wedstrijden, maar scoorde drie keer.",
  G3: "⚽ België's 'Gouden Generatie' met Hazard, De Bruyne en Lukaku bereikte in 2018 de derde plek — hun beste WK-resultaat ooit. Ze verloren de halve finale van… Frankrijk, met 1-0 via een eigen doelpunt.",
  G4: "🌍 Nieuw-Zeeland heeft meer schapen dan inwoners (6 miljoen vs 5 miljoen). Rugby is er dominanter dan voetbal — toch versloeg de 'All Whites' in 2010 de toenmalige wereldkampioen Italië met 1-1. Rory Fallon maakte dat moment onsterfelijk.",
  G5: "🤝 Egypte en Iran zijn twee van de oudste voetballanden van Afrika en het Midden-Oosten. Iran verloor op WK 2022 van Engeland met 6-2 — hun grootste WK-verlies ooit. Het was ook de wedstrijd waarbij de Iraanse spelers het volkslied niet meezonden als protest.",
  G6: "🌍 Nieuw-Zeeland heeft de langste reistijd naar alle WK-speellocaties van alle deelnemers: gemiddeld ruim 18 uur vliegen naar Noord-Amerika. Toch gelden ze als de verrassing van de groepsfase — precies zoals in 2010 tegen Italië.",

  // ─── GROEP H ──────────────────────────────────────────────────────────────
  H1: "🌍 Kaapverdië is een eilandstaat voor de West-Afrikaanse kust en was eeuwenlang een cruciale tussenhaven op trans-Atlantische scheepvaartroutes — dezelfde routes die Nederlandse koopvaardijschepen voeren. Bijna de helft van de WK-selectie heeft een dubbele Portugese nationaliteit.",
  H2: "🏆 Uruguay won de eerste twee WK's ooit (1930, 1950). Hun 'Maracanazo' in 1950 — winst op Brazilië voor 200.000 toeschouwers — geldt als de grootste WK-stunt aller tijden. Saudi-Arabië deed 72 jaar later iets vergelijkbaars: 2-1 winst op wereldkampioen Argentinië.",
  H3: "🏆 Spanje won in 2010 het WK met slechts 8 goals — het laagste aantal ooit door een wereldkampioen. Hun tactische sleutel was balbezit: gemiddeld 65% per wedstrijd. Toch verloren ze in de groepsfase van Zwitserland — en wonnen alsnog het toernooi.",
  H4: "🌍 Uruguay heeft slechts 3,5 miljoen inwoners maar won het WK twee keer — meer dan Engeland (1), Argentinië (3 keer... nee 3), Portugal (0) en Nederland (0). Kaapverdië maakt zijn WK-debuut op dit toernooi: twee totaal verschillende voetbalgeschiedenissen in één groep.",
  H5: "🌍 Kaapverdië's eiland Sal was decennialang een internationaal luchtvaartbrandstoftussenstop — elk vliegtuig van Europa naar Zuid-Amerika tankte er bij. Nu zijn ze ook een tussenstop op het WK. Saudi-Arabië speelt hun vierde WK op rij.",
  H6: "🤝 Uruguay en Spanje zijn twee van de meest succesvolle WK-landen. In 1950 klopte Uruguay Spanje in het beslissende WK-duel. Op WK 2010 verloor Spanje in de groepsfase van Zwitserland — maar won toch het hele toernooi. Geen enkel ander land deed dat ooit.",

  // ─── GROEP I ──────────────────────────────────────────────────────────────
  I1: "🤝 Senegal versloeg bij hun WK-debuut in 2002 de toenmalige wereldkampioen Frankrijk met 1-0. Papa Bouba Diop scoorde en legde zijn shirt op het gras — de hele ploeg danste er in een cirkel omheen. Een van de meest iconische vieringen in WK-geschiedenis.",
  I2: "🏆 Noorwegen versloeg Brazilië op WK 1998 met 2-1 — een van de grootste WK-verrassingen van dat decennium. Rivaldo, Ronaldo en Roberto Carlos speelden mee. Daarna kwalificeerden Noorwegen zich 28 jaar lang niet meer voor een WK-eindronde.",
  I3: "🌍 Irak debuteerde op WK 1986 en verloor alle drie wedstrijden — maar scoorde wél, waaronder een goal tegen België. Dit toernooi keren ze terug na een lange afwezigheid. Frankrijk is de enige tegenstander met meer WK-titels (2) dan Irak WK-overwinningen (0).",
  I4: "⚽ Sadio Mané won de Afrika Cup in 2022 met Senegal — met een oogblessure, tegen medisch advies in. Erling Haaland is Noorwegens grote hoop: zijn vader Alfie Haaland speelde voor Noorwegen op WK 1998 in dezelfde wedstrijd dat ze Brazilië versloegen.",
  I5: "🤝 Noorwegen versloeg Brazilië (1998) maar haalde daarna zelf de achtste finale niet. Frankrijk won datzelfde WK. Nu, bijna 30 jaar later, staan Noorwegen en Frankrijk tegenover elkaar — de ene debutant in een halve eeuw, de andere routine-finalist.",
  I6: "🌍 Senegal bereikte op WK 2002 de kwartfinale bij hun eerste deelname ooit — de beste WK-prestatie van een debutant in de 21e eeuw. Irak staat nu voor het eerst in 40 jaar op een WK. Dit is hun allereerste ontmoeting op WK-niveau.",

  // ─── GROEP J ──────────────────────────────────────────────────────────────
  J1: "🏆 Oostenrijk bereikte op WK 1954 de halve finale — een resultaat dat inmiddels 72 jaar niet verbeterd is. Jordanië maakt zijn allereerste WK-debuut op dit toernooi: het eerste Jordaanse nationale team dat zich via de kwalificatie plaatste.",
  J2: "🏆 Algerije versloeg West-Duitsland op WK 1982 met 2-1 — een van de grootste WK-verrassingen ooit. Ze werden desondanks uitgeschakeld doordat Duitsland en Oostenrijk vervolgens met exact 1-0 speelden. Dit staat bekend als de 'Disgrace of Gijón' en veranderde de FIFA-regels voor altijd.",
  J3: "🤝 Argentinië versloeg Oostenrijk op WK 1990 met 1-0 via een controversieel eigen doelpunt. De wedstrijd werd omschreven als 'de saaiste WK-wedstrijd ooit gespeeld'. Argentinië won in 2022 het WK — hun eerste in 36 jaar, en ditmaal met iets meer stijl.",
  J4: "🌍 Jordanië telt 10 miljoen inwoners en bereikte in 2023 de finale van de AFC Asian Cup. Algerije, de 'Fennecs', staat bekend om snel aanvalsvoetbal en scoorde in hun gouden periode onder Vahid Halilhodžić meer dan 40 goals in één kwalificatiecampagne.",
  J5: "🤝 Algerije en Oostenrijk spelen in de schaduw van de 'Disgrace of Gijón' — de wedstrijd die hun landen voor altijd aan elkaar verbond. Nu, meer dan 40 jaar later, staan ze opnieuw tegenover elkaar op een WK. Algerije wil revanche. Oostenrijk wil het verleden vergeten.",
  J6: "⚽ Lionel Messi scoorde op WK 2022 zijn 13e WK-goal en won eindelijk de titel. Jordanië speelt zijn eerste WK-wedstrijd in de geschiedenis. De twee landen in schrilste contrast: de meest gedecoreerde WK-speler ooit tegenover een compleet debuterende natie.",

  // ─── GROEP K ──────────────────────────────────────────────────────────────
  K1: "🏆 DR Congo (toen Zaïre) was in 1974 het eerste sub-Saharaanse land op een WK. In de meest bizarre scène uit WK-geschiedenis rende een Zaïrese speler bij een Braziliaanse vrije trap het veld op en schoot de bal weg. Tot op vandaag is onduidelijk of het een misverstand of een tactisch bevel was.",
  K2: "🌍 Oezbekistan maakt zijn allereerste WK-debuut in 2026 — als eerste land uit Centraal-Azië op een WK-eindronde. Colombia's James Rodríguez won op WK 2014 de Gouden Schoen met 6 goals en geldt tot op heden als de beste WK-campagne van een Zuid-Amerikaans talent buiten Brazilië.",
  K3: "⚽ Oezbekistan's sterspeler Eldor Shomurodov speelt voor Roma in de Serie A. Hij is de eerste Oezbeekse speler in een Europese topcompetitie die ook zijn nationale ploeg naar een WK leidde. Portugal speelt hun eerste wedstrijd zonder Cristiano Ronaldo als vaste aanvoerder in jaren.",
  K4: "🌍 DR Congo heeft de grootste bevolking van sub-Saharaans Afrika: ruim 100 miljoen mensen — maar staat pas op hun tweede WK-eindronde. Colombia 'Los Cafeteros' heeft een van de meest loyale achterbannen van Zuid-Amerika: elke thuiswedstrijd is al decennialang uitverkocht.",
  K5: "⚽ Colombia's 2014 WK-optreden wordt beschouwd als het beste van een Zuid-Amerikaans land in jaren: James als topscorer, Cuadrado als sleutelspeler. Portugal won in 2016 het EK zonder in de knock-out fase een wedstrijd in reguliere speeltijd te winnen. Strategie verheven tot kunst.",
  K6: "🏆 DR Congo en Oezbekistan spelen allebei hun meest historische interland ooit. DR Congo speelde hun enige WK in 1974. Oezbekistan doet het voor de eerste keer. Ze zijn de enige twee landen in dit toernooi die nog nooit een WK-groepswedstrijd wonnen.",

  // ─── GROEP L ──────────────────────────────────────────────────────────────
  L1: "🤝 Kroatië versloeg Engeland in de WK-halve finale van 2018 na verlenging: 2-1. Mario Mandžukić scoorde de winnende in de 109e minuut. Het was Engeland's eerste WK-halve finale in 28 jaar — en ze verloren toch. Kroatië bereikte de finale met minder dan 4 miljoen inwoners.",
  L2: "🏆 Ghana versloeg in 2010 de VS in de achtste finale — maar een handsbal van Uruguay's Suárez hield hen in de kwartfinale buiten de halve finale. Panama scoorde op WK 2018 hun eerste WK-goal ooit bij een 6-1 verlies tegen Engeland. Heel Panama vierde het als een titel.",
  L3: "⚽ Meer dan 20 Ghanese spelers spelen in de Premier League. Ayew, Kudus, Partey — de Brits-Ghanese band is zo sterk dat de selecties regelmatig overlappen. Engeland gebruikte op WK 2018 corners als tactisch wapen: 9 directe corner-aanvallen, meer dan ooit eerder in één toernooi.",
  L4: "🌍 Panama debuteerde op WK 2018 en verloor alle wedstrijden. Maar de enige goal — bij een 6-1 verlies — werd thuis gevierd alsof het een titel was. Kroatië speelde hun vierde WK op rij in de top acht. Weinig landen presteren zo consistent met zo weinig inwoners.",
  L5: "🤝 Engeland versloeg Panama op WK 2018 met 6-1. Harry Kane scoorde een hattrick — zijn tweede van het toernooi. Panama speelt er dit keer wéér bij: een terugkeer van een ploeg die verloor maar nooit de liefde voor het spel verloor.",
  L6: "🤝 Kroatië en Ghana troffen elkaar op WK 2014 in de openingswedstrijd. Kroatië won 3-1, maar controversieel: scheidsrechter Nishimura gaf een dubieuze penalty aan Brazilië eerder op dag 1 — en Kroatisch-Ghanese ontmoetingen bleven sindsdien altijd beladen.",
};

export { MATCH_FACTS };
