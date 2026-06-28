import React, { useState } from "react";
import {
  ALL_TEAMS,
  NL_STAGES,
  SURPRISE_TEAMS,
  PTS_SURPRISE,
  TOP_TEAMS,
  PLAYERS_BY_COUNTRY,
  PTS_EXTRA,
  PTS_TOPSCORER_RANK,
  FLAG,
} from "../../data/tournamentData";
import {
  deepSet,
  deriveTopOuts,
  deriveSurpriseStage,
  calcTopScorerPts,
} from "../../pouleEngine";
import { S } from "../../styles/ui";
import { Alert } from "../common";
import { FormHeader } from "./GroupPredictionsForm";

function ExtraPredictionsForm({ user, state, onSave, onBack }) {
  const [pred, setPred] = useState(() =>
    JSON.parse(JSON.stringify(user.predictions || {}))
  );
  const [saved, setSaved] = useState(false);
  const unlocked = (state.unlockedUsers || []).includes(user.id);
  const frozen = state.extraFrozen && !unlocked;

  // FIX: onSave buiten de setPred updater aanroepen
  async function set(path, val) {
    const next = deepSet(pred, path, val);
    setPred(next);
    const ok = await onSave(next);
    setSaved(ok ? "ok" : "error");
  }

  async function setTopScorer(index, val) {
    const current = Array.isArray(pred.topScorers)
      ? [...pred.topScorers]
      : ["", "", ""];
    while (current.length < 3) current.push("");
    current[index] = val;
    const next = { ...pred, topScorers: current };
    setPred(next);
    const ok = await onSave(next);
    setSaved(ok ? "ok" : "error");
  }

  async function setTopScorerCountry(index, country) {
    const currentCountries = Array.isArray(pred.topScorerCountries)
      ? [...pred.topScorerCountries]
      : ["", "", ""];
    while (currentCountries.length < 3) currentCountries.push("");
    currentCountries[index] = country;
    const currentScorers = Array.isArray(pred.topScorers)
      ? [...pred.topScorers]
      : ["", "", ""];
    while (currentScorers.length < 3) currentScorers.push("");
    currentScorers[index] = "";
    const next = {
      ...pred,
      topScorerCountries: currentCountries,
      topScorers: currentScorers,
    };
    setPred(next);
    const ok = await onSave(next);
    setSaved(ok ? "ok" : "error");
  }

  return (
    <div>
      <FormHeader
        title={frozen ? "Extra vragen (bevroren)" : "Extra vragen invullen"}
        icon="🔮"
        saved={saved}
        onBack={onBack}
      />
      {frozen && (
        <Alert
          msg="De extra vragen zijn bevroren. Je kunt ze nog bekijken maar niet meer wijzigen."
          type="warn"
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <ChampionCard pred={pred} frozen={frozen} set={set} state={state} />
        <TopScorerCard
          pred={pred}
          frozen={frozen}
          setTopScorer={setTopScorer}
          setTopScorerCountry={setTopScorerCountry}
          state={state}
        />
        <NlStageCard pred={pred} frozen={frozen} set={set} state={state} />
        <YellowCardsCard pred={pred} frozen={frozen} set={set} state={state} />
        <SurpriseTeamCard pred={pred} frozen={frozen} set={set} state={state} />
        <TopOutCard pred={pred} frozen={frozen} set={set} state={state} />
        <MostCleanSheetsCard pred={pred} frozen={frozen} set={set} state={state} />
        <MostGroupGoalsCard pred={pred} frozen={frozen} set={set} state={state} />
      </div>
    </div>
  );
}

function ResultBadge({ correct, pts }) {
  if (correct === true) {
    return (
      <span style={{ color: "var(--green)", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" }}>
        +{pts} ✓
      </span>
    );
  }
  if (correct === false) {
    return (
      <span style={{ color: "var(--red)", fontWeight: 700, fontSize: 13 }}>
        ✗
      </span>
    );
  }
  return null;
}

function CorrectAnswerRow({ children }) {
  return (
    <div
      style={{
        marginTop: 8,
        paddingTop: 8,
        borderTop: "1px solid var(--border)",
        fontSize: 12,
        color: "var(--muted)",
      }}
    >
      Uitslag:{" "}
      <span style={{ color: "var(--text)", fontWeight: 600 }}>{children}</span>
    </div>
  );
}

function QuestionCard({ label, pts, description, children, resultBadge, correctNode }) {
  return (
    <div style={S.card()}>
      <div
        style={{
          fontSize: 13,
          color: "var(--muted)",
          marginBottom: description ? 4 : 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <span>{label}</span>
        {resultBadge || (pts !== undefined && (
          <span style={{ color: "var(--accent)", fontWeight: 700 }}>
            +{pts} pt
          </span>
        ))}
      </div>
      {description && (
        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10 }}>
          {description}
        </div>
      )}
      {children}
      {correctNode}
    </div>
  );
}

function TeamSelect({ value, onChange, disabled, placeholder, teams }) {
  const sorted = [...teams].sort((a, b) => a.localeCompare(b, "nl"));
  return (
    <select
      value={value || ""}
      onChange={onChange}
      disabled={disabled}
      style={{
        background: "var(--bg)",
        color: "var(--text)",
        border: "1px solid var(--border)",
        borderRadius: 6,
        padding: "8px 12px",
        fontSize: 14,
        width: "100%",
        opacity: disabled ? 0.6 : 1,
        fontFamily: "var(--font)",
      }}
    >
      <option value="">{placeholder}</option>
      {sorted.map((t) => (
        <option key={t} value={t}>
          {FLAG[t] || "🏳️"} {t}
        </option>
      ))}
    </select>
  );
}

function ChampionCard({ pred, frozen, set, state }) {
  const finalResult = state?.koResults?.["FINAL"];
  let resultBadge = null;
  let correctNode = null;
  if (finalResult?.played) {
    if (pred.champion) {
      const correct = pred.champion === finalResult.winner;
      resultBadge = <ResultBadge correct={correct} pts={PTS_EXTRA.champion} />;
    }
    if (finalResult.winner) {
      correctNode = (
        <CorrectAnswerRow>
          {FLAG[finalResult.winner] || "🏳️"} {finalResult.winner}
        </CorrectAnswerRow>
      );
    }
  }
  return (
    <QuestionCard label="🏆 Wereldkampioen" pts={PTS_EXTRA.champion} resultBadge={resultBadge} correctNode={correctNode}>
      <TeamSelect
        value={pred.champion}
        onChange={(e) => set(["champion"], e.target.value)}
        disabled={frozen}
        placeholder="— selecteer kampioen —"
        teams={ALL_TEAMS}
      />
    </QuestionCard>
  );
}

function TopScorerCard({ pred, frozen, setTopScorer, setTopScorerCountry, state }) {
  const topScorers = Array.isArray(pred.topScorers)
    ? [...pred.topScorers]
    : [pred.topScorer || "", "", ""];
  while (topScorers.length < 3) topScorers.push("");

  const topScorerCountries = Array.isArray(pred.topScorerCountries)
    ? [...pred.topScorerCountries]
    : [pred.topScorerCountry || "", "", ""];
  while (topScorerCountries.length < 3) topScorerCountries.push("");

  const resultTopScorers = Array.isArray(state?.results?.["TOP_SCORERS"])
    ? state.results["TOP_SCORERS"]
    : [];
  const topScorersKnown = resultTopScorers.length > 0;
  const totalPts = topScorersKnown
    ? calcTopScorerPts(topScorers, resultTopScorers)
    : null;

  return (
    <div style={S.card()}>
      <div
        style={{
          fontSize: 13,
          color: "var(--muted)",
          marginBottom: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <span>⚽ Topscoorders — kies 3 spelers</span>
        {topScorersKnown ? (
          totalPts > 0 ? (
            <span style={{ color: "var(--green)", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" }}>
              +{totalPts} ✓
            </span>
          ) : (
            <span style={{ color: "var(--red)", fontWeight: 700, fontSize: 13 }}>✗</span>
          )
        ) : null}
      </div>
      <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12 }}>
        Verdien punten per rank: 1e ={" "}
        <strong style={{ color: "var(--accent)" }}>
          +{PTS_TOPSCORER_RANK[1]}
        </strong>
        , 2e ={" "}
        <strong style={{ color: "var(--accent)" }}>
          +{PTS_TOPSCORER_RANK[2]}
        </strong>
        , 3e ={" "}
        <strong style={{ color: "var(--accent)" }}>
          +{PTS_TOPSCORER_RANK[3]}
        </strong>{" "}
        pt
      </div>
      {topScorersKnown && (
        <div
          style={{
            marginBottom: 12,
            padding: "8px 10px",
            background: "var(--bg)",
            borderRadius: 7,
            border: "1px solid var(--border)",
          }}
        >
          <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>
            Uitslag topscoorders:
          </div>
          {[...resultTopScorers]
            .sort((a, b) => a.rank - b.rank)
            .map((r) => (
              <div
                key={r.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 12,
                  marginBottom: 3,
                }}
              >
                <span style={{ color: "var(--muted)", minWidth: 14 }}>{r.rank}.</span>
                <span style={{ fontWeight: 600, color: "var(--text)" }}>{r.name}</span>
                <span style={{ color: "var(--accent)", marginLeft: "auto", fontWeight: 700 }}>
                  +{PTS_TOPSCORER_RANK[r.rank] || 0} pt
                </span>
              </div>
            ))}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {[0, 1, 2].map((i) => {
          const country = topScorerCountries[i] || "";
          const player = topScorers[i] || "";
          const allPlayers = country
            ? [...(PLAYERS_BY_COUNTRY[country] || [])].sort((a, b) =>
                b.kwal !== a.kwal
                  ? b.kwal - a.kwal
                  : a.name.localeCompare(b.name)
              )
            : [];

          const matchedResult = topScorersKnown && player
            ? resultTopScorers.find((r) => r.name === player)
            : null;
          const playerPts = matchedResult ? PTS_TOPSCORER_RANK[matchedResult.rank] || 0 : null;

          return (
            <div
              key={i}
              style={{
                background: "var(--bg)",
                border: `1px solid ${
                  player ? "rgba(88,166,255,.3)" : "var(--border)"
                }`,
                borderRadius: 8,
                padding: "10px 12px",
              }}
            >
              <select
                disabled={frozen}
                value={country}
                onChange={(e) => setTopScorerCountry(i, e.target.value)}
                style={{
                  background: "var(--card)",
                  color: "var(--text)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: "7px 10px",
                  fontSize: 13,
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

              {country ? (
                <select
                  disabled={frozen}
                  value={player}
                  onChange={(e) => setTopScorer(i, e.target.value)}
                  style={{
                    background: "var(--card)",
                    color: "var(--text)",
                    border: `1px solid ${
                      player ? "var(--accent)" : "var(--border)"
                    }`,
                    borderRadius: 6,
                    padding: "7px 10px",
                    fontSize: 13,
                    width: "100%",
                    opacity: frozen ? 0.6 : 1,
                    fontFamily: "var(--font)",
                  }}
                >
                  <option value="">— kies een speler —</option>
                  {allPlayers.map((pl) => (
                    <option key={pl.name} value={pl.name}>
                      {pl.name}
                      {pl.kwal > 0 ? ` (${pl.kwal} kwal. goals)` : ""}
                    </option>
                  ))}
                </select>
              ) : (
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

              {player && country && (
                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span style={{ fontSize: 20 }}>{FLAG[country] || "🏳️"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>
                      {player}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>
                      {country}
                    </div>
                  </div>
                  {topScorersKnown && (
                    playerPts > 0 ? (
                      <span style={{ color: "var(--green)", fontWeight: 700, fontSize: 13 }}>
                        +{playerPts} ✓
                      </span>
                    ) : (
                      <span style={{ color: "var(--red)", fontWeight: 700, fontSize: 13 }}>
                        ✗
                      </span>
                    )
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NlStageCard({ pred, frozen, set, state }) {
  const nlStageResult = state?.results?.["NL_STAGE"];
  let resultBadge = null;
  let correctNode = null;
  if (nlStageResult) {
    if (pred.nlStage) {
      const correct = pred.nlStage === nlStageResult;
      resultBadge = <ResultBadge correct={correct} pts={PTS_EXTRA.nlStage} />;
    }
    correctNode = <CorrectAnswerRow>{nlStageResult}</CorrectAnswerRow>;
  }
  return (
    <QuestionCard
      label="🇳🇱 Hoe ver komt Nederland?"
      pts={PTS_EXTRA.nlStage}
      resultBadge={resultBadge}
      correctNode={correctNode}
    >
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
    </QuestionCard>
  );
}

function SurpriseTeamCard({ pred, frozen, set, state }) {
  const SURPRISE_STAGES = [
    { stage: "Zestiende finale", pts: PTS_SURPRISE["Zestiende finale"] },
    { stage: "Achtste finale", pts: PTS_SURPRISE["Achtste finale"] },
    { stage: "Kwartfinale", pts: PTS_SURPRISE["Kwartfinale"] },
    { stage: "Halve finale", pts: PTS_SURPRISE["Halve finale"] },
    { stage: "3e Plaats", pts: PTS_SURPRISE["3e Plaats"] },
    { stage: "🏆 Wereldkampioen", pts: PTS_SURPRISE["🏆 Wereldkampioen"] },
  ];

  const surpriseStage = pred.surpriseTeam && state
    ? deriveSurpriseStage(pred.surpriseTeam, state.koResults || {})
    : null;
  const surprisePts = surpriseStage ? PTS_SURPRISE[surpriseStage] || 0 : null;

  return (
    <div style={S.card()}>
      <div
        style={{
          fontSize: 13,
          color: "var(--muted)",
          marginBottom: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <span>🌟 Verrassing van het WK</span>
        {surpriseStage && (
          <span style={{ color: "var(--green)", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" }}>
            +{surprisePts} pt
          </span>
        )}
      </div>
      <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10 }}>
        Kies een van de 12 laagst geklasseerde landen. Punten op basis van hoe
        ver dit land de KO-fase haalt.
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 5,
          marginBottom: 12,
        }}
      >
        {SURPRISE_STAGES.map(({ stage, pts }) => {
          const isActive = stage === surpriseStage;
          return (
            <div
              key={stage}
              style={{
                background: isActive ? "rgba(63,185,80,.12)" : "var(--bg)",
                border: `1px solid ${isActive ? "var(--green)" : "var(--border)"}`,
                borderRadius: 7,
                padding: "6px 8px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: isActive ? "var(--green)" : "var(--accent)",
                  marginBottom: 2,
                }}
              >
                +{pts}
              </div>
              <div
                style={{ fontSize: 10, color: "var(--muted)", lineHeight: 1.3 }}
              >
                {stage}
              </div>
            </div>
          );
        })}
      </div>
      <TeamSelect
        value={pred.surpriseTeam}
        onChange={(e) => set(["surpriseTeam"], e.target.value)}
        disabled={frozen}
        placeholder="— kies jouw verrassing —"
        teams={SURPRISE_TEAMS}
      />
      {surpriseStage && (
        <div
          style={{
            marginTop: 10,
            fontSize: 12,
            color: "var(--green)",
            fontWeight: 700,
          }}
        >
          Nu in: {surpriseStage} → +{surprisePts} pt
        </div>
      )}
    </div>
  );
}

function TopOutCard({ pred, frozen, set, state }) {
  let resultBadge = null;
  let correctNode = null;
  const outs = state ? deriveTopOuts(state.results || {}, state.koResults || {}) : [];
  if (pred.topOut && state) {
    if (outs.includes(pred.topOut)) {
      resultBadge = <ResultBadge correct={true} pts={PTS_EXTRA.topOut} />;
    } else {
      const advancedInKO = Object.values(state.koResults || {}).some(
        (r) => r?.played && r.winner === pred.topOut
      );
      if (advancedInKO) {
        resultBadge = <ResultBadge correct={false} pts={PTS_EXTRA.topOut} />;
      }
    }
  }
  if (outs.length > 0) {
    correctNode = (
      <CorrectAnswerRow>
        {outs.map((t) => `${FLAG[t] || "🏳️"} ${t}`).join(", ")}
      </CorrectAnswerRow>
    );
  }
  return (
    <QuestionCard
      label="💥 Welk topland haalt de achtste finales niet?"
      pts={PTS_EXTRA.topOut}
      description="Kies een van de 12 hoogst geklasseerde landen die de achtste finales niet bereiken — uitgeschakeld in de groepsfase of in de zestiende finales."
      resultBadge={resultBadge}
      correctNode={correctNode}
    >
      <TeamSelect
        value={pred.topOut}
        onChange={(e) => set(["topOut"], e.target.value)}
        disabled={frozen}
        placeholder="— kies jouw topland —"
        teams={TOP_TEAMS}
      />
    </QuestionCard>
  );
}

function MostCleanSheetsCard({ pred, frozen, set, state }) {
  let resultBadge = null;
  let correctNode = null;
  const csResult = state?.results?.["MOST_CLEAN_SHEETS"];
  if (csResult) {
    const adminCS = Array.isArray(csResult) ? csResult : [csResult];
    if (pred.mostCleanSheets) {
      const correct = adminCS.includes(pred.mostCleanSheets);
      resultBadge = <ResultBadge correct={correct} pts={PTS_EXTRA.mostCleanSheets} />;
    }
    correctNode = (
      <CorrectAnswerRow>
        {adminCS.map((t) => `${FLAG[t] || "🏳️"} ${t}`).join(", ")}
      </CorrectAnswerRow>
    );
  }
  return (
    <QuestionCard
      label="🧤 Meeste clean sheets"
      pts={PTS_EXTRA.mostCleanSheets}
      description="Welk land houdt op het hele toernooi de meeste clean sheets (nul gehouden)?"
      resultBadge={resultBadge}
      correctNode={correctNode}
    >
      <TeamSelect
        value={pred.mostCleanSheets}
        onChange={(e) => set(["mostCleanSheets"], e.target.value)}
        disabled={frozen}
        placeholder="— selecteer land —"
        teams={ALL_TEAMS}
      />
    </QuestionCard>
  );
}

function YellowCardsCard({ pred, frozen, set, state }) {
  let resultBadge = null;
  let correctNode = null;
  const yellowResult = state?.results?.["YELLOW_CARDS"];
  if (yellowResult) {
    if (pred.yellowCards) {
      const correct = pred.yellowCards === yellowResult;
      resultBadge = <ResultBadge correct={correct} pts={PTS_EXTRA.yellowCards} />;
    }
    correctNode = (
      <CorrectAnswerRow>
        {FLAG[yellowResult] || "🏳️"} {yellowResult}
      </CorrectAnswerRow>
    );
  }
  return (
    <QuestionCard
      label="🟨 Meeste gele kaarten"
      pts={PTS_EXTRA.yellowCards}
      description="Welk land heeft aan het einde van het toernooi de meeste gele kaarten ontvangen?"
      resultBadge={resultBadge}
      correctNode={correctNode}
    >
      <TeamSelect
        value={pred.yellowCards}
        onChange={(e) => set(["yellowCards"], e.target.value)}
        disabled={frozen}
        placeholder="— selecteer land —"
        teams={ALL_TEAMS}
      />
    </QuestionCard>
  );
}

function MostGroupGoalsCard({ pred, frozen, set, state }) {
  let resultBadge = null;
  let correctNode = null;
  const mggResult = state?.results?.["MOST_GROUP_GOALS"];
  if (mggResult) {
    const adminMGG = Array.isArray(mggResult) ? mggResult : [mggResult];
    if (pred.mostGroupGoals) {
      const correct = adminMGG.includes(pred.mostGroupGoals);
      resultBadge = <ResultBadge correct={correct} pts={PTS_EXTRA.mostGroupGoals} />;
    }
    correctNode = (
      <CorrectAnswerRow>
        {adminMGG.map((t) => `${FLAG[t] || "🏳️"} ${t}`).join(", ")}
      </CorrectAnswerRow>
    );
  }
  return (
    <QuestionCard
      label="⚽ Meeste doelpunten groepsfase"
      pts={PTS_EXTRA.mostGroupGoals}
      description="Welk land scoort de meeste doelpunten tijdens de groepsfase?"
      resultBadge={resultBadge}
      correctNode={correctNode}
    >
      <TeamSelect
        value={pred.mostGroupGoals}
        onChange={(e) => set(["mostGroupGoals"], e.target.value)}
        disabled={frozen}
        placeholder="— selecteer land —"
        teams={ALL_TEAMS}
      />
    </QuestionCard>
  );
}

export { ExtraPredictionsForm };
