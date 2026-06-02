import React from "react";
import {
  PTS_GROUP,
  PTS_STANDING,
  PTS_KO,
  PTS_EXTRA,
  PTS_SURPRISE,
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

      <ExtraQuestionsRules />
      <GroupPhaseRules />
      <KOPhaseRules />
      <TipsCard />
    </div>
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
        {[
          [
            "🏆 Wereldkampioen",
            "Voorspel welk land het WK wint.",
            PTS_EXTRA.champion,
          ],
          [
            "⚽ Topscorer",
            "Kies een land en vervolgens de speler die de meeste doelpunten scoort.",
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
          <RuleRow key={title} title={title} desc={desc} pts={pts} />
        ))}

        {/* Surprise team special scoring */}
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
    </>
  );
}

function GroupPhaseRules() {
  return (
    <>
      <SubTitle>⚽ Groepsfase</SubTitle>
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
        ✦ Extra vragen en groepsfase moeten voor het toernooi ingevuld zijn —
        daarna worden ze bevroren.
      </div>
      <div>✦ KO-voorspellingen open zodra de admin dit aanzet.</div>
      <div>✦ Elke KO-ronde kan apart bevroren worden.</div>
      <div>✦ Groep F (Nederland) heeft een oranje accent.</div>
      <div>
        ✦ Klik op een wedstrijd of deelnemer in de stand om te vergelijken.
      </div>
    </div>
  );
}

export { Rules };
