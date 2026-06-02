import React, { useState } from "react";
import { GROUPS, GROUP_MATCHES, PTS_KO, FLAG } from "../data/tournamentData";
import { calcGroupMatchPts, calcPoints, buildRichKOSlots, fmtDateTime } from "../pouleEngine";
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
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{subtitle}</div>}
      </div>
      <button
        onClick={onClose}
        style={{ background: "none", border: "none", color: "var(--muted)", fontSize: 22, cursor: "pointer" }}
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

// ─── SINGLE MATCH COMPARE ─────────────────────────────────────────────────────

function SingleMatchCompare({ match, state, currentUserId, onClose }) {
  const result = state.results[match.id];
  const users = state.users
    .filter((u) => {
      const pm = u.predictions?.matches?.[match.id];
      return pm?.home !== undefined && pm.home !== "";
    })
    .sort((a, b) => {
      const pa = calcGroupMatchPts(a.predictions.matches[match.id], result);
      const pb = calcGroupMatchPts(b.predictions.matches[match.id], result);
      return (pb?.pts ?? 0) - (pa?.pts ?? 0);
    });

  return (
    <Overlay onClose={onClose}>
      <OverlayHeader
        title={`${FLAG[match.home]} ${match.home} vs ${FLAG[match.away]} ${match.away}`}
        subtitle={`${fmtDateTime(match.dt)} · Poule ${match.group} · Ronde ${match.round}`}
        onClose={onClose}
      />

      {result?.played && (
        <div
          style={{
            textAlign: "center",
            ...S.card(),
            padding: "10px",
            marginBottom: 14,
            background: "rgba(63,185,80,.08)",
            border: "1px solid rgba(63,185,80,.3)",
          }}
        >
          <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 2 }}>Officiële uitslag</div>
          <div style={{ fontSize: 24, fontWeight: 900 }}>{result.home} – {result.away}</div>
        </div>
      )}

      {users.length === 0 ? (
        <div style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", padding: 20 }}>
          Niemand heeft deze wedstrijd ingevuld.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {users.map((u, i) => {
            const pm = u.predictions.matches[match.id];
            const res = calcGroupMatchPts(pm, result);
            const isMe = u.id === currentUserId;
            return (
              <div
                key={u.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  borderRadius: 8,
                  padding: "10px 12px",
                  background: resultBg(res, result?.played),
                  border: `1px solid ${isMe ? "var(--accent)" : "rgba(48,54,61,.6)"}`,
                }}
              >
                <div style={{ fontSize: 16, width: 24 }}>
                  {["🥇", "🥈", "🥉"][i] || `#${i + 1}`}
                </div>
                <div style={{ flex: 1, fontWeight: isMe ? 700 : 400, fontSize: 13 }}>
                  {u.name}{isMe ? " (jij)" : ""}
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                    color: isMe ? "var(--accent)" : "var(--text)",
                    background: "rgba(255,255,255,.06)",
                    borderRadius: 6,
                    padding: "3px 10px",
                    minWidth: 52,
                    textAlign: "center",
                  }}
                >
                  {pm.home}–{pm.away}
                </div>
                {res ? (
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 12,
                      color: res.pts > 0 ? "var(--green)" : "var(--red)",
                      minWidth: 60,
                      textAlign: "right",
                    }}
                  >
                    {res.pts > 0
                      ? `+${res.pts} ${res.label === "exact" ? "exact" : res.label === "diff" ? "verschil" : "winnaar"}`
                      : result?.played ? "✗" : ""}
                  </div>
                ) : (
                  <div style={{ minWidth: 60 }} />
                )}
              </div>
            );
          })}
        </div>
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
      : GROUP_MATCHES.filter((m) => m.round === parseInt(filter.replace("ronde_", "")));

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
      <div style={{ display: "flex", background: "var(--bg)", borderRadius: 8, padding: 3, marginBottom: 10 }}>
        {[["poule", "Per poule"], ["ronde", "Per speelronde"]].map(([v, l]) => (
          <button
            key={v}
            onClick={() => { setGroupBy(v); setFilter(v === "poule" ? "poule_A" : "ronde_1"); }}
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
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
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
        <div style={{ color: "var(--muted)", fontSize: 13, textAlign: "center", padding: 20 }}>
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
      <div style={{ display: "grid", gridTemplateColumns: cols, gap: 4, marginBottom: 6, alignItems: "center" }}>
        <div />
        {users.map((u) => {
          const isMe = u.id === currentUserId;
          return (
            <div key={u.id} style={{ textAlign: "center", fontSize: 12, fontWeight: isMe ? 700 : 600, color: isMe ? "var(--accent)" : "var(--text)" }}>
              <div>{u.name}{isMe ? " 👈" : ""}</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>{userPts(u)} pt</div>
            </div>
          );
        })}
      </div>

      {matches.map((m) => {
        const result = state.results[m.id];
        return (
          <div key={m.id} style={{ display: "grid", gridTemplateColumns: cols, gap: 4, marginBottom: 5, alignItems: "center" }}>
            <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.3 }}>
              <div style={{ fontWeight: 600, color: "var(--text)", fontSize: 12 }}>
                {FLAG[m.home]} {m.home}
              </div>
              <div style={{ fontSize: 10 }}>vs {FLAG[m.away]} {m.away}</div>
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
                    border: `1px solid ${isMe ? "rgba(88,166,255,.3)" : "rgba(48,54,61,.5)"}`,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 13, color: isMe ? "var(--accent)" : "var(--text)" }}>
                    {hasPred ? `${pm.home}–${pm.away}` : <span style={{ color: "var(--muted)", fontSize: 11 }}>–</span>}
                  </div>
                  {res && (
                    <div style={{ fontSize: 10, fontWeight: 700, color: res.pts > 0 ? "var(--green)" : "var(--red)" }}>
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
      <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 1fr", gap: 6, marginBottom: 14, alignItems: "center" }}>
        <div />
        <div style={{ textAlign: "center", fontWeight: 700, fontSize: 14, color: "var(--accent)" }}>
          {me.name}<br />
          <span style={{ fontWeight: 400, fontSize: 12 }}>{myPts} pt</span>
        </div>
        <div style={{ textAlign: "center", fontWeight: 700, fontSize: 14, color: "var(--orange)" }}>
          {other.name}<br />
          <span style={{ fontWeight: 400, fontSize: 12 }}>{otherPts} pt</span>
        </div>
      </div>

      {/* Extra predictions */}
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
        Extra vragen
      </div>
      {[
        ["Kampioen", myPred.champion ? `${FLAG[myPred.champion] || ""} ${myPred.champion}` : "", otherPred.champion ? `${FLAG[otherPred.champion] || ""} ${otherPred.champion}` : ""],
        ["Topscorer", myPred.topScorer || "", otherPred.topScorer || ""],
        ["Nederland", myPred.nlStage || "", otherPred.nlStage || ""],
        ["Verrassing", myPred.surpriseTeam ? `${FLAG[myPred.surpriseTeam] || ""} ${myPred.surpriseTeam}` : "", otherPred.surpriseTeam ? `${FLAG[otherPred.surpriseTeam] || ""} ${otherPred.surpriseTeam}` : ""],
        ["Topland", myPred.topOut ? `${FLAG[myPred.topOut] || ""} ${myPred.topOut}` : "", otherPred.topOut ? `${FLAG[otherPred.topOut] || ""} ${otherPred.topOut}` : ""],
      ].map(([label, myVal, otherVal]) => (
        <ExtraRow key={label} label={label} myVal={myVal} otherVal={otherVal} />
      ))}

      {/* Group-by toggle */}
      <div style={{ marginTop: 18, marginBottom: 10 }}>
        <div style={{ display: "flex", background: "var(--bg)", borderRadius: 8, padding: 3 }}>
          {[["ronde", "Per speelronde"], ["poule", "Per poule"]].map(([v, l]) => (
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
      <div style={{ width: 80, color: "var(--muted)", fontSize: 11, paddingTop: 4 }}>{label}</div>
      <div style={{ ...cellStyle, color: "var(--accent)" }}>
        {myVal || <span style={{ color: "var(--muted)", fontWeight: 400 }}>–</span>}
      </div>
      <div style={{ ...cellStyle, color: "var(--orange)" }}>
        {otherVal || <span style={{ color: "var(--muted)", fontWeight: 400 }}>–</span>}
      </div>
    </div>
  );
}

function CompareSection({ section, me, other, state, mySecPts, otherSecPts }) {
  const myPred = me.predictions || {};
  const otherPred = other.predictions || {};

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "90px 1fr 1fr", gap: 6, marginBottom: 6, alignItems: "center" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
          {section.label}
        </div>
        <div style={{ textAlign: "center", fontSize: 11, color: "var(--accent)", fontWeight: 700 }}>{mySecPts} pt</div>
        <div style={{ textAlign: "center", fontSize: 11, color: "var(--orange)", fontWeight: 700 }}>{otherSecPts} pt</div>
      </div>

      {section.matches.map((m) => {
        const my = myPred.matches?.[m.id];
        const ot = otherPred.matches?.[m.id];
        const r = state.results[m.id];
        const myRes = calcGroupMatchPts(my, r);
        const otRes = calcGroupMatchPts(ot, r);
        const same =
          my?.home !== undefined && my.home !== "" &&
          ot?.home !== undefined && ot.home !== "" &&
          my.home === ot.home && my.away === ot.away;
        const hasMy = my?.home !== undefined && my.home !== "";
        const hasOt = ot?.home !== undefined && ot.home !== "";

        return (
          <div key={m.id} style={{ display: "grid", gridTemplateColumns: "90px 1fr 1fr", gap: 4, marginBottom: 4, alignItems: "center" }}>
            <div style={{ fontSize: 10, color: "var(--muted)", lineHeight: 1.3 }}>
              <span style={{ fontWeight: 600, color: "var(--text)" }}>{FLAG[m.home]} {m.home}</span>
              <br />
              <span>vs {FLAG[m.away]} {m.away}</span>
              {r?.played && (
                <div style={{ color: "var(--green)", fontWeight: 700 }}>{r.home}–{r.away}</div>
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
                  border: `1px solid ${same ? "rgba(88,166,255,.3)" : "rgba(48,54,61,.5)"}`,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13, color: accent }}>
                  {has ? `${pred.home}–${pred.away}` : <span style={{ color: "var(--muted)", fontSize: 11 }}>–</span>}
                </div>
                {res && r?.played && (
                  <div style={{ fontSize: 10, fontWeight: 700, color: res.pts > 0 ? "var(--green)" : "var(--red)" }}>
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

export { SingleMatchCompare, MatchCompare, PlayerCompare };
