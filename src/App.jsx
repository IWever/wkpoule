import React from "react";
import { useState } from "react";
import { load, persist, hash, blank } from "./pouleEngine";
import { AuthScreen, AdminLogin } from "./components/auth";
import { GroupPredictionsForm, ExtraPredictionsForm, KOPredictionsForm } from "./components/forms";
import { MyOverview, Rules, StandWithCompare, AdminPanel } from "./components/views";

export default function App() {
  const [state, setState] = useState(() => load() || blank());
  const [session, setSession] = useState(null);
  const [screen, setScreen] = useState("overview"); // overview | editGroup | editExtra | editKO | stand
  const [adminStep, setAdminStep] = useState(false);
  const [mainTab, setMainTab] = useState("overview");

  const currentUser = session && session !== "__admin__" ? state.users.find(u => u.id === session) : null;

  const handleLogin = (userId, newUser) => {
    if (userId === "__admin__") { setAdminStep(true); return; }
    if (newUser) {
      const id = "u_" + Date.now();
      const user = { id, name: newUser.name, pwHash: hash(newUser.pw), pwPlain: newUser.pw, predictions: {}, locked: false };
      setState(s => { const ns = { ...s, users: [...s.users, user] }; persist(ns); return ns; });
      setSession(id);
      setScreen("editGroup");
      return;
    }
    setSession(userId);
    setScreen("overview");
  };

  const savePred = (pred) => {
    setState(s => { const ns = { ...s, users: s.users.map(u => u.id === session ? { ...u, predictions: pred } : u) }; persist(ns); return ns; });
  };

  const logout = () => { setSession(null); setScreen("overview"); setAdminStep(false); setMainTab("overview"); };

  const fonts = <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow:wght@400;500;600;700;900&display=swap" rel="stylesheet" />;
  const styleTag = <style>{`
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
  `}</style>;

  if (adminStep && !session) return <div style={{ minHeight:"100vh", background:"#0d1117", color:"#e6edf3", fontFamily:"'Barlow', sans-serif" }}>{styleTag}{fonts}<AdminLogin onSuccess={function(){setAdminStep(false);setSession("__admin__");}} onCancel={function(){setAdminStep(false);}} /></div>;
  if (!session) return <div style={{ minHeight:"100vh", background:"#0d1117", color:"#e6edf3", fontFamily:"'Barlow', sans-serif" }}>{styleTag}{fonts}<AuthScreen onLogin={handleLogin} users={state.users} /></div>;

  const isAdmin = session === "__admin__";
  const updatedUser = currentUser ? state.users.find(u => u.id === session) : null;

  return (
    <div style={{ minHeight:"100vh", background:"#0d1117", color:"#e6edf3", fontFamily:"'Barlow', sans-serif" }}>
      {styleTag}
      {fonts}
      {/* HEADER */}
      <div style={{ background:"linear-gradient(135deg,#0d2137 0%,#0d1117 70%)", borderBottom:"1px solid var(--border)", padding:"0 20px" }}>
        <div style={{ maxWidth:760, margin:"0 auto", padding:"16px 0 0", display:"flex", alignItems:"flex-end", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
          <div>
            <div style={{ fontFamily:"var(--font-display)", fontSize:30, letterSpacing:"0.06em", lineHeight:1, color:"#fff" }}>🏆 WK POULE 2026</div>
            <div style={{ fontSize:11, color:"var(--muted)", letterSpacing:"0.1em", marginTop:3 }}>
              {isAdmin?"⚙️ ADMIN":updatedUser?.name}
              {!isAdmin && state.fase==="ko" && <span style={{ marginLeft:8, background:"rgba(240,136,62,.2)", color:"var(--orange)", borderRadius:4, padding:"1px 6px", fontSize:10, fontWeight:700 }}>KO-FASE</span>}
            </div>
          </div>
          <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
            {!isAdmin && [
              { id:"overview", label:"Mijn Poule" },
              { id:"stand", label:"🏅 Stand" },
              { id:"rules", label:"📋 Spelregels" },
            ].map(t=>(
              <button key={t.id} onClick={()=>{setMainTab(t.id);setScreen(t.id==="stand"?"stand":t.id==="rules"?"rules":"overview");}} style={{ padding:"7px 14px", borderRadius:"7px 7px 0 0", border:"1px solid var(--border)", borderBottom:(screen===t.id||(t.id==="overview"&&["overview","editGroup","editExtra","editKO"].includes(screen)))?"1px solid var(--bg)":"1px solid var(--border)", background:(screen===t.id||(t.id==="overview"&&["overview","editGroup","editExtra","editKO"].includes(screen)))?"var(--bg)":"transparent", color:(screen===t.id||(t.id==="overview"&&["overview","editGroup","editExtra","editKO"].includes(screen)))?"var(--accent)":"var(--muted)", cursor:"pointer", fontSize:12, fontWeight:600, fontFamily:"var(--font)" }}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth:760, margin:"0 auto", padding:"24px 20px 100px" }}>
        {isAdmin && <AdminPanel state={state} setState={setState} />}
        {!isAdmin && updatedUser && (
          <>
            {screen==="overview" && <MyOverview user={updatedUser} state={state} onEditGroup={()=>setScreen("editGroup")} onEditExtra={()=>setScreen("editExtra")} onEditKO={()=>setScreen("editKO")} />}
            {screen==="editGroup" && <GroupPredictionsForm user={updatedUser} state={state} onSave={savePred} onBack={()=>setScreen("overview")} />}
            {screen==="editExtra" && <ExtraPredictionsForm user={updatedUser} state={state} onSave={savePred} onBack={()=>setScreen("overview")} />}
            {screen==="editKO" && <KOPredictionsForm user={updatedUser} state={state} onSave={savePred} onBack={()=>setScreen("overview")} />}
            {screen==="stand" && <StandWithCompare state={state} currentUser={updatedUser} />}
            {screen==="rules" && <Rules />}
          </>
        )}
      </div>

      {/* LOGOUT — fixed bottom right, small and unobtrusive */}
      <div style={{ position:"fixed", bottom:16, right:16, zIndex:100 }}>
        <button onClick={logout} style={{ background:"rgba(22,27,34,0.92)", border:"1px solid var(--border)", borderRadius:8, color:"var(--muted)", cursor:"pointer", fontSize:11, fontFamily:"var(--font)", padding:"5px 10px", backdropFilter:"blur(4px)" }}>
          ↩ uitloggen
        </button>
      </div>

      <style>{`* { box-sizing:border-box; } input::placeholder{color:var(--muted);} select option{background:#161b22;} input[type=number]::-webkit-inner-spin-button{opacity:1;} ::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px;}`}</style>
    </div>
  );
}
