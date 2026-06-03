import React, { useState } from "react";
import { ADMIN_PW } from "../data/tournamentData";
import { hash } from "../pouleEngine";
import { S } from "../styles/ui";
import { Alert } from "./common";

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────

function AuthScreen({
  onLogin,
  users,
  competitions: allCompetitions,
  preRegister = false,
  preComp = "",
}) {
  const competitions = allCompetitions.filter((c) => !c.hiddenRegistration);
  const [mode, setMode] = useState(preRegister ? "register" : "login");

  // Pre-selecteer competitie op naam (case-insensitive)
  const preSelectedIds = preComp
    ? allCompetitions
        .filter((c) => c.name.toLowerCase().includes(preComp.toLowerCase()))
        .map((c) => c.id)
    : [];
  const [selectedComps, setSelectedComps] = useState(preSelectedIds);
  const [name, setName] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");

  function doLogin() {
    setErr("");
    const user = users.find(
      (u) => u.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (!user) return setErr("Naam niet gevonden.");
    if (user.pwHash !== hash(pw)) return setErr("Fout wachtwoord.");
    onLogin(user.id);
  }

  function doRegister() {
    setErr("");
    if (!name.trim()) return setErr("Vul een naam in.");
    if (pw.length < 4) return setErr("Wachtwoord minimaal 4 tekens.");
    if (pw !== pw2) return setErr("Wachtwoorden komen niet overeen.");
    if (users.find((u) => u.name.toLowerCase() === name.trim().toLowerCase()))
      return setErr("Naam al in gebruik.");
    if (competitions.length > 0 && selectedComps.length === 0)
      return setErr("Selecteer minimaal één competitie.");
    onLogin(null, { name: name.trim(), pw, competitionIds: selectedComps });
  }

  function toggleComp(id) {
    setSelectedComps((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && mode === "login") doLogin();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d1117",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div style={{ width: "100%", maxWidth: 380 }}>
        <AuthHeader />
        <div style={S.card()}>
          <ModeSwitcher
            mode={mode}
            setMode={(m) => {
              setMode(m);
              setErr("");
            }}
          />
          <Alert msg={err} type="error" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              style={S.input}
              placeholder="Jouw naam"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <input
              style={S.input}
              type="password"
              placeholder="Wachtwoord"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {mode === "register" && (
              <input
                style={S.input}
                type="password"
                placeholder="Herhaal wachtwoord"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
              />
            )}
            {mode === "register" && (
              <CompetitionPicker
                competitions={competitions}
                allCompetitions={allCompetitions}
                selectedComps={selectedComps}
                onToggle={toggleComp}
              />
            )}
            <button
              style={{ ...S.btn(), marginTop: 4 }}
              onClick={mode === "login" ? doLogin : doRegister}
            >
              {mode === "login" ? "Inloggen →" : "Account aanmaken →"}
            </button>
          </div>
          <p
            style={{
              fontSize: 11,
              color: "var(--muted)",
              marginTop: 12,
              textAlign: "center",
            }}
          >
            Bij vragen of suggesties, whatsapp Ingmar
          </p>
          <AdminLoginLink onLogin={onLogin} />
        </div>
      </div>
    </div>
  );
}

function AuthHeader() {
  return (
    <div style={{ textAlign: "center", marginBottom: 32 }}>
      <div style={{ fontSize: 64 }}>🏆</div>
      <div
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 48,
          letterSpacing: "0.06em",
          color: "#fff",
          lineHeight: 1,
        }}
      >
        WK POULE
      </div>
      <div
        style={{
          fontSize: 12,
          color: "var(--muted)",
          letterSpacing: "0.14em",
          marginTop: 6,
        }}
      >
        WORLD CUP 2026
      </div>
    </div>
  );
}

function ModeSwitcher({ mode, setMode }) {
  return (
    <div
      style={{
        display: "flex",
        marginBottom: 20,
        background: "var(--bg)",
        borderRadius: 8,
        padding: 3,
      }}
    >
      {["login", "register"].map((m) => (
        <button
          key={m}
          onClick={() => setMode(m)}
          style={{
            flex: 1,
            padding: "8px",
            background: mode === m ? "var(--accent)" : "none",
            color: mode === m ? "#fff" : "var(--muted)",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 13,
            fontFamily: "var(--font)",
          }}
        >
          {m === "login" ? "Inloggen" : "Registreren"}
        </button>
      ))}
    </div>
  );
}

function CompetitionPicker({
  competitions,
  allCompetitions,
  selectedComps,
  onToggle,
}) {
  if (competitions.length > 0) {
    return (
      <div>
        <div
          style={{
            fontSize: 12,
            color: "var(--muted)",
            marginBottom: 8,
            marginTop: 4,
          }}
        >
          Kies je competitie(s):
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {competitions.map((c) => {
            const selected = selectedComps.includes(c.id);
            return (
              <button
                key={c.id}
                onClick={() => onToggle(c.id)}
                style={{
                  padding: "9px 14px",
                  borderRadius: 8,
                  textAlign: "left",
                  border: `2px solid ${
                    selected ? "var(--accent)" : "var(--border)"
                  }`,
                  background: selected ? "rgba(88,166,255,.12)" : "var(--bg)",
                  color: selected ? "var(--accent)" : "var(--text)",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: selected ? 700 : 400,
                  fontFamily: "var(--font)",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span style={{ fontSize: 16 }}>{selected ? "✓" : "○"}</span>
                {c.name}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (allCompetitions.length > 0) {
    return (
      <div
        style={{
          fontSize: 12,
          color: "var(--muted)",
          fontStyle: "italic",
          padding: "6px 0",
        }}
      >
        Er zijn op dit moment geen competities beschikbaar voor registratie.
      </div>
    );
  }

  return (
    <div
      style={{
        fontSize: 12,
        color: "var(--muted)",
        fontStyle: "italic",
        padding: "6px 0",
      }}
    >
      Nog geen competities aangemaakt — de admin maakt competities aan in het
      admin paneel.
    </div>
  );
}

function AdminLoginLink({ onLogin }) {
  return (
    <div
      style={{
        marginTop: 14,
        borderTop: "1px solid var(--border)",
        paddingTop: 12,
        textAlign: "center",
      }}
    >
      <button
        onClick={() => onLogin("__admin__")}
        style={{
          background: "none",
          border: "1px solid var(--border)",
          borderRadius: 6,
          color: "var(--muted)",
          padding: "6px 14px",
          cursor: "pointer",
          fontSize: 12,
          fontFamily: "var(--font)",
        }}
      >
        ⚙️ Admin inloggen
      </button>
    </div>
  );
}

// ─── ADMIN LOGIN ──────────────────────────────────────────────────────────────

function AdminLogin({ onSuccess, onCancel }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  function go() {
    if (pw === ADMIN_PW) onSuccess();
    else setErr("Fout wachtwoord.");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d1117",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <div style={{ width: "100%", maxWidth: 340, ...S.card(), padding: 28 }}>
        <div style={{ fontSize: 36, textAlign: "center", marginBottom: 12 }}>
          🔐
        </div>
        <div
          style={{
            textAlign: "center",
            fontWeight: 700,
            fontSize: 18,
            marginBottom: 20,
          }}
        >
          Admin toegang
        </div>
        <Alert msg={err} type="error" />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            style={S.input}
            type="password"
            placeholder="Admin wachtwoord"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && go()}
          />
          <button style={S.btn("var(--orange)")} onClick={go}>
            Inloggen
          </button>
          <button
            style={{
              background: "none",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "9px",
              color: "var(--muted)",
              cursor: "pointer",
              fontSize: 13,
              fontFamily: "var(--font)",
            }}
            onClick={onCancel}
          >
            Terug
          </button>
        </div>
        <p
          style={{
            fontSize: 11,
            color: "var(--muted)",
            marginTop: 12,
            textAlign: "center",
          }}
        >
          Bij vragen of suggesties, whatsapp Ingmar
        </p>
      </div>
    </div>
  );
}

export { AuthScreen, AdminLogin };
