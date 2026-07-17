import React, { useState } from "react";
import {
  GROUP_MATCHES,
  KO_STRUCTURE,
  PTS_KO,
  PTS_EXTRA,
  PTS_SURPRISE,
  PTS_TOP_OUT,
  PTS_TOPSCORER_RANK,
  FLAG,
  TEAM_GROUP,
  getNextDeadline,
} from "../../data/tournamentData";
import {
  calcPoints,
  calcGroupMatchPts,
  buildRichKOSlots,
  effectiveKOWinner,
  deriveSurpriseInfo,
  deriveTopOuts,
  fmtDateTime,
  calcTopScorerPts,
} from "../../pouleEngine";
import { S } from "../../styles/ui";
import { SlotDisplay } from "../common";
import { SingleMatchCompare, SingleKOMatchCompare, PlayerCompare } from "../compare";
import { calcPrimaryComp } from "./Standings";

const KO_DATES = {
  r32: "2026-07-01",
  r16: "2026-07-05",
  qf: "2026-07-10",
  sf: "2026-07-14",
  "3rd": "2026-07-18",
  final: "2026-07-19",
};

function MyOverview({ user, state, onEditGroup, onEditExtra, onEditKO }) {
  const pred = user.predictions || {};
  const pts = calcPoints(user, state.results, state.koResults);
  const primaryComp = calcPrimaryComp(user, state);
  const koAvailable = state.koOpen || state.fase === "ko";
  const [compareMatch, setCompareMatch] = useState(null);
  const [compareKOMatch, setCompareKOMatch] = useState(null);
  const [comparePlayer, setComparePlayer] = useState(null);
  const { last5, next5 } = buildMatchTimeline(state);
  const nextDeadline = getNextDeadline();
  const showDeadline = nextDeadline && (() => {
    const diffMs = new Date(nextDeadline.dt) - new Date();
    return diffMs > 0 && diffMs <= 5 * 24 * 3600 * 1000;
  })();
  const compRank = primaryComp
    ? {
        rank: primaryComp.userRank,
        total: primaryComp.size,
        name: primaryComp.comp.name,
      }
    : null;

  return (
    <div>
      {showDeadline && <DeadlineBanner deadline={nextDeadline} />}
      <WelcomeHeader user={user} />
      <StatCards pts={pts} compRank={compRank} />
      <NavCards
        pred={pred}
        state={state}
        koAvailable={koAvailable}
        onEditGroup={onEditGroup}
        onEditExtra={onEditExtra}
        onEditKO={onEditKO}
        userId={user.id}
      />
      <ExtraPredictionsGrid pred={pred} state={state} />
      <MatchTimeline
        last5={last5}
        next5={next5}
        pred={pred}
        state={state}
        canCompareMatch={state.groupFrozen}
        onCompareMatch={setCompareMatch}
        canCompareKO={state.koFrozen}
        onCompareKO={setCompareKOMatch}
      />

      {compareMatch && (
        <SingleMatchCompare
          match={compareMatch}
          state={state}
          currentUserId={user.id}
          onClose={() => setCompareMatch(null)}
        />
      )}
      {compareKOMatch && (
        <SingleKOMatchCompare
          match={compareKOMatch}
          state={state}
          currentUserId={user.id}
          onClose={() => setCompareKOMatch(null)}
        />
      )}
      {comparePlayer && (
        <PlayerCompare
          me={user}
          other={comparePlayer}
          state={state}
          onClose={() => setComparePlayer(null)}
        />
      )}
    </div>
  );
}

// ─── WELCOME HEADER ───────────────────────────────────────────────────────────

function WelcomeHeader({ user }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 22, fontWeight: 900 }}>
        Succes {user.name}! 👋
      </div>
    </div>
  );
}

// ─── DEADLINE BANNER ──────────────────────────────────────────────────────────

function DeadlineBanner({ deadline }) {
  const now = new Date();
  const then = new Date(deadline.dt);
  const diffMs = then - now;
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffH / 24);
  const urgent = diffH < 24;

  let timeStr;
  if (diffH < 1) timeStr = "minder dan een uur";
  else if (diffD >= 2) timeStr = `${diffD} dagen`;
  else if (diffD === 1) timeStr = "morgen";
  else timeStr = `${diffH} uur`;

  return (
    <div
      style={{
        background: urgent ? "rgba(248,81,73,.12)" : "rgba(88,166,255,.08)",
        border: `1px solid ${
          urgent ? "rgba(248,81,73,.4)" : "rgba(88,166,255,.3)"
        }`,
        borderRadius: 10,
        padding: "10px 14px",
        marginBottom: 16,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}
    >
      <span style={{ fontSize: 18 }}>{urgent ? "⏰" : "📅"}</span>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 13,
            color: urgent ? "var(--red)" : "var(--accent)",
          }}
        >
          Volgende deadline over {timeStr}
        </div>

        <div
          style={{
            fontWeight: 700,
            fontSize: 13,
            color: urgent ? "var(--red)" : "var(--accent)",
          }}
        >
          {deadline.label}
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "whitesmoke",
          }}
        >
          {deadline.desc}
        </div>
      </div>
    </div>
  );
}

// ─── STAT CARDS ───────────────────────────────────────────────────────────────

function StatCards({ pts, compRank }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: compRank ? "1fr 1fr" : "1fr",
        gap: 10,
        marginBottom: 16,
      }}
    >
      <StatCard value={`${pts} pts`} label="Jouw score" />
      {compRank && (
        <StatCard
          value={`#${compRank.rank}`}
          sub={`van ${compRank.total}`}
          label={compRank.name}
          color="var(--gold)"
        />
      )}
    </div>
  );
}

function StatCard({ value, sub, label, color = "var(--accent)" }) {
  return (
    <div style={{ ...S.card(), textAlign: "center" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 28, color }}>
        {value} {sub && <span style={{ fontSize: 18 }}>{sub}</span>}
      </div>
      <div
        style={{
          fontSize: 11,
          color: "var(--muted)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ─── NAVIGATION CARDS ─────────────────────────────────────────────────────────

function NavCards({
  pred,
  state,
  koAvailable,
  onEditGroup,
  onEditExtra,
  onEditKO,
  userId,
}) {
  const unlocked = (state.unlockedUsers || []).includes(userId);
  const topScorers = Array.isArray(pred.topScorers)
    ? pred.topScorers.filter(Boolean)
    : pred.topScorer
    ? [pred.topScorer]
    : [];
  const extraFilled = [
    !!pred.champion,
    topScorers.length > 0,
    !!pred.nlStage,
    !!pred.yellowCards,
    !!pred.surpriseTeam,
    !!pred.topOut,
    !!pred.mostCleanSheets,
    !!pred.mostGroupGoals,
  ].filter(Boolean).length;
  const groupFilled = GROUP_MATCHES.filter(
    (m) =>
      pred.matches?.[m.id]?.home !== undefined && pred.matches[m.id].home !== ""
  ).length;
  const koFilled = KO_STRUCTURE.filter((m) => pred.koWinners?.[m.id]).length;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        gap: 10,
        marginBottom: 22,
      }}
    >
      <NavCard
        icon="🔮"
        label="Extra vragen"
        filled={extraFilled}
        total={8}
        frozen={state.extraFrozen && !unlocked}
        available
        onClick={onEditExtra}
      />
      <NavCard
        icon="⚽"
        label="Groepsfase"
        filled={groupFilled}
        total={GROUP_MATCHES.length}
        frozen={state.extraFrozen && !unlocked}
        available
        onClick={onEditGroup}
      />
      <NavCard
        icon="⚔️"
        label="KO-fase"
        filled={koFilled}
        total={KO_STRUCTURE.length}
        frozen={false}
        available={koAvailable}
        onClick={onEditKO}
      />
    </div>
  );
}

function NavCard({ icon, label, filled, total, frozen, available, onClick }) {
  const pct = total > 0 ? Math.round((filled / total) * 100) : 0;
  const done = filled === total && available;

  let borderColor, bgColor, barColor, textColor;
  if (!available) {
    borderColor = "var(--border)";
    bgColor = "var(--card)";
    barColor = "var(--border)";
    textColor = "var(--muted)";
  } else if (frozen) {
    borderColor = "rgba(88,166,255,.4)";
    bgColor = "rgba(88,166,255,.15)";
    barColor = "var(--accent)";
    textColor = "var(--accent)";
  } else if (done) {
    borderColor = "rgba(63,185,80,.4)";
    bgColor = "rgba(63,185,80,.15)";
    barColor = "var(--green)";
    textColor = "var(--green)";
  } else {
    borderColor = "rgba(240,136,62,.4)";
    bgColor = "rgba(240,136,62,.15)";
    barColor = "var(--orange)";
    textColor = "var(--orange)";
  }

  return (
    <div
      onClick={available ? onClick : undefined}
      style={{
        ...S.card(),
        cursor: available ? "pointer" : "default",
        border: `1px solid ${borderColor}`,
        background: bgColor,
        padding: "14px 16px",
        opacity: available ? 1 : 0.5,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <span style={{ fontSize: 20 }}>{icon}</span>
        {frozen && (
          <span
            style={{
              fontSize: 10,
              color: "var(--accent)",
              background: "rgba(88,166,255,.12)",
              borderRadius: 4,
              padding: "1px 6px",
              fontWeight: 700,
            }}
          >
            🔒 bevroren
          </span>
        )}
        {!available && (
          <span style={{ fontSize: 10, color: "var(--muted)" }}>niet open</span>
        )}
      </div>
      <div
        style={{
          fontWeight: 700,
          fontSize: 14,
          color: "var(--text)",
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      {available ? (
        <>
          <div
            style={{
              fontSize: 12,
              color: textColor,
              fontWeight: done ? 700 : 400,
              marginBottom: 6,
            }}
          >
            {filled}/{total}{" "}
            {done ? "✓ compleet" : frozen ? "bevroren" : "ingevuld"}
          </div>
          <div
            style={{ height: 4, borderRadius: 2, background: "var(--border)" }}
          >
            <div
              style={{
                height: "100%",
                width: `${pct}%`,
                background: barColor,
                borderRadius: 2,
              }}
            />
          </div>
        </>
      ) : (
        <div style={{ fontSize: 12, color: "var(--muted)" }}>
          Nog niet beschikbaar
        </div>
      )}
    </div>
  );
}

// ─── EXTRA PREDICTIONS GRID — alleen 4 vragen tonen ──────────────────────────

function ExtraPredictionsGrid({ pred, state }) {
  const surpriseInfo = pred.surpriseTeam
    ? deriveSurpriseInfo(pred.surpriseTeam, state.results, state.koResults)
    : null;
  const surpriseStage = surpriseInfo?.stage || null;
  const surprisePts = surpriseInfo && surpriseInfo.pts > 0 ? surpriseInfo.pts : null;
  const championGroup = pred.champion ? TEAM_GROUP[pred.champion] : null;

  // Topscorers
  const resultTopScorers = Array.isArray(state.results["TOP_SCORERS"])
    ? state.results["TOP_SCORERS"]
    : [];
  const topScorersKnown = resultTopScorers.length > 0;
  const predTopScorers = Array.isArray(pred.topScorers)
    ? pred.topScorers.filter(Boolean)
    : pred.topScorer
    ? [pred.topScorer]
    : [];
  const topScorerPts = topScorersKnown
    ? calcTopScorerPts(
        pred.topScorers || (pred.topScorer ? [pred.topScorer] : []),
        resultTopScorers
      )
    : null;

  // Alleen 4 vragen tonen op het beginscherm
  const items = [
    {
      label: "🏆 Kampioen",
      value: pred.champion,
      pts: PTS_EXTRA.champion,
      groupLetter: championGroup,
      actual: state.koResults["FINAL"]?.winner,
      known: state.koResults["FINAL"]?.played,
      type: "simple",
    },
    {
      label: "⚽ Topscoorders",
      type: "topscorer",
      value: predTopScorers.length > 0 ? predTopScorers : null,
      countries: Array.isArray(pred.topScorerCountries)
        ? pred.topScorerCountries
        : [],
      totalPts: topScorerPts,
      known: topScorersKnown,
      resultTopScorers,
    },
    {
      label: "🌟 Verrassing",
      value: pred.surpriseTeam,
      groupLetter: pred.surpriseTeam ? TEAM_GROUP[pred.surpriseTeam] : null,
      type: "surprise",
      stage: surpriseStage,
      stagePts: surprisePts,
    },
    {
      label: "🇳🇱 Nederland",
      value: pred.nlStage,
      pts: PTS_EXTRA.nlStage,
      actual: state.results["NL_STAGE"],
      known: !!state.results["NL_STAGE"],
      type: "simple",
    },
  ];

  return (
    <div style={{ marginBottom: 22 }}>
      <div
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "var(--accent)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 10,
        }}
      >
        Extra voorspellingen
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {items.map((item) => (
          <ExtraCard key={item.label} item={item} />
        ))}
      </div>
    </div>
  );
}

function ExtraCard({ item }) {
  return (
    <div style={S.card()}>
      <div
        style={{
          fontSize: 11,
          color: "var(--muted)",
          marginBottom: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 4,
        }}
      >
        <span>{item.label}</span>
        {item.groupLetter && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color:
                item.groupLetter === "F" ? "var(--orange)" : "var(--muted)",
              background:
                item.groupLetter === "F"
                  ? "rgba(240,136,62,.12)"
                  : "rgba(255,255,255,.06)",
              borderRadius: 4,
              padding: "1px 5px",
            }}
          >
            Gr. {item.groupLetter}
          </span>
        )}
      </div>
      <div style={{ fontWeight: 700, fontSize: 13 }}>
        {item.type === "topscorer" ? (
          item.value ? (
            <span
              style={{
                fontSize: 11,
                lineHeight: 1.8,
                display: "flex",
                flexDirection: "column",
                gap: 1,
              }}
            >
              {item.value.map((name, i) => (
                <span key={i}>
                  {item.countries?.[i]
                    ? (FLAG[item.countries[i]] || "🏳️") + " - "
                    : ""}
                  {name}
                </span>
              ))}
            </span>
          ) : (
            <span style={{ color: "var(--muted)" }}>–</span>
          )
        ) : item.value ? (
          FLAG[item.value] ? (
            `${FLAG[item.value]} ${item.value}`
          ) : (
            item.value
          )
        ) : (
          <span style={{ color: "var(--muted)" }}>–</span>
        )}
      </div>
      <ExtraCardResult item={item} />
    </div>
  );
}

function ExtraCardResult({ item }) {
  const good = (pts) => (
    <span
      style={{
        fontSize: 12,
        marginTop: 4,
        color: "var(--green)",
        fontWeight: 700,
        display: "block",
      }}
    >
      +{pts} ✓
    </span>
  );
  const bad = (
    <span
      style={{
        fontSize: 12,
        marginTop: 4,
        color: "var(--red)",
        fontWeight: 700,
        display: "block",
      }}
    >
      ✗
    </span>
  );

  if (item.type === "simple" && item.known)
    return item.value === item.actual ? good(item.pts) : bad;

  if (item.type === "topscorer" && item.known) {
    if (item.totalPts === null || item.totalPts === undefined) return null;
    return item.totalPts > 0 ? (
      <span
        style={{
          fontSize: 12,
          marginTop: 4,
          color: "var(--green)",
          fontWeight: 700,
          display: "block",
        }}
      >
        +{item.totalPts} pt ✓
      </span>
    ) : (
      bad
    );
  }

  if (item.type === "surprise" && item.stage)
    return (
      <span
        style={{
          fontSize: 11,
          marginTop: 4,
          color: "var(--accent)",
          fontWeight: 700,
          display: "block",
        }}
      >
        {item.stage} → +{item.stagePts} pt
      </span>
    );

  return null;
}

// ─── MATCH TIMELINE ───────────────────────────────────────────────────────────

function buildMatchTimeline(state) {
  const koMatchesAll = KO_STRUCTURE.map((m) => ({
    ...m,
    isKO: true,
  }));
  const sortedGroup = [...GROUP_MATCHES].sort((a, b) =>
    (a.dt || "").localeCompare(b.dt || "")
  );
  const allMatches = [
    ...sortedGroup.map((m) => ({ ...m, isKO: false })),
    ...koMatchesAll,
  ].sort((a, b) => (a.dt || "").localeCompare(b.dt || ""));

  const allPlayed = allMatches.filter((m) =>
    m.isKO ? state.koResults[m.id]?.played : state.results[m.id]?.played
  );
  const allUpcoming = allMatches.filter((m) =>
    m.isKO ? !state.koResults[m.id]?.played : !state.results[m.id]?.played
  );
  return { last5: allPlayed.slice(-5), next5: allUpcoming.slice(0, 5) };
}

function MatchTimeline({
  last5,
  next5,
  pred,
  state,
  canCompareMatch,
  onCompareMatch,
  canCompareKO,
  onCompareKO,
}) {
  return (
    <div style={{ marginBottom: 22 }}>
      {last5.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <TimelineHeader>Laatste wedstrijden</TimelineHeader>
          {last5.map((m) =>
            m.isKO ? (
              <KOMatchRow
                key={m.id}
                m={m}
                pred={pred}
                state={state}
                canCompare={canCompareKO}
                onClick={() => onCompareKO(m)}
              />
            ) : (
              <GroupMatchRow
                key={m.id}
                m={m}
                pred={pred}
                state={state}
                canCompare={canCompareMatch}
                onClick={() => onCompareMatch(m)}
              />
            )
          )}
        </div>
      )}
      {next5.length > 0 && (
        <div>
          <TimelineHeader>Volgende wedstrijden</TimelineHeader>
          {next5.map((m) =>
            m.isKO ? (
              <KOMatchRow
                key={m.id}
                m={m}
                pred={pred}
                state={state}
                canCompare={canCompareKO}
                onClick={() => onCompareKO(m)}
              />
            ) : (
              <GroupMatchRow
                key={m.id}
                m={m}
                pred={pred}
                state={state}
                canCompare={canCompareMatch}
                onClick={() => onCompareMatch(m)}
              />
            )
          )}
        </div>
      )}
      {last5.length === 0 && next5.length === 0 && (
        <div
          style={{
            ...S.card(),
            textAlign: "center",
            color: "var(--muted)",
            fontSize: 13,
          }}
        >
          Nog geen wedstrijden in het schema.
        </div>
      )}
    </div>
  );
}

function TimelineHeader({ children }) {
  return (
    <div
      style={{
        fontSize: 12,
        fontWeight: 700,
        color: "var(--accent)",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        marginBottom: 8,
      }}
    >
      {children}
    </div>
  );
}

function TeamNameLabel({ team, align = "left" }) {
  const isNL = team === "Nederland";
  return (
    <span
      style={{
        flex: 1,
        fontSize: 12,
        textAlign: align,
        fontWeight: isNL ? 900 : 600,
        color: isNL ? "var(--orange)" : "var(--text)",
      }}
    >
      {FLAG[team]} {team}
    </span>
  );
}

function GroupMatchRow({ m, pred, state, canCompare, onClick }) {
  const res = calcGroupMatchPts(pred.matches?.[m.id], state.results[m.id]);
  const r = state.results[m.id];
  const pm = pred.matches?.[m.id];
  const isGroupF = m.group === "F";

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
    : isGroupF
    ? "rgba(240,136,62,.25)"
    : "var(--border)";

  const labelBadge = res
    ? { exact: "exact", diff: "verschil", winner: "winnaar" }[res.label] ||
      "mis"
    : null;

  return (
    <div
      onClick={canCompare ? onClick : undefined}
      style={{
        marginBottom: 6,
        ...S.card(),
        padding: "8px 10px",
        border: `1px solid ${borderColor}`,
        background: isGroupF ? "rgba(240,136,62,.03)" : "var(--card)",
        cursor: canCompare ? "pointer" : "default",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 5,
        }}
      >
        <span style={{ fontSize: 10, color: "var(--muted)" }}>
          {m.dt ? fmtDateTime(m.dt) : ""}
        </span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: isGroupF ? "var(--orange)" : "var(--accent)",
              background: isGroupF
                ? "rgba(240,136,62,.1)"
                : "rgba(88,166,255,.1)",
              borderRadius: 4,
              padding: "1px 6px",
            }}
          >
            Groep {m.group}
          </span>
          {canCompare && (
            <span style={{ fontSize: 9, color: "var(--muted)" }}>
              info →
            </span>
          )}
        </div>
      </div>
      <div
        style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}
      >
        <TeamNameLabel team={m.home} align="right" />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            minWidth: 90,
          }}
        >
          <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "var(--muted)" }}>Jij:</span>
            <span
              style={{
                fontWeight: 700,
                color: isGroupF ? "var(--orange)" : "var(--accent)",
                background: isGroupF
                  ? "rgba(240,136,62,.1)"
                  : "rgba(88,166,255,.1)",
                borderRadius: 4,
                padding: "1px 7px",
                fontSize: 13,
              }}
            >
              {pm?.home !== undefined && pm?.home !== ""
                ? `${pm.home}–${pm.away}`
                : "–"}
            </span>
          </div>
          {r?.played ? (
            <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "var(--muted)" }}>
                Uitslag:
              </span>
              <span
                style={{
                  fontWeight: 700,
                  color: "var(--text)",
                  background: "rgba(255,255,255,.06)",
                  borderRadius: 4,
                  padding: "1px 7px",
                  fontSize: 13,
                }}
              >
                {r.home}–{r.away}
              </span>
            </div>
          ) : (
            <span
              style={{
                fontSize: 10,
                color: "var(--muted)",
                fontStyle: "italic",
              }}
            >
              nog te spelen
            </span>
          )}
        </div>
        <TeamNameLabel team={m.away} align="left" />
        {res && (
          <span
            style={{
              minWidth: 52,
              textAlign: "right",
              fontWeight: 700,
              fontSize: 11,
              color: res.pts > 0 ? "var(--green)" : "var(--red)",
            }}
          >
            {res.pts > 0 ? `+${res.pts} ${labelBadge}` : "✗"}
          </span>
        )}
      </div>
    </div>
  );
}

function KOMatchRow({ m, pred, state, canCompare, onClick }) {
  const pw = effectiveKOWinner(pred, m.id);
  const ps = pred.koScores?.[m.id];
  const r = state.koResults[m.id];
  const schema = PTS_KO[m.round] || PTS_KO.r16;
  const winOk   = r?.played && pw && pw === r.winner;
  const winNope = r?.played && pw && pw !== r.winner;
  const scoreOk = r?.played && ps?.home !== undefined &&
    parseInt(ps.home) === parseInt(r.home90) && parseInt(ps.away) === parseInt(r.away90);
  const diffOk  = r?.played && ps?.home !== undefined && !scoreOk &&
    parseInt(ps.home) - parseInt(ps.away) === parseInt(r.home90) - parseInt(r.away90);
  const richSlots = buildRichKOSlots(pred, state.results, state.koResults);
  const homeDesc = richSlots[m.id]?.home;
  const awayDesc = richSlots[m.id]?.away;
  const homeTeam = homeDesc?.type === "team" ? homeDesc.team : null;
  const awayTeam = awayDesc?.type === "team" ? awayDesc.team : null;

  const koPts = !r?.played ? null
    : (winOk ? schema.winner : 0) + (scoreOk ? schema.exact : diffOk ? schema.diff : 0);

  function renderTeam(team, desc, align) {
    let emoji = "";
    let emojiColor = null;
    if (!r?.played) {
      if (team && team === pw) emoji = "⭐";
    } else {
      if (team && team === r.winner && pw) {
        emoji = winOk ? "✓" : "✗";
        emojiColor = winOk ? "var(--green)" : "var(--red)";
      }
    }

    if (team) {
      const isNL = team === "Nederland";
      return (
        <span style={{ flex: 1, fontSize: 12, textAlign: align }}>
          <span style={{ fontWeight: 700, color: isNL ? "var(--orange)" : "var(--text)" }}>
            {FLAG[team] || "🏳️"} {team}
          </span>
          {emoji && (
            <span style={{ marginLeft: 3, color: emojiColor ?? undefined }}>{emoji}</span>
          )}
        </span>
      );
    }
    // Fallback voor onbekend slot (twee kandidaten, label, etc.)
    return (
      <span style={{ flex: 1, textAlign: align }}>
        <SlotDisplay desc={desc} align={align} size={12} />
      </span>
    );
  }

  return (
    <div
      onClick={canCompare ? onClick : undefined}
      style={{
        marginBottom: 6,
        ...S.card(),
        padding: "8px 10px",
        border: `1px solid ${winOk ? "rgba(63,185,80,.4)" : winNope ? "rgba(248,81,73,.3)" : pw ? "rgba(88,166,255,.3)" : "var(--border)"}`,
        cursor: canCompare ? "pointer" : "default",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 10, color: "var(--muted)" }}>
          {m.dt ? fmtDateTime(m.dt) : ""}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {canCompare && <span style={{ fontSize: 9, color: "var(--muted)" }}>info →</span>}
          <span style={{ fontSize: 10, color: "var(--muted)" }}>{m.label}</span>
        </div>
      </div>

      {/* Match rij — zelfde indeling als groepsfase */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
        {renderTeam(homeTeam, homeDesc, "right")}

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, minWidth: 90 }}>
          <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
            <span style={{ fontSize: 10, color: "var(--muted)" }}>Jij:</span>
            <span style={{ fontWeight: 700, color: "var(--accent)", background: "rgba(88,166,255,.1)", borderRadius: 4, padding: "1px 7px", fontSize: 13 }}>
              {ps?.home !== undefined && ps?.home !== "" ? `${ps.home}–${ps.away}` : "–"}
            </span>
          </div>
          {r?.played ? (
            <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "var(--muted)" }}>Uitslag:</span>
              <span style={{ fontWeight: 700, color: "var(--text)", background: "rgba(255,255,255,.06)", borderRadius: 4, padding: "1px 7px", fontSize: 13 }}>
                {r.home90}–{r.away90}
              </span>
            </div>
          ) : (
            <span style={{ fontSize: 10, color: "var(--muted)", fontStyle: "italic" }}>nog te spelen</span>
          )}
        </div>

        {renderTeam(awayTeam, awayDesc, "left")}

        {r?.played && pw && (
          <div style={{ minWidth: 60, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: winOk ? "var(--green)" : "var(--red)" }}>
              {winOk ? `+${schema.winner} winnaar` : "✗ winnaar"}
            </span>
            {ps?.home !== undefined && (
              <span style={{ fontSize: 11, fontWeight: 700, color: scoreOk || diffOk ? "var(--green)" : "var(--red)" }}>
                {scoreOk ? `+${schema.exact} uitslag` : diffOk ? `+${schema.diff} verschil` : "✗ uitslag"}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export { MyOverview, DeadlineBanner };
