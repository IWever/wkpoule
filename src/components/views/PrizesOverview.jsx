import React, { useMemo, useState } from "react";
import {
  GROUP_MATCHES,
  KO_STRUCTURE,
  FLAG,
} from "../../data/tournamentData";
import { calcCategoryPoints, calcGroupMatchPts } from "../../pouleEngine";
import { calcPrimaryComp } from "./Standings";
import { S } from "../../styles/ui";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

// Rangschik deelnemers op een puntenveld en geef gedeelde rank terug.
function rankBy(rows, field) {
  const sorted = [...rows].sort((a, b) => b[field] - a[field]);
  return sorted.map((r) => ({
    ...r,
    _rank: sorted.filter((o) => o[field] > r[field]).length + 1,
  }));
}

const MEDAL = { 1: "🥇", 2: "🥈", 3: "🥉" };

function fmtTeam(team) {
  if (!team) return "—";
  return `${FLAG[team] || "🏳️"} ${team}`;
}

// Bepaal per deelnemer de "leuke" voorspellingsdata (los van de uitslagen).
function collectStats(users, results) {
  const perUser = users.map((u) => {
    const p = u.predictions || {};

    // Totaal voorspelde doelpunten in de groepsfase
    let groupGoals = 0;
    let filledMatches = 0;
    let exactGroup = 0;
    GROUP_MATCHES.forEach((m) => {
      const pr = p.matches?.[m.id];
      if (pr && pr.home !== "" && pr.home !== undefined && pr.away !== "" && pr.away !== undefined) {
        const h = parseInt(pr.home, 10);
        const a = parseInt(pr.away, 10);
        if (!Number.isNaN(h) && !Number.isNaN(a)) {
          groupGoals += h + a;
          filledMatches++;
        }
      }
      const res = calcGroupMatchPts(pr, results[m.id]);
      if (res?.label === "exact") exactGroup++;
    });

    const topScorers = Array.isArray(p.topScorers)
      ? p.topScorers.filter(Boolean)
      : p.topScorer
      ? [p.topScorer]
      : [];

    return {
      id: u.id,
      name: u.name,
      champion: p.champion || null,
      topScorers,
      surprise: p.surpriseTeam || null,
      nlStage: p.nlStage || null,
      groupGoals,
      filledMatches,
      exactGroup,
    };
  });

  // Populariteit tellen
  function tally(getter) {
    const counts = {};
    perUser.forEach((s) => {
      const vals = getter(s);
      (Array.isArray(vals) ? vals : [vals]).forEach((v) => {
        if (v) counts[v] = (counts[v] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count);
  }

  return {
    perUser,
    championPop: tally((s) => s.champion),
    topScorerPop: tally((s) => s.topScorers),
    surprisePop: tally((s) => s.surprise),
  };
}

// ─── PRIZES OVERVIEW ──────────────────────────────────────────────────────────

function PrizesOverview({ state, currentUser = null, isAdmin = true }) {
  // Admin ziet alle competities; een deelnemer alleen de niet-verborgen
  // competities waar hij zelf lid van is (net als bij de Stand).
  const competitions = useMemo(() => {
    const all = state.competitions || [];
    if (isAdmin) return all;
    return all.filter(
      (c) => !c.hidden && (currentUser?.competitionIds || []).includes(c.id)
    );
  }, [state.competitions, isAdmin, currentUser]);

  const [compId, setCompId] = useState(() => {
    if (isAdmin) return "all";
    const primary = calcPrimaryComp(currentUser, state);
    return primary?.comp?.id || competitions[0]?.id || "all";
  });

  const users = useMemo(() => {
    if (compId === "all") return state.users;
    return state.users.filter((u) => (u.competitionIds || []).includes(compId));
  }, [state.users, compId]);

  const scored = useMemo(
    () =>
      users.map((u) => ({
        id: u.id,
        name: u.name,
        ...calcCategoryPoints(u, state.results, state.koResults),
      })),
    [users, state.results, state.koResults]
  );

  const stats = useMemo(() => collectStats(users, state.results), [users, state.results]);

  const compName =
    compId === "all"
      ? "alle deelnemers"
      : competitions.find((c) => c.id === compId)?.name || "competitie";

  const prizeCats = [
    { key: "total", icon: "🏆", label: "Algemeen klassement", accent: "var(--gold)", desc: "Hoogste totaalscore over alles" },
    { key: "ko", icon: "⚔️", label: "KO-fase", accent: "var(--orange)", desc: "Meeste punten in de knock-outfase" },
    { key: "group", icon: "⚽", label: "Groepsfase + stand", accent: "var(--accent)", desc: "Groepswedstrijden én groepsstanden" },
    { key: "extra", icon: "🔮", label: "Extra vragen", accent: "var(--green)", desc: "Kampioen, topscoorder, verrassing e.d." },
  ];

  return (
    <div>
      <div
        style={{
          fontSize: 13,
          color: "var(--muted)",
          marginBottom: 16,
          lineHeight: 1.6,
        }}
      >
        {isAdmin
          ? "Overzicht van de prijswinnaars per categorie en leuke statistieken voor een intranetbericht. Winnaars worden bepaald op basis van de huidige ingevoerde uitslagen — reik de prijzen pas uit als het toernooi (of de betreffende fase) is afgelopen."
          : "Wie ligt er op kop per categorie, plus leuke statistieken over alle voorspellingen. De standen zijn gebaseerd op de tot nu toe ingevoerde uitslagen."}
      </div>

      {competitions.length > 0 && (
        <CompPicker
          competitions={competitions}
          state={state}
          activeId={compId}
          onSelect={setCompId}
        />
      )}

      {users.length === 0 ? (
        <div style={{ ...S.card(), color: "var(--muted)", textAlign: "center" }}>
          Geen deelnemers in deze selectie.
        </div>
      ) : (
        <>
          <SectionTitle icon="🏆" text="Prijzen" />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 12,
              marginBottom: 26,
            }}
          >
            {prizeCats.map((cat) => (
              <PrizeCard
                key={cat.key}
                cat={cat}
                ranked={rankBy(scored, cat.key)}
              />
            ))}
          </div>

          <SectionTitle
            icon="📊"
            text="Leuke statistieken"
            hint="Automatisch berekend uit de voorspellingen en de tot nu toe ingevoerde uitslagen. Puur voor de lol — deze tellen niet mee voor de punten."
          />
          <StatsGrid scored={scored} stats={stats} />

          <SectionTitle
            icon="🔥"
            text="Populaire keuzes"
            hint="Waar zetten de meeste deelnemers op in? Achter elke keuze staat hoe vaak die gekozen is en welk aandeel van de groep dat is."
          />
          <PopularitySection stats={stats} total={users.length} />

          {isAdmin && (
            <>
              <SectionTitle icon="📋" text="Klaar voor het intranet" />
              <IntranetBlock
                scored={scored}
                stats={stats}
                prizeCats={prizeCats}
                compName={compName}
                userCount={users.length}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

// ─── COMPETITION PICKER ───────────────────────────────────────────────────────

function CompPicker({ competitions, state, activeId, onSelect }) {
  const chips = [
    { id: "all", name: "Alle deelnemers", count: state.users.length },
    ...competitions.map((c) => ({
      id: c.id,
      name: c.name,
      count: state.users.filter((u) => (u.competitionIds || []).includes(c.id)).length,
    })),
  ];
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
      {chips.map((c) => {
        const active = activeId === c.id;
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
            <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>({c.count})</span>
          </button>
        );
      })}
    </div>
  );
}

function SectionTitle({ icon, text, hint }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "var(--accent)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        {icon} {text}
      </div>
      {hint && (
        <div
          style={{
            fontSize: 12,
            color: "var(--muted)",
            marginTop: 4,
            lineHeight: 1.5,
          }}
        >
          {hint}
        </div>
      )}
    </div>
  );
}

// ─── PRIZE CARD (podium) ──────────────────────────────────────────────────────

function PrizeCard({ cat, ranked }) {
  const podium = ranked.filter((r) => r._rank <= 3);
  const leaderPts = ranked[0]?.[cat.key] ?? 0;
  const noPoints = leaderPts <= 0;

  return (
    <div style={{ ...S.card(), borderTop: `2px solid ${cat.accent}` }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 2 }}>
        <span style={{ fontSize: 16 }}>{cat.icon}</span>
        <span style={{ fontWeight: 700, fontSize: 15 }}>{cat.label}</span>
      </div>
      <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12 }}>
        {cat.desc}
      </div>

      {noPoints ? (
        <div style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>
          Nog geen punten in deze categorie.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {podium.map((r) => (
            <div
              key={r.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "6px 8px",
                borderRadius: 8,
                background:
                  r._rank === 1
                    ? "linear-gradient(135deg,rgba(212,175,55,.12),rgba(212,175,55,.03))"
                    : "var(--bg)",
                border: `1px solid ${r._rank === 1 ? "rgba(212,175,55,.35)" : "var(--border)"}`,
              }}
            >
              <span style={{ fontSize: 18, width: 26, textAlign: "center" }}>
                {MEDAL[r._rank] || `#${r._rank}`}
              </span>
              <span style={{ flex: 1, fontWeight: r._rank === 1 ? 700 : 600, fontSize: 14 }}>
                {r.name}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 20,
                  color: r._rank === 1 ? "var(--gold)" : "var(--accent)",
                }}
              >
                {r[cat.key]}
              </span>
              <span style={{ fontSize: 10, color: "var(--muted)" }}>pt</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── STATS GRID ───────────────────────────────────────────────────────────────

function StatsGrid({ scored, stats }) {
  const n = scored.length;
  const totals = scored.map((s) => s.total);
  const avg = n > 0 ? Math.round(totals.reduce((a, b) => a + b, 0) / n) : 0;
  const topOverall = [...scored].sort((a, b) => b.total - a.total)[0];

  const per = stats.perUser;
  const optimist = [...per].sort((a, b) => b.groupGoals - a.groupGoals)[0];
  const withPreds = per.filter((s) => s.filledMatches > 0);
  const zuinig = [...withPreds].sort((a, b) => a.groupGoals - b.groupGoals)[0];
  const sharpest = [...per].sort((a, b) => b.exactGroup - a.exactGroup)[0];
  const someExact = sharpest && sharpest.exactGroup > 0;
  const oranjeFans = per.filter((s) => s.champion === "Nederland").length;

  const tiles = [
    {
      icon: "👥",
      value: n,
      title: "Deelnemers",
      hint: "Aantal meespelers in deze selectie.",
      color: "var(--accent)",
    },
    {
      icon: "📈",
      value: avg,
      title: "Gemiddelde score",
      hint: "Gemiddeld aantal punten per deelnemer.",
      color: "var(--accent)",
    },
    {
      icon: "🔥",
      value: topOverall ? `${topOverall.total}` : "—",
      title: "Koploper",
      who: topOverall?.name,
      hint: "Hoogste totaalscore op dit moment.",
      color: "var(--gold)",
    },
    {
      icon: "🎯",
      value: someExact ? sharpest.exactGroup : "—",
      title: "Scherpschutter",
      who: someExact ? sharpest.name : null,
      hint: "Meeste exact voorspelde groepsuitslagen.",
      color: "var(--green)",
    },
    {
      icon: "🎢",
      value: optimist ? optimist.groupGoals : "—",
      title: "Grootste optimist",
      who: optimist?.name,
      hint: "Voorspelde de meeste doelpunten in de groepsfase.",
      color: "var(--orange)",
    },
    {
      icon: "🧱",
      value: zuinig ? zuinig.groupGoals : "—",
      title: "Zuinigste",
      who: zuinig?.name,
      hint: "Voorspelde de minste doelpunten in de groepsfase.",
      color: "var(--muted)",
    },
    {
      icon: "🇳🇱",
      value: oranjeFans,
      title: "Oranjegevoel",
      hint: "Aantal deelnemers dat Nederland als wereldkampioen koos.",
      color: "var(--orange)",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 10,
        marginBottom: 26,
      }}
    >
      {tiles.map((t, i) => (
        <div
          key={i}
          style={{
            ...S.card(),
            textAlign: "center",
            padding: "14px 12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 20, marginBottom: 4 }}>{t.icon}</div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 28,
              lineHeight: 1,
              color: t.color,
            }}
          >
            {t.value}
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, marginTop: 6 }}>
            {t.title}
          </div>
          {t.who && (
            <div style={{ fontSize: 12, color: "var(--accent)", fontWeight: 600, marginTop: 1 }}>
              {t.who}
            </div>
          )}
          <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 5, lineHeight: 1.4 }}>
            {t.hint}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── POPULARITY BARS ──────────────────────────────────────────────────────────

function PopularitySection({ stats, total }) {
  const blocks = [
    { title: "🏆 Populairste wereldkampioen", data: stats.championPop, isTeam: true },
    { title: "⚽ Populairste topscoorder", data: stats.topScorerPop, isTeam: false },
    { title: "🌟 Populairste verrassing", data: stats.surprisePop, isTeam: true },
  ];
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: 12,
        marginBottom: 26,
      }}
    >
      {blocks.map((b) => (
        <PopularityCard key={b.title} title={b.title} data={b.data} isTeam={b.isTeam} total={total} />
      ))}
    </div>
  );
}

function PopularityCard({ title, data, isTeam, total }) {
  const top = data.slice(0, 5);
  const max = top[0]?.count || 1;
  return (
    <div style={S.card()}>
      <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>{title}</div>
      {top.length === 0 ? (
        <div style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>
          Nog niets ingevuld.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {top.map((row) => {
            const pct = Math.round((row.count / total) * 100);
            return (
              <div key={row.key}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 12,
                    marginBottom: 3,
                  }}
                >
                  <span style={{ fontWeight: 600 }}>
                    {isTeam ? fmtTeam(row.key) : row.key}
                  </span>
                  <span style={{ color: "var(--muted)" }}>
                    {row.count}× · {pct}%
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    background: "var(--bg)",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(row.count / max) * 100}%`,
                      height: "100%",
                      background: "var(--accent)",
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── INTRANET TEXT BLOCK ──────────────────────────────────────────────────────

function buildIntranetText({ scored, stats, prizeCats, compName, userCount }) {
  const n = userCount;
  const totals = scored.map((s) => s.total);
  const avg = n > 0 ? Math.round(totals.reduce((a, b) => a + b, 0) / n) : 0;

  const lines = [];
  lines.push("🏆 WK POULE 2026 — Prijzenoverzicht");
  lines.push(`(${compName}, ${n} deelnemer${n === 1 ? "" : "s"})`);
  lines.push("");

  prizeCats.forEach((cat) => {
    const ranked = rankBy(scored, cat.key);
    const leader = ranked[0];
    if (leader && leader[cat.key] > 0) {
      const tied = ranked.filter((r) => r._rank === 1).map((r) => r.name);
      lines.push(
        `${cat.icon} ${cat.label}: ${tied.join(" & ")} (${leader[cat.key]} pt)`
      );
    } else {
      lines.push(`${cat.icon} ${cat.label}: nog niet beslist`);
    }
  });

  lines.push("");
  lines.push("📊 Leuke weetjes:");
  lines.push(`• Gemiddelde score: ${avg} punten`);

  const per = stats.perUser;
  const optimist = [...per].sort((a, b) => b.groupGoals - a.groupGoals)[0];
  if (optimist && optimist.groupGoals > 0) {
    lines.push(
      `• Grootste optimist: ${optimist.name} voorspelde ${optimist.groupGoals} doelpunten in de groepsfase`
    );
  }
  const champ = stats.championPop[0];
  if (champ) {
    lines.push(
      `• Populairste wereldkampioen: ${champ.key} (${champ.count} van de ${n})`
    );
  }
  const scorer = stats.topScorerPop[0];
  if (scorer) {
    lines.push(`• Populairste topscoorder: ${scorer.key} (${scorer.count}×)`);
  }
  const surprise = stats.surprisePop[0];
  if (surprise) {
    lines.push(`• Populairste verrassing: ${surprise.key} (${surprise.count}×)`);
  }
  const oranjeFans = per.filter((s) => s.champion === "Nederland").length;
  if (oranjeFans > 0) {
    lines.push(`• ${oranjeFans} deelnemer${oranjeFans === 1 ? "" : "s"} gokte op Oranje als wereldkampioen 🇳🇱`);
  }

  return lines.join("\n");
}

function IntranetBlock(props) {
  const text = useMemo(() => buildIntranetText(props), [props]);
  const [copied, setCopied] = useState(false);

  function copy() {
    const done = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallback());
    } else {
      fallback();
    }
    function fallback() {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        done();
      } catch {}
      document.body.removeChild(ta);
    }
  }

  return (
    <div style={{ ...S.card(), marginBottom: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <span style={{ fontSize: 12, color: "var(--muted)" }}>
          Kant-en-klare tekst om te plakken in een intranetbericht.
        </span>
        <button
          onClick={copy}
          style={{
            ...S.btn(copied ? "var(--green)" : "var(--accent)"),
            padding: "7px 16px",
            fontSize: 13,
            whiteSpace: "nowrap",
          }}
        >
          {copied ? "✓ Gekopieerd" : "📋 Kopiëren"}
        </button>
      </div>
      <pre
        style={{
          margin: 0,
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "12px 14px",
          fontSize: 12.5,
          lineHeight: 1.6,
          color: "var(--text)",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          fontFamily: "'Barlow', sans-serif",
        }}
      >
        {text}
      </pre>
    </div>
  );
}

export { PrizesOverview };
