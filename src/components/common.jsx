import React from "react";
import { FLAG } from "../data/tournamentData";
import { S } from "../styles/ui";

function TabBar(props) {
  var tabs = props.tabs; var active = props.active; var onSelect = props.onSelect;
  return (
    <div style={{ display:"flex", borderBottom:"2px solid var(--border)", marginBottom:22, gap:0, overflowX:"auto" }}>
      {tabs.map(function(t) {
        return (
          <button key={t.id} onClick={function() { onSelect(t.id); }}
            style={{ padding:"9px 16px", background:"none", border:"none", cursor:"pointer", fontFamily:"var(--font)", fontSize:13, fontWeight:active===t.id?700:400, color:active===t.id?"var(--accent)":"var(--muted)", borderBottom:active===t.id?"2px solid var(--accent)":"2px solid transparent", marginBottom:-2, whiteSpace:"nowrap" }}>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

function Alert(props) {
  var msg = props.msg; var type = props.type || "info";
  if (!msg) return null;
  var colors = { error:["#f8514920","var(--red)"], success:["#3fb95020","var(--green)"], info:["#58a6ff20","var(--accent)"], warn:["#f0883e20","var(--orange)"] };
  var color = colors[type] || colors.info;
  return <div style={{ background:color[0], border:"1px solid "+color[1], borderRadius:8, padding:"10px 14px", fontSize:13, marginBottom:14 }}>{msg}</div>;
}

function FlagTeam(props) {
  var team = props.team; var size = props.size || 13;
  if (!team) return <span style={{ color:"var(--muted)", fontSize:size }}>?</span>;
  return <span style={{ fontSize:size }}>{FLAG[team]||"🏳️"} {team}</span>;
}

function SlotDisplay(props) {
  var desc = props.desc; var align = props.align || "left"; var size = props.size || 14;
  if (!desc) return <span style={{ color:"var(--muted)", fontSize:size }}>?</span>;
  if (desc.type === "team") return <span style={{ fontSize:size, fontWeight:700 }}>{FLAG[desc.team]||"🏳️"} {desc.team}</span>;
  if (desc.type === "two") {
    return (
      <span style={{ fontSize:size-1, fontWeight:600, lineHeight:1.4, display:"inline-flex", flexDirection:"column", alignItems:align==="right"?"flex-end":"flex-start", gap:1 }}>
        <span>{FLAG[desc.teams[0]]||"🏳️"} {desc.teams[0]}</span>
        <span style={{ color:"var(--muted)", fontSize:size-3 }}>of</span>
        <span>{FLAG[desc.teams[1]]||"🏳️"} {desc.teams[1]}</span>
      </span>
    );
  }
  return <span style={{ fontSize:size-2, color:"var(--muted)", fontStyle:"italic" }}>{desc.label}</span>;
}

function GroupStandingTable(props) {
  var rows = props.rows;
  return (
    <div style={{ fontSize:11 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 28px 28px 28px 28px 28px 28px", gap:"0 4px", color:"var(--muted)", fontWeight:700, textTransform:"uppercase", padding:"2px 6px", borderBottom:"1px solid var(--border)" }}>
        <span>Team</span><span style={{textAlign:"center"}}>W</span><span style={{textAlign:"center"}}>P</span><span style={{textAlign:"center"}}>DS</span><span style={{textAlign:"center"}}>V</span><span style={{textAlign:"center"}}>T</span><span style={{textAlign:"center"}}>Pts</span>
      </div>
      {rows.map(function(r, i) {
        return (
          <div key={r.team} style={{ display:"grid", gridTemplateColumns:"1fr 28px 28px 28px 28px 28px 28px", gap:"0 4px", padding:"4px 6px", background:i<2?"rgba(88,166,255,0.06)":"transparent", borderRadius:4, borderBottom:"1px solid rgba(48,54,61,.4)" }}>
            <span style={{ fontWeight:i<2?700:400, display:"flex", alignItems:"center", gap:4 }}>
              <span style={{ color:i===0?"var(--gold)":i===1?"var(--muted)":"var(--border)", fontWeight:700, width:14 }}>{i===0?"①":i===1?"②":i===2?"③":"④"}</span>
              {FLAG[r.team]} {r.team}
            </span>
            <span style={{textAlign:"center",color:"var(--muted)"}}>{r.gp}</span>
            <span style={{textAlign:"center",color:"var(--muted)"}}>{r.gp}</span>
            <span style={{textAlign:"center",color:r.gd>0?"var(--green)":r.gd<0?"var(--red)":"var(--muted)"}}>{r.gd>0?"+":""}{r.gd}</span>
            <span style={{textAlign:"center",color:"var(--muted)"}}>{r.gf}</span>
            <span style={{textAlign:"center",color:"var(--muted)"}}>{r.ga}</span>
            <span style={{textAlign:"center",fontWeight:700,color:"var(--accent)"}}>{r.pts}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────


export {
  TabBar,
  Alert,
  FlagTeam,
  SlotDisplay,
  GroupStandingTable
};
