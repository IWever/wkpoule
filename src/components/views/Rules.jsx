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

function Rules() {
  return (
    <div>
      <SectionTitle>📋 Spelregels & Puntenschema</SectionTitle>

      <div style={{ ...S.card(), marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>
          Hoe werkt het?
        </div>
        <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.8 }}>
          Voor het WK vul je al jouw voorspellingen in via drie onderdelen:{" "}
          <strong style={{ color: "var(--text)" }}>Extra vragen</strong>,{" "}
          <strong style={{ color: "var(--text)" }}>Groepsfase</strong> en de{" "}
          <strong style={{ color: "var(--text)" }}>KO-fase</strong>.
        </div>
      </div>

      <DeadlinesCard />
      <ExtraQuestionsRules />
      <GroupPhaseRules />
      <KOPhaseRules />
      <TipsCard />
    </div>
  );
}

// ─── DEADLINES CARD ───────────────────────────────────────────────────────────

function DeadlinesCard() {
  const rows = [
    {
      label: "Extra vragen & Groepsfase ronde 1",
      desc: "vóór aanvang eerste wedstrijd (11 jun 21:00)",
    },
    {
      label: "Zestiende finales",
      desc: "vóór aanvang zestiende finales (28 jun 21:00)",
    },
    {
      label: "Achtste finales",
      desc: "vóór aanvang achtste finales (4 jul 19:00)",
    },
    { label: "Kwartfinales", desc: "vóór aanvang kwartfinales (9 jul 22:00)" },
    {
      label: "Halve finales",
      desc: "vóór aanvang halve finales (14 jul 21:00)",
    },
    {
      label: "Finale en 3e plaats",
      desc: "vóór aanvang finale (18 jul 23:00)",
    },
  ];

  return (
    <>
      <SubTitle>⏰ Deadlines</SubTitle>
      <div style={{ ...S.card(), marginBottom: 14 }}>
        <div
          style={{
            fontSize: 12,
            color: "var(--muted)",
            marginBottom: 12,
            lineHeight: 1.6,
          }}
        >
          Elke speelronde sluit op het moment dat de eerste wedstrijd van die
          ronde begint.
        </div>
        {rows.map(({ label, desc }, i) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              paddingBottom: 8,
              marginBottom: 8,
              borderBottom:
                i < rows.length - 1 ? "1px solid var(--border)" : "none",
            }}
          >
            <span style={{ fontSize: 16, marginTop: 1 }}>📅</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{label}</div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── SECTION COMPONENTS ───────────────────────────────────────────────────────

function SectionTitle({ children }) {
  return (
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
      {children}
    </div>
  );
}

function SubTitle({ children }) {
  return (
    <div
      style={{
        fontWeight: 700,
        fontSize: 14,
        color: "var(--accent)",
        marginBottom: 10,
      }}
    >
      {children}
    </div>
  );
}

function RuleRow({ title, desc, pts, noBorder }) {
  return (
    <div
      style={{
        borderBottom: noBorder ? "none" : "1px solid var(--border)",
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
        {pts !== undefined && (
          <span
            style={{ color: "var(--accent)", fontWeight: 700, fontSize: 12 }}
          >
            +{pts} pt
          </span>
        )}
      </div>
      <div style={{ fontSize: 12, color: "var(--muted)" }}>{desc}</div>
    </div>
  );
}

function ExtraQuestionsRules() {
  return (
    <>
      <SubTitle>🔮 Extra vragen</SubTitle>
      <div style={{ ...S.card(), marginBottom: 14 }}>
        <RuleRow
          title="🏆 Wereldkampioen"
          desc="Voorspel welk land het WK wint."
          pts={PTS_EXTRA.champion}
        />
        <RuleRow
          title="🇳🇱 Hoe ver komt Nederland?"
          desc="Voorspel in welke ronde Nederland uitvalt — of kampioen wordt."
          pts={PTS_EXTRA.nlStage}
        />
        <RuleRow
          title="🟨 Meeste gele kaarten"
          desc="Welk land heeft aan het einde van het toernooi de meeste gele kaarten ontvangen?"
          pts={PTS_EXTRA.yellowCards}
        />
        <RuleRow
          title="💥 Welk topland valt af?"
          desc="Kies een van de 12 hoogst geklasseerde landen die toch niet verder komt dan de groepsfase."
          pts={PTS_EXTRA.topOut}
        />

        {/* Topscorer special card */}
        <div
          style={{
            borderBottom: "1px solid var(--border)",
            paddingBottom: 12,
            marginBottom: 10,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6 }}>
            ⚽ Topscoorders
          </div>
          <div
            style={{ fontSize: 12, color: "var(--muted)", marginBottom: 10 }}
          >
            Kies 3 spelers die jij verwacht bovenaan de topscoorderslijst. Per
            speler verdien je punten op basis van zijn eindplek:
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              {
                rank: 1,
                label: "🥇 Goudschoener (1e)",
                pts: PTS_TOPSCORER_RANK[1],
              },
              {
                rank: 2,
                label: "🥈 Zilveren schoen (2e)",
                pts: PTS_TOPSCORER_RANK[2],
              },
              {
                rank: 3,
                label: "🥉 Bronzen schoen (3e)",
                pts: PTS_TOPSCORER_RANK[3],
              },
            ].map(({ rank, label, pts }) => (
              <div
                key={rank}
                style={{
                  background: "rgba(88,166,255,.08)",
                  border: "1px solid rgba(88,166,255,.2)",
                  borderRadius: 8,
                  padding: "8px 12px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  flex: 1,
                  minWidth: 90,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    textAlign: "center",
                  }}
                >
                  {label}
                </span>
                <span
                  style={{
                    fontSize: 16,
                    color: "var(--accent)",
                    fontWeight: 900,
                  }}
                >
                  +{pts} pt
                </span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 8 }}>
            💡 Je kunt punten verdienen voor meerdere spelers tegelijk —
            maximaal 3 keuzes.
          </div>
        </div>

        {/* Surprise team special scoring */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
            🌟 Verrassing van het WK
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>
            Kies een van de 12 laagst geklasseerde landen. Punten op basis van
            hoe ver dit land de KO-fase haalt. De 3e plek levert evenveel punten
            op als de halve finale.
          </div>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {[
              ["Zestiende finale", PTS_SURPRISE["Zestiende finale"]],
              ["Achtste finale", PTS_SURPRISE["Achtste finale"]],
              ["Kwartfinale", PTS_SURPRISE["Kwartfinale"]],
              ["Halve finale", PTS_SURPRISE["Halve finale"]],
              ["🏆 Kampioen", PTS_SURPRISE["🏆 Wereldkampioen"]],
            ].map(([s, p]) => (
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
                <span style={{ fontSize: 10, color: "var(--muted)" }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function GroupPhaseRules() {
  return (
    <>
      <SubTitle>⚽ Groepsfase</SubTitle>
      <div style={{ ...S.card(), marginBottom: 14 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--muted)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 8,
          }}
        >
          Wedstrijduitslagen
        </div>
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

        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--muted)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 8,
            marginTop: 4,
          }}
        >
          Eindstand in de groep
        </div>
        <div
          style={{
            background: "rgba(88,166,255,.06)",
            border: "1px solid rgba(88,166,255,.2)",
            borderRadius: 8,
            padding: "10px 12px",
            marginBottom: 4,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>
                Team gaat door naar KO-fase
              </div>
              <div
                style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}
              >
                Jouw voorspelde top-2 bevat een team dat ook echt doorkomt (maar
                niet op de juiste plek)
              </div>
            </div>
            <div
              style={{
                fontWeight: 900,
                fontSize: 18,
                color: "var(--accent)",
                minWidth: 40,
                textAlign: "right",
              }}
            >
              +{PTS_STANDING.qualified}
            </div>
          </div>
          <div
            style={{
              borderTop: "1px solid rgba(88,166,255,.2)",
              paddingTop: 8,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>
                Team doorgaat én op de juiste plek
              </div>
              <div
                style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}
              >
                Jouw #1 is ook echt #1, of jouw #2 is ook echt #2 in de groep
              </div>
            </div>
            <div
              style={{
                fontWeight: 900,
                fontSize: 18,
                color: "var(--green)",
                minWidth: 40,
                textAlign: "right",
              }}
            >
              +{PTS_STANDING.qualifiedCorrectPos}
            </div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>
          💡 Bij juiste plek ontvang je{" "}
          <strong style={{ color: "var(--green)" }}>
            {PTS_STANDING.qualifiedCorrectPos} pt
          </strong>{" "}
          in totaal (niet stapelend met de {PTS_STANDING.qualified} pt).
        </div>
      </div>
    </>
  );
}

function KOPhaseRules() {
  return (
    <>
      <SubTitle>⚔️ KO-fase</SubTitle>
      <div style={{ ...S.card(), marginBottom: 14 }}>
        {[
          ["Zestiende finale", PTS_KO.r32],
          ["Achtste finale", PTS_KO.r16],
          ["Kwartfinale", PTS_KO.qf],
          ["Halve finale", PTS_KO.sf],
          ["3e Plaats", PTS_KO["3rd"]],
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
    </>
  );
}

function TipsCard() {
  return (
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
        ✦ Extra vragen en groepsfase sluiten vóór de eerste wedstrijd van elke
        speelronde.
      </div>
      <div>
        ✦ KO-voorspellingen open zodra de admin dit aanzet; elke ronde kan apart
        bevroren worden.
      </div>
      <div>
        ✦ Topscoorders: kies 3 spelers — je verdient punten voor iedere speler
        die in de top 3 eindigt.
      </div>
      <div>
        ✦ Bij verrassing: 3e plek levert evenveel punten op als halve finale (30
        pt).
      </div>
      <div>
        ✦ Klik op een wedstrijd of deelnemer in de stand om te vergelijken.
      </div>
    </div>
  );
}

export { Rules };
