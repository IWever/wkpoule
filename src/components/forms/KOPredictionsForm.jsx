import React, { useState } from "react";
import {
  KO_STRUCTURE,
  ALL_TEAMS,
  PTS_KO,
  FLAG,
  GROUPS,
} from "../../data/tournamentData";
import { deepSet, buildRichKOSlots } from "../../pouleEngine";
import { S } from "../../styles/ui";
import { Alert, SlotDisplay, FrozenBadge } from "../common";
import { SingleKOMatchCompare } from "../compare";
import { FormHeader } from "./GroupPredictionsForm";

const ROUNDS = [
  { key: "r32", label: "Zestiende finales" },
  { key: "r16", label: "Achtste finales" },
  { key: "qf", label: "Kwartfinales" },
  { key: "sf", label: "Halve finales" },
  { key: "final", label: "Finale & 3e Plaats" },
];

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

function getDropdownTeams(homeDesc, awayDesc, match, pred, koResults) {
  const fromDesc = winnerCandidates(homeDesc, awayDesc);
  if (fromDesc.length > 0 && fromDesc.length <= 4) return fromDesc;
  const koMatch = KO_STRUCTURE.find((m) => m.id === match.id);
  if (!koMatch) return ALL_TEAMS;
  const homeTeams = teamsFromSlot(koMatch.homeSlot, pred, koResults);
  const awayTeams = teamsFromSlot(koMatch.awaySlot, pred, koResults);
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
  );

  return (
    <div>
      <FormHeader
        title="KO-fase voorspellen"
        icon="⚔️"
        saved={saved}
        onBack={onBack}
      />
      {(activeRoundFrozen || legacyFrozen) && (
        <Alert
          msg="Deze ronde is bevroren. Je kunt je voorspellingen nog bekijken maar niet meer wijzigen."
          type="warn"
        />
      )}
      <KOInstructions />
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
      {visibleMatches.map((m) => {
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
      })}
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
            badge: "S",
            color: "var(--green)",
            title: "Stand na 90 min.",
            desc: "Hoe staat het na negentig minuten reguliere speeltijd? Dit is de bonus — je verdient hier extra punten bovenop de winnaarspunten.",
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
  const candidates = winnerCandidates(homeDesc, awayDesc);
  const useButtons = candidates.length >= 1 && candidates.length <= 4;
  const dropdownTeams = useButtons
    ? []
    : getDropdownTeams(homeDesc, awayDesc, m, pred, koResults);
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
          {frozen && <FrozenBadge />}
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
                {scoreOk ? ` +${schema.exact}` : ""} pt ✓
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
            {candidates.map((t) => (
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

function winnerCandidates(homeDesc, awayDesc) {
  const from = (d) =>
    d?.type === "team" ? [d.team] : d?.type === "two" ? d.teams : [];
  return [...new Set([...from(homeDesc), ...from(awayDesc)])];
}

export { KOPredictionsForm };
