import React, { useState, useEffect } from "react";
import { calcPoints, calcGroupMatchPts } from "../../pouleEngine";
import { GROUP_MATCHES, KO_STRUCTURE, PTS_KO } from "../../data/tournamentData";
import { S } from "../../styles/ui";
import { PlayerCompare } from "../compare";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const KO_DATES = {
  r32: "2026-07-01",
  r16: "2026-07-05",
  qf: "2026-07-10",
  sf: "2026-07-14",
  "3rd": "2026-07-18",
  final: "2026-07-19",
};

function calcLast5Pts(user, state) {
  const koMatchesAll = KO_STRUCTURE.map((m) => ({
    ...m,
    isKO: true,
  }));
  const allMatches = [
    ...GROUP_MATCHES.map((m) => ({ ...m, isKO: false })),
    ...koMatchesAll,
  ].sort((a, b) => (a.dt || "").localeCompare(b.dt || ""));

  const allPlayed = allMatches.filter((m) =>
    m.isKO ? state.koResults[m.id]?.played : state.results[m.id]?.played
  );
  const last5 = allPlayed.slice(-5);
  if (last5.length === 0) return null;

  const pred = user.predictions || {};
  let pts = 0;
  for (const m of last5) {
    if (m.isKO) {
      const r = state.koResults[m.id];
      const schema = PTS_KO[m.round] || PTS_KO.r16;
      const pw = pred.koWinners?.[m.id];
      const ps = pred.koScores?.[m.id];
      if (pw && r.winner === pw) pts += schema.winner;
      if (
        ps?.home !== undefined &&
        parseInt(ps.home) === parseInt(r.home90) &&
        parseInt(ps.away) === parseInt(r.away90)
      )
        pts += schema.exact;
    } else {
      const r = state.results[m.id];
      const res = calcGroupMatchPts(pred.matches?.[m.id], r);
      if (res) pts += res.pts;
    }
  }
  return { pts, count: last5.length };
}

export function calcPrimaryComp(user, state) {
  const comps = (state.competitions || []).filter(
    (c) => !c.hidden && (user?.competitionIds || []).includes(c.id)
  );
  if (!user || comps.length === 0) return null;

  return comps
    .map((c) => {
      const members = state.users.filter((u) =>
        (u.competitionIds || []).includes(c.id)
      );
      const ranked = [...members]
        .map((u) => ({
          ...u,
          pts: calcPoints(u, state.results, state.koResults),
        }))
        .sort((a, b) => b.pts - a.pts);
      const userEntry = ranked.find((u) => u.id === user.id);
      const userPts = userEntry?.pts ?? 0;
      const userRank = ranked.filter((u) => u.pts > userPts).length + 1;
      return { comp: c, size: members.length, userRank };
    })
    .sort((a, b) =>
      b.size !== a.size ? b.size - a.size : a.userRank - b.userRank
    )[0];
}

// ─── STANDINGS ────────────────────────────────────────────────────────────────

function quartileColor(pts, allSortedPts) {
  const n = allSortedPts.length;
  if (n < 2) return "var(--muted)";
  // Percentage of participants with strictly fewer points → position from bottom
  const below = allSortedPts.filter((v) => v < pts).length;
  const pct = below / n;
  if (pct < 0.25) return "var(--orange)";
  if (pct < 0.5) return "var(--muted)";
  if (pct < 0.75) return "var(--accent)";
  return "var(--green)";
}

function Standings({ state, currentUserId, onCompare }) {
  const ranked = [...state.users]
    .map((u) => ({ ...u, pts: calcPoints(u, state.results, state.koResults) }))
    .sort((a, b) => b.pts - a.pts);
  const canCompare = state.groupFrozen && currentUserId;

  // Bereken gedeelde rank: iedereen met meer punten telt mee
  function getRank(pts) {
    return ranked.filter((u) => u.pts > pts).length + 1;
  }

  // Bereken form voor alle deelnemers voor kwartiel-kleuring
  const formsMap = new Map(ranked.map((u) => [u.id, calcLast5Pts(u, state)]));
  const formCount = [...formsMap.values()].find((f) => f !== null)?.count ?? 0;
  const allSortedFormPts = [...formsMap.values()]
    .filter((f) => f !== null)
    .map((f) => f.pts)
    .sort((a, b) => a - b);

  return (
    <div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "var(--accent)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 8,
        }}
      >
        🏅 Tussenstand
      </div>
      {canCompare && (
        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12 }}>
          Klik op een naam om te vergelijken.
          {formCount > 0 && ` Vorm gebaseerd op laatste ${formCount} wedstrijden.`}
        </div>
      )}
      {ranked.length === 0 && (
        <p style={{ color: "var(--muted)" }}>Nog geen deelnemers.</p>
      )}
      {ranked.map((u) => {
        const isMe = u.id === currentUserId;
        const clickable = canCompare && !isMe;
        const rank = getRank(u.pts);
        const form = formsMap.get(u.id);
        const fColor =
          form !== null
            ? quartileColor(form.pts, allSortedFormPts)
            : null;
        return (
          <StandingRow
            key={u.id}
            user={u}
            rank={rank}
            isMe={isMe}
            clickable={clickable}
            form={form}
            formColor={fColor}
            onCompare={() => onCompare(u)}
          />
        );
      })}
    </div>
  );
}

function StandingRow({ user: u, rank, isMe, clickable, form, formColor, onCompare }) {
  return (
    <div
      onClick={clickable ? onCompare : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        ...S.card(),
        marginBottom: 8,
        background:
          rank === 1
            ? "linear-gradient(135deg,rgba(212,175,55,.12),rgba(212,175,55,.04))"
            : "var(--card)",
        border: `1px solid ${
          isMe
            ? "var(--accent)"
            : rank === 1
            ? "rgba(212,175,55,.35)"
            : "var(--border)"
        }`,
        cursor: clickable ? "pointer" : "default",
      }}
    >
      <div style={{ fontSize: 20, width: 32, textAlign: "center" }}>
        {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
      </div>
      <div style={{ flex: 1, fontWeight: isMe ? 700 : 600 }}>
        {u.name}
        {isMe ? " 👈" : ""}
      </div>
      {clickable && (
        <div style={{ fontSize: 11, color: "var(--muted)" }}>vergelijk →</div>
      )}
      <div style={{ textAlign: "right" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, justifyContent: "flex-end" }}>
          <div
            style={{
              fontSize: 26,
              fontWeight: 900,
              color: rank === 1 ? "var(--gold)" : "var(--accent)",
              fontFamily: "var(--font-display)",
            }}
          >
            {u.pts}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>pts</div>
        </div>
        {form !== null && (
          <div style={{ fontSize: 10, color: formColor, opacity: 0.85, marginTop: 1 }}>
            +{form.pts} pt
          </div>
        )}
      </div>
    </div>
  );
}

// ─── STAND WITH COMPARE ───────────────────────────────────────────────────────

function StandWithCompare({ state, currentUser }) {
  const [comparePlayer, setComparePlayer] = useState(null);

  const competitions = (state.competitions || []).filter(
    (c) => !c.hidden && (currentUser?.competitionIds || []).includes(c.id)
  );
  const primaryComp = calcPrimaryComp(currentUser, state);
  const defaultComp = primaryComp?.comp?.id || competitions[0]?.id || null;
  const [selectedComp, setSelectedComp] = useState(defaultComp);

  useEffect(() => {
    if (selectedComp === "all") return;
    const hasValidSelection = competitions.some((c) => c.id === selectedComp);
    if (competitions.length === 0) {
      if (selectedComp !== null) setSelectedComp(null);
      return;
    }
    if (!hasValidSelection && defaultComp) setSelectedComp(defaultComp);
  }, [competitions, defaultComp, selectedComp]);

  const activeCompId =
    selectedComp === "all"
      ? "all"
      : competitions.some((c) => c.id === selectedComp)
      ? selectedComp
      : defaultComp;

  const filteredUsers =
    activeCompId === "all" || competitions.length === 0
      ? state.users
      : state.users.filter((u) =>
          (u.competitionIds || []).includes(activeCompId)
        );

  return (
    <div>
      {competitions.length > 0 && (
        <CompetitionFilter
          competitions={competitions}
          state={state}
          activeCompId={activeCompId}
          onSelect={setSelectedComp}
        />
      )}
      <Standings
        state={{ ...state, users: filteredUsers }}
        currentUserId={currentUser?.id}
        onCompare={setComparePlayer}
      />
      {comparePlayer && currentUser && (
        <PlayerCompare
          me={currentUser}
          other={comparePlayer}
          state={state}
          onClose={() => setComparePlayer(null)}
        />
      )}
    </div>
  );
}

function CompetitionFilter({ competitions, state, activeCompId, onSelect }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div
        style={{
          fontSize: 11,
          color: "var(--muted)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 8,
          fontWeight: 700,
        }}
      >
        Competitie
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <button
          onClick={() => onSelect("all")}
          style={{
            padding: "6px 14px",
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "var(--font)",
            border: `1px solid ${activeCompId === "all" ? "var(--accent)" : "var(--border)"}`,
            background: activeCompId === "all" ? "var(--accent)" : "var(--bg)",
            color: activeCompId === "all" ? "#fff" : "var(--text)",
          }}
        >
          Alle deelnemers
          <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>
            ({state.users.length})
          </span>
        </button>
        {competitions.map((c) => {
          const memberCount = state.users.filter((u) =>
            (u.competitionIds || []).includes(c.id)
          ).length;
          const active = activeCompId === c.id;
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "var(--font)",
                border: `1px solid ${
                  active ? "var(--accent)" : "var(--border)"
                }`,
                background: active ? "var(--accent)" : "var(--bg)",
                color: active ? "#fff" : "var(--text)",
              }}
            >
              {c.name}
              <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>
                ({memberCount})
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { Standings, StandWithCompare };
