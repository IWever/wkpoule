import React from "react";
import {
  PTS_GROUP,
  PTS_STANDING,
  PTS_KO,
  PTS_EXTRA,
  PTS_SURPRISE,
  PTS_TOPSCORER_RANK,
  DEADLINES,
} from "../../data/tournamentData";
import { S } from "../../styles/ui";

// ─── SHARED ATOMS ─────────────────────────────────────────────────────────────

function SectionHeader({ children }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 700,
        color: "var(--accent)",
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        marginBottom: 14,
        marginTop: 6,
      }}
    >
      {children}
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div
      style={{
        ...S.card(),
        marginBottom: 10,
        padding: "14px 16px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function CardTitle({ children }) {
  return (
    <div
      style={{
        fontSize: 13,
        fontWeight: 700,
        color: "var(--text)",
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

function RuleRow({ icon, label, desc, pts, noBorder }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        paddingBottom: noBorder ? 0 : 12,
        marginBottom: noBorder ? 0 : 12,
        borderBottom: noBorder ? "none" : "1px solid var(--border)",
      }}
    >
      {icon && (
        <span style={{ fontSize: 16, lineHeight: 1, marginTop: 1 }}>
          {icon}
        </span>
      )}
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text)",
            lineHeight: 1.4,
          }}
        >
          {label}
        </div>
        {desc && (
          <div
            style={{
              fontSize: 12,
              color: "var(--muted)",
              marginTop: 3,
              lineHeight: 1.5,
            }}
          >
            {desc}
          </div>
        )}
      </div>
      {pts !== undefined && <PtsBadge pts={pts} />}
    </div>
  );
}

function PtsBadge({ pts, color = "var(--accent)" }) {
  return (
    <div
      style={{
        background: "rgba(88,166,255,.1)",
        border: "1px solid rgba(88,166,255,.25)",
        borderRadius: 6,
        padding: "3px 9px",
        fontSize: 12,
        fontWeight: 700,
        color,
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      +{pts} pt
    </div>
  );
}

function PillGrid({ items }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
        gap: 6,
        marginTop: 10,
      }}
    >
      {items.map(({ label, pts, color }) => (
        <div
          key={label}
          style={{
            background: "rgba(255,255,255,.04)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            padding: "8px 10px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: color || "var(--accent)",
              marginBottom: 3,
            }}
          >
            +{pts}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", lineHeight: 1.3 }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

function Divider() {
  return (
    <div style={{ borderTop: "1px solid var(--border)", margin: "18px 0" }} />
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────

function Rules() {
  return (
    <div>
      <SectionHeader>📋 Spelregels &amp; Puntenschema</SectionHeader>

      <Card>
        <CardTitle>Hoe werkt het?</CardTitle>
        <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.8 }}>
          Voor het WK vul je al jouw voorspellingen in via drie onderdelen:{" "}
          <strong style={{ color: "var(--text)" }}>Extra vragen</strong>,{" "}
          <strong style={{ color: "var(--text)" }}>Groepsfase</strong> en de{" "}
          <strong style={{ color: "var(--text)" }}>KO-fase</strong>. Elke
          correct voorspelde uitslag of vraag levert punten op.
        </div>
      </Card>

      <DeadlinesCard />
      <ExtraQuestionsRules />
      <GroupPhaseRules />
      <KOPhaseRules />
      <TipsCard />
    </div>
  );
}

// ─── DEADLINES ────────────────────────────────────────────────────────────────

function DeadlinesCard() {
  return (
    <>
      <SectionHeader>⏰ Deadlines</SectionHeader>
      <Card>
        <div
          style={{
            fontSize: 12,
            color: "var(--muted)",
            marginBottom: 14,
            lineHeight: 1.6,
          }}
        >
          Elke speelronde sluit op het moment dat de eerste wedstrijd van die
          ronde begint.
        </div>
        {DEADLINES.map(({ label, desc }, i) => (
          <RuleRow
            key={label}
            icon="📅"
            label={label}
            desc={desc}
            noBorder={i === DEADLINES.length - 1}
          />
        ))}
      </Card>
    </>
  );
}

// ─── EXTRA VRAGEN ─────────────────────────────────────────────────────────────

function ExtraQuestionsRules() {
  return (
    <>
      <SectionHeader>🔮 Extra vragen</SectionHeader>
      <Card>
        <RuleRow
          icon="🏆"
          label="Wereldkampioen"
          desc="Voorspel welk land het WK wint."
          pts={PTS_EXTRA.champion}
        />
        <RuleRow
          icon="🇳🇱"
          label="Hoe ver komt Nederland?"
          desc="Voorspel in welke ronde Nederland uitvalt — of kampioen wordt."
          pts={PTS_EXTRA.nlStage}
        />
        <RuleRow
          icon="🟨"
          label="Meeste gele kaarten"
          desc="Welk land heeft aan het einde van het toernooi de meeste gele kaarten ontvangen?"
          pts={PTS_EXTRA.yellowCards}
        />
        <RuleRow
          icon="💥"
          label="Welk topland haalt de achtste finales niet?"
          desc="Kies een van de 12 hoogst geklasseerde landen die de achtste finales niet bereiken — uitgeschakeld in de groepsfase of in de zestiende finales."
          pts={PTS_EXTRA.topOut}
        />
        <RuleRow
          icon="🧤"
          label="Meeste clean sheets"
          desc="Welk land houdt op het hele toernooi de meeste nul? Bij gelijkstand kunnen meerdere landen goed zijn."
          pts={PTS_EXTRA.mostCleanSheets}
        />
        <RuleRow
          icon="⚽"
          label="Meeste doelpunten groepsfase"
          desc="Welk land scoort de meeste doelpunten in de groepsfase? Bij gelijkstand kunnen meerdere landen goed zijn."
          pts={PTS_EXTRA.mostGroupGoals}
          noBorder
        />

        <Divider />

        {/* Topscorers */}
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--text)",
            marginBottom: 4,
          }}
        >
          ⚽ Topscoorders
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--muted)",
            marginBottom: 10,
            lineHeight: 1.5,
          }}
        >
          Kies 3 spelers die jij verwacht bovenaan de topscoorderslijst. Per
          speler verdien je punten op basis van zijn eindplek. Je kunt punten
          verdienen voor meerdere spelers tegelijk.
        </div>
        <PillGrid
          items={[
            { label: "🥇 Gouden schoen", pts: PTS_TOPSCORER_RANK[1] },
            { label: "🥈 Zilveren schoen", pts: PTS_TOPSCORER_RANK[2] },
            { label: "🥉 Bronzen schoen", pts: PTS_TOPSCORER_RANK[3] },
          ]}
        />

        <Divider />

        {/* Verrassing */}
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--text)",
            marginBottom: 4,
          }}
        >
          🌟 Verrassing van het WK
        </div>
        <div
          style={{
            fontSize: 12,
            color: "var(--muted)",
            marginBottom: 10,
            lineHeight: 1.5,
          }}
        >
          Kies een van de 12 laagst geklasseerde landen. Verdien punten op basis
          van hoe ver dit land de KO-fase haalt. Punten worden gegeven voor de
          verste ronde die het land bereikt. De 3e plek levert evenveel op als
          een verliezend halve finalist.
        </div>
        <PillGrid
          items={[
            {
              label: "Zestiende finale",
              pts: PTS_SURPRISE["Zestiende finale"],
            },
            { label: "Achtste finale", pts: PTS_SURPRISE["Achtste finale"] },
            { label: "Kwartfinale", pts: PTS_SURPRISE["Kwartfinale"] },
            { label: "Halve finale", pts: PTS_SURPRISE["Halve finale"] },
            { label: "3e Plaats", pts: PTS_SURPRISE["3e Plaats"] },
            { label: "🏆 Kampioen", pts: PTS_SURPRISE["🏆 Wereldkampioen"] },
          ]}
        />
      </Card>
    </>
  );
}

// ─── GROEPSFASE ───────────────────────────────────────────────────────────────

function GroupPhaseRules() {
  return (
    <>
      <SectionHeader>⚽ Groepsfase</SectionHeader>
      <Card>
        <CardTitle>Wedstrijduitslagen</CardTitle>
        <RuleRow
          label="Exacte uitslag"
          desc="Bv. 2–1 is ook echt 2–1"
          pts={PTS_GROUP.exact}
        />
        <RuleRow
          label="Juist doelpuntenverschil"
          desc="Bv. jij zegt 3–1, het wordt 2–0"
          pts={PTS_GROUP.diff}
        />
        <RuleRow
          label="Juiste winnaar of gelijkspel"
          desc="Je hebt de juiste richting, maar het verschil klopt niet"
          pts={PTS_GROUP.winner}
        />
        <RuleRow
          label="Mis"
          desc="Fout resultaat — geen punten"
          pts={0}
          noBorder
        />

        <Divider />

        <CardTitle>Eindstand in de groep</CardTitle>
        <RuleRow
          label="Team gaat door naar KO-fase"
          desc="Jouw voorspelde top-2 bevat een team dat ook echt doorkomt (maar niet op de juiste plek)"
          pts={PTS_STANDING.qualified}
        />
        <RuleRow
          label="Team doorgaat én op de juiste plek"
          desc="Jouw #1 is ook echt #1, of jouw #2 is ook echt #2 in de groep"
          pts={PTS_STANDING.qualifiedCorrectPos}
          noBorder
        />
        <div
          style={{
            fontSize: 11,
            color: "var(--muted)",
            marginTop: 10,
            lineHeight: 1.5,
          }}
        >
          💡 Bij juiste plek ontvang je{" "}
          <strong style={{ color: "var(--text)" }}>
            {PTS_STANDING.qualifiedCorrectPos} pt
          </strong>{" "}
          in totaal — dit stapelt niet met de {PTS_STANDING.qualified} pt.
        </div>
      </Card>
    </>
  );
}

// ─── KO-FASE ──────────────────────────────────────────────────────────────────

function KOPhaseRules() {
  const rounds = [
    ["Zestiende finale", PTS_KO.r32],
    ["Achtste finale", PTS_KO.r16],
    ["Kwartfinale", PTS_KO.qf],
    ["Halve finale", PTS_KO.sf],
    ["3e Plaats", PTS_KO["3rd"]],
    ["Finale", PTS_KO.final],
  ];

  return (
    <>
      <SectionHeader>⚔️ KO-fase</SectionHeader>
      <Card>
        <CardTitle>Punten per ronde</CardTitle>
        <div
          style={{
            fontSize: 12,
            color: "var(--muted)",
            marginBottom: 14,
            lineHeight: 1.5,
          }}
        >
          Per wedstrijd voorspel je de{" "}
          <strong style={{ color: "var(--text)" }}>winnaar</strong> (W) en de{" "}
          <strong style={{ color: "var(--text)" }}>stand na 90 min.</strong>{" "}
          (S). Klopt het doelsaldo maar niet de exacte uitslag, dan krijg je de{" "}
          <strong style={{ color: "var(--text)" }}>verschil-bonus</strong> (V).
          De exacte stand is een hogere bonus bovenop de winnaar-punten.
        </div>

        {/* Header row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 70px 70px 70px",
            gap: 4,
            padding: "6px 8px",
            background: "rgba(255,255,255,.03)",
            borderRadius: 6,
            marginBottom: 4,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Ronde
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--accent)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              textAlign: "center",
            }}
          >
            W
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--yellow)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              textAlign: "center",
            }}
          >
            V
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "var(--green)",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              textAlign: "center",
            }}
          >
            S
          </div>
        </div>

        {rounds.map(([ronde, schema], i) => (
          <div
            key={ronde}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 70px 70px 70px",
              gap: 4,
              padding: "8px 8px",
              borderBottom:
                i < rounds.length - 1 ? "1px solid var(--border)" : "none",
              alignItems: "center",
            }}
          >
            <div
              style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}
            >
              {ronde}
            </div>
            <div style={{ textAlign: "center" }}>
              <span
                style={{
                  background: "rgba(88,166,255,.1)",
                  border: "1px solid rgba(88,166,255,.25)",
                  borderRadius: 6,
                  padding: "3px 8px",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--accent)",
                }}
              >
                +{schema.winner}
              </span>
            </div>
            <div style={{ textAlign: "center" }}>
              <span
                style={{
                  background: "rgba(210,153,34,.1)",
                  border: "1px solid rgba(210,153,34,.25)",
                  borderRadius: 6,
                  padding: "3px 8px",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--yellow)",
                }}
              >
                +{schema.diff}
              </span>
            </div>
            <div style={{ textAlign: "center" }}>
              <span
                style={{
                  background: "rgba(63,185,80,.1)",
                  border: "1px solid rgba(63,185,80,.25)",
                  borderRadius: 6,
                  padding: "3px 8px",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--green)",
                }}
              >
                +{schema.exact}
              </span>
            </div>
          </div>
        ))}
      </Card>
    </>
  );
}

// ─── TIPS ─────────────────────────────────────────────────────────────────────

function TipsCard() {
  const tips = [
    "Extra vragen en groepsfase sluiten vóór de eerste wedstrijd van elke speelronde.",
    "KO-voorspellingen open zodra de admin dit aanzet; elke ronde kan apart bevroren worden.",
    "Topscoorders: kies 3 spelers — je verdient punten voor iedere speler die in de top 3 eindigt.",
    "Verrassing: punten voor elke KO-ronde die het land haalt (5/10/20/30/40/50 pt).",
    "Topland: een topland telt als 'niet gehaald' als het uitvalt in de groepsfase of de zestiende finales.",
    "Clean sheets & groepsdoelpunten: bij gelijkstand zijn meerdere landen goed.",
    "Klik op een wedstrijd of deelnemer in de stand om te vergelijken.",
  ];

  return (
    <>
      <SectionHeader>💡 Tips</SectionHeader>
      <Card
        style={{
          background: "rgba(88,166,255,.04)",
          border: "1px solid rgba(88,166,255,.15)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {tips.map((tip, i) => (
            <div
              key={i}
              style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
            >
              <span
                style={{
                  fontSize: 12,
                  color: "var(--accent)",
                  fontWeight: 700,
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                ✦
              </span>
              <div
                style={{ fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}
              >
                {tip}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

export { Rules };
