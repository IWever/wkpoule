// WK 2026 – Wedstrijdfeiten per groepswedstrijd
// Categorieën: 🏆 WK-historie | 🤝 Onderling | 🏟️ Stadion/stad | ⚽ Spelers | 🌍 Land

const MATCH_FACTS = {
  // ─── GROEP A ──────────────────────────────────────────────────────────────
  A1: "🤝 Mexico en Zuid-Afrika speelden op WK 2010 al eens de openingswedstrijd — die eindigde destijds ook 1-1. Zuid-Afrika werd desondanks het eerste gastland ooit dat in de groepsfase werd uitgeschakeld.",
  A2: "⚽ Tsjechisch voetbal produceerde de meest gekopieerde penalty-techniek aller tijden: Antonín Panenka chippte de bal in 1976 rustig door het midden. De techniek staat sindsdien wereldwijd bekend als de 'Panenka' — van Zidane tot Pirlo deden het hem na.",
  A3: "🏆 Tsjechoslowakije bereikte tweemaal de WK-finale (1934, 1962) maar verloor beide keren. Na de opsplitsing in 1993 kwamen zowel Tsjechië als Slowakije meerdere keren op WK's — maar alleen Tsjechië stond er dit WK.",
  A4: "🏆 Mexico bereikte van 1994 tot 2018 elk WK de achtste finale — maar nooit verder. Dit beruchte patroon staat bekend als het 'Quinto partido'-syndroom: de vijfde wedstrijd die nooit komt.",
  A5: "⚽ De Mexicaanse doelman Jorge Campos speelde begin jaren '90 soms ook als aanvaller en scoorde tientallen officiële goals voor club en land. Hij ontwierp bovendien zijn eigen felgekleurde keeperskleding — een absoluut unicum in de voetbalgeschiedenis.",
  A6: "🌍 Durban (Zuid-Afrika) is een van de grootste containerhavens van Afrika. Busan (Zuid-Korea) staat in de mondiale top tien van drukste containerhavens. Twee landen met een sterke maritieme economie — ver van huis, maar nooit ver van de zee.",

  // ─── GROEP B ──────────────────────────────────────────────────────────────
  B1: "🏟️ Vancouver, speelstad van dit duel, is de grootste zeehaven van Canada en verwerkt jaarlijks ruim 3,4 miljoen containers. De vaarroute van hier naar Rotterdam beslaat meer dan 8.500 zeemijl — genoeg voor iedere havenliefhebber om trots op te zijn.",
  B2: "🏆 Qatar was op WK 2022 het eerste gastland ooit dat uitgeschakeld werd in de groepsfase zonder een enkel punt. Ze gaven meer uit aan WK-infrastructuur dan alle voorgaande WK's bij elkaar — en verloren toch alle drie wedstrijden.",
  B3: "🌍 Meer dan 300.000 Bosniërs wonen in Zwitserland — een van de grootste Bosnische diasporagemeenschappen ter wereld. Veel jonge Zwitserse spelers hebben Bosnische roots; soms moeten beide landen strijden om dezelfde talenten.",
  B4: "⚽ Alphonso Davies werd geboren in een vluchtelingenkamp in Ghana en groeide op in Edmonton, Canada. Hij speelt nu voor Bayern München en was de bepalende speler bij Canada's eerste WK-kwalificatie in 36 jaar, in 2022.",
  B5: "🏆 Zwitserland heeft een opmerkelijk patroon: ze overleven nagenoeg altijd de groepsfase maar worden dan uitgeschakeld — vaker dan welk ander land in de achtste finale. Een kwartfinale bereiken? Dat lukt maar niet.",
  B6: "🏆 Bosnië-Herzegovina debuteerde op WK 2014. Ze verloren hun eerste wedstrijd tegen Argentinië, maar wonnen wél van Iran. Tot op heden staat er precies één WK-overwinning op hun naam — van datzelfde Iran.",

  // ─── GROEP C ──────────────────────────────────────────────────────────────
  C1: "🏆 Marokko bereikte op WK 2022 als eerste Afrikaans land de halve finale. Opmerkelijk detail: ze slikten het hele toernooi in reguliere speeltijd slechts één tegentreffer — en dat was een eigen doelpunt. Geen enkele tegenstander scoorde in 90 minuten op hen.",
  C2: "🏆 Haïti debuteerde op WK 1974 als eerste Caribisch eilandland. Aanvaller Emmanuel Sanon doorbrak daarbij de lange ongeslagen serie van Duits keeper Sepp Maier — tot op heden een van de meest memorabele WK-momenten voor een kleine natie.",
  C3: "🏆 Schotland miste de WK-kwartfinale van 1978 door slechts één doelpunt. Ze wonnen van Zaïre met 3-2, maar hadden minstens 4 goals nodig voor doelsaldo. Na WK 1998 volgde een afwezigheid van 28 jaar. Dit WK is hun terugkeer.",
  C4: "🌍 Haïti is het armste land van het westelijk halfrond — maar heeft één van de sterkste voetbalculturen van de Caraïben. Een groot deel van de WK 1974-selectie was actief als arts, advocaat of ingenieur. Amateurs die een profploeg kloppen.",
  C5: "🤝 Schotland en Brazilië troffen elkaar op WK 1998. Brazilië won met 2-1: César Sampaio scoorde, Tom Boyd maakte een eigen doelpunt en Craig Burley deed iets terug. Het bleef Schotlands laatste WK-wedstrijd voor 28 jaar.",
  C6: "🤝 Marokko versloeg op WK 2022 niet alleen Spanje en Portugal, maar ook België in de groepsfase — drie Europese toplanden in één toernooi. Haïti's sterkste voetbalperiode was halverwege de 20e eeuw, toen ze tweemaal de finale van de CONCACAF Championship bereikten.",

  // ─── GROEP D ──────────────────────────────────────────────────────────────
  D1: "🏟️ Houston, speelstad voor meerdere WK 2026-duels, is de grootste zeehaven van de VS gemeten naar lading: meer dan 200 miljoen ton per jaar. De Texaanse oliestad verbindt Noord-Amerika via de Golf van Mexico met de wereldzeeën.",
  D2: "⚽ Hakan Şükür scoorde op WK 2002 het snelste doelpunt in WK-geschiedenis: na slechts 11 seconden in de troostfinale tegen Zuid-Korea. Het record staat tot op heden en wordt zelden ook maar aangevochten.",
  D3: "🏆 Turkije bereikte op WK 2002 als grote verrassing de halve finale — hun beste WK-resultaat ooit. Paraguay stond bij datzelfde toernooi in de kwartfinale. Het is hun allereerste WK-ontmoeting ooit.",
  D4: "🏆 Australië bereikte in 2006 voor het eerst de achtste finale. Tim Cahill scoorde twee snelle goals tegen Japan na een moeizame eerste helft. De VS klopten in 2002 Portugal verrassend met 3-2 in de groepsfase — een van de grootste resultaten in de geschiedenis van het Amerikaanse voetbal.",
  D5: "🌍 Australië heet officieel 'the Socceroos' — een samentrekking van 'soccer' en 'kangaroos'. De naam bestaat al sinds de jaren 60. Het Turkse nationale elftal heet de 'Ay-Yıldızlılar' — de Ster-en-Maan-dragers, verwijzend naar de nationale vlag.",
  D6: "⚽ Paraguay's keeper Justo Villar stopte op WK 2010 drie penalty's in de achtste finale-strafschoppenserie tegen Japan — op zijn 33ste. Paraguay verloor vervolgens de kwartfinale van Spanje met 0-1.",

  // ─── GROEP E ──────────────────────────────────────────────────────────────
  E1: "🏟️ Curaçao was jarenlang thuisland van Shell's grootste olieraffinaderij buiten Nederland. De haven van Willemstad — ook UNESCO-werelderfgoed — is één van de diepste natuurlijke havens van het Caraïbisch gebied. Het eiland telt 155.000 inwoners: vergelijkbaar met Rotterdam-Noord.",
  E2: "⚽ Ecuador's thuisstadion in Quito ligt op 2.850 meter hoogte. Tegenstanders presteren er statistisch meetbaar slechter dan op zeeniveau. Buiten Quito speelt Ecuador op normaal niveau — maar niemand vergeet die eerste uitwedstrijd.",
  E3: "🤝 Duitsland en Ivoorkust zaten op WK 2006 in dezelfde groep als Argentinië en Nederland — een van de zwaarste poules ooit. Duitsland versloeg Ivoorkust met 3-0. Het duel Argentinië–Ivoorkust in diezelfde groep werd achteraf door velen verkozen tot mooiste wedstrijd van het toernooi.",
  E4: "🌍 Curaçao maakt deel uit van het Koninkrijk der Nederlanden maar speelt onder zijn eigen FIFA-lidmaatschap. Mede daardoor groeide het eiland uit tot een exporteur van voetbaltalent: spelers als Leandro Bacuna, Cuco Martina en Riechedly Bazoer kozen voor de blauw-gele kleuren.",
  E5: "🏆 Ecuador debuteerde op WK 2002 en eindigde in dezelfde poule als Italië — de toenmalige titelverdediger. Duitsland heeft het hoogste totale aantal WK-doelpunten ooit gescoord (meer dan 220), maar Ecuador maakte indruk door in hun eerste WK meteen de groepsfase te overleven.",
  E6: "🌍 Ivoorkust had op WK 2006 de driehoek Drogba–Yaya Touré–Kolo Touré tegelijk in de ploeg. Curaçao is met 155.000 inwoners de kleinste deelnemer van WK 2026 — ongeveer even groot als de gemeente Dordrecht.",

  // ─── GROEP F ──────────────────────────────────────────────────────────────
  F1: "🤝 Nederland en Japan troffen elkaar op WK 2010 in de achtste finale. Nederland won met 1-0, maar Japan hield 87 minuten stand. Op WK 2022 versloeg Japan vervolgens Duitsland én Spanje in de groepsfase — twee voormalige wereldkampioenen op rij.",
  F2: "🏆 Tunesië was in 1978 het eerste Afrikaanse land dat een WK-groepswedstrijd won: 3-1 van Mexico. Zweden speelde op WK 2018 zonder Zlatan Ibrahimović en bereikte toch de kwartfinale. Emil Forsberg was uitblinker met 3 goals en 3 assists — onopgemerkt door velen.",
  F3: "🏆 Nederland bereikte in 1974 de WK-finale maar verloor van West-Duitsland. Bijzonder detail: Nederland scoorde al een penalty voordat een Duitser de bal had aangeraakt. Zweden bereikte in 1958 de finale — op eigen bodem — en verloor van Brazilië bij Pelé's WK-debuut op zijn 17e.",
  F4: "🤝 Japan versloeg Tunesië op WK 2002 met 2-0 en bereikte datzelfde jaar als eerste Aziatisch team de WK-kwartfinale. Tunesië heeft tot op heden de WK-groepsfase nog nooit overleefd — maar staat er dit toernooi voor de vijfde keer.",
  F5: "🏆 Japan versloeg op WK 2022 in de groepsfase Duitsland én Spanje — twee voormalige wereldkampioenen. Het zijn de enige twee opeenvolgende grote WK-upset-overwinningen door hetzelfde team in hetzelfde toernooi in de moderne WK-geschiedenis.",
  F6: "⚽ Virgil van Dijk is met 1,93 meter een van de langste aanvoerders in de recente WK-geschiedenis van Nederland. Tunesië speelde hun beste WK op het eigen continent in 1978 — dit toernooi in Noord-Amerika is hun eerste kans dat te verbeteren.",

  // ─── GROEP G ──────────────────────────────────────────────────────────────
  G1: "🏆 Egypte debuteerde in 1934 als het allereerste Afrikaanse én Arabische land op een WK-eindronde. Ze verloren van Hongarije met 4-2 maar scoorden zelf twee keer. Daarna duurde het 56 jaar voor ze weer op een WK stonden.",
  G2: "🏆 Iran versloeg de VS op WK 1998 met 2-1 — een wedstrijd die politiek zo geladen was dat ze vooraf bloemen wisselden als vredesgebaar. Nieuw-Zeeland nam deel aan WK 1982 en verloor alle wedstrijden, maar scoorde drie keer — een moedige prestatie voor een debutant.",
  G3: "⚽ België's 'Gouden Generatie' met Hazard, De Bruyne en Lukaku bereikte in 2018 de derde plek — hun beste WK-resultaat ooit. Ze verloren de halve finale van Frankrijk met 0-1: Samuel Umtiti kopte de enige goal in de 51e minuut, in een wedstrijd die België tot dan toe domineerde.",
  G4: "🌍 Nieuw-Zeeland heeft meer schapen dan inwoners (ongeveer 6 miljoen vs 5 miljoen). Rugby is er dominanter dan voetbal — toch speelde de 'All Whites' in 2010 gelijk tegen toenmalig wereldkampioen Italië (1-1). Rory Fallon maakte dat moment onsterfelijk.",
  G5: "🤝 Egypte en Iran zijn twee van de oudste voetballanden van Afrika en het Midden-Oosten. Iran verloor op WK 2022 van Engeland met 6-2. Het was ook de wedstrijd waarbij de Iraanse spelers het volkslied niet meezongen als protest — een van de meest geladen WK-momenten van dat jaar.",
  G6: "🌍 Nieuw-Zeeland heeft de langste reistijd naar alle WK-speellocaties van alle deelnemers: gemiddeld ruim 18 uur vliegen naar Noord-Amerika. Toch gelden ze als de verrassing van de groepsfase — precies zoals in 2010 tegen Italië.",

  // ─── GROEP H ──────────────────────────────────────────────────────────────
  H1: "🌍 Kaapverdië is een eilandstaat voor de West-Afrikaanse kust en was eeuwenlang een cruciale tussenhaven op trans-Atlantische scheepvaartroutes — dezelfde routes die Nederlandse koopvaardijschepen voeren. Bijna de helft van de WK-selectie heeft een dubbele Portugese nationaliteit.",
  H2: "🏆 Uruguay won de eerste twee WK's ooit (1930, 1950). Hun 'Maracanazo' in 1950 — winst op Brazilië voor ruim 200.000 toeschouwers — geldt als de grootste WK-stunt aller tijden. Saudi-Arabië deed 72 jaar later iets vergelijkbaars: 2-1 winst op regerend wereldkampioen Argentinië.",
  H3: "🏆 Spanje won in 2010 het WK met slechts 8 gescoorde doelpunten — het laagste aantal ooit door een wereldkampioen. Hun tactische sleutel was balbezit: gemiddeld 65% per wedstrijd. Toch verloren ze in de groepsfase van Zwitserland — en wonnen alsnog het hele toernooi.",
  H4: "🌍 Uruguay heeft slechts 3,5 miljoen inwoners maar won het WK twee keer — méér dan Engeland (1), Portugal (0) en Nederland (0). Kaapverdië maakt zijn WK-debuut op dit toernooi: twee totaal verschillende voetbalgeschiedenissen in één groep.",
  H5: "🌍 Kaapverdië's eiland Sal was decennialang een internationale tankstop voor trans-Atlantische vluchten — elk vliegtuig van Europa naar Zuid-Amerika tankte er bij. Nu zijn ze ook een tussenstop op het WK. Saudi-Arabië doet voor de zesde keer mee aan een WK.",
  H6: "🤝 Uruguay en Spanje zijn twee van de meest succesvolle WK-landen. In 1950 versloeg Uruguay Spanje met 6-1 in de finaleronde. Op WK 2010 verloor Spanje in de groepsfase van Zwitserland — maar won toch het hele toernooi. Geen enkel ander land deed dat ooit.",

  // ─── GROEP I ──────────────────────────────────────────────────────────────
  I1: "🤝 Senegal versloeg bij hun WK-debuut in 2002 de toenmalige wereldkampioen Frankrijk met 1-0. Papa Bouba Diop scoorde en legde zijn shirt op het gras — de hele ploeg danste er in een cirkel omheen. Een van de meest iconische vieringen in WK-geschiedenis.",
  I2: "🏆 Noorwegen versloeg Brazilië op WK 1998 met 2-1 — een van de grootste WK-verrassingen van dat decennium. Rivaldo, Ronaldo en Roberto Carlos speelden mee. Daarna kwalificeerde Noorwegen zich 28 jaar lang niet meer voor een WK-eindronde.",
  I3: "🌍 Irak debuteerde op WK 1986 en verloor alle drie wedstrijden — maar scoorde wél, waaronder een goal tegen België. Dit toernooi keren ze terug na een lange afwezigheid. Frankrijk is de enige tegenstander met meer WK-titels (2) dan Irak WK-overwinningen (0).",
  I4: "⚽ Sadio Mané won de Afrika Cup in januari 2022 met Senegal — met een oogblessure, tegen medisch advies in. Erling Haaland is Noorwegens grote hoop: zijn vader Alf-Inge Haaland speelde voor Noorwegen op WK 1998 — het toernooi waarin ze Brazilië versloegen.",
  I5: "🤝 Noorwegen versloeg Brazilië op WK 1998 maar werd in de achtste finale uitgeschakeld door Italië. Frankrijk won datzelfde WK. Nu, 28 jaar later, staan Noorwegen en Frankrijk tegenover elkaar — een rentree van een ploeg die zo lang heeft gewacht.",
  I6: "🌍 Senegal bereikte op WK 2002 de kwartfinale bij hun eerste deelname ooit — de beste WK-prestatie van een debutant in de 21e eeuw. Irak staat nu voor het eerst in 40 jaar op een WK. Dit is hun allereerste ontmoeting op WK-niveau.",

  // ─── GROEP J ──────────────────────────────────────────────────────────────
  J1: "🏆 Oostenrijk bereikte op WK 1954 de halve finale — een resultaat dat inmiddels 72 jaar niet verbeterd is. Jordanië maakt zijn allereerste WK-debuut op dit toernooi, als een van de jongste voetbalnaties ooit op een WK-eindronde.",
  J2: "🏆 Algerije versloeg West-Duitsland op WK 1982 met 2-1 — een van de grootste WK-verrassingen ooit. Ze werden desondanks uitgeschakeld doordat Duitsland en Oostenrijk vervolgens precies 1-0 speelden. Dit staat bekend als de 'Disgrace of Gijón' en veranderde de FIFA-regels voor altijd.",
  J3: "🤝 Argentinië en Oostenrijk troffen elkaar op WK 1990. De wedstrijd werd door velen omschreven als bijzonder moeizaam om te bekijken — een van de saaiste in WK-geschiedenis. Argentinië won uiteindelijk met 1-0 en bereikte de finale, die ze verloren van Duitsland.",
  J4: "🌍 Jordanië telt 10 miljoen inwoners en bereikte in 2023 de finale van de AFC Asian Cup. Algerije, de 'Fennecs', staat bekend om snel aanvalsvoetbal en scoorde in hun gouden periode onder Halilhodžić meer dan 40 goals in één kwalificatiecampagne.",
  J5: "🤝 In 1982 werd Algerije het grootste slachtoffer in de WK-geschiedenis: na een overwinning op West-Duitsland werden ze toch uitgeschakeld doordat Duitsland en Oostenrijk een resultaat speelden dat hen beiden liet doorstromen — de 'Disgrace of Gijón'. Nu treffen Algerije en Oostenrijk elkaar direct.",
  J6: "⚽ Lionel Messi werd op WK 2022 eindelijk wereldkampioen en scoorde 7 doelpunten — zijn meest productieve WK ooit. Jordanië speelt zijn allereerste WK-wedstrijd in de geschiedenis. De scherpste tegenstelling van dit toernooi: de meest gedecoreerde WK-speler ooit tegenover een compleet debuterende natie.",

  // ─── GROEP K ──────────────────────────────────────────────────────────────
  K1: "🏆 DR Congo (toen Zaïre) was in 1974 het eerste sub-Saharaanse land op een WK. In de meest bizarre scène uit WK-geschiedenis rende een Zaïrese speler bij een Braziliaanse vrije trap het veld op en schoot de bal weg. Tot op vandaag is onduidelijk of het een misverstand of een tactisch bevel was.",
  K2: "🌍 Oezbekistan maakt zijn allereerste WK-debuut in 2026 — als eerste land uit Centraal-Azië op een WK-eindronde. Colombia's James Rodríguez won op WK 2014 de Gouden Schoen met 6 goals en geldt als een van de meest memorabele individuele WK-optredens ooit.",
  K3: "⚽ Eldor Shomurodov is Oezbekistans sterspeler en speelt in de Italiaanse Serie A. Hij is de meest prominente Oezbeekse voetballer ooit in een Europese topcompetitie. Portugal kijkt dit WK uit naar een nieuwe generatie die zich zonder vaste ster moet bewijzen.",
  K4: "🌍 DR Congo heeft de grootste bevolking van sub-Saharaans Afrika: ruim 100 miljoen mensen — maar staat pas op hun tweede WK-eindronde. Colombia 'Los Cafeteros' heeft een van de meest loyale achterbannen van Zuid-Amerika: elke thuiswedstrijd is al decennialang uitverkocht.",
  K5: "⚽ Colombia's 2014 WK-optreden wordt beschouwd als het beste van een Zuid-Amerikaans land in jaren: James als topscorer, Cuadrado als sleutelspeler. Portugal won in 2016 het EK als outsider — in de finale scoorde invaller Eder in de 109e minuut de winnende goal tegen thuisland Frankrijk.",
  K6: "🏆 DR Congo en Oezbekistan spelen allebei hun meest historische interland ooit. DR Congo speelde hun enige WK in 1974. Oezbekistan doet het voor de eerste keer. Ze zijn de enige twee landen in dit toernooi die nog nooit een WK-groepswedstrijd wonnen.",

  // ─── GROEP L ──────────────────────────────────────────────────────────────
  L1: "🤝 Kroatië versloeg Engeland in de WK-halve finale van 2018 na verlenging: 2-1. Mario Mandžukić scoorde de winnende in de 109e minuut. Het was Engelands eerste WK-halve finale in 28 jaar — en ze verloren toch. Kroatië bereikte de finale met minder dan 4 miljoen inwoners.",
  L2: "🏆 Ghana versloeg in 2010 de VS in de achtste finale — maar een handsbal van Uruguay's Suárez op de doellijn hield hen in de kwartfinale buiten de halve finale. Panama scoorde op WK 2018 hun eerste WK-goal ooit, bij een 6-1 verlies tegen Engeland. Heel Panama vierde het als een titel.",
  L3: "⚽ Meerdere Ghanese spelers zijn actief in de Premier League — van Mohammed Kudus tot Thomas Partey. De Brits-Ghanese voetbalband is zo sterk dat beide landen regelmatig strijden om dezelfde talenten. Engeland gebruikte op WK 2018 corners als tactisch wapen — vaker dan ooit eerder in één toernooi.",
  L4: "🌍 Panama debuteerde op WK 2018 en verloor alle wedstrijden. Maar de enige goal — bij een 6-1 verlies — werd thuis gevierd alsof het een titel was. Kroatië speelde hun vierde WK op rij in de top acht. Weinig landen presteren zo consistent met zo weinig inwoners.",
  L5: "🤝 Engeland versloeg Panama op WK 2018 met 6-1. Harry Kane scoorde een hattrick en stond na twee groepswedstrijden al op vijf toernooigoals. Panama speelt er dit keer wéér bij: een terugkeer van een ploeg die verloor maar nooit de liefde voor het spel verloor.",
  L6: "🌍 Kroatië behaalde in 1998, 2018 én 2022 een WK-podiumplaats — driemaal in zeven deelnames, een uitzonderlijk record voor een land met minder dan 4 miljoen inwoners. Ghana bereikte in 2010 de kwartfinale als enige Afrikaans land dat jaar — op één handsbal van een halve finale na.",
};

export { MATCH_FACTS };
