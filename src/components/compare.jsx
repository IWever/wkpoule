import React from "react";
import { useState } from "react";
import { GROUPS, GROUP_MATCHES, KO_STRUCTURE, PTS_KO, FLAG } from "../data/tournamentData";
import { calcGroupMatchPts, calcPoints, buildRichKOSlots, fmtDateTime } from "../pouleEngine";
import { S } from "../styles/ui";
import { SlotDisplay } from "./common";

function SingleMatchCompare(props) {
  var match = props.match; var state = props.state; var currentUserId = props.currentUserId; var onClose = props.onClose;
  var result = state.results[match.id];
  var users = state.users.filter(function(u) {
    var pm = u.predictions && u.predictions.matches && u.predictions.matches[match.id];
    return pm && pm.home !== undefined && pm.home !== "";
  });
  var sorted = users.slice().sort(function(a, b) {
    var pa = calcGroupMatchPts(a.predictions.matches[match.id], result);
    var pb = calcGroupMatchPts(b.predictions.matches[match.id], result);
    return (pb ? pb.pts : 0) - (pa ? pa.pts : 0);
  });
  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,.75)", zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={onClose}>
      <div style={{ width:"100%", maxWidth:760, background:"var(--card)", borderRadius:"16px 16px 0 0", padding:"20px 16px 40px", maxHeight:"80vh", overflowY:"auto" }} onClick={function(e){e.stopPropagation();}}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <div>
            <div style={{ fontWeight:700, fontSize:15 }}>{FLAG[match.home]} {match.home} vs {FLAG[match.away]} {match.away}</div>
            <div style={{ fontSize:11, color:"var(--muted)", marginTop:2 }}>{fmtDateTime(match.dt)} · Poule {match.group} · Ronde {match.round}</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"var(--muted)", fontSize:22, cursor:"pointer" }}>×</button>
        </div>
        {result && result.played && (
          <div style={{ textAlign:"center", ...S.card(), padding:"10px", marginBottom:14, background:"rgba(63,185,80,.08)", border:"1px solid rgba(63,185,80,.3)" }}>
            <div style={{ fontSize:11, color:"var(--muted)", marginBottom:2 }}>Officiële uitslag</div>
            <div style={{ fontSize:24, fontWeight:900 }}>{result.home} – {result.away}</div>
          </div>
        )}
        {sorted.length === 0 ? (
          <div style={{ color:"var(--muted)", fontSize:13, textAlign:"center", padding:20 }}>Niemand heeft deze wedstrijd ingevuld.</div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {sorted.map(function(u, i) {
              var pm = u.predictions.matches[match.id];
              var res = calcGroupMatchPts(pm, result);
              var isMe = u.id === currentUserId;
              var bgColor = res ? (res.label==="exact"?"rgba(63,185,80,.12)":res.label==="diff"?"rgba(255,193,7,.08)":res.label==="winner"?"rgba(88,166,255,.08)":result&&result.played?"rgba(248,81,73,.08)":"var(--card)") : "var(--card)";
              return (
                <div key={u.id} style={{ display:"flex", alignItems:"center", gap:10, borderRadius:8, padding:"10px 12px", background:bgColor, border:"1px solid " + (isMe?"var(--accent)":"rgba(48,54,61,.6)") }}>
                  <div style={{ fontSize:16, width:24 }}>{["🥇","🥈","🥉"][i]||("#"+(i+1))}</div>
                  <div style={{ flex:1, fontWeight:isMe?700:400, fontSize:13 }}>{u.name}{isMe?" (jij)":""}</div>
                  <div style={{ fontWeight:700, fontSize:16, color:isMe?"var(--accent)":"var(--text)", background:"rgba(255,255,255,.06)", borderRadius:6, padding:"3px 10px", minWidth:52, textAlign:"center" }}>
                    {pm.home}–{pm.away}
                  </div>
                  {res ? (
                    <div style={{ fontWeight:700, fontSize:12, color:res.pts>0?"var(--green)":"var(--red)", minWidth:60, textAlign:"right" }}>
                      {res.pts>0 ? "+"+res.pts+" "+(res.label==="exact"?"exact":res.label==="diff"?"verschil":"winnaar") : (result&&result.played?"✗":"")}
                    </div>
                  ) : <div style={{ minWidth:60 }} />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function MatchCompare(props) {
  var match = props.match; var state = props.state; var currentUserId = props.currentUserId; var onClose = props.onClose;
  var groupByS = useState("poule"); var setGroupBy = groupByS[1]; groupByS = groupByS[0];
  var filterS = useState("poule_" + (match && match.group ? match.group : "A")); var setFilter = filterS[1]; filterS = filterS[0];

  var groups = Object.keys(GROUPS);
  var rounds = [1, 2, 3];

  var matchesToShow = (function() {
    if (groupByS === "poule") {
      var g = filterS.replace("poule_", "");
      return GROUP_MATCHES.filter(function(m) { return m.group === g; });
    } else {
      var r = parseInt(filterS.replace("ronde_", ""));
      return GROUP_MATCHES.filter(function(m) { return m.round === r; });
    }
  })();

  var users = state.users.filter(function(u) {
    return matchesToShow.some(function(m) {
      var pm = u.predictions && u.predictions.matches && u.predictions.matches[m.id];
      return pm && pm.home !== undefined && pm.home !== "";
    });
  });

  function userPts(u) {
    return matchesToShow.reduce(function(sum, m) {
      var res = calcGroupMatchPts(u.predictions && u.predictions.matches && u.predictions.matches[m.id], state.results[m.id]);
      return sum + (res ? res.pts : 0);
    }, 0);
  }

  var sortedUsers = users.slice().sort(function(a, b) { return userPts(b) - userPts(a); });

  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,.75)", zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={onClose}>
      <div style={{ width:"100%", maxWidth:760, background:"var(--card)", borderRadius:"16px 16px 0 0", padding:"20px 16px 40px", maxHeight:"88vh", overflowY:"auto" }} onClick={function(e){e.stopPropagation();}}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <div style={{ fontWeight:700, fontSize:15 }}>Wedstrijden vergelijken</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"var(--muted)", fontSize:22, cursor:"pointer" }}>×</button>
        </div>
        <div style={{ display:"flex", background:"var(--bg)", borderRadius:8, padding:3, marginBottom:10 }}>
          {[["poule","Per poule"],["ronde","Per speelronde"]].map(function(pair) {
            var v = pair[0]; var l = pair[1];
            return (
              <button key={v} onClick={function(){setGroupBy(v);setFilter(v==="poule"?"poule_A":"ronde_1");}}
                style={{ flex:1, padding:"6px", background:groupByS===v?"var(--accent)":"none", color:groupByS===v?"#fff":"var(--muted)", border:"none", borderRadius:6, cursor:"pointer", fontWeight:600, fontSize:12, fontFamily:"var(--font)" }}>
                {l}
              </button>
            );
          })}
        </div>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:14 }}>
          {groupByS === "poule"
            ? groups.map(function(g) {
                return (
                  <button key={g} onClick={function(){setFilter("poule_"+g);}}
                    style={{ padding:"4px 12px", borderRadius:20, border:"1px solid var(--border)", background:filterS==="poule_"+g?"var(--accent)":"var(--bg)", color:filterS==="poule_"+g?"#fff":"var(--text)", cursor:"pointer", fontSize:12, fontWeight:600 }}>
                    Poule {g}
                  </button>
                );
              })
            : rounds.map(function(r) {
                return (
                  <button key={r} onClick={function(){setFilter("ronde_"+r);}}
                    style={{ padding:"4px 12px", borderRadius:20, border:"1px solid var(--border)", background:filterS==="ronde_"+r?"var(--accent)":"var(--bg)", color:filterS==="ronde_"+r?"#fff":"var(--text)", cursor:"pointer", fontSize:12, fontWeight:600 }}>
                    Ronde {r}
                  </button>
                );
              })
          }
        </div>
        {sortedUsers.length === 0 ? (
          <div style={{ color:"var(--muted)", fontSize:13, textAlign:"center", padding:20 }}>Niemand heeft wedstrijden in dit filter ingevuld.</div>
        ) : (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"140px repeat("+sortedUsers.length+", 1fr)", gap:4, marginBottom:6, alignItems:"center" }}>
              <div />
              {sortedUsers.map(function(u) {
                var isMe = u.id === currentUserId;
                return (
                  <div key={u.id} style={{ textAlign:"center", fontSize:12, fontWeight:isMe?700:600, color:isMe?"var(--accent)":"var(--text)" }}>
                    <div>{u.name}{isMe?" 👈":""}</div>
                    <div style={{ fontSize:11, color:"var(--muted)" }}>{userPts(u)} pt</div>
                  </div>
                );
              })}
            </div>
            {matchesToShow.map(function(m) {
              var result = state.results[m.id];
              return (
                <div key={m.id} style={{ display:"grid", gridTemplateColumns:"140px repeat("+sortedUsers.length+", 1fr)", gap:4, marginBottom:5, alignItems:"center" }}>
                  <div style={{ fontSize:11, color:"var(--muted)", lineHeight:1.3 }}>
                    <div style={{ fontWeight:600, color:"var(--text)", fontSize:12 }}>{FLAG[m.home]} {m.home}</div>
                    <div style={{ fontSize:10 }}>vs {FLAG[m.away]} {m.away}</div>
                    {result && result.played && <div style={{ color:"var(--green)", fontWeight:700 }}>{result.home}–{result.away}</div>}
                  </div>
                  {sortedUsers.map(function(u) {
                    var pm = u.predictions && u.predictions.matches && u.predictions.matches[m.id];
                    var isMe = u.id === currentUserId;
                    var res = calcGroupMatchPts(pm, result);
                    var hasPred = pm && pm.home !== undefined && pm.home !== "";
                    var bg = res ? (res.label==="exact"?"rgba(63,185,80,.15)":res.label==="diff"?"rgba(255,193,7,.1)":res.label==="winner"?"rgba(88,166,255,.1)":result&&result.played?"rgba(248,81,73,.1)":"var(--bg)") : "var(--bg)";
                    return (
                      <div key={u.id} style={{ textAlign:"center", background:bg, borderRadius:6, padding:"4px 2px", border:"1px solid "+(isMe?"rgba(88,166,255,.3)":"rgba(48,54,61,.5)") }}>
                        <div style={{ fontWeight:700, fontSize:13, color:isMe?"var(--accent)":"var(--text)" }}>
                          {hasPred ? (pm.home+"–"+pm.away) : <span style={{ color:"var(--muted)", fontSize:11 }}>–</span>}
                        </div>
                        {res && <div style={{ fontSize:10, fontWeight:700, color:res.pts>0?"var(--green)":"var(--red)" }}>{res.pts>0?("+"+res.pts):""}</div>}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function PlayerCompare(props) {
  var me = props.me; var other = props.other; var state = props.state; var onClose = props.onClose;
  var myPred = me.predictions || {};
  var otherPred = other.predictions || {};
  var myPts = calcPoints(me, state.results, state.koResults);
  var otherPts = calcPoints(other, state.results, state.koResults);
  var groupByS = useState("ronde"); var setGroupBy = groupByS[1]; groupByS = groupByS[0];

  function ExtraRow(rowProps) {
    var label = rowProps.label; var myVal = rowProps.myVal; var otherVal = rowProps.otherVal;
    var same = myVal && otherVal && myVal === otherVal;
    return (
      <div style={{ display:"flex", gap:6, marginBottom:6 }}>
        <div style={{ width:80, color:"var(--muted)", fontSize:11, paddingTop:4 }}>{label}</div>
        <div style={{ flex:1, ...S.card(), padding:"5px 10px", fontWeight:600, fontSize:13, border:"1px solid "+(same?"rgba(88,166,255,.4)":"var(--border)"), color:"var(--accent)" }}>{myVal||<span style={{color:"var(--muted)",fontWeight:400}}>–</span>}</div>
        <div style={{ flex:1, ...S.card(), padding:"5px 10px", fontWeight:600, fontSize:13, border:"1px solid "+(same?"rgba(88,166,255,.4)":"var(--border)"), color:"var(--orange)" }}>{otherVal||<span style={{color:"var(--muted)",fontWeight:400}}>–</span>}</div>
      </div>
    );
  }

  var sections = groupByS === "poule"
    ? Object.keys(GROUPS).map(function(g) { return { key:g, label:"Poule "+g, matches:GROUP_MATCHES.filter(function(m){return m.group===g;}) }; })
    : [1,2,3].map(function(r) { return { key:"r"+r, label:"Speelronde "+r, matches:GROUP_MATCHES.filter(function(m){return m.round===r;}) }; });

  function sectionPts(u, matches) {
    return matches.reduce(function(sum, m) {
      var res = calcGroupMatchPts(u.predictions && u.predictions.matches && u.predictions.matches[m.id], state.results[m.id]);
      return sum + (res ? res.pts : 0);
    }, 0);
  }

  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, background:"rgba(0,0,0,.75)", zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={onClose}>
      <div style={{ width:"100%", maxWidth:760, background:"var(--card)", borderRadius:"16px 16px 0 0", padding:"20px 16px 40px", maxHeight:"88vh", overflowY:"auto" }} onClick={function(e){e.stopPropagation();}}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <div style={{ fontWeight:700, fontSize:15 }}>Vergelijking</div>
          <button onClick={onClose} style={{ background:"none", border:"none", color:"var(--muted)", fontSize:22, cursor:"pointer" }}>×</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"90px 1fr 1fr", gap:6, marginBottom:14, alignItems:"center" }}>
          <div />
          <div style={{ textAlign:"center", fontWeight:700, fontSize:14, color:"var(--accent)" }}>{me.name}<br /><span style={{fontWeight:400,fontSize:12}}>{myPts} pt</span></div>
          <div style={{ textAlign:"center", fontWeight:700, fontSize:14, color:"var(--orange)" }}>{other.name}<br /><span style={{fontWeight:400,fontSize:12}}>{otherPts} pt</span></div>
        </div>
        <div style={{ fontSize:11, fontWeight:700, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Extra vragen</div>
        <ExtraRow label="Kampioen" myVal={myPred.champion?(FLAG[myPred.champion]+" "+myPred.champion):""} otherVal={otherPred.champion?(FLAG[otherPred.champion]+" "+otherPred.champion):""} />
        <ExtraRow label="Topscorer" myVal={myPred.topScorer||""} otherVal={otherPred.topScorer||""} />
        <ExtraRow label="Nederland" myVal={myPred.nlStage||""} otherVal={otherPred.nlStage||""} />
        <ExtraRow label="Verrassing" myVal={myPred.surpriseTeam?((FLAG[myPred.surpriseTeam]||"")+" "+myPred.surpriseTeam):""} otherVal={otherPred.surpriseTeam?((FLAG[otherPred.surpriseTeam]||"")+" "+otherPred.surpriseTeam):""} />
        <ExtraRow label="Topland" myVal={myPred.topOut?((FLAG[myPred.topOut]||"")+" "+myPred.topOut):""} otherVal={otherPred.topOut?((FLAG[otherPred.topOut]||"")+" "+otherPred.topOut):""} />
        <div style={{ marginTop:18, marginBottom:10 }}>
          <div style={{ display:"flex", background:"var(--bg)", borderRadius:8, padding:3 }}>
            {[["ronde","Per speelronde"],["poule","Per poule"]].map(function(pair) {
              var v = pair[0]; var l = pair[1];
              return (
                <button key={v} onClick={function(){setGroupBy(v);}}
                  style={{ flex:1, padding:"6px", background:groupByS===v?"var(--accent)":"none", color:groupByS===v?"#fff":"var(--muted)", border:"none", borderRadius:6, cursor:"pointer", fontWeight:600, fontSize:12, fontFamily:"var(--font)" }}>
                  {l}
                </button>
              );
            })}
          </div>
        </div>
        {sections.map(function(sec) {
          var mySecPts = sectionPts(me, sec.matches);
          var otherSecPts = sectionPts(other, sec.matches);
          return (
            <div key={sec.key} style={{ marginBottom:16 }}>
              <div style={{ display:"grid", gridTemplateColumns:"90px 1fr 1fr", gap:6, marginBottom:6, alignItems:"center" }}>
                <div style={{ fontSize:11, fontWeight:700, color:"var(--muted)", textTransform:"uppercase" }}>{sec.label}</div>
                <div style={{ textAlign:"center", fontSize:11, color:"var(--accent)", fontWeight:700 }}>{mySecPts} pt</div>
                <div style={{ textAlign:"center", fontSize:11, color:"var(--orange)", fontWeight:700 }}>{otherSecPts} pt</div>
              </div>
              {sec.matches.map(function(m) {
                var my = myPred.matches && myPred.matches[m.id];
                var ot = otherPred.matches && otherPred.matches[m.id];
                var r = state.results[m.id];
                var myRes = calcGroupMatchPts(my, r);
                var otRes = calcGroupMatchPts(ot, r);
                var same = my && my.home !== undefined && my.home !== "" && ot && ot.home !== undefined && ot.home !== "" && my.home === ot.home && my.away === ot.away;
                var hasMy = my && my.home !== undefined && my.home !== "";
                var hasOt = ot && ot.home !== undefined && ot.home !== "";
                function cellBg(res) {
                  return res ? (res.label==="exact"?"rgba(63,185,80,.15)":res.label==="diff"?"rgba(255,193,7,.1)":res.label==="winner"?"rgba(88,166,255,.1)":r&&r.played?"rgba(248,81,73,.1)":"var(--bg)") : "var(--bg)";
                }
                return (
                  <div key={m.id} style={{ display:"grid", gridTemplateColumns:"90px 1fr 1fr", gap:4, marginBottom:4, alignItems:"center" }}>
                    <div style={{ fontSize:10, color:"var(--muted)", lineHeight:1.3 }}>
                      <span style={{ fontWeight:600, color:"var(--text)" }}>{FLAG[m.home]} {m.home}</span><br />
                      <span>vs {FLAG[m.away]} {m.away}</span>
                      {r && r.played && <div style={{ color:"var(--green)", fontWeight:700 }}>{r.home}–{r.away}</div>}
                    </div>
                    <div style={{ textAlign:"center", borderRadius:6, padding:"4px 2px", background:cellBg(myRes), border:"1px solid "+(same?"rgba(88,166,255,.3)":"rgba(48,54,61,.5)") }}>
                      <div style={{ fontWeight:700, fontSize:13, color:"var(--accent)" }}>{hasMy?(my.home+"–"+my.away):<span style={{color:"var(--muted)",fontSize:11}}>–</span>}</div>
                      {myRes && r && r.played && <div style={{ fontSize:10, fontWeight:700, color:myRes.pts>0?"var(--green)":"var(--red)" }}>{myRes.pts>0?("+"+myRes.pts):""}</div>}
                    </div>
                    <div style={{ textAlign:"center", borderRadius:6, padding:"4px 2px", background:cellBg(otRes), border:"1px solid "+(same?"rgba(88,166,255,.3)":"rgba(48,54,61,.5)") }}>
                      <div style={{ fontWeight:700, fontSize:13, color:"var(--orange)" }}>{hasOt?(ot.home+"–"+ot.away):<span style={{color:"var(--muted)",fontSize:11}}>–</span>}</div>
                      {otRes && r && r.played && <div style={{ fontSize:10, fontWeight:700, color:otRes.pts>0?"var(--green)":"var(--red)" }}>{otRes.pts>0?("+"+otRes.pts):""}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── PREDICTIONS FORM (FASE 1: groep + extra) ─────────────────────────────────


export {
  SingleMatchCompare,
  MatchCompare,
  PlayerCompare
};
