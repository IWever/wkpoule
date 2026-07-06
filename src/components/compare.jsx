import React, { useState } from "react";
import { GROUPS, GROUP_MATCHES, KO_STRUCTURE, PTS_KO, PTS_TOPSCORER_RANK, PTS_SURPRISE, FLAG, PTS_STANDING, PLAYERS_BY_COUNTRY } from "../data/tournamentData";
import { MATCH_FACTS } from "../data/matchFacts";
import {
  calcGroupMatchPts,
  calcGroupPointsBreakdown,
  calcPoints,
  buildRichKOSlots,
  effectiveKOWinner,
  fmtDateTime,
  deriveSurpriseStage,
  deriveTopOuts,
} from "../pouleEngine";
import { S } from "../styles/ui";
import { SlotDisplay } from "./common";

// ─── OVERLAY WRAPPER ──────────────────────────────────────────────────────────

function Overlay({ onClose, children }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,.75)",
        zIndex: 200,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 760,
          background: "var(--card)",
          borderRadius: "16px 16px 0 0",
          padding: "20px 16px 40px",
          maxHeight: "88vh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function OverlayHeader({ title, subtitle, onClose }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
      }}
    >
      <div>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{title}</div>
        {subtitle && (
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
            {subtitle}
          </div>
        )}
      </div>
      <button
        onClick={onClose}
        style={{
          background: "none",
          border: "none",
          color: "var(--muted)",
          fontSize: 22,
          cursor: "pointer",
        }}
      >
        ×
      </button>
    </div>
  );
}

// ─── RESULT LABEL COLOUR ──────────────────────────────────────────────────────

function resultBg(res, played) {
  if (!res) return "var(--bg)";
  if (res.label === "exact") return "rgba(63,185,80,.15)";
  if (res.label === "diff") return "rgba(255,193,7,.1)";
  if (res.label === "winner") return "rgba(88,166,255,.1)";
  return played ? "rgba(248,81,73,.1)" : "var(--bg)";
}

// ─── SCORE HEATMAP ────────────────────────────────────────────────────────────

const MAX_GOALS = 5;

function buildGrid(preds) {
  const grid = {};
  preds.forEach(({ home, away }) => {
    const key = `${home}-${away}`;
    grid[key] = (grid[key] || 0) + 1;
  });
  return grid;
}

function ScoreHeatmap({ match, state, currentUserId }) {
  const [hovered, setHovered] = useState(null);
  const result = state.results[match.id];

  const preds = state.users
    .map((u) => u.predictions?.matches?.[match.id])
    .filter((p) => p?.home !== undefined && p.home !== "")
    .map((p) => ({ home: parseInt(p.home, 10), away: parseInt(p.away, 10) }));

  const grid = buildGrid(preds);
  const total = preds.length;
  const maxCount = total > 0 ? Math.max(...Object.values(grid)) : 1;

  const actual = result?.played
    ? { home: parseInt(result.home, 10), away: parseInt(result.away, 10) }
    : null;

  const currentUser = state.users.find((u) => u.id === currentUserId);
  const myPredRaw = currentUser?.predictions?.matches?.[match.id];
  const myScore =
    myPredRaw?.home !== undefined && myPredRaw.home !== ""
      ? { home: parseInt(myPredRaw.home, 10), away: parseInt(myPredRaw.away, 10) }
      : null;

  const cols = Array.from({ length: MAX_GOALS + 1 }, (_, i) => i);
  const rows = Array.from({ length: MAX_GOALS + 1 }, (_, i) => MAX_GOALS - i);

  function countFor(h, a) {
    return grid[`${h}-${a}`] || 0;
  }

  function cellBg(h, a, count) {
    const isActual = actual && h === actual.home && a === actual.away;
    if (isActual)
      return `rgba(63,185,80,${Math.max(
        0.12 + (count / maxCount) * 0.88,
        0.18
      )})`;
    if (count === 0) return "rgba(255,255,255,0.03)";
    return `rgba(88,166,255,${0.12 + (count / maxCount) * 0.88})`;
  }

  function cellBorder(h, a) {
    const isActual = actual && h === actual.home && a === actual.away;
    const isMyScore = myScore && h === myScore.home && a === myScore.away;
    if (isActual) return "1.5px solid rgba(63,185,80,.7)";
    if (isMyScore) return "2px solid rgba(255,255,255,.85)";
    return "1px solid rgba(48,54,61,.5)";
  }

  function cellBoxShadow(h, a) {
    const isActual = actual && h === actual.home && a === actual.away;
    const isMyScore = myScore && h === myScore.home && a === myScore.away;
    if (isMyScore && isActual) return "0 0 0 2.5px rgba(255,255,255,.7)";
    return undefined;
  }

  const hovCount = hovered ? countFor(hovered.home, hovered.away) : 0;

  const top3 = Object.entries(grid)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div>
      {/* Tooltip */}
      <div
        style={{
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
        }}
      >
        {hovered ? (
          <div
            style={{
              background:
                hovCount > 0 ? "rgba(88,166,255,.1)" : "rgba(255,255,255,.04)",
              border: `1px solid ${
                hovCount > 0 ? "rgba(88,166,255,.3)" : "var(--border)"
              }`,
              borderRadius: 8,
              padding: "5px 14px",
              fontSize: 13,
              color: "var(--text)",
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: 700 }}>
              {FLAG[match.home] || ""} {hovered.home} – {hovered.away}{" "}
              {FLAG[match.away] || ""}
            </span>
            <span style={{ color: "var(--muted)" }}>·</span>
            <span
              style={{
                color: hovCount > 0 ? "var(--accent)" : "var(--muted)",
                fontWeight: 700,
              }}
            >
              {hovCount > 0
                ? `${hovCount}× (${Math.round((hovCount / total) * 100)}%)`
                : "niemand"}
            </span>
          </div>
        ) : (
          <div
            style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}
          >
            Hover over een cel voor details
          </div>
        )}
      </div>

      {/* Grid */}
      <div style={{ display: "flex", gap: 0 }}>
        {/* Y-axis label */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            paddingBottom: 28,
          }}
        >
          <div
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              fontSize: 10,
              color: "var(--muted)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              userSelect: "none",
            }}
          >
            {FLAG[match.home] || ""} doelpunten
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {rows.map((homeGoals) => (
            <div
              key={homeGoals}
              style={{ display: "flex", alignItems: "center", marginBottom: 3 }}
            >
              {/* Row label */}
              <div
                style={{
                  width: 18,
                  fontSize: 11,
                  fontWeight: 700,
                  color:
                    actual && homeGoals === actual.home
                      ? "var(--green)"
                      : "var(--muted)",
                  textAlign: "center",
                  flexShrink: 0,
                  marginRight: 4,
                }}
              >
                {homeGoals}
              </div>

              {/* Cells */}
              {cols.map((awayGoals) => {
                const count = countFor(homeGoals, awayGoals);
                const isHovered =
                  hovered?.home === homeGoals && hovered?.away === awayGoals;
                return (
                  <div
                    key={awayGoals}
                    onMouseEnter={() =>
                      setHovered({ home: homeGoals, away: awayGoals })
                    }
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      flex: 1,
                      aspectRatio: "1",
                      marginRight: awayGoals < MAX_GOALS ? 3 : 0,
                      background: cellBg(homeGoals, awayGoals, count),
                      border: cellBorder(homeGoals, awayGoals),
                      boxShadow: cellBoxShadow(homeGoals, awayGoals),
                      borderRadius: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: count > 0 ? "pointer" : "default",
                      transition: "transform 0.1s",
                      transform: isHovered ? "scale(1.15)" : "scale(1)",
                      position: "relative",
                      zIndex: isHovered ? 2 : 1,
                    }}
                  >
                    {count > 0 && (
                      <span
                        style={{
                          fontSize: count >= 3 ? 12 : 10,
                          fontWeight: 900,
                          color:
                            actual &&
                            homeGoals === actual.home &&
                            awayGoals === actual.away
                              ? "rgba(63,185,80,.95)"
                              : `rgba(255,255,255,${
                                  0.5 + (count / maxCount) * 0.5
                                })`,
                          lineHeight: 1,
                        }}
                      >
                        {count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* X-axis labels */}
          <div style={{ display: "flex", marginTop: 5 }}>
            <div style={{ width: 22, marginRight: 4 }} />
            {cols.map((a) => (
              <div
                key={a}
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  color:
                    actual && a === actual.away
                      ? "var(--green)"
                      : "var(--muted)",
                  marginRight: a < MAX_GOALS ? 3 : 0,
                }}
              >
                {a}
              </div>
            ))}
          </div>

          {/* X-axis label */}
          <div
            style={{
              textAlign: "center",
              marginTop: 5,
              fontSize: 10,
              color: "var(--muted)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {FLAG[match.away] || ""} doelpunten
          </div>
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: 14,
          marginTop: 14,
          paddingTop: 12,
          borderTop: "1px solid var(--border)",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 2,
              background: "rgba(88,166,255,.7)",
              border: "1px solid rgba(88,166,255,.4)",
            }}
          />
          <span style={{ fontSize: 11, color: "var(--muted)" }}>
            Voorspelling
          </span>
        </div>
        {myScore && (
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                background: "rgba(255,255,255,.06)",
                border: "2px solid rgba(255,255,255,.85)",
              }}
            />
            <span style={{ fontSize: 11, color: "var(--muted)" }}>
              Jouw voorspelling ({myScore.home}–{myScore.away})
            </span>
          </div>
        )}
        {actual && (
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                background: "rgba(63,185,80,.4)",
                border: "1.5px solid rgba(63,185,80,.7)",
              }}
            />
            <span style={{ fontSize: 11, color: "var(--muted)" }}>
              Uitslag ({actual.home}–{actual.away})
            </span>
          </div>
        )}
      </div>

      {/* Top 3 meest voorspeld */}
      {top3.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 8,
            }}
          >
            Meest voorspeld
          </div>
          {top3.map(([score, count], i) => {
            const [sh, sa] = score.split("-").map(Number);
            const isCorrect =
              actual && sh === actual.home && sa === actual.away;
            return (
              <div
                key={score}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "6px 0",
                  borderBottom:
                    i < top3.length - 1
                      ? "1px solid rgba(48,54,61,.4)"
                      : "none",
                }}
              >
                <span
                  style={{ fontSize: 11, color: "var(--muted)", width: 16 }}
                >
                  #{i + 1}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "var(--text)",
                    minWidth: 40,
                  }}
                >
                  {sh} – {sa}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 5,
                    background: "var(--bg)",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${(count / total) * 100}%`,
                      background: isCorrect ? "var(--green)" : "var(--accent)",
                      borderRadius: 3,
                    }}
                  />
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: isCorrect ? "var(--green)" : "var(--accent)",
                    minWidth: 52,
                    textAlign: "right",
                  }}
                >
                  {count}× ({Math.round((count / total) * 100)}%)
                </span>
                {isCorrect && (
                  <span style={{ fontSize: 11, color: "var(--green)" }}>✓</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── SINGLE MATCH COMPARE ─────────────────────────────────────────────────────

function SingleMatchCompare({ match, state, currentUserId, onClose }) {
  const result = state.results[match.id];
  const matchPreds = state.users
    .map((u) => u.predictions?.matches?.[match.id])
    .filter((p) => p?.home !== undefined && p.home !== "")
    .map((p) => ({ home: parseInt(p.home, 10), away: parseInt(p.away, 10) }));
  const filledCount = matchPreds.length;
  const homeWins = matchPreds.filter((p) => p.home > p.away).length;
  const draws = matchPreds.filter((p) => p.home === p.away).length;
  const awayWins = matchPreds.filter((p) => p.home < p.away).length;

  const currentUser = state.users.find((u) => u.id === currentUserId);
  const myPredRaw = currentUser?.predictions?.matches?.[match.id];
  const myScore =
    myPredRaw?.home !== undefined && myPredRaw.home !== ""
      ? { home: myPredRaw.home, away: myPredRaw.away }
      : null;

  const myPts = myScore && result?.played
    ? calcGroupMatchPts(myPredRaw, result)
    : null;

  return (
    <Overlay onClose={onClose}>
      <OverlayHeader
        title={`${FLAG[match.home]} ${match.home} vs ${FLAG[match.away]} ${
          match.away
        }`}
        subtitle={`${fmtDateTime(match.dt)} · Groep ${match.group} · Ronde ${
          match.round
        } · ${filledCount} ingevuld`}
        onClose={onClose}
      />

      {MATCH_FACTS[match.id] && (
        <div
          style={{
            marginBottom: 14,
            padding: "12px 14px",
            background: "rgba(255,255,255,.03)",
            border: "1px solid rgba(255,255,255,.08)",
            borderRadius: 10,
            borderLeft: "3px solid rgba(88,166,255,.5)",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--accent)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 6,
            }}
          >
            Wist je dat...
          </div>
          <div style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.55 }}>
            {MATCH_FACTS[match.id]}
          </div>
        </div>
      )}

      {(myScore || result?.played) && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: myScore && result?.played ? "1fr 1fr" : "1fr",
            gap: 8,
            marginBottom: 14,
          }}
        >
          {myScore && (
            <div
              style={{
                textAlign: "center",
                ...S.card(),
                padding: "10px",
                background: myPts
                  ? myPts.label === "exact"
                    ? "rgba(63,185,80,.1)"
                    : myPts.label === "diff"
                    ? "rgba(255,193,7,.08)"
                    : myPts.label === "winner"
                    ? "rgba(88,166,255,.08)"
                    : result?.played
                    ? "rgba(248,81,73,.08)"
                    : "rgba(255,255,255,.04)"
                  : "rgba(255,255,255,.04)",
                border: `2px solid rgba(255,255,255,.7)`,
              }}
            >
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 2 }}>
                Jouw voorspelling
              </div>
              <div style={{ fontSize: 24, fontWeight: 900 }}>
                {myScore.home} – {myScore.away}
              </div>
              {myPts && (
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    marginTop: 4,
                    color:
                      myPts.pts > 0 ? "var(--green)" : "var(--red)",
                  }}
                >
                  {myPts.pts > 0 ? `+${myPts.pts} pt` : "✗ mis"}
                </div>
              )}
            </div>
          )}
          {result?.played && (
            <div
              style={{
                textAlign: "center",
                ...S.card(),
                padding: "10px",
                background: "rgba(63,185,80,.08)",
                border: "1px solid rgba(63,185,80,.3)",
              }}
            >
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 2 }}>
                Officiële uitslag
              </div>
              <div style={{ fontSize: 24, fontWeight: 900 }}>
                {result.home} – {result.away}
              </div>
            </div>
          )}
        </div>
      )}

      {filledCount > 0 && (
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 14,
            alignItems: "stretch",
          }}
        >
          {[
            { label: `${FLAG[match.home]} Winst`, count: homeWins, color: "var(--green)" },
            { label: "Gelijk", count: draws, color: "var(--muted)" },
            { label: `Winst ${FLAG[match.away]}`, count: awayWins, color: "var(--accent)" },
          ].map(({ label, count, color }) => (
            <div
              key={label}
              style={{
                flex: 1,
                ...S.card(),
                textAlign: "center",
                padding: "8px 4px",
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 900, color }}>
                {filledCount > 0 ? Math.round((count / filledCount) * 100) : 0}%
              </div>
              <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
                {label}
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color, marginTop: 1 }}>
                {count}×
              </div>
            </div>
          ))}
        </div>
      )}

      {filledCount === 0 ? (
        <div
          style={{
            color: "var(--muted)",
            fontSize: 13,
            textAlign: "center",
            padding: 20,
          }}
        >
          Niemand heeft deze wedstrijd ingevuld.
        </div>
      ) : (
        <ScoreHeatmap
          match={match}
          state={state}
          currentUserId={currentUserId}
        />
      )}

    </Overlay>
  );
}

// ─── MATCH COMPARE ────────────────────────────────────────────────────────────

function MatchCompare({ state, currentUserId, onClose }) {
  const [groupBy, setGroupBy] = useState("poule");
  const [filter, setFilter] = useState("poule_A");

  const groups = Object.keys(GROUPS);

  const matchesToShow =
    groupBy === "poule"
      ? GROUP_MATCHES.filter((m) => m.group === filter.replace("poule_", ""))
      : GROUP_MATCHES.filter(
          (m) => m.round === parseInt(filter.replace("ronde_", ""))
        );

  const users = state.users.filter((u) =>
    matchesToShow.some((m) => {
      const pm = u.predictions?.matches?.[m.id];
      return pm?.home !== undefined && pm.home !== "";
    })
  );

  function userPts(u) {
    return matchesToShow.reduce((sum, m) => {
      const res = calcGroupMatchPts(
        u.predictions?.matches?.[m.id],
        state.results[m.id]
      );
      return sum + (res?.pts ?? 0);
    }, 0);
  }

  const sortedUsers = [...users].sort((a, b) => userPts(b) - userPts(a));

  return (
    <Overlay onClose={onClose}>
      <OverlayHeader title="Wedstrijden vergelijken" onClose={onClose} />

      {/* Group-by toggle */}
      <div
        style={{
          display: "flex",
          background: "var(--bg)",
          borderRadius: 8,
          padding: 3,
          marginBottom: 10,
        }}
      >
        {[
          ["poule", "Per poule"],
          ["ronde", "Per speelronde"],
        ].map(([v, l]) => (
          <button
            key={v}
            onClick={() => {
              setGroupBy(v);
              setFilter(v === "poule" ? "poule_A" : "ronde_1");
            }}
            style={{
              flex: 1,
              padding: "6px",
              background: groupBy === v ? "var(--accent)" : "none",
              color: groupBy === v ? "#fff" : "var(--muted)",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontWeight: 600,
              fontSize: 12,
              fontFamily: "var(--font)",
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Filter chips */}
      <div
        style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}
      >
        {groupBy === "poule"
          ? groups.map((g) => (
              <FilterChip
                key={g}
                label={`Poule ${g}`}
                active={filter === `poule_${g}`}
                onClick={() => setFilter(`poule_${g}`)}
              />
            ))
          : [1, 2, 3].map((r) => (
              <FilterChip
                key={r}
                label={`Ronde ${r}`}
                active={filter === `ronde_${r}`}
                onClick={() => setFilter(`ronde_${r}`)}
              />
            ))}
      </div>

      {sortedUsers.length === 0 ? (
        <div
          style={{
            color: "var(--muted)",
            fontSize: 13,
            textAlign: "center",
            padding: 20,
          }}
        >
          Niemand heeft wedstrijden in dit filter ingevuld.
        </div>
      ) : (
        <MatchGrid
          matches={matchesToShow}
          users={sortedUsers}
          state={state}
          currentUserId={currentUserId}
          userPts={userPts}
        />
      )}
    </Overlay>
  );
}

function FilterChip({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "4px 12px",
        borderRadius: 20,
        border: "1px solid var(--border)",
        background: active ? "var(--accent)" : "var(--bg)",
        color: active ? "#fff" : "var(--text)",
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {label}
    </button>
  );
}

function MatchGrid({ matches, users, state, currentUserId, userPts }) {
  const cols = `140px repeat(${users.length}, 1fr)`;
  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: cols,
          gap: 4,
          marginBottom: 6,
          alignItems: "center",
        }}
      >
        <div />
        {users.map((u) => {
          const isMe = u.id === currentUserId;
          return (
            <div
              key={u.id}
              style={{
                textAlign: "center",
                fontSize: 12,
                fontWeight: isMe ? 700 : 600,
                color: isMe ? "var(--accent)" : "var(--text)",
              }}
            >
              <div>
                {u.name}
                {isMe ? " 👈" : ""}
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>
                {userPts(u)} pt
              </div>
            </div>
          );
        })}
      </div>

      {matches.map((m) => {
        const result = state.results[m.id];
        return (
          <div
            key={m.id}
            style={{
              display: "grid",
              gridTemplateColumns: cols,
              gap: 4,
              marginBottom: 5,
              alignItems: "center",
            }}
          >
            <div
              style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.3 }}
            >
              <div
                style={{ fontWeight: 600, color: "var(--text)", fontSize: 12 }}
              >
                {FLAG[m.home]} {m.home}
              </div>
              <div style={{ fontSize: 10 }}>
                vs {FLAG[m.away]} {m.away}
              </div>
              {result?.played && (
                <div style={{ color: "var(--green)", fontWeight: 700 }}>
                  {result.home}–{result.away}
                </div>
              )}
            </div>
            {users.map((u) => {
              const pm = u.predictions?.matches?.[m.id];
              const isMe = u.id === currentUserId;
              const res = calcGroupMatchPts(pm, result);
              const hasPred = pm?.home !== undefined && pm.home !== "";
              return (
                <div
                  key={u.id}
                  style={{
                    textAlign: "center",
                    background: resultBg(res, result?.played),
                    borderRadius: 6,
                    padding: "4px 2px",
                    border: `1px solid ${
                      isMe ? "rgba(88,166,255,.3)" : "rgba(48,54,61,.5)"
                    }`,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 13,
                      color: isMe ? "var(--accent)" : "var(--text)",
                    }}
                  >
                    {hasPred ? (
                      `${pm.home}–${pm.away}`
                    ) : (
                      <span style={{ color: "var(--muted)", fontSize: 11 }}>
                        –
                      </span>
                    )}
                  </div>
                  {res && (
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: res.pts > 0 ? "var(--green)" : "var(--red)",
                      }}
                    >
                      {res.pts > 0 ? `+${res.pts}` : ""}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ─── KO COMPARE HELPERS ───────────────────────────────────────────────────────

const KO_ROUND_LABELS = {
  r32: "Zestiende finales",
  r16: "Achtste finales",
  qf: "Kwartfinales",
  sf: "Halve finales",
  "3rd": "3de/4de plaats",
  final: "Finale",
};

function calcKOMatchPts(m, userPred, koResults) {
  const r = koResults?.[m.id];
  if (!r?.played) return null;
  const schema = PTS_KO[m.round] || PTS_KO.r16;
  const pw = effectiveKOWinner(userPred, m.id);
  const ps = userPred?.koScores?.[m.id];
  if (!pw && (ps?.home === undefined || ps.home === "")) return null;
  const winOk = !!pw && r.winner === pw;
  let pts = winOk ? schema.winner : 0;
  let scoreOk = false;
  let diffOk = false;
  if (ps?.home !== undefined && ps.home !== "" && r.home90 !== undefined) {
    const pH = parseInt(ps.home, 10);
    const pA = parseInt(ps.away, 10);
    const rH = parseInt(r.home90, 10);
    const rA = parseInt(r.away90, 10);
    if (pH === rH && pA === rA) {
      pts += schema.exact;
      scoreOk = true;
    } else if (pH - pA === rH - rA) {
      pts += schema.diff;
      diffOk = true;
    }
  }
  return { pts, winOk, scoreOk, diffOk };
}

function koResultBg(res, played) {
  if (!res || !played) return "var(--bg)";
  if (res.scoreOk) return "rgba(63,185,80,.15)";
  if (res.diffOk) return "rgba(255,193,7,.1)";
  if (res.winOk) return "rgba(88,166,255,.1)";
  return "rgba(248,81,73,.1)";
}

function KOCompareSection({ section, me, other, state, richSlots }) {
  const myPred = me.predictions || {};
  const otherPred = other.predictions || {};

  function koSectionPts(u) {
    return section.matches.reduce((sum, m) => {
      const res = calcKOMatchPts(m, u.predictions, state.koResults);
      return sum + (res?.pts ?? 0);
    }, 0);
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "90px 1fr 1fr",
          gap: 6,
          marginBottom: 6,
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--muted)",
            textTransform: "uppercase",
          }}
        >
          {section.label}
        </div>
        <div style={{ textAlign: "center", fontSize: 11, color: "var(--accent)", fontWeight: 700 }}>
          {koSectionPts(me)} pt
        </div>
        <div style={{ textAlign: "center", fontSize: 11, color: "var(--orange)", fontWeight: 700 }}>
          {koSectionPts(other)} pt
        </div>
      </div>

      {section.matches.map((m) => {
        const r = state.koResults[m.id];
        const myRes = calcKOMatchPts(m, me.predictions, state.koResults);
        const otRes = calcKOMatchPts(m, other.predictions, state.koResults);
        const homeInfo = richSlots?.[m.id]?.home;
        const awayInfo = richSlots?.[m.id]?.away;
        const homeLabel =
          homeInfo?.type === "team"
            ? `${FLAG[homeInfo.team] || ""} ${homeInfo.team}`
            : homeInfo?.label || m.homeSlot;
        const awayLabel =
          awayInfo?.type === "team"
            ? `${FLAG[awayInfo.team] || ""} ${awayInfo.team}`
            : awayInfo?.label || m.awaySlot;
        const myWinner = myPred.koWinners?.[m.id];
        const myScore = myPred.koScores?.[m.id];
        const otWinner = otherPred.koWinners?.[m.id];
        const otScore = otherPred.koScores?.[m.id];

        return (
          <div
            key={m.id}
            style={{
              display: "grid",
              gridTemplateColumns: "90px 1fr 1fr",
              gap: 4,
              marginBottom: 4,
              alignItems: "start",
            }}
          >
            <div style={{ fontSize: 10, color: "var(--muted)", lineHeight: 1.4 }}>
              <div style={{ color: "var(--text)" }}>{homeLabel}</div>
              <div style={{ color: "var(--text)" }}>{awayLabel}</div>
              {r?.played && (
                <div style={{ color: "var(--green)", fontWeight: 700, marginTop: 2 }}>
                  {FLAG[r.winner] || ""} {r.winner}
                  {r.home90 !== undefined && (
                    <span style={{ color: "var(--muted)", fontWeight: 400 }}>
                      {" "}({r.home90}–{r.away90})
                    </span>
                  )}
                </div>
              )}
            </div>
            {[
              { winner: myWinner, score: myScore, res: myRes, accent: "var(--accent)" },
              { winner: otWinner, score: otScore, res: otRes, accent: "var(--orange)" },
            ].map(({ winner, score, res, accent }, idx) => (
              <div
                key={idx}
                style={{
                  textAlign: "center",
                  borderRadius: 6,
                  padding: "4px 2px",
                  background: koResultBg(res, r?.played),
                }}
              >
                {winner ? (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 700, color: accent }}>
                      {FLAG[winner] || ""} {winner}
                    </div>
                    {score?.home !== undefined && (
                      <div style={{ fontSize: 10, color: "var(--muted)" }}>
                        {score.home}–{score.away}
                      </div>
                    )}
                    {res !== null && r?.played && (
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: res.pts > 0 ? "var(--green)" : "var(--red)",
                        }}
                      >
                        {res.pts > 0 ? `+${res.pts}` : "✗"}
                      </div>
                    )}
                  </>
                ) : (
                  <span style={{ color: "var(--muted)", fontSize: 11 }}>–</span>
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

// ─── PLAYER COMPARE ───────────────────────────────────────────────────────────

function PlayerCompare({ me, other, state, onClose }) {
  const [groupBy, setGroupBy] = useState("ronde");
  const myPred = me.predictions || {};
  const otherPred = other.predictions || {};
  const myPts = calcPoints(me, state.results, state.koResults);
  const otherPts = calcPoints(other, state.results, state.koResults);
  const myBreakdown = calcGroupPointsBreakdown(me, state.results);
  const otherBreakdown = calcGroupPointsBreakdown(other, state.results);

  const frozenKORounds = state.koFrozenRounds || {};
  const isKOPhase = !!frozenKORounds.r32;
  const richSlots = buildRichKOSlots({}, state.results, state.koResults);

  const koSections = Object.keys(KO_ROUND_LABELS)
    .filter((round) => frozenKORounds[round])
    .map((round) => ({
      key: round,
      label: KO_ROUND_LABELS[round],
      matches: KO_STRUCTURE.filter((m) => m.round === round),
    }));

  const sections = isKOPhase
    ? []
    : groupBy === "poule"
    ? Object.keys(GROUPS).map((g) => ({
        key: g,
        label: `Poule ${g}`,
        matches: GROUP_MATCHES.filter((m) => m.group === g),
      }))
    : [1, 2, 3].map((r) => ({
        key: `r${r}`,
        label: `Speelronde ${r}`,
        matches: GROUP_MATCHES.filter((m) => m.round === r),
      }));

  function sectionPts(u, matches) {
    return matches.reduce((sum, m) => {
      const res = calcGroupMatchPts(
        u.predictions?.matches?.[m.id],
        state.results[m.id]
      );
      return sum + (res?.pts ?? 0);
    }, 0);
  }

  function calcKOTotalPts(u) {
    return KO_STRUCTURE.reduce((sum, m) => {
      const res = calcKOMatchPts(m, u.predictions, state.koResults);
      return sum + (res?.pts ?? 0);
    }, 0);
  }

  const myKOPts = calcKOTotalPts(me);
  const otKOPts = calcKOTotalPts(other);
  const myExtraPts = myPts - myBreakdown.matchPts - myBreakdown.standingPts - myKOPts;
  const otExtraPts = otherPts - otherBreakdown.matchPts - otherBreakdown.standingPts - otKOPts;

  const breakdown = [
    ["Extra vragen", myExtraPts, otExtraPts],
    ["Groepswedstrijden", myBreakdown.matchPts, otherBreakdown.matchPts],
    ["Stand groepsfase", myBreakdown.standingPts, otherBreakdown.standingPts],
    ["KO-fase", myKOPts, otKOPts],
  ];

  return (
    <Overlay onClose={onClose}>
      <OverlayHeader title="Vergelijking" onClose={onClose} />

      {/* Header row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "90px 1fr 1fr",
          gap: 6,
          marginBottom: 6,
          alignItems: "center",
        }}
      >
        <div />
        <div style={{ textAlign: "center", fontWeight: 700, fontSize: 14, color: "var(--accent)" }}>
          {me.name}
        </div>
        <div style={{ textAlign: "center", fontWeight: 700, fontSize: 14, color: "var(--orange)" }}>
          {other.name}
        </div>
      </div>

      {/* Points breakdown */}
      {breakdown.map(([label, myV, otV]) => (
        <div
          key={label}
          style={{
            display: "grid",
            gridTemplateColumns: "90px 1fr 1fr",
            gap: 6,
            marginBottom: 3,
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 10, color: "var(--muted)" }}>{label}</div>
          <div style={{ textAlign: "center", fontSize: 11, color: "var(--accent)", fontWeight: 600 }}>
            {myV} pt
          </div>
          <div style={{ textAlign: "center", fontSize: 11, color: "var(--orange)", fontWeight: 600 }}>
            {otV} pt
          </div>
        </div>
      ))}

      {/* Totaal */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "90px 1fr 1fr",
          gap: 6,
          marginTop: 4,
          marginBottom: 14,
          paddingTop: 6,
          borderTop: "1px solid var(--border)",
          alignItems: "center",
        }}
      >
        <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 700 }}>Totaal</div>
        <div style={{ textAlign: "center", fontSize: 18, color: "var(--accent)", fontWeight: 900 }}>
          {myPts} pt
        </div>
        <div style={{ textAlign: "center", fontSize: 18, color: "var(--orange)", fontWeight: 900 }}>
          {otherPts} pt
        </div>
      </div>

      {/* Extra predictions */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--accent)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 8,
        }}
      >
        Extra vragen
      </div>
      {[
        [
          "Kampioen",
          myPred.champion
            ? `${FLAG[myPred.champion] || ""} ${myPred.champion}`
            : "",
          otherPred.champion
            ? `${FLAG[otherPred.champion] || ""} ${otherPred.champion}`
            : "",
        ],
        [
          "Topscoorders",
          Array.isArray(myPred.topScorers)
            ? myPred.topScorers.filter(Boolean).join(", ")
            : myPred.topScorer || "",
          Array.isArray(otherPred.topScorers)
            ? otherPred.topScorers.filter(Boolean).join(", ")
            : otherPred.topScorer || "",
        ],
        ["Nederland", myPred.nlStage || "", otherPred.nlStage || ""],
        [
          "Verrassing",
          myPred.surpriseTeam
            ? `${FLAG[myPred.surpriseTeam] || ""} ${myPred.surpriseTeam}`
            : "",
          otherPred.surpriseTeam
            ? `${FLAG[otherPred.surpriseTeam] || ""} ${otherPred.surpriseTeam}`
            : "",
        ],
        [
          "Topland",
          myPred.topOut ? `${FLAG[myPred.topOut] || ""} ${myPred.topOut}` : "",
          otherPred.topOut
            ? `${FLAG[otherPred.topOut] || ""} ${otherPred.topOut}`
            : "",
        ],
        [
          "Gele kaarten",
          myPred.yellowCards
            ? `${FLAG[myPred.yellowCards] || ""} ${myPred.yellowCards}`
            : "",
          otherPred.yellowCards
            ? `${FLAG[otherPred.yellowCards] || ""} ${otherPred.yellowCards}`
            : "",
        ],
        [
          "Clean sheets",
          myPred.mostCleanSheets
            ? `${FLAG[myPred.mostCleanSheets] || ""} ${myPred.mostCleanSheets}`
            : "",
          otherPred.mostCleanSheets
            ? `${FLAG[otherPred.mostCleanSheets] || ""} ${otherPred.mostCleanSheets}`
            : "",
        ],
        [
          "Groep goals",
          myPred.mostGroupGoals
            ? `${FLAG[myPred.mostGroupGoals] || ""} ${myPred.mostGroupGoals}`
            : "",
          otherPred.mostGroupGoals
            ? `${FLAG[otherPred.mostGroupGoals] || ""} ${otherPred.mostGroupGoals}`
            : "",
        ],
      ].map(([label, myVal, otherVal]) => (
        <ExtraRow key={label} label={label} myVal={myVal} otherVal={otherVal} />
      ))}

      {/* Groepsfase standen */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--accent)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginTop: 14,
          marginBottom: 8,
        }}
      >
        Stand groepsfase
      </div>
      <ExtraRow
        label="Punten"
        myVal={`${myBreakdown.standingPts} pt`}
        otherVal={`${otherBreakdown.standingPts} pt`}
      />

      {/* Group-by toggle: alleen in groepsfase */}
      {!isKOPhase && (
        <div style={{ marginTop: 18, marginBottom: 10 }}>
          <div
            style={{
              display: "flex",
              background: "var(--bg)",
              borderRadius: 8,
              padding: 3,
            }}
          >
            {[
              ["ronde", "Per speelronde"],
              ["poule", "Per poule"],
            ].map(([v, l]) => (
              <button
                key={v}
                onClick={() => setGroupBy(v)}
                style={{
                  flex: 1,
                  padding: "6px",
                  background: groupBy === v ? "var(--accent)" : "none",
                  color: groupBy === v ? "#fff" : "var(--muted)",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontWeight: 600,
                  fontSize: 12,
                  fontFamily: "var(--font)",
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Groepswedstrijden: verbergen in KO-fase */}
      {!isKOPhase && sections.map((sec) => {
        const myGroupData = groupBy === "poule" ? myBreakdown.groups[sec.key] : null;
        const otherGroupData = groupBy === "poule" ? otherBreakdown.groups[sec.key] : null;
        return (
          <CompareSection
            key={sec.key}
            section={sec}
            me={me}
            other={other}
            state={state}
            mySecPts={sectionPts(me, sec.matches) + (myGroupData?.standingPts ?? 0)}
            otherSecPts={sectionPts(other, sec.matches) + (otherGroupData?.standingPts ?? 0)}
            myGroupData={myGroupData}
            otherGroupData={otherGroupData}
          />
        );
      })}

      {/* KO-wedstrijden: gebevroren rondes */}
      {koSections.length > 0 && (
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--accent)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginTop: 14,
            marginBottom: 8,
          }}
        >
          KO-fase
        </div>
      )}
      {koSections.map((sec) => (
        <KOCompareSection
          key={sec.key}
          section={sec}
          me={me}
          other={other}
          state={state}
          richSlots={richSlots}
        />
      ))}
    </Overlay>
  );
}

function ExtraRow({ label, myVal, otherVal }) {
  const same = myVal && otherVal && myVal === otherVal;
  const cellStyle = {
    flex: 1,
    ...S.card(),
    padding: "5px 10px",
    fontWeight: 600,
    fontSize: 13,
    border: `1px solid ${same ? "rgba(88,166,255,.4)" : "var(--border)"}`,
  };
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
      <div
        style={{
          width: 80,
          color: "var(--muted)",
          fontSize: 11,
          paddingTop: 4,
        }}
      >
        {label}
      </div>
      <div style={{ ...cellStyle, color: "var(--accent)" }}>
        {myVal || (
          <span style={{ color: "var(--muted)", fontWeight: 400 }}>–</span>
        )}
      </div>
      <div style={{ ...cellStyle, color: "var(--orange)" }}>
        {otherVal || (
          <span style={{ color: "var(--muted)", fontWeight: 400 }}>–</span>
        )}
      </div>
    </div>
  );
}

function StandingCompareRow({ myGroupData, otherGroupData }) {
  const myS = myGroupData?.standing;
  const otS = otherGroupData?.standing;
  if (!myS && !otS) return null;

  const allPlayed = myS?.allPlayed || otS?.allPlayed;
  const a1 = myS?.a1 || otS?.a1;
  const a2 = myS?.a2 || otS?.a2;
  const top2 = allPlayed && a1 && a2 ? [a1, a2] : null;

  function posColor(pred, actual) {
    if (!allPlayed || !pred) return "var(--muted)";
    if (pred === actual) return "var(--green)";
    if (top2?.includes(pred)) return "#e8c547";
    return "var(--red)";
  }

  function StandCell({ s, data }) {
    return (
      <div
        style={{
          ...S.card(),
          padding: "6px 8px",
          fontSize: 11,
          fontWeight: 600,
        }}
      >
        <div style={{ color: posColor(s?.p1, a1), marginBottom: 2 }}>
          #1{" "}
          {s?.p1 ? (
            `${FLAG[s.p1] || ""} ${s.p1}`
          ) : (
            <span style={{ color: "var(--muted)", fontWeight: 400 }}>–</span>
          )}
        </div>
        <div style={{ color: posColor(s?.p2, a2), marginBottom: 2 }}>
          #2{" "}
          {s?.p2 ? (
            `${FLAG[s.p2] || ""} ${s.p2}`
          ) : (
            <span style={{ color: "var(--muted)", fontWeight: 400 }}>–</span>
          )}
        </div>
        {allPlayed && (
          <div
            style={{
              fontWeight: 700,
              fontSize: 10,
              marginTop: 4,
              color:
                (data?.standingPts || 0) > 0 ? "var(--green)" : "var(--muted)",
            }}
          >
            {data?.standingPts || 0} pt stand
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "90px 1fr 1fr",
        gap: 4,
        marginTop: 8,
        alignItems: "start",
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: "var(--muted)",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          paddingTop: 4,
        }}
      >
        Eindstand
      </div>
      <StandCell s={myS} data={myGroupData} />
      <StandCell s={otS} data={otherGroupData} />
    </div>
  );
}

function CompareSection({ section, me, other, state, mySecPts, otherSecPts, myGroupData, otherGroupData }) {
  const myPred = me.predictions || {};
  const otherPred = other.predictions || {};

  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "90px 1fr 1fr",
          gap: 6,
          marginBottom: 6,
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--muted)",
            textTransform: "uppercase",
          }}
        >
          {section.label}
        </div>
        <div
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "var(--accent)",
            fontWeight: 700,
          }}
        >
          {mySecPts} pt
        </div>
        <div
          style={{
            textAlign: "center",
            fontSize: 11,
            color: "var(--orange)",
            fontWeight: 700,
          }}
        >
          {otherSecPts} pt
        </div>
      </div>

      {section.matches.map((m) => {
        const my = myPred.matches?.[m.id];
        const ot = otherPred.matches?.[m.id];
        const r = state.results[m.id];
        const myRes = calcGroupMatchPts(my, r);
        const otRes = calcGroupMatchPts(ot, r);
        const same =
          my?.home !== undefined &&
          my.home !== "" &&
          ot?.home !== undefined &&
          ot.home !== "" &&
          my.home === ot.home &&
          my.away === ot.away;
        const hasMy = my?.home !== undefined && my.home !== "";
        const hasOt = ot?.home !== undefined && ot.home !== "";

        return (
          <div
            key={m.id}
            style={{
              display: "grid",
              gridTemplateColumns: "90px 1fr 1fr",
              gap: 4,
              marginBottom: 4,
              alignItems: "center",
            }}
          >
            <div
              style={{ fontSize: 10, color: "var(--muted)", lineHeight: 1.3 }}
            >
              <span style={{ color: "var(--text)" }}>
                {FLAG[m.home]} {m.home}
              </span>
              <br />
              <span style={{ color: "var(--text)" }}>
                {FLAG[m.away]} {m.away}
              </span>
              {r?.played && (
                <div style={{ color: "var(--green)", fontWeight: 700 }}>
                  {r.home}–{r.away}
                </div>
              )}
            </div>
            {[
              { res: myRes, pred: my, has: hasMy, accent: "var(--accent)" },
              { res: otRes, pred: ot, has: hasOt, accent: "var(--orange)" },
            ].map(({ res, pred, has, accent }, idx) => (
              <div
                key={idx}
                style={{
                  textAlign: "center",
                  borderRadius: 6,
                  padding: "4px 2px",
                  background: resultBg(res, r?.played),
                  border: `1px solid ${
                    same ? "rgba(88,166,255,.3)" : "rgba(48,54,61,.5)"
                  }`,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13, color: accent }}>
                  {has ? (
                    `${pred.home}–${pred.away}`
                  ) : (
                    <span style={{ color: "var(--muted)", fontSize: 11 }}>
                      –
                    </span>
                  )}
                </div>
                {res && r?.played && (
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: res.pts > 0 ? "var(--green)" : "var(--red)",
                    }}
                  >
                    {res.pts > 0 ? `+${res.pts}` : ""}
                  </div>
                )}
              </div>
            ))}
          </div>
        );
      })}
      <StandingCompareRow myGroupData={myGroupData} otherGroupData={otherGroupData} />
    </div>
  );
}

// ─── KO SCORE HEATMAP ────────────────────────────────────────────────────────

function KOScoreHeatmap({ match, state, currentUserId, homeTeam, awayTeam }) {
  const [hovered, setHovered] = useState(null);
  const r = state.koResults[match.id];

  const preds = state.users
    .map((u) => u.predictions?.koScores?.[match.id])
    .filter((p) => p?.home !== undefined && p.home !== "")
    .map((p) => ({ home: parseInt(p.home, 10), away: parseInt(p.away, 10) }));

  const grid = buildGrid(preds);
  const total = preds.length;
  const maxCount = total > 0 ? Math.max(...Object.values(grid)) : 1;

  const actual =
    r?.played && r.home90 !== undefined
      ? { home: parseInt(r.home90, 10), away: parseInt(r.away90, 10) }
      : null;

  const currentUser = state.users.find((u) => u.id === currentUserId);
  const myPredRaw = currentUser?.predictions?.koScores?.[match.id];
  const myScore =
    myPredRaw?.home !== undefined && myPredRaw.home !== ""
      ? { home: parseInt(myPredRaw.home, 10), away: parseInt(myPredRaw.away, 10) }
      : null;

  const cols = Array.from({ length: MAX_GOALS + 1 }, (_, i) => i);
  const rows = Array.from({ length: MAX_GOALS + 1 }, (_, i) => MAX_GOALS - i);

  function countFor(h, a) {
    return grid[`${h}-${a}`] || 0;
  }

  function cellBg(h, a, count) {
    const isActual = actual && h === actual.home && a === actual.away;
    if (isActual)
      return `rgba(63,185,80,${Math.max(0.12 + (count / maxCount) * 0.88, 0.18)})`;
    if (count === 0) return "rgba(255,255,255,0.03)";
    return `rgba(88,166,255,${0.12 + (count / maxCount) * 0.88})`;
  }

  function cellBorder(h, a) {
    const isActual = actual && h === actual.home && a === actual.away;
    const isMy = myScore && h === myScore.home && a === myScore.away;
    if (isActual) return "1.5px solid rgba(63,185,80,.7)";
    if (isMy) return "2px solid rgba(255,255,255,.85)";
    return "1px solid rgba(48,54,61,.5)";
  }

  function cellBoxShadow(h, a) {
    const isActual = actual && h === actual.home && a === actual.away;
    const isMy = myScore && h === myScore.home && a === myScore.away;
    if (isMy && isActual) return "0 0 0 2.5px rgba(255,255,255,.7)";
    return undefined;
  }

  if (total === 0) return null;

  const hovCount = hovered ? countFor(hovered.home, hovered.away) : 0;
  const homeLabel = homeTeam ? `${FLAG[homeTeam] || ""} ${homeTeam}` : "Thuis";
  const awayLabel = awayTeam ? `${FLAG[awayTeam] || ""} ${awayTeam}` : "Uit";

  return (
    <div style={{ marginTop: 14 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "var(--accent)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: 10,
        }}
      >
        Score na 90' verdeling
      </div>

      {/* Tooltip */}
      <div
        style={{
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 10,
        }}
      >
        {hovered ? (
          <div
            style={{
              background: hovCount > 0 ? "rgba(88,166,255,.1)" : "rgba(255,255,255,.04)",
              border: `1px solid ${hovCount > 0 ? "rgba(88,166,255,.3)" : "var(--border)"}`,
              borderRadius: 8,
              padding: "5px 14px",
              fontSize: 13,
              color: "var(--text)",
              display: "flex",
              gap: 10,
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: 700 }}>
              {homeLabel} {hovered.home} – {hovered.away} {awayLabel}
            </span>
            <span style={{ color: "var(--muted)" }}>·</span>
            <span
              style={{
                color: hovCount > 0 ? "var(--accent)" : "var(--muted)",
                fontWeight: 700,
              }}
            >
              {hovCount > 0
                ? `${hovCount}× (${Math.round((hovCount / total) * 100)}%)`
                : "niemand"}
            </span>
          </div>
        ) : (
          <div style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>
            Hover over een cel voor details
          </div>
        )}
      </div>

      {/* Grid */}
      <div style={{ display: "flex", gap: 0 }}>
        {/* Y-axis label */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 24,
            paddingBottom: 28,
          }}
        >
          <div
            style={{
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              fontSize: 10,
              color: "var(--muted)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              userSelect: "none",
            }}
          >
            {homeLabel} doelpunten
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {rows.map((homeGoals) => (
            <div
              key={homeGoals}
              style={{ display: "flex", alignItems: "center", marginBottom: 3 }}
            >
              <div
                style={{
                  width: 18,
                  fontSize: 11,
                  fontWeight: 700,
                  color:
                    actual && homeGoals === actual.home
                      ? "var(--green)"
                      : "var(--muted)",
                  textAlign: "center",
                  flexShrink: 0,
                  marginRight: 4,
                }}
              >
                {homeGoals}
              </div>
              {cols.map((awayGoals) => {
                const count = countFor(homeGoals, awayGoals);
                const isHovered =
                  hovered?.home === homeGoals && hovered?.away === awayGoals;
                return (
                  <div
                    key={awayGoals}
                    onMouseEnter={() => setHovered({ home: homeGoals, away: awayGoals })}
                    onMouseLeave={() => setHovered(null)}
                    style={{
                      flex: 1,
                      aspectRatio: "1",
                      marginRight: awayGoals < MAX_GOALS ? 3 : 0,
                      background: cellBg(homeGoals, awayGoals, count),
                      border: cellBorder(homeGoals, awayGoals),
                      boxShadow: cellBoxShadow(homeGoals, awayGoals),
                      borderRadius: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: count > 0 ? "pointer" : "default",
                      transition: "transform 0.1s",
                      transform: isHovered ? "scale(1.15)" : "scale(1)",
                      position: "relative",
                      zIndex: isHovered ? 2 : 1,
                    }}
                  >
                    {count > 0 && (
                      <span
                        style={{
                          fontSize: count >= 3 ? 12 : 10,
                          fontWeight: 900,
                          color:
                            actual &&
                            homeGoals === actual.home &&
                            awayGoals === actual.away
                              ? "rgba(63,185,80,.95)"
                              : `rgba(255,255,255,${0.5 + (count / maxCount) * 0.5})`,
                          lineHeight: 1,
                        }}
                      >
                        {count}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* X-axis numbers */}
          <div style={{ display: "flex", marginTop: 5 }}>
            <div style={{ width: 22, marginRight: 4 }} />
            {cols.map((a) => (
              <div
                key={a}
                style={{
                  flex: 1,
                  textAlign: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  color: actual && a === actual.away ? "var(--green)" : "var(--muted)",
                  marginRight: a < MAX_GOALS ? 3 : 0,
                }}
              >
                {a}
              </div>
            ))}
          </div>

          {/* X-axis label */}
          <div
            style={{
              textAlign: "center",
              marginTop: 5,
              fontSize: 10,
              color: "var(--muted)",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {awayLabel} doelpunten
          </div>
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: 14,
          marginTop: 14,
          paddingTop: 12,
          borderTop: "1px solid var(--border)",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 2,
              background: "rgba(88,166,255,.7)",
              border: "1px solid rgba(88,166,255,.4)",
            }}
          />
          <span style={{ fontSize: 11, color: "var(--muted)" }}>Voorspelling</span>
        </div>
        {myScore && (
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                background: "rgba(255,255,255,.08)",
                border: "2px solid rgba(255,255,255,.85)",
              }}
            />
            <span style={{ fontSize: 11, color: "var(--muted)" }}>Jouw score</span>
          </div>
        )}
        {actual && (
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                background: "rgba(63,185,80,.5)",
                border: "1.5px solid rgba(63,185,80,.7)",
              }}
            />
            <span style={{ fontSize: 11, color: "var(--muted)" }}>Uitslag</span>
          </div>
        )}
        <div style={{ marginLeft: "auto", fontSize: 11, color: "var(--muted)" }}>
          {total} score{total !== 1 ? "s" : ""} ingevuld
        </div>
      </div>
    </div>
  );
}

// ─── SINGLE KO MATCH COMPARE ─────────────────────────────────────────────────

function SingleKOMatchCompare({ match, state, currentUserId, onClose }) {
  const r = state.koResults[match.id];
  const schema = PTS_KO[match.round] || PTS_KO.r16;

  const richSlots = buildRichKOSlots({}, state.results, state.koResults);
  const homeDesc = richSlots[match.id]?.home;
  const awayDesc = richSlots[match.id]?.away;
  const homeTeam = homeDesc?.type === "team" ? homeDesc.team : null;
  const awayTeam = awayDesc?.type === "team" ? awayDesc.team : null;

  const currentUser = state.users.find((u) => u.id === currentUserId);
  const myWinner = effectiveKOWinner(currentUser?.predictions, match.id);
  const myScore = currentUser?.predictions?.koScores?.[match.id];

  const allWinnerPreds = state.users
    .map((u) => effectiveKOWinner(u.predictions, match.id))
    .filter(Boolean);
  const totalPicked = allWinnerPreds.length;

  const myWinOk = r?.played && myWinner && myWinner === r.winner;
  const myScoreOk =
    r?.played &&
    myScore?.home !== undefined &&
    parseInt(myScore.home) === parseInt(r.home90) &&
    parseInt(myScore.away) === parseInt(r.away90);
  const myDiffOk =
    r?.played &&
    myScore?.home !== undefined &&
    !myScoreOk &&
    parseInt(myScore.home) - parseInt(myScore.away) ===
      parseInt(r.home90) - parseInt(r.away90);

  let myPts = null;
  if (r?.played && myWinner) {
    myPts = 0;
    if (myWinOk) myPts += schema.winner;
    if (myScoreOk) myPts += schema.exact;
    else if (myDiffOk) myPts += schema.diff;
  }

  const homePicks = homeTeam
    ? allWinnerPreds.filter((w) => w === homeTeam).length
    : 0;
  const awayPicks = awayTeam
    ? allWinnerPreds.filter((w) => w === awayTeam).length
    : 0;

  const titleHome =
    homeDesc?.type === "team"
      ? `${FLAG[homeDesc.team] || ""} ${homeDesc.team}`
      : homeDesc?.label || "?";
  const titleAway =
    awayDesc?.type === "team"
      ? `${FLAG[awayDesc.team] || ""} ${awayDesc.team}`
      : awayDesc?.label || "?";

  return (
    <Overlay onClose={onClose}>
      <OverlayHeader
        title={`${titleHome} vs ${titleAway}`}
        subtitle={`${match.label}${match.dt ? " · " + fmtDateTime(match.dt) : ""} · ${totalPicked} ingevuld`}
        onClose={onClose}
      />

      {(myWinner || r?.played) && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              myWinner && r?.played ? "1fr 1fr" : "1fr",
            gap: 8,
            marginBottom: 14,
          }}
        >
          {myWinner && (
            <div
              style={{
                textAlign: "center",
                ...S.card(),
                padding: "10px",
                background:
                  myPts !== null
                    ? myPts > 0
                      ? "rgba(63,185,80,.1)"
                      : "rgba(248,81,73,.08)"
                    : "rgba(255,255,255,.04)",
                border: "2px solid rgba(255,255,255,.7)",
              }}
            >
              <div
                style={{ fontSize: 11, color: "var(--muted)", marginBottom: 2 }}
              >
                Jouw voorspelling
              </div>
              <div style={{ fontSize: 20, fontWeight: 900 }}>
                {FLAG[myWinner] || ""} {myWinner}
              </div>
              {myScore?.home !== undefined && (
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    marginTop: 2,
                  }}
                >
                  {myScore.home}–{myScore.away} (90')
                </div>
              )}
              {r?.played && (
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    marginTop: 4,
                    color: myPts > 0 ? "var(--green)" : "var(--red)",
                  }}
                >
                  {myPts > 0 ? `+${myPts} pt` : "✗ mis"}
                </div>
              )}
            </div>
          )}
          {r?.played && (
            <div
              style={{
                textAlign: "center",
                ...S.card(),
                padding: "10px",
                background: "rgba(63,185,80,.08)",
                border: "1px solid rgba(63,185,80,.3)",
              }}
            >
              <div
                style={{ fontSize: 11, color: "var(--muted)", marginBottom: 2 }}
              >
                Officiële uitslag
              </div>
              <div style={{ fontSize: 20, fontWeight: 900 }}>
                {FLAG[r.winner] || ""} {r.winner}
              </div>
              {r.home90 !== undefined && (
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    marginTop: 2,
                  }}
                >
                  {r.home90}–{r.away90} (90')
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {totalPicked > 0 && homeTeam && awayTeam && (
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 14,
            alignItems: "stretch",
          }}
        >
          {[
            {
              label: `${FLAG[homeTeam] || ""} ${homeTeam}`,
              count: homePicks,
              color: "var(--green)",
            },
            {
              label: `${FLAG[awayTeam] || ""} ${awayTeam}`,
              count: awayPicks,
              color: "var(--accent)",
            },
          ].map(({ label, count, color }) => (
            <div
              key={label}
              style={{
                flex: 1,
                ...S.card(),
                textAlign: "center",
                padding: "8px 4px",
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 900, color }}>
                {Math.round((count / totalPicked) * 100)}%
              </div>
              <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 2 }}>
                {label}
              </div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color,
                  marginTop: 1,
                }}
              >
                {count}×
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPicked === 0 && (
        <div
          style={{
            color: "var(--muted)",
            fontSize: 13,
            textAlign: "center",
            padding: 20,
          }}
        >
          Niemand heeft deze wedstrijd ingevuld.
        </div>
      )}

      <KOScoreHeatmap
        match={match}
        state={state}
        currentUserId={currentUserId}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
      />
    </Overlay>
  );
}

// ─── EXTRA QUESTION COMPARE ───────────────────────────────────────────────────

function PickRow({ label, pickers, total, correct, isMyPick, extra }) {
  const pct = total > 0 ? Math.round((pickers.length / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 4,
        }}
      >
        <span
          style={{
            flex: 1,
            fontSize: 13,
            fontWeight: isMyPick ? 700 : 400,
            color: correct ? "var(--green)" : "var(--text)",
          }}
        >
          {label}
          {correct && (
            <span style={{ color: "var(--green)", marginLeft: 5 }}>✓</span>
          )}
        </span>
        {extra}
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: correct ? "var(--green)" : "var(--muted)",
            whiteSpace: "nowrap",
          }}
        >
          {pickers.length}× ({pct}%)
        </span>
      </div>
      <div
        style={{
          height: 6,
          background: "var(--bg)",
          borderRadius: 3,
          overflow: "hidden",
          marginBottom: 5,
          border: isMyPick ? "1px solid rgba(88,166,255,.4)" : "1px solid transparent",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: correct
              ? "var(--green)"
              : isMyPick
              ? "var(--accent)"
              : "rgba(255,255,255,.18)",
            borderRadius: 3,
          }}
        />
      </div>
    </div>
  );
}

function groupAndSort(picks) {
  const grouped = {};
  picks.forEach((p) => {
    if (!grouped[p.value]) grouped[p.value] = [];
    grouped[p.value].push(p);
  });
  return Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);
}

function SimplePickCompare({ questionKey, state, currentUserId, onClose }) {
  const { users = [], results = {}, koResults = {} } = state;

  const CONFIGS = {
    champion: {
      title: "🏆 Wereldkampioen",
      getPick: (p) => p.champion || null,
      correct: koResults["FINAL"]?.played ? [koResults["FINAL"].winner] : null,
      format: (v) => `${FLAG[v] || "🏳️"} ${v}`,
    },
    nlStage: {
      title: "🇳🇱 Hoe ver komt Nederland?",
      getPick: (p) => p.nlStage || null,
      correct: results["NL_STAGE"] ? [results["NL_STAGE"]] : null,
      format: (v) => v,
    },
    yellowCards: {
      title: "🟨 Meeste gele kaarten",
      getPick: (p) => p.yellowCards || null,
      correct: results["YELLOW_CARDS"] ? [results["YELLOW_CARDS"]] : null,
      format: (v) => `${FLAG[v] || "🏳️"} ${v}`,
    },
    mostCleanSheets: {
      title: "🧤 Meeste clean sheets",
      getPick: (p) => p.mostCleanSheets || null,
      correct: results["MOST_CLEAN_SHEETS"]
        ? Array.isArray(results["MOST_CLEAN_SHEETS"])
          ? results["MOST_CLEAN_SHEETS"]
          : [results["MOST_CLEAN_SHEETS"]]
        : null,
      format: (v) => `${FLAG[v] || "🏳️"} ${v}`,
    },
    mostGroupGoals: {
      title: "⚽ Meeste doelpunten groepsfase",
      getPick: (p) => p.mostGroupGoals || null,
      correct: results["MOST_GROUP_GOALS"]
        ? Array.isArray(results["MOST_GROUP_GOALS"])
          ? results["MOST_GROUP_GOALS"]
          : [results["MOST_GROUP_GOALS"]]
        : null,
      format: (v) => `${FLAG[v] || "🏳️"} ${v}`,
    },
  };

  const cfg = CONFIGS[questionKey];
  if (!cfg) return null;

  const picks = users
    .map((u) => ({
      userId: u.id,
      name: u.name,
      value: cfg.getPick(u.predictions || {}),
    }))
    .filter((p) => p.value);

  const sorted = groupAndSort(picks);
  const total = picks.length;
  const currentUser = users.find((u) => u.id === currentUserId);
  const myPick = currentUser ? cfg.getPick(currentUser.predictions || {}) : null;

  return (
    <Overlay onClose={onClose}>
      <OverlayHeader
        title={cfg.title}
        subtitle={`${total} van ${users.length} ingevuld`}
        onClose={onClose}
      />
      {total === 0 ? (
        <div
          style={{
            color: "var(--muted)",
            textAlign: "center",
            padding: 24,
            fontSize: 13,
          }}
        >
          Niemand heeft deze vraag ingevuld.
        </div>
      ) : (
        sorted.map(([value, pickers]) => (
          <PickRow
            key={value}
            label={cfg.format(value)}
            pickers={pickers}
            total={total}
            correct={cfg.correct ? cfg.correct.includes(value) : false}
            isMyPick={value === myPick}
          />
        ))
      )}
    </Overlay>
  );
}

// reverse lookup: player name → country
const PLAYER_COUNTRY = {};
Object.entries(PLAYERS_BY_COUNTRY).forEach(([country, players]) => {
  players.forEach((p) => { PLAYER_COUNTRY[p.name] = country; });
});

function TopScorersCompare({ state, currentUserId, onClose }) {
  const { users = [], results = {} } = state;
  const resultTopScorers = Array.isArray(results["TOP_SCORERS"])
    ? results["TOP_SCORERS"]
    : [];

  const currentUser = users.find((u) => u.id === currentUserId);
  const myScorers = Array.isArray(currentUser?.predictions?.topScorers)
    ? currentUser.predictions.topScorers
    : [];

  const totalFilled = users.filter((u) => {
    const s = u.predictions?.topScorers;
    return Array.isArray(s) && s.some(Boolean);
  }).length;

  // Correct players = anyone who appears in the result top 3 (order doesn't matter for scoring)
  const correctNames = new Set(resultTopScorers.map((r) => r.name));

  // Count per player: how many users included them in any slot
  const countByPlayer = {};
  users.forEach((u) => {
    const scorers = Array.isArray(u.predictions?.topScorers)
      ? u.predictions.topScorers
      : [];
    const pickedByUser = new Set(scorers.filter(Boolean));
    pickedByUser.forEach((name) => {
      countByPlayer[name] = (countByPlayer[name] || 0) + 1;
    });
  });

  // Sort: correct picks first, then by count desc
  const players = Object.keys(countByPlayer).sort((a, b) => {
    const aC = correctNames.has(a) ? 1 : 0;
    const bC = correctNames.has(b) ? 1 : 0;
    if (bC !== aC) return bC - aC;
    return countByPlayer[b] - countByPlayer[a];
  });

  const myPickSet = new Set(myScorers.filter(Boolean));

  return (
    <Overlay onClose={onClose}>
      <OverlayHeader
        title="⚽ Topscoorders"
        subtitle={`${totalFilled} van ${users.length} ingevuld · 3 kansen per deelnemer`}
        onClose={onClose}
      />

      {resultTopScorers.length > 0 && (
        <div
          style={{
            marginBottom: 14,
            padding: "7px 10px",
            background: "rgba(63,185,80,.08)",
            border: "1px solid rgba(63,185,80,.25)",
            borderRadius: 7,
            fontSize: 12,
            color: "var(--green)",
            fontWeight: 700,
          }}
        >
          Uitslag:{" "}
          {[...resultTopScorers]
            .sort((a, b) => a.rank - b.rank)
            .map((r) => `${FLAG[r.country] || FLAG[PLAYER_COUNTRY[r.name]] || "🏳️"} ${r.name}`)
            .join(", ")}
        </div>
      )}

      {players.length === 0 ? (
        <div style={{ color: "var(--muted)", fontSize: 12 }}>Niemand ingevuld.</div>
      ) : (
        players.map((player) => {
          const flag = FLAG[PLAYER_COUNTRY[player]] || "🏳️";
          return (
            <PickRow
              key={player}
              label={`${flag} ${player}`}
              pickers={Array(countByPlayer[player]).fill(0)}
              total={totalFilled}
              correct={correctNames.has(player)}
              isMyPick={myPickSet.has(player)}
            />
          );
        })
      )}
    </Overlay>
  );
}

function SurpriseTeamCompare({ state, currentUserId, onClose }) {
  const { users = [] } = state;

  const picks = users
    .map((u) => ({
      userId: u.id,
      name: u.name,
      value: u.predictions?.surpriseTeam || null,
    }))
    .filter((p) => p.value);

  const sorted = groupAndSort(picks);
  const total = picks.length;
  const currentUser = users.find((u) => u.id === currentUserId);
  const myPick = currentUser?.predictions?.surpriseTeam || null;

  return (
    <Overlay onClose={onClose}>
      <OverlayHeader
        title="🌟 Verrassing van het WK"
        subtitle={`${total} van ${users.length} ingevuld`}
        onClose={onClose}
      />
      {total === 0 ? (
        <div
          style={{
            color: "var(--muted)",
            textAlign: "center",
            padding: 24,
            fontSize: 13,
          }}
        >
          Niemand heeft deze vraag ingevuld.
        </div>
      ) : (
        sorted.map(([team, pickers]) => {
          const stage = deriveSurpriseStage(team, state.koResults || {});
          const stagePts = stage ? PTS_SURPRISE[stage] || 0 : null;
          const isMyPick = team === myPick;

          const stageExtra = stage ? (
            <span
              style={{
                fontSize: 11,
                color: stagePts > 0 ? "var(--green)" : "var(--muted)",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              {stage.replace("🏆 ", "")} · +{stagePts}
            </span>
          ) : null;

          return (
            <PickRow
              key={team}
              label={`${FLAG[team] || "🏳️"} ${team}`}
              pickers={pickers}
              total={total}
              correct={stagePts > 0}
              isMyPick={isMyPick}
              extra={stageExtra}
            />
          );
        })
      )}
    </Overlay>
  );
}

function TopOutCompare({ state, currentUserId, onClose }) {
  const { users = [] } = state;
  const outs = deriveTopOuts(state.results || {}, state.koResults || {});

  const picks = users
    .map((u) => ({
      userId: u.id,
      name: u.name,
      value: u.predictions?.topOut || null,
    }))
    .filter((p) => p.value);

  const sorted = groupAndSort(picks);
  const total = picks.length;
  const currentUser = users.find((u) => u.id === currentUserId);
  const myPick = currentUser?.predictions?.topOut || null;

  return (
    <Overlay onClose={onClose}>
      <OverlayHeader
        title="💥 Topland haalt achtste finales niet"
        subtitle={`${total} van ${users.length} ingevuld`}
        onClose={onClose}
      />
      {outs.length > 0 && (
        <div
          style={{
            marginBottom: 16,
            padding: "8px 12px",
            background: "rgba(63,185,80,.08)",
            border: "1px solid rgba(63,185,80,.3)",
            borderRadius: 8,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: "var(--muted)",
              marginBottom: 4,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontWeight: 700,
            }}
          >
            Uitgeschakeld
          </div>
          <div
            style={{ fontSize: 13, fontWeight: 700, color: "var(--green)" }}
          >
            {outs.map((t) => `${FLAG[t] || "🏳️"} ${t}`).join("  ·  ")}
          </div>
        </div>
      )}
      {total === 0 ? (
        <div
          style={{
            color: "var(--muted)",
            textAlign: "center",
            padding: 24,
            fontSize: 13,
          }}
        >
          Niemand heeft deze vraag ingevuld.
        </div>
      ) : (
        sorted.map(([team, pickers]) => {
          const isOut = outs.includes(team);
          const advancedInKO = Object.values(state.koResults || {}).some(
            (r) => r?.played && r.winner === team
          );
          const statusExtra = (
            <span
              style={{
                fontSize: 11,
                color: isOut
                  ? "var(--green)"
                  : advancedInKO
                  ? "var(--red)"
                  : "var(--muted)",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {isOut ? "✓ uit" : advancedInKO ? "✗ door" : "–"}
            </span>
          );
          return (
            <PickRow
              key={team}
              label={`${FLAG[team] || "🏳️"} ${team}`}
              pickers={pickers}
              total={total}
              correct={isOut}
              isMyPick={team === myPick}
              extra={statusExtra}
            />
          );
        })
      )}
    </Overlay>
  );
}

function ExtraQuestionCompare({ questionKey, state, currentUserId, onClose }) {
  if (questionKey === "topScorers")
    return (
      <TopScorersCompare
        state={state}
        currentUserId={currentUserId}
        onClose={onClose}
      />
    );
  if (questionKey === "surpriseTeam")
    return (
      <SurpriseTeamCompare
        state={state}
        currentUserId={currentUserId}
        onClose={onClose}
      />
    );
  if (questionKey === "topOut")
    return (
      <TopOutCompare
        state={state}
        currentUserId={currentUserId}
        onClose={onClose}
      />
    );
  return (
    <SimplePickCompare
      questionKey={questionKey}
      state={state}
      currentUserId={currentUserId}
      onClose={onClose}
    />
  );
}

export { SingleMatchCompare, SingleKOMatchCompare, MatchCompare, PlayerCompare, ExtraQuestionCompare };
