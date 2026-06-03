import React, { useState } from "react";
import { hash } from "../pouleEngine";
import { S } from "../styles/ui";
import { Alert } from "./common";

function ChangePasswordScreen({ user, onSave }) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [err, setErr] = useState("");

  function submit() {
    setErr("");
    if (pw.length < 4) return setErr("Wachtwoord minimaal 4 tekens.");
    if (pw !== pw2) return setErr("Wachtwoorden komen niet overeen.");
    onSave(pw);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d1117",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
      fontFamily: "'Barlow', sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 48 }}>🔑</div>
          <div style={{
            fontFamily: "var(--font-display)",
            fontSize: 28,
            letterSpacing: "0.06em",
            color: "#fff",
            lineHeight: 1,
            marginTop: 8,
          }}>
            NIEUW WACHTWOORD
          </div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 8 }}>
            Hoi {user.name}, kies een nieuw wachtwoord om verder te gaan.
          </div>
        </div>

        <div style={S.card()}>
          <Alert msg={err} type="error" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              style={S.input}
              type="password"
              placeholder="Nieuw wachtwoord"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              autoFocus
            />
            <input
              style={S.input}
              type="password"
              placeholder="Herhaal wachtwoord"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
            <button
              style={{ ...S.btn("var(--accent)"), marginTop: 4 }}
              onClick={submit}
            >
              Wachtwoord opslaan →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { ChangePasswordScreen };