import React, { useState } from "react";
import {
  KO_STRUCTURE,
  ALL_TEAMS,
  PTS_KO,
  FLAG,
  GROUPS,
} from "../../data/tournamentData";
import { deepSet, buildRichKOSlots, fmtDateTime } from "../../pouleEngine";
import { S } from "../../styles/ui";
import { Alert, SlotDisplay, FrozenBadge } from "../common";
import { SingleKOMatchCompare } from "../compare";
import { FormHeader } from "./GroupPredictionsForm";

const ROUNDS = [
  { key: "bracket", label: "🏆 Bracket" },
  { key: "r32", label: "Zestiende finales" },
  { key: "r16", label: "Achtste finales" },
  { key: "qf", label: "Kwartfinales" },
  { key: "sf", label: "Halve finales" },
  { key: "final", label: "Finale & 3e Plaats" },
];

// Bracket volgorde: bepaalt de verticale volgorde van matches in de bracket visualisatie
const BRACKET_ROWS = {
  r32:   ["R32_2","R32_5","R32_1","R32_3","R32_4","R32_6","R32_7","R32_8",
           "R32_11","R32_12","R32_9","R32_10","R32_14","R32_16","R32_13","R32_15"],
  r16:   ["R16_1","R16_2","R16_5","R16_6","R16_3","R16_4","R16_7","R16_8"],
  qf:    ["QF_1","QF_2","QF_3","QF_4"],
  sf:    ["SF_1","SF_2"],
  final: ["FINAL"],
};

function teamsFromSlot(slot, pred, koResults) {
  if (!slot) return null;
  if (/^[12][A-L]$/.test(slot)) return new Set(GROUPS[slot[1]] || []);
  if (/^N3/.test(slot)) return null;
  if (slot.charAt(0) === "W") {
    const matchId = slot.slice(1);
    const adminWinner = koResults?.[matchId]?.winner;
    if (koResults?.[matchId]?.played && adminWinner)
      return new Set([adminWinner]);
    const koMatch = KO_STRUCTURE.find((m) => m.id === matchId);
    if (!koMatch) return null;
    const homeTeams = teamsFromSlot(koMatch.homeSlot, pred, koResults);
    const awayTeams = teamsFromSlot(koMatch.awaySlot, pred, koResults);
    if (!homeTeams || !awayTeams) return null;
    return new Set([...homeTeams, ...awayTeams]);
  }
  if (slot.charAt(0) === "L") {
    const matchId = slot.slice(1);
    const koMatch = KO_STRUCTURE.find((m) => m.id === matchId);
    if (!koMatch) return null;
    const homeTeams = teamsFromSlot(koMatch.homeSlot, pred, koResults);
    const awayTeams = teamsFromSlot(koMatch.awaySlot, pred, koResults);
    if (!homeTeams || !awayTeams) return null;
    return new Set([...homeTeams, ...awayTeams]);
  }
  return null;
}

// Geeft de teams terug die een descriptor vertegenwoordigt (null = onbekend/label).
function descToTeams(desc) {
  if (desc?.type === "team") return [desc.team];
  if (desc?.type === "two" || desc?.type === "few") return desc.teams;
  return null;
}

// Alle mogelijke deelnemers aan een wedstrijd: per slot de genarrowde kandidaten
// of (als de slot nog een label is) alle teams in die slotgroep als fallback.
function getDropdownTeams(homeDesc, awayDesc, match, pred, koResults) {
  const koMatch = KO_STRUCTURE.find((m) => m.id === match.id);
  if (!koMatch) return ALL_TEAMS;
  const homeTeams =
    descToTeams(homeDesc) ??
    (teamsFromSlot(koMatch.homeSlot, pred, koResults)
      ? [...teamsFromSlot(koMatch.homeSlot, pred, koResults)]
      : null);
  const awayTeams =
    descToTeams(awayDesc) ??
    (teamsFromSlot(koMatch.awaySlot, pred, koResults)
      ? [...teamsFromSlot(koMatch.awaySlot, pred, koResults)]
      : null);
  if (!homeTeams || !awayTeams) return ALL_TEAMS;
  return [...new Set([...homeTeams, ...awayTeams])].sort((a, b) =>
    a.localeCompare(b, "nl")
  );
}

function KOPredictionsForm({ user, state, onSave, onBack }) {
  const [pred, setPred] = useState(() =>
    JSON.parse(JSON.stringify(user.predictions || {}))
  );
  const [saved, setSaved] = useState(false);
  const [activeRound, setActiveRound] = useState("r32");
  const [compareMatch, setCompareMatch] = useState(null);

  const frozenRounds = state.koFrozenRounds || {};
  const legacyFrozen = state.koFrozen && Object.keys(frozenRounds).length === 0;

  function isRoundFrozen(roundKey) {
    return !!frozenRounds[roundKey];
  }

  const activeRoundFrozen =
    activeRound === "final"
      ? isRoundFrozen("final") && isRoundFrozen("3rd")
      : isRoundFrozen(activeRound);

  // FIX: onSave buiten de setPred updater aanroepen
  async function set(path, val) {
    const next = deepSet(pred, path, val);
    setPred(next);
    const ok = await onSave(next);
    setSaved(ok ? "ok" : "error");
  }

  const richSlots = buildRichKOSlots(pred, state.results, state.koResults);
  const visibleMatches = KO_STRUCTURE.filter(
    (m) =>
      m.round === activeRound ||
      (activeRound === "final" && (m.round === "final" || m.round === "3rd"))
  ).sort((a, b) => activeRound === "r32" ? new Date(a.dt) - new Date(b.dt) : 0);

  return (
    <div>
      <FormHeader
        title="KO-fase voorspellen"
        icon="⚔️"
        saved={saved}
        onBack={onBack}
      />
      {activeRound !== "bracket" && (activeRoundFrozen || legacyFrozen) && (
        <Alert
          msg="Deze ronde is bevroren. Je kunt je voorspellingen nog bekijken maar niet meer wijzigen."
          type="warn"
        />
      )}
      {activeRound !== "bracket" && <KOInstructions />}
      <div
        style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 18 }}
      >
        {ROUNDS.map((r) => {
          const tabFrozen =
            r.key === "final"
              ? isRoundFrozen("final") && isRoundFrozen("3rd")
              : isRoundFrozen(r.key);
          const isActive = activeRound === r.key;
          return (
            <button
              key={r.key}
              onClick={() => setActiveRound(r.key)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                border: `1px solid ${
                  isActive ? "var(--accent)" : "var(--border)"
                }`,
                background: isActive ? "var(--accent)" : "var(--bg)",
                color: isActive ? "#fff" : "var(--text)",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {r.label}
              {(tabFrozen || legacyFrozen) && (
                <span style={{ fontSize: 10 }}>🔒</span>
              )}
            </button>
          );
        })}
      </div>
      {activeRound === "bracket" ? (
        <KOBracket pred={pred} koResults={state.koResults} richSlots={richSlots} />
      ) : (
        visibleMatches.map((m) => {
          const matchFrozen = legacyFrozen || !!frozenRounds[m.round];
          return (
            <KOMatchCard
              key={m.id}
              match={m}
              pred={pred}
              koResult={state.koResults[m.id]}
              homeDesc={richSlots[m.id]?.home}
              awayDesc={richSlots[m.id]?.away}
              frozen={matchFrozen}
              onSet={set}
              koResults={state.koResults}
              canInfo={matchFrozen}
              onInfo={() => setCompareMatch(m)}
            />
          );
        })
      )}
      {compareMatch && (
        <SingleKOMatchCompare
          match={compareMatch}
          state={state}
          currentUserId={user.id}
          onClose={() => setCompareMatch(null)}
        />
      )}
    </div>
  );
}

function KOInstructions() {
  return (
    <div
      style={{
        ...S.card(),
        marginBottom: 18,
        background: "rgba(88,166,255,.06)",
        border: "1px solid rgba(88,166,255,.2)",
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: "var(--text)",
          marginBottom: 12,
          lineHeight: 1.6,
        }}
      >
        Voorspel per wedstrijd twee dingen:
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          marginBottom: 14,
        }}
      >
        {[
          {
            badge: "W",
            color: "var(--accent)",
            title: "Winnaar",
            desc: "Welk team gaat door? Bij gelijkspel na 90 min. gaat het door via verlenging of strafschoppen — voorspel de winnaar, niet het eindresultaat.",
          },
          {
            badge: "V",
            color: "var(--yellow)",
            title: "Verschil bonus",
            desc: "Klopt het doelsaldo na 90 min. maar niet de exacte uitslag? Dan krijg je de verschilbonus — ongeacht of je winnaar klopt.",
          },
          {
            badge: "S",
            color: "var(--green)",
            title: "Stand na 90 min.",
            desc: "Klopt de exacte uitslag na 90 min.? Dan krijg je de hogere standbonus — ook als je de verkeerde penaltywinnaar had. V en S stapelen niet.",
          },
        ].map(({ badge, color, title, desc }) => (
          <div
            key={badge}
            style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
          >
            <div
              style={{
                minWidth: 28,
                height: 28,
                borderRadius: 6,
                background: color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 900,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {badge}
            </div>
            <div>
              <div
                style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}
              >
                {title}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
      <div
        style={{ borderTop: "1px solid rgba(88,166,255,.2)", paddingTop: 12 }}
      >
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
          Punten per ronde
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr",
            gap: 5,
          }}
        >
          {[
            ["Zestiende finale", PTS_KO.r32],
            ["Achtste finale", PTS_KO.r16],
            ["Kwartfinale", PTS_KO.qf],
            ["Halve finale", PTS_KO.sf],
            ["Finale", PTS_KO.final],
          ].map(([ronde, schema]) => (
            <div
              key={ronde}
              style={{
                background: "var(--bg)",
                borderRadius: 6,
                padding: "7px 4px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 9,
                  color: "var(--muted)",
                  marginBottom: 5,
                  lineHeight: 1.2,
                }}
              >
                {ronde}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--accent)",
                  fontWeight: 700,
                }}
              >
                W +{schema.winner}
              </div>
              <div
                style={{ fontSize: 11, color: "var(--yellow)", fontWeight: 600 }}
              >
                V +{schema.diff}
              </div>
              <div
                style={{ fontSize: 11, color: "var(--green)", fontWeight: 600 }}
              >
                S +{schema.exact}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KOMatchCard({
  match: m,
  pred,
  koResult: r,
  homeDesc,
  awayDesc,
  frozen,
  onSet,
  koResults,
  canInfo,
  onInfo,
}) {
  const schema = PTS_KO[m.round] || PTS_KO.r16;
  const predWinner = pred.koWinners?.[m.id];
  const predScore = pred.koScores?.[m.id];
  const winOk = r?.played && predWinner && predWinner === r.winner;
  const winNope = r?.played && predWinner && predWinner !== r.winner;
  const scoreOk =
    r?.played &&
    predScore?.home !== undefined &&
    parseInt(predScore.home) === parseInt(r.home90) &&
    parseInt(predScore.away) === parseInt(r.away90);
  const diffOk =
    r?.played &&
    predScore?.home !== undefined &&
    !scoreOk &&
    parseInt(predScore.home) - parseInt(predScore.away) ===
      parseInt(r.home90) - parseInt(r.away90);
  const allCandidates = getDropdownTeams(homeDesc, awayDesc, m, pred, koResults);
  const useButtons = allCandidates.length >= 1 && allCandidates.length <= 4;
  const dropdownTeams = useButtons ? [] : allCandidates;
  const cardBorder = r?.played
    ? winOk
      ? "rgba(63,185,80,.4)"
      : winNope
      ? "rgba(248,81,73,.3)"
      : "var(--border)"
    : predWinner
    ? "rgba(88,166,255,.3)"
    : "var(--border)";

  return (
    <div
      onClick={canInfo ? onInfo : undefined}
      style={{
        ...S.card(),
        marginBottom: 12,
        border: `1px solid ${cardBorder}`,
        cursor: canInfo ? "pointer" : "default",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              fontSize: 12,
              color: "var(--muted)",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            {m.label}
          </div>
          {m.dt && (
            <div style={{ fontSize: 11, color: "var(--muted)" }}>
              {fmtDateTime(m.dt)}
            </div>
          )}
          {frozen && <span style={{ fontSize: 13, color: "var(--orange)" }}>🔒</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {canInfo && (
            <span style={{ fontSize: 10, color: "var(--muted)" }}>info →</span>
          )}
        {r?.played && (
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {winOk && (
              <span
                style={{ fontSize: 12, fontWeight: 700, color: "var(--green)" }}
              >
                +{schema.winner}
                {scoreOk
                  ? ` +${schema.exact}`
                  : diffOk
                  ? ` +${schema.diff}`
                  : ""}{" "}
                pt ✓
              </span>
            )}
            {winNope && (scoreOk || diffOk) && (
              <span
                style={{ fontSize: 12, fontWeight: 700, color: "var(--yellow)" }}
              >
                {scoreOk ? `+${schema.exact}` : `+${schema.diff}`} pt (stand)
              </span>
            )}
            {winNope && (
              <span
                style={{ fontSize: 12, fontWeight: 700, color: "var(--red)" }}
              >
                ✗
              </span>
            )}
          </div>
        )}
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <div style={{ flex: 1, textAlign: "right" }}>
          <SlotDisplay desc={homeDesc} align="right" size={14} />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <input
              disabled={frozen}
              type="number"
              min={0}
              max={20}
              value={predScore?.home ?? ""}
              onChange={(e) =>
                onSet(["koScores", m.id, "home"], e.target.value)
              }
              style={{ ...S.numInput, opacity: frozen ? 0.6 : 1 }}
            />
            <span style={{ color: "var(--muted)", fontWeight: 700 }}>–</span>
            <input
              disabled={frozen}
              type="number"
              min={0}
              max={20}
              value={predScore?.away ?? ""}
              onChange={(e) =>
                onSet(["koScores", m.id, "away"], e.target.value)
              }
              style={{ ...S.numInput, opacity: frozen ? 0.6 : 1 }}
            />
          </div>
          <div style={{ fontSize: 10, color: "var(--muted)" }}>na 90 min</div>
        </div>
        <div style={{ flex: 1 }}>
          <SlotDisplay desc={awayDesc} align="left" size={14} />
        </div>
      </div>
      {r?.played && (
        <div
          style={{
            background: "rgba(63,185,80,.08)",
            border: "1px solid rgba(63,185,80,.25)",
            borderRadius: 8,
            padding: "8px 12px",
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <div style={{ fontSize: 12, color: "var(--muted)" }}>Uitslag</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>
              {FLAG[r.winner] || "🏳️"} {r.winner}
            </span>
            {r.home90 !== undefined && (
              <span
                style={{
                  fontSize: 12,
                  color: "var(--muted)",
                  background: "rgba(255,255,255,.06)",
                  borderRadius: 5,
                  padding: "2px 8px",
                }}
              >
                {r.home90}–{r.away90}{" "}
                <span style={{ fontSize: 10 }}>(90')</span>
              </span>
            )}
          </div>
        </div>
      )}
      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10 }}>
        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>
          🏆 Winnaar
        </div>
        {useButtons ? (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {allCandidates.map((t) => (
              <button
                key={t}
                disabled={frozen}
                onClick={() =>
                  !frozen &&
                  onSet(["koWinners", m.id], predWinner === t ? "" : t)
                }
                style={{
                  flex: 1,
                  minWidth: 90,
                  padding: "8px 8px",
                  borderRadius: 8,
                  border: `2px solid ${
                    predWinner === t ? "var(--accent)" : "var(--border)"
                  }`,
                  background:
                    predWinner === t ? "rgba(88,166,255,.15)" : "var(--bg)",
                  color: "var(--text)",
                  cursor: frozen ? "default" : "pointer",
                  fontSize: 13,
                  fontWeight: predWinner === t ? 700 : 400,
                  fontFamily: "var(--font)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  opacity: frozen ? 0.7 : 1,
                }}
              >
                {FLAG[t] || "🏳️"} {t}
              </button>
            ))}
          </div>
        ) : (
          <>
            {dropdownTeams.length < ALL_TEAMS.length && (
              <div
                style={{
                  fontSize: 11,
                  color: "var(--muted)",
                  marginBottom: 6,
                  fontStyle: "italic",
                }}
              >
                {homeDesc?.type === "label" || awayDesc?.type === "label"
                  ? "Teams nog niet zeker — alleen mogelijke deelnemers getoond"
                  : "Alleen mogelijke deelnemers"}
              </div>
            )}
            <select
              disabled={frozen}
              value={predWinner || ""}
              onChange={(e) => onSet(["koWinners", m.id], e.target.value)}
              style={{
                width: "100%",
                background: "var(--bg)",
                color: "var(--text)",
                border: `1px solid ${
                  predWinner ? "var(--accent)" : "var(--border)"
                }`,
                borderRadius: 6,
                padding: "6px 10px",
                fontSize: 13,
                opacity: frozen ? 0.6 : 1,
                fontFamily: "var(--font)",
              }}
            >
              <option value="">— selecteer winnaar —</option>
              {dropdownTeams.map((t) => (
                <option key={t} value={t}>
                  {FLAG[t] || "🏳️"} {t}
                </option>
              ))}
            </select>
          </>
        )}
      </div>
    </div>
  );
}


function flagsFromDesc(desc) {
  if (!desc) return "";
  if (desc.type === "team") return FLAG[desc.team] || "🏳️";
  if (desc.type === "two")  return desc.teams.map((t) => FLAG[t] || "🏳️").join("");
  if (desc.type === "few")  return desc.teams.slice(0, 4).map((t) => FLAG[t] || "🏳️").join("");
  return "";
}

function KOBracket({ pred, koResults, richSlots }) {
  const ROW_H = 36;
  const HEADER_H = 22;
  const TOTAL_H = 16 * ROW_H + HEADER_H;
  const COL_W = 112;
  const COL_GAP = 12;
  const CELL_H = 26;
  const NUM_COLS = 5;
  const TOTAL_W = NUM_COLS * COL_W + (NUM_COLS - 1) * COL_GAP;

  const ROUND_COLS = [
    { ids: BRACKET_ROWS.r32,   label: "1/16" },
    { ids: BRACKET_ROWS.r16,   label: "1/8" },
    { ids: BRACKET_ROWS.qf,    label: "Kwart" },
    { ids: BRACKET_ROWS.sf,    label: "Half" },
    { ids: BRACKET_ROWS.final, label: "Finale" },
  ];

  const colLeft = (col) => col * (COL_W + COL_GAP);
  const span = (col) => Math.pow(2, col);
  const centerY = (col, row) => HEADER_H + row * span(col) * ROW_H + span(col) * ROW_H / 2;
  const topY = (col, row) => centerY(col, row) - CELL_H / 2;

  // SVG connector paths: bracket lines between rounds
  const svgPaths = [];
  for (let col = 0; col < 4; col++) {
    const count = ROUND_COLS[col].ids.length;
    for (let row = 0; row < count; row += 2) {
      const y1 = centerY(col, row);
      const y2 = centerY(col, row + 1);
      const midY = (y1 + y2) / 2;
      const xRight = colLeft(col) + COL_W;
      const xMid   = xRight + COL_GAP / 2;
      const xNext  = colLeft(col + 1);
      svgPaths.push(`M${xRight} ${y1} H${xMid} V${midY}`);
      svgPaths.push(`M${xRight} ${y2} H${xMid} V${midY}`);
      svgPaths.push(`M${xMid} ${midY} H${xNext}`);
    }
  }

  return (
    <div style={{ overflowX: "auto", marginBottom: 12 }}>
      <div style={{ position: "relative", height: TOTAL_H, width: TOTAL_W, minWidth: TOTAL_W }}>
        {/* Connecting lines */}
        <svg style={{ position: "absolute", top: 0, left: 0, width: TOTAL_W, height: TOTAL_H, pointerEvents: "none", overflow: "visible" }}>
          {svgPaths.map((d, i) => (
            <path key={i} d={d} fill="none" stroke="var(--border)" strokeWidth="1" />
          ))}
        </svg>

        {/* Column headers */}
        {ROUND_COLS.map((rc, col) => (
          <div key={rc.label} style={{ position: "absolute", top: 0, left: colLeft(col), width: COL_W, textAlign: "center", fontSize: 9, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em", lineHeight: `${HEADER_H}px` }}>
            {rc.label}
          </div>
        ))}

        {/* Match cells */}
        {ROUND_COLS.map((rc, col) =>
          rc.ids.map((matchId, row) => {
            const predicted = pred.koWinners?.[matchId];
            const result    = koResults?.[matchId];
            const isPlayed  = result?.played;
            const actual    = result?.winner;
            const winner    = isPlayed ? actual : predicted;
            const correct   = isPlayed && predicted && predicted === actual;
            const wrong     = isPlayed && predicted && predicted !== actual;

            const border = correct ? "rgba(63,185,80,.6)"
                         : wrong   ? "rgba(248,81,73,.5)"
                         : predicted ? "rgba(88,166,255,.4)"
                         : "var(--border)";
            const bg = correct ? "rgba(63,185,80,.1)" : "var(--card)";

            const homeFlags = flagsFromDesc(richSlots?.[matchId]?.home);
            const awayFlags = flagsFromDesc(richSlots?.[matchId]?.away);
            const flagsLabel = homeFlags || awayFlags
              ? `${homeFlags} ${awayFlags}`.trim()
              : null;

            return (
              <div key={matchId} style={{ position: "absolute", top: topY(col, row), left: colLeft(col), width: COL_W, height: CELL_H }}>
                <div style={{ border: `1px solid ${border}`, borderRadius: 4, background: bg, height: "100%", display: "flex", alignItems: "center", padding: "0 5px", gap: 3, overflow: "hidden" }}>
                  {winner ? (
                    <>
                      <span style={{ flex: 1, fontSize: 10, fontWeight: 600, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {FLAG[winner] || ""} {winner}
                      </span>
                      {correct && <span style={{ color: "var(--green)", fontSize: 9, flexShrink: 0 }}>✓</span>}
                      {wrong   && <span style={{ color: "var(--red)",   fontSize: 9, flexShrink: 0 }}>✗</span>}
                    </>
                  ) : (
                    <span style={{ flex: 1, fontSize: 13, color: "var(--muted)", letterSpacing: "0.05em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {flagsLabel || "—"}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export { KOPredictionsForm };
