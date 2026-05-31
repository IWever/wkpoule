// api/state.cjs
// Vercel Serverless Function (CommonJS formaat — werkt naast Vite's ES module setup)

const { neon } = require("@neondatabase/serverless");

function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is niet ingesteld.");
  }
  return neon(process.env.DATABASE_URL);
}

module.exports = async function handler(req, res) {
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

  // ── GET ──────────────────────────────────────────────────────────────────
  if (req.method === "GET") {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS poule_state (
          id         INTEGER PRIMARY KEY DEFAULT 1,
          data       JSONB NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;
      const rows = await sql`SELECT data FROM poule_state WHERE id = 1`;
      return res.status(200).json(rows.length === 0 ? null : rows[0].data);
    } catch (err) {
      console.error("GET fout:", err);
      return res
        .status(500)
        .json({ error: "Kan state niet ophalen.", detail: err.message });
    }
  }

  // ── POST ─────────────────────────────────────────────────────────────────
  if (req.method === "POST") {
    try {
      const newState = req.body;
      if (!newState || !Array.isArray(newState.users)) {
        return res.status(400).json({ error: "Ongeldige state." });
      }

      await sql`
        CREATE TABLE IF NOT EXISTS poule_state (
          id         INTEGER PRIMARY KEY DEFAULT 1,
          data       JSONB NOT NULL,
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;

      await sql`
        INSERT INTO poule_state (id, data, updated_at)
        VALUES (1, ${JSON.stringify(newState)}::jsonb, NOW())
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
};
