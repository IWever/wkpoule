import React from "react";

import { useState } from "react";
import { ADMIN_PW } from "../data/tournamentData";
import { hash } from "../pouleEngine";
import { S } from "../styles/ui";
import { Alert } from "./common";

function AuthScreen(props) {
  var onLogin = props.onLogin;
  var users = props.users;
  var mode = useState("login");
  var setMode = mode[1];
  mode = mode[0];
  var nameS = useState("");
  var setName = nameS[1];
  nameS = nameS[0];
  var pwS = useState("");
  var setPw = pwS[1];
  pwS = pwS[0];
  var pw2S = useState("");
  var setPw2 = pw2S[1];
  pw2S = pw2S[0];
  var errS = useState("");
  var setErr = errS[1];
  errS = errS[0];

  function doLogin() {
    setErr("");
    var u = users.filter(function (u2) {
      return u2.name.toLowerCase() === nameS.trim().toLowerCase();
    })[0];
    if (!u) {
      setErr("Naam niet gevonden.");
      return;
    }
    if (u.pwHash !== hash(pwS)) {
      setErr("Fout wachtwoord.");
      return;
    }
    onLogin(u.id);
  }
  function doRegister() {
    setErr("");
    if (!nameS.trim()) {
      setErr("Vul een naam in.");
      return;
    }
    if (pwS.length < 4) {
      setErr("Wachtwoord minimaal 4 tekens.");
      return;
    }
    if (pwS !== pw2S) {
      setErr("Wachtwoorden komen niet overeen.");
      return;
    }
    if (
      users.filter(function (u) {
        return u.name.toLowerCase() === nameS.trim().toLowerCase();
      }).length
    ) {
      setErr("Naam al in gebruik.");
      return;
    }
    onLogin(null, { name: nameS.trim(), pw: pwS });
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
            {["login", "register"].map(function (m) {
              return (
                <button
                  key={m}
                  onClick={function () {
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
              );
            })}
          </div>
          <Alert msg={errS} type="error" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              style={S.input}
              placeholder="Jouw naam"
              value={nameS}
              onChange={function (e) {
                setName(e.target.value);
              }}
              onKeyDown={function (e) {
                if (e.key === "Enter" && mode === "login") doLogin();
              }}
            />
            <input
              style={S.input}
              type="password"
              placeholder="Wachtwoord"
              value={pwS}
              onChange={function (e) {
                setPw(e.target.value);
              }}
              onKeyDown={function (e) {
                if (e.key === "Enter" && mode === "login") doLogin();
              }}
            />
            {mode === "register" && (
              <input
                style={S.input}
                type="password"
                placeholder="Herhaal wachtwoord"
                value={pw2S}
                onChange={function (e) {
                  setPw2(e.target.value);
                }}
              />
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
              onClick={function () {
                onLogin("__admin__");
              }}
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

function AdminLogin(props) {
  var onSuccess = props.onSuccess;
  var onCancel = props.onCancel;
  var pwS = useState("");
  var setPw = pwS[1];
  pwS = pwS[0];
  var errS = useState("");
  var setErr = errS[1];
  errS = errS[0];
  function go() {
    if (pwS === ADMIN_PW) onSuccess();
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
        <Alert msg={errS} type="error" />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            style={S.input}
            type="password"
            placeholder="Admin wachtwoord"
            value={pwS}
            onChange={function (e) {
              setPw(e.target.value);
            }}
            onKeyDown={function (e) {
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
          Demo: {ADMIN_PW}
        </p>
      </div>
    </div>
  );
}

// ─── COMPARISON MODALS ────────────────────────────────────────────────────────

export { AuthScreen, AdminLogin };
