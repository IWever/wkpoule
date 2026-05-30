import {
  GROUPS,
  GROUP_MATCHES,
  KO_STRUCTURE,
  PTS_GROUP,
  PTS_STANDING,
  PTS_KO,
  PTS_EXTRA,
  PTS_SURPRISE,
  TOP_TEAMS,
  PTS_TOP_OUT,
  FLAG,
  KEY,
} from "./data/tournamentData";

// ─── STORAGE ─────────────────────────────
function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null;
  } catch {
    return null;
  }
}

const persist = (d) => localStorage.setItem(KEY, JSON.stringify(d));
const hash = (s) => btoa(encodeURIComponent(s + "_wk_salt_2026"));

// ─── BASE STATE ──────────────────────────
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
  };
}

// ─── HELPERS ─────────────────────────────
function deepSet(obj, path, value) {
  if (path.length === 1) {
    return { ...obj, [path[0]]: value };
  }
  return {
    ...obj,
    [path[0]]: deepSet(obj[path[0]] || {}, path.slice(1), value),
  };
}

// ─── GROUP STANDINGS ─────────────────────
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

      const h = parseInt(s.home);
      const a = parseInt(s.away);
      if (isNaN(h) || isNaN(a)) return;

      stat[m.home].gp++;
      stat[m.away].gp++;

      stat[m.home].gf += h;
      stat[m.home].ga += a;
      stat[m.away].gf += a;
      stat[m.away].ga += h;

      if (h > a) stat[m.home].pts += 3;
      else if (h === a) {
        stat[m.home].pts++;
        stat[m.away].pts++;
      } else stat[m.away].pts += 3;
    });

    const sorted = teams
      .slice()
      .sort(
        (a, b) =>
          stat[b].pts - stat[a].pts ||
          stat[b].gf - stat[b].ga - (stat[a].gf - stat[a].ga) ||
          stat[b].gf - stat[a].gf
      );

    standings[g] = {
      winner: sorted[0],
      runnerUp: sorted[1],
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

// ─── POINTS ──────────────────────────────
function calcGroupMatchPts(pred, result) {
  if (!result?.played || !pred) return null;

  const rH = parseInt(result.home);
  const rA = parseInt(result.away);
  const pH = parseInt(pred.home);
  const pA = parseInt(pred.away);

  if (pH === rH && pA === rA) return { pts: PTS_GROUP.exact };

  const rDiff = rH - rA;
  const pDiff = pH - pA;

  if (rDiff === pDiff) return { pts: PTS_GROUP.diff };

  if ((pDiff > 0 && rDiff > 0) || (pDiff < 0 && rDiff < 0))
    return { pts: PTS_GROUP.winner };

  return { pts: 0 };
}

function calcPoints(user, results, koResults) {
  let pts = 0;
  const p = user.predictions || {};

  GROUP_MATCHES.forEach((m) => {
    const r = results[m.id];
    const res = calcGroupMatchPts(p.matches?.[m.id], r);
    if (res) pts += res.pts;
  });

  return pts;
}

// ─── FORMAT HELPERS (BELANGRIJK VOOR JOUW ERROR) ─────────────
function fmtDate(dt) {
  if (!dt) return "";
  return new Date(dt).toLocaleDateString("nl-NL");
}

function fmtTime(dt) {
  if (!dt) return "";
  return new Date(dt).toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtDateTime(dt) {
  if (!dt) return "";
  return `${fmtDate(dt)} ${fmtTime(dt)}`;
}

// ─── EXPORT ─────────────────────────────
export {
  load,
  persist,
  hash,
  blank,
  deepSet,
  computeGroupStandings,
  deriveGroupStandings,
  deriveGroupStandingsFromResults,
  calcGroupMatchPts,
  calcPoints,
  fmtDate,
  fmtTime,
  fmtDateTime,
};
