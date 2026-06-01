import React, { useState } from "react";
import { ADMIN_PW } from "../data/tournamentData";
import { hash } from "../pouleEngine";
import { S } from "../styles/ui";
import { Alert } from "./common";

function AuthScreen({ onLogin, users, competitions: allCompetitions }) {
  // Only show competitions that are not hidden for registration
  const competitions = allCompetitions.filter((c) => !c.hiddenRegistration);

  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [selectedComps, setSelectedComps] = useState([]);
  const [err, setErr] = useState("");

  function doLogin() {
    setErr("");
    const u = users.find(
      (u) => u.name.toLowerCase() === name.trim().toLowerCase()
    );
    if (!u) {
      setErr("Naam niet gevonden.");
      return;
    }
    if (u.pwHash !== hash(pw)) {
      setErr("Fout wachtwoord.");
      return;
    }
    onLogin(u.id);
  }

  function doRegister() {
    setErr("");
    if (!name.trim()) {
      setErr("Vul een naam in.");
      return;
    }
    if (pw.length < 4) {
      setErr("Wachtwoord minimaal 4 tekens.");
      return;
    }
    if (pw !== pw2) {
      setErr("Wachtwoorden komen niet overeen.");
      return;
    }
    if (users.find((u) => u.name.toLowerCase() === name.trim().toLowerCase())) {
      setErr("Naam al in gebruik.");
      return;
    }
    if (competitions.length > 0 && selectedComps.length === 0) {
      setErr("Selecteer minimaal één competitie.");
      return;
    }
    onLogin(null, { name: name.trim(), pw, competitionIds: selectedComps });
  }

  function toggleComp(id) {
    setSelectedComps((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
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
      <div style={{ width: "100%", maxWidth: 380 }}>
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
        <div style={S.card()}>
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
                onClick={() => {
                  setMode(m);
                  setErr("");
                }}
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

          <Alert msg={err} type="error" />

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              style={S.input}
              placeholder="Jouw naam"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && mode === "login") doLogin();
              }}
            />
            <input
              style={S.input}
              type="password"
              placeholder="Wachtwoord"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && mode === "login") doLogin();
              }}
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

            {mode === "register" && competitions.length > 0 && (
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
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  {competitions.map((c) => {
                    const selected = selectedComps.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        onClick={() => toggleComp(c.id)}
                        style={{
                          padding: "9px 14px",
                          borderRadius: 8,
                          textAlign: "left",
                          border: `2px solid ${
                            selected ? "var(--accent)" : "var(--border)"
                          }`,
                          background: selected
                            ? "rgba(88,166,255,.12)"
                            : "var(--bg)",
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
                        <span style={{ fontSize: 16 }}>
                          {selected ? "✓" : "○"}
                        </span>
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {mode === "register" &&
              competitions.length === 0 &&
              allCompetitions.length > 0 && (
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    fontStyle: "italic",
                    padding: "6px 0",
                  }}
                >
                  Er zijn op dit moment geen competities beschikbaar voor
                  registratie.
                </div>
              )}

            {mode === "register" && allCompetitions.length === 0 && (
              <div
                style={{
                  fontSize: 12,
                  color: "var(--muted)",
                  fontStyle: "italic",
                  padding: "6px 0",
                }}
              >
                Nog geen competities aangemaakt — de admin maakt competities aan
                in het admin paneel.
              </div>
            )}

            <button
              style={{ ...S.btn(), marginTop: 4 }}
              onClick={mode === "login" ? doLogin : doRegister}
            >
              {mode === "login" ? "Inloggen →" : "Account aanmaken →"}
            </button>
          </div>

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
        </div>
      </div>
    </div>
  );
}

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
            onKeyDown={(e) => {
              if (e.key === "Enter") go();
            }}
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
