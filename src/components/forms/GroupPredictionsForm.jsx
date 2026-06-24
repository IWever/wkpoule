import React, { useState } from "react";
import { GROUP_MATCHES, FLAG, GROUPS } from "../../data/tournamentData";
import {
  deepSet,
  deriveGroupStandings,
  deriveGroupStandingsFromResults,
  calcGroupMatchPts,
  calcGroupPointsBreakdown,
  fmtDateTime,
} from "../../pouleEngine";
import { S } from "../../styles/ui";
import { Alert, TabBar, GroupStandingTable } from "../common";
import { SingleMatchCompare } from "../compare";

const GROUP_LETTERS = "ABCDEFGHIJKL".split("");

function GroupPredictionsForm({ user, state, onSave, onBack }) {
  const [pred, setPred] = useState(() =>
    JSON.parse(JSON.stringify(user.predictions || {}))
  );
  const [activeGroup, setActiveGroup] = useState("A");
  const [saved, setSaved] = useState(false);
  const [compareMatch, setCompareMatch] = useState(null);
  const unlocked = (state.unlockedUsers || []).includes(user.id);
  const frozen = state.groupFrozen && !unlocked;

  // FIX: onSave buiten de setPred updater aanroepen
  async function set(path, val) {
    const next = deepSet(pred, path, val);
    setPred(next);
    const ok = await onSave(next);
    setSaved(ok ? "ok" : "error");
  }

  const breakdown = calcGroupPointsBreakdown({ predictions: pred }, state.results);
  const groupBreakdown = breakdown.groups[activeGroup];

  return (
    <div>
      <FormHeader
        title={
          frozen
            ? "Jouw voorspellingen voor de groepsfase (bevroren)"
            : "Groepsfase invullen"
        }
        icon="📝"
        saved={saved}
        onBack={onBack}
      />
      {frozen && (
        <Alert
          msg="De groepsfase is bevroren. Je kunt je voorspellingen nog bekijken maar niet meer wijzigen."
          type="warn"
        />
      )}

      <TabBar
        tabs={[{ id: "groups", label: "Groepsfase" }]}
        active="groups"
        onSelect={() => {}}
      />
      <GroupSelector
        active={activeGroup}
        onSelect={setActiveGroup}
        results={state.results}
      />

      <GroupPointsSummary groupBreakdown={groupBreakdown} />

      <GroupStandingPreviews
        activeGroup={activeGroup}
        pred={pred}
        results={state.results}
      />

      {!frozen && (
        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10 }}>
          Vul de verwachte uitslag in (na 90 min + blessuretijd). De top-2 wordt
          automatisch afgeleid uit jouw scores.
        </div>
      )}

      {GROUP_MATCHES.filter((m) => m.group === activeGroup).map((m) => (
        <GroupMatchRow
          key={m.id}
          match={m}
          pred={pred}
          result={state.results[m.id]}
          frozen={frozen}
          isGroupF={activeGroup === "F"}
          onSet={set}
          canInfo={state.groupFrozen}
          onInfo={() => setCompareMatch(m)}
        />
      ))}

      {compareMatch && (
        <SingleMatchCompare
          match={compareMatch}
          state={state}
          currentUserId={user.id}
          onClose={() => setCompareMatch(null)}
        />
      )}
    </div>
  );
}

function FormHeader({ title, icon, saved, onBack }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 18,
        flexWrap: "wrap",
        gap: 10,
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 16 }}>
        {icon} {title}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {saved === "ok" && (
          <span style={{ fontSize: 12, color: "var(--green)" }}>
            ✓ Opgeslagen
          </span>
        )}
        {saved === "error" && (
          <span style={{ fontSize: 12, color: "var(--red)" }}>
            ✗ Opslaan mislukt!
          </span>
        )}
        <button
          style={{
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "8px 14px",
            color: "var(--muted)",
            cursor: "pointer",
            fontSize: 13,
            fontFamily: "var(--font)",
          }}
          onClick={onBack}
        >
          ← Terug
        </button>
      </div>
    </div>
  );
}

function GroupSelector({ active, onSelect, results = {} }) {
  return (
    <div
      style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}
    >
      {GROUP_LETTERS.map((g) => {
        const isActive = active === g;
        const isF = g === "F";
        const teams = GROUPS[g] || [];
        const groupMatches = GROUP_MATCHES.filter((m) => m.group === g);
        const playedCount = groupMatches.filter((m) => results[m.id]?.played).length;
        return (
          <button
            key={g}
            onClick={() => onSelect(g)}
            style={{
              padding: "6px 12px",
              borderRadius: 10,
              border: `1px solid ${
                isActive
                  ? isF
                    ? "var(--orange)"
                    : "var(--accent)"
                  : "var(--border)"
              }`,
              background: isActive
                ? isF
                  ? "var(--orange)"
                  : "var(--accent)"
                : "var(--bg)",
              color: isActive ? "#fff" : isF ? "var(--orange)" : "var(--text)",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
            }}
          >
            <span>Groep {g}</span>
            <span style={{ fontSize: 13, letterSpacing: 1 }}>
              {teams.map((t) => FLAG[t] || "🏳️").join("")}
            </span>
            <span style={{ fontSize: 10, opacity: 0.75, fontWeight: 400 }}>
              {playedCount}/{groupMatches.length}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function GroupPointsSummary({ groupBreakdown }) {
  if (!groupBreakdown) return null;
  const { matchPts, standingPts, totalPts, matches, standing } = groupBreakdown;
  const anyPlayed = matches.some((d) => d.result?.played);
  if (!anyPlayed) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: standing.allPlayed ? "1fr 1fr 1fr" : "1fr 1fr",
        gap: 8,
        marginBottom: 14,
      }}
    >
      <div style={{ ...S.card(), textAlign: "center", padding: "10px 12px" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--accent)" }}>
          {matchPts}
        </div>
        <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 1 }}>
          Wedstrijden
        </div>
      </div>
      {standing.allPlayed && (
        <div style={{ ...S.card(), textAlign: "center", padding: "10px 12px" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--accent)" }}>
            {standingPts}
          </div>
          <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 1 }}>
            Stand
          </div>
        </div>
      )}
      <div style={{ ...S.card(), textAlign: "center", padding: "10px 12px" }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--gold)" }}>
          {standing.allPlayed ? totalPts : matchPts}
        </div>
        <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 1 }}>
          Totaal
        </div>
      </div>
    </div>
  );
}

function TeamLabel({ team, align = "left" }) {
  const isNL = team === "Nederland";
  return (
    <span
      style={{
        flex: 1,
        fontSize: 13,
        fontWeight: isNL ? 900 : 600,
        color: isNL ? "var(--orange)" : "var(--text)",
        textAlign: align,
      }}
    >
      {FLAG[team]} {team}
    </span>
  );
}

function GroupMatchRow({ match: m, pred, result: r, frozen, isGroupF, onSet, canInfo, onInfo }) {
  const res = calcGroupMatchPts(pred.matches?.[m.id], r);
  const borderColor = res
    ? res.label === "exact"
      ? "rgba(63,185,80,.5)"
      : res.label === "diff"
      ? "rgba(255,193,7,.4)"
      : res.label === "winner"
      ? isGroupF
        ? "rgba(240,136,62,.4)"
        : "rgba(88,166,255,.3)"
      : "rgba(248,81,73,.3)"
    : "var(--border)";

  return (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 2,
          paddingLeft: 2,
        }}
      >
        <span style={{ fontSize: 10, color: "var(--muted)" }}>
          {m.dt ? fmtDateTime(m.dt) : ""} · Ronde {m.round}
        </span>
        {canInfo && (
          <span style={{ fontSize: 10, color: "var(--muted)", padding: "2px 4px" }}>
            info →
          </span>
        )}
      </div>
      <div
        onClick={canInfo ? onInfo : undefined}
        style={{
          ...S.card(),
          padding: "9px 12px",
          border: `1px solid ${borderColor}`,
          background: isGroupF ? "rgba(240,136,62,.04)" : "var(--card)",
          cursor: canInfo ? "pointer" : "default",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TeamLabel team={m.home} align="right" />
          <input
            disabled={frozen}
            type="number"
            min={0}
            max={20}
            value={pred.matches?.[m.id]?.home ?? ""}
            onChange={(e) => onSet(["matches", m.id, "home"], e.target.value)}
            style={S.numInput}
          />
          <span style={{ color: "var(--muted)", fontWeight: 700 }}>–</span>
          <input
            disabled={frozen}
            type="number"
            min={0}
            max={20}
            value={pred.matches?.[m.id]?.away ?? ""}
            onChange={(e) => onSet(["matches", m.id, "away"], e.target.value)}
            style={S.numInput}
          />
          <TeamLabel team={m.away} align="left" />
        </div>
        {r?.played && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              marginTop: 6,
              paddingTop: 6,
              borderTop: "1px solid var(--border)",
            }}
          >
            <span style={{ fontSize: 11, color: "var(--muted)" }}>
              Uitslag:
            </span>
            <span
              style={{
                fontWeight: 700,
                fontSize: 13,
                color: "var(--text)",
                background: "rgba(255,255,255,.06)",
                borderRadius: 4,
                padding: "1px 8px",
              }}
            >
              {r.home}–{r.away}
            </span>
            {res && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: res.pts > 0 ? "var(--green)" : "var(--red)",
                  marginLeft: 4,
                }}
              >
                {res.pts > 0 ? `+${res.pts} pt` : "✗"}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function GroupStandingPreviews({ activeGroup, pred, results }) {
  const predStanding = deriveGroupStandings(pred);
  const adminStanding = deriveGroupStandingsFromResults(results);
  const predRows = predStanding[activeGroup]?.table || [];
  const adminRows = adminStanding[activeGroup]?.table || [];
  const hasAdminData = adminRows.some((r) => r.gp > 0);
  const isGroupF = activeGroup === "F";

  return (
    <div style={{ marginTop: 10 }}>
      {hasAdminData && (
        <div
          style={{
            ...S.card(),
            marginBottom: 10,
            border: isGroupF
              ? "1px solid rgba(240,136,62,.3)"
              : "1px solid var(--border)",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: isGroupF ? "var(--orange)" : "var(--green)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 6,
            }}
          >
            📊 Huidige stand (gespeelde wedstrijden)
          </div>
          <GroupStandingTable rows={adminRows} />
        </div>
      )}
      {predRows.some((r) => r.gp > 0) && (
        <div
          style={{
            ...S.card(),
            border: isGroupF
              ? "1px solid rgba(240,136,62,.2)"
              : "1px solid var(--border)",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: isGroupF ? "var(--orange)" : "var(--accent)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 6,
            }}
          >
            🔮 Jouw voorspelde eindstand
          </div>
          <GroupStandingTable rows={predRows} />
        </div>
      )}
    </div>
  );
}

export { GroupPredictionsForm, FormHeader };
