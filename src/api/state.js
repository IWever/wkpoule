// api/state.js
// Vercel Serverless Function — leest en schrijft de volledige poule state naar Neon Postgres
//
// Vereisten:
//   1. pnpm add @neondatabase/serverless  (of npm install)
//   2. DATABASE_URL environment variable in Vercel (automatisch gezet na `vercel install neon`)
//
// Endpoints:
//   GET  /api/state          → geeft de huidige state terug als JSON
//   POST /api/state          → slaat de nieuwe state op (body = volledige state JSON)

import { neon } from "@neondatabase/serverless";

// Initialiseer de Neon verbinding (hergebruikt per invocatie)
function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is niet ingesteld in de environment variables."
    );
  }
  return neon(process.env.DATABASE_URL);
}

export default async function handler(req, res) {
  // CORS headers zodat de Vite dev server ook kan verbinden
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  let sql;
  try {
    sql = getDb();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

  // ── GET: haal de state op ──────────────────────────────────────────────────
  if (req.method === "GET") {
    try {
      // Zorg dat de tabel bestaat (idempotent)
      await sql`
        CREATE TABLE IF NOT EXISTS poule_state (
          id   INTEGER PRIMARY KEY DEFAULT 1,
          data JSONB   NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      const rows = await sql`SELECT data FROM poule_state WHERE id = 1`;

      if (rows.length === 0) {
        // Eerste keer: nog geen state opgeslagen
        return res.status(200).json(null);
      }

      return res.status(200).json(rows[0].data);
    } catch (err) {
      console.error("GET /api/state fout:", err);
      return res
        .status(500)
        .json({ error: "Kan state niet ophalen.", detail: err.message });
    }
  }

  // ── POST: sla de state op ─────────────────────────────────────────────────
  if (req.method === "POST") {
    try {
      const newState = req.body;

      if (!newState || typeof newState !== "object") {
        return res
          .status(400)
          .json({ error: "Body moet een geldig JSON object zijn." });
      }

      // Valideer minimale structuur
      if (!Array.isArray(newState.users)) {
        return res
          .status(400)
          .json({ error: "State moet een 'users' array bevatten." });
      }

      await sql`
        CREATE TABLE IF NOT EXISTS poule_state (
          id   INTEGER PRIMARY KEY DEFAULT 1,
          data JSONB   NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      // UPSERT: insert als rij 1 niet bestaat, anders update
      await sql`
        INSERT INTO poule_state (id, data, updated_at)
        VALUES (1, ${JSON.stringify(newState)}::jsonb, NOW())
        ON CONFLICT (id)
        DO UPDATE SET
          data       = EXCLUDED.data,
          updated_at = NOW()
      `;

      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error("POST /api/state fout:", err);
      return res
        .status(500)
        .json({ error: "Kan state niet opslaan.", detail: err.message });
    }
  }

  // Andere methodes niet toegestaan
  return res.status(405).json({ error: "Methode niet toegestaan." });
}
