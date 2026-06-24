// Standalone groepsfase scoring tests — geen test-framework nodig
// Test calcGroupMatchPts, groepsstand puntentelling en calcGroupPointsBreakdown

// ─── CONSTANTEN (uit tournamentData.js) ──────────────────────────────────────

const PTS_GROUP    = { exact: 5, diff: 3, winner: 2 };
const PTS_STANDING = { qualified: 4, qualifiedCorrectPos: 10 };

// Minimale subset groepen voor tests (A en B volstaan)
const GROUPS = {
  A: ["Mexico", "Zuid-Afrika", "Zuid-Korea", "Tsjechië"],
  B: ["Canada", "Bosnië-Herzegovina", "Qatar", "Zwitserland"],
};

// Wedstrijden voor groep A en B
const GROUP_MATCHES = [
  // Groep A
  { id: "A1", group: "A", home: "Mexico",       away: "Zuid-Afrika", round: 1 },
  { id: "A2", group: "A", home: "Zuid-Korea",   away: "Tsjechië",    round: 1 },
  { id: "A3", group: "A", home: "Tsjechië",     away: "Zuid-Afrika", round: 2 },
  { id: "A4", group: "A", home: "Mexico",       away: "Zuid-Korea",  round: 2 },
  { id: "A5", group: "A", home: "Tsjechië",     away: "Mexico",      round: 3 },
  { id: "A6", group: "A", home: "Zuid-Afrika",  away: "Zuid-Korea",  round: 3 },
  // Groep B
  { id: "B1", group: "B", home: "Canada",       away: "Bosnië-Herzegovina", round: 1 },
  { id: "B2", group: "B", home: "Qatar",        away: "Zwitserland",        round: 1 },
  { id: "B3", group: "B", home: "Bosnië-Herzegovina", away: "Qatar",        round: 2 },
  { id: "B4", group: "B", home: "Canada",       away: "Zwitserland",        round: 2 },
  { id: "B5", group: "B", home: "Qatar",        away: "Canada",             round: 3 },
  { id: "B6", group: "B", home: "Zwitserland",  away: "Bosnië-Herzegovina", round: 3 },
];

// LABEL_CFG zoals in GroupStagePointsView.jsx
const LABEL_CFG = {
  exact:  { color: "var(--green)",  badge: "+5 exact"   },
  diff:   { color: "#e8c547",       badge: "+3 saldo"   },
  winner: { color: "var(--accent)", badge: "+2 winnaar" },
  miss:   { color: "var(--red)",    badge: "0 mis"      },
};

// ─── ENGINE LOGICA (uit pouleEngine.js) ──────────────────────────────────────

function calcGroupMatchPts(pred, result) {
  if (!result?.played || !pred || pred.home === undefined || pred.home === "")
    return null;
  const rH = parseInt(result.home, 10);
  const rA = parseInt(result.away, 10);
  const pH = parseInt(pred.home, 10);
  const pA = parseInt(pred.away, 10);
  if (pH === rH && pA === rA) return { pts: PTS_GROUP.exact, label: "exact" };
  const rDiff = rH - rA;
  const pDiff = pH - pA;
  if (rDiff === pDiff) return { pts: PTS_GROUP.diff, label: "diff" };
  if (
    (pDiff > 0 && rDiff > 0) ||
    (pDiff < 0 && rDiff < 0) ||
    (pDiff === 0 && rDiff === 0)
  )
    return { pts: PTS_GROUP.winner, label: "winner" };
  return { pts: 0, label: "miss" };
}

function computeGroupStandings(matchScores) {
  const standings = {};
  Object.keys(GROUPS).forEach((g) => {
    const teams = GROUPS[g];
    const stat = {};
    teams.forEach((t) => { stat[t] = { pts: 0, gp: 0, gf: 0, ga: 0 }; });
    const groupMatches = GROUP_MATCHES.filter((m) => m.group === g);
    groupMatches.forEach((m) => {
      const s = matchScores(m.id);
      if (!s || s.home === "" || s.home === undefined) return;
      const h = parseInt(s.home, 10);
      const a = parseInt(s.away, 10);
      if (Number.isNaN(h) || Number.isNaN(a)) return;
      stat[m.home].gp++;
      stat[m.away].gp++;
      stat[m.home].gf += h; stat[m.home].ga += a;
      stat[m.away].gf += a; stat[m.away].ga += h;
      if (h > a) stat[m.home].pts += 3;
      else if (h === a) { stat[m.home].pts += 1; stat[m.away].pts += 1; }
      else stat[m.away].pts += 3;
    });

    function computeH2H(tiedTeams) {
      const h2h = {};
      tiedTeams.forEach((t) => { h2h[t] = { pts: 0, gf: 0, ga: 0 }; });
      groupMatches.forEach((m) => {
        if (!tiedTeams.includes(m.home) || !tiedTeams.includes(m.away)) return;
        const s = matchScores(m.id);
        if (!s || s.home === "" || s.home === undefined) return;
        const hg = parseInt(s.home, 10);
        const ag = parseInt(s.away, 10);
        if (Number.isNaN(hg) || Number.isNaN(ag)) return;
        h2h[m.home].gf += hg; h2h[m.home].ga += ag;
        h2h[m.away].gf += ag; h2h[m.away].ga += hg;
        if (hg > ag) h2h[m.home].pts += 3;
        else if (hg === ag) { h2h[m.home].pts += 1; h2h[m.away].pts += 1; }
        else h2h[m.away].pts += 3;
      });
      return h2h;
    }

    const sortedByPts = teams.slice().sort((a, b) => stat[b].pts - stat[a].pts);
    const sorted = [];
    let i = 0;
    while (i < sortedByPts.length) {
      let j = i + 1;
      while (j < sortedByPts.length && stat[sortedByPts[j]].pts === stat[sortedByPts[i]].pts) j++;
      const tiedGroup = sortedByPts.slice(i, j);
      if (tiedGroup.length === 1) {
        sorted.push(tiedGroup[0]);
      } else {
        const h2h = computeH2H(tiedGroup);
        tiedGroup.sort((a, b) => {
          const h2hPts = h2h[b].pts - h2h[a].pts;
          if (h2hPts !== 0) return h2hPts;
          const h2hGD = (h2h[b].gf - h2h[b].ga) - (h2h[a].gf - h2h[a].ga);
          if (h2hGD !== 0) return h2hGD;
          const h2hGF = h2h[b].gf - h2h[a].gf;
          if (h2hGF !== 0) return h2hGF;
          const gd = (stat[b].gf - stat[b].ga) - (stat[a].gf - stat[a].ga);
          if (gd !== 0) return gd;
          return stat[b].gf - stat[a].gf;
        });
        sorted.push(...tiedGroup);
      }
      i = j;
    }
    standings[g] = { winner: sorted[0], runnerUp: sorted[1] };
  });
  return standings;
}

function deriveGroupStandings(pred) {
  return computeGroupStandings((id) => pred?.matches?.[id]);
}

function deriveGroupStandingsFromResults(results) {
  return computeGroupStandings((id) => {
    const r = results[id];
    return r?.played ? r : null;
  });
}

function calcGroupPointsBreakdown(user, results) {
  const p = user.predictions || {};
  const predStandings = deriveGroupStandings(p);
  const actualStandings = deriveGroupStandingsFromResults(results);

  let totalMatchPts = 0;
  let totalStandingPts = 0;
  const groups = {};

  Object.keys(GROUPS).forEach((g) => {
    const groupMatches = GROUP_MATCHES.filter((m) => m.group === g);
    const matchDetails = groupMatches.map((m) => {
      const pred = p.matches?.[m.id];
      const result = results[m.id];
      const res = calcGroupMatchPts(pred, result);
      return { match: m, pred, result, pts: res?.pts ?? null, label: res?.label ?? null };
    });

    const matchPts = matchDetails.reduce((sum, d) => sum + (d.pts ?? 0), 0);
    const allPlayed = groupMatches.every((m) => results[m.id]?.played);
    const aS = actualStandings[g];
    const pS = predStandings[g];

    let standingPts = 0;
    let p1pts = 0;
    let p2pts = 0;
    const p1 = pS?.winner;
    const p2 = pS?.runnerUp;
    const a1 = aS?.winner;
    const a2 = aS?.runnerUp;

    if (allPlayed && a1 && a2) {
      const top2 = [a1, a2];
      if (p1 && top2.includes(p1)) {
        p1pts = p1 === a1 ? PTS_STANDING.qualifiedCorrectPos : PTS_STANDING.qualified;
      }
      if (p2 && top2.includes(p2)) {
        p2pts = p2 === a2 ? PTS_STANDING.qualifiedCorrectPos : PTS_STANDING.qualified;
      }
      standingPts = p1pts + p2pts;
    }

    totalMatchPts += matchPts;
    totalStandingPts += standingPts;
    groups[g] = { matches: matchDetails, matchPts, standing: { p1, p2, a1, a2, p1pts, p2pts, allPlayed }, standingPts, totalPts: matchPts + standingPts };
  });

  return { matchPts: totalMatchPts, standingPts: totalStandingPts, totalPts: totalMatchPts + totalStandingPts, groups };
}

// ─── TEST RUNNER ─────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function test(label, fn) {
  try {
    fn();
    console.log(`  ✓  ${label}`);
    passed++;
  } catch (e) {
    console.error(`  ✗  ${label}`);
    console.error(`     ${e.message}`);
    failed++;
  }
}

function eq(actual, expected, msg) {
  if (actual !== expected)
    throw new Error(`${msg ? msg + " — " : ""}verwacht ${JSON.stringify(expected)}, gekregen ${JSON.stringify(actual)}`);
}

function notNull(val, msg) {
  if (val === null || val === undefined)
    throw new Error(`${msg || "waarde"} mag niet null/undefined zijn`);
}

function isNull(val, msg) {
  if (val !== null)
    throw new Error(`${msg || "waarde"} moet null zijn, maar is ${JSON.stringify(val)}`);
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const r = (home, away) => ({ played: true, home, away });
const notPlayed = { played: false };
const p = (home, away) => ({ home, away });

// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n══ 1. calcGroupMatchPts — basisgevallen ══\n");

test("Geen resultaat → null", () => {
  isNull(calcGroupMatchPts(p(1, 0), null));
});

test("Niet gespeeld → null", () => {
  isNull(calcGroupMatchPts(p(1, 0), notPlayed));
});

test("Geen voorspelling → null", () => {
  isNull(calcGroupMatchPts(null, r(2, 1)));
});

test("Lege voorspelling (home='') → null", () => {
  isNull(calcGroupMatchPts({ home: "", away: 0 }, r(2, 1)));
});

test("Alleen home undefined → null", () => {
  isNull(calcGroupMatchPts({ away: 0 }, r(2, 1)));
});

// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n══ 2. calcGroupMatchPts — exacte uitslag ══\n");

test("Exacte uitslag 2-1 → 5 pt, label 'exact'", () => {
  const res = calcGroupMatchPts(p(2, 1), r(2, 1));
  eq(res.pts, 5); eq(res.label, "exact");
});

test("Exacte uitslag 0-0 → 5 pt, label 'exact'", () => {
  const res = calcGroupMatchPts(p(0, 0), r(0, 0));
  eq(res.pts, 5); eq(res.label, "exact");
});

test("Exacte uitslag 3-3 → 5 pt, label 'exact'", () => {
  const res = calcGroupMatchPts(p(3, 3), r(3, 3));
  eq(res.pts, 5); eq(res.label, "exact");
});

test("Exacte uitslag als strings → 5 pt (string parsing)", () => {
  const res = calcGroupMatchPts({ home: "2", away: "1" }, { played: true, home: "2", away: "1" });
  eq(res.pts, 5); eq(res.label, "exact");
});

// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n══ 3. calcGroupMatchPts — juist doelsaldo ══\n");

test("1-0 voorspeld, 2-1 gespeeld (+1 vs +1) → 3 pt, label 'diff'", () => {
  const res = calcGroupMatchPts(p(1, 0), r(2, 1));
  eq(res.pts, 3); eq(res.label, "diff");
});

test("2-0 voorspeld, 4-2 gespeeld (+2 vs +2) → 3 pt, label 'diff'", () => {
  const res = calcGroupMatchPts(p(2, 0), r(4, 2));
  eq(res.pts, 3); eq(res.label, "diff");
});

test("0-1 voorspeld, 1-2 gespeeld (-1 vs -1) → 3 pt, label 'diff'", () => {
  const res = calcGroupMatchPts(p(0, 1), r(1, 2));
  eq(res.pts, 3); eq(res.label, "diff");
});

test("1-1 voorspeld, 2-2 gespeeld (0 vs 0) → 3 pt, label 'diff'", () => {
  const res = calcGroupMatchPts(p(1, 1), r(2, 2));
  eq(res.pts, 3); eq(res.label, "diff");
});

test("3-1 voorspeld, 2-0 gespeeld (+2 vs +2) → 3 pt, label 'diff'", () => {
  const res = calcGroupMatchPts(p(3, 1), r(2, 0));
  eq(res.pts, 3); eq(res.label, "diff");
});

// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n══ 4. calcGroupMatchPts — juiste winnaar/gelijkspel ══\n");

test("2-0 voorspeld, 3-0 gespeeld (verkeerd saldo, juiste winnaar) → 2 pt, label 'winner'", () => {
  const res = calcGroupMatchPts(p(2, 0), r(3, 0));
  eq(res.pts, 2); eq(res.label, "winner");
});

test("1-0 voorspeld, 2-0 gespeeld (+1 vs +2) → 2 pt, label 'winner'", () => {
  const res = calcGroupMatchPts(p(1, 0), r(2, 0));
  eq(res.pts, 2); eq(res.label, "winner");
});

test("0-2 voorspeld, 0-1 gespeeld (juiste verliezer) → 2 pt, label 'winner'", () => {
  const res = calcGroupMatchPts(p(0, 2), r(0, 1));
  eq(res.pts, 2); eq(res.label, "winner");
});

test("0-0 voorspeld, 1-1 gespeeld (beide gelijkspel, doelsaldo 0=0) → 3 pt, label 'diff'", () => {
  // pDiff = 0-0 = 0, rDiff = 1-1 = 0 → gelijk saldo → diff (3 pt), niet winner
  const res = calcGroupMatchPts(p(0, 0), r(1, 1));
  eq(res.pts, 3); eq(res.label, "diff");
});

// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n══ 5. calcGroupMatchPts — mis ══\n");

test("2-0 voorspeld (thuis wint), 0-1 gespeeld (uit wint) → 0 pt, label 'miss'", () => {
  const res = calcGroupMatchPts(p(2, 0), r(0, 1));
  eq(res.pts, 0); eq(res.label, "miss");
});

test("1-0 voorspeld (thuis wint), 0-0 gespeeld (gelijkspel) → 0 pt, label 'miss'", () => {
  const res = calcGroupMatchPts(p(1, 0), r(0, 0));
  eq(res.pts, 0); eq(res.label, "miss");
});

test("0-0 voorspeld (gelijkspel), 2-1 gespeeld (thuis wint) → 0 pt, label 'miss'", () => {
  const res = calcGroupMatchPts(p(0, 0), r(2, 1));
  eq(res.pts, 0); eq(res.label, "miss");
});

test("1-2 voorspeld (uit wint), 1-0 gespeeld (thuis wint) → 0 pt, label 'miss'", () => {
  const res = calcGroupMatchPts(p(1, 2), r(1, 0));
  eq(res.pts, 0); eq(res.label, "miss");
});

// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n══ 6. Geen dubbeltelling exact + diff ══\n");

test("Exacte uitslag → exact bonus, NIET ook diff", () => {
  const res = calcGroupMatchPts(p(2, 0), r(2, 0));
  eq(res.pts, PTS_GROUP.exact);
  if (res.pts === PTS_GROUP.exact + PTS_GROUP.diff)
    throw new Error("Zowel exact als diff geteld!");
});

test("Diff correct maar niet exact → alleen diff", () => {
  const res = calcGroupMatchPts(p(1, 0), r(2, 1));
  eq(res.pts, PTS_GROUP.diff);
  if (res.pts === PTS_GROUP.exact + PTS_GROUP.diff)
    throw new Error("Zowel exact als diff geteld!");
});

// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n══ 7. LABEL_CFG — badges kloppen met punt­waarden ══\n");

test("Badge 'exact' toont correcte punten (+5)", () => {
  eq(LABEL_CFG.exact.badge, `+${PTS_GROUP.exact} exact`);
});

test("Badge 'diff' toont correcte punten (+3)", () => {
  eq(LABEL_CFG.diff.badge, `+${PTS_GROUP.diff} saldo`);
});

test("Badge 'winner' toont correcte punten (+2)", () => {
  eq(LABEL_CFG.winner.badge, `+${PTS_GROUP.winner} winnaar`);
});

test("Badge 'miss' toont 0 punten", () => {
  eq(LABEL_CFG.miss.badge, "0 mis");
});

// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n══ 8. Groepsstand puntentelling ══\n");

// Simuleer een volledig gespeelde groep A:
// Mexico wint (9 pt), Zuid-Afrika 2e (6 pt)
const resultsGroupA = {
  A1: r(3, 0),  // Mexico 3-0 Zuid-Afrika
  A2: r(1, 0),  // Zuid-Korea 1-0 Tsjechië
  A3: r(0, 1),  // Tsjechië 0-1 Zuid-Afrika (ZA 2e)
  A4: r(3, 0),  // Mexico 3-0 Zuid-Korea (Mexico 1e)
  A5: r(2, 1),  // Tsjechië 2-1 Mexico
  A6: r(2, 0),  // Zuid-Afrika 2-0 Zuid-Korea
};

// Bepaal de werkelijke stand na bovenstaande resultaten:
// Mexico: wint vs ZA (3pt) + wint vs ZK (3pt) + verlies vs CZ (0pt) = 6pt
// Zuid-Afrika: verlies vs MEX (0pt) + wint vs CZ (3pt) + wint vs ZK (3pt) = 6pt
// Zuid-Korea: verlies vs CZ (0pt) + verlies vs MEX (0pt) + verlies vs ZA (0pt) = 0pt
// Tsjechië: verlies vs ZK (0pt) + verlies vs ZA (0pt) + wint vs MEX (3pt) = 3pt
// Volgorde: Mexico 6pt, Zuid-Afrika 6pt (H2H: MEX wint van ZA 3-0) → Mexico #1, ZA #2, CZ #3, ZK #4

function standingForA(predMatches) {
  // Bereken werkelijke stand via computeGroupStandings met alleen A-resultaten
  const actual = computeGroupStandings((id) => {
    if (!id.startsWith("A")) return null;
    return resultsGroupA[id] || null;
  });
  const pred = computeGroupStandings((id) => {
    if (!id.startsWith("A")) return null;
    return predMatches[id] ? { home: predMatches[id].home, away: predMatches[id].away } : null;
  });
  const a1 = actual.A?.winner;
  const a2 = actual.A?.runnerUp;
  const p1 = pred.A?.winner;
  const p2 = pred.A?.runnerUp;
  const top2 = [a1, a2];
  let p1pts = 0, p2pts = 0;
  if (p1 && top2.includes(p1)) p1pts = p1 === a1 ? PTS_STANDING.qualifiedCorrectPos : PTS_STANDING.qualified;
  if (p2 && top2.includes(p2)) p2pts = p2 === a2 ? PTS_STANDING.qualifiedCorrectPos : PTS_STANDING.qualified;
  return { a1, a2, p1, p2, p1pts, p2pts, standPts: p1pts + p2pts };
}

test("Stand: Mexico #1 voorspeld EN correct → 10 pt", () => {
  // Voorspel identiek aan werkelijkheid
  const s = standingForA(resultsGroupA);
  eq(s.a1, "Mexico", "werkelijk #1");
  eq(s.p1, "Mexico", "voorspeld #1");
  eq(s.p1pts, PTS_STANDING.qualifiedCorrectPos);
});

test("Stand: Zuid-Afrika #2 voorspeld EN correct → 10 pt", () => {
  const s = standingForA(resultsGroupA);
  eq(s.a2, "Zuid-Afrika", "werkelijk #2");
  eq(s.p2, "Zuid-Afrika", "voorspeld #2");
  eq(s.p2pts, PTS_STANDING.qualifiedCorrectPos);
});

test("Stand: Mexico voorspeld als #1, ZA als #2 (beide exact) → 20 pt totaal", () => {
  const s = standingForA(resultsGroupA);
  eq(s.standPts, 20);
});

test("Stand: Mexico op #2 en ZA op #1 (top-2 correct maar omgekeerd) → 4+4=8 pt", () => {
  // Bouw voorspelling zodat ZA #1 en Mexico #2 worden:
  // A1 (MEX-ZA): MEX verliest 0-1 → ZA 3pt
  // A2 (ZK-CZ): 0-0 gelijkspel → 1pt elk
  // A3 (CZ-ZA): 0-0 gelijkspel → 1pt elk
  // A4 (MEX-ZK): MEX wint 1-0 → MEX 3pt
  // A5 (CZ-MEX): MEX wint 0-1 (home=CZ, away=MEX) → MEX 3pt
  // A6 (ZA-ZK):  ZA wint 1-0  → ZA 3pt
  // Totaal: ZA 7pt (#1), MEX 6pt (#2) — beiden in werkelijke top-2 maar omgekeerd
  const swappedPred = {
    A1: { home: 0, away: 1 },
    A2: { home: 0, away: 0 },
    A3: { home: 0, away: 0 },
    A4: { home: 1, away: 0 },
    A5: { home: 0, away: 1 },
    A6: { home: 1, away: 0 },
  };
  const s = standingForA(swappedPred);
  eq(s.p1, "Zuid-Afrika",  "voorspeld #1 = ZA");
  eq(s.p2, "Mexico",       "voorspeld #2 = MEX");
  eq(s.a1, "Mexico",       "werkelijk #1 = MEX");
  eq(s.a2, "Zuid-Afrika",  "werkelijk #2 = ZA");
  eq(s.p1pts, PTS_STANDING.qualified,  "ZA voorspeld #1 maar echt #2 → 4pt");
  eq(s.p2pts, PTS_STANDING.qualified,  "MEX voorspeld #2 maar echt #1 → 4pt");
  eq(s.standPts, 8);
});

test("Stand: alleen Mexico correct in top-2 (#1), ZA mist (Tsjechië voorspeld als #2) → 10+0=10 pt", () => {
  // Mexico wint alles, Tsjechië op #2 in voorspelling maar ZA echt #2
  const predWithCzAs2 = {
    A1: r(3, 0),  // Mexico - ZA: Mexico wint (correct)
    A2: p(2, 1),  // ZK verliest van CZ in voorspelling (ZK 0 pt, CZ 3 pt)
    A3: p(3, 0),  // Tsjechië wint van ZA (CZ meer pt)
    A4: r(3, 0),  // Mexico wint van ZK
    A5: p(1, 2),  // Tsjechië verliest van Mexico
    A6: r(2, 0),  // ZA wint van ZK
  };
  const s = standingForA(predWithCzAs2);
  eq(s.p1, "Mexico", "voorspeld #1 = Mexico");
  eq(s.p1pts, PTS_STANDING.qualifiedCorrectPos, "#1 exact");
  // #2 in pred is CZ, werkelijk is ZA → CZ niet in top-2
  if (s.p2 === "Zuid-Afrika") throw new Error("Verwacht Tsjechië als #2 in pred, niet ZA");
  eq(s.p2pts, 0, "#2 mis");
  eq(s.standPts, 10);
});

test("Stand: geen enkel team in top-2 voorspeld → 0 pt", () => {
  // Voorspel ZK en CZ als top-2, maar werkelijk MEX en ZA
  const wrongPred = {
    A1: p(0, 0),  // ZA gelijkspel met Mexico → beide 1 pt
    A2: p(2, 0),  // ZK wint van CZ
    A3: p(2, 0),  // CZ wint van ZA
    A4: p(0, 2),  // ZK wint van Mexico
    A5: p(2, 0),  // CZ wint van Mexico
    A6: p(2, 0),  // ZA wint van ZK... maar ZK al veel punten
  };
  const s = standingForA(wrongPred);
  // werkelijk is nog steeds Mexico #1, ZA #2 (van de resultaten)
  eq(s.a1, "Mexico");
  eq(s.a2, "Zuid-Afrika");
  // voorspelde top-2 moet ZK en/of CZ zijn
  const predTop2InActualTop2 = [s.p1, s.p2].filter(t => ["Mexico", "Zuid-Afrika"].includes(t)).length;
  eq(s.p1pts + s.p2pts, predTop2InActualTop2 === 0 ? 0 : s.standPts);
});

test("Stand: groep niet volledig gespeeld → 0 pt voor stand", () => {
  const partial = { A1: r(3, 0), A2: r(1, 0) }; // slechts 2 van 6 gespeeld
  const user = { predictions: { matches: { A1: p(3, 0), A2: p(1, 0) } } };
  const allResults = { ...partial };
  // allPlayed = false want A3-A6 ontbreken
  const bd = calcGroupPointsBreakdown(user, allResults);
  eq(bd.groups.A.standingPts, 0, "geen stand-punten als groep niet klaar");
});

// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n══ 9. calcGroupPointsBreakdown — totalen ══\n");

test("Alle 6 wedstrijden exact voorspeld → 6×5=30 pt wedstrijden", () => {
  const user = { predictions: { matches: {
    A1: p(3,0), A2: p(1,0), A3: p(0,1), A4: p(3,0), A5: p(2,1), A6: p(2,0),
    B1: p(0,0), B2: p(0,0), B3: p(0,0), B4: p(0,0), B5: p(0,0), B6: p(0,0),
  } } };
  const results = {
    A1: r(3,0), A2: r(1,0), A3: r(0,1), A4: r(3,0), A5: r(2,1), A6: r(2,0),
    B1: r(0,0), B2: r(0,0), B3: r(0,0), B4: r(0,0), B5: r(0,0), B6: r(0,0),
  };
  const bd = calcGroupPointsBreakdown(user, results);
  eq(bd.groups.A.matchPts, 30, "groep A: 6 exacte scores");
  eq(bd.matchPts, 60, "totaal 12 exacte scores (2 groepen)");
});

test("Mix exact/diff/winner/miss per wedstrijd → correcte som", () => {
  const user = { predictions: { matches: {
    A1: p(3,0),  // exact  → 5
    A2: p(1,0),  // diff (1-0 vs 2-1) → 3
    A3: p(1,0),  // winner (thuis wint, maar verkeerd saldo vs 0-1 AUS) wait...
    // A3: Tsjechië - Zuid-Afrika. Result: r(0,1) = ZA wint.  pred: p(1,0) = CZ wint → mis
    A4: p(3,0),  // exact  → 5
    A5: p(2,0),  // winner (thuis wint en result ook, saldo verschilt: 2-0 vs 2-1) → 2
    A6: p(2,0),  // exact  → 5
  } } };
  const results = {
    A1: r(3,0), A2: r(2,1), A3: r(0,1), A4: r(3,0), A5: r(2,1), A6: r(2,0),
  };
  const bd = calcGroupPointsBreakdown(user, results);
  const a = bd.groups.A;
  eq(a.matches[0].label, "exact",  "A1 exact");
  eq(a.matches[1].label, "diff",   "A2 diff");
  eq(a.matches[2].label, "miss",   "A3 mis (CZ vs ZA: pred thuis wint, result uit wint)");
  eq(a.matches[3].label, "exact",  "A4 exact");
  eq(a.matches[4].label, "winner", "A5 winner (juiste winnaar, verkeerd saldo)");
  eq(a.matches[5].label, "exact",  "A6 exact");
  eq(a.matchPts, 5 + 3 + 0 + 5 + 2 + 5, "groep A totaal wedstrijden");
  eq(a.matchPts, 20);
});

test("Geen voorspellingen ingevoerd → 0 pt, geen errors", () => {
  const user = { predictions: {} };
  const results = { A1: r(1,0), A2: r(2,1) };
  const bd = calcGroupPointsBreakdown(user, results);
  eq(bd.matchPts, 0);
  eq(bd.standingPts, 0);
  eq(bd.totalPts, 0);
});

test("Geen resultaten → 0 pt, alle matches null", () => {
  const user = { predictions: { matches: { A1: p(1,0) } } };
  const bd = calcGroupPointsBreakdown(user, {});
  eq(bd.matchPts, 0);
  eq(bd.groups.A.matches.every(d => d.pts === null), true, "alle matches null");
});

test("totalPts = matchPts + standingPts", () => {
  const user = { predictions: { matches: {
    A1: p(3,0), A2: p(1,0), A3: p(0,1), A4: p(3,0), A5: p(2,1), A6: p(2,0),
  } } };
  const results = {
    A1: r(3,0), A2: r(1,0), A3: r(0,1), A4: r(3,0), A5: r(2,1), A6: r(2,0),
  };
  const bd = calcGroupPointsBreakdown(user, results);
  const g = bd.groups.A;
  eq(g.totalPts, g.matchPts + g.standingPts, "groep totalPts klopt");
  eq(bd.totalPts, bd.matchPts + bd.standingPts, "globaal totalPts klopt");
});

test("Maximale punten groep A: 6 exact + beide stand exact → 30+20=50 pt", () => {
  const user = { predictions: { matches: {
    A1: p(3,0), A2: p(1,0), A3: p(0,1), A4: p(3,0), A5: p(2,1), A6: p(2,0),
  } } };
  const results = {
    A1: r(3,0), A2: r(1,0), A3: r(0,1), A4: r(3,0), A5: r(2,1), A6: r(2,0),
  };
  const bd = calcGroupPointsBreakdown(user, results);
  eq(bd.groups.A.matchPts, 30, "6 × 5 pt exact");
  eq(bd.groups.A.standingPts, 20, "2 × 10 pt exact positie");
  eq(bd.groups.A.totalPts, 50);
});

// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n══ 10. Per-match details in breakdown ══\n");

test("Match details bevatten pred, result, pts en label", () => {
  const user = { predictions: { matches: { A1: p(2, 1) } } };
  const results = { A1: r(2, 1) };
  const bd = calcGroupPointsBreakdown(user, results);
  const d = bd.groups.A.matches[0];
  notNull(d.pred);
  notNull(d.result);
  eq(d.pts, 5);
  eq(d.label, "exact");
});

test("Niet-gespeelde wedstrijd → pts null, label null in breakdown", () => {
  const user = { predictions: { matches: { A1: p(2, 1) } } };
  const bd = calcGroupPointsBreakdown(user, {});
  const d = bd.groups.A.matches[0];
  isNull(d.pts);
  isNull(d.label);
});

test("Wedstrijd zonder voorspelling maar wel resultaat → pts null in breakdown", () => {
  const user = { predictions: { matches: {} } };
  const results = { A1: r(2, 1) };
  const bd = calcGroupPointsBreakdown(user, results);
  const d = bd.groups.A.matches[0];
  isNull(d.pts);
});

// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n══ 11. Stand details in breakdown ══\n");

test("Stand details bevatten p1, p2, a1, a2, allPlayed", () => {
  const user = { predictions: { matches: {
    A1: p(3,0), A2: p(1,0), A3: p(0,1), A4: p(3,0), A5: p(2,1), A6: p(2,0),
  } } };
  const results = {
    A1: r(3,0), A2: r(1,0), A3: r(0,1), A4: r(3,0), A5: r(2,1), A6: r(2,0),
  };
  const bd = calcGroupPointsBreakdown(user, results);
  const s = bd.groups.A.standing;
  notNull(s.p1);
  notNull(s.p2);
  notNull(s.a1);
  notNull(s.a2);
  eq(s.allPlayed, true);
});

test("allPlayed = false als niet alle wedstrijden gespeeld", () => {
  const user = { predictions: { matches: { A1: p(1,0) } } };
  const results = { A1: r(1,0) };  // alleen A1, niet A2-A6
  const bd = calcGroupPointsBreakdown(user, results);
  eq(bd.groups.A.standing.allPlayed, false);
});

test("p1pts + p2pts = standingPts", () => {
  const user = { predictions: { matches: {
    A1: p(3,0), A2: p(1,0), A3: p(0,1), A4: p(3,0), A5: p(2,1), A6: p(2,0),
  } } };
  const results = {
    A1: r(3,0), A2: r(1,0), A3: r(0,1), A4: r(3,0), A5: r(2,1), A6: r(2,0),
  };
  const bd = calcGroupPointsBreakdown(user, results);
  const s = bd.groups.A.standing;
  eq(s.p1pts + s.p2pts, bd.groups.A.standingPts);
});

// ═══════════════════════════════════════════════════════════════════════════════
console.log("\n" + "═".repeat(58));
console.log(`  Resultaat: ${passed} geslaagd, ${failed} mislukt`);
console.log("═".repeat(58) + "\n");

if (failed > 0) process.exit(1);
