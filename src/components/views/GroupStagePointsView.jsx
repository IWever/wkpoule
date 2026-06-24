import React, { useState } from "react";
import { GROUPS, FLAG, PTS_STANDING } from "../../data/tournamentData";
import { calcGroupPointsBreakdown } from "../../pouleEngine";
import { S } from "../../styles/ui";
import { GroupStandingTable } from "../common";
import { FormHeader } from "../forms/GroupPredictionsForm";

const LABEL_CFG = {
  exact:  { color: "var(--green)",  badge: "+5 exact"   },
  diff:   { color: "#e8c547",       badge: "+3 saldo"   },
  winner: { color: "var(--accent)", badge: "+2 winnaar" },
  miss:   { color: "var(--red)",    badge: "0 mis"      },
};

function tf(team) {
  if (!team) return "—";
  return `${FLAG[team] || ""} ${team}`;
}

// ─── SUMMARY ROW ─────────────────────────────────────────────────────────────

function SummaryRow({ matchPts, standingPts, totalPts }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 8,
        marginBottom: 18,
      }}
    >
      {[
        { label: "Wedstrijden", pts: matchPts, color: "var(--accent)" },
        { label: "Standen",     pts: standingPts, color: "var(--accent)" },
        { label: "Totaal",      pts: totalPts,    color: "var(--gold)" },
      ].map(({ label, pts, color }) => (
        <div key={label} style={{ ...S.card(), textAlign: "center" }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 26,
              color,
              lineHeight: 1.1,
            }}
          >
            {pts}
          </div>
          <div
            style={{
              fontSize: 10,
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginTop: 2,
            }}
          >
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── MATCH ROW ───────────────────────────────────────────────────────────────

function MatchRow({ d }) {
  const { match, pred, result, pts, label } = d;
  const cfg = label ? LABEL_CFG[label] : null;
  const hasPred = pred && pred.home !== undefined && pred.home !== "";
  const hasResult = result?.played;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 0",
        borderBottom: "1px solid rgba(48,54,61,.5)",
        fontSize: 12,
      }}
    >
      <div style={{ flex: 1, color: "var(--text)", fontWeight: 500 }}>
        {tf(match.home)} vs {tf(match.away)}
      </div>
      <div
        style={{
          minWidth: 38,
          textAlign: "center",
          color: hasPred ? "var(--muted)" : "var(--border)",
          fontSize: 11,
        }}
      >
        {hasPred ? `${pred.home}–${pred.away}` : "—"}
      </div>
      <div
        style={{
          minWidth: 38,
          textAlign: "center",
          color: hasResult ? "var(--text)" : "var(--border)",
          fontWeight: hasResult ? 700 : 400,
          fontSize: 11,
        }}
      >
        {hasResult ? `${result.home}–${result.away}` : "—"}
      </div>
      <div
        style={{
          minWidth: 68,
          textAlign: "right",
          fontSize: 10,
          fontWeight: 700,
          color: cfg ? cfg.color : "var(--border)",
        }}
      >
        {cfg ? cfg.badge : hasResult ? (hasPred ? "0 mis" : "—") : "lopend"}
      </div>
    </div>
  );
}

// ─── STAND SECTIE ────────────────────────────────────────────────────────────

function StandSection({ standing, standingPts }) {
  const { p1, p2, a1, a2, p1pts, p2pts, allPlayed, actualTable } = standing;

  function posColor(pTeam, aTeam, top2) {
    if (!allPlayed) return "var(--muted)";
    if (!pTeam) return "var(--muted)";
    if (pTeam === aTeam) return "var(--green)";
    if (top2 && top2.includes(pTeam)) return "#e8c547";
    return "var(--red)";
  }

  const top2 = allPlayed && a1 && a2 ? [a1, a2] : null;
  const hasTable = actualTable && actualTable.length > 0;

  return (
    <div style={{ marginTop: 10 }}>
      {/* Huidige/definitieve stand */}
      {hasTable && (
        <div style={{ marginBottom: 10 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: 6,
            }}
          >
            {allPlayed ? "Eindstand" : "Huidige stand"}
          </div>
          <GroupStandingTable rows={actualTable} />
        </div>
      )}

      {/* Jouw standvoorspelling */}
      {(p1 || p2) && (
        <div
          style={{
            padding: "8px 10px",
            background: "rgba(255,255,255,.03)",
            borderRadius: 6,
            fontSize: 11,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: 6,
              fontSize: 10,
            }}
          >
            Jouw standvoorspelling
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: allPlayed ? 4 : 0 }}>
            {[
              { pos: "#1", pred: p1, actual: a1, pts: p1pts },
              { pos: "#2", pred: p2, actual: a2, pts: p2pts },
            ].map(({ pos, pred, actual, pts }) => (
              <div
                key={pos}
                style={{
                  flex: 1,
                  background: "var(--bg)",
                  borderRadius: 6,
                  padding: "6px 8px",
                }}
              >
                <div style={{ color: "var(--muted)", fontSize: 10, marginBottom: 2 }}>
                  {pos} voorspeld
                </div>
                <div style={{ fontWeight: 700, color: posColor(pred, actual, top2) }}>
                  {tf(pred)}
                </div>
                {allPlayed && (
                  <div style={{ color: "var(--muted)", fontSize: 10, marginTop: 2 }}>
                    Echt: {tf(actual)}
                  </div>
                )}
                {allPlayed && pts > 0 && (
                  <div
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: pts === PTS_STANDING.qualifiedCorrectPos ? "var(--green)" : "#e8c547",
                      marginTop: 2,
                    }}
                  >
                    +{pts} pt
                  </div>
                )}
              </div>
            ))}
          </div>
          {allPlayed && (
            <div
              style={{
                textAlign: "right",
                fontWeight: 700,
                fontSize: 11,
                color: standingPts > 0 ? "var(--green)" : "var(--muted)",
                marginTop: 4,
              }}
            >
              Stand: {standingPts} pt
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── GROUP CARD ──────────────────────────────────────────────────────────────

function GroupCard({ groupId, data, open, onToggle }) {
  const { matches, matchPts, standing, standingPts, totalPts } = data;
  const playedCount = matches.filter((d) => d.result?.played).length;

  return (
    <div
      style={{
        ...S.card(),
        marginBottom: 8,
        padding: 0,
        overflow: "hidden",
      }}
    >
      <div
        onClick={onToggle}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "12px 14px",
          cursor: "pointer",
          gap: 10,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 18,
            color: "var(--accent)",
            minWidth: 28,
          }}
        >
          {groupId}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>
            {playedCount}/6 gespeeld
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 20,
              color: totalPts > 0 ? "var(--green)" : "var(--muted)",
            }}
          >
            {totalPts} pt
          </span>
          {standing.allPlayed && (
            <span style={{ fontSize: 10, color: "var(--muted)", marginLeft: 4 }}>
              ({matchPts}+{standingPts})
            </span>
          )}
        </div>
        <div style={{ color: "var(--muted)", fontSize: 12, marginLeft: 4 }}>
          {open ? "▲" : "▼"}
        </div>
      </div>

      {open && (
        <div style={{ padding: "0 14px 12px", borderTop: "1px solid var(--border)" }}>
          <div
            style={{
              display: "flex",
              gap: 6,
              fontSize: 10,
              color: "var(--muted)",
              padding: "6px 0 2px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            <div style={{ flex: 1 }}>Wedstrijd</div>
            <div style={{ minWidth: 38, textAlign: "center" }}>Pred.</div>
            <div style={{ minWidth: 38, textAlign: "center" }}>Uitslag</div>
            <div style={{ minWidth: 68, textAlign: "right" }}>Punten</div>
          </div>
          {matches.map((d) => (
            <MatchRow key={d.match.id} d={d} />
          ))}
          <StandSection standing={standing} standingPts={standingPts} />
        </div>
      )}
    </div>
  );
}

// ─── MAIN VIEW ───────────────────────────────────────────────────────────────

export function GroupStagePointsView({ user, state, onBack }) {
  const [openGroup, setOpenGroup] = useState(null);
  const breakdown = calcGroupPointsBreakdown(user, state.results);

  return (
    <div>
      <FormHeader
        title="Groepsfase punten"
        icon="⚽"
        saved={false}
        onBack={onBack}
      />

      <SummaryRow
        matchPts={breakdown.matchPts}
        standingPts={breakdown.standingPts}
        totalPts={breakdown.totalPts}
      />

      <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12 }}>
        Klik op een groep voor details per wedstrijd en poulesstand.
      </div>

      {Object.keys(GROUPS).map((g) => (
        <GroupCard
          key={g}
          groupId={g}
          data={breakdown.groups[g]}
          open={openGroup === g}
          onToggle={() => setOpenGroup(openGroup === g ? null : g)}
        />
      ))}
    </div>
  );
}
