import React, { useState } from "react";
import {
  ALL_TEAMS,
  NL_STAGES,
  SURPRISE_TEAMS,
  PTS_SURPRISE,
  TOP_TEAMS,
  PLAYERS_BY_COUNTRY,
  PTS_EXTRA,
  FLAG,
} from "../data/tournamentData";
import { deepSet } from "../pouleEngine";
import { S } from "../styles/ui";
import { Alert } from "./common";
import { FormHeader } from "./GroupPredictionsForm";

function ExtraPredictionsForm({ user, state, onSave, onBack }) {
  const [pred, setPred] = useState(() => JSON.parse(JSON.stringify(user.predictions || {})));
  const [saved, setSaved] = useState(false);
  const frozen = state.extraFrozen;

  function set(path, val) {
    setPred((p) => {
      const next = deepSet(p, path, val);
      onSave(next);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
      return next;
    });
  }

  const selectStyle = (highlighted) => ({
    background: "var(--bg)",
    color: "var(--text)",
    border: `1px solid ${highlighted ? "var(--accent)" : "var(--border)"}`,
    borderRadius: 6,
    padding: "8px 12px",
    fontSize: 14,
    width: "100%",
    opacity: frozen ? 0.6 : 1,
    fontFamily: "var(--font)",
  });

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
        <ChampionCard pred={pred} frozen={frozen} set={set} selectStyle={selectStyle} />
        <TopScorerCard pred={pred} frozen={frozen} set={set} setPred={setPred} onSave={onSave} selectStyle={selectStyle} />
        <NlStageCard pred={pred} frozen={frozen} set={set} selectStyle={selectStyle} />
        <YellowCardsCard pred={pred} frozen={frozen} set={set} selectStyle={selectStyle} />
        <SurpriseTeamCard pred={pred} frozen={frozen} set={set} selectStyle={selectStyle} />
        <TopOutCard pred={pred} frozen={frozen} set={set} selectStyle={selectStyle} />
      </div>
    </div>
  );
}

// ─── INDIVIDUAL QUESTION CARDS ────────────────────────────────────────────────

function QuestionCard({ label, pts, description, children }) {
  return (
    <div style={S.card()}>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: description ? 4 : 10 }}>
        {label}{" "}
        {pts !== undefined && (
          <span style={{ color: "var(--accent)", fontWeight: 700 }}>+{pts} pt</span>
        )}
      </div>
      {description && (
        <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 10 }}>{description}</div>
      )}
      {children}
    </div>
  );
}

function TeamSelect({ value, onChange, disabled, placeholder, teams }) {
  return (
    <select value={value || ""} onChange={onChange} disabled={disabled}
      style={{ background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 12px", fontSize: 14, width: "100%", opacity: disabled ? 0.6 : 1, fontFamily: "var(--font)" }}>
      <option value="">{placeholder}</option>
      {teams.map((t) => (
        <option key={t} value={t}>{FLAG[t] || "🏳️"} {t}</option>
      ))}
    </select>
  );
}

function ChampionCard({ pred, frozen, set, selectStyle }) {
  return (
    <QuestionCard label="🏆 Wereldkampioen" pts={PTS_EXTRA.champion}>
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

function TopScorerCard({ pred, frozen, set, setPred, onSave, selectStyle }) {
  const allPlayers = pred.topScorerCountry
    ? [...(PLAYERS_BY_COUNTRY[pred.topScorerCountry] || [])].sort((a, b) =>
        b.kwal !== a.kwal ? b.kwal - a.kwal : a.name.localeCompare(b.name)
      )
    : [];

  function onCountryChange(e) {
    const country = e.target.value;
    setPred((p) => {
      const next = deepSet(deepSet(p, ["topScorerCountry"], country), ["topScorer"], "");
      onSave(next);
      return next;
    });
  }

  return (
    <QuestionCard label="⚽ Topscorer" pts={PTS_EXTRA.topScorer}>
      <select
        disabled={frozen}
        value={pred.topScorerCountry || ""}
        onChange={onCountryChange}
        style={{ background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 12px", fontSize: 14, width: "100%", marginBottom: 8, opacity: frozen ? 0.6 : 1, fontFamily: "var(--font)" }}
      >
        <option value="">— kies een land —</option>
        {Object.keys(PLAYERS_BY_COUNTRY).sort().map((c) => (
          <option key={c} value={c}>{FLAG[c] || "🏳️"} {c}</option>
        ))}
      </select>

      {pred.topScorerCountry ? (
        <div>
          <select
            disabled={frozen}
            value={pred.topScorer || ""}
            onChange={(e) => set(["topScorer"], e.target.value)}
            style={{ background: "var(--bg)", color: "var(--text)", border: `1px solid ${pred.topScorer ? "var(--accent)" : "var(--border)"}`, borderRadius: 6, padding: "8px 12px", fontSize: 14, width: "100%", opacity: frozen ? 0.6 : 1, fontFamily: "var(--font)" }}
          >
            <option value="">— kies een speler —</option>
            {allPlayers.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}{p.kwal > 0 ? ` (${p.kwal} kwal. goals)` : ""}
              </option>
            ))}
          </select>
          {pred.topScorer && (
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 22 }}>{FLAG[pred.topScorerCountry] || "🏳️"}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{pred.topScorer}</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>
                  {pred.topScorerCountry}
                  {(() => {
                    const pl = allPlayers.find((p) => p.name === pred.topScorer);
                    return pl?.kwal > 0 ? ` · ${pl.kwal} kwal. doelpunten` : "";
                  })()}
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>
          Kies eerst een land om spelers te zien
        </div>
      )}
    </QuestionCard>
  );
}

function NlStageCard({ pred, frozen, set }) {
  return (
    <QuestionCard label="🇳🇱 Hoe ver komt Nederland?" pts={PTS_EXTRA.nlStage}>
      <select
        disabled={frozen}
        value={pred.nlStage || ""}
        onChange={(e) => set(["nlStage"], e.target.value)}
        style={{ background: "var(--bg)", color: "var(--text)", border: "1px solid var(--border)", borderRadius: 6, padding: "8px 12px", fontSize: 14, width: "100%", opacity: frozen ? 0.6 : 1, fontFamily: "var(--font)" }}
      >
        <option value="">— selecteer fase —</option>
        {NL_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    </QuestionCard>
  );
}

function YellowCardsCard({ pred, frozen, set }) {
  return (
    <QuestionCard
      label="🟨 Meeste gele kaarten"
      pts={PTS_EXTRA.yellowCards}
      description="Welk land heeft aan het einde van het toernooi de meeste gele kaarten ontvangen?"
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

function SurpriseTeamCard({ pred, frozen, set }) {
  return (
    <QuestionCard
      label="🌟 Verrassing van het WK"
      description="Kies een van de 12 laagst geklasseerde landen. Punten op basis van hoe ver dit land de KO-fase haalt."
    >
      <TeamSelect
        value={pred.surpriseTeam}
        onChange={(e) => set(["surpriseTeam"], e.target.value)}
        disabled={frozen}
        placeholder="— kies jouw verrassing —"
        teams={SURPRISE_TEAMS}
      />
      {pred.surpriseTeam && (
        <div style={{ marginTop: 10, fontSize: 11, color: "var(--muted)" }}>
          Punten als {FLAG[pred.surpriseTeam]} {pred.surpriseTeam}:
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
            {Object.entries(PTS_SURPRISE)
              .filter(([, v]) => v > 0)
              .map(([stage, p]) => (
                <span key={stage} style={{ background: "rgba(88,166,255,.1)", borderRadius: 4, padding: "2px 7px", fontSize: 11, color: "var(--accent)", fontWeight: 700 }}>
                  {stage === "🏆 Wereldkampioen" ? "🏆 Kampioen" : stage}: +{p}
                </span>
              ))}
          </div>
        </div>
      )}
    </QuestionCard>
  );
}

function TopOutCard({ pred, frozen, set }) {
  return (
    <QuestionCard
      label="💥 Welk topland haalt de KO-fase niet?"
      pts={PTS_EXTRA.topOut}
      description="Kies een van de 12 hoogst geklasseerde landen die uitgeschakeld worden in de groepsfase."
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

export { ExtraPredictionsForm };
