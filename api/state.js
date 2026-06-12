// api/state.js — ES Module syntax (werkt met "type": "module" in package.json)
import { neon } from "@neondatabase/serverless";

function getDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is niet ingesteld.");
  }
  return neon(process.env.DATABASE_URL);
}

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

  if (req.method === "POST") {
    const type = req.query?.type || "admin";

    try {
      await ensureTable(sql);

      // ── type=user: alleen predictions van één gebruiker bijwerken ─────────
      if (type === "user") {
        const { userId, predictions } = req.body || {};
        if (!userId || predictions === undefined) {
          return res
            .status(400)
            .json({ error: "userId en predictions zijn verplicht." });
        }

        const rows = await sql`SELECT data FROM poule_state WHERE id = 1`;
        const existing = rows.length > 0 ? rows[0].data : null;

        if (!existing) {
          return res
            .status(404)
            .json({ error: "Geen state gevonden om bij te werken." });
        }

        const updatedUsers = (existing.users || []).map((u) =>
          u.id === userId ? { ...u, predictions } : u
        );

        const merged = { ...existing, users: updatedUsers };

        await sql`
          INSERT INTO poule_state (id, data, updated_at)
          VALUES (1, ${JSON.stringify(merged)}::jsonb, NOW())
          ON CONFLICT (id)
          DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
        `;

        return res.status(200).json({ ok: true });
      }

      // ── type=register: nieuwe gebruiker toevoegen ─────────────────────────
      if (type === "register") {
        const { user } = req.body || {};
        if (!user || !user.id) {
          return res
            .status(400)
            .json({ error: "user object met id is verplicht." });
        }

        const rows = await sql`SELECT data FROM poule_state WHERE id = 1`;
        const existing = rows.length > 0 ? rows[0].data : null;

        // Eerste registratie ooit — maak een lege state aan
        const base = existing || {
          users: [],
          results: {},
          koResults: {},
          fase: "group",
          groupFrozen: false,
          extraFrozen: false,
          koOpen: false,
          koFrozen: false,
          koFrozenRounds: {
            r32: false,
            r16: false,
            qf: false,
            sf: false,
            "3rd": false,
            final: false,
          },
          competitions: [],
        };

        // Voorkom dubbele registratie
        const alreadyExists = (base.users || []).some((u) => u.id === user.id);
        if (alreadyExists) {
          return res.status(200).json({ ok: true, skipped: true });
        }
        if (type === "userprofile") {
          const { userId, profile } = req.body || {};
          if (!userId || !profile) {
            return res
              .status(400)
              .json({ error: "userId en profile zijn verplicht." });
          }

          const rows = await sql`SELECT data FROM poule_state WHERE id = 1`;
          const existing = rows.length > 0 ? rows[0].data : null;
          if (!existing)
            return res.status(404).json({ error: "Geen state gevonden." });

          const merged = {
            ...existing,
            users: (existing.users || []).map((u) =>
              u.id === userId ? { ...u, ...profile } : u
            ),
          };

          await sql`
            INSERT INTO poule_state (id, data, updated_at)
            VALUES (1, ${JSON.stringify(merged)}::jsonb, NOW())
            ON CONFLICT (id)
            DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
          `;

          return res.status(200).json({ ok: true });
        }
        const merged = { ...base, users: [...(base.users || []), user] };

        await sql`
          INSERT INTO poule_state (id, data, updated_at)
          VALUES (1, ${JSON.stringify(merged)}::jsonb, NOW())
          ON CONFLICT (id)
          DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
        `;

        return res.status(200).json({ ok: true });
      }

      // ── type=admin: volledige state opslaan met user-merge ────────────────
      // (dit was de oorspronkelijke POST-logica)
      {
        const newState = req.body;
        if (!newState || !Array.isArray(newState.users)) {
          return res.status(400).json({ error: "Ongeldige state." });
        }

        const rows = await sql`SELECT data FROM poule_state WHERE id = 1`;
        const existing = rows.length > 0 ? rows[0].data : null;

        let mergedState;

        if (!existing) {
          mergedState = newState;
        } else {
          const existingUsers = Array.isArray(existing.users)
            ? existing.users
            : [];
          const incomingUsers = newState.users;
          const deletedIds = new Set(newState._deletedUserIds || []);

          // Bouw een map van inkomende users op id
          const incomingById = {};
          for (const u of incomingUsers) {
            incomingById[u.id] = u;
          }

          // Bestaande users mergen: verwijderde eruit, gewijzigde bijwerken
          const mergedUsers = existingUsers
            .filter((u) => !deletedIds.has(u.id))
            .map((u) => {
              if (!incomingById[u.id]) return u;
              return {
                ...incomingById[u.id],
                predictions: u.predictions,
              };
            });

          // Nieuwe users toevoegen die nog niet bestonden
          const existingIds = new Set(existingUsers.map((u) => u.id));
          for (const u of incomingUsers) {
            if (!existingIds.has(u.id) && !deletedIds.has(u.id)) {
              mergedUsers.push(u);
            }
          }

          // Strip interne velden uit de payload
          const { _deletedUserIds, ...cleanState } = newState;

          mergedState = { ...cleanState, users: mergedUsers };
        }

        await sql`
          INSERT INTO poule_state (id, data, updated_at)
          VALUES (1, ${JSON.stringify(mergedState)}::jsonb, NOW())
          ON CONFLICT (id)
          DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
        `;

        return res.status(200).json({ ok: true });
      }
    } catch (err) {
      console.error("POST fout:", err);
      return res
        .status(500)
        .json({ error: "Kan state niet opslaan.", detail: err.message });
    }
  }

  return res.status(405).json({ error: "Methode niet toegestaan." });
}
