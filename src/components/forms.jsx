import React from "react";
import { useState } from "react";
import {
  GROUP_MATCHES,
  KO_STRUCTURE,
  ALL_TEAMS,
  NL_STAGES,
  SURPRISE_TEAMS,
  PTS_SURPRISE,
  TOP_TEAMS,
  PTS_TOP_OUT,
  PLAYERS_BY_COUNTRY,
  PTS_EXTRA,
  PTS_KO,
  FLAG,
} from "../data/tournamentData";
import {
  deepSet,
  deriveGroupStandings,
  deriveGroupStandingsFromResults,
  buildRichKOSlots,
  calcGroupMatchPts,
  fmtDateTime,
} from "../pouleEngine";
import { S } from "../styles/ui";
import { Alert, TabBar, GroupStandingTable, SlotDisplay } from "./common";

// ─── GROUP PREDICTIONS FORM ───────────────────────────────────────────────────

function GroupPredictionsForm({ user, state, onSave, onBack }) {
  const [pred, setPred] = useState(() =>
    JSON.parse(JSON.stringify(user.predictions || {}))
  );
  const [tab, setTab] = useState("groups");
  const [activeGroup, setActiveGroup] = useState("A");
  const [saved, setSaved] = useState(false);
  const frozen = state.groupFrozen;

  const set = (path, val) => {
    setPred((p) => {
      const next = deepSet(p, path, val);
      onSave(next);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      return next;
    });
  };

  const groupAccent = activeGroup === "F" ? "var(--orange)" : "var(--accent)";

  return (
    <div>
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
          📝{" "}
          {frozen
            ? "Jouw groepsvoorspellingen (bevroren)"
            : "Groepsvoorspellingen invullen"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {saved && (
            <span style={{ fontSize: 12, color: "var(--green)" }}>
              ✓ Opgeslagen
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
      {frozen && (
        <Alert
          msg="De groepsfase is bevroren. Je kunt je voorspellingen nog bekijken maar niet meer wijzigen."
          type="warn"
        />
      )}

      <TabBar
        tabs={[{ id: "groups", label: "Groepsfase" }]}
        active={tab}
        onSelect={setTab}
      />

      {tab === "groups" && (
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
          <div
            style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10 }}
          >
            Vul de verwachte uitslag in (na 90 min + blessuretijd). De top-2
            wordt automatisch afgeleid uit jouw scores.
          </div>
          {GROUP_MATCHES.filter((m) => m.group === activeGroup).map((m) => {
            const r = state.results[m.id];
            const res = calcGroupMatchPts(pred.matches?.[m.id], r);
            const borderColor = res
              ? res.label === "exact"
                ? "rgba(63,185,80,.5)"
                : res.label === "diff"
                ? "rgba(255,193,7,.4)"
                : res.label === "winner"
                ? activeGroup === "F"
                  ? "rgba(240,136,62,.4)"
                  : "rgba(88,166,255,.3)"
                : "rgba(248,81,73,.3)"
              : "var(--border)";
            return (
              <div key={m.id} style={{ marginBottom: 8 }}>
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
                  {activeGroup === "F" && (
                    <span
                      style={{
                        fontSize: 10,
                        color: "var(--orange)",
                        fontWeight: 700,
                      }}
                    >
                      🇳🇱 Groep F
                    </span>
                  )}
                </div>
                <div
                  style={{
                    ...S.card(),
                    padding: "9px 12px",
                    border: `1px solid ${borderColor}`,
                    background:
                      activeGroup === "F"
                        ? "rgba(240,136,62,.04)"
                        : "var(--card)",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
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
                      disabled={frozen}
                      type="number"
                      min={0}
                      max={20}
                      value={pred.matches?.[m.id]?.home ?? ""}
                      onChange={(e) =>
                        set(["matches", m.id, "home"], e.target.value)
                      }
                      style={S.numInput}
                    />
                    <span style={{ color: "var(--muted)", fontWeight: 700 }}>
                      –
                    </span>
                    <input
                      disabled={frozen}
                      type="number"
                      min={0}
                      max={20}
                      value={pred.matches?.[m.id]?.away ?? ""}
                      onChange={(e) =>
                        set(["matches", m.id, "away"], e.target.value)
                      }
                      style={S.numInput}
                    />
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>
                      {FLAG[m.away]} {m.away}
                    </span>
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
          })}
          {(() => {
            const predStanding = deriveGroupStandings(pred);
            const adminStanding = deriveGroupStandingsFromResults(
              state.results
            );
            const predRows = predStanding[activeGroup]?.table || [];
            const adminRows = adminStanding[activeGroup]?.table || [];
            const hasAdminData = adminRows.some((r) => r.gp > 0);
            return (
              <div style={{ marginTop: 10 }}>
                {hasAdminData && (
                  <div
                    style={{
                      ...S.card(),
                      marginBottom: 10,
                      border:
                        activeGroup === "F"
                          ? "1px solid rgba(240,136,62,.3)"
                          : "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color:
                          activeGroup === "F"
                            ? "var(--orange)"
                            : "var(--green)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: 6,
                      }}
                    >
                      📊 Huidige stand (gespeelde wedstrijden)
                    </div>
                    <GroupStandingTable group={activeGroup} rows={adminRows} />
                  </div>
                )}
                {predRows.some((r) => r.gp > 0) && (
                  <div
                    style={{
                      ...S.card(),
                      border:
                        activeGroup === "F"
                          ? "1px solid rgba(240,136,62,.2)"
                          : "1px solid var(--border)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color:
                          activeGroup === "F"
                            ? "var(--orange)"
                            : "var(--accent)",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        marginBottom: 6,
                      }}
                    >
                      🔮 Jouw voorspelde eindstand
                    </div>
                    <GroupStandingTable group={activeGroup} rows={predRows} />
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// ─── EXTRA PREDICTIONS FORM ───────────────────────────────────────────────────

function ExtraPredictionsForm({ user, state, onSave, onBack }) {
  const [pred, setPred] = useState(() =>
    JSON.parse(JSON.stringify(user.predictions || {}))
  );
  const [saved, setSaved] = useState(false);
  const frozen = state.extraFrozen;

  const set = (path, val) => {
    setPred((p) => {
      const next = deepSet(p, path, val);
      onSave(next);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      return next;
    });
  };

  return (
    <div>
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
          🔮 {frozen ? "Extra vragen (bevroren)" : "Extra vragen invullen"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {saved && (
            <span style={{ fontSize: 12, color: "var(--green)" }}>
              ✓ Opgeslagen
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
      {frozen && (
        <Alert
          msg="De extra vragen zijn bevroren. Je kunt ze nog bekijken maar niet meer wijzigen."
          type="warn"
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Wereldkampioen */}
        <div style={S.card()}>
          <div
            style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}
          >
            🏆 Wereldkampioen{" "}
            <span style={{ color: "var(--accent)", fontWeight: 700 }}>
              +{PTS_EXTRA.champion} pt
            </span>
          </div>
          <select
            disabled={frozen}
            value={pred.champion || ""}
            onChange={(e) => set(["champion"], e.target.value)}
            style={{
              background: "var(--bg)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "8px 12px",
              fontSize: 14,
              width: "100%",
              opacity: frozen ? 0.6 : 1,
              fontFamily: "var(--font)",
            }}
          >
            <option value="">— selecteer kampioen —</option>
            {ALL_TEAMS.map((t) => (
              <option key={t} value={t}>
                {FLAG[t] || "🏳️"} {t}
              </option>
            ))}
          </select>
        </div>

        {/* Topscorer */}
        <div style={S.card()}>
          <div
            style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}
          >
            ⚽ Topscorer{" "}
            <span style={{ color: "var(--accent)", fontWeight: 700 }}>
              +{PTS_EXTRA.topScorer} pt
            </span>
          </div>
          <select
            disabled={frozen}
            value={pred.topScorerCountry || ""}
            onChange={(e) => {
              const country = e.target.value;
              setPred((p) => {
                const next = deepSet(
                  deepSet(p, ["topScorerCountry"], country),
                  ["topScorer"],
                  ""
                );
                onSave(next);
                return next;
              });
            }}
            style={{
              background: "var(--bg)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "8px 12px",
              fontSize: 14,
              width: "100%",
              marginBottom: 8,
              opacity: frozen ? 0.6 : 1,
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
          {pred.topScorerCountry &&
            (() => {
              const allPlayers = [
                ...(PLAYERS_BY_COUNTRY[pred.topScorerCountry] || []),
              ].sort((a, b) => {
                if (b.kwal !== a.kwal) return b.kwal - a.kwal;
                return a.name.localeCompare(b.name);
              });
              return (
                <div>
                  <select
                    disabled={frozen}
                    value={pred.topScorer || ""}
                    onChange={(e) => set(["topScorer"], e.target.value)}
                    style={{
                      background: "var(--bg)",
                      color: "var(--text)",
                      border: `1px solid ${
                        pred.topScorer ? "var(--accent)" : "var(--border)"
                      }`,
                      borderRadius: 6,
                      padding: "8px 12px",
                      fontSize: 14,
                      width: "100%",
                      opacity: frozen ? 0.6 : 1,
                      fontFamily: "var(--font)",
                    }}
                  >
                    <option value="">— kies een speler —</option>
                    {allPlayers.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name}
                        {p.kwal > 0 ? ` (${p.kwal} kwal. goals)` : ""}
                      </option>
                    ))}
                  </select>
                  {pred.topScorer && (
                    <div
                      style={{
                        marginTop: 8,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span style={{ fontSize: 22 }}>
                        {FLAG[pred.topScorerCountry] || "🏳️"}
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>
                          {pred.topScorer}
                        </div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>
                          {pred.topScorerCountry}
                          {(() => {
                            const pl = allPlayers.find(
                              (pl) => pl.name === pred.topScorer
                            );
                            return pl?.kwal > 0
                              ? ` · ${pl.kwal} kwal. doelpunten`
                              : "";
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          {!pred.topScorerCountry && (
            <div
              style={{
                fontSize: 12,
                color: "var(--muted)",
                fontStyle: "italic",
              }}
            >
              Kies eerst een land om spelers te zien
            </div>
          )}
        </div>

        {/* Hoe ver Nederland */}
        <div style={S.card()}>
          <div
            style={{ fontSize: 13, color: "var(--muted)", marginBottom: 10 }}
          >
            🇳🇱 Hoe ver komt Nederland?{" "}
            <span style={{ color: "var(--accent)", fontWeight: 700 }}>
              +{PTS_EXTRA.nlStage} pt
            </span>
          </div>
          <select
            disabled={frozen}
            value={pred.nlStage || ""}
            onChange={(e) => set(["nlStage"], e.target.value)}
            style={{
              background: "var(--bg)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "8px 12px",
              fontSize: 14,
              width: "100%",
              opacity: frozen ? 0.6 : 1,
              fontFamily: "var(--font)",
            }}
          >
            <option value="">— selecteer fase —</option>
            {NL_STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Meeste gele kaarten */}
        <div style={S.card()}>
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>
            🟨 Meeste gele kaarten{" "}
            <span style={{ color: "var(--accent)", fontWeight: 700 }}>
              +{PTS_EXTRA.yellowCards} pt
            </span>
          </div>
          <div
            style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10 }}
          >
            Welk land heeft aan het einde van het toernooi de meeste gele
            kaarten ontvangen?
          </div>
          <select
            disabled={frozen}
            value={pred.yellowCards || ""}
            onChange={(e) => set(["yellowCards"], e.target.value)}
            style={{
              background: "var(--bg)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "8px 12px",
              fontSize: 14,
              width: "100%",
              opacity: frozen ? 0.6 : 1,
              fontFamily: "var(--font)",
            }}
          >
            <option value="">— selecteer land —</option>
            {ALL_TEAMS.map((t) => (
              <option key={t} value={t}>
                {FLAG[t] || "🏳️"} {t}
              </option>
            ))}
          </select>
        </div>

        {/* Verrassing */}
        <div style={S.card()}>
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>
            🌟 Verrassing van het WK
          </div>
          <div
            style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10 }}
          >
            Kies een van de 12 laagst geklasseerde landen. Punten op basis van
            hoe ver dit land de KO-fase haalt.
          </div>
          <select
            disabled={frozen}
            value={pred.surpriseTeam || ""}
            onChange={(e) => set(["surpriseTeam"], e.target.value)}
            style={{
              background: "var(--bg)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "8px 12px",
              fontSize: 14,
              width: "100%",
              opacity: frozen ? 0.6 : 1,
              fontFamily: "var(--font)",
            }}
          >
            <option value="">— kies jouw verrassing —</option>
            {SURPRISE_TEAMS.map((t) => (
              <option key={t} value={t}>
                {FLAG[t] || "🏳️"} {t}
              </option>
            ))}
          </select>
          {pred.surpriseTeam && (
            <div style={{ marginTop: 10, fontSize: 11, color: "var(--muted)" }}>
              Punten als {FLAG[pred.surpriseTeam]} {pred.surpriseTeam}:
              <div
                style={{
                  display: "flex",
                  gap: 6,
                  flexWrap: "wrap",
                  marginTop: 6,
                }}
              >
                {Object.entries(PTS_SURPRISE)
                  .filter(function (e) {
                    return e[1] > 0;
                  })
                  .map(function (e) {
                    var stage = e[0];
                    var p = e[1];
                    return (
                      <span
                        key={stage}
                        style={{
                          background: "rgba(88,166,255,.1)",
                          borderRadius: 4,
                          padding: "2px 7px",
                          fontSize: 11,
                          color: "var(--accent)",
                          fontWeight: 700,
                        }}
                      >
                        {stage === "🏆 Wereldkampioen" ? "🏆 Kampioen" : stage}:
                        +{p}
                      </span>
                    );
                  })}
              </div>
            </div>
          )}
        </div>

        {/* Topland eruit */}
        <div style={S.card()}>
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 4 }}>
            💥 Welk topland haalt de KO-fase niet?{" "}
            <span style={{ color: "var(--accent)", fontWeight: 700 }}>
              +{PTS_EXTRA.topOut} pt
            </span>
          </div>
          <div
            style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10 }}
          >
            Kies een van de 12 hoogst geklasseerde landen die uitgeschakeld
            worden in de groepsfase.
          </div>
          <select
            disabled={frozen}
            value={pred.topOut || ""}
            onChange={(e) => set(["topOut"], e.target.value)}
            style={{
              background: "var(--bg)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "8px 12px",
              fontSize: 14,
              width: "100%",
              opacity: frozen ? 0.6 : 1,
              fontFamily: "var(--font)",
            }}
          >
            <option value="">— kies jouw topland —</option>
            {TOP_TEAMS.map((t) => (
              <option key={t} value={t}>
                {FLAG[t] || "🏳️"} {t}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

// ─── KO BRACKET PREDICTIONS ───────────────────────────────────────────────────

function KOPredictionsForm({ user, state, onSave, onBack }) {
  const [pred, setPred] = useState(() =>
    JSON.parse(JSON.stringify(user.predictions || {}))
  );
  const [saved, setSaved] = useState(false);
  const [activeRound, setActiveRound] = useState("r16");

  // Per-ronde frozen logica
  const frozenRounds = state.koFrozenRounds || {};
  const isRoundFrozen = (roundKey) => !!frozenRounds[roundKey];
  // Voor de "Finale & 3e Plaats" tab: bevroren als beide bevroren zijn
  const activeRoundFrozen =
    activeRound === "final"
      ? isRoundFrozen("final") && isRoundFrozen("3rd")
      : isRoundFrozen(activeRound);
  // Fallback: als koFrozenRounds leeg/afwezig is, val terug op legacy koFrozen
  const legacyFrozen = state.koFrozen && Object.keys(frozenRounds).length === 0;

  const set = (path, val) => {
    setPred((p) => {
      const next = deepSet(p, path, val);
      onSave(next);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      return next;
    });
  };

  const rounds = [
    { key: "r32", label: "Zestiende finales" },
    { key: "r16", label: "Achtste finales" },
    { key: "qf", label: "Kwartfinales" },
    { key: "sf", label: "Halve finales" },
    { key: "final", label: "Finale & 3e Plaats" },
  ];

  const richSlots = buildRichKOSlots(pred, state.results, state.koResults);

  const winnerCandidates = (homeDesc, awayDesc) => {
    const from = (d) =>
      d?.type === "team" ? [d.team] : d?.type === "two" ? d.teams : [];
    return [...new Set([...from(homeDesc), ...from(awayDesc)])];
  };

  return (
    <div>
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
          ⚔️ KO-fase voorspellen
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {saved && (
            <span style={{ fontSize: 12, color: "var(--green)" }}>
              ✓ Opgeslagen
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

      {(activeRoundFrozen || legacyFrozen) && (
        <Alert
          msg="Deze ronde is bevroren. Je kunt je voorspellingen nog bekijken maar niet meer wijzigen."
          type="warn"
        />
      )}

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
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div
              style={{
                minWidth: 28,
                height: 28,
                borderRadius: 6,
                background: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 900,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              W
            </div>
            <div>
              <div
                style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}
              >
                Winnaar
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                Welk team gaat door? Bij gelijkspel na 90 min. gaat het door via
                verlenging of strafschoppen — voorspel de winnaar, niet het
                eindresultaat.
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div
              style={{
                minWidth: 28,
                height: 28,
                borderRadius: 6,
                background: "var(--green)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 900,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              S
            </div>
            <div>
              <div
                style={{ fontWeight: 700, fontSize: 13, color: "var(--text)" }}
              >
                Stand na 90 min.
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                Hoe staat het na negentig minuten reguliere speeltijd? Dit is de
                bonus — je verdient hier extra punten bovenop de winnaarspunten.
              </div>
            </div>
          </div>
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
            ].map(function (row) {
              var ronde = row[0];
              var schema = row[1];
              return (
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
                    <span title="Winnaar">W</span> +{schema.winner}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--green)",
                      fontWeight: 600,
                    }}
                  >
                    <span title="Stand na 90 min">S</span> +{schema.exact}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Ronde-tabs met bevriezingsindicator */}
      <div
        style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 18 }}
      >
        {rounds.map((r) => {
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

      {KO_STRUCTURE.filter(
        (m) =>
          m.round === activeRound ||
          (activeRound === "final" &&
            (m.round === "final" || m.round === "3rd"))
      ).map((m) => {
        // Per-wedstrijd frozen: gebruik de ronde van díe wedstrijd
        const matchFrozen = legacyFrozen || !!frozenRounds[m.round];

        const homeDesc = richSlots[m.id]?.home;
        const awayDesc = richSlots[m.id]?.away;
        const predWinner = pred.koWinners?.[m.id];
        const predScore = pred.koScores?.[m.id];
        const r = state.koResults[m.id];
        const schema = PTS_KO[m.round] || PTS_KO.r16;
        const candidates = winnerCandidates(homeDesc, awayDesc);
        const useButtons = candidates.length >= 1 && candidates.length <= 4;
        const winOk = r && r.played && predWinner && predWinner === r.winner;
        const winNope = r && r.played && predWinner && predWinner !== r.winner;
        const scoreOk =
          r &&
          r.played &&
          predScore &&
          predScore.home !== undefined &&
          parseInt(predScore.home) === parseInt(r.home90) &&
          parseInt(predScore.away) === parseInt(r.away90);

        return (
          <div
            key={m.id}
            style={{
              ...S.card(),
              marginBottom: 12,
              border: `1px solid ${
                r && r.played
                  ? winOk
                    ? "rgba(63,185,80,.4)"
                    : winNope
                    ? "rgba(248,81,73,.3)"
                    : "var(--border)"
                  : predWinner
                  ? "rgba(88,166,255,.3)"
                  : "var(--border)"
              }`,
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
                {matchFrozen && (
                  <span
                    style={{
                      fontSize: 10,
                      color: "var(--orange)",
                      background: "rgba(240,136,62,.12)",
                      borderRadius: 4,
                      padding: "1px 6px",
                    }}
                  >
                    🔒 bevroren
                  </span>
                )}
              </div>
              {r && r.played && (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {winOk && (
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--green)",
                      }}
                    >
                      +{schema.winner}
                      {scoreOk ? " +" + schema.exact : ""} pt ✓
                    </span>
                  )}
                  {winNope && (
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--red)",
                      }}
                    >
                      ✗
                    </span>
                  )}
                </div>
              )}
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
                    disabled={matchFrozen}
                    type="number"
                    min={0}
                    max={20}
                    value={predScore?.home ?? ""}
                    onChange={(e) =>
                      set(["koScores", m.id, "home"], e.target.value)
                    }
                    style={{ ...S.numInput, opacity: matchFrozen ? 0.6 : 1 }}
                  />
                  <span style={{ color: "var(--muted)", fontWeight: 700 }}>
                    –
                  </span>
                  <input
                    disabled={matchFrozen}
                    type="number"
                    min={0}
                    max={20}
                    value={predScore?.away ?? ""}
                    onChange={(e) =>
                      set(["koScores", m.id, "away"], e.target.value)
                    }
                    style={{ ...S.numInput, opacity: matchFrozen ? 0.6 : 1 }}
                  />
                </div>
                <div style={{ fontSize: 10, color: "var(--muted)" }}>
                  na 90 min
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <SlotDisplay desc={awayDesc} align="left" size={14} />
              </div>
            </div>

            {r && r.played && (
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
                <div style={{ fontSize: 12, color: "var(--muted)" }}>
                  Uitslag
                </div>
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

            <div
              style={{ borderTop: "1px solid var(--border)", paddingTop: 10 }}
            >
              <div
                style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8 }}
              >
                🏆 Winnaar
              </div>
              {useButtons ? (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {candidates.map((t) => (
                    <button
                      key={t}
                      disabled={matchFrozen}
                      onClick={() =>
                        !matchFrozen &&
                        set(["koWinners", m.id], predWinner === t ? "" : t)
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
                          predWinner === t
                            ? "rgba(88,166,255,.15)"
                            : "var(--bg)",
                        color: "var(--text)",
                        cursor: matchFrozen ? "default" : "pointer",
                        fontSize: 13,
                        fontWeight: predWinner === t ? 700 : 400,
                        fontFamily: "var(--font)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 4,
                        opacity: matchFrozen ? 0.7 : 1,
                      }}
                    >
                      {FLAG[t] || "🏳️"} {t}
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  {(homeDesc?.type === "label" ||
                    awayDesc?.type === "label") && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "var(--muted)",
                        marginBottom: 6,
                        fontStyle: "italic",
                      }}
                    >
                      Teams nog niet zeker ({homeDesc?.label} vs{" "}
                      {awayDesc?.label})
                    </div>
                  )}
                  <select
                    disabled={matchFrozen}
                    value={predWinner || ""}
                    onChange={(e) => set(["koWinners", m.id], e.target.value)}
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
                      opacity: matchFrozen ? 0.6 : 1,
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
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { GroupPredictionsForm, ExtraPredictionsForm, KOPredictionsForm };
