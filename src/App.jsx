import React, { useState, useEffect, useCallback } from "react";
import { load, persist, hash, blank, saveSession, loadSession } from "./pouleEngine";
import { AuthScreen, AdminLogin } from "./components/auth";
import {
  GroupPredictionsForm,
  ExtraPredictionsForm,
  KOPredictionsForm,
} from "./components/forms";
import {
  MyOverview,
  Rules,
  StandWithCompare,
  AdminPanel,
} from "./components/views";

function LoadingScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d1117",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        fontFamily: "'Barlow', sans-serif",
        color: "#8b949e",
      }}
    >
      <div style={{ fontSize: 48 }}>⚽</div>
      <div style={{ fontSize: 14, letterSpacing: "0.1em" }}>LADEN…</div>
    </div>
  );
}

function ErrorScreen({ onRetry }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d1117",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        fontFamily: "'Barlow', sans-serif",
        color: "#e6edf3",
        padding: 20,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 48 }}>⚠️</div>
      <div style={{ fontWeight: 700, fontSize: 18 }}>Verbindingsfout</div>
      <div style={{ color: "#8b949e", fontSize: 14, maxWidth: 320 }}>
        Kan de poule-data niet ophalen. Controleer je internetverbinding en
        probeer opnieuw.
      </div>
      <button
        onClick={onRetry}
        style={{
          background: "#58a6ff",
          color: "#fff",
          border: "none",
          borderRadius: 8,
          padding: "10px 24px",
          fontSize: 14,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "'Barlow', sans-serif",
          marginTop: 8,
        }}
      >
        Opnieuw proberen
      </button>
    </div>
  );
}

export default function App() {
  const [loadStatus, setLoadStatus] = useState("loading");
  const [state, setState] = useState(null);
  const [session, setSession] = useState(null);
  const [screen, setScreen] = useState("overview");
  const [adminStep, setAdminStep] = useState(false);
  const [mainTab, setMainTab] = useState("overview");

  const loadState = useCallback(async () => {
    setLoadStatus("loading");
    try {
      const loaded = await load();
      setState(loaded || blank());
      setLoadStatus("ready");
    } catch (err) {
      console.error("Laden mislukt:", err);
      setLoadStatus("error");
    }
  }, []);

  useEffect(() => {
    loadState();
  }, [loadState]);

  // Restore session from localStorage after state is loaded
  useEffect(() => {
    if (loadStatus !== "ready" || !state) return;
    const saved = loadSession();
    if (!saved) return;
    if (saved === "__admin__") {
      setSession("__admin__");
      return;
    }
    // Verify user still exists
    const userExists = state.users.find((u) => u.id === saved);
    if (userExists) {
      setSession(saved);
      setScreen("overview");
    }
  }, [loadStatus]); // Only run once after initial load

  const setAndPersist = useCallback((updater) => {
    setState((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      persist(next).catch((err) => console.error("Opslaan mislukt:", err));
      return next;
    });
  }, []);

  if (loadStatus === "loading") return <LoadingScreen />;
  if (loadStatus === "error") return <ErrorScreen onRetry={loadState} />;

  const currentUser =
    session && session !== "__admin__"
      ? state.users.find((u) => u.id === session)
      : null;

  const handleLogin = (userId, newUser) => {
    if (userId === "__admin__") {
      setAdminStep(true);
      return;
    }
    if (newUser) {
      const id = "u_" + Date.now();
      const user = {
        id,
        name: newUser.name,
        pwHash: hash(newUser.pw),
        pwPlain: newUser.pw,
        predictions: {},
        locked: false,
        competitionIds: newUser.competitionIds || [],
      };
      setAndPersist((s) => ({ ...s, users: [...s.users, user] }));
      setSession(id);
      saveSession(id);
      setScreen("editGroup");
      return;
    }
    setSession(userId);
    saveSession(userId);
    setScreen("overview");
  };

  const savePred = (pred) => {
    setAndPersist((s) => ({
      ...s,
      users: s.users.map((u) =>
        u.id === session ? { ...u, predictions: pred } : u
      ),
    }));
  };

  const logout = () => {
    setSession(null);
    saveSession(null);
    setScreen("overview");
    setAdminStep(false);
    setMainTab("overview");
  };

  const fonts = (
    <link
      href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600;700;900&display=swap"
      rel="stylesheet"
    />
  );
  const styleTag = (
    <style>{`
    :root {
      --bg: #0d1117; --card: #161b22; --card2: #1c2330; --border: #30363d;
      --text: #e6edf3; --muted: #8b949e; --accent: #58a6ff; --gold: #D4AF37;
      --green: #3fb950; --red: #f85149; --orange: #f0883e;
      --font: 'Barlow', sans-serif; --font-display: 'Bebas Neue', cursive;
    }
    * { box-sizing: border-box; }
    input::placeholder { color: var(--muted); }
    select option { background: #161b22; }
    input[type=number]::-webkit-inner-spin-button { opacity: 1; }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
  `}</style>
  );

  if (adminStep && !session) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0d1117",
          color: "#e6edf3",
          fontFamily: "'Barlow', sans-serif",
        }}
      >
        {styleTag}
        {fonts}
        <AdminLogin
          onSuccess={() => {
            setAdminStep(false);
            setSession("__admin__");
            saveSession("__admin__");
          }}
          onCancel={() => setAdminStep(false)}
        />
      </div>
    );
  }

  if (!session) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#0d1117",
          color: "#e6edf3",
          fontFamily: "'Barlow', sans-serif",
        }}
      >
        {styleTag}
        {fonts}
        <AuthScreen
          onLogin={handleLogin}
          users={state.users}
          competitions={state.competitions || []}
        />
      </div>
    );
  }

  const isAdmin = session === "__admin__";
  const updatedUser = currentUser
    ? state.users.find((u) => u.id === session)
    : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d1117",
        color: "#e6edf3",
        fontFamily: "'Barlow', sans-serif",
      }}
    >
      {styleTag}
      {fonts}

      {/* HEADER */}
      <div
        style={{
          background: "linear-gradient(135deg,#0d2137 0%,#0d1117 70%)",
          borderBottom: "1px solid var(--border)",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            maxWidth: 760,
            margin: "0 auto",
            padding: "16px 0 0",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 30,
                letterSpacing: "0.06em",
                lineHeight: 1,
                color: "#fff",
              }}
            >
              🏆 WK POULE 2026
            </div>
            <div
              style={{
                fontSize: 11,
                color: "var(--muted)",
                letterSpacing: "0.1em",
                marginTop: 3,
              }}
            >
              {isAdmin ? "⚙️ ADMIN" : updatedUser?.name}
              {!isAdmin && state.fase === "ko" && (
                <span
                  style={{
                    marginLeft: 8,
                    background: "rgba(240,136,62,.2)",
                    color: "var(--orange)",
                    borderRadius: 4,
                    padding: "1px 6px",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                >
                  KO-FASE
                </span>
              )}
            </div>
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {!isAdmin &&
              [
                { id: "overview", label: "Mijn Poule" },
                { id: "stand", label: "🏅 Stand" },
                { id: "rules", label: "📋 Spelregels" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setMainTab(t.id);
                    setScreen(
                      t.id === "stand"
                        ? "stand"
                        : t.id === "rules"
                        ? "rules"
                        : "overview"
                    );
                  }}
                  style={{
                    padding: "7px 14px",
                    borderRadius: "7px 7px 0 0",
                    border: "1px solid var(--border)",
                    borderBottom:
                      screen === t.id ||
                      (t.id === "overview" &&
                        [
                          "overview",
                          "editGroup",
                          "editExtra",
                          "editKO",
                        ].includes(screen))
                        ? "1px solid var(--bg)"
                        : "1px solid var(--border)",
                    background:
                      screen === t.id ||
                      (t.id === "overview" &&
                        [
                          "overview",
                          "editGroup",
                          "editExtra",
                          "editKO",
                        ].includes(screen))
                        ? "var(--bg)"
                        : "transparent",
                    color:
                      screen === t.id ||
                      (t.id === "overview" &&
                        [
                          "overview",
                          "editGroup",
                          "editExtra",
                          "editKO",
                        ].includes(screen))
                        ? "var(--accent)"
                        : "var(--muted)",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: "var(--font)",
                  }}
                >
                  {t.label}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div
        style={{ maxWidth: 760, margin: "0 auto", padding: "24px 20px 100px" }}
      >
        {isAdmin && <AdminPanel state={state} setState={setAndPersist} />}
        {!isAdmin && updatedUser && (
          <>
            {screen === "overview" && (
              <MyOverview
                user={updatedUser}
                state={state}
                onEditGroup={() => setScreen("editGroup")}
                onEditExtra={() => setScreen("editExtra")}
                onEditKO={() => setScreen("editKO")}
              />
            )}
            {screen === "editGroup" && (
              <GroupPredictionsForm
                user={updatedUser}
                state={state}
                onSave={savePred}
                onBack={() => setScreen("overview")}
              />
            )}
            {screen === "editExtra" && (
              <ExtraPredictionsForm
                user={updatedUser}
                state={state}
                onSave={savePred}
                onBack={() => setScreen("overview")}
              />
            )}
            {screen === "editKO" && (
              <KOPredictionsForm
                user={updatedUser}
                state={state}
                onSave={savePred}
                onBack={() => setScreen("overview")}
              />
            )}
            {screen === "stand" && (
              <StandWithCompare state={state} currentUser={updatedUser} />
            )}
            {screen === "rules" && <Rules />}
          </>
        )}
      </div>

      {/* UITLOG */}
      <div style={{ position: "fixed", bottom: 16, right: 16, zIndex: 100 }}>
        <button
          onClick={logout}
          style={{
            background: "rgba(22,27,34,0.92)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--muted)",
            cursor: "pointer",
            fontSize: 11,
            fontFamily: "var(--font)",
            padding: "5px 10px",
            backdropFilter: "blur(4px)",
          }}
        >
          ↩ uitloggen
        </button>
      </div>
    </div>
  );
}