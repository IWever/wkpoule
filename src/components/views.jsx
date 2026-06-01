import React from "react";
import { useState } from "react";
import {
  GROUP_MATCHES,
  ALL_TEAMS,
  KO_STRUCTURE,
  NL_STAGES,
  SURPRISE_TEAMS,
  PTS_SURPRISE,
  TOP_TEAMS,
  PTS_TOP_OUT,
  PLAYERS_BY_COUNTRY,
  PTS_GROUP,
  PTS_STANDING,
  PTS_KO,
  PTS_EXTRA,
  FLAG,
  GROUPS,
  TEAM_GROUP,
} from "../data/tournamentData";
import {
  calcPoints,
  calcGroupMatchPts,
  buildRichKOSlots,
  deriveSurpriseStage,
  deriveTopOuts,
  deriveGroupStandingsFromResults,
  groupsAllFilled,
  persist,
  resolveSlotRich,
  fmtDateTime,
} from "../pouleEngine";
import { S } from "../styles/ui";
import { Alert, SlotDisplay, TabBar } from "./common";
import { SingleMatchCompare, PlayerCompare } from "./compare";

// ─── MY OVERVIEW ─────────────────────────────────────────────────────────────

function MyOverview({ user, state, onEditGroup, onEditExtra, onEditKO }) {
  const pred = user.predictions || {};
  const pts = calcPoints(user, state.results, state.koResults);
  const ranked = [...state.users].sort(
    (a, b) =>
      calcPoints(b, state.results, state.koResults) -
      calcPoints(a, state.results, state.koResults)
  );
  const rank = ranked.findIndex((u) => u.id === user.id) + 1;
  const koAvailable = state.koOpen || state.fase === "ko";
  const [compareMatch, setCompareMatch] = useState(null);
  const [comparePlayer, setComparePlayer] = useState(null);

  const sortedGroup = [...GROUP_MATCHES].sort((a, b) =>
    (a.dt || "").localeCompare(b.dt || "")
  );
  const KO_DATES = {
    r32: "2026-07-01",
    r16: "2026-07-05",
    qf: "2026-07-10",
    sf: "2026-07-14",
    "3rd": "2026-07-18",
    final: "2026-07-19",
  };
  const koMatchesAll = KO_STRUCTURE.map((m) => ({
    ...m,
    dt: KO_DATES[m.round] + "T20:00",
    isKO: true,
  }));
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
  const last5 = allPlayed.slice(-5);
  const next5 = allUpcoming.slice(0, 5);

  function KOMatchRow({ m }) {
    const pw = pred.koWinners?.[m.id];
    const ps = pred.koScores?.[m.id];
    const r = state.koResults[m.id];
    const schema = PTS_KO[m.round] || PTS_KO.r16;
    const winOk = r?.played && pw && pw === r.winner;
    const winNope = r?.played && pw && pw !== r.winner;
    const scoreOk =
      r?.played &&
      ps?.home !== undefined &&
      parseInt(ps.home) === parseInt(r.home90) &&
      parseInt(ps.away) === parseInt(r.away90);
    const richSlots = buildRichKOSlots(pred, state.results, state.koResults);
    const homeDesc = richSlots[m.id]?.home;
    const awayDesc = richSlots[m.id]?.away;
    const border = winOk
      ? "rgba(63,185,80,.4)"
      : winNope
      ? "rgba(248,81,73,.3)"
      : "var(--border)";
    return (
      <div
        style={{
          marginBottom: 6,
          ...S.card(),
          padding: "8px 10px",
          border: `1px solid ${border}`,
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
          <span
            style={{
              fontSize: 10,
              color: "var(--orange)",
              fontWeight: 700,
              background: "rgba(240,136,62,.1)",
              borderRadius: 4,
              padding: "1px 6px",
            }}
          >
            {m.label}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 12,
          }}
        >
          <span style={{ flex: 1, textAlign: "right", fontWeight: 600 }}>
            {homeDesc?.type === "team" ? (
              `${FLAG[homeDesc.team] || ""} ${homeDesc.team}`
            ) : (
              <span style={{ color: "var(--muted)", fontSize: 11 }}>
                {homeDesc?.label || "?"}
              </span>
            )}
          </span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              minWidth: 90,
            }}
          >
            {pw ? (
              <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                <span style={{ fontSize: 10, color: "var(--muted)" }}>
                  Jij:
                </span>
                <span
                  style={{
                    fontWeight: 700,
                    color: "var(--orange)",
                    background: "rgba(240,136,62,.1)",
                    borderRadius: 4,
                    padding: "1px 7px",
                    fontSize: 13,
                  }}
                >
                  {FLAG[pw] || ""} {pw}
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
                niet ingevuld
              </span>
            )}
            {ps?.home !== undefined && (
              <span style={{ fontSize: 10, color: "var(--muted)" }}>
                {ps.home}–{ps.away}
              </span>
            )}
            {r?.played && (
              <span style={{ fontSize: 10, color: "var(--muted)" }}>
                → winnaar: {FLAG[r.winner] || ""} {r.winner}
              </span>
            )}
          </div>
          <span style={{ flex: 1, fontWeight: 600 }}>
            {awayDesc?.type === "team" ? (
              `${FLAG[awayDesc.team] || ""} ${awayDesc.team}`
            ) : (
              <span style={{ color: "var(--muted)", fontSize: 11 }}>
                {awayDesc?.label || "?"}
              </span>
            )}
          </span>
          <div
            style={{
              minWidth: 40,
              textAlign: "right",
              display: "flex",
              gap: 3,
              justifyContent: "flex-end",
            }}
          >
            {winOk && (
              <span
                style={{ color: "var(--green)", fontWeight: 700, fontSize: 11 }}
              >
                +{schema.winner}
              </span>
            )}
            {winNope && (
              <span
                style={{ color: "var(--red)", fontWeight: 700, fontSize: 11 }}
              >
                ✗
              </span>
            )}
            {scoreOk && (
              <span
                style={{ color: "var(--green)", fontWeight: 700, fontSize: 11 }}
              >
                +{schema.exact}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  const canCompareMatch = state.groupFrozen;

  function MatchRow({ m }) {
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
      ? res.label === "exact"
        ? "exact"
        : res.label === "diff"
        ? "verschil"
        : res.label === "winner"
        ? "winnaar"
        : "mis"
      : null;
    return (
      <div
        onClick={canCompareMatch ? () => setCompareMatch(m) : undefined}
        style={{
          marginBottom: 6,
          ...S.card(),
          padding: "8px 10px",
          border: `1px solid ${borderColor}`,
          background: isGroupF ? "rgba(240,136,62,.03)" : "var(--card)",
          cursor: canCompareMatch ? "pointer" : "default",
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
                color: isGroupF ? "var(--orange)" : "var(--accent)",
                fontWeight: 700,
                background: isGroupF
                  ? "rgba(240,136,62,.1)"
                  : "rgba(88,166,255,.1)",
                borderRadius: 4,
                padding: "1px 6px",
              }}
            >
              Groep {m.group}
            </span>
            {canCompareMatch && (
              <span style={{ fontSize: 9, color: "var(--muted)" }}>
                vergelijk →
              </span>
            )}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            fontSize: 12,
          }}
        >
          <span style={{ flex: 1, textAlign: "right", fontWeight: 600 }}>
            {FLAG[m.home]} {m.home}
          </span>
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
            {r?.played && (
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
            )}
            {!r?.played && (
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
          <span style={{ flex: 1, fontWeight: 600 }}>
            {FLAG[m.away]} {m.away}
          </span>
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

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>
            Hoi, {user.name}! 👋
          </div>
          <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>
            Positie #{rank} van {state.users.length} · {pts} punten
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {!state.extraFrozen ? (
            <button style={S.btn("var(--green)")} onClick={onEditExtra}>
              🔮 Extra vragen
            </button>
          ) : (
            <button
              style={{
                ...S.btn("var(--card2)"),
                border: "1px solid var(--border)",
              }}
              onClick={onEditExtra}
            >
              👁️ Extra vragen
            </button>
          )}
          {!state.groupFrozen ? (
            <button style={S.btn()} onClick={onEditGroup}>
              ⚽ Groepsfase
            </button>
          ) : (
            <button
              style={{
                ...S.btn("var(--card2)"),
                border: "1px solid var(--border)",
              }}
              onClick={onEditGroup}
            >
              👁️ Groepsfase
            </button>
          )}
          {koAvailable &&
            (!state.koFrozen ? (
              <button style={S.btn("var(--orange)")} onClick={onEditKO}>
                ⚔️ KO-fase
              </button>
            ) : (
              <button
                style={{
                  ...S.btn("var(--card2)"),
                  border: "1px solid var(--border)",
                }}
                onClick={onEditKO}
              >
                👁️ KO-fase
              </button>
            ))}
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 22,
        }}
      >
        <div style={{ ...S.card(), textAlign: "center" }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 28,
              color: "var(--accent)",
            }}
          >
            #{rank}{" "}
            <span style={{ fontSize: 18 }}>van {state.users.length}</span>
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Positie
          </div>
        </div>
        <div style={{ ...S.card(), textAlign: "center" }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 28,
              color: "var(--accent)",
            }}
          >
            {pts} pts
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Jouw score
          </div>
        </div>
      </div>

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
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(() => {
            const surpriseStage = pred.surpriseTeam
              ? deriveSurpriseStage(pred.surpriseTeam, state.koResults)
              : null;
            const surprisePts = surpriseStage
              ? PTS_SURPRISE[surpriseStage] || 0
              : null;
            const topOuts = deriveTopOuts(state.results);
            const topOutCorrect = pred.topOut && topOuts.includes(pred.topOut);
            const topOutKnown = topOuts.length > 0;
            const surpriseGroup = pred.surpriseTeam
              ? TEAM_GROUP[pred.surpriseTeam] || null
              : null;
            const topOutGroup = pred.topOut
              ? TEAM_GROUP[pred.topOut] || null
              : null;
            const yellowCorrect =
              pred.yellowCards &&
              state.results["YELLOW_CARDS"] &&
              pred.yellowCards === state.results["YELLOW_CARDS"];
            const yellowKnown = !!state.results["YELLOW_CARDS"];
            return [
              {
                label: "🏆 Kampioen",
                value: pred.champion,
                pts: PTS_EXTRA.champion,
                actual: state.koResults["FINAL"]?.winner,
                known: state.koResults["FINAL"]?.played,
                type: "simple",
              },
              {
                label: "⚽️ Topscorer",
                value: pred.topScorer,
                pts: PTS_EXTRA.topScorer,
                actual: state.results["TOP_SCORER"],
                known: !!state.results["TOP_SCORER"],
                type: "topscorer",
              },
              {
                label: "🇳🇱 Nederland",
                value: pred.nlStage,
                pts: PTS_EXTRA.nlStage,
                actual: state.results["NL_STAGE"],
                known: !!state.results["NL_STAGE"],
                type: "simple",
              },
              {
                label: "🟨 Gele kaarten",
                value: pred.yellowCards,
                pts: PTS_EXTRA.yellowCards,
                correct: yellowCorrect,
                known: yellowKnown,
                type: "yellowcards",
              },
              {
                label: "🌟 Verrassing",
                value: pred.surpriseTeam,
                groupLetter: surpriseGroup,
                type: "surprise",
                stage: surpriseStage,
                stagePts: surprisePts,
              },
              {
                label: "💥 Topland uit",
                value: pred.topOut,
                groupLetter: topOutGroup,
                type: "topout",
                correct: topOutCorrect,
                known: topOutKnown,
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{ ...S.card(), flex: 1, minWidth: 120 }}
              >
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
                          item.groupLetter === "F"
                            ? "var(--orange)"
                            : "var(--muted)",
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
                  {item.value ? (
                    FLAG[item.value] ? (
                      `${FLAG[item.value]} ${item.value}`
                    ) : (
                      item.value
                    )
                  ) : (
                    <span style={{ color: "var(--muted)" }}>–</span>
                  )}
                </div>
                {item.type === "simple" && item.known && (
                  <div
                    style={{
                      fontSize: 12,
                      marginTop: 4,
                      color:
                        item.value === item.actual
                          ? "var(--green)"
                          : "var(--red)",
                      fontWeight: 700,
                    }}
                  >
                    {item.value === item.actual ? `+${item.pts} ✓` : "✗"}
                  </div>
                )}
                {item.type === "topscorer" &&
                  item.known &&
                  (() => {
                    const winners = Array.isArray(item.actual)
                      ? item.actual
                      : [item.actual];
                    const correct = winners.includes(item.value);
                    return (
                      <div
                        style={{
                          fontSize: 12,
                          marginTop: 4,
                          color: correct ? "var(--green)" : "var(--red)",
                          fontWeight: 700,
                        }}
                      >
                        {correct ? `+${item.pts} ✓` : "✗"}
                      </div>
                    );
                  })()}
                {item.type === "yellowcards" && item.known && (
                  <div
                    style={{
                      fontSize: 12,
                      marginTop: 4,
                      color: item.correct ? "var(--green)" : "var(--red)",
                      fontWeight: 700,
                    }}
                  >
                    {item.correct ? `+${item.pts} ✓` : "✗"}
                  </div>
                )}
                {item.type === "surprise" && item.stage && (
                  <div
                    style={{
                      fontSize: 11,
                      marginTop: 4,
                      color: "var(--accent)",
                      fontWeight: 700,
                    }}
                  >
                    {item.stage} → +{item.stagePts} pt
                  </div>
                )}
                {item.type === "topout" && item.value && item.known && (
                  <div
                    style={{
                      fontSize: 12,
                      marginTop: 4,
                      color: item.correct ? "var(--green)" : "var(--red)",
                      fontWeight: 700,
                    }}
                  >
                    {item.correct ? `+${PTS_TOP_OUT} ✓` : "✗"}
                  </div>
                )}
              </div>
            ));
          })()}
        </div>
      </div>

      <div style={{ marginBottom: 22 }}>
        {last5.length > 0 && (
          <div style={{ marginBottom: 16 }}>
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
              Laatste wedstrijden
            </div>
            {last5.map((m) =>
              m.isKO ? (
                <KOMatchRow key={m.id} m={m} />
              ) : (
                <MatchRow key={m.id} m={m} />
              )
            )}
          </div>
        )}
        {next5.length > 0 && (
          <div>
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
              Volgende wedstrijden
            </div>
            {next5.map((m) =>
              m.isKO ? (
                <KOMatchRow key={m.id} m={m} />
              ) : (
                <MatchRow key={m.id} m={m} />
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

      {compareMatch && (
        <SingleMatchCompare
          match={compareMatch}
          state={state}
          currentUserId={user.id}
          onClose={() => setCompareMatch(null)}
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

// ─── SPELREGELS ──────────────────────────────────────────────────────────────

function Rules() {
  return (
    <div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "var(--accent)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 18,
        }}
      >
        📋 Spelregels & Puntenschema
      </div>
      <div style={{ ...S.card(), marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
          Hoe werkt het?
        </div>
        <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.8 }}>
          Voor het WK vul je al jouw voorspellingen in via drie onderdelen:{" "}
          <strong style={{ color: "var(--text)" }}>Extra vragen</strong>,{" "}
          <strong style={{ color: "var(--text)" }}>Groepsfase</strong> en —
          zodra de admin dit openzet — de{" "}
          <strong style={{ color: "var(--text)" }}>KO-fase</strong>.
        </div>
      </div>
      <div
        style={{
          fontWeight: 700,
          fontSize: 14,
          color: "var(--accent)",
          marginBottom: 10,
        }}
      >
        🔮 Extra vragen
      </div>
      <div style={{ ...S.card(), marginBottom: 14 }}>
        {[
          [
            "🏆 Wereldkampioen",
            "Voorspel welk land het WK wint.",
            PTS_EXTRA.champion,
          ],
          [
            "⚽ Topscorer",
            "Kies een land en vervolgens de speler die de meeste doelpunten scoort. De volledige selectie is beschikbaar, gesorteerd op doelpunten in de kwalificatie.",
            PTS_EXTRA.topScorer,
          ],
          [
            "🇳🇱 Hoe ver komt Nederland?",
            "Voorspel in welke ronde Nederland uitvalt — of kampioen wordt.",
            PTS_EXTRA.nlStage,
          ],
          [
            "🟨 Meeste gele kaarten",
            "Welk land heeft aan het einde van het toernooi de meeste gele kaarten ontvangen?",
            PTS_EXTRA.yellowCards,
          ],
          [
            "💥 Welk topland valt af?",
            "Kies een van de 12 hoogst geklasseerde landen die toch niet verder komt dan de groepsfase.",
            PTS_EXTRA.topOut,
          ],
        ].map(([title, desc, pts]) => (
          <div
            key={title}
            style={{
              borderBottom: "1px solid var(--border)",
              paddingBottom: 10,
              marginBottom: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <span style={{ fontWeight: 700, fontSize: 13 }}>{title}</span>
              <span
                style={{
                  color: "var(--accent)",
                  fontWeight: 700,
                  fontSize: 12,
                }}
              >
                +{pts} pt
              </span>
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{desc}</div>
          </div>
        ))}
        <div
          style={{ borderBottom: "1px solid var(--border)", paddingBottom: 10 }}
        >
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
            🌟 Verrassing van het WK
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>
            Kies een van de 12 laagst geklasseerde landen:
          </div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {Object.entries(PTS_SURPRISE)
              .filter(([, v]) => v > 0)
              .map(([s, p]) => (
                <div
                  key={s}
                  style={{
                    background: "rgba(88,166,255,.08)",
                    border: "1px solid rgba(88,166,255,.2)",
                    borderRadius: 6,
                    padding: "4px 10px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: "var(--accent)",
                      fontWeight: 700,
                    }}
                  >
                    +{p} pt
                  </span>
                  <span style={{ fontSize: 10, color: "var(--muted)" }}>
                    {s === "🏆 Wereldkampioen" ? "Kampioen" : s}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
      <div
        style={{
          fontWeight: 700,
          fontSize: 14,
          color: "var(--accent)",
          marginBottom: 10,
        }}
      >
        ⚽ Groepsfase
      </div>
      <div style={{ ...S.card(), marginBottom: 14 }}>
        {[
          ["Exacte uitslag", "Bv. 2–1 is ook echt 2–1", PTS_GROUP.exact],
          [
            "Juist doelpuntenverschil",
            "Bv. jij zegt 3–1, het wordt 2–0",
            PTS_GROUP.diff,
          ],
          [
            "Juiste winnaar of gelijkspel",
            "Je hebt de juiste richting, maar verschil klopt niet",
            PTS_GROUP.winner,
          ],
          ["Mis", "Fout resultaat — geen punten", 0],
        ].map(([cat, desc, pts]) => (
          <div
            key={cat}
            style={{
              display: "flex",
              gap: 10,
              borderBottom: "1px solid var(--border)",
              paddingBottom: 8,
              marginBottom: 8,
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{cat}</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>{desc}</div>
            </div>
            <div
              style={{
                fontWeight: 900,
                fontSize: 18,
                color: pts > 0 ? "var(--accent)" : "var(--muted)",
                minWidth: 40,
                textAlign: "right",
              }}
            >
              {pts > 0 ? `+${pts}` : "-"}
            </div>
          </div>
        ))}
        {[
          ["Team in jouw top-2 én gaat echt door", PTS_STANDING.qualified],
          [
            "Zelfde positie (#1 of #2 exact correct)",
            PTS_STANDING.qualifiedCorrectPos,
          ],
        ].map(([desc, pts]) => (
          <div
            key={desc}
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              padding: "3px 0",
              borderBottom: "1px solid var(--border)",
            }}
          >
            <span style={{ color: "var(--muted)" }}>{desc}</span>
            <span style={{ fontWeight: 700, color: "var(--accent)" }}>
              +{pts} pt
            </span>
          </div>
        ))}
      </div>
      <div
        style={{
          fontWeight: 700,
          fontSize: 14,
          color: "var(--accent)",
          marginBottom: 10,
        }}
      >
        ⚔️ KO-fase
      </div>
      <div style={{ ...S.card(), marginBottom: 14 }}>
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
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              padding: "5px 0",
              borderBottom: "1px solid var(--border)",
              alignItems: "center",
            }}
          >
            <span style={{ color: "var(--muted)", fontWeight: 600 }}>
              {ronde}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ color: "var(--accent)" }}>
                winnaar: <strong>+{schema.winner}</strong>
              </span>
              <span style={{ color: "var(--green)" }}>
                exacte stand: <strong>+{schema.exact}</strong>
              </span>
            </div>
          </div>
        ))}
        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 8 }}>
          💡 De exacte stand na 90 min is een bonus bovenop de winnaar-punten.
        </div>
      </div>
      <div
        style={{
          ...S.card(),
          background: "rgba(88,166,255,.04)",
          fontSize: 12,
          color: "var(--muted)",
          lineHeight: 1.8,
        }}
      >
        <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>
          Tips
        </div>
        <div>
          ✦ Extra vragen en groepsfase moeten voor het toernooi ingevuld zijn —
          daarna worden ze bevroren.
        </div>
        <div>✦ KO-voorspellingen open zodra de admin dit aanzet.</div>
        <div>✦ Groep F (Nederland) heeft een oranje accent.</div>
        <div>
          ✦ Klik op een wedstrijd of deelnemer in de stand om te vergelijken.
        </div>
      </div>
    </div>
  );
}

// ─── STANDINGS ───────────────────────────────────────────────────────────────

function Standings({ state, currentUserId, onCompare }) {
  const ranked = [...state.users]
    .map((u) => ({ ...u, pts: calcPoints(u, state.results, state.koResults) }))
    .sort((a, b) => b.pts - a.pts);
  const canCompare = state.groupFrozen && currentUserId;
  return (
    <div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "var(--accent)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          marginBottom: 8,
        }}
      >
        🏅 Tussenstand
      </div>
      {canCompare && (
        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12 }}>
          Klik op een naam om te vergelijken.
        </div>
      )}
      {ranked.length === 0 && (
        <p style={{ color: "var(--muted)" }}>Nog geen deelnemers.</p>
      )}
      {ranked.map((u, i) => {
        const isMe = u.id === currentUserId;
        const clickable = canCompare && !isMe;
        return (
          <div
            key={u.id}
            onClick={clickable ? () => onCompare(u) : undefined}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              ...S.card(),
              marginBottom: 8,
              background:
                i === 0
                  ? "linear-gradient(135deg,rgba(212,175,55,.12),rgba(212,175,55,.04))"
                  : "var(--card)",
              border: `1px solid ${
                isMe
                  ? "var(--accent)"
                  : i === 0
                  ? "rgba(212,175,55,.35)"
                  : "var(--border)"
              }`,
              cursor: clickable ? "pointer" : "default",
            }}
          >
            <div style={{ fontSize: 20, width: 32, textAlign: "center" }}>
              {["🥇", "🥈", "🥉"][i] || `#${i + 1}`}
            </div>
            <div style={{ flex: 1, fontWeight: isMe ? 700 : 600 }}>
              {u.name}
              {isMe ? " 👈" : ""}
            </div>
            {clickable && (
              <div style={{ fontSize: 11, color: "var(--muted)" }}>
                vergelijk →
              </div>
            )}
            <div
              style={{
                fontSize: 26,
                fontWeight: 900,
                color: i === 0 ? "var(--gold)" : "var(--accent)",
                fontFamily: "var(--font-display)",
              }}
            >
              {u.pts}
            </div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>pts</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── STAND WITH COMPARE ──────────────────────────────────────────────────────

function StandWithCompare({ state, currentUser }) {
  const [comparePlayer, setComparePlayer] = useState(null);
  // Only show competitions that are not hidden
  const competitions = (state.competitions || []).filter((c) => !c.hidden);
  const defaultComp = (() => {
    if (!currentUser || competitions.length === 0) return null;
    const first = competitions.find((c) =>
      (currentUser.competitionIds || []).includes(c.id)
    );
    return first ? first.id : competitions[0]?.id || null;
  })();
  const [selectedComp, setSelectedComp] = useState(defaultComp);
  // When no competitions exist, show all users. Otherwise filter by selected competition.
  const filteredUsers =
    !selectedComp || competitions.length === 0
      ? state.users
      : state.users.filter((u) =>
          (u.competitionIds || []).includes(selectedComp)
        );
  return (
    <div>
      {competitions.length > 0 && (
        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              fontSize: 11,
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 8,
              fontWeight: 700,
            }}
          >
            Competitie
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {competitions.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedComp(c.id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "var(--font)",
                  border: `1px solid ${
                    selectedComp === c.id ? "var(--accent)" : "var(--border)"
                  }`,
                  background:
                    selectedComp === c.id ? "var(--accent)" : "var(--bg)",
                  color: selectedComp === c.id ? "#fff" : "var(--text)",
                }}
              >
                {c.name}
                <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>
                  (
                  {
                    state.users.filter((u) =>
                      (u.competitionIds || []).includes(c.id)
                    ).length
                  }
                  )
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
      <Standings
        state={{ ...state, users: filteredUsers }}
        currentUserId={currentUser?.id}
        onCompare={setComparePlayer}
      />
      {comparePlayer && currentUser && (
        <PlayerCompare
          me={currentUser}
          other={comparePlayer}
          state={state}
          onClose={() => setComparePlayer(null)}
        />
      )}
    </div>
  );
}

// ─── PASSWORD REVEAL ─────────────────────────────────────────────────────────

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

// ─── COMPETITIES ADMIN ───────────────────────────────────────────────────────

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
            onKeyDown={(e) => {
              if (e.key === "Enter") addComp();
            }}
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
                <button
                  onClick={() =>
                    setState((s) => {
                      const ns = {
                        ...s,
                        competitions: s.competitions.map((c) =>
                          c.id === comp.id ? { ...c, hidden: !c.hidden } : c
                        ),
                      };
                      persist(ns);
                      return ns;
                    })
                  }
                  title="Zichtbaarheid in de stand"
                  style={{
                    background: comp.hidden
                      ? "rgba(240,136,62,.12)"
                      : "rgba(88,166,255,.08)",
                    border: `1px solid ${
                      comp.hidden ? "var(--orange)" : "var(--border)"
                    }`,
                    borderRadius: 6,
                    color: comp.hidden ? "var(--orange)" : "var(--muted)",
                    padding: "4px 10px",
                    cursor: "pointer",
                    fontSize: 12,
                    fontFamily: "var(--font)",
                  }}
                >
                  {comp.hidden ? "🏅 Verborgen" : "🏅 Zichtbaar"}
                </button>
                <button
                  onClick={() =>
                    setState((s) => {
                      const ns = {
                        ...s,
                        competitions: s.competitions.map((c) =>
                          c.id === comp.id
                            ? {
                                ...c,
                                hiddenRegistration: !c.hiddenRegistration,
                              }
                            : c
                        ),
                      };
                      persist(ns);
                      return ns;
                    })
                  }
                  title="Zichtbaarheid bij registratie"
                  style={{
                    background: comp.hiddenRegistration
                      ? "rgba(240,136,62,.12)"
                      : "rgba(88,166,255,.08)",
                    border: `1px solid ${
                      comp.hiddenRegistration
                        ? "var(--orange)"
                        : "var(--border)"
                    }`,
                    borderRadius: 6,
                    color: comp.hiddenRegistration
                      ? "var(--orange)"
                      : "var(--muted)",
                    padding: "4px 10px",
                    cursor: "pointer",
                    fontSize: 12,
                    fontFamily: "var(--font)",
                  }}
                >
                  {comp.hiddenRegistration ? "📝 Verborgen" : "📝 Zichtbaar"}
                </button>
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

// ─── ADMIN HOME ───────────────────────────────────────────────────────────────

function AdminHome({ state }) {
  const KO_DATES = {
    r32: "2026-07-01",
    r16: "2026-07-05",
    qf: "2026-07-10",
    sf: "2026-07-14",
    "3rd": "2026-07-18",
    final: "2026-07-19",
  };
  const groupMatches = GROUP_MATCHES.map((m) => ({ ...m, isKO: false }));
  const koMatches = KO_STRUCTURE.map((m) => ({
    ...m,
    dt: KO_DATES[m.round] + "T20:00",
    isKO: true,
  }));
  const allPlayed = [...groupMatches, ...koMatches]
    .filter((m) =>
      m.isKO ? state.koResults[m.id]?.played : state.results[m.id]?.played
    )
    .sort((a, b) => (a.dt || "").localeCompare(b.dt || ""));
  const last5 = allPlayed.slice(-5).reverse();
  const totalMatches = GROUP_MATCHES.length + KO_STRUCTURE.length;
  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10,
          marginBottom: 22,
        }}
      >
        <div style={{ ...S.card(), textAlign: "center" }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 26,
              color: "var(--accent)",
            }}
          >
            {state.users.length}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Deelnemers
          </div>
        </div>
        <div style={{ ...S.card(), textAlign: "center" }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 26,
              color: "var(--accent)",
            }}
          >
            {allPlayed.length}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Gespeeld
          </div>
        </div>
        <div style={{ ...S.card(), textAlign: "center" }}>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 26,
              color: "var(--accent)",
            }}
          >
            {totalMatches - allPlayed.length}
          </div>
          <div
            style={{
              fontSize: 11,
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Resterend
          </div>
        </div>
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
            { label: "KO bevroren", key: "koFrozen", icon: "🔒" },
          ].map(({ label, key, icon, invert }) => {
            const active = state[key];
            const isGood = invert ? active : !active;
            return (
              <div
                key={key}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: isGood
                    ? "rgba(63,185,80,.1)"
                    : "rgba(248,81,73,.08)",
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
                  style={{
                    color: isGood ? "var(--green)" : "var(--red)",
                    fontSize: 11,
                  }}
                >
                  {invert
                    ? active
                      ? "✓ open"
                      : "✗ dicht"
                    : active
                    ? "✗ bevroren"
                    : "✓ open"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
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
        Laatste gespeelde wedstrijden
      </div>
      {last5.length === 0 ? (
        <div
          style={{
            ...S.card(),
            color: "var(--muted)",
            fontSize: 13,
            textAlign: "center",
          }}
        >
          Nog geen wedstrijden gespeeld.
        </div>
      ) : (
        last5.map((m) => {
          const r = m.isKO ? state.koResults[m.id] : state.results[m.id];
          const isGroupF = !m.isKO && m.group === "F";
          return (
            <div
              key={m.id}
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
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 10, color: "var(--muted)" }}>
                  {m.dt ? fmtDateTime(m.dt) : ""}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color:
                      m.isKO || isGroupF ? "var(--orange)" : "var(--accent)",
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
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 13,
                }}
              >
                <span style={{ flex: 1, textAlign: "right", fontWeight: 600 }}>
                  {m.isKO
                    ? m.homeSlot || "?"
                    : `${FLAG[m.home] || ""} ${m.home}`}
                </span>
                <div style={{ textAlign: "center", minWidth: 70 }}>
                  {m.isKO ? (
                    r?.winner ? (
                      <div>
                        <div
                          style={{
                            fontWeight: 900,
                            fontSize: 15,
                            color: "var(--green)",
                          }}
                        >
                          {r.home90 !== undefined
                            ? `${r.home90}–${r.away90}`
                            : "–"}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "var(--muted)",
                            marginTop: 2,
                          }}
                        >
                          ✓ {FLAG[r.winner] || ""} {r.winner}
                        </div>
                      </div>
                    ) : (
                      "–"
                    )
                  ) : (
                    <span
                      style={{
                        fontWeight: 900,
                        fontSize: 18,
                        color: "var(--text)",
                        background: "rgba(255,255,255,.07)",
                        borderRadius: 6,
                        padding: "2px 10px",
                      }}
                    >
                      {r?.home}–{r?.away}
                    </span>
                  )}
                </div>
                <span style={{ flex: 1, fontWeight: 600 }}>
                  {m.isKO
                    ? m.awaySlot || "?"
                    : `${FLAG[m.away] || ""} ${m.away}`}
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ─── ADMIN PANEL ─────────────────────────────────────────────────────────────

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
      <TabBar
        tabs={[
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
        ]}
        active={tab}
        onSelect={setTab}
      />

      {tab === "home" && <AdminHome state={state} />}

      {tab === "fase" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
              desc: "Kampioen, topscorer, Nederland, gele kaarten, verrassing en topland",
            },
            {
              key: "koOpen",
              icon: "⚔️",
              label: "KO-fase openen",
              desc: "Deelnemers kunnen KO-voorspellingen invullen",
              invert: true,
            },
            {
              key: "koFrozen",
              icon: "⚔️",
              label: "KO-fase",
              desc: "Deelnemers kunnen KO-voorspellingen niet meer aanpassen",
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
                    style={{
                      fontSize: 12,
                      color: "var(--muted)",
                      marginTop: 2,
                    }}
                  >
                    {desc}
                  </div>
                </div>
                <button
                  onClick={() => upd({ [key]: !active })}
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
        </div>
      )}

      {tab === "competitions" && (
        <CompetitionsAdmin state={state} setState={setState} />
      )}

      {tab === "users" && (
        <div>
          {state.users.length === 0 && (
            <p style={{ color: "var(--muted)" }}>Nog niemand geregistreerd.</p>
          )}
          {state.users.map((u) => {
            const pts = calcPoints(u, state.results, state.koResults);
            const p = u.predictions || {};
            const groupFilled = GROUP_MATCHES.filter(
              (m) =>
                p.matches?.[m.id]?.home !== undefined &&
                p.matches[m.id].home !== ""
            ).length;
            const extraFilled = [
              !!p.champion,
              !!p.topScorer,
              !!p.nlStage,
              !!p.yellowCards,
              !!p.surpriseTeam,
              !!p.topOut,
            ].filter(Boolean).length;
            const koFilled = KO_STRUCTURE.filter(
              (m) => p.koWinners?.[m.id]
            ).length;
            const userComps = (u.competitionIds || [])
              .map(
                (cid) =>
                  (state.competitions || []).find((c) => c.id === cid)?.name
              )
              .filter(Boolean);
            function Pill({ label, filled, total, done, started, available }) {
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
              const color = done
                ? "var(--green)"
                : started
                ? "var(--orange)"
                : "var(--muted)";
              const bg = done
                ? "rgba(63,185,80,.12)"
                : started
                ? "rgba(240,136,62,.12)"
                : "rgba(255,255,255,.04)";
              return (
                <span
                  style={{
                    fontSize: 11,
                    color,
                    background: bg,
                    borderRadius: 4,
                    padding: "2px 7px",
                    fontWeight: done ? 700 : 400,
                  }}
                >
                  {done ? "✓" : started ? "…" : "○"} {label} {filled}/{total}
                </span>
              );
            }
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
                    onClick={() => removeUser(u.id)}
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
                  <Pill
                    label="Extra"
                    filled={extraFilled}
                    total={6}
                    done={extraFilled === 6}
                    started={extraFilled > 0}
                    available={true}
                  />
                  <Pill
                    label="Groepsfase"
                    filled={groupFilled}
                    total={GROUP_MATCHES.length}
                    done={groupFilled === GROUP_MATCHES.length}
                    started={groupFilled > 0}
                    available={true}
                  />
                  <Pill
                    label="KO-fase"
                    filled={koFilled}
                    total={KO_STRUCTURE.length}
                    done={koFilled === KO_STRUCTURE.length}
                    started={koFilled > 0}
                    available={state.koOpen || state.fase === "ko"}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "results" && (
        <div>
          <div
            style={{
              display: "flex",
              gap: 5,
              flexWrap: "wrap",
              marginBottom: 14,
            }}
          >
            {"ABCDEFGHIJKL".split("").map((g) => (
              <button
                key={g}
                onClick={() => setActiveGroup(g)}
                style={{
                  padding: "5px 13px",
                  borderRadius: 20,
                  border: `1px solid ${
                    activeGroup === g
                      ? g === "F"
                        ? "var(--orange)"
                        : "var(--accent)"
                      : "var(--border)"
                  }`,
                  background:
                    activeGroup === g
                      ? g === "F"
                        ? "var(--orange)"
                        : "var(--accent)"
                      : "var(--bg)",
                  color:
                    activeGroup === g
                      ? "#fff"
                      : g === "F"
                      ? "var(--orange)"
                      : "var(--text)",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Groep {g}
              </button>
            ))}
          </div>
          {(() => {
            const adminS = deriveGroupStandingsFromResults(state.results);
            const s = adminS[activeGroup];
            const isGroupF = activeGroup === "F";
            if (!s || !s.table.some((r) => r.gp > 0))
              return (
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
              );
            const allGroupPlayed = GROUP_MATCHES.filter(
              (m) => m.group === activeGroup
            ).every((m) => state.results[m.id]?.played);
            if (
              allGroupPlayed &&
              s.winner &&
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
                  <span style={{ textAlign: "center", color: "var(--green)" }}>
                    GV+
                  </span>
                  <span style={{ textAlign: "center", color: "var(--red)" }}>
                    GT-
                  </span>
                  <span style={{ textAlign: "center" }}>DS</span>
                </div>
                {s.table.map((r, i) => (
                  <div
                    key={r.team}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 30px 34px 34px 34px 34px",
                      gap: "0 4px",
                      alignItems: "center",
                      padding: "5px 4px",
                      background:
                        i < 2 ? "rgba(88,166,255,0.06)" : "transparent",
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
                    <span
                      style={{ textAlign: "center", color: "var(--muted)" }}
                    >
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
                    <span
                      style={{ textAlign: "center", color: "var(--green)" }}
                    >
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
          })()}
          {GROUP_MATCHES.filter((m) => m.group === activeGroup).map((m) => {
            const r = state.results[m.id] || {};
            const isGroupF = m.group === "F";
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
                    background: isGroupF
                      ? "rgba(240,136,62,.03)"
                      : "var(--card)",
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
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={r.home ?? ""}
                    onChange={(e) => updResult(m.id, "home", e.target.value)}
                    style={S.numInput}
                  />
                  <span style={{ color: "var(--muted)", fontWeight: 700 }}>
                    –
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={20}
                    value={r.away ?? ""}
                    onChange={(e) => updResult(m.id, "away", e.target.value)}
                    style={S.numInput}
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
                      onChange={(e) =>
                        updResult(m.id, "played", e.target.checked)
                      }
                    />{" "}
                    Gespeeld
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "ko" && (
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
                  <div
                    style={{ display: "flex", gap: 4, alignItems: "center" }}
                  >
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={r.home90 ?? ""}
                      onChange={(e) => updKO(m.id, "home90", e.target.value)}
                      style={S.numInput}
                    />
                    <span style={{ color: "var(--muted)", fontWeight: 700 }}>
                      –
                    </span>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={r.away90 ?? ""}
                      onChange={(e) => updKO(m.id, "away90", e.target.value)}
                      style={S.numInput}
                    />
                  </div>
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
                              r.winner === t
                                ? "rgba(88,166,255,.15)"
                                : "var(--bg)",
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
      )}

      {tab === "extra" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={S.card()}>
            <div
              style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6 }}
            >
              ⚽ Officiële topscorer(s) — selecteer meerdere bij gelijkstand
            </div>
            <select
              value={state.results["TOP_SCORER_COUNTRY"] || ""}
              onChange={(e) =>
                setState((s) => {
                  const ns = {
                    ...s,
                    results: {
                      ...s.results,
                      TOP_SCORER_COUNTRY: e.target.value,
                      TOP_SCORER: [],
                    },
                  };
                  persist(ns);
                  return ns;
                })
              }
              style={{
                background: "var(--bg)",
                color: "var(--text)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "8px 12px",
                fontSize: 14,
                width: "100%",
                marginBottom: 8,
                fontFamily: "var(--font)",
              }}
            >
              <option value="">— kies land voor topscorer —</option>
              {Object.keys(PLAYERS_BY_COUNTRY)
                .sort()
                .map((c) => (
                  <option key={c} value={c}>
                    {FLAG[c] || "🏳️"} {c}
                  </option>
                ))}
            </select>
            {state.results["TOP_SCORER_COUNTRY"] &&
              (() => {
                const allPlayers = [
                  ...(PLAYERS_BY_COUNTRY[state.results["TOP_SCORER_COUNTRY"]] ||
                    []),
                ].sort((a, b) =>
                  b.kwal !== a.kwal
                    ? b.kwal - a.kwal
                    : a.name.localeCompare(b.name)
                );
                const currentWinners = Array.isArray(
                  state.results["TOP_SCORER"]
                )
                  ? state.results["TOP_SCORER"]
                  : state.results["TOP_SCORER"]
                  ? [state.results["TOP_SCORER"]]
                  : [];
                function toggleScorer(name) {
                  setState((s) => {
                    const cur = Array.isArray(s.results["TOP_SCORER"])
                      ? s.results["TOP_SCORER"]
                      : s.results["TOP_SCORER"]
                      ? [s.results["TOP_SCORER"]]
                      : [];
                    const next = cur.includes(name)
                      ? cur.filter((n) => n !== name)
                      : [...cur, name];
                    const ns = {
                      ...s,
                      results: { ...s.results, TOP_SCORER: next },
                    };
                    persist(ns);
                    return ns;
                  });
                }
                return (
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--muted)",
                        marginBottom: 8,
                      }}
                    >
                      Geselecteerd:{" "}
                      {currentWinners.length === 0
                        ? "geen"
                        : currentWinners.join(", ")}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 5,
                        maxHeight: 260,
                        overflowY: "auto",
                      }}
                    >
                      {allPlayers.map((p) => {
                        const selected = currentWinners.includes(p.name);
                        return (
                          <button
                            key={p.name}
                            onClick={() => toggleScorer(p.name)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "7px 12px",
                              borderRadius: 8,
                              border: `2px solid ${
                                selected ? "var(--green)" : "var(--border)"
                              }`,
                              background: selected
                                ? "rgba(63,185,80,.12)"
                                : "var(--bg)",
                              color: "var(--text)",
                              cursor: "pointer",
                              fontSize: 13,
                              fontWeight: selected ? 700 : 400,
                              fontFamily: "var(--font)",
                              textAlign: "left",
                            }}
                          >
                            <span>
                              {selected ? "✓ " : ""}
                              {p.name}
                            </span>
                            {p.kwal > 0 && (
                              <span
                                style={{ fontSize: 11, color: "var(--muted)" }}
                              >
                                {p.kwal} kwal. goals
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <div
                      style={{
                        marginTop: 10,
                        borderTop: "1px solid var(--border)",
                        paddingTop: 10,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          color: "var(--muted)",
                          marginBottom: 6,
                        }}
                      >
                        Speler uit ander land toevoegen:
                      </div>
                      <select
                        value=""
                        onChange={(e) => {
                          if (!e.target.value) return;
                          setState((s) => {
                            const cur = Array.isArray(s.results["TOP_SCORER"])
                              ? s.results["TOP_SCORER"]
                              : s.results["TOP_SCORER"]
                              ? [s.results["TOP_SCORER"]]
                              : [];
                            if (cur.includes(e.target.value)) return s;
                            const ns = {
                              ...s,
                              results: {
                                ...s.results,
                                TOP_SCORER: [...cur, e.target.value],
                              },
                            };
                            persist(ns);
                            return ns;
                          });
                        }}
                        style={{
                          background: "var(--bg)",
                          color: "var(--text)",
                          border: "1px solid var(--border)",
                          borderRadius: 6,
                          padding: "7px 10px",
                          fontSize: 13,
                          width: "100%",
                          fontFamily: "var(--font)",
                        }}
                      >
                        <option value="">
                          — voeg speler uit ander land toe —
                        </option>
                        {Object.keys(PLAYERS_BY_COUNTRY)
                          .sort()
                          .map((country) => (
                            <optgroup
                              key={country}
                              label={`${FLAG[country] || ""} ${country}`}
                            >
                              {PLAYERS_BY_COUNTRY[country]
                                .slice()
                                .sort((a, b) => b.kwal - a.kwal)
                                .map((pl) => (
                                  <option key={pl.name} value={pl.name}>
                                    {pl.name}
                                    {pl.kwal > 0
                                      ? ` (${pl.kwal} kwal. goals)`
                                      : ""}
                                  </option>
                                ))}
                            </optgroup>
                          ))}
                      </select>
                    </div>
                  </div>
                );
              })()}
          </div>
          <div style={S.card()}>
            <div
              style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}
            >
              🇳🇱 Hoe ver is Nederland gekomen?
            </div>
            <select
              value={state.results["NL_STAGE"] || ""}
              onChange={(e) =>
                setState((s) => {
                  const ns = {
                    ...s,
                    results: { ...s.results, NL_STAGE: e.target.value },
                  };
                  persist(ns);
                  return ns;
                })
              }
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
            <div
              style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}
            >
              🟨 Land met meeste gele kaarten (na toernooi)
            </div>
            <select
              value={state.results["YELLOW_CARDS"] || ""}
              onChange={(e) =>
                setState((s) => {
                  const ns = {
                    ...s,
                    results: { ...s.results, YELLOW_CARDS: e.target.value },
                  };
                  persist(ns);
                  return ns;
                })
              }
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
          {(() => {
            const topOuts = deriveTopOuts(state.results);
            const surpriseProgress = SURPRISE_TEAMS.map((team) => ({
              team,
              stage: deriveSurpriseStage(team, state.koResults),
            })).filter((s) => s.stage);
            return (
              <>
                <div
                  style={{ ...S.card(), background: "rgba(88,166,255,.04)" }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--muted)",
                      marginBottom: 8,
                    }}
                  >
                    💥 Toplands uitgeschakeld in groepsfase (automatisch)
                  </div>
                  {topOuts.length === 0 ? (
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--muted)",
                        fontStyle: "italic",
                      }}
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
                <div
                  style={{ ...S.card(), background: "rgba(88,166,255,.04)" }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      color: "var(--muted)",
                      marginBottom: 8,
                    }}
                  >
                    🌟 Verrassing-landen in KO-fase (automatisch)
                  </div>
                  {surpriseProgress.length === 0 ? (
                    <span
                      style={{
                        fontSize: 12,
                        color: "var(--muted)",
                        fontStyle: "italic",
                      }}
                    >
                      Nog geen KO-wedstrijden gespeeld
                    </span>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                      }}
                    >
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
                          <span
                            style={{ color: "var(--accent)", fontWeight: 700 }}
                          >
                            {stage}
                          </span>
                          <span
                            style={{ color: "var(--green)", fontWeight: 700 }}
                          >
                            +{PTS_SURPRISE[stage] || 0} pt
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}

export { MyOverview, Rules, Standings, StandWithCompare, PwReveal, AdminPanel };
