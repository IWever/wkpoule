import React from "react";
import { FLAG } from "../data/tournamentData";

// ─── TAB BAR ──────────────────────────────────────────────────────────────────

function TabBar({ tabs, active, onSelect }) {
  return (
    <div
      style={{
        display: "flex",
        borderBottom: "2px solid var(--border)",
        marginBottom: 22,
        overflowX: "auto",
      }}
    >
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t.id)}
          style={{
            padding: "9px 16px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font)",
            fontSize: 13,
            fontWeight: active === t.id ? 700 : 400,
            color: active === t.id ? "var(--accent)" : "var(--muted)",
            borderBottom:
              active === t.id
                ? "2px solid var(--accent)"
                : "2px solid transparent",
            marginBottom: -2,
            whiteSpace: "nowrap",
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

// ─── ALERT ────────────────────────────────────────────────────────────────────

function Alert({ msg, type = "info" }) {
  if (!msg) return null;
  const colors = {
    error: ["#f8514920", "var(--red)"],
    success: ["#3fb95020", "var(--green)"],
    info: ["#58a6ff20", "var(--accent)"],
    warn: ["#f0883e20", "var(--orange)"],
  };
  const [bg, border] = colors[type] || colors.info;
  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 8,
        padding: "10px 14px",
        fontSize: 13,
        marginBottom: 14,
      }}
    >
      {msg}
    </div>
  );
}

// ─── FLAG + TEAM NAME ─────────────────────────────────────────────────────────

function FlagTeam({ team, size = 13 }) {
  if (!team)
    return <span style={{ color: "var(--muted)", fontSize: size }}>?</span>;
  return (
    <span style={{ fontSize: size }}>
      {FLAG[team] || "🏳️"} {team}
    </span>
  );
}

// ─── SLOT DISPLAY ─────────────────────────────────────────────────────────────

function SlotDisplay({ desc, align = "left", size = 14 }) {
  if (!desc)
    return <span style={{ color: "var(--muted)", fontSize: size }}>?</span>;

  if (desc.type === "team") {
    return (
      <span
        style={{
          display: "inline-flex",
          flexDirection: "column",
          alignItems: align === "right" ? "flex-end" : "flex-start",
          gap: 1,
        }}
      >
        {desc.sublabel && (
          <span style={{ fontSize: size - 4, color: "var(--muted)", fontStyle: "italic" }}>
            {desc.sublabel}
          </span>
        )}
        <span style={{ fontSize: size, fontWeight: 700 }}>
          {FLAG[desc.team] || "🏳️"} {desc.team}
        </span>
      </span>
    );
  }

  if (desc.type === "two") {
    return (
      <span
        style={{
          fontSize: size - 1,
          fontWeight: 600,
          lineHeight: 1.4,
          display: "inline-flex",
          flexDirection: "column",
          alignItems: align === "right" ? "flex-end" : "flex-start",
          gap: 1,
        }}
      >
        {desc.sublabel && (
          <span style={{ fontSize: size - 4, color: "var(--muted)", fontStyle: "italic" }}>
            {desc.sublabel}
          </span>
        )}
        <span>
          {FLAG[desc.teams[0]] || "🏳️"} {desc.teams[0]}
        </span>
        <span style={{ color: "var(--muted)", fontSize: size - 3 }}>of</span>
        <span>
          {FLAG[desc.teams[1]] || "🏳️"} {desc.teams[1]}
        </span>
      </span>
    );
  }

  if (desc.type === "few") {
    return (
      <span
        style={{
          display: "inline-flex",
          flexDirection: "column",
          alignItems: align === "right" ? "flex-end" : "flex-start",
          gap: 2,
        }}
      >
        {desc.sublabel && (
          <span style={{ fontSize: size - 4, color: "var(--muted)", fontStyle: "italic" }}>
            {desc.sublabel}
          </span>
        )}
        <span style={{ fontSize: size + 1, letterSpacing: "0.1em", whiteSpace: "nowrap" }}>
          {desc.teams.map((t) => FLAG[t] || "🏳️").join(" ")}
        </span>
      </span>
    );
  }

  return (
    <span
      style={{ fontSize: size - 2, color: "var(--muted)", fontStyle: "italic" }}
    >
      {desc.label}
    </span>
  );
}

// ─── GROUP STANDING TABLE ─────────────────────────────────────────────────────

function GroupStandingTable({ rows }) {
  const HEADER_STYLE = {
    display: "grid",
    gridTemplateColumns: "1fr 28px 32px 32px 32px 32px",
    gap: "0 4px",
    color: "var(--muted)",
    fontWeight: 700,
    textTransform: "uppercase",
    padding: "2px 6px",
    borderBottom: "1px solid var(--border)",
  };

  const ROW_ICONS = ["①", "②", "③", "④"];

  return (
    <div style={{ fontSize: 11 }}>
      <div style={HEADER_STYLE}>
        <span>Team</span>
        <span style={{ textAlign: "center" }}>W</span>
        <span style={{ textAlign: "center" }}>Pts</span>
        <span style={{ textAlign: "center" }}>GV+</span>
        <span style={{ textAlign: "center" }}>GT-</span>
        <span style={{ textAlign: "center" }}>DS</span>
      </div>

      {rows.map((r, i) => (
        <div
          key={r.team}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 28px 32px 32px 32px 32px",
            gap: "0 4px",
            padding: "4px 6px",
            background: i < 2 ? "rgba(88,166,255,0.06)" : "transparent",
            borderRadius: 4,
            borderBottom: "1px solid rgba(48,54,61,.4)",
          }}
        >
          <span
            style={{
              fontWeight: i < 2 ? 700 : 400,
              display: "flex",
              alignItems: "center",
              gap: 4,
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
                width: 14,
              }}
            >
              {ROW_ICONS[i] || "○"}
            </span>
            {FLAG[r.team]} {r.team}
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
          <span style={{ textAlign: "center", color: "var(--muted)" }}>
            {r.gf}
          </span>
          <span style={{ textAlign: "center", color: "var(--muted)" }}>
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

// ─── FROZEN BADGE ─────────────────────────────────────────────────────────────

function FrozenBadge() {
  return (
    <span
      style={{
        fontSize: 10,
        color: "var(--orange)",
        background: "rgba(240,136,62,.12)",
        borderRadius: 4,
        padding: "1px 6px",
        fontWeight: 700,
      }}
    >
      🔒 bevroren
    </span>
  );
}

export {
  TabBar,
  Alert,
  FlagTeam,
  SlotDisplay,
  GroupStandingTable,
  FrozenBadge,
};
