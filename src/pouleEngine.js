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
    const groupMatches = GROUP_MATCHES.filter((m) => m.group === g);
    groupMatches.forEach((m) => {
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

    // Bereken onderling resultaat (H2H) voor een subset teams
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
        h2h[m.home].gf += hg;
        h2h[m.home].ga += ag;
        h2h[m.away].gf += ag;
        h2h[m.away].ga += hg;
        if (hg > ag) h2h[m.home].pts += 3;
        else if (hg === ag) { h2h[m.home].pts += 1; h2h[m.away].pts += 1; }
        else h2h[m.away].pts += 3;
      });
      return h2h;
    }

    // Rangschikking conform officiële FIFA WK 2026 regels:
    // 1. Punten
    // 2. Onderling resultaat: punten
    // 3. Onderling resultaat: doelsaldo
    // 4. Onderling resultaat: gescoorde doelpunten
    // 5. Doelsaldo (alle groepswedstrijden)
    // 6. Gescoorde doelpunten (alle groepswedstrijden)
    const sortedByPts = teams.slice().sort((a, b) => stat[b].pts - stat[a].pts);

    const sorted = [];
    let i = 0;
    while (i < sortedByPts.length) {
      let j = i + 1;
      while (j < sortedByPts.length && stat[sortedByPts[j]].pts === stat[sortedByPts[i]].pts) {
        j++;
      }
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

// ─── GROEPSKANDIDATEN ────────────────────────────────────────────────────────
// Bepaalt per groepspositie welke teams die positie nog wiskundig kunnen bereiken.
// Enumereert alle mogelijke uitkomsten (W/G/V) van niet-gespeelde wedstrijden.
function computeGroupCandidates(matchScores) {
  const result = {};
  Object.keys(GROUPS).forEach((g) => {
    const teams = GROUPS[g];
    const groupMatches = GROUP_MATCHES.filter((m) => m.group === g);

    const cur = {};
    teams.forEach((t) => { cur[t] = { pts: 0 }; });
    groupMatches.forEach((m) => {
      const s = matchScores(m.id);
      if (!s || s.home === "" || s.home === undefined) return;
      const h = parseInt(s.home, 10);
      const a = parseInt(s.away, 10);
      if (Number.isNaN(h) || Number.isNaN(a)) return;
      if (h > a) cur[m.home].pts += 3;
      else if (h === a) { cur[m.home].pts++; cur[m.away].pts++; }
      else cur[m.away].pts += 3;
    });

    const remaining = groupMatches.filter((m) => {
      const s = matchScores(m.id);
      return !s || s.home === "" || s.home === undefined ||
        Number.isNaN(parseInt(s.home, 10)) || Number.isNaN(parseInt(s.away, 10));
    });

    const canReach = {};
    teams.forEach((t) => { canReach[t] = new Set(); });

    const n = remaining.length;
    for (let mask = 0; mask < Math.pow(3, n); mask++) {
      const pts = {};
      teams.forEach((t) => { pts[t] = cur[t].pts; });
      let temp = mask;
      for (let i = 0; i < n; i++) {
        const outcome = temp % 3; temp = Math.floor(temp / 3);
        const m = remaining[i];
        if (outcome === 0) pts[m.home] += 3;
        else if (outcome === 1) { pts[m.home]++; pts[m.away]++; }
        else pts[m.away] += 3;
      }
      const ranked = teams.slice().sort((a, b) => pts[b] - pts[a]);
      // Bij gelijkstand alle posities binnen de tie als bereikbaar markeren
      let i = 0;
      while (i < ranked.length) {
        let j = i + 1;
        while (j < ranked.length && pts[ranked[j]] === pts[ranked[i]]) j++;
        for (let k = i; k < j; k++)
          for (let p = i; p < j; p++) canReach[ranked[k]].add(p + 1);
        i = j;
      }
    }

    result[g] = {
      "1": teams.filter((t) => canReach[t].has(1)),
      "2": teams.filter((t) => canReach[t].has(2)),
      "3": teams.filter((t) => canReach[t].has(3)),
    };
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
  const { adminStandings, adminComplete, userKoWinners, adminKoResults, groupCandidates } = ctx;
  if (!slot) return { type: "label", label: "?" };
  if (/^[12][A-L]$/.test(slot)) {
    const adminTeam = adminStandings
      ? resolveGroupSlot(slot, adminStandings, adminComplete)
      : null;
    if (adminTeam) return { type: "team", team: adminTeam };
    const rank = slot[0];
    const g = slot[1];
    const sublabel = slotLabel(slot);
    const candidates = groupCandidates?.[g]?.[rank];
    if (candidates && candidates.length > 0) {
      // Sorteer op huidige stand: teams die al bovenaan staan eerst
      const standingsOrder = adminStandings?.[g]?.table?.map((r) => r.team) ?? [];
      const sorted = [
        ...standingsOrder.filter((t) => candidates.includes(t)),
        ...candidates.filter((t) => !standingsOrder.includes(t)),
      ];
      if (sorted.length === 1) return { type: "team", team: sorted[0], sublabel };
      if (sorted.length === 2) return { type: "two", teams: sorted, sublabel };
      return { type: "few", teams: sorted, sublabel };
    }
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
    const koMatch = KO_STRUCTURE.find((m) => m.id === matchId);
    if (koMatch) {
      const hd = resolveSlotRich(koMatch.homeSlot, ctx);
      const ad = resolveSlotRich(koMatch.awaySlot, ctx);
      if (hd.type === "team" && ad.type === "team") {
        // Alleen een expliciete keuze tonen als die ook echt één van de twee
        // bekende deelnemers is. Een oude/verouderde keuze (team dat deze
        // wedstrijd uiteindelijk niet haalde) negeren we, anders tonen we een
        // team dat helemaal niet in deze wedstrijd speelt.
        if (userPick === hd.team || userPick === ad.team)
          return { type: "team", team: userPick, candidates: [hd.team, ad.team] };
        return { type: "two", teams: [hd.team, ad.team] };
      }
    }
    if (userPick) return { type: "team", team: userPick };
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
  const groupCandidates = computeGroupCandidates((id) => {
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
    groupCandidates,
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

// ─── EFFECTIEVE KO-WINNAAR ─────────────────────────────────────────────────────
// Geeft de winnaar die telt voor de puntentelling van een KO-wedstrijd.
// Heeft de deelnemer expliciet een winnaar aangeklikt? Dan die.
// Zo niet, maar wel een beslissende uitslag (geen gelijkspel) ingevuld?
// Dan leiden we de winnaar af uit die voorspelde stand: het team in het
// home-slot (bij pH > pA) of away-slot (bij pA > pH) van de eigen bracket.
// Bij een gelijkspel-voorspelling is er geen winnaar af te leiden
// (de penaltywinnaar is dan onbekend) → null.
// koSlots mag meegegeven worden om buildKOSlots niet per wedstrijd te herberekenen.
function effectiveKOWinner(pred, matchId, koSlots) {
  const pw = pred?.koWinners?.[matchId];
  if (pw) return pw;
  const ps = pred?.koScores?.[matchId];
  if (
    !ps ||
    ps.home === undefined || ps.home === "" ||
    ps.away === undefined || ps.away === ""
  )
    return null;
  const pH = parseInt(ps.home, 10);
  const pA = parseInt(ps.away, 10);
  if (Number.isNaN(pH) || Number.isNaN(pA) || pH === pA) return null;
  const slots = koSlots || buildKOSlots(pred);
  return (pH > pA ? slots?.[matchId]?.home : slots?.[matchId]?.away) || null;
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

// Natuurlijke omschrijving van de ronde waarin een team werd uitgeschakeld.
const KO_ROUND_ELIM_LABEL = {
  r32: "de zestiende finale",
  r16: "de achtste finale",
  qf: "de kwartfinale",
  sf: "de halve finale",
  "3rd": "de troostfinale",
  final: "de finale",
};

// Punt-tiers voor de verrassing: index = hoe ver het team KWAM (bereikte ronde).
// Punten horen bij het BEREIKEN van een ronde, niet bij het winnen ervan.
//   0 = in de zestiende finale (uit de groep geplaatst)  → 5
//   1 = in de achtste finale   (zestiende finale gewonnen)→ 10
//   2 = in de kwartfinale      (achtste gewonnen)         → 20
//   3 = in de halve finale     (kwartfinale gewonnen)     → 30
//   4 = verliezend finalist / 3e plaats                   → 40
//   5 = wereldkampioen                                    → 50
const SURPRISE_TIER_STAGE = [
  "Zestiende finale",
  "Achtste finale",
  "Kwartfinale",
  "Halve finale",
  "3e Plaats",
  "🏆 Wereldkampioen",
];
// Het winnen van een ronde brengt je naar de VOLGENDE tier.
const ROUND_WIN_TIER = { r32: 1, r16: 2, qf: 3, sf: 4, "3rd": 4, final: 5 };
// Ronde die het team bereikt zodra het de huidige ronde wint (voor "nu in").
const ROUND_REACHED_LABEL = {
  r32: "de achtste finale",
  r16: "de kwartfinale",
  qf: "de halve finale",
  sf: "de finale",
};

// deriveSurpriseInfo: bepaalt punten én status van het verrassingsteam.
// Punten = hoogste ronde die het team BEREIKTE (winst telt alleen mee om de
// volgende ronde te halen). status wordt gebruikt door het extra-vragen scherm
// om ook 0 punten en de uitschakelronde te tonen.
//   status: "none" | "not_started" | "qualified" | "group_out"
//         | "eliminated" | "advanced" | "champion" | "runner_up"
//         | "third" | "fourth"
function deriveSurpriseInfo(team, results, koResults) {
  if (!team) return { stage: null, pts: 0, status: "none", roundLabel: null };
  results = results || {};
  koResults = koResults || {};

  // Lichte bracket-resolutie (zonder de dure groepskandidaten-enumeratie):
  // we willen enkel zekere teams per slot.
  const koWinners = {};
  KO_STRUCTURE.forEach((km) => {
    const w = koResults[km.id]?.winner;
    if (w) koWinners[km.id] = w;
  });
  Object.keys(koResults).forEach((k) => {
    if (k.startsWith("N3_")) koWinners[k] = koResults[k];
  });
  const ctx = {
    adminStandings: deriveGroupStandingsFromResults(results),
    adminComplete: groupsAllFilled((id) => {
      const r = results[id];
      return r?.played ? r : null;
    }),
    userKoWinners: koWinners,
    adminKoResults: koResults,
  };
  const teamOf = (slot) => {
    const d = resolveSlotRich(slot, ctx);
    return d && d.type === "team" ? d.team : null;
  };
  const plays = (m) =>
    teamOf(m.homeSlot) === team ||
    teamOf(m.awaySlot) === team ||
    koResults[m.id]?.winner === team;

  // ── Punten: hoogste BEREIKTE ronde ─────────────────────────────────────────
  const qualifiedR32 = KO_STRUCTURE.some((m) => m.round === "r32" && plays(m));
  let tier = qualifiedR32 ? 0 : -1;
  KO_STRUCTURE.forEach((m) => {
    const r = koResults[m.id];
    if (!r?.played || r.winner !== team) return;
    const t = ROUND_WIN_TIER[m.round];
    if (t > tier) tier = t;
  });
  const stage = tier >= 0 ? SURPRISE_TIER_STAGE[tier] : null;
  const pts = stage ? PTS_SURPRISE[stage] || 0 : 0;

  // ── Status: verste GESPEELDE wedstrijd + uitkomst ──────────────────────────
  let furthestIdx = -1;
  let furthestRound = null;
  let wonFurthest = false;
  KO_STRUCTURE.forEach((m) => {
    if (!koResults[m.id]?.played || !plays(m)) return;
    const idx = KO_ROUND_ORDER.indexOf(m.round);
    if (idx > furthestIdx) {
      furthestIdx = idx;
      furthestRound = m.round;
      wonFurthest = koResults[m.id].winner === team;
    }
  });

  let status;
  let roundLabel = null;
  if (furthestIdx >= 0) {
    if (furthestRound === "final") status = wonFurthest ? "champion" : "runner_up";
    else if (furthestRound === "3rd") status = wonFurthest ? "third" : "fourth";
    else if (wonFurthest) {
      status = "advanced";
      roundLabel = ROUND_REACHED_LABEL[furthestRound];
    } else {
      status = "eliminated";
      roundLabel = KO_ROUND_ELIM_LABEL[furthestRound];
    }
  } else if (qualifiedR32) {
    status = "qualified";
  } else {
    const allGroupsComplete = Object.values(ctx.adminComplete).every(Boolean);
    status = allGroupsComplete ? "group_out" : "not_started";
  }

  return { stage, pts, status, roundLabel };
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
  const koSlots = buildKOSlots(p);
  KO_STRUCTURE.forEach((m) => {
    const r = koResults[m.id];
    if (!r?.played) return;
    const schema = PTS_KO[m.round] || PTS_KO.r16;
    const pw = effectiveKOWinner(p, m.id, koSlots);
    const ps = p.koScores?.[m.id];
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

  // Extra: verrassing — punten voor de hoogste BEREIKTE ronde.
  if (p.surpriseTeam) {
    pts += deriveSurpriseInfo(p.surpriseTeam, results, koResults).pts;
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

// ─── KO-PUNTEN (losse categorie) ──────────────────────────────────────────────
// Zelfde logica als het KO-blok in calcPoints, maar geïsoleerd zodat we per
// deelnemer de KO-fase apart kunnen ranken voor de prijzenuitreiking.
function calcKOPoints(user, koResults) {
  const p = user.predictions || {};
  const koSlots = buildKOSlots(p);
  let pts = 0;
  KO_STRUCTURE.forEach((m) => {
    const r = koResults[m.id];
    if (!r?.played) return;
    const schema = PTS_KO[m.round] || PTS_KO.r16;
    const pw = effectiveKOWinner(p, m.id, koSlots);
    const ps = p.koScores?.[m.id];
    if (pw && r.winner === pw) pts += schema.winner;
    if (ps && ps.home !== undefined && r.home90 !== undefined) {
      const pH = parseInt(ps.home, 10);
      const pA = parseInt(ps.away, 10);
      const rH = parseInt(r.home90, 10);
      const rA = parseInt(r.away90, 10);
      if (pH === rH && pA === rA) pts += schema.exact;
      else if (pH - pA === rH - rA) pts += schema.diff;
    }
  });
  return pts;
}

// ─── EXTRA-VRAGEN PUNTEN (losse categorie) ────────────────────────────────────
// Zelfde logica als het extra-blok in calcPoints. Geeft totaal plus een detail
// per vraag terug (handig voor de prijzen-/statspagina).
function calcExtraPoints(user, results, koResults) {
  const p = user.predictions || {};
  const detail = {};
  let pts = 0;

  const championPts =
    p.champion &&
    koResults["FINAL"]?.played &&
    p.champion === koResults["FINAL"].winner
      ? PTS_EXTRA.champion
      : 0;
  detail.champion = championPts;
  pts += championPts;

  let topScorerPts = 0;
  const resultTopScorers = results["TOP_SCORERS"];
  if (resultTopScorers && Array.isArray(resultTopScorers)) {
    topScorerPts = calcTopScorerPts(p.topScorers, resultTopScorers);
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
      if (name && legacy.includes(name)) topScorerPts += 15;
    });
  }
  detail.topScorers = topScorerPts;
  pts += topScorerPts;

  const nlPts =
    p.nlStage && results["NL_STAGE"] && p.nlStage === results["NL_STAGE"]
      ? PTS_EXTRA.nlStage
      : 0;
  detail.nlStage = nlPts;
  pts += nlPts;

  const yellowPts =
    p.yellowCards &&
    results["YELLOW_CARDS"] &&
    p.yellowCards === results["YELLOW_CARDS"]
      ? PTS_EXTRA.yellowCards
      : 0;
  detail.yellowCards = yellowPts;
  pts += yellowPts;

  const surprisePts = p.surpriseTeam
    ? deriveSurpriseInfo(p.surpriseTeam, results, koResults).pts
    : 0;
  detail.surprise = surprisePts;
  pts += surprisePts;

  let topOutPts = 0;
  if (p.topOut) {
    const outs = deriveTopOuts(results, koResults);
    if (outs.includes(p.topOut)) topOutPts = PTS_TOP_OUT;
  }
  detail.topOut = topOutPts;
  pts += topOutPts;

  let cleanSheetPts = 0;
  if (p.mostCleanSheets && results["MOST_CLEAN_SHEETS"]) {
    const adminCS = Array.isArray(results["MOST_CLEAN_SHEETS"])
      ? results["MOST_CLEAN_SHEETS"]
      : [results["MOST_CLEAN_SHEETS"]];
    if (adminCS.includes(p.mostCleanSheets)) cleanSheetPts = PTS_EXTRA.mostCleanSheets;
  }
  detail.mostCleanSheets = cleanSheetPts;
  pts += cleanSheetPts;

  let groupGoalsPts = 0;
  if (p.mostGroupGoals && results["MOST_GROUP_GOALS"]) {
    const adminMGG = Array.isArray(results["MOST_GROUP_GOALS"])
      ? results["MOST_GROUP_GOALS"]
      : [results["MOST_GROUP_GOALS"]];
    if (adminMGG.includes(p.mostGroupGoals)) groupGoalsPts = PTS_EXTRA.mostGroupGoals;
  }
  detail.mostGroupGoals = groupGoalsPts;
  pts += groupGoalsPts;

  return { total: pts, detail };
}

// ─── PUNTEN PER CATEGORIE ─────────────────────────────────────────────────────
// Splitst de totaalscore op in de drie prijscategorieën:
//   group = groepswedstrijden + groepsstand
//   ko    = alle KO-wedstrijden
//   extra = alle extra vragen
// group + ko + extra === calcPoints(...).
function calcCategoryPoints(user, results, koResults) {
  const groupBd = calcGroupPointsBreakdown(user, results);
  const ko = calcKOPoints(user, koResults);
  const extra = calcExtraPoints(user, results, koResults);
  return {
    group: groupBd.totalPts,
    groupMatch: groupBd.matchPts,
    groupStanding: groupBd.standingPts,
    ko,
    extra: extra.total,
    extraDetail: extra.detail,
    total: groupBd.totalPts + ko + extra.total,
  };
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

    groups[g] = {
      matches: matchDetails,
      matchPts,
      standing: { p1, p2, a1, a2, p1pts, p2pts, allPlayed, actualTable: aS?.table || [] },
      standingPts,
      totalPts: matchPts + standingPts,
    };
  });

  return {
    matchPts: totalMatchPts,
    standingPts: totalStandingPts,
    totalPts: totalMatchPts + totalStandingPts,
    groups,
  };
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
  computeGroupCandidates,
  deriveGroupStandings,
  deriveGroupStandingsFromResults,
  groupsAllFilled,
  slotLabel,
  resolveGroupSlot,
  resolveSlotRich,
  buildRichKOSlots,
  resolveSlot,
  buildKOSlots,
  effectiveKOWinner,
  deriveTopOuts,
  deriveSurpriseInfo,
  calcTopScorerPts,
  calcGroupMatchPts,
  calcGroupPointsBreakdown,
  calcKOPoints,
  calcExtraPoints,
  calcCategoryPoints,
  calcPoints,
  fmtDate,
  fmtTime,
  fmtDateTime,
};
