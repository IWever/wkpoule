console.log("✅ NEW pouleEngine loaded (database versie)");

import {
  GROUPS,
  GROUP_MATCHES,
  KO_STRUCTURE,
  PTS_GROUP,
  PTS_STANDING,
  PTS_KO,
  PTS_EXTRA,
  PTS_TOPSCORER_RANK,
  PTS_SURPRISE,
  TOP_TEAMS,
  PTS_TOP_OUT,
  KEY,
  SESSION_KEY,
} from "./data/tournamentData";

const IS_DEV = import.meta.env.DEV;

// ─── SESSION PERSISTENCE ──────────────────────────────────────────────────────
function saveSession(sessionId) {
  try {
    if (sessionId) localStorage.setItem(SESSION_KEY, sessionId);
    else localStorage.removeItem(SESSION_KEY);
  } catch {}
}

function loadSession() {
  try {
    return localStorage.getItem(SESSION_KEY) || null;
  } catch {
    return null;
  }
}

// ─── STATE PERSISTENCE ───────────────────────────────────────────────────────
async function load() {
  if (IS_DEV) {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || null;
    } catch {
      return null;
    }
  }

  // Probeer maximaal 3x bij mislukking
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch("/api/state");
      if (!res.ok) {
        console.error(`load() poging ${attempt} mislukt:`, res.status);
        if (attempt < 3) await new Promise((r) => setTimeout(r, 800 * attempt));
        continue;
      }
      return await res.json();
    } catch (err) {
      console.error(`load() netwerk fout poging ${attempt}:`, err);
      if (attempt < 3) await new Promise((r) => setTimeout(r, 800 * attempt));
    }
  }
  return null;
}

async function persist(data) {
  if (IS_DEV) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data));
    } catch {}
    return true;
  }
  try {
    const res = await fetch("/api/state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      console.error("persist() API fout:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error("persist() netwerk fout:", err);
    return false;
  }
}

const hash = (s) => btoa(encodeURIComponent(s + "_wk_salt_2026"));

// ─── BASIS STATE ──────────────────────────────────────────────────────────────
function blank() {
  return {
    users: [],
    results: {},
    koResults: {},
    fase: "group",
    groupFrozen: false,
    extraFrozen: false,
    koOpen: false,
    koFrozen: false,
    koFrozenRounds: {
      r32: false,
      r16: false,
      qf: false,
      sf: false,
      "3rd": false,
      final: false,
    },
    competitions: [],
    unlockedUsers: [],
  };
}

// ─── ALGEMENE HELPERS ─────────────────────────────────────────────────────────
function deepSet(obj, path, value) {
  if (path.length === 1) return { ...obj, [path[0]]: value };
  return {
    ...obj,
    [path[0]]: deepSet(obj[path[0]] || {}, path.slice(1), value),
  };
}

function fmtDate(dt) {
  if (!dt) return "";
  const d = new Date(dt);
  return d.toLocaleDateString("nl-NL", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function fmtTime(dt) {
  if (!dt) return "";
  const d = new Date(dt);
  return d.toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" });
}

function fmtDateTime(dt) {
  return dt ? `${fmtDate(dt)} ${fmtTime(dt)}` : "";
}

// ─── GROEPSSTANDEN ────────────────────────────────────────────────────────────
function computeGroupStandings(matchScores) {
  const standings = {};
  Object.keys(GROUPS).forEach((g) => {
    const teams = GROUPS[g];
    const stat = {};
    teams.forEach((t) => {
      stat[t] = { pts: 0, gp: 0, gf: 0, ga: 0 };
    });
    GROUP_MATCHES.filter((m) => m.group === g).forEach((m) => {
      const s = matchScores(m.id);
      if (!s || s.home === "" || s.home === undefined) return;
      const h = parseInt(s.home, 10);
      const a = parseInt(s.away, 10);
      if (Number.isNaN(h) || Number.isNaN(a)) return;
      stat[m.home].gp++;
      stat[m.away].gp++;
      stat[m.home].gf += h;
      stat[m.home].ga += a;
      stat[m.away].gf += a;
      stat[m.away].ga += h;
      if (h > a) stat[m.home].pts += 3;
      else if (h === a) {
        stat[m.home].pts += 1;
        stat[m.away].pts += 1;
      } else stat[m.away].pts += 3;
    });
    const sorted = teams.slice().sort((a, b) => {
      const ptsDiff = stat[b].pts - stat[a].pts;
      if (ptsDiff !== 0) return ptsDiff;
      const gdA = stat[a].gf - stat[a].ga;
      const gdB = stat[b].gf - stat[b].ga;
      if (gdB !== gdA) return gdB - gdA;
      return stat[b].gf - stat[a].gf;
    });
    standings[g] = {
      winner: sorted[0],
      runnerUp: sorted[1],
      table: sorted.map((t) => ({
        team: t,
        pts: stat[t].pts,
        gp: stat[t].gp,
        gf: stat[t].gf,
        ga: stat[t].ga,
        gd: stat[t].gf - stat[t].ga,
      })),
    };
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

function groupsAllFilled(matchScores) {
  const result = {};
  Object.keys(GROUPS).forEach((g) => {
    const matches = GROUP_MATCHES.filter((m) => m.group === g);
    result[g] = matches.every((m) => {
      const s = matchScores(m.id);
      return s != null && s.home !== "" && s.home !== undefined;
    });
  });
  return result;
}

// ─── KO SLOT HELPERS ──────────────────────────────────────────────────────────
function slotLabel(slot) {
  if (!slot) return "?";
  if (/^1[A-L]$/.test(slot)) return `Nr. 1 Groep ${slot[1]}`;
  if (/^2[A-L]$/.test(slot)) return `Nr. 2 Groep ${slot[1]}`;
  if (/^N3/.test(slot)) return "Beste nr. 3";
  if (slot.charAt(0) === "W") {
    const m = KO_STRUCTURE.find((x) => x.id === slot.slice(1));
    return m ? `Winnaar ${m.label}` : slot;
  }
  if (slot.charAt(0) === "L") {
    const m = KO_STRUCTURE.find((x) => x.id === slot.slice(1));
    return m ? `Verliezer ${m.label}` : slot;
  }
  return slot;
}

function resolveGroupSlot(slot, standings, allGroupsComplete) {
  const rank = slot[0];
  const g = slot[1];
  const s = standings[g];
  if (!s) return null;
  const team = rank === "1" ? s.winner : s.runnerUp;
  return allGroupsComplete[g] ? team : null;
}

function resolveSlotRich(slot, ctx) {
  const { adminStandings, adminComplete, userKoWinners, adminKoResults } = ctx;
  if (!slot) return { type: "label", label: "?" };
  if (/^[12][A-L]$/.test(slot)) {
    const adminTeam = adminStandings
      ? resolveGroupSlot(slot, adminStandings, adminComplete)
      : null;
    if (adminTeam) return { type: "team", team: adminTeam };
    return { type: "label", label: slotLabel(slot) };
  }

  if (/^N3/.test(slot)) {
    // Admin kan handmatig een beste-nr-3 team instellen via koResults["N3_<matchId>"]
    // De matchId wordt meegegeven via ctx zodat per wedstrijd een ander team kan.
    // We zoeken welke match dit N3-slot als home of away heeft.
    const koMatch = KO_STRUCTURE.find(
      (m) => m.homeSlot === slot || m.awaySlot === slot
    );
    if (koMatch) {
      const side = koMatch.homeSlot === slot ? "home" : "away";
      const adminTeam = adminKoResults?.[`N3_${koMatch.id}_${side}`];
      if (adminTeam) return { type: "team", team: adminTeam };
    }
    return { type: "label", label: "Beste nr. 3" };
  }

  if (slot.charAt(0) === "W") {
    const matchId = slot.slice(1);
    if (adminKoResults?.[matchId]?.played)
      return { type: "team", team: adminKoResults[matchId].winner };
    const userPick = userKoWinners?.[matchId];
    if (userPick) return { type: "team", team: userPick };
    const koMatch = KO_STRUCTURE.find((m) => m.id === matchId);
    if (koMatch) {
      const hd = resolveSlotRich(koMatch.homeSlot, ctx);
      const ad = resolveSlotRich(koMatch.awaySlot, ctx);
      if (hd.type === "team" && ad.type === "team")
        return { type: "two", teams: [hd.team, ad.team] };
    }
    return { type: "label", label: slotLabel(slot) };
  }
  if (slot.charAt(0) === "L") {
    const loserMatchId = slot.slice(1);
    const srcMatch = KO_STRUCTURE.find((km) => km.id === loserMatchId);
    let hTeam = null;
    let aTeam = null;
    if (srcMatch) {
      const hDesc = resolveSlotRich(srcMatch.homeSlot, ctx);
      const aDesc = resolveSlotRich(srcMatch.awaySlot, ctx);
      hTeam = hDesc?.type === "team" ? hDesc.team : null;
      aTeam = aDesc?.type === "team" ? aDesc.team : null;
    }
    if (adminKoResults?.[loserMatchId]?.played) {
      const winner = adminKoResults[loserMatchId].winner;
      const loser =
        winner === hTeam && aTeam
          ? aTeam
          : winner === aTeam && hTeam
          ? hTeam
          : null;
      if (loser) return { type: "team", team: loser };
    }
    const userWinner = userKoWinners?.[loserMatchId];
    if (userWinner) {
      const predLoser =
        userWinner === hTeam && aTeam
          ? aTeam
          : userWinner === aTeam && hTeam
          ? hTeam
          : null;
      if (predLoser) return { type: "team", team: predLoser };
    }
    return { type: "label", label: slotLabel(slot) };
  }
  return { type: "label", label: slot };
}

function buildRichKOSlots(pred, results, koResults) {
  const adminStandings = deriveGroupStandingsFromResults(results);
  const adminComplete = groupsAllFilled((id) => {
    const r = results[id];
    return r?.played ? r : null;
  });
  const koWinners = {};
  KO_STRUCTURE.forEach((km) => {
    const winner = koResults?.[km.id]?.winner;
    if (winner) koWinners[km.id] = winner;
  });
  if (pred?.koWinners) {
    Object.keys(pred.koWinners).forEach((k) => {
      if (pred.koWinners[k]) koWinners[k] = pred.koWinners[k];
    });
  }
  if (koResults) {
    Object.keys(koResults).forEach((k) => {
      if (k.startsWith("N3_")) koWinners[k] = koResults[k];
    });
  }
  const ctx = {
    adminStandings,
    adminComplete,
    userKoWinners: koWinners,
    adminKoResults: koResults,
  };
  const slots = {};
  KO_STRUCTURE.forEach((m) => {
    slots[m.id] = {
      home: resolveSlotRich(m.homeSlot, ctx),
      away: resolveSlotRich(m.awaySlot, ctx),
    };
  });
  return slots;
}

function resolveSlot(slot, pred, koWinners) {
  if (!slot) return null;
  if (/^[12][A-L]$/.test(slot)) {
    const rank = slot[0];
    const g = slot[1];
    const s = deriveGroupStandings(pred);
    return rank === "1" ? s[g]?.winner : s[g]?.runnerUp;
  }
  if (/^N3/.test(slot)) {
    // Gebruik adminKoResults als die meegegeven wordt, anders null
    if (!koWinners) return null;
    const koMatch = KO_STRUCTURE.find(
      (m) => m.homeSlot === slot || m.awaySlot === slot
    );
    if (koMatch) {
      const side = koMatch.homeSlot === slot ? "home" : "away";
      return koWinners[`N3_${koMatch.id}_${side}`] || null;
    }
    return null;
  }

  if (slot.charAt(0) === "W") return koWinners?.[slot.slice(1)] || null;
  return null;
}

function buildKOSlots(pred) {
  const koWinners = pred?.koWinners || {};
  const slots = {};
  KO_STRUCTURE.forEach((m) => {
    slots[m.id] = {
      home: resolveSlot(m.homeSlot, pred, koWinners),
      away: resolveSlot(m.awaySlot, pred, koWinners),
    };
  });
  return slots;
}

// ─── EXTRA BEREKENINGEN ───────────────────────────────────────────────────────

// deriveTopOuts: geeft toplands terug die de achtste finales NIET halen.
// Dat zijn teams die uitgeschakeld zijn in de groepsfase (niet in top-2)
// OF die verloren in de zestiende finale (r32).
function deriveTopOuts(results, koResults) {
  const actualS = deriveGroupStandingsFromResults(results);
  const eliminated = [];

  TOP_TEAMS.forEach((team) => {
    const g = Object.keys(GROUPS).find((g2) => GROUPS[g2].includes(team));
    if (!g) return;

    // Stap 1: controleer of de groep volledig gespeeld is
    const allGroupPlayed = GROUP_MATCHES.filter((m) => m.group === g).every(
      (m) => results[m.id]?.played
    );
    if (!allGroupPlayed) return;

    const top2 = [actualS[g]?.winner, actualS[g]?.runnerUp].filter(Boolean);
    if (top2.length < 2) return;

    // Uitgeschakeld in groepsfase → meteen out
    if (!top2.includes(team)) {
      eliminated.push(team);
      return;
    }

    // Stap 2: team haalde de zestiende finales — check of het daar verloor
    if (!koResults) return;
    const r32Matches = KO_STRUCTURE.filter((m) => m.round === "r32");
    for (const match of r32Matches) {
      const r = koResults[match.id];
      if (!r?.played || !r.winner) continue;
      // Was dit team deelnemer aan deze wedstrijd én heeft het verloren?
      const wasHome = match.homeSlot === `1${g}` || match.homeSlot === `2${g}`;
      const wasAway = match.awaySlot === `1${g}` || match.awaySlot === `2${g}`;
      if ((wasHome || wasAway) && r.winner !== team) {
        // Extra check: was het de juiste positie (1 of 2) voor dit team?
        const teamPos = top2[0] === team ? "1" : "2";
        const slotMatch =
          match.homeSlot === `${teamPos}${g}` ||
          match.awaySlot === `${teamPos}${g}`;
        if (slotMatch) {
          eliminated.push(team);
          return;
        }
      }
    }
  });

  return eliminated;
}

const KO_ROUND_ORDER = ["r32", "r16", "qf", "sf", "3rd", "final"];
const KO_ROUND_TO_STAGE = {
  r32: "Zestiende finale",
  r16: "Achtste finale",
  qf: "Kwartfinale",
  sf: "Halve finale",
  "3rd": "3e Plaats",
  final: "🏆 Wereldkampioen",
};

// deriveSurpriseStage: geeft de hoogste ronde terug die het team haalde
function deriveSurpriseStage(team, koResults) {
  if (!team) return null;
  let furthestIdx = -1;
  KO_STRUCTURE.forEach((m) => {
    const r = koResults[m.id];
    if (!r?.played) return;
    const roundIdx = KO_ROUND_ORDER.indexOf(m.round);
    if (r.winner === team && roundIdx > furthestIdx) furthestIdx = roundIdx;
    const hId =
      m.homeSlot && m.homeSlot.charAt(0) === "W" ? m.homeSlot.slice(1) : null;
    const aId =
      m.awaySlot && m.awaySlot.charAt(0) === "W" ? m.awaySlot.slice(1) : null;
    const hw = hId && koResults[hId]?.winner;
    const aw = aId && koResults[aId]?.winner;
    if ((hw === team || aw === team) && roundIdx > furthestIdx)
      furthestIdx = roundIdx;
  });
  return furthestIdx >= 0
    ? KO_ROUND_TO_STAGE[KO_ROUND_ORDER[furthestIdx]]
    : null;
}

// ─── TOPSCORER PUNTEN HELPER ─────────────────────────────────────────────────
function calcTopScorerPts(predTopScorers, resultTopScorers) {
  if (!predTopScorers || !resultTopScorers || resultTopScorers.length === 0)
    return 0;
  let pts = 0;
  (predTopScorers || []).forEach((playerName) => {
    if (!playerName) return;
    const match = resultTopScorers.find((r) => r.name === playerName);
    if (match) pts += PTS_TOPSCORER_RANK[match.rank] || 0;
  });
  return pts;
}

// ─── PUNTEN ───────────────────────────────────────────────────────────────────
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

function calcPoints(user, results, koResults) {
  const p = user.predictions || {};
  let pts = 0;

  // Groepswedstrijden
  GROUP_MATCHES.forEach((m) => {
    const r = results[m.id];
    const res = calcGroupMatchPts(p.matches?.[m.id], r);
    if (res) pts += res.pts;
  });

  // Groepsstand
  const predS = deriveGroupStandings(p);
  const actualS = deriveGroupStandingsFromResults(results);
  Object.keys(GROUPS).forEach((g) => {
    const aS = actualS[g];
    const allPlayed = GROUP_MATCHES.filter((m) => m.group === g).every(
      (m) => results[m.id]?.played
    );
    if (!allPlayed || !aS?.winner || !aS?.runnerUp) return;
    const a1 = aS.winner;
    const a2 = aS.runnerUp;
    const p1 = predS[g]?.winner;
    const p2 = predS[g]?.runnerUp;
    const top2 = [a1, a2];
    if (p1 && top2.includes(p1)) {
      pts += PTS_STANDING.qualified;
      if (p1 === a1)
        pts += PTS_STANDING.qualifiedCorrectPos - PTS_STANDING.qualified;
    }
    if (p2 && top2.includes(p2)) {
      pts += PTS_STANDING.qualified;
      if (p2 === a2)
        pts += PTS_STANDING.qualifiedCorrectPos - PTS_STANDING.qualified;
    }
  });

  // KO-wedstrijden
  KO_STRUCTURE.forEach((m) => {
    const r = koResults[m.id];
    if (!r?.played) return;
    const schema = PTS_KO[m.round] || PTS_KO.r16;
    const pw = p.koWinners?.[m.id];
    const ps = p.koScores?.[m.id];
    if (pw && r.winner === pw) pts += schema.winner;
    if (
      ps &&
      ps.home !== undefined &&
      r.home90 !== undefined &&
      parseInt(ps.home, 10) === parseInt(r.home90, 10) &&
      parseInt(ps.away, 10) === parseInt(r.away90, 10)
    )
      pts += schema.exact;
  });

  // Extra: kampioen
  if (
    p.champion &&
    koResults["FINAL"]?.played &&
    p.champion === koResults["FINAL"].winner
  )
    pts += PTS_EXTRA.champion;

  // Extra: topscorers
  const resultTopScorers = results["TOP_SCORERS"];
  if (resultTopScorers && Array.isArray(resultTopScorers)) {
    pts += calcTopScorerPts(p.topScorers, resultTopScorers);
  } else if (results["TOP_SCORER"]) {
    const legacy = Array.isArray(results["TOP_SCORER"])
      ? results["TOP_SCORER"]
      : [results["TOP_SCORER"]];
    const predScorers = Array.isArray(p.topScorers)
      ? p.topScorers
      : p.topScorer
      ? [p.topScorer]
      : [];
    predScorers.forEach((name) => {
      if (name && legacy.includes(name)) pts += 15;
    });
  }

  // Extra: hoe ver Nederland
  if (p.nlStage && results["NL_STAGE"] && p.nlStage === results["NL_STAGE"])
    pts += PTS_EXTRA.nlStage;

  // Extra: gele kaarten
  if (
    p.yellowCards &&
    results["YELLOW_CARDS"] &&
    p.yellowCards === results["YELLOW_CARDS"]
  )
    pts += PTS_EXTRA.yellowCards;

  // Extra: verrassing
  if (p.surpriseTeam) {
    const ss = deriveSurpriseStage(p.surpriseTeam, koResults);
    if (ss) pts += PTS_SURPRISE[ss] || 0;
  }

  // Extra: topland haalt achtste finales niet
  if (p.topOut) {
    const outs = deriveTopOuts(results, koResults);
    if (outs.includes(p.topOut)) pts += PTS_TOP_OUT;
  }

  // Extra: meeste clean sheets
  if (p.mostCleanSheets && results["MOST_CLEAN_SHEETS"]) {
    const adminCS = Array.isArray(results["MOST_CLEAN_SHEETS"])
      ? results["MOST_CLEAN_SHEETS"]
      : [results["MOST_CLEAN_SHEETS"]];
    if (adminCS.includes(p.mostCleanSheets)) pts += PTS_EXTRA.mostCleanSheets;
  }

  // Extra: meeste doelpunten groepsfase
  if (p.mostGroupGoals && results["MOST_GROUP_GOALS"]) {
    const adminMGG = Array.isArray(results["MOST_GROUP_GOALS"])
      ? results["MOST_GROUP_GOALS"]
      : [results["MOST_GROUP_GOALS"]];
    if (adminMGG.includes(p.mostGroupGoals)) pts += PTS_EXTRA.mostGroupGoals;
  }

  return pts;
}

export {
  load,
  persist,
  hash,
  blank,
  saveSession,
  loadSession,
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
  calcTopScorerPts,
  calcGroupMatchPts,
  calcPoints,
  fmtDate,
  fmtTime,
  fmtDateTime,
};
