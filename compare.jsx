import {
  GROUPS,
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
  KEY
} from "./data/tournamentData";

// ─── STORAGE ──────────────────────────────────────────────────────────────────
function load() { try { return JSON.parse(localStorage.getItem(KEY)) || null; } catch(e) { return null; } }
const persist = (d) => localStorage.setItem(KEY, JSON.stringify(d));
const hash = (s) => btoa(encodeURIComponent(s + "_wk_salt_2026"));

// Ingmar's WK 2026 groepsfase voorspellingen
const INGMAR_MATCHES = {
  A1:{home:"2",away:"1"},A2:{home:"1",away:"2"},A3:{home:"1",away:"1"},A4:{home:"3",away:"1"},A5:{home:"0",away:"1"},A6:{home:"2",away:"0"},
  B1:{home:"2",away:"1"},B2:{home:"0",away:"2"},B3:{home:"1",away:"1"},B4:{home:"3",away:"0"},B5:{home:"2",away:"1"},B6:{home:"1",away:"0"},
  C1:{home:"3",away:"1"},C2:{home:"0",away:"2"},C3:{home:"0",away:"1"},C4:{home:"4",away:"0"},C5:{home:"1",away:"3"},C6:{home:"2",away:"0"},
  D1:{home:"2",away:"0"},D2:{home:"1",away:"1"},D3:{home:"2",away:"1"},D4:{home:"1",away:"0"},D5:{home:"1",away:"2"},D6:{home:"0",away:"1"},
  E1:{home:"3",away:"0"},E2:{home:"1",away:"2"},E3:{home:"2",away:"1"},E4:{home:"1",away:"0"},E5:{home:"1",away:"2"},E6:{home:"0",away:"3"},
  F1:{home:"2",away:"1"},F2:{home:"2",away:"0"},F3:{home:"1",away:"0"},F4:{home:"0",away:"1"},F5:{home:"1",away:"2"},F6:{home:"0",away:"2"},
  G1:{home:"2",away:"0"},G2:{home:"0",away:"1"},G3:{home:"3",away:"1"},G4:{home:"1",away:"2"},G5:{home:"1",away:"2"},G6:{home:"0",away:"1"},
  H1:{home:"2",away:"0"},H2:{home:"1",away:"1"},H3:{home:"1",away:"0"},H4:{home:"2",away:"0"},H5:{home:"1",away:"3"},H6:{home:"2",away:"1"},
  I1:{home:"2",away:"1"},I2:{home:"1",away:"2"},I3:{home:"3",away:"0"},I4:{home:"1",away:"1"},I5:{home:"0",away:"1"},I6:{home:"2",away:"0"},
  J1:{home:"1",away:"0"},J2:{home:"3",away:"1"},J3:{home:"2",away:"0"},J4:{home:"0",away:"1"},J5:{home:"1",away:"2"},J6:{home:"0",away:"2"},
  K1:{home:"3",away:"0"},K2:{home:"0",away:"2"},K3:{home:"2",away:"0"},K4:{home:"1",away:"0"},K5:{home:"1",away:"2"},K6:{home:"1",away:"3"},
  L1:{home:"2",away:"0"},L2:{home:"1",away:"1"},L3:{home:"3",away:"1"},L4:{home:"0",away:"1"},L5:{home:"0",away:"2"},L6:{home:"1",away:"2"},
};

function blank() {
  const ingmarId = "u_ingmar_seed";
  // ─── Gesimuleerde uitslagen t/m 27 juni 2026 (volledige groepsfase) ──────────
  const SIM_RESULTS = {
    // ── GROEP A ──
    A1: { home:"2", away:"1", played:true },   // Mexico 2-1 Zuid-Afrika
    A2: { home:"1", away:"1", played:true },   // Zuid-Korea 1-1 Tsjechië
    A3: { home:"2", away:"0", played:true },   // Tsjechië 2-0 Zuid-Afrika
    A4: { home:"0", away:"1", played:true },   // Mexico 0-1 Zuid-Korea
    A5: { home:"1", away:"2", played:true },   // Tsjechië 1-2 Mexico
    A6: { home:"0", away:"2", played:true },   // Zuid-Afrika 0-2 Zuid-Korea
    // Eindstand A: Zuid-Korea 7pt, Mexico 6pt → door; Tsjechië 4pt, Zuid-Afrika 0pt

    // ── GROEP B ──
    B1: { home:"2", away:"0", played:true },   // Canada 2-0 Bosnië-Herzegovina
    B2: { home:"0", away:"2", played:true },   // Qatar 0-2 Zwitserland
    B3: { home:"1", away:"1", played:true },   // Zwitserland 1-1 Bosnië-Herzegovina
    B4: { home:"3", away:"0", played:true },   // Canada 3-0 Qatar
    B5: { home:"0", away:"1", played:true },   // Zwitserland 0-1 Canada
    B6: { home:"2", away:"1", played:true },   // Bosnië-Herzegovina 2-1 Qatar
    // Eindstand B: Canada 9pt, Zwitserland 5pt → door; Bosnië 3pt, Qatar 0pt

    // ── GROEP C ──
    C1: { home:"2", away:"1", played:true },   // Brazilië 2-1 Marokko
    C2: { home:"0", away:"3", played:true },   // Haïti 0-3 Schotland
    C3: { home:"0", away:"2", played:true },   // Schotland 0-2 Marokko
    C4: { home:"4", away:"0", played:true },   // Brazilië 4-0 Haïti
    C5: { home:"0", away:"3", played:true },   // Schotland 0-3 Brazilië
    C6: { home:"3", away:"0", played:true },   // Marokko 3-0 Haïti
    // Eindstand C: Brazilië 9pt, Marokko 6pt → door; Schotland 3pt, Haïti 0pt

    // ── GROEP D ──
    D1: { home:"1", away:"0", played:true },   // VS 1-0 Paraguay
    D2: { home:"1", away:"2", played:true },   // Australië 1-2 Turkije
    D3: { home:"1", away:"1", played:true },   // Turkije 1-1 Paraguay
    D4: { home:"2", away:"1", played:true },   // VS 2-1 Australië
    D5: { home:"1", away:"2", played:true },   // Turkije 1-2 VS
    D6: { home:"2", away:"1", played:true },   // Paraguay 2-1 Australië
    // Eindstand D: VS 9pt, Turkije 4pt → door; Paraguay 4pt (DS-1), Australië 0pt

    // ── GROEP E ──
    E1: { home:"4", away:"0", played:true },   // Duitsland 4-0 Curaçao
    E2: { home:"1", away:"2", played:true },   // Ivoorkust 1-2 Ecuador
    E3: { home:"2", away:"1", played:true },   // Duitsland 2-1 Ivoorkust
    E4: { home:"3", away:"0", played:true },   // Ecuador 3-0 Curaçao
    E5: { home:"1", away:"1", played:true },   // Ecuador 1-1 Duitsland
    E6: { home:"0", away:"2", played:true },   // Curaçao 0-2 Ivoorkust
    // Eindstand E: Ecuador 7pt, Duitsland 7pt (DS+6 vs +4) → door; Ivoorkust 3pt, Curaçao 0pt

    // ── GROEP F — Nederland ──
    F1: { home:"1", away:"0", played:true },   // Nederland 1-0 Japan
    F2: { home:"2", away:"1", played:true },   // Zweden 2-1 Tunesië
    F3: { home:"2", away:"1", played:true },   // Nederland 2-1 Zweden
    F4: { home:"0", away:"2", played:true },   // Tunesië 0-2 Japan
    F5: { home:"1", away:"2", played:true },   // Japan 1-2 Zweden
    F6: { home:"1", away:"3", played:true },   // Tunesië 1-3 Nederland
    // Eindstand F: Nederland 9pt, Zweden 6pt → door; Japan 3pt, Tunesië 0pt

    // ── GROEP G ──
    G1: { home:"3", away:"1", played:true },   // België 3-1 Egypte
    G2: { home:"0", away:"1", played:true },   // Iran 0-1 Nieuw-Zeeland
    G3: { home:"2", away:"0", played:true },   // België 2-0 Iran
    G4: { home:"1", away:"1", played:true },   // Nieuw-Zeeland 1-1 Egypte
    G5: { home:"1", away:"2", played:true },   // Egypte 1-2 Iran
    G6: { home:"0", away:"3", played:true },   // Nieuw-Zeeland 0-3 België
    // Eindstand G: België 9pt, Nieuw-Zeeland 4pt → door; Iran 3pt, Egypte 1pt

    // ── GROEP H ──
    H1: { home:"3", away:"0", played:true },   // Spanje 3-0 Kaapverdië
    H2: { home:"1", away:"2", played:true },   // Saudi-Arabië 1-2 Uruguay
    H3: { home:"2", away:"0", played:true },   // Spanje 2-0 Saudi-Arabië
    H4: { home:"3", away:"0", played:true },   // Uruguay 3-0 Kaapverdië
    H5: { home:"1", away:"2", played:true },   // Kaapverdië 1-2 Saudi-Arabië
    H6: { home:"0", away:"1", played:true },   // Uruguay 0-1 Spanje
    // Eindstand H: Spanje 9pt, Uruguay 6pt → door; Saudi-Arabië 3pt, Kaapverdië 0pt

    // ── GROEP I ──
    I1: { home:"2", away:"0", played:true },   // Frankrijk 2-0 Senegal
    I2: { home:"0", away:"4", played:true },   // Irak 0-4 Noorwegen (Haaland 3 goals)
    I3: { home:"3", away:"0", played:true },   // Frankrijk 3-0 Irak
    I4: { home:"2", away:"1", played:true },   // Noorwegen 2-1 Senegal
    I5: { home:"1", away:"2", played:true },   // Noorwegen 1-2 Frankrijk (Mbappé)
    I6: { home:"2", away:"0", played:true },   // Senegal 2-0 Irak
    // Eindstand I: Frankrijk 9pt, Noorwegen 6pt → door; Senegal 3pt, Irak 0pt

    // ── GROEP J ──
    J1: { home:"2", away:"0", played:true },   // Oostenrijk 2-0 Jordanië
    J2: { home:"3", away:"0", played:true },   // Argentinië 3-0 Algerije
    J3: { home:"2", away:"1", played:true },   // Argentinië 2-1 Oostenrijk
    J4: { home:"1", away:"1", played:true },   // Jordanië 1-1 Algerije
    J5: { home:"0", away:"2", played:true },   // Algerije 0-2 Oostenrijk
    J6: { home:"0", away:"3", played:true },   // Jordanië 0-3 Argentinië
    // Eindstand J: Argentinië 9pt, Oostenrijk 6pt → door; Algerije 1pt, Jordanië 1pt

    // ── GROEP K ──
    K1: { home:"3", away:"0", played:true },   // Portugal 3-0 DR Congo
    K2: { home:"0", away:"2", played:true },   // Oezbekistan 0-2 Colombia
    K3: { home:"2", away:"0", played:true },   // Portugal 2-0 Oezbekistan
    K4: { home:"2", away:"1", played:true },   // Colombia 2-1 DR Congo
    K5: { home:"1", away:"2", played:true },   // Colombia 1-2 Portugal (Ronaldo)
    K6: { home:"1", away:"2", played:true },   // DR Congo 1-2 Oezbekistan
    // Eindstand K: Portugal 9pt, Colombia 6pt → door; Oezbekistan 3pt, DR Congo 0pt

    // ── GROEP L ──
    L1: { home:"2", away:"0", played:true },   // Engeland 2-0 Kroatië
    L2: { home:"1", away:"1", played:true },   // Ghana 1-1 Panama
    L3: { home:"3", away:"1", played:true },   // Engeland 3-1 Ghana
    L4: { home:"0", away:"1", played:true },   // Panama 0-1 Kroatië
    L5: { home:"0", away:"2", played:true },   // Panama 0-2 Engeland
    L6: { home:"0", away:"2", played:true },   // Kroatië 0-2 Ghana
    // Eindstand L: Engeland 9pt, Ghana 4pt → door; Kroatië 3pt, Panama 0pt
  };

  // Match predictions for each user — varied styles and quality
  // Romy: optimistisch, houdt van underdog-keuzes
  const ROMY_MATCHES = {
    A1:{home:"1",away:"2"},A2:{home:"2",away:"1"},A3:{home:"0",away:"1"},A4:{home:"2",away:"2"},A5:{home:"1",away:"1"},A6:{home:"1",away:"2"},
    B1:{home:"1",away:"1"},B2:{home:"1",away:"2"},B3:{home:"2",away:"0"},B4:{home:"2",away:"1"},B5:{home:"1",away:"2"},B6:{home:"2",away:"0"},
    C1:{home:"1",away:"2"},C2:{home:"1",away:"1"},C3:{home:"1",away:"2"},C4:{home:"3",away:"1"},C5:{home:"1",away:"2"},C6:{home:"2",away:"1"},
    D1:{home:"0",away:"1"},D2:{home:"2",away:"1"},D3:{home:"1",away:"0"},D4:{home:"1",away:"1"},D5:{home:"2",away:"1"},D6:{home:"1",away:"0"},
    E1:{home:"2",away:"1"},E2:{home:"2",away:"1"},E3:{home:"1",away:"1"},E4:{home:"2",away:"0"},E5:{home:"0",away:"1"},E6:{home:"1",away:"2"},
    F1:{home:"2",away:"2"},F2:{home:"1",away:"0"},F3:{home:"1",away:"1"},F4:{home:"1",away:"2"},F5:{home:"1",away:"1"},F6:{home:"0",away:"1"},
    G1:{home:"1",away:"0"},G2:{home:"1",away:"1"},G3:{home:"2",away:"1"},G4:{home:"0",away:"1"},G5:{home:"1",away:"2"},G6:{home:"1",away:"3"},
    H1:{home:"2",away:"1"},H2:{home:"2",away:"1"},H3:{home:"1",away:"0"},H4:{home:"2",away:"0"},H5:{home:"0",away:"1"},H6:{home:"1",away:"2"},
    I1:{home:"1",away:"1"},I2:{home:"1",away:"3"},I3:{home:"2",away:"0"},I4:{home:"1",away:"1"},I5:{home:"2",away:"1"},I6:{home:"1",away:"0"},
    J1:{home:"0",away:"1"},J2:{home:"2",away:"1"},J3:{home:"1",away:"1"},J4:{home:"1",away:"2"},J5:{home:"0",away:"2"},J6:{home:"0",away:"2"},
    K1:{home:"2",away:"1"},K2:{home:"1",away:"1"},K3:{home:"1",away:"0"},K4:{home:"2",away:"1"},K5:{home:"2",away:"1"},K6:{home:"0",away:"1"},
    L1:{home:"1",away:"0"},L2:{home:"2",away:"1"},L3:{home:"2",away:"0"},L4:{home:"1",away:"1"},L5:{home:"0",away:"1"},L6:{home:"1",away:"2"},
  };
  // Tom: voetbalkenner, conservatief en realistisch
  const TOM_MATCHES = {
    A1:{home:"2",away:"0"},A2:{home:"0",away:"2"},A3:{home:"1",away:"0"},A4:{home:"1",away:"1"},A5:{home:"0",away:"2"},A6:{home:"1",away:"2"},
    B1:{home:"2",away:"1"},B2:{home:"0",away:"1"},B3:{home:"2",away:"0"},B4:{home:"3",away:"0"},B5:{home:"1",away:"2"},B6:{home:"1",away:"0"},
    C1:{home:"3",away:"0"},C2:{home:"0",away:"2"},C3:{home:"0",away:"1"},C4:{home:"5",away:"0"},C5:{home:"0",away:"3"},C6:{home:"3",away:"0"},
    D1:{home:"2",away:"0"},D2:{home:"0",away:"2"},D3:{home:"2",away:"0"},D4:{home:"1",away:"0"},D5:{home:"0",away:"2"},D6:{home:"1",away:"2"},
    E1:{home:"3",away:"0"},E2:{home:"2",away:"1"},E3:{home:"2",away:"0"},E4:{home:"2",away:"0"},E5:{home:"1",away:"1"},E6:{home:"0",away:"2"},
    F1:{home:"2",away:"0"},F2:{home:"2",away:"0"},F3:{home:"1",away:"1"},F4:{home:"0",away:"1"},F5:{home:"0",away:"2"},F6:{home:"0",away:"3"},
    G1:{home:"3",away:"0"},G2:{home:"1",away:"1"},G3:{home:"2",away:"0"},G4:{home:"0",away:"1"},G5:{home:"1",away:"1"},G6:{home:"0",away:"2"},
    H1:{home:"4",away:"0"},H2:{home:"0",away:"2"},H3:{home:"2",away:"0"},H4:{home:"3",away:"0"},H5:{home:"0",away:"1"},H6:{home:"0",away:"1"},
    I1:{home:"2",away:"0"},I2:{home:"0",away:"3"},I3:{home:"3",away:"0"},I4:{home:"2",away:"0"},I5:{home:"0",away:"2"},I6:{home:"2",away:"0"},
    J1:{home:"2",away:"0"},J2:{home:"3",away:"0"},J3:{home:"2",away:"0"},J4:{home:"0",away:"1"},J5:{home:"0",away:"3"},J6:{home:"0",away:"2"},
    K1:{home:"3",away:"0"},K2:{home:"0",away:"3"},K3:{home:"2",away:"0"},K4:{home:"2",away:"0"},K5:{home:"0",away:"2"},K6:{home:"0",away:"2"},
    L1:{home:"2",away:"0"},L2:{home:"1",away:"0"},L3:{home:"3",away:"0"},L4:{home:"0",away:"2"},L5:{home:"0",away:"2"},L6:{home:"0",away:"2"},
  };
  // Paula: casual, kiest veel gelijke spelen, beetje chaotisch
  const PAULA_MATCHES = {
    A1:{home:"1",away:"1"},A2:{home:"1",away:"1"},A3:{home:"1",away:"1"},A4:{home:"1",away:"1"},A5:{home:"2",away:"1"},A6:{home:"0",away:"1"},
    B1:{home:"1",away:"1"},B2:{home:"1",away:"1"},B3:{home:"1",away:"0"},B4:{home:"2",away:"0"},B5:{home:"0",away:"1"},B6:{home:"1",away:"1"},
    C1:{home:"1",away:"1"},C2:{home:"1",away:"2"},C3:{home:"1",away:"1"},C4:{home:"2",away:"1"},C5:{home:"1",away:"2"},C6:{home:"1",away:"0"},
    D1:{home:"1",away:"1"},D2:{home:"1",away:"1"},D3:{home:"1",away:"1"},D4:{home:"1",away:"0"},D5:{home:"1",away:"1"},D6:{home:"1",away:"1"},
    E1:{home:"2",away:"1"},E2:{home:"1",away:"1"},E3:{home:"1",away:"1"},E4:{home:"1",away:"0"},E5:{home:"1",away:"1"},E6:{home:"0",away:"1"},
    F1:{home:"1",away:"1"},F2:{home:"1",away:"1"},F3:{home:"2",away:"0"},F4:{home:"1",away:"1"},F5:{home:"1",away:"1"},F6:{home:"1",away:"2"},
    G1:{home:"2",away:"1"},G2:{home:"1",away:"1"},G3:{home:"1",away:"0"},G4:{home:"1",away:"1"},G5:{home:"1",away:"1"},G6:{home:"1",away:"3"},
    H1:{home:"1",away:"0"},H2:{home:"1",away:"1"},H3:{home:"1",away:"1"},H4:{home:"2",away:"1"},H5:{home:"1",away:"1"},H6:{home:"0",away:"1"},
    I1:{home:"1",away:"0"},I2:{home:"0",away:"1"},I3:{home:"1",away:"0"},I4:{home:"1",away:"1"},I5:{home:"1",away:"1"},I6:{home:"1",away:"0"},
    J1:{home:"1",away:"1"},J2:{home:"2",away:"0"},J3:{home:"1",away:"0"},J4:{home:"1",away:"1"},J5:{home:"0",away:"1"},J6:{home:"0",away:"1"},
    K1:{home:"2",away:"0"},K2:{home:"1",away:"1"},K3:{home:"1",away:"0"},K4:{home:"1",away:"1"},K5:{home:"1",away:"1"},K6:{home:"1",away:"2"},
    L1:{home:"1",away:"0"},L2:{home:"1",away:"1"},L3:{home:"2",away:"1"},L4:{home:"0",away:"1"},L5:{home:"0",away:"1"},L6:{home:"0",away:"2"},
  };
  // Sterre: NL-supporter, Nederlandse teams gaan altijd winnen
  const STERRE_MATCHES = {
    A1:{home:"2",away:"1"},A2:{home:"1",away:"2"},A3:{home:"1",away:"1"},A4:{home:"1",away:"1"},A5:{home:"1",away:"2"},A6:{home:"0",away:"2"},
    B1:{home:"1",away:"0"},B2:{home:"0",away:"2"},B3:{home:"1",away:"1"},B4:{home:"3",away:"0"},B5:{home:"1",away:"1"},B6:{home:"2",away:"0"},
    C1:{home:"2",away:"0"},C2:{home:"0",away:"2"},C3:{home:"0",away:"2"},C4:{home:"4",away:"0"},C5:{home:"0",away:"2"},C6:{home:"3",away:"0"},
    D1:{home:"1",away:"0"},D2:{home:"1",away:"1"},D3:{home:"0",away:"1"},D4:{home:"2",away:"0"},D5:{home:"1",away:"2"},D6:{home:"1",away:"1"},
    E1:{home:"3",away:"0"},E2:{home:"1",away:"2"},E3:{home:"2",away:"1"},E4:{home:"3",away:"0"},E5:{home:"1",away:"2"},E6:{home:"0",away:"3"},
    F1:{home:"3",away:"0"},F2:{home:"2",away:"0"},F3:{home:"3",away:"0"},F4:{home:"0",away:"1"},F5:{home:"0",away:"1"},F6:{home:"0",away:"4"},
    G1:{home:"3",away:"0"},G2:{home:"0",away:"2"},G3:{home:"3",away:"0"},G4:{home:"1",away:"1"},G5:{home:"1",away:"2"},G6:{home:"0",away:"3"},
    H1:{home:"2",away:"0"},H2:{home:"0",away:"2"},H3:{home:"2",away:"0"},H4:{home:"3",away:"0"},H5:{home:"1",away:"2"},H6:{home:"0",away:"2"},
    I1:{home:"1",away:"0"},I2:{home:"0",away:"3"},I3:{home:"2",away:"0"},I4:{home:"3",away:"0"},I5:{home:"1",away:"2"},I6:{home:"3",away:"0"},
    J1:{home:"1",away:"0"},J2:{home:"2",away:"0"},J3:{home:"2",away:"0"},J4:{home:"0",away:"1"},J5:{home:"0",away:"3"},J6:{home:"0",away:"3"},
    K1:{home:"2",away:"0"},K2:{home:"0",away:"2"},K3:{home:"2",away:"0"},K4:{home:"2",away:"0"},K5:{home:"0",away:"2"},K6:{home:"0",away:"2"},
    L1:{home:"1",away:"0"},L2:{home:"2",away:"0"},L3:{home:"2",away:"0"},L4:{home:"0",away:"2"},L5:{home:"0",away:"2"},L6:{home:"0",away:"2"},
  };

  return {
    users: [
      {
        id: ingmarId,
        name: "Ingmar",
        pwHash: hash("ingmar123"),
        pwPlain: "ingmar123",
        locked: false,
        predictions: {
          matches: INGMAR_MATCHES,
          champion: "Brazilië",
          topScorer: "Kylian Mbappé",
          topScorerCountry: "Frankrijk",
          nlStage: "Kwartfinale",
          surpriseTeam: "Nieuw-Zeeland",
          topOut: "België",
          // KO predictions — analytisch, kiest sterke teams maar durft verrassingen
          koWinners: {
            R32_1:"Zuid-Korea", R32_2:"Brazilië", R32_3:"Duitsland", R32_4:"België",
            R32_5:"Frankrijk", R32_6:"Portugal", R32_7:"Canada", R32_8:"VS",
            R32_9:"Nederland", R32_10:"Spanje", R32_11:"Argentinië", R32_12:"Engeland",
            R32_13:"Zwitserland", R32_14:"Ghana", R32_15:"Uruguay", R32_16:"Senegal",
            R16_1:"Brazilië", R16_2:"Duitsland", R16_3:"Frankrijk", R16_4:"VS",
            R16_5:"Nederland", R16_6:"Argentinië", R16_7:"Zwitserland", R16_8:"Uruguay",
            QF_1:"Brazilië", QF_2:"Frankrijk", QF_3:"Argentinië", QF_4:"Uruguay",
            SF_1:"Brazilië", SF_2:"Argentinië",
            "3RD":"Uruguay", FINAL:"Brazilië",
          },
          koScores: {
            R32_1:{home:"2",away:"1"}, R32_2:{home:"2",away:"0"}, R32_3:{home:"2",away:"0"}, R32_4:{home:"2",away:"1"},
            R32_5:{home:"2",away:"1"}, R32_6:{home:"2",away:"0"}, R32_7:{home:"1",away:"0"}, R32_8:{home:"1",away:"0"},
            R32_9:{home:"2",away:"1"}, R32_10:{home:"2",away:"0"}, R32_11:{home:"2",away:"1"}, R32_12:{home:"2",away:"0"},
            R32_13:{home:"1",away:"0"}, R32_14:{home:"1",away:"1"}, R32_15:{home:"2",away:"0"}, R32_16:{home:"1",away:"0"},
            R16_1:{home:"0",away:"2"}, R16_2:{home:"2",away:"1"}, R16_3:{home:"2",away:"1"}, R16_4:{home:"0",away:"1"},
            R16_5:{home:"2",away:"1"}, R16_6:{home:"1",away:"0"}, R16_7:{home:"2",away:"0"}, R16_8:{home:"2",away:"1"},
            QF_1:{home:"2",away:"1"}, QF_2:{home:"2",away:"1"}, QF_3:{home:"1",away:"0"}, QF_4:{home:"2",away:"1"},
            SF_1:{home:"2",away:"1"}, SF_2:{home:"1",away:"0"},
            "3RD":{home:"2",away:"1"}, FINAL:{home:"2",away:"1"},
          },
        },
      },
      {
        id: "u_romy_seed",
        name: "Romy",
        pwHash: hash("romy123"),
        pwPlain: "romy123",
        locked: false,
        predictions: {
          matches: ROMY_MATCHES,
          champion: "Portugal",
          topScorer: "Erling Haaland",
          topScorerCountry: "Noorwegen",
          nlStage: "Halve finale",
          surpriseTeam: "Schotland",
          topOut: "Engeland",
          // KO predictions — optimistisch, houdt van underdogs
          koWinners: {
            R32_1:"Paraguay", R32_2:"Zweden", R32_3:"Bosnië-Herzegovina", R32_4:"Japan",
            R32_5:"Ivoorkust", R32_6:"Portugal", R32_7:"Mexico", R32_8:"Marokko",
            R32_9:"Ecuador", R32_10:"Nieuw-Zeeland", R32_11:"Noorwegen", R32_12:"Colombia",
            R32_13:"Algerije", R32_14:"Ghana", R32_15:"Schotland", R32_16:"Iran",
            R16_1:"Zweden", R16_2:"Bosnië-Herzegovina", R16_3:"Ivoorkust", R16_4:"Marokko",
            R16_5:"Ecuador", R16_6:"Noorwegen", R16_7:"Algerije", R16_8:"Schotland",
            QF_1:"Zweden", QF_2:"Ivoorkust", QF_3:"Noorwegen", QF_4:"Schotland",
            SF_1:"Ivoorkust", SF_2:"Noorwegen",
            "3RD":"Zweden", FINAL:"Portugal",
          },
          koScores: {
            R32_1:{home:"0",away:"1"}, R32_2:{home:"1",away:"2"}, R32_3:{home:"1",away:"2"}, R32_4:{home:"1",away:"2"},
            R32_5:{home:"0",away:"1"}, R32_6:{home:"2",away:"1"}, R32_7:{home:"1",away:"2"}, R32_8:{home:"0",away:"1"},
            R32_9:{home:"1",away:"2"}, R32_10:{home:"0",away:"1"}, R32_11:{home:"1",away:"2"}, R32_12:{home:"1",away:"2"},
            R32_13:{home:"2",away:"1"}, R32_14:{home:"1",away:"2"}, R32_15:{home:"0",away:"1"}, R32_16:{home:"1",away:"2"},
            R16_1:{home:"2",away:"1"}, R16_2:{home:"1",away:"2"}, R16_3:{home:"1",away:"2"}, R16_4:{home:"1",away:"2"},
            R16_5:{home:"1",away:"2"}, R16_6:{home:"1",away:"2"}, R16_7:{home:"2",away:"1"}, R16_8:{home:"1",away:"2"},
            QF_1:{home:"2",away:"1"}, QF_2:{home:"1",away:"2"}, QF_3:{home:"1",away:"2"}, QF_4:{home:"1",away:"2"},
            SF_1:{home:"1",away:"2"}, SF_2:{home:"2",away:"1"},
            "3RD":{home:"2",away:"1"}, FINAL:{home:"1",away:"2"},
          },
        },
      },
      {
        id: "u_tom_seed",
        name: "Tom",
        pwHash: hash("tom123"),
        pwPlain: "tom123",
        locked: false,
        predictions: {
          matches: TOM_MATCHES,
          champion: "Argentinië",
          topScorer: "Lautaro Martínez",
          topScorerCountry: "Argentinië",
          nlStage: "Achtste finale",
          surpriseTeam: "Haïti",
          topOut: "Duitsland",
          // KO predictions — conservatief, altijd de topfavoriet
          koWinners: {
            R32_1:"Zuid-Korea", R32_2:"Brazilië", R32_3:"Duitsland", R32_4:"België",
            R32_5:"Frankrijk", R32_6:"Portugal", R32_7:"Canada", R32_8:"VS",
            R32_9:"Nederland", R32_10:"Spanje", R32_11:"Argentinië", R32_12:"Engeland",
            R32_13:"Zwitserland", R32_14:"Turkije", R32_15:"Uruguay", R32_16:"Senegal",
            R16_1:"Brazilië", R16_2:"België", R16_3:"Frankrijk", R16_4:"VS",
            R16_5:"Spanje", R16_6:"Argentinië", R16_7:"Zwitserland", R16_8:"Uruguay",
            QF_1:"Brazilië", QF_2:"Frankrijk", QF_3:"Argentinië", QF_4:"Uruguay",
            SF_1:"Brazilië", SF_2:"Argentinië",
            "3RD":"Uruguay", FINAL:"Argentinië",
          },
          koScores: {
            R32_1:{home:"2",away:"0"}, R32_2:{home:"3",away:"0"}, R32_3:{home:"3",away:"0"}, R32_4:{home:"3",away:"0"},
            R32_5:{home:"3",away:"0"}, R32_6:{home:"3",away:"0"}, R32_7:{home:"2",away:"0"}, R32_8:{home:"2",away:"0"},
            R32_9:{home:"2",away:"0"}, R32_10:{home:"3",away:"0"}, R32_11:{home:"3",away:"0"}, R32_12:{home:"2",away:"0"},
            R32_13:{home:"2",away:"0"}, R32_14:{home:"2",away:"0"}, R32_15:{home:"2",away:"0"}, R32_16:{home:"2",away:"0"},
            R16_1:{home:"0",away:"2"}, R16_2:{home:"2",away:"1"}, R16_3:{home:"2",away:"0"}, R16_4:{home:"0",away:"2"},
            R16_5:{home:"0",away:"2"}, R16_6:{home:"0",away:"2"}, R16_7:{home:"2",away:"0"}, R16_8:{home:"2",away:"0"},
            QF_1:{home:"2",away:"0"}, QF_2:{home:"2",away:"0"}, QF_3:{home:"0",away:"2"}, QF_4:{home:"2",away:"0"},
            SF_1:{home:"2",away:"0"}, SF_2:{home:"0",away:"2"},
            "3RD":{home:"2",away:"0"}, FINAL:{home:"0",away:"2"},
          },
        },
      },
      {
        id: "u_paula_seed",
        name: "Paula",
        pwHash: hash("paula123"),
        pwPlain: "paula123",
        locked: false,
        predictions: {
          matches: PAULA_MATCHES,
          champion: "Spanje",
          topScorer: "Lamine Yamal",
          topScorerCountry: "Spanje",
          nlStage: "Groepsfase (niet verder)",
          surpriseTeam: "Ghana",
          topOut: "Argentinië",
          // KO predictions — casual, kiest op gevoel
          koWinners: {
            R32_1:"Zuid-Korea", R32_2:"Brazilië", R32_3:"Duitsland", R32_4:"België",
            R32_5:"Frankrijk", R32_6:"Saudi-Arabië", R32_7:"Canada", R32_8:"VS",
            R32_9:"Nederland", R32_10:"Spanje", R32_11:"Argentinië", R32_12:"Colombia",
            R32_13:"Zwitserland", R32_14:"Turkije", R32_15:"Uruguay", R32_16:"Senegal",
            R16_1:"Zuid-Korea", R16_2:"Duitsland", R16_3:"Frankrijk", R16_4:"Canada",
            R16_5:"Spanje", R16_6:"Argentinië", R16_7:"Zwitserland", R16_8:"Uruguay",
            QF_1:"Duitsland", QF_2:"Frankrijk", QF_3:"Argentinië", QF_4:"Zwitserland",
            SF_1:"Duitsland", SF_2:"Zwitserland",
            "3RD":"Argentinië", FINAL:"Spanje",
          },
          koScores: {
            R32_1:{home:"1",away:"0"}, R32_2:{home:"1",away:"0"}, R32_3:{home:"2",away:"1"}, R32_4:{home:"1",away:"0"},
            R32_5:{home:"1",away:"0"}, R32_6:{home:"1",away:"2"}, R32_7:{home:"1",away:"0"}, R32_8:{home:"1",away:"0"},
            R32_9:{home:"1",away:"0"}, R32_10:{home:"1",away:"0"}, R32_11:{home:"1",away:"0"}, R32_12:{home:"1",away:"2"},
            R32_13:{home:"1",away:"0"}, R32_14:{home:"1",away:"0"}, R32_15:{home:"1",away:"0"}, R32_16:{home:"1",away:"0"},
            R16_1:{home:"1",away:"0"}, R16_2:{home:"1",away:"0"}, R16_3:{home:"1",away:"0"}, R16_4:{home:"0",away:"1"},
            R16_5:{home:"0",away:"1"}, R16_6:{home:"0",away:"1"}, R16_7:{home:"1",away:"0"}, R16_8:{home:"0",away:"1"},
            QF_1:{home:"1",away:"2"}, QF_2:{home:"2",away:"1"}, QF_3:{home:"1",away:"2"}, QF_4:{home:"1",away:"0"},
            SF_1:{home:"1",away:"2"}, SF_2:{home:"1",away:"0"},
            "3RD":{home:"1",away:"0"}, FINAL:{home:"1",away:"0"},
          },
        },
      },
      {
        id: "u_sterre_seed",
        name: "Sterre",
        pwHash: hash("sterre123"),
        pwPlain: "sterre123",
        locked: false,
        predictions: {
          matches: STERRE_MATCHES,
          champion: "Nederland",
          topScorer: "Cody Gakpo",
          topScorerCountry: "Nederland",
          nlStage: "🏆 Wereldkampioen",
          surpriseTeam: "Nieuw-Zeeland",
          topOut: "Brazilië",
          // KO predictions — oranjefan, Nederland wint alles
          koWinners: {
            R32_1:"Zuid-Korea", R32_2:"Brazilië", R32_3:"Duitsland", R32_4:"België",
            R32_5:"Frankrijk", R32_6:"Portugal", R32_7:"Canada", R32_8:"VS",
            R32_9:"Nederland", R32_10:"Spanje", R32_11:"Argentinië", R32_12:"Engeland",
            R32_13:"Zwitserland", R32_14:"Turkije", R32_15:"Uruguay", R32_16:"Senegal",
            R16_1:"Brazilië", R16_2:"Duitsland", R16_3:"Frankrijk", R16_4:"VS",
            R16_5:"Nederland", R16_6:"Argentinië", R16_7:"Zwitserland", R16_8:"Uruguay",
            QF_1:"Duitsland", QF_2:"VS", QF_3:"Nederland", QF_4:"Uruguay",
            SF_1:"Nederland", SF_2:"Uruguay",
            "3RD":"Duitsland", FINAL:"Nederland",
          },
          koScores: {
            R32_1:{home:"2",away:"0"}, R32_2:{home:"2",away:"0"}, R32_3:{home:"3",away:"0"}, R32_4:{home:"3",away:"0"},
            R32_5:{home:"2",away:"0"}, R32_6:{home:"2",away:"0"}, R32_7:{home:"1",away:"0"}, R32_8:{home:"1",away:"0"},
            R32_9:{home:"3",away:"0"}, R32_10:{home:"2",away:"0"}, R32_11:{home:"2",away:"0"}, R32_12:{home:"2",away:"0"},
            R32_13:{home:"2",away:"0"}, R32_14:{home:"2",away:"0"}, R32_15:{home:"2",away:"0"}, R32_16:{home:"2",away:"0"},
            R16_1:{home:"1",away:"2"}, R16_2:{home:"2",away:"1"}, R16_3:{home:"2",away:"0"}, R16_4:{home:"0",away:"2"},
            R16_5:{home:"3",away:"0"}, R16_6:{home:"0",away:"2"}, R16_7:{home:"2",away:"0"}, R16_8:{home:"2",away:"0"},
            QF_1:{home:"0",away:"2"}, QF_2:{home:"0",away:"2"}, QF_3:{home:"3",away:"0"}, QF_4:{home:"2",away:"0"},
            SF_1:{home:"3",away:"1"}, SF_2:{home:"2",away:"0"},
            "3RD":{home:"2",away:"1"}, FINAL:{home:"2",away:"1"},
          },
        },
      },
    ],
    results: SIM_RESULTS,
    koResults: {
      // ─── Zestiende finales (R32) ───────────────────────────────────────────
      // R32_1: Zuid-Korea vs Paraguay → Zuid-Korea wint
      R32_1:  { played:true, winner:"Zuid-Korea",    home90:"2", away90:"0" },
      // R32_2: Brazilië vs Zweden → Brazilië wint
      R32_2:  { played:true, winner:"Brazilië",      home90:"2", away90:"1" },
      // R32_3: Duitsland vs Bosnië-Herzegovina → Duitsland wint
      R32_3:  { played:true, winner:"Duitsland",     home90:"3", away90:"0" },
      // R32_4: België vs Japan → België wint
      R32_4:  { played:true, winner:"België",        home90:"2", away90:"1" },
      // R32_5: Frankrijk vs Ivoorkust → Frankrijk wint
      R32_5:  { played:true, winner:"Frankrijk",     home90:"2", away90:"0" },
      // R32_6: Portugal vs Saudi-Arabië → Portugal wint (Ronaldo scoort)
      R32_6:  { played:true, winner:"Portugal",      home90:"3", away90:"1" },
      // R32_7: Canada vs Mexico → Canada wint na verlenging
      R32_7:  { played:true, winner:"Canada",        home90:"1", away90:"1" },
      // R32_8: VS vs Marokko → VS wint
      R32_8:  { played:true, winner:"VS",            home90:"1", away90:"0" },
      // R32_9: Nederland vs Ecuador → Nederland wint (Gakpo scoort)
      R32_9:  { played:true, winner:"Nederland",     home90:"2", away90:"1" },
      // R32_10: Spanje vs Nieuw-Zeeland → Spanje wint
      R32_10: { played:true, winner:"Spanje",        home90:"3", away90:"0" },
      // R32_11: Argentinië vs Noorwegen → Argentinië wint (Messi scoort)
      R32_11: { played:true, winner:"Argentinië",    home90:"2", away90:"1" },
      // R32_12: Engeland vs Colombia → Engeland wint
      R32_12: { played:true, winner:"Engeland",      home90:"2", away90:"0" },
      // R32_13: Zwitserland vs Algerije → Zwitserland wint
      R32_13: { played:true, winner:"Zwitserland",   home90:"2", away90:"1" },
      // R32_14: Turkije vs Ghana → Turkije wint (verrassing!)
      R32_14: { played:true, winner:"Turkije",       home90:"1", away90:"0" },
      // R32_15: Uruguay vs Schotland → Uruguay wint
      R32_15: { played:true, winner:"Uruguay",       home90:"2", away90:"0" },
      // R32_16: Senegal vs Iran → Senegal wint
      R32_16: { played:true, winner:"Senegal",       home90:"1", away90:"0" },

      // ─── Achtste finales (R16) ─────────────────────────────────────────────
      // R16_1: Zuid-Korea vs Brazilië → Brazilië wint
      R16_1: { played:true, winner:"Brazilië",      home90:"1", away90:"2" },
      // R16_2: Duitsland vs België → Duitsland wint (thriller)
      R16_2: { played:true, winner:"Duitsland",     home90:"2", away90:"1" },
      // R16_3: Frankrijk vs Portugal → Frankrijk wint (Mbappé)
      R16_3: { played:true, winner:"Frankrijk",     home90:"2", away90:"1" },
      // R16_4: Canada vs VS → VS wint
      R16_4: { played:true, winner:"VS",            home90:"0", away90:"1" },
      // R16_5: Nederland vs Spanje → Nederland wint (verrassing!)
      R16_5: { played:true, winner:"Nederland",     home90:"1", away90:"0" },
      // R16_6: Argentinië vs Engeland → Argentinië wint na penalty's
      R16_6: { played:true, winner:"Argentinië",   home90:"1", away90:"1" },
      // R16_7: Zwitserland vs Turkije → Zwitserland wint
      R16_7: { played:true, winner:"Zwitserland",  home90:"2", away90:"0" },
      // R16_8: Uruguay vs Senegal → Uruguay wint
      R16_8: { played:true, winner:"Uruguay",      home90:"2", away90:"1" },

      // ─── Kwartfinales ──────────────────────────────────────────────────────
      // QF_1: Brazilië vs Duitsland → Brazilië wint
      QF_1: { played:true, winner:"Brazilië",      home90:"2", away90:"1" },
      // QF_2: Frankrijk vs VS → Frankrijk wint
      QF_2: { played:true, winner:"Frankrijk",     home90:"2", away90:"0" },
      // QF_3: Nederland vs Argentinië → Argentinië wint
      QF_3: { played:true, winner:"Argentinië",    home90:"1", away90:"2" },
      // QF_4: Zwitserland vs Uruguay → Uruguay wint (verrassing!)
      QF_4: { played:true, winner:"Uruguay",       home90:"1", away90:"2" },

      // ─── Halve finales ─────────────────────────────────────────────────────
      // SF_1: Brazilië vs Frankrijk → Brazilië wint (Vinicius Jr.)
      SF_1: { played:true, winner:"Brazilië",      home90:"2", away90:"1" },
      // SF_2: Argentinië vs Uruguay → Argentinië wint (Messi)
      SF_2: { played:true, winner:"Argentinië",    home90:"2", away90:"0" },

      // ─── 3e Plaats & Finale ────────────────────────────────────────────────
      // 3RD: Frankrijk vs Uruguay → Frankrijk wint
      "3RD":   { played:true, winner:"Frankrijk",  home90:"3", away90:"1" },
      // FINAL: Brazilië vs Argentinië → Argentinië wint! (Messi kroont zich)
      FINAL:   { played:true, winner:"Argentinië", home90:"1", away90:"2" },
    fase: "ko",
    groupFrozen: true,
    extraFrozen: true,
    koOpen: true,
    koFrozen: true,
  };
};


// ─── HELPERS ─────────────────────────────────────────────────────────────────

function deepSet(obj, path, value) {
  if (path.length === 1) { var r = {}; Object.keys(obj).forEach(function(k){r[k]=obj[k];}); r[path[0]]=value; return r; }
  var child = obj[path[0]] || {};
  var r2 = {}; Object.keys(obj).forEach(function(k){r2[k]=obj[k];}); r2[path[0]] = deepSet(child, path.slice(1), value); return r2;
}

function computeGroupStandings(matchScores) {
  var standings = {};
  Object.keys(GROUPS).forEach(function(g) {
    var teams = GROUPS[g];
    var stat = {};
    teams.forEach(function(t) { stat[t] = { pts:0, gp:0, gf:0, ga:0 }; });
    GROUP_MATCHES.filter(function(m) { return m.group === g; }).forEach(function(m) {
      var s = matchScores(m.id);
      if (!s || s.home === "" || s.home === undefined) return;
      var h = parseInt(s.home), a = parseInt(s.away);
      if (isNaN(h) || isNaN(a)) return;
      stat[m.home].gp++; stat[m.away].gp++;
      stat[m.home].gf += h; stat[m.home].ga += a;
      stat[m.away].gf += a; stat[m.away].ga += h;
      if (h > a) { stat[m.home].pts += 3; }
      else if (h === a) { stat[m.home].pts++; stat[m.away].pts++; }
      else { stat[m.away].pts += 3; }
    });
    var sorted = teams.slice().sort(function(a, b) {
      return (stat[b].pts - stat[a].pts) || ((stat[b].gf-stat[b].ga) - (stat[a].gf-stat[a].ga)) || (stat[b].gf - stat[a].gf);
    });
    standings[g] = {
      winner: sorted[0], runnerUp: sorted[1],
      table: sorted.map(function(t) { return { team:t, pts:stat[t].pts, gp:stat[t].gp, gf:stat[t].gf, ga:stat[t].ga, gd:stat[t].gf-stat[t].ga }; })
    };
  });
  return standings;
}

function deriveGroupStandings(pred) {
  return computeGroupStandings(function(id) { return pred && pred.matches && pred.matches[id]; });
}

function deriveGroupStandingsFromResults(results) {
  return computeGroupStandings(function(id) {
    var r = results[id]; return r && r.played ? r : null;
  });
}

function groupsAllFilled(matchScores) {
  var result = {};
  Object.keys(GROUPS).forEach(function(g) {
    var matches = GROUP_MATCHES.filter(function(m) { return m.group === g; });
    result[g] = matches.every(function(m) {
      var s = matchScores(m.id);
      return s != null && s.home !== "" && s.home !== undefined;
    });
  });
  return result;
}

function slotLabel(slot) {
  if (!slot) return "?";
  if (/^1[A-L]$/.test(slot)) return "Nr. 1 Groep " + slot[1];
  if (/^2[A-L]$/.test(slot)) return "Nr. 2 Groep " + slot[1];
  if (/^N3/.test(slot)) return "Beste nr. 3";
  if (slot.charAt(0) === "W") {
    var m = KO_STRUCTURE.filter(function(x) { return x.id === slot.slice(1); })[0];
    return m ? "Winnaar " + m.label : slot;
  }
  if (slot.charAt(0) === "L") {
    var m2 = KO_STRUCTURE.filter(function(x) { return x.id === slot.slice(1); })[0];
    return m2 ? "Verliezer " + m2.label : slot;
  }
  return slot;
}

function resolveGroupSlot(slot, standings, allGroupsComplete) {
  var rank = slot[0]; var g = slot[1];
  var s = standings[g];
  if (!s) return null;
  var team = rank === "1" ? s.winner : s.runnerUp;
  return allGroupsComplete[g] ? team : null;
}

function resolveSlotRich(slot, ctx) {
  var adminStandings = ctx.adminStandings;
  var adminComplete = ctx.adminComplete;
  var userKoWinners = ctx.userKoWinners;
  var adminKoResults = ctx.adminKoResults;

  if (!slot) return { type: "label", label: "?" };

  if (/^[12][A-L]$/.test(slot)) {
    var g = slot[1];
    var adminTeam = adminStandings ? resolveGroupSlot(slot, adminStandings, adminComplete) : null;
    if (adminTeam) return { type: "team", team: adminTeam };
    return { type: "label", label: slotLabel(slot) };
  }

  if (/^N3/.test(slot)) {
    if (adminComplete && Object.keys(adminComplete).every(function(k) { return adminComplete[k]; })) {
      // Collect all nr3 teams and their stats
      var thirds = [];
      if (adminStandings) {
        Object.keys(GROUPS).forEach(function(g2) {
          if (!adminComplete[g2]) return;
          var table = adminStandings[g2] && adminStandings[g2].table;
          if (table && table.length >= 3) {
            thirds.push({ team: table[2].team, group: g2, pts: table[2].pts, gd: table[2].gd, gf: table[2].gf });
          }
        });
        thirds.sort(function(a, b) { return (b.pts-a.pts)||(b.gd-a.gd)||(b.gf-a.gf); });
      }
      // Top 8 nr3 teams qualify
      var top8 = thirds.slice(0, 8);
      // Map each N3 slot to the eligible groups it can pull from
      var slotGroupMap = {
        "N3BCDI":  ["B","C","D","I"],
        "N3ABCD":  ["A","B","C","D"],
        "N3ABFG":  ["A","B","F","G"],
        "N3EFGL":  ["E","F","G","L"],
        "N3HJKL":  ["H","J","K","L"],
        "N3ABCE":  ["A","B","C","E"],
        "N3IJKL":  ["I","J","K","L"],
        "N3EFGH":  ["E","F","G","H"],
      };
      var eligible = slotGroupMap[slot];
      if (eligible) {
        // Find the best qualified nr3 team from the eligible groups
        var match2 = null;
        for (var qi = 0; qi < top8.length; qi++) {
          if (eligible.indexOf(top8[qi].group) >= 0) { match2 = top8[qi]; break; }
        }
        if (match2) return { type: "team", team: match2.team };
      }
    }
    return { type: "label", label: "Beste nr. 3" };
  }

  if (slot.charAt(0) === "W") {
    var matchId = slot.slice(1);
    if (adminKoResults && adminKoResults[matchId] && adminKoResults[matchId].played) {
      return { type: "team", team: adminKoResults[matchId].winner };
    }
    var userPick = userKoWinners && userKoWinners[matchId];
    if (userPick) return { type: "team", team: userPick };
    var koMatch = KO_STRUCTURE.filter(function(m) { return m.id === matchId; })[0];
    if (koMatch) {
      var hd = resolveSlotRich(koMatch.homeSlot, ctx);
      var ad = resolveSlotRich(koMatch.awaySlot, ctx);
      if (hd.type === "team" && ad.type === "team")
        return { type: "two", teams: [hd.team, ad.team] };
    }
    return { type: "label", label: slotLabel(slot) };
  }

  if (slot.charAt(0) === "L") {
    var loserMatchId = slot.slice(1); // e.g. "SF_1"
    var srcMatch = KO_STRUCTURE.filter(function(km) { return km.id === loserMatchId; })[0];
    var hTeam = null; var aTeam = null;
    if (srcMatch) {
      var hDesc = resolveSlotRich(srcMatch.homeSlot, ctx);
      var aDesc = resolveSlotRich(srcMatch.awaySlot, ctx);
      hTeam = hDesc && hDesc.type === "team" ? hDesc.team : null;
      aTeam = aDesc && aDesc.type === "team" ? aDesc.team : null;
    }
    // First try admin result
    if (adminKoResults && adminKoResults[loserMatchId] && adminKoResults[loserMatchId].played) {
      var winner = adminKoResults[loserMatchId].winner;
      var loser = (winner === hTeam && aTeam) ? aTeam : (winner === aTeam && hTeam) ? hTeam : null;
      if (loser) return { type: "team", team: loser };
    }
    // Fall back to user's predicted winner to derive predicted loser
    var userWinner = userKoWinners && userKoWinners[loserMatchId];
    if (userWinner) {
      var predLoser = (userWinner === hTeam && aTeam) ? aTeam : (userWinner === aTeam && hTeam) ? hTeam : null;
      if (predLoser) return { type: "team", team: predLoser };
    }
    return { type: "label", label: slotLabel(slot) };
  }
  return { type: "label", label: slot };
}

function buildRichKOSlots(pred, results, koResults) {
  var adminStandings = deriveGroupStandingsFromResults(results);
  var adminComplete = groupsAllFilled(function(id) { var r = results[id]; return r && r.played ? r : null; });
  var koWinners = {};
  KO_STRUCTURE.forEach(function(km) {
    var winner = koResults[km.id] && koResults[km.id].winner;
    if (winner) koWinners[km.id] = winner;
  });
  if (pred && pred.koWinners) {
    Object.keys(pred.koWinners).forEach(function(k) { if (pred.koWinners[k]) koWinners[k] = pred.koWinners[k]; });
  }
  var ctx = { adminStandings: adminStandings, adminComplete: adminComplete, userKoWinners: koWinners, adminKoResults: koResults };
  var slots = {};
  KO_STRUCTURE.forEach(function(m) {
    slots[m.id] = { home: resolveSlotRich(m.homeSlot, ctx), away: resolveSlotRich(m.awaySlot, ctx) };
  });
  return slots;
}

function resolveSlot(slot, pred, koWinners) {
  if (!slot) return null;
  if (/^[12][A-L]$/.test(slot)) {
    var rank = slot[0]; var g = slot[1];
    var s = deriveGroupStandings(pred);
    return rank === "1" ? s[g] && s[g].winner : s[g] && s[g].runnerUp;
  }
  if (/^N3/.test(slot)) return null;
  if (slot.charAt(0) === "W") return koWinners && koWinners[slot.slice(1)];
  return null;
}

function buildKOSlots(pred) {
  var koWinners = (pred && pred.koWinners) || {};
  var slots = {};
  KO_STRUCTURE.forEach(function(m) {
    slots[m.id] = { home: resolveSlot(m.homeSlot, pred, koWinners), away: resolveSlot(m.awaySlot, pred, koWinners) };
  });
  return slots;
}

function deriveTopOuts(results) {
  var actualS = deriveGroupStandingsFromResults(results);
  var eliminated = [];
  TOP_TEAMS.forEach(function(team) {
    var g = Object.keys(GROUPS).filter(function(g2) { return GROUPS[g2].indexOf(team) >= 0; })[0];
    if (!g) return;
    var allPlayed = GROUP_MATCHES.filter(function(m) { return m.group === g; }).every(function(m) { return results[m.id] && results[m.id].played; });
    if (!allPlayed) return;
    var top2 = [actualS[g] && actualS[g].winner, actualS[g] && actualS[g].runnerUp].filter(Boolean);
    if (top2.length === 2 && top2.indexOf(team) === -1) eliminated.push(team);
  });
  return eliminated;
}

var KO_ROUND_ORDER = ["r32","r16","qf","sf","3rd","final"];
var KO_ROUND_TO_STAGE = { r32:"Zestiende finale", r16:"Achtste finale", qf:"Kwartfinale", sf:"Halve finale", "3rd":"3e Plaats", final:"🏆 Wereldkampioen" };

function deriveSurpriseStage(team, koResults) {
  if (!team) return null;
  var furthestIdx = -1;
  KO_STRUCTURE.forEach(function(m) {
    var r = koResults[m.id];
    if (!r || !r.played) return;
    var roundIdx = KO_ROUND_ORDER.indexOf(m.round);
    if (r.winner === team && roundIdx > furthestIdx) furthestIdx = roundIdx;
    var hId = m.homeSlot && m.homeSlot.charAt(0) === "W" ? m.homeSlot.slice(1) : null;
    var aId = m.awaySlot && m.awaySlot.charAt(0) === "W" ? m.awaySlot.slice(1) : null;
    var hw = hId && koResults[hId] && koResults[hId].winner;
    var aw = aId && koResults[aId] && koResults[aId].winner;
    if ((hw === team || aw === team) && roundIdx > furthestIdx) furthestIdx = roundIdx;
  });
  return furthestIdx >= 0 ? KO_ROUND_TO_STAGE[KO_ROUND_ORDER[furthestIdx]] : null;
}

function calcGroupMatchPts(pred, result) {
  if (!result || !result.played || !pred || pred.home === undefined || pred.home === "") return null;
  var rH = parseInt(result.home), rA = parseInt(result.away);
  var pH = parseInt(pred.home), pA = parseInt(pred.away);
  if (pH === rH && pA === rA) return { pts: PTS_GROUP.exact, label: "exact" };
  var rDiff = rH - rA, pDiff = pH - pA;
  if (rDiff === pDiff) return { pts: PTS_GROUP.diff, label: "diff" };
  if ((pDiff > 0) === (rDiff > 0) && rDiff !== 0) return { pts: PTS_GROUP.winner, label: "winner" };
  return { pts: 0, label: "miss" };
}

function calcPoints(user, results, koResults) {
  var p = user.predictions || {};
  var pts = 0;
  GROUP_MATCHES.forEach(function(m) {
    var r = results[m.id];
    var res = calcGroupMatchPts(p.matches && p.matches[m.id], r);
    if (res) pts += res.pts;
  });
  var predS = deriveGroupStandings(p);
  var actualS = deriveGroupStandingsFromResults(results);
  Object.keys(GROUPS).forEach(function(g) {
    var aS = actualS[g];
    var allPlayed = GROUP_MATCHES.filter(function(m) { return m.group === g; }).every(function(m) { return results[m.id] && results[m.id].played; });
    if (!allPlayed || !aS || !aS.winner || !aS.runnerUp) return;
    var a1 = aS.winner, a2 = aS.runnerUp;
    var p1 = predS[g] && predS[g].winner, p2 = predS[g] && predS[g].runnerUp;
    var top2 = [a1, a2];
    if (p1 && top2.indexOf(p1) >= 0) { pts += PTS_STANDING.qualified; if (p1 === a1) pts += PTS_STANDING.qualifiedCorrectPos - PTS_STANDING.qualified; }
    if (p2 && top2.indexOf(p2) >= 0) { pts += PTS_STANDING.qualified; if (p2 === a2) pts += PTS_STANDING.qualifiedCorrectPos - PTS_STANDING.qualified; }
  });
  KO_STRUCTURE.forEach(function(m) {
    var r = koResults[m.id]; if (!r || !r.played) return;
    var schema = PTS_KO[m.round] || PTS_KO.r16;
    var pw = p.koWinners && p.koWinners[m.id];
    var ps = p.koScores && p.koScores[m.id];
    if (pw && r.winner === pw) pts += schema.winner;
    if (ps && ps.home !== undefined && r.home90 !== undefined && parseInt(ps.home) === parseInt(r.home90) && parseInt(ps.away) === parseInt(r.away90)) pts += schema.exact;
  });
  if (p.champion && koResults["FINAL"] && koResults["FINAL"].played && p.champion === koResults["FINAL"].winner) pts += PTS_EXTRA.champion;
  if (p.topScorer && results["TOP_SCORER"] && p.topScorer === results["TOP_SCORER"]) pts += PTS_EXTRA.topScorer;
  if (p.nlStage && results["NL_STAGE"] && p.nlStage === results["NL_STAGE"]) pts += PTS_EXTRA.nlStage;
  if (p.surpriseTeam) { var ss = deriveSurpriseStage(p.surpriseTeam, koResults); if (ss) pts += PTS_SURPRISE[ss] || 0; }
  if (p.topOut) { var outs = deriveTopOuts(results); if (outs.indexOf(p.topOut) >= 0) pts += PTS_TOP_OUT; }
  return pts;
}

export {
  load,
  persist,
  hash,
  blank,
  deepSet,
  computeGroupStandings,
  deriveGroupStandings,
  deriveGroupStandingsFromResults,
  groupsAllFilled,
  slotLabel,
  resolveGroupSlot,
  resolveSlotRich,
  buildRichKOSlots,
  resolveSlot,
  buildKOSlots,
  deriveTopOuts,
  deriveSurpriseStage,
  calcGroupMatchPts,
  calcPoints,
  fmtDate,
  fmtTime,
  fmtDateTime
};
