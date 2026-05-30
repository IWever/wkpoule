// ─── WK 2026 DATA (officieel, 48 landen / 12 groepen) ───────────────────────
const GROUPS = {
  A: ["Mexico", "Zuid-Afrika", "Zuid-Korea", "Tsjechië"],
  B: ["Canada", "Bosnië-Herzegovina", "Qatar", "Zwitserland"],
  C: ["Brazilië", "Marokko", "Haïti", "Schotland"],
  D: ["VS", "Paraguay", "Australië", "Turkije"],
  E: ["Duitsland", "Curaçao", "Ivoorkust", "Ecuador"],
  F: ["Nederland", "Japan", "Zweden", "Tunesië"],
  G: ["België", "Egypte", "Iran", "Nieuw-Zeeland"],
  H: ["Spanje", "Kaapverdië", "Saudi-Arabië", "Uruguay"],
  I: ["Frankrijk", "Senegal", "Irak", "Noorwegen"],
  J: ["Argentinië", "Algerije", "Oostenrijk", "Jordanië"],
  K: ["Portugal", "DR Congo", "Oezbekistan", "Colombia"],
  L: ["Engeland", "Kroatië", "Ghana", "Panama"],
};
const ALL_TEAMS = Object.values(GROUPS).flat();

// Speelschema WK 2026 — tijden in Nederlandse tijd (CEST = UTC+2)
const GROUP_MATCHES = [
  // ─ Groep A
  { id:"A1", group:"A", home:"Mexico",      away:"Zuid-Afrika",  dt:"2026-06-11T21:00", round:1 },
  { id:"A2", group:"A", home:"Zuid-Korea",  away:"Tsjechië",     dt:"2026-06-12T04:00", round:1 },
  { id:"A3", group:"A", home:"Tsjechië",    away:"Zuid-Afrika",  dt:"2026-06-18T18:00", round:2 },
  { id:"A4", group:"A", home:"Mexico",      away:"Zuid-Korea",   dt:"2026-06-19T03:00", round:2 },
  { id:"A5", group:"A", home:"Tsjechië",    away:"Mexico",       dt:"2026-06-25T03:00", round:3 },
  { id:"A6", group:"A", home:"Zuid-Afrika", away:"Zuid-Korea",   dt:"2026-06-25T03:00", round:3 },
  // ─ Groep B
  { id:"B1", group:"B", home:"Canada",             away:"Bosnië-Herzegovina", dt:"2026-06-12T21:00", round:1 },
  { id:"B2", group:"B", home:"Qatar",               away:"Zwitserland",         dt:"2026-06-13T21:00", round:1 },
  { id:"B3", group:"B", home:"Zwitserland",         away:"Bosnië-Herzegovina",  dt:"2026-06-18T21:00", round:2 },
  { id:"B4", group:"B", home:"Canada",              away:"Qatar",               dt:"2026-06-19T00:00", round:2 },
  { id:"B5", group:"B", home:"Zwitserland",         away:"Canada",              dt:"2026-06-24T21:00", round:3 },
  { id:"B6", group:"B", home:"Bosnië-Herzegovina",  away:"Qatar",               dt:"2026-06-24T21:00", round:3 },
  // ─ Groep C
  { id:"C1", group:"C", home:"Brazilië",  away:"Marokko",   dt:"2026-06-14T00:00", round:1 },
  { id:"C2", group:"C", home:"Haïti",     away:"Schotland", dt:"2026-06-14T03:00", round:1 },
  { id:"C3", group:"C", home:"Schotland", away:"Marokko",   dt:"2026-06-20T00:00", round:2 },
  { id:"C4", group:"C", home:"Brazilië",  away:"Haïti",     dt:"2026-06-20T03:00", round:2 },
  { id:"C5", group:"C", home:"Schotland", away:"Brazilië",  dt:"2026-06-25T00:00", round:3 },
  { id:"C6", group:"C", home:"Marokko",   away:"Haïti",     dt:"2026-06-25T00:00", round:3 },
  // ─ Groep D
  { id:"D1", group:"D", home:"VS",        away:"Paraguay",  dt:"2026-06-13T03:00", round:1 },
  { id:"D2", group:"D", home:"Australië", away:"Turkije",   dt:"2026-06-13T06:00", round:1 },
  { id:"D3", group:"D", home:"Turkije",   away:"Paraguay",  dt:"2026-06-19T06:00", round:2 },
  { id:"D4", group:"D", home:"VS",        away:"Australië", dt:"2026-06-19T21:00", round:2 },
  { id:"D5", group:"D", home:"Turkije",   away:"VS",        dt:"2026-06-26T04:00", round:3 },
  { id:"D6", group:"D", home:"Paraguay",  away:"Australië", dt:"2026-06-26T04:00", round:3 },
  // ─ Groep E
  { id:"E1", group:"E", home:"Duitsland", away:"Curaçao",   dt:"2026-06-14T19:00", round:1 },
  { id:"E2", group:"E", home:"Ivoorkust", away:"Ecuador",   dt:"2026-06-15T01:00", round:1 },
  { id:"E3", group:"E", home:"Duitsland", away:"Ivoorkust", dt:"2026-06-20T22:00", round:2 },
  { id:"E4", group:"E", home:"Ecuador",   away:"Curaçao",   dt:"2026-06-21T02:00", round:2 },
  { id:"E5", group:"E", home:"Ecuador",   away:"Duitsland", dt:"2026-06-25T22:00", round:3 },
  { id:"E6", group:"E", home:"Curaçao",   away:"Ivoorkust", dt:"2026-06-25T22:00", round:3 },
  // ─ Groep F — 🇳🇱 Nederland
  { id:"F1", group:"F", home:"Nederland", away:"Japan",     dt:"2026-06-14T22:00", round:1 },
  { id:"F2", group:"F", home:"Zweden",    away:"Tunesië",   dt:"2026-06-15T04:00", round:1 },
  { id:"F3", group:"F", home:"Nederland", away:"Zweden",    dt:"2026-06-20T19:00", round:2 },
  { id:"F4", group:"F", home:"Tunesië",   away:"Japan",     dt:"2026-06-21T06:00", round:2 },
  { id:"F5", group:"F", home:"Japan",     away:"Zweden",    dt:"2026-06-26T01:00", round:3 },
  { id:"F6", group:"F", home:"Tunesië",   away:"Nederland", dt:"2026-06-26T01:00", round:3 },
  // ─ Groep G
  { id:"G1", group:"G", home:"België",        away:"Egypte",       dt:"2026-06-15T21:00", round:1 },
  { id:"G2", group:"G", home:"Iran",          away:"Nieuw-Zeeland",dt:"2026-06-16T03:00", round:1 },
  { id:"G3", group:"G", home:"België",        away:"Iran",         dt:"2026-06-21T21:00", round:2 },
  { id:"G4", group:"G", home:"Nieuw-Zeeland", away:"Egypte",       dt:"2026-06-22T03:00", round:2 },
  { id:"G5", group:"G", home:"Egypte",        away:"Iran",         dt:"2026-06-27T05:00", round:3 },
  { id:"G6", group:"G", home:"Nieuw-Zeeland", away:"België",       dt:"2026-06-27T05:00", round:3 },
  // ─ Groep H
  { id:"H1", group:"H", home:"Spanje",       away:"Kaapverdië",   dt:"2026-06-15T18:00", round:1 },
  { id:"H2", group:"H", home:"Saudi-Arabië", away:"Uruguay",      dt:"2026-06-16T00:00", round:1 },
  { id:"H3", group:"H", home:"Spanje",       away:"Saudi-Arabië", dt:"2026-06-21T18:00", round:2 },
  { id:"H4", group:"H", home:"Uruguay",      away:"Kaapverdië",   dt:"2026-06-22T00:00", round:2 },
  { id:"H5", group:"H", home:"Kaapverdië",   away:"Saudi-Arabië", dt:"2026-06-27T02:00", round:3 },
  { id:"H6", group:"H", home:"Uruguay",      away:"Spanje",       dt:"2026-06-27T02:00", round:3 },
  // ─ Groep I
  { id:"I1", group:"I", home:"Frankrijk", away:"Senegal",  dt:"2026-06-16T21:00", round:1 },
  { id:"I2", group:"I", home:"Irak",      away:"Noorwegen",dt:"2026-06-17T00:00", round:1 },
  { id:"I3", group:"I", home:"Frankrijk", away:"Irak",     dt:"2026-06-22T23:00", round:2 },
  { id:"I4", group:"I", home:"Noorwegen", away:"Senegal",  dt:"2026-06-23T02:00", round:2 },
  { id:"I5", group:"I", home:"Noorwegen", away:"Frankrijk",dt:"2026-06-26T21:00", round:3 },
  { id:"I6", group:"I", home:"Senegal",   away:"Irak",     dt:"2026-06-26T21:00", round:3 },
  // ─ Groep J
  { id:"J1", group:"J", home:"Oostenrijk", away:"Jordanië",  dt:"2026-06-16T06:00", round:1 },
  { id:"J2", group:"J", home:"Argentinië", away:"Algerije",  dt:"2026-06-17T03:00", round:1 },
  { id:"J3", group:"J", home:"Argentinië", away:"Oostenrijk",dt:"2026-06-22T19:00", round:2 },
  { id:"J4", group:"J", home:"Jordanië",   away:"Algerije",  dt:"2026-06-23T05:00", round:2 },
  { id:"J5", group:"J", home:"Algerije",   away:"Oostenrijk",dt:"2026-06-27T04:00", round:3 },
  { id:"J6", group:"J", home:"Jordanië",   away:"Argentinië",dt:"2026-06-27T04:00", round:3 },
  // ─ Groep K
  { id:"K1", group:"K", home:"Portugal",    away:"DR Congo",    dt:"2026-06-17T19:00", round:1 },
  { id:"K2", group:"K", home:"Oezbekistan", away:"Colombia",    dt:"2026-06-18T04:00", round:1 },
  { id:"K3", group:"K", home:"Portugal",    away:"Oezbekistan", dt:"2026-06-23T19:00", round:2 },
  { id:"K4", group:"K", home:"Colombia",    away:"DR Congo",    dt:"2026-06-24T04:00", round:2 },
  { id:"K5", group:"K", home:"Colombia",    away:"Portugal",    dt:"2026-06-28T01:30", round:3 },
  { id:"K6", group:"K", home:"DR Congo",    away:"Oezbekistan", dt:"2026-06-28T01:30", round:3 },
  // ─ Groep L
  { id:"L1", group:"L", home:"Engeland", away:"Kroatië",  dt:"2026-06-17T22:00", round:1 },
  { id:"L2", group:"L", home:"Ghana",    away:"Panama",   dt:"2026-06-18T01:00", round:1 },
  { id:"L3", group:"L", home:"Engeland", away:"Ghana",    dt:"2026-06-23T22:00", round:2 },
  { id:"L4", group:"L", home:"Panama",   away:"Kroatië",  dt:"2026-06-24T01:00", round:2 },
  { id:"L5", group:"L", home:"Panama",   away:"Engeland", dt:"2026-06-27T23:00", round:3 },
  { id:"L6", group:"L", home:"Kroatië",  away:"Ghana",    dt:"2026-06-27T23:00", round:3 },
];

// Helper: format date for display
function fmtDate(dt) {
  if (!dt) return "";
  const d = new Date(dt);
  return d.toLocaleDateString("nl-NL", { weekday:"short", day:"numeric", month:"short" });
}
function fmtTime(dt) {
  if (!dt) return "";
  const d = new Date(dt);
  return d.toLocaleTimeString("nl-NL", { hour:"2-digit", minute:"2-digit" });
}
function fmtDateTime(dt) {
  if (!dt) return "";
  return `${fmtDate(dt)} ${fmtTime(dt)}`;
}

// KO bracket WK 2026 — 48 landen → 32 landen
// R32 = zestiende finales (28 jun – 2 jul), R16 = achtste finales, QF, SF, Final
// Groepswinnaars vs beste nr3, nummers 2 vs nummers 2 (vereenvoudigd schema)
const KO_STRUCTURE = [
  // ─ Zestiende finales (R32) — 16 wedstrijden
  { id:"R32_1",  round:"r32", label:"Zestiende finale 1",  homeSlot:"1A",  awaySlot:"N3BCDI" },
  { id:"R32_2",  round:"r32", label:"Zestiende finale 2",  homeSlot:"1C",  awaySlot:"2F" },
  { id:"R32_3",  round:"r32", label:"Zestiende finale 3",  homeSlot:"1E",  awaySlot:"N3ABCD" },
  { id:"R32_4",  round:"r32", label:"Zestiende finale 4",  homeSlot:"1G",  awaySlot:"N3ABFG" },
  { id:"R32_5",  round:"r32", label:"Zestiende finale 5",  homeSlot:"1I",  awaySlot:"N3EFGL" },
  { id:"R32_6",  round:"r32", label:"Zestiende finale 6",  homeSlot:"1K",  awaySlot:"N3HJKL" },
  { id:"R32_7",  round:"r32", label:"Zestiende finale 7",  homeSlot:"1B",  awaySlot:"2A" },
  { id:"R32_8",  round:"r32", label:"Zestiende finale 8",  homeSlot:"1D",  awaySlot:"2C" },
  { id:"R32_9",  round:"r32", label:"Zestiende finale 9",  homeSlot:"1F",  awaySlot:"2E" },
  { id:"R32_10", round:"r32", label:"Zestiende finale 10", homeSlot:"1H",  awaySlot:"2G" },
  { id:"R32_11", round:"r32", label:"Zestiende finale 11", homeSlot:"1J",  awaySlot:"2I" },
  { id:"R32_12", round:"r32", label:"Zestiende finale 12", homeSlot:"1L",  awaySlot:"2K" },
  { id:"R32_13", round:"r32", label:"Zestiende finale 13", homeSlot:"2B",  awaySlot:"2J" },
  { id:"R32_14", round:"r32", label:"Zestiende finale 14", homeSlot:"2D",  awaySlot:"2L" },
  { id:"R32_15", round:"r32", label:"Zestiende finale 15", homeSlot:"2H",  awaySlot:"N3ABCE" },
  { id:"R32_16", round:"r32", label:"Zestiende finale 16", homeSlot:"N3IJKL", awaySlot:"N3EFGH" },
  // ─ Achtste finales (R16)
  { id:"R16_1", round:"r16", label:"Achtste finale 1", homeSlot:"WR32_1",  awaySlot:"WR32_2" },
  { id:"R16_2", round:"r16", label:"Achtste finale 2", homeSlot:"WR32_3",  awaySlot:"WR32_4" },
  { id:"R16_3", round:"r16", label:"Achtste finale 3", homeSlot:"WR32_5",  awaySlot:"WR32_6" },
  { id:"R16_4", round:"r16", label:"Achtste finale 4", homeSlot:"WR32_7",  awaySlot:"WR32_8" },
  { id:"R16_5", round:"r16", label:"Achtste finale 5", homeSlot:"WR32_9",  awaySlot:"WR32_10" },
  { id:"R16_6", round:"r16", label:"Achtste finale 6", homeSlot:"WR32_11", awaySlot:"WR32_12" },
  { id:"R16_7", round:"r16", label:"Achtste finale 7", homeSlot:"WR32_13", awaySlot:"WR32_14" },
  { id:"R16_8", round:"r16", label:"Achtste finale 8", homeSlot:"WR32_15", awaySlot:"WR32_16" },
  // ─ Kwartfinales
  { id:"QF_1", round:"qf", label:"Kwartfinale 1", homeSlot:"WR16_1", awaySlot:"WR16_2" },
  { id:"QF_2", round:"qf", label:"Kwartfinale 2", homeSlot:"WR16_3", awaySlot:"WR16_4" },
  { id:"QF_3", round:"qf", label:"Kwartfinale 3", homeSlot:"WR16_5", awaySlot:"WR16_6" },
  { id:"QF_4", round:"qf", label:"Kwartfinale 4", homeSlot:"WR16_7", awaySlot:"WR16_8" },
  // ─ Halve finales
  { id:"SF_1", round:"sf", label:"Halve finale 1", homeSlot:"WQF_1", awaySlot:"WQF_2" },
  { id:"SF_2", round:"sf", label:"Halve finale 2", homeSlot:"WQF_3", awaySlot:"WQF_4" },
  // ─ Finale & 3e plaats
  { id:"3RD",   round:"3rd",   label:"3e Plaats",   homeSlot:"LSF_1", awaySlot:"LSF_2" },
  { id:"FINAL", round:"final", label:"🏆 Finale",    homeSlot:"WSF_1", awaySlot:"WSF_2" },
];

const NL_STAGES = [
  "Groepsfase (niet verder)",
  "Zestiende finale",
  "Achtste finale",
  "Kwartfinale",
  "Halve finale",
  "3e Plaats",
  "🏆 Wereldkampioen",
];

// 12 laagst geklasseerde WK 2026 deelnemers op FIFA-ranking
const SURPRISE_TEAMS = [
  "Haïti",           // debutant
  "Oezbekistan",     // debutant
  "DR Congo",        // laag gerankt
  "Kaapverdië",      // debutant
  "Irak",            // laag gerankt
  "Jordanië",        // laag gerankt
  "Panama",          // laag gerankt
  "Curaçao",         // debutant
  "Nieuw-Zeeland",   // laag gerankt
  "Algerije",        // laag gerankt
  "Qatar",           // laag gerankt
  "Zuid-Afrika",     // laag gerankt
];

// Points per KO round reached by the surprise team
const PTS_SURPRISE = {
  "Groepsfase (niet verder)": 0,
  "Zestiende finale": 2,
  "Achtste finale":   5,
  "Kwartfinale":      10,
  "Halve finale":     15,
  "3e Plaats":        18,
  "🏆 Wereldkampioen": 25,
};

// 12 hoogst geklasseerde WK 2026 deelnemers op FIFA-ranking
const TOP_TEAMS = [
  "Argentinië",   // #1
  "Frankrijk",    // #2
  "Engeland",     // #4
  "Brazilië",     // #5
  "Portugal",     // #6
  "Spanje",       // #7
  "Nederland",    // #8
  "België",       // #3 (FIFA ranking)
  "Duitsland",    // #12
  "Uruguay",      // #11
  "Colombia",     // #9
  "Marokko",      // #14
];

const PTS_TOP_OUT = 10;

// Spelers per land: eerst topscorers (kwal > 0, gesorteerd hoog→laag), dan overige spelers (kwal = 0)
// kwal = doelpunten in WK 2026 kwalificatie
const PLAYERS_BY_COUNTRY = {
  "Mexico":       [{ name:"Santiago Giménez", kwal:6 },{ name:"Raúl Jiménez", kwal:5 },{ name:"Henry Martín", kwal:3 },{ name:"Hirving Lozano", kwal:2 },{ name:"Alexis Vega", kwal:1 },{ name:"Chucky Lozano", kwal:0 },{ name:"Edson Álvarez", kwal:0 },{ name:"Andrés Guardado", kwal:0 }],
  "Zuid-Afrika":  [{ name:"Lyle Foster", kwal:4 },{ name:"Percy Tau", kwal:3 },{ name:"Teboho Mokoena", kwal:2 },{ name:"Evidence Makgopa", kwal:1 },{ name:"Bongani Zungu", kwal:0 },{ name:"Keagan Dolly", kwal:0 }],
  "Zuid-Korea":   [{ name:"Son Heung-min", kwal:7 },{ name:"Hwang Hee-chan", kwal:4 },{ name:"Cho Gue-sung", kwal:3 },{ name:"Lee Jae-sung", kwal:2 },{ name:"Hwang In-beom", kwal:0 },{ name:"Kim Min-jae", kwal:0 }],
  "Tsjechië":     [{ name:"Patrik Schick", kwal:6 },{ name:"Adam Hložek", kwal:3 },{ name:"Tomáš Chorý", kwal:3 },{ name:"Lukáš Provod", kwal:1 },{ name:"Vladimír Coufal", kwal:0 },{ name:"Tomáš Souček", kwal:0 }],
  "Canada":       [{ name:"Jonathan David", kwal:8 },{ name:"Cyle Larin", kwal:5 },{ name:"Alphonso Davies", kwal:4 },{ name:"Junior Hoilett", kwal:2 },{ name:"Stephen Eustáquio", kwal:0 },{ name:"Tajon Buchanan", kwal:0 }],
  "Bosnië-Herzegovina": [{ name:"Ermedin Demirović", kwal:6 },{ name:"Edin Džeko", kwal:5 },{ name:"Anel Ahmedhodžić", kwal:2 },{ name:"Haris Hajradinović", kwal:1 },{ name:"Miralem Pjanić", kwal:0 },{ name:"Sead Kolašinac", kwal:0 }],
  "Qatar":        [{ name:"Akram Afif", kwal:5 },{ name:"Almoez Ali", kwal:4 },{ name:"Yousuf Abdurisag", kwal:2 },{ name:"Bassam Al-Rawi", kwal:1 },{ name:"Hassan Al-Haydos", kwal:0 }],
  "Zwitserland":  [{ name:"Ruben Vargas", kwal:4 },{ name:"Breel Embolo", kwal:4 },{ name:"Noah Okafor", kwal:3 },{ name:"Granit Xhaka", kwal:3 },{ name:"Xherdan Shaqiri", kwal:0 },{ name:"Manuel Akanji", kwal:0 },{ name:"Fabian Rieder", kwal:0 }],
  "Brazilië":     [{ name:"Raphinha", kwal:7 },{ name:"Vinicius Jr.", kwal:7 },{ name:"Endrick", kwal:5 },{ name:"Rodrygo", kwal:4 },{ name:"Richarlison", kwal:4 },{ name:"Gabriel Martinelli", kwal:3 },{ name:"Lucas Paquetá", kwal:0 },{ name:"Bruno Guimarães", kwal:0 },{ name:"Marquinhos", kwal:0 }],
  "Marokko":      [{ name:"Youssef En-Nesyri", kwal:9 },{ name:"Soufiane Rahimi", kwal:5 },{ name:"Hakim Ziyech", kwal:4 },{ name:"Achraf Hakimi", kwal:3 },{ name:"Sofyan Amrabat", kwal:0 },{ name:"Noussair Mazraoui", kwal:0 }],
  "Haïti":        [{ name:"Frantzdy Pierrot", kwal:3 },{ name:"Duckens Nazon", kwal:2 },{ name:"Melchie Daël", kwal:1 },{ name:"Wilde-Donald Guerrier", kwal:0 }],
  "Schotland":    [{ name:"Lawrence Shankland", kwal:7 },{ name:"Scott McTominay", kwal:4 },{ name:"Lyndon Dykes", kwal:4 },{ name:"Ryan Christie", kwal:2 },{ name:"Stuart Armstrong", kwal:0 },{ name:"John McGinn", kwal:0 }],
  "VS":           [{ name:"Christian Pulisic", kwal:9 },{ name:"Ricardo Pepi", kwal:6 },{ name:"Folarin Balogun", kwal:4 },{ name:"Josh Sargent", kwal:3 },{ name:"Weston McKennie", kwal:0 },{ name:"Tyler Adams", kwal:0 },{ name:"Gio Reyna", kwal:0 }],
  "Paraguay":     [{ name:"Antonio Sanabria", kwal:5 },{ name:"Miguel Almirón", kwal:4 },{ name:"Julio Enciso", kwal:3 },{ name:"Alberto Espínola", kwal:2 },{ name:"Richard Sánchez", kwal:0 }],
  "Australië":    [{ name:"Mitchell Duke", kwal:4 },{ name:"Martin Boyle", kwal:3 },{ name:"Jason Cummings", kwal:2 },{ name:"Garang Kuol", kwal:1 },{ name:"Mathew Leckie", kwal:0 },{ name:"Aaron Mooy", kwal:0 }],
  "Turkije":      [{ name:"Kerem Aktürkoğlu", kwal:5 },{ name:"Hakan Çalhanoğlu", kwal:4 },{ name:"Cenk Tosun", kwal:3 },{ name:"Baris Yilmaz", kwal:3 },{ name:"Arda Güler", kwal:0 },{ name:"Zeki Çelik", kwal:0 }],
  "Duitsland":    [{ name:"Florian Wirtz", kwal:6 },{ name:"Kai Havertz", kwal:6 },{ name:"Leroy Sané", kwal:4 },{ name:"Serge Gnabry", kwal:3 },{ name:"Thomas Müller", kwal:3 },{ name:"Jamal Musiala", kwal:0 },{ name:"Joshua Kimmich", kwal:0 },{ name:"Toni Kroos", kwal:0 }],
  "Curaçao":      [{ name:"Leandro Bacuna", kwal:3 },{ name:"Juriën Timber", kwal:2 },{ name:"Cuco Martina", kwal:1 },{ name:"Quentin Doesthate", kwal:0 }],
  "Ivoorkust":    [{ name:"Sébastien Haller", kwal:6 },{ name:"Wilfried Zaha", kwal:4 },{ name:"Nicolas Pépé", kwal:3 },{ name:"Franck Kessié", kwal:2 },{ name:"Jean-Michaël Seri", kwal:0 },{ name:"Serge Aurier", kwal:0 }],
  "Ecuador":      [{ name:"Enner Valencia", kwal:7 },{ name:"Michael Estrada", kwal:4 },{ name:"Gonzalo Plata", kwal:3 },{ name:"Jeremy Sarmiento", kwal:2 },{ name:"Piero Hincapié", kwal:0 },{ name:"Moisés Caicedo", kwal:0 }],
  "Nederland":    [{ name:"Cody Gakpo", kwal:8 },{ name:"Memphis Depay", kwal:6 },{ name:"Wout Weghorst", kwal:5 },{ name:"Donyell Malen", kwal:4 },{ name:"Brian Brobbey", kwal:3 },{ name:"Xavi Simons", kwal:2 },{ name:"Virgil van Dijk", kwal:0 },{ name:"Frenkie de Jong", kwal:0 },{ name:"Ryan Gravenberch", kwal:0 },{ name:"Denzel Dumfries", kwal:0 }],
  "Japan":        [{ name:"Ayase Ueda", kwal:7 },{ name:"Takuma Asano", kwal:5 },{ name:"Ritsu Doan", kwal:5 },{ name:"Kaoru Mitoma", kwal:4 },{ name:"Daichi Kamada", kwal:0 },{ name:"Junya Ito", kwal:0 }],
  "Zweden":       [{ name:"Alexander Isak", kwal:9 },{ name:"Viktor Gyökeres", kwal:8 },{ name:"Emil Forsberg", kwal:4 },{ name:"Dejan Kulusevski", kwal:3 },{ name:"Anthony Elanga", kwal:0 },{ name:"Zlatan Ibrahimović", kwal:0 }],
  "Tunesië":      [{ name:"Seifeddine Jaziri", kwal:4 },{ name:"Wahbi Khazri", kwal:3 },{ name:"Youssef Msakni", kwal:2 },{ name:"Hamza Rafia", kwal:0 },{ name:"Ghailene Chaalali", kwal:0 }],
  "België":       [{ name:"Romelu Lukaku", kwal:7 },{ name:"Lois Openda", kwal:6 },{ name:"Dodi Lukebakio", kwal:4 },{ name:"Leandro Trossard", kwal:3 },{ name:"Kevin De Bruyne", kwal:0 },{ name:"Axel Witsel", kwal:0 },{ name:"Arthur Theate", kwal:0 }],
  "Egypte":       [{ name:"Mohamed Salah", kwal:9 },{ name:"Omar Marmoush", kwal:5 },{ name:"Marwan Hamdy", kwal:4 },{ name:"Mustafa Mohamed", kwal:3 },{ name:"Trezeguet", kwal:0 },{ name:"Ahmed Hegazi", kwal:0 }],
  "Iran":         [{ name:"Mehdi Taremi", kwal:7 },{ name:"Sardar Azmoun", kwal:5 },{ name:"Ramin Rezaeian", kwal:2 },{ name:"Alireza Jahanbakhsh", kwal:0 },{ name:"Karim Ansarifard", kwal:0 }],
  "Nieuw-Zeeland":[{ name:"Chris Wood", kwal:8 },{ name:"Matt Garbett", kwal:2 },{ name:"Liberato Cacace", kwal:1 },{ name:"Bill Tuilagi", kwal:0 },{ name:"Michael Boxall", kwal:0 }],
  "Spanje":       [{ name:"Álvaro Morata", kwal:6 },{ name:"Lamine Yamal", kwal:5 },{ name:"Ferran Torres", kwal:4 },{ name:"Mikel Oyarzabal", kwal:3 },{ name:"Pedri", kwal:0 },{ name:"Gavi", kwal:0 },{ name:"Rodri", kwal:0 },{ name:"Dani Olmo", kwal:0 }],
  "Kaapverdië":   [{ name:"Júlio Tavares", kwal:5 },{ name:"Ryan Mendes", kwal:4 },{ name:"Garry Rodrigues", kwal:3 },{ name:"Dy Ferreira", kwal:0 }],
  "Saudi-Arabië": [{ name:"Salem Al-Dawsari", kwal:6 },{ name:"Firas Al-Buraikan", kwal:4 },{ name:"Saleh Al-Shehri", kwal:3 },{ name:"Mohammed Al-Owais", kwal:0 }],
  "Uruguay":      [{ name:"Darwin Núñez", kwal:7 },{ name:"Edinson Cavani", kwal:4 },{ name:"Luis Suárez", kwal:3 },{ name:"Rodrigo Bentancur", kwal:0 },{ name:"Federico Valverde", kwal:0 },{ name:"José Giménez", kwal:0 }],
  "Frankrijk":    [{ name:"Kylian Mbappé", kwal:5 },{ name:"Marcus Thuram", kwal:4 },{ name:"Antoine Griezmann", kwal:4 },{ name:"Ousmane Dembélé", kwal:3 },{ name:"Randal Kolo Muani", kwal:2 },{ name:"Eduardo Camavinga", kwal:0 },{ name:"Aurélien Tchouaméni", kwal:0 },{ name:"William Saliba", kwal:0 }],
  "Senegal":      [{ name:"Sadio Mané", kwal:6 },{ name:"Ismaïla Sarr", kwal:4 },{ name:"Habib Diallo", kwal:3 },{ name:"Famara Diédhiou", kwal:3 },{ name:"Idrissa Gueye", kwal:0 },{ name:"Kalidou Koulibaly", kwal:0 }],
  "Irak":         [{ name:"Aymen Hussein", kwal:6 },{ name:"Amjed Attwan", kwal:3 },{ name:"Humam Tariq", kwal:2 },{ name:"Ali Adnan", kwal:0 },{ name:"Bashar Resan", kwal:0 }],
  "Noorwegen":    [{ name:"Erling Haaland", kwal:16 },{ name:"Alexander Sørloth", kwal:5 },{ name:"Martin Ødegaard", kwal:4 },{ name:"Ola Solbakken", kwal:2 },{ name:"Mohamed Elyounoussi", kwal:0 },{ name:"Stefan Strandberg", kwal:0 }],
  "Argentinië":   [{ name:"Lautaro Martínez", kwal:9 },{ name:"Lionel Messi", kwal:8 },{ name:"Julián Álvarez", kwal:6 },{ name:"Nicolás González", kwal:3 },{ name:"Ángel Di María", kwal:0 },{ name:"Rodrigo De Paul", kwal:0 },{ name:"Mac Allister", kwal:0 }],
  "Algerije":     [{ name:"Riyad Mahrez", kwal:5 },{ name:"Islam Slimani", kwal:4 },{ name:"Youcef Atal", kwal:2 },{ name:"Sofiane Feghouli", kwal:0 },{ name:"Andy Delort", kwal:0 }],
  "Oostenrijk":   [{ name:"Marko Arnautović", kwal:5 },{ name:"Michael Gregoritsch", kwal:4 },{ name:"Marcel Sabitzer", kwal:3 },{ name:"David Alaba", kwal:0 },{ name:"Konrad Laimer", kwal:0 }],
  "Jordanië":     [{ name:"Musa Al-Taamari", kwal:5 },{ name:"Hamza Al-Dardour", kwal:4 },{ name:"Ziad Al-Bakkar", kwal:2 },{ name:"Ahmad Ababneh", kwal:0 }],
  "Portugal":     [{ name:"Cristiano Ronaldo", kwal:7 },{ name:"Bruno Fernandes", kwal:6 },{ name:"Gonçalo Ramos", kwal:5 },{ name:"Rafael Leão", kwal:4 },{ name:"Pedro Neto", kwal:2 },{ name:"João Félix", kwal:0 },{ name:"Vitinha", kwal:0 },{ name:"Rúben Dias", kwal:0 }],
  "DR Congo":     [{ name:"Cédric Bakambu", kwal:6 },{ name:"Yoane Wissa", kwal:4 },{ name:"Herita Ilunga", kwal:2 },{ name:"Chancel Mbemba", kwal:0 },{ name:"Arthur Masuaku", kwal:0 }],
  "Oezbekistan":  [{ name:"Eldor Shomurodov", kwal:7 },{ name:"Bobur Abdullayev", kwal:3 },{ name:"Otabek Shukurov", kwal:2 },{ name:"Jaloliddin Masharipov", kwal:0 },{ name:"Odil Ahmedov", kwal:0 }],
  "Colombia":     [{ name:"Miguel Borja", kwal:6 },{ name:"Luis Díaz", kwal:7 },{ name:"James Rodríguez", kwal:5 },{ name:"Radamel Falcao", kwal:3 },{ name:"Juan Cuadrado", kwal:0 },{ name:"Yerry Mina", kwal:0 }],
  "Engeland":     [{ name:"Harry Kane", kwal:8 },{ name:"Bukayo Saka", kwal:5 },{ name:"Ollie Watkins", kwal:4 },{ name:"Phil Foden", kwal:4 },{ name:"Marcus Rashford", kwal:3 },{ name:"Jude Bellingham", kwal:0 },{ name:"Declan Rice", kwal:0 },{ name:"Trent Alexander-Arnold", kwal:0 }],
  "Kroatië":      [{ name:"Andrej Kramarić", kwal:6 },{ name:"Ivan Perišić", kwal:4 },{ name:"Bruno Petković", kwal:3 },{ name:"Luka Modrić", kwal:0 },{ name:"Marcelo Brozović", kwal:0 },{ name:"Joško Gvardiol", kwal:0 }],
  "Ghana":        [{ name:"Inaki Williams", kwal:6 },{ name:"Jordan Ayew", kwal:5 },{ name:"Mohammed Kudus", kwal:4 },{ name:"Thomas Partey", kwal:0 },{ name:"André Ayew", kwal:0 }],
  "Panama":       [{ name:"Cecilio Waterman", kwal:4 },{ name:"Gabriel Torres", kwal:3 },{ name:"Rolando Blackburn", kwal:3 },{ name:"Édgar Bárcenas", kwal:0 },{ name:"Alberto Quintero", kwal:0 }],
};

// ─── PUNTENSCHEMA ─────────────────────────────────────────────────────────────
// Groepsfase per wedstrijd (mutueel exclusief, hoogste telt)
const PTS_GROUP = {
  exact: 5,       // Exacte uitslag (bv. 2-1)
  diff: 3,        // Juist doelpuntenverschil, niet exacte score
  winner: 2,      // Alleen juiste winnaar/gelijkspel
};
// Groepsstand — automatisch op basis van voorspelde uitslagen
// Vergelijking: voorspelde top-2 vs officiële top-2
const PTS_STANDING = {
  qualified: 2,            // Team zit in voorspelde top-2 én haalt ook echt KO-fase
  qualifiedCorrectPos: 5,  // Zelfde positie: voorspelde #1 is ook echt #1, of #2 is #2
};
// KO-fase stijgend per ronde [juiste winnaar, exacte 90-min stand]
const PTS_KO = {
  r32:   { winner: 1, exact: 3 },
  r16:   { winner: 2, exact: 4 },
  qf:    { winner: 3, exact: 6 },
  sf:    { winner: 4, exact: 8 },
  "3rd": { winner: 4, exact: 8 },
  final: { winner: 5, exact: 10 },
};
// Extra vragen
const PTS_EXTRA = {
  champion: 25,
  topScorer: 8,
  nlStage: 8,
  topOut: PTS_TOP_OUT,
  // surprise: dynamic — see PTS_SURPRISE above
};

const FLAG = {
  // Groep A
  Mexico:"🇲🇽", "Zuid-Afrika":"🇿🇦", "Zuid-Korea":"🇰🇷", "Tsjechië":"🇨🇿",
  // Groep B
  Canada:"🇨🇦", "Bosnië-Herzegovina":"🇧🇦", Qatar:"🇶🇦", Zwitserland:"🇨🇭",
  // Groep C
  "Brazilië":"🇧🇷", Marokko:"🇲🇦", "Haïti":"🇭🇹", Schotland:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  // Groep D
  VS:"🇺🇸", Paraguay:"🇵🇾", "Australië":"🇦🇺", Turkije:"🇹🇷",
  // Groep E
  Duitsland:"🇩🇪", "Curaçao":"🇨🇼", Ivoorkust:"🇨🇮", Ecuador:"🇪🇨",
  // Groep F
  Nederland:"🇳🇱", Japan:"🇯🇵", Zweden:"🇸🇪", "Tunesië":"🇹🇳",
  // Groep G
  "België":"🇧🇪", Egypte:"🇪🇬", Iran:"🇮🇷", "Nieuw-Zeeland":"🇳🇿",
  // Groep H
  Spanje:"🇪🇸", "Kaapverdië":"🇨🇻", "Saudi-Arabië":"🇸🇦", Uruguay:"🇺🇾",
  // Groep I
  Frankrijk:"🇫🇷", Senegal:"🇸🇳", Irak:"🇮🇶", Noorwegen:"🇳🇴",
  // Groep J
  "Argentinië":"🇦🇷", Algerije:"🇩🇿", Oostenrijk:"🇦🇹", "Jordanië":"🇯🇴",
  // Groep K
  Portugal:"🇵🇹", "DR Congo":"🇨🇩", Oezbekistan:"🇺🇿", Colombia:"🇨🇴",
  // Groep L
  Engeland:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Kroatië":"🇭🇷", Ghana:"🇬🇭", Panama:"🇵🇦",
};

const ADMIN_PW = "admin2026";
const KEY = "wk_poule_v12";

export {
  GROUPS,
  ALL_TEAMS,
  GROUP_MATCHES,
  KO_STRUCTURE,
  NL_STAGES,
  SURPRISE_TEAMS,
  PTS_SURPRISE,
  TOP_TEAMS,
  PTS_TOP_OUT,
  PLAYERS_BY_COUNTRY,
  PTS_GROUP,
  PTS_STANDING,
  PTS_KO,
  PTS_EXTRA,
  FLAG,
  ADMIN_PW,
  KEY
};
