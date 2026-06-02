import React, { useState } from "react";
import {
  GROUP_MATCHES,
  KO_STRUCTURE,
  ALL_TEAMS,
  NL_STAGES,
  SURPRISE_TEAMS,
  PTS_SURPRISE,
  TOP_TEAMS,
  PLAYERS_BY_COUNTRY,
  FLAG,
  GROUPS,
  getNextDeadline,
  PTS_KO,
  PTS_TOPSCORER_RANK,
} from "../../data/tournamentData";
import {
  calcPoints,
  deriveGroupStandingsFromResults,
  groupsAllFilled,
  resolveSlotRich,
  deriveSurpriseStage,
  deriveTopOuts,
  persist,
  fmtDateTime,
} from "../../pouleEngine";
import { S } from "../../styles/ui";
import { Alert, SlotDisplay, TabBar } from "../common";

const KO_DATES = {
  r32: "2026-07-01",
  r16: "2026-07-05",
  qf: "2026-07-10",
  sf: "2026-07-14",
  "3rd": "2026-07-18",
  final: "2026-07-19",
};

// ─── ADMIN PANEL (root) ───────────────────────────────────────────────────────

function AdminPanel({ state, setState }) {
  const [tab, setTab] = useState("home");
  const [activeGroup, setActiveGroup] = useState("A");

  const upd = (patch) =>
    setState((s) => {
      const ns = { ...s, ...patch };
      persist(ns);
      return ns;
    });

  const updResult = (id, field, val) =>
    setState((s) => {
      const ns = {
        ...s,
        results: {
          ...s.results,
          [id]: { ...(s.results[id] || {}), [field]: val },
        },
      };
      persist(ns);
      return ns;
    });

  const updKO = (id, field, val) =>
    setState((s) => {
      const ns = {
        ...s,
        koResults: {
          ...s.koResults,
          [id]: { ...(s.koResults[id] || {}), [field]: val },
        },
      };
      persist(ns);
      return ns;
    });

  const removeUser = (uid) => {
    if (!confirm("Verwijderen?")) return;
    setState((s) => {
      const ns = { ...s, users: s.users.filter((u) => u.id !== uid) };
      persist(ns);
      return ns;
    });
  };

  const frozenRounds = state.koFrozenRounds || {};
  const toggleKORound = (roundKey) => {
    const next = { ...frozenRounds, [roundKey]: !frozenRounds[roundKey] };
    upd({ koFrozenRounds: next, koFrozen: Object.values(next).some(Boolean) });
  };

  const TABS = [
    { id: "home", label: "🏠 Overzicht" },
    { id: "fase", label: "🔒 Bevriezen" },
    {
      id: "competitions",
      label: `🏆 Competities (${(state.competitions || []).length})`,
    },
    { id: "users", label: `👥 Deelnemers (${state.users.length})` },
    { id: "results", label: "📊 Groepsuitslagen" },
    { id: "ko", label: "⚔️ KO-uitslagen" },
    { id: "extra", label: "🏅 Extras" },
  ];

  return (
    <div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 24,
          color: "var(--orange)",
          letterSpacing: "0.06em",
          marginBottom: 20,
        }}
      >
        ⚙️ ADMIN PANEEL
      </div>
      <TabBar tabs={TABS} active={tab} onSelect={setTab} />

      {tab === "home" && (
        <AdminHome state={state} onUpdResult={updResult} onUpdKO={updKO} />
      )}
      {tab === "fase" && (
        <FreezePanel
          state={state}
          onUpd={upd}
          frozenRounds={frozenRounds}
          onToggleKORound={toggleKORound}
        />
      )}
      {tab === "competitions" && (
        <CompetitionsAdmin state={state} setState={setState} />
      )}
      {tab === "users" && <UsersAdmin state={state} onRemove={removeUser} />}
      {tab === "results" && (
        <ResultsAdmin
          state={state}
          activeGroup={activeGroup}
          setActiveGroup={setActiveGroup}
          updResult={updResult}
          setState={setState}
        />
      )}
      {tab === "ko" && <KOResultsAdmin state={state} updKO={updKO} />}
      {tab === "extra" && <ExtrasAdmin state={state} setState={setState} />}
    </div>
  );
}

// ─── ADMIN HOME ───────────────────────────────────────────────────────────────

function AdminHome({ state, onUpdResult, onUpdKO }) {
  const groupMatches = GROUP_MATCHES.map((m) => ({ ...m, isKO: false }));
  const koMatches = KO_STRUCTURE.map((m) => ({
    ...m,
    dt: KO_DATES[m.round] + "T20:00",
    isKO: true,
  }));
  const allMatches = [...groupMatches, ...koMatches].sort((a, b) =>
    (a.dt || "").localeCompare(b.dt || "")
  );
  const allPlayed = allMatches.filter((m) =>
    m.isKO ? state.koResults[m.id]?.played : state.results[m.id]?.played
  );
  const allUpcoming = allMatches.filter(
    (m) =>
      !(m.isKO ? state.koResults[m.id]?.played : state.results[m.id]?.played)
  );
  const last5 = allPlayed.slice(-5).reverse();
  const next5 = allUpcoming.slice(0, 5);
  const totalMatches = GROUP_MATCHES.length + KO_STRUCTURE.length;
  const frozenRounds = state.koFrozenRounds || {};
  const nextDeadline = getNextDeadline();

  const frozenRoundLabels = {
    r32: "Zestiende finales",
    r16: "Achtste finales",
    qf: "Kwartfinales",
    sf: "Halve finales",
    "3rd": "3e Plaats",
    final: "Finale",
  };

  return (
    <div>
      {nextDeadline && (
        <div
          style={{
            ...S.card(),
            marginBottom: 18,
            background: "rgba(240,136,62,.06)",
            border: "1px solid rgba(240,136,62,.3)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
          }}
        >
          <span style={{ fontSize: 18 }}>⏰</span>
          <div>
            <div
              style={{ fontWeight: 700, fontSize: 13, color: "var(--orange)" }}
            >
              Volgende deadline: {nextDeadline.label}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>
              {new Date(nextDeadline.dt).toLocaleString("nl-NL", {
                weekday: "short",
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              · {nextDeadline.desc}
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10,
          marginBottom: 22,
        }}
      >
        {[
          [state.users.length, "Deelnemers"],
          [allPlayed.length, "Gespeeld"],
          [totalMatches - allPlayed.length, "Resterend"],
        ].map(([val, lbl]) => (
          <div key={lbl} style={{ ...S.card(), textAlign: "center" }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 26,
                color: "var(--accent)",
              }}
            >
              {val}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {lbl}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          ...S.card(),
          marginBottom: 18,
          background: "rgba(88,166,255,.04)",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--muted)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 10,
          }}
        >
          Status
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { label: "Groepsfase", key: "groupFrozen", icon: "⚽" },
            { label: "Extra vragen", key: "extraFrozen", icon: "🔮" },
            { label: "KO open", key: "koOpen", icon: "⚔️", invert: true },
          ].map(({ label, key, icon, invert }) => {
            const active = state[key];
            const isGood = invert ? active : !active;
            return (
              <StatusBadge
                key={key}
                icon={icon}
                label={label}
                isGood={isGood}
                text={
                  invert
                    ? active
                      ? "✓ open"
                      : "✗ dicht"
                    : active
                    ? "✗ bevroren"
                    : "✓ open"
                }
              />
            );
          })}
          {Object.entries(frozenRoundLabels).map(([key, label]) => {
            const frozen = !!frozenRounds[key];
            return (
              <StatusBadge
                key={key}
                icon="⚔️"
                label={label}
                isGood={!frozen}
                text={frozen ? "✗ bevroren" : "✓ open"}
              />
            );
          })}
        </div>
      </div>

      <AdminMatchList
        title="Laatste gespeelde wedstrijden"
        matches={last5}
        state={state}
        onUpdResult={onUpdResult}
        onUpdKO={onUpdKO}
        emptyMsg="Nog geen wedstrijden gespeeld."
      />
      <AdminMatchList
        title="Volgende wedstrijden"
        matches={next5}
        state={state}
        onUpdResult={onUpdResult}
        onUpdKO={onUpdKO}
        emptyMsg="Geen komende wedstrijden meer."
        topMargin
      />
    </div>
  );
}

function StatusBadge({ icon, label, isGood, text }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        background: isGood ? "rgba(63,185,80,.1)" : "rgba(248,81,73,.08)",
        border: `1px solid ${
          isGood ? "rgba(63,185,80,.3)" : "rgba(248,81,73,.2)"
        }`,
        borderRadius: 8,
        padding: "6px 12px",
        fontSize: 12,
      }}
    >
      <span>{icon}</span>
      <span
        style={{
          fontWeight: 600,
          color: isGood ? "var(--green)" : "var(--red)",
        }}
      >
        {label}
      </span>
      <span
        style={{ color: isGood ? "var(--green)" : "var(--red)", fontSize: 11 }}
      >
        {text}
      </span>
    </div>
  );
}

function AdminMatchList({
  title,
  matches,
  state,
  onUpdResult,
  onUpdKO,
  emptyMsg,
  topMargin,
}) {
  return (
    <>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "var(--accent)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 10,
          ...(topMargin && { marginTop: 22 }),
        }}
      >
        {title}
      </div>
      {matches.length === 0 ? (
        <div
          style={{
            ...S.card(),
            color: "var(--muted)",
            fontSize: 13,
            textAlign: "center",
            marginBottom: 18,
          }}
        >
          {emptyMsg}
        </div>
      ) : (
        matches.map((m) => (
          <AdminMatchRow
            key={m.id}
            m={m}
            state={state}
            onUpdResult={onUpdResult}
            onUpdKO={onUpdKO}
          />
        ))
      )}
    </>
  );
}

function AdminMatchRow({ m, state, onUpdResult, onUpdKO }) {
  const r = m.isKO ? state.koResults[m.id] || {} : state.results[m.id] || {};
  const isGroupF = !m.isKO && m.group === "F";
  const played = !!r.played;
  const accent = m.isKO || isGroupF ? "var(--orange)" : "var(--accent)";

  return (
    <div
      style={{
        ...S.card(),
        marginBottom: 8,
        padding: "10px 14px",
        border: `1px solid ${
          isGroupF
            ? "rgba(240,136,62,.3)"
            : m.isKO
            ? "rgba(240,136,62,.25)"
            : "var(--border)"
        }`,
        background: isGroupF ? "rgba(240,136,62,.03)" : "var(--card)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: 10, color: "var(--muted)" }}>
          {m.dt ? fmtDateTime(m.dt) : ""}
        </span>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: accent,
            background:
              m.isKO || isGroupF
                ? "rgba(240,136,62,.1)"
                : "rgba(88,166,255,.1)",
            borderRadius: 4,
            padding: "1px 6px",
          }}
        >
          {m.isKO ? m.label : `Groep ${m.group} · R${m.round}`}
        </span>
      </div>
      <div
        style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}
      >
        <span style={{ flex: 1, textAlign: "right", fontWeight: 600 }}>
          {m.isKO ? m.homeSlot || "?" : `${FLAG[m.home] || ""} ${m.home}`}
        </span>
        <ScoreInputs
          homeVal={m.isKO ? r.home90 : r.home}
          awayVal={m.isKO ? r.away90 : r.away}
          onHomeChange={(v) =>
            m.isKO ? onUpdKO(m.id, "home90", v) : onUpdResult(m.id, "home", v)
          }
          onAwayChange={(v) =>
            m.isKO ? onUpdKO(m.id, "away90", v) : onUpdResult(m.id, "away", v)
          }
        />
        <span style={{ flex: 1, fontWeight: 600 }}>
          {m.isKO ? m.awaySlot || "?" : `${FLAG[m.away] || ""} ${m.away}`}
        </span>
      </div>
      <div
        style={{ marginTop: 8, display: "flex", justifyContent: "flex-end" }}
      >
        <label
          style={{
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 4,
            cursor: "pointer",
            color: played ? accent : "var(--muted)",
          }}
        >
          <input
            type="checkbox"
            checked={played}
            onChange={(e) =>
              m.isKO
                ? onUpdKO(m.id, "played", e.target.checked)
                : onUpdResult(m.id, "played", e.target.checked)
            }
          />
          Gespeeld
        </label>
      </div>
    </div>
  );
}

function ScoreInputs({ homeVal, awayVal, onHomeChange, onAwayChange }) {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
      <input
        type="number"
        min={0}
        max={20}
        value={homeVal ?? ""}
        onChange={(e) => onHomeChange(e.target.value)}
        style={S.numInput}
      />
      <span style={{ color: "var(--muted)", fontWeight: 700 }}>–</span>
      <input
        type="number"
        min={0}
        max={20}
        value={awayVal ?? ""}
        onChange={(e) => onAwayChange(e.target.value)}
        style={S.numInput}
      />
    </div>
  );
}

// ─── FREEZE PANEL ─────────────────────────────────────────────────────────────

function FreezePanel({ state, onUpd, frozenRounds, onToggleKORound }) {
  const KO_ROUND_CONFIG = [
    {
      key: "r32",
      label: "Zestiende finales",
      date: "1 jul",
      deadline: "vóór aanvang eerste zestiende finale",
    },
    {
      key: "r16",
      label: "Achtste finales",
      date: "5 jul",
      deadline: "vóór aanvang eerste achtste finale",
    },
    {
      key: "qf",
      label: "Kwartfinales",
      date: "10 jul",
      deadline: "vóór aanvang eerste kwartfinale",
    },
    {
      key: "sf",
      label: "Halve finales",
      date: "14 jul",
      deadline: "vóór aanvang eerste halve finale",
    },
    {
      key: "3rd",
      label: "3e Plaats",
      date: "18 jul",
      deadline: "vóór aanvang troostfinale",
    },
    {
      key: "final",
      label: "Finale",
      date: "19 jul",
      deadline: "vóór aanvang finale",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        style={{
          ...S.card(),
          background: "rgba(88,166,255,.04)",
          marginBottom: 4,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
          ⏰ Deadline-overzicht
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.8 }}>
          Bevriezing moet vóór aanvang van de eerste wedstrijd van elke ronde
          plaatsvinden:
        </div>
        <div
          style={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {[
            [
              "Extra vragen & Groepsfase ronde 1",
              "11 jun 21:00 — vóór aanvang eerste groepswedstrijd",
            ],
            [
              "Groepsfase ronde 2",
              "18 jun 18:00 — vóór aanvang eerste wedstrijd ronde 2",
            ],
            [
              "Groepsfase ronde 3",
              "24 jun 21:00 — vóór aanvang eerste wedstrijd ronde 3",
            ],
          ].map(([label, date]) => (
            <div key={label} style={{ display: "flex", gap: 8, fontSize: 12 }}>
              <span style={{ color: "var(--accent)", minWidth: 6 }}>·</span>
              <span>
                <strong style={{ color: "var(--text)" }}>{label}:</strong>{" "}
                <span style={{ color: "var(--muted)" }}>{date}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {[
        {
          key: "groupFrozen",
          icon: "⚽",
          label: "Groepsuitslagen",
          desc: "Deelnemers kunnen hun wedstrijduitslagen niet meer aanpassen",
        },
        {
          key: "extraFrozen",
          icon: "🔮",
          label: "Extra vragen",
          desc: "Kampioen, topscoorders, Nederland, gele kaarten, verrassing en topland",
        },
        {
          key: "koOpen",
          icon: "⚔️",
          label: "KO-fase openen",
          desc: "Deelnemers kunnen KO-voorspellingen invullen",
          invert: true,
        },
      ].map(({ key, icon, label, desc, invert }) => {
        const active = state[key];
        return (
          <div
            key={key}
            style={{
              ...S.card(),
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>
                {icon} {label}
              </div>
              <div
                style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}
              >
                {desc}
              </div>
            </div>
            <button
              onClick={() => onUpd({ [key]: !active })}
              style={{
                ...S.btn(
                  invert
                    ? active
                      ? "var(--green)"
                      : "var(--card2)"
                    : active
                    ? "var(--red)"
                    : "var(--green)"
                ),
                padding: "8px 18px",
                fontSize: 13,
                border: `1px solid ${
                  invert
                    ? active
                      ? "var(--green)"
                      : "var(--border)"
                    : active
                    ? "var(--red)"
                    : "var(--green)"
                }`,
              }}
            >
              {invert
                ? active
                  ? "✓ Open"
                  : "Openzetten"
                : active
                ? "🔒 Bevroren"
                : "🔓 Open"}
            </button>
          </div>
        );
      })}

      <div style={{ ...S.card(), marginTop: 4 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
          ⚔️ KO-fase — per ronde bevriezen
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--muted)",
            marginBottom: 16,
            lineHeight: 1.6,
          }}
        >
          Bevriezing vóór aanvang eerste wedstrijd van elke ronde.
        </div>
        {KO_ROUND_CONFIG.map(({ key, label, date, deadline }) => {
          const frozen = !!frozenRounds[key];
          return (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "10px 0",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>
                  {date} · {deadline}
                </div>
              </div>
              <button
                onClick={() => onToggleKORound(key)}
                style={{
                  ...S.btn(frozen ? "var(--red)" : "var(--green)"),
                  padding: "7px 18px",
                  fontSize: 12,
                  border: `1px solid ${frozen ? "var(--red)" : "var(--green)"}`,
                }}
              >
                {frozen ? "🔒 Bevroren" : "🔓 Open"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── COMPETITIONS ADMIN ───────────────────────────────────────────────────────

function CompetitionsAdmin({ state, setState }) {
  const [newName, setNewName] = useState("");
  const competitions = state.competitions || [];

  function addComp() {
    if (!newName.trim()) return;
    const id = "c_" + Date.now();
    setState((s) => {
      const ns = {
        ...s,
        competitions: [
          ...(s.competitions || []),
          {
            id,
            name: newName.trim(),
            hidden: false,
            hiddenRegistration: false,
          },
        ],
      };
      persist(ns);
      return ns;
    });
    setNewName("");
  }

  function removeComp(id) {
    if (!confirm("Competitie verwijderen?")) return;
    setState((s) => {
      const ns = {
        ...s,
        competitions: (s.competitions || []).filter((c) => c.id !== id),
        users: s.users.map((u) => ({
          ...u,
          competitionIds: (u.competitionIds || []).filter((cid) => cid !== id),
        })),
      };
      persist(ns);
      return ns;
    });
  }

  function toggleUserInComp(userId, compId) {
    setState((s) => {
      const ns = {
        ...s,
        users: s.users.map((u) => {
          if (u.id !== userId) return u;
          const ids = u.competitionIds || [];
          return {
            ...u,
            competitionIds: ids.includes(compId)
              ? ids.filter((id) => id !== compId)
              : [...ids, compId],
          };
        }),
      };
      persist(ns);
      return ns;
    });
  }

  function toggleCompProp(id, prop) {
    setState((s) => {
      const ns = {
        ...s,
        competitions: s.competitions.map((c) =>
          c.id === id ? { ...c, [prop]: !c[prop] } : c
        ),
      };
      persist(ns);
      return ns;
    });
  }

  return (
    <div>
      <div style={{ ...S.card(), marginBottom: 16 }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>
          Nieuwe competitie aanmaken
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            style={{ ...S.input, flex: 1 }}
            placeholder="Naam (bijv. Familie poule)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addComp()}
          />
          <button
            style={{ ...S.btn("var(--green)"), whiteSpace: "nowrap" }}
            onClick={addComp}
          >
            + Aanmaken
          </button>
        </div>
      </div>

      {competitions.length === 0 && (
        <p style={{ color: "var(--muted)", fontSize: 13 }}>
          Nog geen competities.
        </p>
      )}

      {competitions.map((comp) => {
        const members = state.users.filter((u) =>
          (u.competitionIds || []).includes(comp.id)
        );
        const nonMembers = state.users.filter(
          (u) => !(u.competitionIds || []).includes(comp.id)
        );
        return (
          <div key={comp.id} style={{ ...S.card(), marginBottom: 14 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{comp.name}</div>
                <div
                  style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}
                >
                  {members.length} deelnemer{members.length !== 1 ? "s" : ""}
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {[
                  ["hidden", comp.hidden ? "🏅 Verborgen" : "🏅 Zichtbaar"],
                  [
                    "hiddenRegistration",
                    comp.hiddenRegistration ? "📝 Verborgen" : "📝 Zichtbaar",
                  ],
                ].map(([prop, label]) => (
                  <button
                    key={prop}
                    onClick={() => toggleCompProp(comp.id, prop)}
                    style={{
                      background: comp[prop]
                        ? "rgba(240,136,62,.12)"
                        : "rgba(88,166,255,.08)",
                      border: `1px solid ${
                        comp[prop] ? "var(--orange)" : "var(--border)"
                      }`,
                      borderRadius: 6,
                      color: comp[prop] ? "var(--orange)" : "var(--muted)",
                      padding: "4px 10px",
                      cursor: "pointer",
                      fontSize: 12,
                      fontFamily: "var(--font)",
                    }}
                  >
                    {label}
                  </button>
                ))}
                <button
                  onClick={() => removeComp(comp.id)}
                  style={{
                    background: "none",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    color: "var(--muted)",
                    padding: "4px 10px",
                    cursor: "pointer",
                    fontSize: 12,
                    fontFamily: "var(--font)",
                  }}
                >
                  🗑 Verwijderen
                </button>
              </div>
            </div>

            {members.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--muted)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    marginBottom: 6,
                  }}
                >
                  Deelnemers
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {members.map((u) => (
                    <div
                      key={u.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: "rgba(88,166,255,.1)",
                        border: "1px solid rgba(88,166,255,.3)",
                        borderRadius: 20,
                        padding: "4px 10px 4px 12px",
                        fontSize: 13,
                      }}
                    >
                      <span style={{ color: "var(--accent)", fontWeight: 600 }}>
                        {u.name}
                      </span>
                      <button
                        onClick={() => toggleUserInComp(u.id, comp.id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--muted)",
                          fontSize: 14,
                          padding: "0 2px",
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {nonMembers.length > 0 && (
              <div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--muted)",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                    marginBottom: 6,
                  }}
                >
                  Toevoegen
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {nonMembers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => toggleUserInComp(u.id, comp.id)}
                      style={{
                        background: "var(--bg)",
                        border: "1px solid var(--border)",
                        borderRadius: 20,
                        padding: "4px 12px",
                        fontSize: 13,
                        color: "var(--text)",
                        cursor: "pointer",
                        fontFamily: "var(--font)",
                      }}
                    >
                      + {u.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── USERS ADMIN ──────────────────────────────────────────────────────────────

function UsersAdmin({ state, onRemove }) {
  return (
    <div>
      {state.users.length === 0 && (
        <p style={{ color: "var(--muted)" }}>Nog niemand geregistreerd.</p>
      )}
      {state.users.map((u) => {
        const pts = calcPoints(u, state.results, state.koResults);
        const p = u.predictions || {};
        const groupFilled = GROUP_MATCHES.filter(
          (m) =>
            p.matches?.[m.id]?.home !== undefined && p.matches[m.id].home !== ""
        ).length;
        const topScorers = Array.isArray(p.topScorers)
          ? p.topScorers.filter(Boolean)
          : p.topScorer
          ? [p.topScorer]
          : [];
        const extraFilled = [
          !!p.champion,
          topScorers.length > 0,
          !!p.nlStage,
          !!p.yellowCards,
          !!p.surpriseTeam,
          !!p.topOut,
        ].filter(Boolean).length;
        const koFilled = KO_STRUCTURE.filter((m) => p.koWinners?.[m.id]).length;
        const userComps = (u.competitionIds || [])
          .map(
            (cid) => (state.competitions || []).find((c) => c.id === cid)?.name
          )
          .filter(Boolean);
        const koAvail = state.koOpen || state.fase === "ko";

        return (
          <div key={u.id} style={{ ...S.card(), marginBottom: 10 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
                marginBottom: 6,
              }}
            >
              <div style={{ flex: 1, fontWeight: 700, fontSize: 14 }}>
                {u.name}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "var(--accent)",
                  fontWeight: 700,
                }}
              >
                {pts} pt
              </div>
              <PwReveal u={u} />
              <button
                onClick={() => onRemove(u.id)}
                style={{
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  color: "var(--muted)",
                  padding: "3px 8px",
                  cursor: "pointer",
                  fontSize: 11,
                  fontFamily: "var(--font)",
                }}
              >
                ✕
              </button>
            </div>
            {userComps.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  flexWrap: "wrap",
                  marginBottom: 6,
                }}
              >
                {userComps.map((name) => (
                  <span
                    key={name}
                    style={{
                      fontSize: 11,
                      background: "rgba(88,166,255,.1)",
                      border: "1px solid rgba(88,166,255,.2)",
                      borderRadius: 10,
                      padding: "1px 8px",
                      color: "var(--accent)",
                    }}
                  >
                    {name}
                  </span>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              <UserPill
                label="Extra"
                filled={extraFilled}
                total={6}
                available
              />
              <UserPill
                label="Groepsfase"
                filled={groupFilled}
                total={GROUP_MATCHES.length}
                available
              />
              <UserPill
                label="KO-fase"
                filled={koFilled}
                total={KO_STRUCTURE.length}
                available={koAvail}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function UserPill({ label, filled, total, available }) {
  if (!available)
    return (
      <span
        style={{
          fontSize: 11,
          color: "var(--muted)",
          background: "rgba(255,255,255,.04)",
          borderRadius: 4,
          padding: "2px 7px",
        }}
      >
        {label} —
      </span>
    );
  const done = filled === total;
  const started = filled > 0;
  return (
    <span
      style={{
        fontSize: 11,
        color: done
          ? "var(--green)"
          : started
          ? "var(--orange)"
          : "var(--muted)",
        background: done
          ? "rgba(63,185,80,.12)"
          : started
          ? "rgba(240,136,62,.12)"
          : "rgba(255,255,255,.04)",
        borderRadius: 4,
        padding: "2px 7px",
        fontWeight: done ? 700 : 400,
      }}
    >
      {done ? "✓" : started ? "…" : "○"} {label} {filled}/{total}
    </span>
  );
}

function PwReveal({ u }) {
  const [show, setShow] = useState(false);
  if (!u.pwPlain) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
      <span
        style={{
          fontSize: 11,
          color: "var(--muted)",
          background: "var(--bg)",
          borderRadius: 5,
          padding: "2px 8px",
          fontFamily: "monospace",
          letterSpacing: show ? ".05em" : "0",
          minWidth: 70,
          textAlign: "center",
        }}
      >
        {show ? u.pwPlain : "••••••••"}
      </span>
      <button
        onClick={() => setShow((s) => !s)}
        style={{
          background: "none",
          border: "1px solid var(--border)",
          borderRadius: 5,
          color: "var(--muted)",
          cursor: "pointer",
          fontSize: 10,
          padding: "2px 6px",
          fontFamily: "var(--font)",
        }}
      >
        {show ? "verberg" : "toon"}
      </button>
    </div>
  );
}

// ─── RESULTS ADMIN ────────────────────────────────────────────────────────────

function ResultsAdmin({
  state,
  activeGroup,
  setActiveGroup,
  updResult,
  setState,
}) {
  const adminS = deriveGroupStandingsFromResults(state.results);
  const s = adminS[activeGroup];
  const isGroupF = activeGroup === "F";
  const allGroupPlayed = GROUP_MATCHES.filter(
    (m) => m.group === activeGroup
  ).every((m) => state.results[m.id]?.played);

  if (
    allGroupPlayed &&
    s?.winner &&
    state.results[`GW_${activeGroup}`] !== s.winner
  ) {
    setTimeout(
      () =>
        setState((prev) => {
          const ns = {
            ...prev,
            results: {
              ...prev.results,
              [`GW_${activeGroup}`]: s.winner,
              [`GR_${activeGroup}`]: s.runnerUp,
            },
          };
          persist(ns);
          return ns;
        }),
      0
    );
  }

  return (
    <div>
      <GroupSelector active={activeGroup} onSelect={setActiveGroup} />
      {s && s.table.some((r) => r.gp > 0) && (
        <div
          style={{
            ...S.card(),
            marginBottom: 12,
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
              marginBottom: 8,
            }}
          >
            📊 Huidige stand Groep {activeGroup}
            {allGroupPlayed && (
              <span style={{ marginLeft: 8, color: "var(--accent)" }}>
                ✓ Volledig gespeeld
              </span>
            )}
          </div>
          <AdminStandingTable rows={s.table} />
        </div>
      )}
      {(!s || !s.table.some((r) => r.gp > 0)) && (
        <div
          style={{
            ...S.card(),
            marginBottom: 12,
            fontSize: 12,
            color: "var(--muted)",
          }}
        >
          Nog geen wedstrijden gespeeld in Groep {activeGroup}.
        </div>
      )}

      {GROUP_MATCHES.filter((m) => m.group === activeGroup).map((m) => {
        const r = state.results[m.id] || {};
        return (
          <div key={m.id} style={{ marginBottom: 6 }}>
            <div
              style={{
                fontSize: 10,
                color: "var(--muted)",
                marginBottom: 2,
                paddingLeft: 2,
              }}
            >
              {m.dt ? fmtDateTime(m.dt) : ""} · Ronde {m.round}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                ...S.card(),
                padding: "8px 12px",
                border: `1px solid ${
                  r.played
                    ? isGroupF
                      ? "rgba(240,136,62,.4)"
                      : "rgba(88,166,255,.4)"
                    : "var(--border)"
                }`,
                background: isGroupF ? "rgba(240,136,62,.03)" : "var(--card)",
              }}
            >
              <span
                style={{
                  flex: 1,
                  fontSize: 13,
                  textAlign: "right",
                  fontWeight: 600,
                }}
              >
                {FLAG[m.home]} {m.home}
              </span>
              <ScoreInputs
                homeVal={r.home}
                awayVal={r.away}
                onHomeChange={(v) => updResult(m.id, "home", v)}
                onAwayChange={(v) => updResult(m.id, "away", v)}
              />
              <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>
                {FLAG[m.away]} {m.away}
              </span>
              <label
                style={{
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  cursor: "pointer",
                  color: r.played
                    ? isGroupF
                      ? "var(--orange)"
                      : "var(--accent)"
                    : "var(--muted)",
                  whiteSpace: "nowrap",
                }}
              >
                <input
                  type="checkbox"
                  checked={!!r.played}
                  onChange={(e) => updResult(m.id, "played", e.target.checked)}
                />{" "}
                Gespeeld
              </label>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GroupSelector({ active, onSelect }) {
  return (
    <div
      style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}
    >
      {"ABCDEFGHIJKL".split("").map((g) => {
        const isActive = active === g;
        const isF = g === "F";
        return (
          <button
            key={g}
            onClick={() => onSelect(g)}
            style={{
              padding: "5px 13px",
              borderRadius: 20,
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
            }}
          >
            Groep {g}
          </button>
        );
      })}
    </div>
  );
}

function AdminStandingTable({ rows }) {
  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 30px 34px 34px 34px 34px",
          gap: "0 4px",
          color: "var(--muted)",
          fontWeight: 700,
          fontSize: 11,
          textTransform: "uppercase",
          padding: "2px 4px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span>Team</span>
        <span style={{ textAlign: "center" }}>W</span>
        <span style={{ textAlign: "center" }}>Pts</span>
        <span style={{ textAlign: "center", color: "var(--green)" }}>GV+</span>
        <span style={{ textAlign: "center", color: "var(--red)" }}>GT-</span>
        <span style={{ textAlign: "center" }}>DS</span>
      </div>
      {rows.map((r, i) => (
        <div
          key={r.team}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 30px 34px 34px 34px 34px",
            gap: "0 4px",
            alignItems: "center",
            padding: "5px 4px",
            background: i < 2 ? "rgba(88,166,255,0.06)" : "transparent",
            borderRadius: 4,
            borderBottom: "1px solid rgba(48,54,61,.4)",
            fontSize: 12,
          }}
        >
          <span
            style={{
              fontWeight: i < 2 ? 700 : 400,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            <span
              style={{
                color:
                  i === 0
                    ? "var(--gold)"
                    : i === 1
                    ? "var(--muted)"
                    : "var(--border)",
                fontWeight: 700,
                width: 16,
              }}
            >
              {i === 0 ? "①" : i === 1 ? "②" : "○"}
            </span>
            {FLAG[r.team]} {r.team}
            {i < 2 && (
              <span
                style={{
                  fontSize: 10,
                  color: i === 0 ? "var(--green)" : "var(--accent)",
                  marginLeft: 4,
                }}
              >
                → KO
              </span>
            )}
          </span>
          <span style={{ textAlign: "center", color: "var(--muted)" }}>
            {r.gp}
          </span>
          <span
            style={{
              textAlign: "center",
              fontWeight: 700,
              color: "var(--accent)",
            }}
          >
            {r.pts}
          </span>
          <span style={{ textAlign: "center", color: "var(--green)" }}>
            {r.gf}
          </span>
          <span style={{ textAlign: "center", color: "var(--red)" }}>
            {r.ga}
          </span>
          <span
            style={{
              textAlign: "center",
              color:
                r.gd > 0
                  ? "var(--green)"
                  : r.gd < 0
                  ? "var(--red)"
                  : "var(--muted)",
              fontWeight: r.gd !== 0 ? 700 : 400,
            }}
          >
            {r.gd > 0 ? "+" : ""}
            {r.gd}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── KO RESULTS ADMIN ─────────────────────────────────────────────────────────

function KOResultsAdmin({ state, updKO }) {
  return (
    <div>
      <Alert
        msg="Vul de uitslag na 90 minuten in plus de officiële winnaar (na evt. verlenging/strafschoppen)."
        type="info"
      />
      {KO_STRUCTURE.map((m) => {
        const r = state.koResults[m.id] || {};
        const adminCtx = {
          adminStandings: deriveGroupStandingsFromResults(state.results),
          adminComplete: groupsAllFilled((id) => {
            const res = state.results[id];
            return res?.played ? res : null;
          }),
          userKoWinners: Object.fromEntries(
            KO_STRUCTURE.map((km) => [
              km.id,
              state.koResults[km.id]?.winner,
            ]).filter(([, v]) => v)
          ),
          adminKoResults: state.koResults,
        };
        const homeDesc = resolveSlotRich(m.homeSlot, adminCtx);
        const awayDesc = resolveSlotRich(m.awaySlot, adminCtx);
        const homeCands =
          homeDesc?.type === "team"
            ? [homeDesc.team]
            : homeDesc?.type === "two"
            ? homeDesc.teams
            : [];
        const awayCands =
          awayDesc?.type === "team"
            ? [awayDesc.team]
            : awayDesc?.type === "two"
            ? awayDesc.teams
            : [];
        const candidates = [...new Set([...homeCands, ...awayCands])];
        const useButtons = candidates.length >= 1 && candidates.length <= 4;

        return (
          <div
            key={m.id}
            style={{
              ...S.card(),
              marginBottom: 10,
              border: `1px solid ${
                r.played ? "rgba(88,166,255,.4)" : "var(--border)"
              }`,
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--muted)",
                marginBottom: 10,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
              }}
            >
              {m.label}
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
              <div style={{ flex: 1, textAlign: "right" }}>
                <SlotDisplay desc={homeDesc} align="right" size={13} />
              </div>
              <ScoreInputs
                homeVal={r.home90}
                awayVal={r.away90}
                onHomeChange={(v) => updKO(m.id, "home90", v)}
                onAwayChange={(v) => updKO(m.id, "away90", v)}
              />
              <div style={{ flex: 1 }}>
                <SlotDisplay desc={awayDesc} align="left" size={13} />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexWrap: "wrap",
                borderTop: "1px solid var(--border)",
                paddingTop: 8,
              }}
            >
              <span style={{ fontSize: 12, color: "var(--muted)" }}>
                Winnaar:
              </span>
              {useButtons ? (
                <div style={{ display: "flex", gap: 6, flex: 1 }}>
                  {candidates.map((t) => (
                    <button
                      key={t}
                      onClick={() =>
                        updKO(m.id, "winner", r.winner === t ? "" : t)
                      }
                      style={{
                        flex: 1,
                        minWidth: 80,
                        padding: "6px 8px",
                        borderRadius: 8,
                        border: `2px solid ${
                          r.winner === t ? "var(--accent)" : "var(--border)"
                        }`,
                        background:
                          r.winner === t ? "rgba(88,166,255,.15)" : "var(--bg)",
                        color: "var(--text)",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: r.winner === t ? 700 : 400,
                        fontFamily: "var(--font)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                      }}
                    >
                      {FLAG[t] || "🏳️"} {t}
                    </button>
                  ))}
                </div>
              ) : (
                <select
                  value={r.winner || ""}
                  onChange={(e) => updKO(m.id, "winner", e.target.value)}
                  style={{
                    flex: 1,
                    background: "var(--bg)",
                    color: "var(--text)",
                    border: "1px solid var(--border)",
                    borderRadius: 6,
                    padding: "6px 10px",
                    fontSize: 13,
                    fontFamily: "var(--font)",
                  }}
                >
                  <option value="">— selecteer winnaar —</option>
                  {ALL_TEAMS.map((t) => (
                    <option key={t} value={t}>
                      {FLAG[t]} {t}
                    </option>
                  ))}
                </select>
              )}
              <label
                style={{
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  cursor: "pointer",
                  color: r.played ? "var(--accent)" : "var(--muted)",
                  whiteSpace: "nowrap",
                }}
              >
                <input
                  type="checkbox"
                  checked={!!r.played}
                  onChange={(e) => updKO(m.id, "played", e.target.checked)}
                />{" "}
                Gespeeld
              </label>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── EXTRAS ADMIN ─────────────────────────────────────────────────────────────

function ExtrasAdmin({ state, setState }) {
  const topOuts = deriveTopOuts(state.results);
  const surpriseProgress = SURPRISE_TEAMS.map((team) => ({
    team,
    stage: deriveSurpriseStage(team, state.koResults),
  })).filter((s) => s.stage);

  function setResult(patch) {
    setState((s) => {
      const ns = { ...s, results: { ...s.results, ...patch } };
      persist(ns);
      return ns;
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Topscorer admin — nieuw systeem met ranks */}
      <TopScorerAdmin state={state} setState={setState} />

      <div style={S.card()}>
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>
          🇳🇱 Hoe ver is Nederland gekomen?
        </div>
        <select
          value={state.results["NL_STAGE"] || ""}
          onChange={(e) => setResult({ NL_STAGE: e.target.value })}
          style={{
            background: "var(--bg)",
            color: "var(--text)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            padding: "8px 12px",
            fontSize: 14,
            width: "100%",
            fontFamily: "var(--font)",
          }}
        >
          <option value="">— nog niet bekend —</option>
          {NL_STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div style={S.card()}>
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}>
          🟨 Land met meeste gele kaarten (na toernooi)
        </div>
        <select
          value={state.results["YELLOW_CARDS"] || ""}
          onChange={(e) => setResult({ YELLOW_CARDS: e.target.value })}
          style={{
            background: "var(--bg)",
            color: "var(--text)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            padding: "8px 12px",
            fontSize: 14,
            width: "100%",
            fontFamily: "var(--font)",
          }}
        >
          <option value="">— nog niet bekend —</option>
          {ALL_TEAMS.map((t) => (
            <option key={t} value={t}>
              {FLAG[t] || "🏳️"} {t}
            </option>
          ))}
        </select>
      </div>

      <div style={{ ...S.card(), background: "rgba(88,166,255,.04)" }}>
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>
          💥 Toplands uitgeschakeld in groepsfase (automatisch)
        </div>
        {topOuts.length === 0 ? (
          <span
            style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}
          >
            Nog geen volledig gespeelde groepen met toplands
          </span>
        ) : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {topOuts.map((t) => (
              <span
                key={t}
                style={{
                  background: "rgba(248,81,73,.15)",
                  border: "1px solid var(--red)",
                  borderRadius: 6,
                  padding: "3px 10px",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--red)",
                }}
              >
                {FLAG[t] || "🏳️"} {t}
              </span>
            ))}
          </div>
        )}
      </div>

      <div style={{ ...S.card(), background: "rgba(88,166,255,.04)" }}>
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>
          🌟 Verrassing-landen in KO-fase (automatisch)
        </div>
        {surpriseProgress.length === 0 ? (
          <span
            style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}
          >
            Nog geen KO-wedstrijden gespeeld
          </span>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {surpriseProgress.map(({ team, stage }) => (
              <div
                key={team}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  fontSize: 13,
                }}
              >
                <span style={{ fontWeight: 700 }}>
                  {FLAG[team] || "🏳️"} {team}
                </span>
                <span style={{ color: "var(--muted)" }}>→</span>
                <span style={{ color: "var(--accent)", fontWeight: 700 }}>
                  {stage}
                </span>
                <span style={{ color: "var(--green)", fontWeight: 700 }}>
                  +{PTS_SURPRISE[stage] || 0} pt
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TOPSCORER ADMIN — nieuw systeem met ranks ─────────────────────────────────

function TopScorerAdmin({ state, setState }) {
  // TOP_SCORERS = array van { name, rank, country }
  const topScorers = Array.isArray(state.results["TOP_SCORERS"])
    ? state.results["TOP_SCORERS"]
    : [];

  const [newCountry, setNewCountry] = useState("");
  const [newPlayer, setNewPlayer] = useState("");
  const [newRank, setNewRank] = useState(1);

  const allPlayersForCountry = newCountry
    ? [...(PLAYERS_BY_COUNTRY[newCountry] || [])].sort((a, b) =>
        b.kwal !== a.kwal ? b.kwal - a.kwal : a.name.localeCompare(b.name)
      )
    : [];

  function addScorer() {
    if (!newPlayer) return;
    const rank = parseInt(newRank, 10);
    // Check if player already in list
    if (topScorers.find((s) => s.name === newPlayer)) return;
    const updated = [
      ...topScorers,
      { name: newPlayer, rank, country: newCountry },
    ];
    setState((s) => {
      const ns = { ...s, results: { ...s.results, TOP_SCORERS: updated } };
      persist(ns);
      return ns;
    });
    setNewPlayer("");
    setNewCountry("");
    setNewRank(1);
  }

  function removeScorer(name) {
    const updated = topScorers.filter((s) => s.name !== name);
    setState((s) => {
      const ns = { ...s, results: { ...s.results, TOP_SCORERS: updated } };
      persist(ns);
      return ns;
    });
  }

  function updateRank(name, rank) {
    const updated = topScorers.map((s) =>
      s.name === name ? { ...s, rank: parseInt(rank, 10) } : s
    );
    setState((s) => {
      const ns = { ...s, results: { ...s.results, TOP_SCORERS: updated } };
      persist(ns);
      return ns;
    });
  }

  const rankColors = {
    1: "var(--gold)",
    2: "var(--muted)",
    3: "var(--orange)",
  };
  const rankLabels = { 1: "1e (+15 pt)", 2: "2e (+10 pt)", 3: "3e (+5 pt)" };

  return (
    <div style={S.card()}>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>
        ⚽ Officiële topscoorders — voeg toe met rank
      </div>
      <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12 }}>
        Rank 1 = +15 pt, rank 2 = +10 pt, rank 3 = +5 pt voor deelnemers die
        deze speler hebben
      </div>

      {/* Current scorers list */}
      {topScorers.length > 0 && (
        <div
          style={{
            marginBottom: 14,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {topScorers.map((scorer) => (
            <div
              key={scorer.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "var(--bg)",
                borderRadius: 8,
                padding: "8px 12px",
                border: `1px solid ${
                  rankColors[scorer.rank] || "var(--border)"
                }20`,
              }}
            >
              <span
                style={{
                  background: rankColors[scorer.rank] || "var(--border)",
                  color: scorer.rank === 2 ? "var(--card)" : "#fff",
                  borderRadius: 4,
                  padding: "2px 8px",
                  fontSize: 11,
                  fontWeight: 900,
                  minWidth: 24,
                  textAlign: "center",
                }}
              >
                {scorer.rank}
              </span>
              <span style={{ flex: 1, fontWeight: 700, fontSize: 13 }}>
                {scorer.country && (FLAG[scorer.country] || "🏳️")} {scorer.name}
              </span>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--accent)",
                  fontWeight: 700,
                }}
              >
                +{PTS_TOPSCORER_RANK[scorer.rank] || 0} pt
              </span>
              {/* Rank selector */}
              <select
                value={scorer.rank}
                onChange={(e) => updateRank(scorer.name, e.target.value)}
                style={{
                  background: "var(--card2)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: "4px 8px",
                  fontSize: 12,
                  fontFamily: "var(--font)",
                }}
              >
                <option value={1}>1e (+15)</option>
                <option value={2}>2e (+10)</option>
                <option value={3}>3e (+5)</option>
              </select>
              <button
                onClick={() => removeScorer(scorer.name)}
                style={{
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  color: "var(--muted)",
                  padding: "3px 8px",
                  cursor: "pointer",
                  fontSize: 11,
                  fontFamily: "var(--font)",
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new scorer */}
      <div
        style={{
          background: "var(--bg)",
          borderRadius: 8,
          padding: "12px",
          border: "1px solid var(--border)",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--muted)",
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            marginBottom: 10,
          }}
        >
          Topscoorder toevoegen
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Country */}
          <select
            value={newCountry}
            onChange={(e) => {
              setNewCountry(e.target.value);
              setNewPlayer("");
            }}
            style={{
              background: "var(--card)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "7px 10px",
              fontSize: 13,
              width: "100%",
              fontFamily: "var(--font)",
            }}
          >
            <option value="">— kies een land —</option>
            {Object.keys(PLAYERS_BY_COUNTRY)
              .sort()
              .map((c) => (
                <option key={c} value={c}>
                  {FLAG[c] || "🏳️"} {c}
                </option>
              ))}
          </select>

          {/* Player */}
          {newCountry && (
            <select
              value={newPlayer}
              onChange={(e) => setNewPlayer(e.target.value)}
              style={{
                background: "var(--card)",
                color: "var(--text)",
                border: `1px solid ${
                  newPlayer ? "var(--accent)" : "var(--border)"
                }`,
                borderRadius: 6,
                padding: "7px 10px",
                fontSize: 13,
                width: "100%",
                fontFamily: "var(--font)",
              }}
            >
              <option value="">— kies een speler —</option>
              {allPlayersForCountry.map((p) => (
                <option
                  key={p.name}
                  value={p.name}
                  disabled={!!topScorers.find((s) => s.name === p.name)}
                >
                  {p.name}
                  {p.kwal > 0 ? ` (${p.kwal} kwal. goals)` : ""}
                  {topScorers.find((s) => s.name === p.name) ? " ✓" : ""}
                </option>
              ))}
            </select>
          )}

          {/* Rank + add button */}
          <div style={{ display: "flex", gap: 8 }}>
            <select
              value={newRank}
              onChange={(e) => setNewRank(e.target.value)}
              style={{
                background: "var(--card)",
                color: "var(--text)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "7px 10px",
                fontSize: 13,
                fontFamily: "var(--font)",
                flex: 1,
              }}
            >
              <option value={1}>Rank 1 — +15 pt (goudschoener)</option>
              <option value={2}>Rank 2 — +10 pt (zilveren schoen)</option>
              <option value={3}>Rank 3 — +5 pt (bronzen schoen)</option>
            </select>
            <button
              onClick={addScorer}
              disabled={!newPlayer}
              style={{
                ...S.btn("var(--green)"),
                padding: "7px 18px",
                fontSize: 13,
                opacity: newPlayer ? 1 : 0.4,
                cursor: newPlayer ? "pointer" : "default",
              }}
            >
              + Toevoegen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { AdminPanel };
