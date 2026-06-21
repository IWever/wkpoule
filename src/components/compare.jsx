import React, { useState } from "react";
import { GROUPS, GROUP_MATCHES, PTS_KO, FLAG } from "../data/tournamentData";
import { MATCH_FACTS } from "../data/matchFacts";
import {
  calcGroupMatchPts,
  calcPoints,
  buildRichKOSlots,
  fmtDateTime,
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

// ─── PLAYER COMPARE ───────────────────────────────────────────────────────────

function PlayerCompare({ me, other, state, onClose }) {
  const [groupBy, setGroupBy] = useState("ronde");
  const myPred = me.predictions || {};
  const otherPred = other.predictions || {};
  const myPts = calcPoints(me, state.results, state.koResults);
  const otherPts = calcPoints(other, state.results, state.koResults);

  const sections =
    groupBy === "poule"
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

  return (
    <Overlay onClose={onClose}>
      <OverlayHeader title="Vergelijking" onClose={onClose} />

      {/* Header row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "90px 1fr 1fr",
          gap: 6,
          marginBottom: 14,
          alignItems: "center",
        }}
      >
        <div />
        <div
          style={{
            textAlign: "center",
            fontWeight: 700,
            fontSize: 14,
            color: "var(--accent)",
          }}
        >
          {me.name}
          <br />
          <span style={{ fontWeight: 400, fontSize: 12 }}>{myPts} pt</span>
        </div>
        <div
          style={{
            textAlign: "center",
            fontWeight: 700,
            fontSize: 14,
            color: "var(--orange)",
          }}
        >
          {other.name}
          <br />
          <span style={{ fontWeight: 400, fontSize: 12 }}>{otherPts} pt</span>
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

      {/* Group-by toggle */}
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

      {/* Match sections */}
      {sections.map((sec) => (
        <CompareSection
          key={sec.key}
          section={sec}
          me={me}
          other={other}
          state={state}
          mySecPts={sectionPts(me, sec.matches)}
          otherSecPts={sectionPts(other, sec.matches)}
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

function CompareSection({ section, me, other, state, mySecPts, otherSecPts }) {
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
              <span style={{ fontWeight: 600, color: "var(--text)" }}>
                {FLAG[m.home]} {m.home}
              </span>
              <br />
              <span>
                vs {FLAG[m.away]} {m.away}
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
  const myWinner = currentUser?.predictions?.koWinners?.[match.id];
  const myScore = currentUser?.predictions?.koScores?.[match.id];

  const allWinnerPreds = state.users
    .map((u) => u.predictions?.koWinners?.[match.id])
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
    myWinOk &&
    parseInt(myScore.home) - parseInt(myScore.away) ===
      parseInt(r.home90) - parseInt(r.away90);

  let myPts = null;
  if (r?.played && myWinner) {
    myPts = 0;
    if (myWinOk) {
      myPts += schema.winner;
      if (myScoreOk) myPts += schema.exact;
      else if (myDiffOk) myPts += schema.diff;
    }
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
    </Overlay>
  );
}

export { SingleMatchCompare, SingleKOMatchCompare, MatchCompare, PlayerCompare };
