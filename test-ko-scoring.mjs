// Standalone KO scoring test — no test framework needed
// Reproduces the logic from pouleEngine.js and all UI components

const PTS_KO = {
  r32:   { winner: 3,  diff: 2,  exact: 5  },
  r16:   { winner: 4,  diff: 3,  exact: 8  },
  qf:    { winner: 5,  diff: 4,  exact: 12 },
  sf:    { winner: 8,  diff: 5,  exact: 17 },
  "3rd": { winner: 12, diff: 8,  exact: 20 },
  final: { winner: 15, diff: 12, exact: 25 },
};

// ── Engine logic (pouleEngine.js) ─────────────────────────────────────────
function enginePts(schema, pw, ps, r) {
  let pts = 0;
  if (pw && r.winner === pw) pts += schema.winner;
  if (ps && ps.home !== undefined && r.home90 !== undefined) {
    const pH = parseInt(ps.home, 10);
    const pA = parseInt(ps.away, 10);
    const rH = parseInt(r.home90, 10);
    const rA = parseInt(r.away90, 10);
    if (pH === rH && pA === rA) {
      pts += schema.exact;
    } else if (pH - pA === rH - rA) {
      pts += schema.diff;
    }
  }
  return pts;
}

// ── UI flags ──────────────────────────────────────────────────────────────
function uiFlags(pw, ps, r) {
  const winOk   = r?.played && pw && pw === r.winner;
  const scoreOk = r?.played && ps?.home !== undefined &&
    parseInt(ps.home) === parseInt(r.home90) &&
    parseInt(ps.away) === parseInt(r.away90);
  const diffOk  = r?.played && ps?.home !== undefined &&
    !scoreOk &&
    parseInt(ps.home) - parseInt(ps.away) === parseInt(r.home90) - parseInt(r.away90);
  return { winOk, scoreOk, diffOk };
}

// ── UI totaalpunten (zoals MyOverview / compare.jsx) ──────────────────────
function uiTotal(schema, pw, ps, r) {
  const { winOk, scoreOk, diffOk } = uiFlags(pw, ps, r);
  let pts = 0;
  if (winOk) pts += schema.winner;
  if (scoreOk) pts += schema.exact;
  else if (diffOk) pts += schema.diff;
  return pts;
}

// ── Test runner ───────────────────────────────────────────────────────────
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
    throw new Error(`${msg ? msg + " — " : ""}verwacht ${expected}, gekregen ${actual}`);
}

// ── Helpers ───────────────────────────────────────────────────────────────
const played    = (winner, home90, away90) => ({ played: true, winner, home90, away90 });
const notPlayed = () => ({ played: false });
const score     = (home, away) => ({ home, away });

// ══════════════════════════════════════════════════════════════════════════
console.log("\n══ 1. Basisgevallen ══\n");

const s = PTS_KO.r16; // winner:4, diff:3, exact:8

test("Geen winnaar ingevuld → 0 pt", () => {
  eq(enginePts(s, null, null, played("NED", 2, 0)), 0);
});

test("Winnaar fout → 0 pt", () => {
  eq(enginePts(s, "BEL", null, played("NED", 2, 0)), 0);
});

test("Winnaar correct, geen stand ingevuld → alleen winner", () => {
  eq(enginePts(s, "NED", null, played("NED", 2, 0)), s.winner);
});

test("Wedstrijd nog niet gespeeld → 0 pt", () => {
  eq(enginePts(s, "NED", score(2, 0), notPlayed()), 0);
});

test("Stand ingevuld maar geen winnaar → alleen exact (stand is onafhankelijk)", () => {
  eq(enginePts(s, null, score(2, 0), played("NED", 2, 0)), s.exact);
});

// ══════════════════════════════════════════════════════════════════════════
console.log("\n══ 2. Exacte uitslag ══\n");

test("Exacte uitslag correct → winner + exact", () => {
  eq(enginePts(s, "NED", score(2, 0), played("NED", 2, 0)), s.winner + s.exact);
});

test("Exacte uitslag correct bij gelijkspel 0-0 → winner + exact", () => {
  eq(enginePts(s, "NED", score(0, 0), played("NED", 0, 0)), s.winner + s.exact);
});

test("Exacte uitslag correct bij 1-1 → winner + exact", () => {
  eq(enginePts(s, "NED", score(1, 1), played("NED", 1, 1)), s.winner + s.exact);
});

test("Winnaar fout maar exacte stand klopt → alleen exact (gelijkspel-scenario)", () => {
  // 1-1 na 90 min, NED wint via penalties; speler voorspelt BEL wint maar stand 1-1 correct
  eq(enginePts(s, "BEL", score(1, 1), played("NED", 1, 1)), s.exact);
});

// ══════════════════════════════════════════════════════════════════════════
console.log("\n══ 3. Verschil-bonus ══\n");

test("Verschil correct: 1-0 vs 2-1 (beide +1) → winner + diff", () => {
  eq(enginePts(s, "NED", score(1, 0), played("NED", 2, 1)), s.winner + s.diff);
});

test("Verschil correct: 2-0 vs 3-1 (beide +2) → winner + diff", () => {
  eq(enginePts(s, "NED", score(2, 0), played("NED", 3, 1)), s.winner + s.diff);
});

test("Verschil correct: 0-1 vs 1-2 (beide -1) → winner + diff", () => {
  eq(enginePts(s, "BEL", score(0, 1), played("BEL", 1, 2)), s.winner + s.diff);
});

test("Verschil correct bij gelijkspel: 1-1 vs 2-2 (beide 0) → winner + diff", () => {
  eq(enginePts(s, "NED", score(1, 1), played("NED", 2, 2)), s.winner + s.diff);
});

test("Verschil NIET correct: 1-0 vs 2-0 (+1 vs +2) → alleen winner", () => {
  eq(enginePts(s, "NED", score(1, 0), played("NED", 2, 0)), s.winner);
});

test("Verschil NIET correct: 1-0 vs 0-1 (+1 vs -1) → alleen winner", () => {
  // Score gespiegeld: +1 ≠ -1
  eq(enginePts(s, "NED", score(1, 0), played("NED", 0, 1)), s.winner);
});

test("Winnaar fout maar verschil klopt → alleen diff (gelijkspel-scenario)", () => {
  // 1-1 na 90 min → diff 0; speler voorspelt 2-2 (diff 0) maar verkeerde penaltywinnaar
  eq(enginePts(s, "BEL", score(2, 2), played("NED", 1, 1)), s.diff);
});

// ══════════════════════════════════════════════════════════════════════════
console.log("\n══ 4. Geen dubbeltelling ══\n");

test("Exacte uitslag → exact bonus, NIET ook diff", () => {
  const pts = enginePts(s, "NED", score(2, 0), played("NED", 2, 0));
  eq(pts, s.winner + s.exact);
  if (pts === s.winner + s.exact + s.diff)
    throw new Error("Zowel exact als diff geteld!");
});

test("Verschil bonus → diff bonus, NIET ook exact", () => {
  const pts = enginePts(s, "NED", score(1, 0), played("NED", 2, 1));
  eq(pts, s.winner + s.diff);
  if (pts === s.winner + s.exact + s.diff)
    throw new Error("Zowel exact als diff geteld!");
});

// ══════════════════════════════════════════════════════════════════════════
console.log("\n══ 5. Speciale situaties ══\n");

test("Voorspelde score 0-1 (tegenstander wint), maar eigen team klopt via penalties (0-0) → alleen winner", () => {
  // Thuis 0, uit 0 → gelijkspel, NED wint via penalties
  // Speler voorspelt NED maar score 0-1 (tegenstander scoort) → verschil: -1 vs 0 → geen diff
  eq(enginePts(s, "NED", score(0, 1), played("NED", 0, 0)), s.winner);
});

test("String-waarden voor scores worden correct geparsed (exact)", () => {
  eq(enginePts(s, "NED", score("2", "0"), played("NED", "2", "0")), s.winner + s.exact);
});

test("String-waarden voor scores worden correct geparsed (diff)", () => {
  eq(enginePts(s, "NED", score("1", "0"), played("NED", "2", "1")), s.winner + s.diff);
});

// ══════════════════════════════════════════════════════════════════════════
console.log("\n══ 6. Alle rondes — correcte schema-waarden ══\n");

const ROUNDS = [
  ["r32",   PTS_KO.r32,    { winner: 3,  diff: 2,  exact: 5  }],
  ["r16",   PTS_KO.r16,    { winner: 4,  diff: 3,  exact: 8  }],
  ["qf",    PTS_KO.qf,     { winner: 5,  diff: 4,  exact: 12 }],
  ["sf",    PTS_KO.sf,     { winner: 8,  diff: 5,  exact: 17 }],
  ["3rd",   PTS_KO["3rd"], { winner: 12, diff: 8,  exact: 20 }],
  ["final", PTS_KO.final,  { winner: 15, diff: 12, exact: 25 }],
];

for (const [round, schema, exp] of ROUNDS) {
  test(`${round}: schema-waarden kloppen (W=${exp.winner}, V=${exp.diff}, S=${exp.exact})`, () => {
    eq(schema.winner, exp.winner, `winner`);
    eq(schema.diff,   exp.diff,   `diff`);
    eq(schema.exact,  exp.exact,  `exact`);
  });

  test(`${round}: alleen winner → ${exp.winner} pt`, () => {
    eq(enginePts(schema, "NED", null, played("NED", 2, 0)), exp.winner);
  });

  test(`${round}: exact → ${exp.winner + exp.exact} pt`, () => {
    eq(enginePts(schema, "NED", score(2, 0), played("NED", 2, 0)), exp.winner + exp.exact);
  });

  test(`${round}: verschil (1-0 vs 2-1) → ${exp.winner + exp.diff} pt`, () => {
    eq(enginePts(schema, "NED", score(1, 0), played("NED", 2, 1)), exp.winner + exp.diff);
  });

  test(`${round}: fout → 0 pt`, () => {
    eq(enginePts(schema, "BEL", score(0, 1), played("NED", 2, 0)), 0);
  });
}

// ══════════════════════════════════════════════════════════════════════════
console.log("\n══ 7. UI-vlaggen ══\n");

const uiCases = [
  { label: "Exact",               pw:"NED", ps:score(2,0), r:played("NED",2,0), winOk:true,  scoreOk:true,  diffOk:false },
  { label: "Verschil (1-0/2-1)",  pw:"NED", ps:score(1,0), r:played("NED",2,1), winOk:true,  scoreOk:false, diffOk:true  },
  { label: "Alleen winner",       pw:"NED", ps:score(1,0), r:played("NED",2,0), winOk:true,  scoreOk:false, diffOk:false },
  { label: "Winnaar fout+exact",  pw:"BEL", ps:score(1,1), r:played("NED",1,1), winOk:false, scoreOk:true,  diffOk:false },
  { label: "Gelijkspel exact",    pw:"NED", ps:score(0,0), r:played("NED",0,0), winOk:true,  scoreOk:true,  diffOk:false },
  { label: "Gelijkspel verschil", pw:"NED", ps:score(1,1), r:played("NED",2,2), winOk:true,  scoreOk:false, diffOk:true  },
  { label: "Geen voorspelling",   pw:null,  ps:null,       r:played("NED",2,0), winOk:null,  scoreOk:false, diffOk:false },
];

for (const c of uiCases) {
  test(`UI-vlaggen: ${c.label}`, () => {
    const flags = uiFlags(c.pw, c.ps, c.r);
    eq(flags.winOk,   c.winOk,   "winOk");
    eq(flags.scoreOk, c.scoreOk, "scoreOk");
    eq(flags.diffOk,  c.diffOk,  "diffOk");
  });
}

test("UI: diffOk en scoreOk zijn nooit beide true", () => {
  const cases = [
    { pw:"NED", ps:score(2,0), r:played("NED",2,0) },
    { pw:"NED", ps:score(1,0), r:played("NED",2,1) },
    { pw:"NED", ps:score(1,0), r:played("NED",2,0) },
    { pw:"BEL", ps:score(2,0), r:played("NED",2,0) },
    { pw:"NED", ps:score(1,1), r:played("NED",2,2) },
  ];
  for (const c of cases) {
    const { scoreOk, diffOk } = uiFlags(c.pw, c.ps, c.r);
    if (scoreOk && diffOk)
      throw new Error(`scoreOk en diffOk zijn allebei true voor ${JSON.stringify(c)}`);
  }
});

// ══════════════════════════════════════════════════════════════════════════
console.log("\n══ 8. Engine == UI-totaalpunten ══\n");

const consistencyCases = [
  { label:"exact",            pw:"NED", ps:score(2,0), r:played("NED",2,0) },
  { label:"verschil (1/2-1)", pw:"NED", ps:score(1,0), r:played("NED",2,1) },
  { label:"alleen winner",    pw:"NED", ps:score(1,0), r:played("NED",2,0) },
  { label:"winnaar fout+exact", pw:"BEL", ps:score(1,1), r:played("NED",1,1) },
  { label:"geen pw",          pw:null,  ps:score(2,0), r:played("NED",2,0) },
  { label:"geen ps",          pw:"NED", ps:null,       r:played("NED",2,0) },
  { label:"gelijkspel exact", pw:"NED", ps:score(1,1), r:played("NED",1,1) },
  { label:"gelijkspel diff",  pw:"NED", ps:score(2,2), r:played("NED",1,1) },
];

for (const c of consistencyCases) {
  test(`Engine == UI totaal: ${c.label}`, () => {
    const eng = enginePts(s, c.pw, c.ps, c.r);
    const ui  = uiTotal(s, c.pw, c.ps, c.r);
    eq(eng, ui, `engine=${eng} ui=${ui}`);
  });
}

// ══════════════════════════════════════════════════════════════════════════
console.log("\n" + "═".repeat(52));
console.log(`  Resultaat: ${passed} geslaagd, ${failed} mislukt`);
console.log("═".repeat(52) + "\n");

if (failed > 0) process.exit(1);
