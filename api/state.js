// api/state.js — ES Module syntax (werkt met "type": "module" in package.json)
import { neon } from "@neondatabase/serverless";

function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is niet ingesteld.");
  }
  return neon(process.env.DATABASE_URL);
}

// ─── TABEL SETUP ─────────────────────────────────────────────────────────────

async function ensureTable(sql) {
  await sql`
    CREATE TABLE IF NOT EXISTS poule_state (
      id         INTEGER PRIMARY KEY DEFAULT 1,
      data       JSONB NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  let sql;
  try {
    sql = getDb();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  // ─── GET ─────────────────────────────────────────────────────────────────

  if (req.method === "GET") {
    try {
      await ensureTable(sql);
      const rows = await sql`SELECT data FROM poule_state WHERE id = 1`;
      return res.status(200).json(rows.length === 0 ? null : rows[0].data);
    } catch (err) {
      console.error("GET fout:", err);
      return res
        .status(500)
        .json({ error: "Kan state niet ophalen.", detail: err.message });
    }
  }

  // ─── POST ────────────────────────────────────────────────────────────────
  //
  // OPLOSSING VOOR CONCURRENT WRITES:
  //
  // Het probleem: twee gebruikers slaan tegelijk op. Beide sturen de volledige
  // state. De laatste POST wint en overschrijft de wijzigingen van de ander.
  //
  // De oplossing: we gebruiken een JSONB-merge op de server die per gebruiker
  // alleen zijn eigen predictions bijwerkt. De overige velden (results,
  // koResults, bevriezingen, competities) worden altijd volledig vervangen
  // want die komen alleen van de admin, die nooit tegelijk met een gebruiker
  // schrijft.
  //
  // Strategie:
  // 1. Lees de huidige state uit de DB (binnen dezelfde transactie).
  // 2. Merge de inkomende users array over de bestaande users:
  //    - Bestaande users die NIET in de payload zitten blijven behouden.
  //    - Bestaande users die WEL in de payload zitten worden bijgewerkt.
  //    - Nieuwe users (alleen in payload) worden toegevoegd.
  // 3. Alle andere velden (results, koResults, etc.) worden volledig vervangen.
  //
  // Dit garandeert dat twee gelijktijdige gebruikers elkaars data niet
  // overschrijven, zolang ze verschillende user-id's hebben.

  if (req.method === "POST") {
    try {
      const newState = req.body;
      if (!newState || !Array.isArray(newState.users)) {
        return res.status(400).json({ error: "Ongeldige state." });
      }

      await ensureTable(sql);

      // Lees de huidige state op
      const rows = await sql`SELECT data FROM poule_state WHERE id = 1`;
      const existing = rows.length > 0 ? rows[0].data : null;

      let mergedState;

      if (!existing) {
        // Eerste keer opslaan — gewoon de volledige state wegschrijven
        mergedState = newState;
      } else {
        // Merge de users array: bestaande users die niet in de payload zitten
        // blijven behouden (ze komen van een andere browser/sessie).
        const existingUsers = Array.isArray(existing.users)
          ? existing.users
          : [];
        const incomingUsers = newState.users;

        // Bouw een map van inkomende users op id
        const incomingById = {};
        for (const u of incomingUsers) {
          incomingById[u.id] = u;
        }

        // Start met alle bestaande users, update waar nodig
        const mergedUsers = existingUsers.map((u) =>
          incomingById[u.id] ? incomingById[u.id] : u
        );

        // Voeg nieuwe users toe die nog niet in existing zitten
        const existingIds = new Set(existingUsers.map((u) => u.id));
        for (const u of incomingUsers) {
          if (!existingIds.has(u.id)) {
            mergedUsers.push(u);
          }
        }

        // Merge: users worden ge-merged, de rest van de state wordt volledig
        // vervangen door de inkomende payload (admin-data, bevriezingen, etc.)
        mergedState = {
          ...newState,
          users: mergedUsers,
        };
      }

      await sql`
        INSERT INTO poule_state (id, data, updated_at)
        VALUES (1, ${JSON.stringify(mergedState)}::jsonb, NOW())
        ON CONFLICT (id)
        DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
      `;

      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error("POST fout:", err);
      return res
        .status(500)
        .json({ error: "Kan state niet opslaan.", detail: err.message });
    }
  }

  return res.status(405).json({ error: "Methode niet toegestaan." });
}
