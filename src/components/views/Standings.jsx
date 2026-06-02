import React, { useState, useEffect } from "react";
import { calcPoints } from "../pouleEngine";
import { S } from "../styles/ui";
import { PlayerCompare } from "./compare";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

export function calcPrimaryComp(user, state) {
  const comps = (state.competitions || []).filter(
    (c) => !c.hidden && (user?.competitionIds || []).includes(c.id)
  );
  if (!user || comps.length === 0) return null;

  return comps
    .map((c) => {
      const members = state.users.filter((u) => (u.competitionIds || []).includes(c.id));
      const ranked = [...members]
        .map((u) => ({ ...u, pts: calcPoints(u, state.results, state.koResults) }))
        .sort((a, b) => b.pts - a.pts);
      const userRank = ranked.findIndex((u) => u.id === user.id) + 1;
      return { comp: c, size: members.length, userRank };
    })
    .sort((a, b) => (b.size !== a.size ? b.size - a.size : a.userRank - b.userRank))[0];
}

// ─── STANDINGS ────────────────────────────────────────────────────────────────

function Standings({ state, currentUserId, onCompare }) {
  const ranked = [...state.users]
    .map((u) => ({ ...u, pts: calcPoints(u, state.results, state.koResults) }))
    .sort((a, b) => b.pts - a.pts);
  const canCompare = state.groupFrozen && currentUserId;

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
        🏅 Tussenstand
      </div>
      {canCompare && (
        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12 }}>
          Klik op een naam om te vergelijken.
        </div>
      )}
      {ranked.length === 0 && <p style={{ color: "var(--muted)" }}>Nog geen deelnemers.</p>}
      {ranked.map((u, i) => {
        const isMe = u.id === currentUserId;
        const clickable = canCompare && !isMe;
        return (
          <StandingRow
            key={u.id}
            user={u}
            rank={i}
            isMe={isMe}
            clickable={clickable}
            onCompare={() => onCompare(u)}
          />
        );
      })}
    </div>
  );
}

function StandingRow({ user: u, rank: i, isMe, clickable, onCompare }) {
  return (
    <div
      onClick={clickable ? onCompare : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        ...S.card(),
        marginBottom: 8,
        background: i === 0 ? "linear-gradient(135deg,rgba(212,175,55,.12),rgba(212,175,55,.04))" : "var(--card)",
        border: `1px solid ${isMe ? "var(--accent)" : i === 0 ? "rgba(212,175,55,.35)" : "var(--border)"}`,
        cursor: clickable ? "pointer" : "default",
      }}
    >
      <div style={{ fontSize: 20, width: 32, textAlign: "center" }}>
        {["🥇", "🥈", "🥉"][i] || `#${i + 1}`}
      </div>
      <div style={{ flex: 1, fontWeight: isMe ? 700 : 600 }}>
        {u.name}{isMe ? " 👈" : ""}
      </div>
      {clickable && <div style={{ fontSize: 11, color: "var(--muted)" }}>vergelijk →</div>}
      <div style={{ fontSize: 26, fontWeight: 900, color: i === 0 ? "var(--gold)" : "var(--accent)", fontFamily: "var(--font-display)" }}>
        {u.pts}
      </div>
      <div style={{ fontSize: 11, color: "var(--muted)" }}>pts</div>
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
    const hasValidSelection = competitions.some((c) => c.id === selectedComp);
    if (competitions.length === 0) {
      if (selectedComp !== null) setSelectedComp(null);
      return;
    }
    if (!hasValidSelection && defaultComp) setSelectedComp(defaultComp);
  }, [competitions, defaultComp, selectedComp]);

  const activeCompId = competitions.some((c) => c.id === selectedComp)
    ? selectedComp
    : defaultComp;

  const filteredUsers =
    competitions.length === 0
      ? state.users
      : state.users.filter((u) => (u.competitionIds || []).includes(activeCompId));

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
      <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8, fontWeight: 700 }}>
        Competitie
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {competitions.map((c) => {
          const memberCount = state.users.filter((u) => (u.competitionIds || []).includes(c.id)).length;
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
                border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
                background: active ? "var(--accent)" : "var(--bg)",
                color: active ? "#fff" : "var(--text)",
              }}
            >
              {c.name}
              <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>({memberCount})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export { Standings, StandWithCompare };
