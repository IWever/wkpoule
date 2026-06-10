// persist-helpers.js
// Gesplitste write-paden zodat gelijktijdige writes elkaar niet overschrijven.
//
//   persistUserPredictions(userId, predictions)
//     → POST /api/state?type=user
//     Alleen de predictions van één gebruiker bijwerken.
//     Raakt NOOIT aan andere users of admin-data.
//
//   persistRegister(user)
//     → POST /api/state?type=register
//     Één nieuwe user toevoegen.
//     Raakt NOOIT aan bestaande users of admin-data.
//
//   persistAdmin(data, deletedUserIds?)
//     → POST /api/state?type=admin
//     Volledige admin-state opslaan (results, koResults, bevriezingen, etc.)
//     Users worden server-side ge-merged zodat registraties tijdens admin-writes
//     niet verloren gaan. Geef deletedUserIds mee voor bewuste verwijderingen.

const IS_DEV = import.meta?.env?.DEV ?? false;

// ─── DEV FALLBACK ─────────────────────────────────────────────────────────────

function devSave(data) {
  try {
    const KEY = "wk_poule_v12";
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {}
  return true;
}

// ─── GEBRUIKER: alleen predictions bijwerken ─────────────────────────────────

export async function persistUserPredictions(userId, predictions) {
  if (IS_DEV) return devSave({ _dev: true });
  try {
    const res = await fetch("/api/state?type=user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, predictions }),
    });
    if (!res.ok) {
      console.error("persistUserPredictions fout:", res.status);
      return false;
    }
    return true;
  } catch (err) {
    console.error("persistUserPredictions netwerk fout:", err);
    return false;
  }
}

// ─── REGISTRATIE: nieuwe gebruiker toevoegen ─────────────────────────────────

export async function persistRegister(user) {
  if (IS_DEV) return devSave({ _dev: true });
  try {
    const res = await fetch("/api/state?type=register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.error("persistRegister fout:", res.status, body);
      return false;
    }
    return true;
  } catch (err) {
    console.error("persistRegister netwerk fout:", err);
    return false;
  }
}

// ─── GEBRUIKERSPROFIEL: wachtwoord bijwerken ──────────────────────────────

export async function persistUserProfile(userId, profile) {
  if (IS_DEV) return devSave({ _dev: true });
  try {
    const res = await fetch("/api/state?type=userprofile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, profile }),
    });
    if (!res.ok) {
      console.error("persistUserProfile fout:", res.status);
      return false;
    }
    return true;
  } catch (err) {
    console.error("persistUserProfile netwerk fout:", err);
    return false;
  }
}

// ─── ADMIN: volledige state opslaan ──────────────────────────────────────────
// Optioneel: geef deletedUserIds mee zodat de server weet welke users bewust
// verwijderd zijn (ipv registraties die tijdens de write plaatsvonden).

export async function persistAdmin(data, deletedUserIds = []) {
  if (IS_DEV) return devSave(data);
  try {
    const payload =
      deletedUserIds.length > 0
        ? { ...data, _deletedUserIds: deletedUserIds }
        : data;
    const res = await fetch("/api/state?type=admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      console.error("persistAdmin fout:", res.status);
      return false;
    }
    return true;
  } catch (err) {
    console.error("persistAdmin netwerk fout:", err);
    return false;
  }
}
