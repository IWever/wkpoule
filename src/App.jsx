import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  load,
  persist,
  hash,
  blank,
  saveSession,
  loadSession,
} from "./pouleEngine";
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
import { ChangePasswordScreen } from "./components/ChangePasswordScreen";

// ─── LOADING / ERROR SCREENS ──────────────────────────────────────────────────

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

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────

const GlobalFonts = () => (
  <link
    href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600;700;900&display=swap"
    rel="stylesheet"
  />
);

const GlobalStyles = () => (
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

// ─── HEADER ───────────────────────────────────────────────────────────────────

const OVERVIEW_SCREENS = ["overview", "editGroup", "editExtra", "editKO"];
const NAV_TABS = [
  { id: "overview", label: "🎯 Mijn Poule" },
  { id: "stand", label: "🏅 Stand" },
  { id: "rules", label: "📋 Spelregels" },
];

function Header({ screen, setScreen, state, isAdmin, userName, onSetMainTab }) {
  return (
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
            {isAdmin ? "⚙️ ADMIN" : userName}
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
        {!isAdmin && (
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {NAV_TABS.map((t) => {
              const targetScreen =
                t.id === "stand"
                  ? "stand"
                  : t.id === "rules"
                  ? "rules"
                  : "overview";
              const isActive =
                screen === t.id ||
                (t.id === "overview" && OVERVIEW_SCREENS.includes(screen));
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    onSetMainTab(t.id);
                    setScreen(targetScreen);
                  }}
                  style={{
                    padding: "7px 14px",
                    borderRadius: "7px 7px 0 0",
                    border: "1px solid var(--border)",
                    borderBottom: isActive
                      ? "1px solid var(--bg)"
                      : "1px solid var(--border)",
                    background: isActive ? "var(--bg)" : "transparent",
                    color: isActive ? "var(--accent)" : "var(--muted)",
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: "var(--font)",
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [loadStatus, setLoadStatus] = useState("loading");
  const [state, setState] = useState(null);
  const [session, setSession] = useState(null);
  const [screen, setScreen] = useState("overview");
  const [adminStep, setAdminStep] = useState(false);
  const [mainTab, setMainTab] = useState("overview");

  // Debounce timer voor persist — voorkomt dat snelle opeenvolgende
  // state-wijzigingen elkaar overschrijven in de database
  const persistTimer = useRef(null);

  const schedulePersist = useCallback((data) => {
    clearTimeout(persistTimer.current);
    persistTimer.current = setTimeout(() => {
      persist(data).catch((err) => console.error("Opslaan mislukt:", err));
    }, 300);
  }, []);

  const urlParams = new URLSearchParams(window.location.search);
  const preRegister =
    urlParams.get("register") !== null ||
    urlParams.has("comp") ||
    urlParams.get("r") !== null;
  const preComp = urlParams.get("comp") || urlParams.get("register") || "";

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

  // Restore session after state loads
  // Mist state.users als dependency zodat re-validatie plaatsvindt als users wijzigen
  useEffect(() => {
    if (loadStatus !== "ready" || !state) return;
    const saved = loadSession();
    if (!saved) return;
    if (saved === "__admin__") {
      setSession("__admin__");
      return;
    }
    const userExists = state.users.find((u) => u.id === saved);
    if (userExists) {
      setSession(saved);
      setScreen("overview");
    } else {
      console.warn(
        "Sessie gebruiker niet gevonden in state, sessie gewist:",
        saved
      );
      saveSession(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadStatus, state?.users]);

  // ─── setAndPersist: persist wordt BUITEN setState aangeroepen ────────────
  // Hiermee vermijden we bijwerkingen binnen de pure updater-functie,
  // wat in React Strict Mode dubbele persist-aanroepen veroorzaakte.
  const setAndPersist = useCallback(
    (updater) => {
      setState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        // Sla persist op via debounced timer, niet direct in de updater
        schedulePersist(next);
        return next;
      });
    },
    [schedulePersist]
  );

  if (loadStatus === "loading") return <LoadingScreen />;
  if (loadStatus === "error") return <ErrorScreen onRetry={loadState} />;

  const currentUser =
    session && session !== "__admin__"
      ? state.users.find((u) => u.id === session)
      : null;
  const isAdmin = session === "__admin__";
  const updatedUser = currentUser
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
      setState((prev) => {
        const next = { ...prev, users: [...prev.users, user] };
        persist(next).then((ok) => {
          if (ok) {
            setSession(id);
            saveSession(id);
            setScreen("editGroup");
          } else {
            alert(
              "Registratie mislukt — controleer je verbinding en probeer opnieuw."
            );
          }
        });
        return next;
      });
      return;
    }
    setSession(userId);
    saveSession(userId);
    setScreen("overview");
  };

  const savePred = async (pred) => {
    return new Promise((resolve) => {
      setState((prev) => {
        const next = {
          ...prev,
          users: prev.users.map((u) =>
            u.id === session ? { ...u, predictions: pred } : u
          ),
        };
        persist(next).then(resolve);
        return next;
      });
    });
  };

  const logout = () => {
    setSession(null);
    saveSession(null);
    setScreen("overview");
    setAdminStep(false);
    setMainTab("overview");
  };

  const shellStyle = {
    minHeight: "100vh",
    background: "#0d1117",
    color: "#e6edf3",
    fontFamily: "'Barlow', sans-serif",
  };

  // Admin password step
  if (adminStep && !session) {
    return (
      <div style={shellStyle}>
        <GlobalStyles />
        <GlobalFonts />
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

  // Not logged in
  if (!session) {
    return (
      <div style={shellStyle}>
        <GlobalStyles />
        <GlobalFonts />
        <AuthScreen
          onLogin={handleLogin}
          users={state.users}
          competitions={state.competitions || []}
          preRegister={preRegister}
          preComp={preComp}
        />
      </div>
    );
  }

  if (session && session !== "__admin__" && updatedUser?.mustChangePassword) {
    return (
      <div style={shellStyle}>
        <GlobalStyles />
        <GlobalFonts />
        <ChangePasswordScreen
          user={updatedUser}
          onSave={(newPw) => {
            setAndPersist((s) => ({
              ...s,
              users: s.users.map((u) =>
                u.id === session
                  ? {
                      ...u,
                      pwPlain: newPw,
                      pwHash: hash(newPw),
                      mustChangePassword: false,
                    }
                  : u
              ),
            }));
          }}
        />
      </div>
    );
  }

  return (
    <div style={shellStyle}>
      <GlobalStyles />
      <GlobalFonts />

      <Header
        screen={screen}
        setScreen={setScreen}
        state={state}
        isAdmin={isAdmin}
        userName={updatedUser?.name}
        onSetMainTab={setMainTab}
      />

      <div
        style={{ maxWidth: 760, margin: "0 auto", padding: "24px 20px 100px" }}
      >
        {isAdmin && <AdminPanel state={state} setState={setAndPersist} />}
        {!isAdmin && updatedUser && (
          <UserScreens
            screen={screen}
            setScreen={setScreen}
            user={updatedUser}
            state={state}
            savePred={savePred}
          />
        )}
      </div>

      <LogoutButton onClick={logout} />
    </div>
  );
}

// ─── USER SCREENS ROUTER ──────────────────────────────────────────────────────

function UserScreens({ screen, setScreen, user, state, savePred }) {
  const goBack = () => setScreen("overview");

  if (screen === "overview") {
    return (
      <MyOverview
        user={user}
        state={state}
        onEditGroup={() => setScreen("editGroup")}
        onEditExtra={() => setScreen("editExtra")}
        onEditKO={() => setScreen("editKO")}
      />
    );
  }
  if (screen === "editGroup")
    return (
      <GroupPredictionsForm
        user={user}
        state={state}
        onSave={savePred}
        onBack={goBack}
      />
    );
  if (screen === "editExtra")
    return (
      <ExtraPredictionsForm
        user={user}
        state={state}
        onSave={savePred}
        onBack={goBack}
      />
    );
  if (screen === "editKO")
    return (
      <KOPredictionsForm
        user={user}
        state={state}
        onSave={savePred}
        onBack={goBack}
      />
    );
  if (screen === "stand")
    return <StandWithCompare state={state} currentUser={user} />;
  if (screen === "rules") return <Rules />;
  return null;
}

// ─── LOGOUT BUTTON ────────────────────────────────────────────────────────────

function LogoutButton({ onClick }) {
  return (
    <div style={{ position: "fixed", bottom: 16, right: 16, zIndex: 100 }}>
      <button
        onClick={onClick}
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
  );
}
