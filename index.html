
import { useState } from "react";
import {
  GROUP_MATCHES,
  KO_STRUCTURE,
  NL_STAGES,
  TOP_TEAMS,
  PTS_TOP_OUT,
  PTS_SURPRISE,
  PTS_EXTRA,
  PTS_KO,
  ADMIN_PW,
  FLAG
} from "../data/tournamentData";
import {
  calcPoints,
  calcGroupMatchPts,
  buildRichKOSlots,
  deriveSurpriseStage,
  deriveTopOuts,
  deriveGroupStandingsFromResults,
  groupsAllFilled,
  persist,
  fmtDateTime
} from "../pouleEngine";
import { S } from "../styles/ui";
import { Alert, SlotDisplay, TabBar } from "./common";
import { SingleMatchCompare, PlayerCompare } from "./compare";

function MyOverview({ user, state, onEditGroup, onEditExtra, onEditKO }) {
  const pred = user.predictions || {};
  const pts = calcPoints(user, state.results, state.koResults);
  const ranked = [...state.users].sort((a,b)=>calcPoints(b,state.results,state.koResults)-calcPoints(a,state.results,state.koResults));
  const rank = ranked.findIndex(u=>u.id===user.id)+1;
  const koAvailable = state.koOpen || state.fase === "ko";
  const [compareMatch, setCompareMatch] = useState(null);
  const [comparePlayer, setComparePlayer] = useState(null);

  // ±5 matches around now — combine group + KO into one chronological list
  const sortedGroup = [...GROUP_MATCHES].sort((a,b)=>(a.dt||"").localeCompare(b.dt||""));
  // Assign approximate dates to KO matches (based on round)
  const KO_DATES = {
    r32:"2026-07-01", r16:"2026-07-05", qf:"2026-07-10", sf:"2026-07-14", "3rd":"2026-07-18", final:"2026-07-19"
  };
  const koMatchesAll = KO_STRUCTURE.map(m => ({ ...m, dt: KO_DATES[m.round]+"T20:00", isKO: true }));

  // Combine all matches
  const allMatches = [...sortedGroup.map(m=>({...m,isKO:false})), ...koMatchesAll]
    .sort((a,b)=>(a.dt||"").localeCompare(b.dt||""));
  const allPlayed = allMatches.filter(m => m.isKO ? state.koResults[m.id]?.played : state.results[m.id]?.played);
  const allUpcoming = allMatches.filter(m => m.isKO ? !state.koResults[m.id]?.played : !state.results[m.id]?.played);
  const last5 = allPlayed.slice(-5);
  const next5 = allUpcoming.slice(0, 5);

  function KOMatchRow(props) { var m=props.m;
    const pw = pred.koWinners?.[m.id];
    const ps = pred.koScores?.[m.id];
    const r = state.koResults[m.id];
    const schema = PTS_KO[m.round] || PTS_KO.r16;
    const winOk = r?.played && pw && pw===r.winner;
    const winNope = r?.played && pw && pw!==r.winner;
    const scoreOk = r?.played && ps?.home!==undefined && parseInt(ps.home)===parseInt(r.home90) && parseInt(ps.away)===parseInt(r.away90);
    const richSlots = buildRichKOSlots(pred, state.results, state.koResults);
    const homeDesc = richSlots[m.id]?.home;
    const awayDesc = richSlots[m.id]?.away;
    const border = winOk?"rgba(63,185,80,.4)":winNope?"rgba(248,81,73,.3)":"var(--border)";
    return (
      <div style={{ marginBottom:6, ...S.card(), padding:"8px 10px", border:`1px solid ${border}` }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
          <span style={{ fontSize:10, color:"var(--muted)" }}>{m.dt?fmtDateTime(m.dt):""}</span>
          <span style={{ fontSize:10, color:"var(--orange)", fontWeight:700, background:"rgba(240,136,62,.1)", borderRadius:4, padding:"1px 6px" }}>{m.label}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:12 }}>
          <span style={{ flex:1, textAlign:"right", fontWeight:600 }}>
            {homeDesc?.type==="team"
              ? `${FLAG[homeDesc.team]||""} ${homeDesc.team}`
              : <span style={{color:"var(--muted)",fontSize:11}}>{homeDesc?.label || "?"}</span>}
          </span>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:1, minWidth:90 }}>
            {pw ? (
              <div style={{ display:"flex", gap:3, alignItems:"center" }}>
                <span style={{ fontSize:10, color:"var(--muted)" }}>Jij:</span>
                <span style={{ fontWeight:700, color:"var(--orange)", background:"rgba(240,136,62,.1)", borderRadius:4, padding:"1px 7px", fontSize:13 }}>
                  {FLAG[pw]||""} {pw}
                </span>
              </div>
            ) : <span style={{ fontSize:10, color:"var(--muted)", fontStyle:"italic" }}>niet ingevuld</span>}
            {ps?.home!==undefined && <span style={{ fontSize:10, color:"var(--muted)" }}>{ps.home}–{ps.away}</span>}
            {r?.played && <span style={{ fontSize:10, color:"var(--muted)" }}>→ winnaar: {FLAG[r.winner]||""} {r.winner}</span>}
          </div>
          <span style={{ flex:1, fontWeight:600 }}>
            {awayDesc?.type==="team"
              ? `${FLAG[awayDesc.team]||""} ${awayDesc.team}`
              : <span style={{color:"var(--muted)",fontSize:11}}>{awayDesc?.label || "?"}</span>}
          </span>
          <div style={{ minWidth:40, textAlign:"right", display:"flex", gap:3, justifyContent:"flex-end" }}>
            {winOk&&<span style={{ color:"var(--green)", fontWeight:700, fontSize:11 }}>+{schema.winner}</span>}
            {winNope&&<span style={{ color:"var(--red)", fontWeight:700, fontSize:11 }}>✗</span>}
            {scoreOk&&<span style={{ color:"var(--green)", fontWeight:700, fontSize:11 }}>+{schema.exact}</span>}
          </div>
        </div>
      </div>
    );
  };

  const canCompareMatch = state.groupFrozen;

  function MatchRow(props) { var m=props.m;
    const res = calcGroupMatchPts(pred.matches?.[m.id], state.results[m.id]);
    const r = state.results[m.id]; const pm = pred.matches?.[m.id];
    const borderColor = res ? (res.label==="exact"?"rgba(63,185,80,.5)":res.label==="diff"?"rgba(255,193,7,.4)":res.label==="winner"?"rgba(88,166,255,.3)":"rgba(248,81,73,.3)") : "var(--border)";
    const labelBadge = res ? (res.label==="exact"?"exact":res.label==="diff"?"verschil":res.label==="winner"?"winnaar":"mis") : null;
    return (
      <div onClick={canCompareMatch ? () => setCompareMatch(m) : undefined}
        style={{ marginBottom:6, ...S.card(), padding:"8px 10px", border:`1px solid ${borderColor}`, cursor:canCompareMatch?"pointer":"default" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
          <span style={{ fontSize:10, color:"var(--muted)" }}>{m.dt ? fmtDateTime(m.dt) : ""}</span>
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            <span style={{ fontSize:10, color:"var(--accent)", fontWeight:700, background:"rgba(88,166,255,.1)", borderRadius:4, padding:"1px 6px" }}>Poule {m.group}</span>
            {canCompareMatch && <span style={{ fontSize:9, color:"var(--muted)" }}>vergelijk →</span>}
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:4, fontSize:12 }}>
          <span style={{ flex:1, textAlign:"right", fontWeight:600 }}>{FLAG[m.home]} {m.home}</span>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:1, minWidth:90 }}>
            <div style={{ display:"flex", gap:3, alignItems:"center" }}>
              <span style={{ fontSize:10, color:"var(--muted)" }}>Jij:</span>
              <span style={{ fontWeight:700, color:"var(--accent)", background:"rgba(88,166,255,.1)", borderRadius:4, padding:"1px 7px", fontSize:13 }}>
                {pm?.home!==undefined&&pm?.home!==""?`${pm.home}–${pm.away}`:"–"}
              </span>
            </div>
            {r?.played && (
              <div style={{ display:"flex", gap:3, alignItems:"center" }}>
                <span style={{ fontSize:10, color:"var(--muted)" }}>Uitslag:</span>
                <span style={{ fontWeight:700, color:"var(--text)", background:"rgba(255,255,255,.06)", borderRadius:4, padding:"1px 7px", fontSize:13 }}>{r.home}–{r.away}</span>
              </div>
            )}
            {!r?.played && <span style={{ fontSize:10, color:"var(--muted)", fontStyle:"italic" }}>nog te spelen</span>}
          </div>
          <span style={{ flex:1, fontWeight:600 }}>{FLAG[m.away]} {m.away}</span>
          {res && <span style={{ minWidth:52, textAlign:"right", fontWeight:700, fontSize:11, color:res.pts>0?"var(--green)":"var(--red)" }}>{res.pts>0?`+${res.pts} ${labelBadge}`:"✗"}</span>}
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:10 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:900 }}>Hoi, {user.name}! 👋</div>
          <div style={{ color:"var(--muted)", fontSize:13, marginTop:2 }}>Positie #{rank} van {state.users.length} · {pts} punten</div>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {!state.extraFrozen && <button style={S.btn("var(--green)")} onClick={onEditExtra}>🔮 Extra vragen</button>}
          {state.extraFrozen && <button style={{ ...S.btn("var(--card2)"), border:"1px solid var(--border)" }} onClick={onEditExtra}>👁️ Extra vragen</button>}
          {!state.groupFrozen && <button style={S.btn()} onClick={onEditGroup}>⚽ Groepsfase</button>}
          {state.groupFrozen && <button style={{ ...S.btn("var(--card2)"), border:"1px solid var(--border)" }} onClick={onEditGroup}>👁️ Groepsfase</button>}
          {koAvailable && !state.koFrozen && <button style={S.btn("var(--orange)")} onClick={onEditKO}>⚔️ KO-fase</button>}
          {koAvailable && state.koFrozen && <button style={{ ...S.btn("var(--card2)"), border:"1px solid var(--border)" }} onClick={onEditKO}>👁️ KO-fase</button>}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:22 }}>
        <div style={{ ...S.card(), textAlign:"center" }}>
          <div style={{ fontFamily:"var(--font-display)", fontSize:28, color:"var(--accent)" }}>#{rank} <span style={{ fontSize:18 }}>van {state.users.length}</span></div>
          <div style={{ fontSize:11, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.08em" }}>Positie</div>
        </div>
        <div style={{ ...S.card(), textAlign:"center" }}>
          <div style={{ fontFamily:"var(--font-display)", fontSize:28, color:"var(--accent)" }}>{pts} pts</div>
          <div style={{ fontSize:11, color:"var(--muted)", textTransform:"uppercase", letterSpacing:"0.08em" }}>Jouw score</div>
        </div>
      </div>

      {/* Extra predictions */}
      <div style={{ marginBottom:22 }}>
        <div style={{ fontSize:12, fontWeight:700, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>Extra voorspellingen</div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {(() => {
            const surpriseStage = pred.surpriseTeam ? deriveSurpriseStage(pred.surpriseTeam, state.koResults) : null;
            const surprisePts = surpriseStage ? (PTS_SURPRISE[surpriseStage] || 0) : null;
            const topOuts = deriveTopOuts(state.results);
            const topOutCorrect = pred.topOut && topOuts.includes(pred.topOut);
            const topOutKnown = topOuts.length > 0;
            return [
              {label:"🏆 Kampioen", value:pred.champion, pts:PTS_EXTRA.champion, actual:state.koResults["FINAL"]?.winner, known:state.koResults["FINAL"]?.played, type:"simple"},
              {label:"⚽️ Topscorer", value:pred.topScorer, pts:PTS_EXTRA.topScorer, actual:state.results["TOP_SCORER"], known:!!state.results["TOP_SCORER"], type:"simple"},
              {label:"🇳🇱 Nederland", value:pred.nlStage, pts:PTS_EXTRA.nlStage, actual:state.results["NL_STAGE"], known:!!state.results["NL_STAGE"], type:"simple"},
              {label:"🌟 Verrassing", value:pred.surpriseTeam, type:"surprise", stage:surpriseStage, stagePts:surprisePts},
              {label:"💥 Topland uit", value:pred.topOut, type:"topout", correct:topOutCorrect, known:topOutKnown, allOuts:topOuts},
            ].map(item => (
              <div key={item.label} style={{ ...S.card(), flex:1, minWidth:120 }}>
                <div style={{ fontSize:11, color:"var(--muted)", marginBottom:4 }}>{item.label}</div>
                <div style={{ fontWeight:700, fontSize:13 }}>{item.value ? (FLAG[item.value]?`${FLAG[item.value]} ${item.value}`:item.value) : <span style={{ color:"var(--muted)" }}>–</span>}</div>
                {item.type === "simple" && item.known && (
                  <div style={{ fontSize:12, marginTop:4, color:item.value===item.actual?"var(--green)":"var(--red)", fontWeight:700 }}>{item.value===item.actual?`+${item.pts} ✓`:"✗"}</div>
                )}
                {item.type === "surprise" && item.stage && (
                  <div style={{ fontSize:11, marginTop:4, color:"var(--accent)", fontWeight:700 }}>{item.stage} → +{item.stagePts} pt</div>
                )}
                {item.type === "topout" && item.value && item.known && (
                  <div style={{ fontSize:12, marginTop:4, color:item.correct?"var(--green)":"var(--red)", fontWeight:700 }}>
                    {item.correct ? `+${PTS_TOP_OUT} ✓` : `✗`}
                  </div>
                )}
              </div>
            ));
          })()}
        </div>
      </div>

      {/* Recent + upcoming matches — group + KO unified */}
      <div style={{ marginBottom:22 }}>
        {last5.length > 0 && (
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:12, fontWeight:700, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>
              Laatste wedstrijden
            </div>
            {last5.map(m => m.isKO
              ? <KOMatchRow key={m.id} m={m} />
              : <MatchRow key={m.id} m={m} />
            )}
          </div>
        )}
        {next5.length > 0 && (
          <div>
            <div style={{ fontSize:12, fontWeight:700, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>
              Volgende wedstrijden
            </div>
            {next5.map(m => m.isKO
              ? <KOMatchRow key={m.id} m={m} />
              : <MatchRow key={m.id} m={m} />
            )}
          </div>
        )}
        {last5.length === 0 && next5.length === 0 && (
          <div style={{ ...S.card(), textAlign:"center", color:"var(--muted)", fontSize:13 }}>Nog geen wedstrijden in het schema.</div>
        )}
      </div>

      {/* Comparison modals */}
      {compareMatch && <SingleMatchCompare match={compareMatch} state={state} currentUserId={user.id} onClose={()=>setCompareMatch(null)} />}
      {comparePlayer && <PlayerCompare me={user} other={comparePlayer} state={state} onClose={()=>setComparePlayer(null)} />}
    </div>
  );
}

// ─── SPELREGELS ──────────────────────────────────────────────────────────────

function Rules() {
  return (
    <div>
      <div style={{ fontSize:13, fontWeight:700, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:18 }}>📋 Spelregels & Puntenschema</div>

      <div style={{ ...S.card(), marginBottom:14 }}>
        <div style={{ fontWeight:700, fontSize:15, marginBottom:10 }}>Hoe werkt het?</div>
        <div style={{ fontSize:13, color:"var(--muted)", lineHeight:1.8 }}>
          Voor het WK vul je al jouw voorspellingen in via drie onderdelen: <strong style={{color:"var(--text)"}}>Extra vragen</strong>, <strong style={{color:"var(--text)"}}>Groepsfase</strong> en — zodra de admin dit openzet — de <strong style={{color:"var(--text)"}}>KO-fase</strong>. Je verdient punten op basis van hoe goed jouw voorspellingen kloppen met de echte uitslagen.
        </div>
      </div>

      <div style={{ fontWeight:700, fontSize:14, color:"var(--accent)", marginBottom:10 }}>🔮 Extra vragen</div>
      <div style={{ ...S.card(), marginBottom:14 }}>
        {[
          ["🏆 Wereldkampioen", "Voorspel welk land het WK wint.", PTS_EXTRA.champion],
          ["⚽ Topscorer", "Kies een land en vervolgens de speler die de meeste doelpunten scoort. Bovenaan staan de spelers met de meeste kwalificatiedoelpunten.", PTS_EXTRA.topScorer],
          ["🇳🇱 Hoe ver komt Nederland?", "Voorspel in welke ronde Nederland uitvalt — of kampioen wordt.", PTS_EXTRA.nlStage],
          ["💥 Welk topland valt af?", "Kies een van de 12 hoogst geklasseerde landen die toch niet verder komt dan de groepsfase.", PTS_EXTRA.topOut],
        ].map(function(row){ var title=row[0]; var desc=row[1]; var pts=row[2]; return (
          <div key={title} style={{ borderBottom:"1px solid var(--border)", paddingBottom:10, marginBottom:10 }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
              <span style={{ fontWeight:700, fontSize:13 }}>{title}</span>
              <span style={{ color:"var(--accent)", fontWeight:700, fontSize:12 }}>+{pts} pt</span>
            </div>
            <div style={{ fontSize:12, color:"var(--muted)" }}>{desc}</div>
          </div>
        ); })}
        {/* Verrassing — inline met punten per ronde */}
        <div style={{ borderBottom:"1px solid var(--border)", paddingBottom:10, marginBottom:0 }}>
          <div style={{ fontWeight:700, fontSize:13, marginBottom:4 }}>🌟 Verrassing van het WK</div>
          <div style={{ fontSize:12, color:"var(--muted)", marginBottom:8 }}>Kies een van de 12 laagst geklasseerde landen. Je verdient meer punten naarmate dat land verder de KO-fase haalt:</div>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
            {Object.entries(PTS_SURPRISE).filter(function(e){return e[1]>0;}).map(function(e){ var s=e[0]; var p=e[1]; return (
              <div key={s} style={{ background:"rgba(88,166,255,.08)", border:"1px solid rgba(88,166,255,.2)", borderRadius:6, padding:"4px 10px", display:"flex", flexDirection:"column", alignItems:"center", gap:1 }}>
                <span style={{ fontSize:11, color:"var(--accent)", fontWeight:700 }}>+{p} pt</span>
                <span style={{ fontSize:10, color:"var(--muted)" }}>{s === "🏆 Wereldkampioen" ? "Kampioen" : s}</span>
              </div>
            ); })}
          </div>
        </div>
      </div>

      <div style={{ fontWeight:700, fontSize:14, color:"var(--accent)", marginBottom:10 }}>⚽ Groepsfase</div>
      <div style={{ ...S.card(), marginBottom:14 }}>
        <div style={{ fontSize:12, color:"var(--muted)", marginBottom:10 }}>Per wedstrijd vul je een verwachte uitslag in. De categorie is mutueel exclusief — je krijgt altijd de hoogste van toepassing zijnde score:</div>
        {[
          ["Exacte uitslag", "Bv. 2–1 is ook echt 2–1", PTS_GROUP.exact],
          ["Juist doelpuntenverschil", "Bv. jij zegt 3–1, het wordt 2–0 — beide winst met 2 verschil", PTS_GROUP.diff],
          ["Juiste winnaar of gelijkspel", "Je hebt de juiste richting, maar doelpuntenverschil klopt niet", PTS_GROUP.winner],
          ["Mis", "Fout resultaat — geen punten", 0],
        ].map(function(row){ var cat=row[0]; var desc=row[1]; var pts=row[2]; return (
          <div key={cat} style={{ display:"flex", gap:10, borderBottom:"1px solid var(--border)", paddingBottom:8, marginBottom:8 }}>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:700, fontSize:13 }}>{cat}</div>
              <div style={{ fontSize:11, color:"var(--muted)" }}>{desc}</div>
            </div>
            <div style={{ fontWeight:900, fontSize:18, color:pts>0?"var(--accent)":"var(--muted)", minWidth:40, textAlign:"right" }}>{pts>0?`+${pts}`:"-"}</div>
          </div>
        ); })}
        <div style={{ fontSize:12, color:"var(--muted)", marginBottom:6, fontWeight:600, marginTop:4 }}>Groepsstand (automatisch berekend uit jouw uitslagen):</div>
        {[
          ["Team in jouw top-2 én gaat echt door", PTS_STANDING.qualified],
          ["Zelfde positie (#1 of #2 exact correct)", PTS_STANDING.qualifiedCorrectPos],
        ].map(function(row){ var desc=row[0]; var pts=row[1]; return (
          <div key={desc} style={{ display:"flex", justifyContent:"space-between", fontSize:12, padding:"3px 0", borderBottom:"1px solid var(--border)" }}>
            <span style={{ color:"var(--muted)" }}>{desc}</span>
            <span style={{ fontWeight:700, color:"var(--accent)" }}>+{pts} pt</span>
          </div>
        ); })}
      </div>

      <div style={{ fontWeight:700, fontSize:14, color:"var(--accent)", marginBottom:10 }}>⚔️ KO-fase</div>
      <div style={{ ...S.card(), marginBottom:14 }}>
        <div style={{ fontSize:12, color:"var(--muted)", marginBottom:10 }}>
          Per KO-wedstrijd vul je de verwachte uitslag na 90 minuten in én wie er wint (bij gelijkspel gaat het door via verlenging/penalty's — de winnaar telt, niet de score na 90 min). Punten lopen op naarmate de ronde later is:
        </div>
        {[
          ["Zestiende finale", PTS_KO.r32],
          ["Achtste finale", PTS_KO.r16],
          ["Kwartfinale", PTS_KO.qf],
          ["Halve finale", PTS_KO.sf],
          ["Finale", PTS_KO.final],
        ].map(function(row){ var ronde=row[0]; var schema=row[1]; return (
          <div key={ronde} style={{ display:"flex", justifyContent:"space-between", fontSize:12, padding:"5px 0", borderBottom:"1px solid var(--border)", alignItems:"center" }}>
            <span style={{ color:"var(--muted)", fontWeight:600 }}>{ronde}</span>
            <div style={{ display:"flex", gap:8 }}>
              <span style={{ color:"var(--accent)" }}>winnaar: <strong>+{schema.winner}</strong></span>
              <span style={{ color:"var(--green)" }}>exacte stand: <strong>+{schema.exact}</strong></span>
            </div>
          </div>
        ); })}
        <div style={{ fontSize:11, color:"var(--muted)", marginTop:8 }}>
          💡 De exacte stand na 90 min is een bonus bovenop de winnaar-punten — je kunt beide verdienen in dezelfde wedstrijd.
        </div>
      </div>

      <div style={{ ...S.card(), background:"rgba(88,166,255,.04)", fontSize:12, color:"var(--muted)", lineHeight:1.8 }}>
        <div style={{ fontWeight:700, color:"var(--text)", marginBottom:6 }}>Tips</div>
        <div>✦ Extra vragen en groepsfase moeten voor het toernooi ingevuld zijn — daarna worden ze bevroren.</div>
        <div>✦ KO-voorspellingen open zodra de admin dit aanzet, soms al halverwege de groepsfase.</div>
        <div>✦ Hoe verder je land in de KO-fase is, hoe meer punten je verdient met de verrassing-voorspelling.</div>
        <div>✦ Klik op een wedstrijd of deelnemer in de stand om te vergelijken.</div>
      </div>
    </div>
  );
}


// ─── STANDINGS (with clickable names) ────────────────────────────────────────

function Standings({ state, currentUserId, onCompare }) {
  const ranked = [...state.users].map(u => ({ ...u, pts:calcPoints(u,state.results,state.koResults) })).sort((a,b)=>b.pts-a.pts);
  const canCompare = state.groupFrozen && currentUserId;
  return (
    <div>
      <div style={{ fontSize:13, fontWeight:700, color:"var(--accent)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:8 }}>🏅 Tussenstand</div>
      {canCompare && <div style={{ fontSize:11, color:"var(--muted)", marginBottom:12 }}>Klik op een naam om te vergelijken.</div>}
      {ranked.length===0 && <p style={{ color:"var(--muted)" }}>Nog geen deelnemers.</p>}
      {ranked.map((u,i)=>{
        const isMe = u.id === currentUserId;
        const clickable = canCompare && !isMe;
        return (
          <div key={u.id} onClick={clickable?()=>onCompare(u):undefined}
            style={{ display:"flex", alignItems:"center", gap:14, ...S.card(), marginBottom:8, background:i===0?"linear-gradient(135deg,rgba(212,175,55,.12),rgba(212,175,55,.04))":"var(--card)", border:`1px solid ${isMe?"var(--accent)":i===0?"rgba(212,175,55,.35)":"var(--border)"}`, cursor:clickable?"pointer":"default", transition:"opacity .15s" }}>
            <div style={{ fontSize:20, width:32, textAlign:"center" }}>{["🥇","🥈","🥉"][i]||`#${i+1}`}</div>
            <div style={{ flex:1, fontWeight:isMe?700:600 }}>{u.name}{isMe?" 👈":""}</div>
            {clickable && <div style={{ fontSize:11, color:"var(--muted)" }}>vergelijk →</div>}
            <div style={{ fontSize:26, fontWeight:900, color:i===0?"var(--gold)":"var(--accent)", fontFamily:"var(--font-display)" }}>{u.pts}</div>
            <div style={{ fontSize:11, color:"var(--muted)" }}>pts</div>
          </div>
        );
      })}
    </div>
  );
}


// ─── STAND WITH COMPARE ───────────────────────────────────────────────────────

function StandWithCompare({ state, currentUser }) {
  const [comparePlayer, setComparePlayer] = useState(null);
  return (
    <div>
      <Standings state={state} currentUserId={currentUser?.id} onCompare={setComparePlayer} />
      {comparePlayer && currentUser && (
        <PlayerCompare me={currentUser} other={comparePlayer} state={state} onClose={()=>setComparePlayer(null)} />
      )}
    </div>
  );
}


// ─── PASSWORD REVEAL (admin only) ────────────────────────────────────────────

function PwReveal({ u }) {
  const [show, setShow] = useState(false);
  if (!u.pwPlain) return null;
  return (
    <div style={{ display:"flex", alignItems:"center", gap:4 }}>
      <span style={{ fontSize:11, color:"var(--muted)", background:"var(--bg)", borderRadius:5, padding:"2px 8px", fontFamily:"monospace", letterSpacing:show?".05em":"0", minWidth:70, textAlign:"center" }}>
        {show ? u.pwPlain : "••••••••"}
      </span>
      <button onClick={()=>setShow(s=>!s)}
        style={{ background:"none", border:"1px solid var(--border)", borderRadius:5, color:"var(--muted)", cursor:"pointer", fontSize:10, padding:"2px 6px", fontFamily:"var(--font)" }}>
        {show?"verberg":"toon"}
      </button>
    </div>
  );
}


// ─── ADMIN PANEL ──────────────────────────────────────────────────────────────

function AdminPanel({ state, setState }) {
  const [tab, setTab] = useState("fase");
  const [activeGroup, setActiveGroup] = useState("A");

  const upd = (patch) => setState(s => { const ns={...s,...patch}; persist(ns); return ns; });
  const updResult = (id,field,val) => setState(s => { const ns={...s,results:{...s.results,[id]:{...(s.results[id]||{}),[field]:val}}}; persist(ns); return ns; });
  const updKO = (id,field,val) => setState(s => { const ns={...s,koResults:{...s.koResults,[id]:{...(s.koResults[id]||{}),[field]:val}}}; persist(ns); return ns; });
  const toggleLock = (uid) => setState(s => { const ns={...s,users:s.users.map(u=>u.id===uid?{...u,locked:!u.locked}:u)}; persist(ns); return ns; });
  const removeUser = (uid) => { if(!confirm("Verwijderen?"))return; setState(s=>{const ns={...s,users:s.users.filter(u=>u.id!==uid)};persist(ns);return ns;}); };

  return (
    <div>
      <div style={{ fontFamily:"var(--font-display)", fontSize:24, color:"var(--orange)", letterSpacing:"0.06em", marginBottom:20 }}>⚙️ ADMIN PANEEL</div>
      <TabBar tabs={[
        { id:"fase", label:"🔒 Bevriezen" },
        { id:"users", label:`👥 Deelnemers (${state.users.length})` },
        { id:"results", label:"📊 Groepsuitslagen" },
        { id:"ko", label:"⚔️ KO-uitslagen" },
        { id:"extra", label:"🏅 Extras" },
      ]} active={tab} onSelect={setTab} />

      {/* ── BEVRIEZEN ── */}
      {tab==="fase" && (
        <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
          {[
            { key:"groupFrozen",  icon:"⚽", label:"Groepsuitslagen", desc:"Deelnemers kunnen hun wedstrijduitslagen niet meer aanpassen" },
            { key:"extraFrozen",  icon:"🔮", label:"Extra vragen",    desc:"Kampioen, topscorer, Nederland, verrassing en topland" },
            { key:"koOpen",       icon:"⚔️", label:"KO-fase openen",  desc:"Deelnemers kunnen KO-voorspellingen invullen (ook halverwege de groepsfase)", invert:true },
            { key:"koFrozen",     icon:"⚔️", label:"KO-fase",        desc:"Deelnemers kunnen KO-voorspellingen niet meer aanpassen" },
          ].map(function(item) { var key=item.key; var icon=item.icon; var label=item.label; var desc=item.desc; var invert=item.invert;
            const active = state[key];
            return (
              <div key={key} style={{ ...S.card(), display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:600, fontSize:14 }}>{icon} {label}</div>
                  <div style={{ fontSize:12, color:"var(--muted)", marginTop:2 }}>{desc}</div>
                </div>
                <button onClick={()=>upd({[key]:!active})}
                  style={{ ...S.btn(invert ? (active?"var(--green)":"var(--card2)") : (active?"var(--red)":"var(--green)")), padding:"8px 18px", fontSize:13, border:`1px solid ${invert ? (active?"var(--green)":"var(--border)") : (active?"var(--red)":"var(--green)")}` }}>
                  {invert
                    ? (active ? "✓ Open" : "Openzetten")
                    : (active ? "🔒 Bevroren" : "🔓 Open")}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* ── DEELNEMERS ── */}
      {tab==="users" && (
        <div>
          {state.users.length===0&&<p style={{color:"var(--muted)"}}>Nog niemand geregistreerd.</p>}
          {state.users.map(u=>{
            const pts = calcPoints(u, state.results, state.koResults);
            const p = u.predictions || {};

            // Groepsfase progress: count filled matches out of 72
            const groupTotal = GROUP_MATCHES.length; // 72
            const groupFilled = GROUP_MATCHES.filter(m => p.matches?.[m.id]?.home !== undefined && p.matches[m.id].home !== "").length;
            const groupDone = groupFilled === groupTotal;
            const groupStarted = groupFilled > 0;

            // Extra vragen: 5 fields
            const extraFields = [
              !!p.champion,
              !!p.topScorer,
              !!p.nlStage,
              !!p.surpriseTeam,
              !!p.topOut,
            ];
            const extraFilled = extraFields.filter(Boolean).length;
            const extraTotal = extraFields.length;
            const extraDone = extraFilled === extraTotal;
            const extraStarted = extraFilled > 0;

            // KO: count filled winners out of 32 matches
            const koTotal = KO_STRUCTURE.length;
            const koFilled = KO_STRUCTURE.filter(m => p.koWinners?.[m.id]).length;
            const koDone = koFilled === koTotal;
            const koStarted = koFilled > 0;

            function StatusPill(props) { var label=props.label; var filled=props.filled; var total=props.total; var done=props.done; var started=props.started; var available=props.available;
              if (!available) return (
                <span style={{ fontSize:11, color:"var(--muted)", background:"rgba(255,255,255,.04)", borderRadius:4, padding:"2px 7px" }}>
                  {label} —
                </span>
              );
              const color = done ? "var(--green)" : started ? "var(--orange)" : "var(--muted)";
              const bg = done ? "rgba(63,185,80,.12)" : started ? "rgba(240,136,62,.12)" : "rgba(255,255,255,.04)";
              const icon = done ? "✓" : started ? "…" : "○";
              return (
                <span style={{ fontSize:11, color, background:bg, borderRadius:4, padding:"2px 7px", fontWeight:done?700:400 }}>
                  {icon} {label} {filled}/{total}
                </span>
              );
            };

            return (
              <div key={u.id} style={{ ...S.card(), marginBottom:10 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap", marginBottom:8 }}>
                  <div style={{ flex:1, fontWeight:700, fontSize:14 }}>{u.name}</div>
                  <div style={{ fontSize:13, color:"var(--accent)", fontWeight:700 }}>{pts} pt</div>
                  <PwReveal u={u} />
                  <button onClick={()=>toggleLock(u.id)} style={{ background:u.locked?"rgba(248,81,73,.15)":"rgba(63,185,80,.15)", border:`1px solid ${u.locked?"var(--red)":"var(--green)"}`, borderRadius:6, color:u.locked?"var(--red)":"var(--green)", padding:"3px 10px", cursor:"pointer", fontSize:11, fontFamily:"var(--font)" }}>{u.locked?"🔒":"🔓"}</button>
                  <button onClick={()=>removeUser(u.id)} style={{ background:"none", border:"1px solid var(--border)", borderRadius:6, color:"var(--muted)", padding:"3px 8px", cursor:"pointer", fontSize:11, fontFamily:"var(--font)" }}>✕</button>
                </div>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                  <StatusPill label="Extra" filled={extraFilled} total={extraTotal} done={extraDone} started={extraStarted} available={true} />
                  <StatusPill label="Groepsfase" filled={groupFilled} total={groupTotal} done={groupDone} started={groupStarted} available={true} />
                  <StatusPill label="KO-fase" filled={koFilled} total={koTotal} done={koDone} started={koStarted} available={state.koOpen||state.fase==="ko"} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── GROEPSUITSLAGEN ── */}
      {tab==="results" && (
        <div>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:14 }}>
            {"ABCDEFGHIJKL".split("").map(g=>(
              <button key={g} onClick={()=>setActiveGroup(g)} style={{ padding:"5px 13px", borderRadius:20, border:"1px solid var(--border)", background:activeGroup===g?"var(--accent)":"var(--bg)", color:activeGroup===g?"#fff":"var(--text)", cursor:"pointer", fontSize:13, fontWeight:600 }}>Groep {g}</button>
            ))}
          </div>

          {/* Auto-derived group standing */}
          {(() => {
            const adminS = deriveGroupStandingsFromResults(state.results);
            const s = adminS[activeGroup];
            if (!s || !s.table.some(r => r.gp > 0)) return (
              <div style={{ ...S.card(), marginBottom:12, fontSize:12, color:"var(--muted)" }}>
                Nog geen wedstrijden gespeeld in Groep {activeGroup} — stand wordt automatisch berekend.
              </div>
            );
            // Auto-sync GW / GR into results when all 6 group matches are played
            const allPlayed = GROUP_MATCHES.filter(m=>m.group===activeGroup).every(m=>state.results[m.id]?.played);
            if (allPlayed && s.winner && state.results[`GW_${activeGroup}`] !== s.winner) {
              // side-effect in render — use setTimeout to avoid setState during render
              setTimeout(() => setState(prev => {
                const ns = { ...prev, results: { ...prev.results, [`GW_${activeGroup}`]: s.winner, [`GR_${activeGroup}`]: s.runnerUp } };
                persist(ns); return ns;
              }), 0);
            }
            return (
              <div style={{ ...S.card(), marginBottom:12 }}>
                <div style={{ fontSize:11, fontWeight:700, color:"var(--green)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>
                  📊 Huidige stand Groep {activeGroup}
                  {allPlayed && <span style={{ marginLeft:8, color:"var(--accent)" }}>✓ Volledig gespeeld — top 2 automatisch bepaald</span>}
                </div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 30px 30px 30px 30px 30px 30px", gap:"0 4px", alignItems:"center", color:"var(--muted)", fontWeight:700, fontSize:11, textTransform:"uppercase", padding:"2px 4px", borderBottom:"1px solid var(--border)" }}>
                  <span>Team</span><span style={{textAlign:"center"}}>W</span><span style={{textAlign:"center"}}>P</span><span style={{textAlign:"center"}}>DS</span><span style={{textAlign:"center"}}>V</span><span style={{textAlign:"center"}}>T</span><span style={{textAlign:"center"}}>Pts</span>
                </div>
                {s.table.map((r,i) => (
                  <div key={r.team} style={{ display:"grid", gridTemplateColumns:"1fr 30px 30px 30px 30px 30px 30px", gap:"0 4px", alignItems:"center", padding:"5px 4px", background:i<2?"rgba(88,166,255,0.06)":"transparent", borderRadius:4, borderBottom:"1px solid rgba(48,54,61,.4)", fontSize:12 }}>
                    <span style={{ fontWeight:i<2?700:400, display:"flex", alignItems:"center", gap:5 }}>
                      <span style={{ color:i===0?"var(--gold)":i===1?"var(--muted)":"var(--border)", fontWeight:700, width:16 }}>{i===0?"①":i===1?"②":"○"}</span>
                      {FLAG[r.team]} {r.team}
                      {i===0&&<span style={{ fontSize:10, color:"var(--green)", marginLeft:4 }}>→ KO</span>}
                      {i===1&&<span style={{ fontSize:10, color:"var(--accent)", marginLeft:4 }}>→ KO</span>}
                    </span>
                    <span style={{textAlign:"center",color:"var(--muted)"}}>{r.gp}</span>
                    <span style={{textAlign:"center",color:"var(--muted)"}}>{r.gp}</span>
                    <span style={{textAlign:"center",color:r.gd>0?"var(--green)":r.gd<0?"var(--red)":"var(--muted)"}}>{r.gd>0?"+":""}{r.gd}</span>
                    <span style={{textAlign:"center",color:"var(--muted)"}}>{r.gf}</span>
                    <span style={{textAlign:"center",color:"var(--muted)"}}>{r.ga}</span>
                    <span style={{textAlign:"center",fontWeight:700,color:"var(--accent)"}}>{r.pts}</span>
                  </div>
                ))}
              </div>
            );
          })()}

          {GROUP_MATCHES.filter(m=>m.group===activeGroup).map(m=>{
            const r=state.results[m.id]||{};
            return (
              <div key={m.id} style={{ marginBottom:6 }}>
                <div style={{ fontSize:10, color:"var(--muted)", marginBottom:2, paddingLeft:2 }}>{m.dt?fmtDateTime(m.dt):""} · Ronde {m.round}</div>
                <div style={{ display:"flex", alignItems:"center", gap:8, ...S.card(), padding:"8px 12px", border:`1px solid ${r.played?"rgba(88,166,255,.4)":"var(--border)"}` }}>
                  <span style={{ flex:1, fontSize:13, textAlign:"right", fontWeight:600 }}>{FLAG[m.home]} {m.home}</span>
                  <input type="number" min={0} max={20} value={r.home??""} onChange={e=>updResult(m.id,"home",e.target.value)} style={S.numInput} />
                  <span style={{ color:"var(--muted)", fontWeight:700 }}>–</span>
                  <input type="number" min={0} max={20} value={r.away??""} onChange={e=>updResult(m.id,"away",e.target.value)} style={S.numInput} />
                  <span style={{ flex:1, fontSize:13, fontWeight:600 }}>{FLAG[m.away]} {m.away}</span>
                  <label style={{ fontSize:12, display:"flex", alignItems:"center", gap:4, cursor:"pointer", color:r.played?"var(--accent)":"var(--muted)", whiteSpace:"nowrap" }}>
                    <input type="checkbox" checked={!!r.played} onChange={e=>updResult(m.id,"played",e.target.checked)} /> Gespeeld
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── KO UITSLAGEN ── */}
      {tab==="ko" && (
        <div>
          <Alert msg="Vul de uitslag na 90 minuten in plus de officiële winnaar (na evt. verlenging/strafschoppen). Landen worden automatisch afgeleid uit de groepsstand." type="info" />
          {KO_STRUCTURE.map(m=>{
            const r=state.koResults[m.id]||{};
            // Build rich slot descriptors from admin results (same as participant view but using koResults for winner)
            const adminCtx = {
              adminStandings: deriveGroupStandingsFromResults(state.results),
              adminComplete: groupsAllFilled(id => { const res=state.results[id]; return res?.played?res:null; }),
              userStandings: null,
              userComplete: null,
              userKoWinners: Object.fromEntries(KO_STRUCTURE.map(function(km) { return [km.id, state.koResults[km.id] && state.koResults[km.id].winner]; }).filter(function(e){ return e[1]; })),
              adminKoResults: state.koResults,
            };
            const homeDesc = resolveSlotRich(m.homeSlot, adminCtx);
            const awayDesc  = resolveSlotRich(m.awaySlot, adminCtx);
            const homeCandidates = homeDesc?.type==="team"?[homeDesc.team]:homeDesc?.type==="two"?homeDesc.teams:[];
            const awayCandidates = awayDesc?.type==="team"?[awayDesc.team]:awayDesc?.type==="two"?awayDesc.teams:[];
            const candidates = [...new Set([...homeCandidates, ...awayCandidates])];
            const useButtons = candidates.length >= 1 && candidates.length <= 4;
            return (
              <div key={m.id} style={{ ...S.card(), marginBottom:10, border:`1px solid ${r.played?"rgba(88,166,255,.4)":"var(--border)"}` }}>
                <div style={{ fontSize:12, fontWeight:700, color:"var(--muted)", marginBottom:10, textTransform:"uppercase", letterSpacing:"0.07em" }}>{m.label}</div>

                {/* Teams */}
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                  <div style={{ flex:1, textAlign:"right" }}><SlotDisplay desc={homeDesc} align="right" size={13} /></div>
                  <div style={{ display:"flex", gap:4, alignItems:"center" }}>
                    <input type="number" min={0} max={20} value={r.home90??""} onChange={e=>updKO(m.id,"home90",e.target.value)} style={S.numInput} />
                    <span style={{ color:"var(--muted)", fontWeight:700 }}>–</span>
                    <input type="number" min={0} max={20} value={r.away90??""} onChange={e=>updKO(m.id,"away90",e.target.value)} style={S.numInput} />
                  </div>
                  <div style={{ flex:1 }}><SlotDisplay desc={awayDesc} align="left" size={13} /></div>
                </div>

                {/* Winner + played */}
                <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", borderTop:"1px solid var(--border)", paddingTop:8 }}>
                  <span style={{ fontSize:12, color:"var(--muted)" }}>Winnaar:</span>
                  {useButtons ? (
                    <div style={{ display:"flex", gap:6, flex:1 }}>
                      {candidates.map(t => (
                        <button key={t} onClick={() => updKO(m.id,"winner", r.winner===t?"":t)}
                          style={{ flex:1, minWidth:80, padding:"6px 8px", borderRadius:8, border:`2px solid ${r.winner===t?"var(--accent)":"var(--border)"}`, background:r.winner===t?"rgba(88,166,255,.15)":"var(--bg)", color:"var(--text)", cursor:"pointer", fontSize:12, fontWeight:r.winner===t?700:400, fontFamily:"var(--font)", display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
                          {FLAG[t]||"🏳️"} {t}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <select value={r.winner||""} onChange={e=>updKO(m.id,"winner",e.target.value)}
                      style={{ flex:1, background:"var(--bg)", color:"var(--text)", border:"1px solid var(--border)", borderRadius:6, padding:"6px 10px", fontSize:13, fontFamily:"var(--font)" }}>
                      <option value="">— selecteer winnaar —</option>
                      {ALL_TEAMS.map(t=><option key={t} value={t}>{FLAG[t]} {t}</option>)}
                    </select>
                  )}
                  <label style={{ fontSize:12, display:"flex", alignItems:"center", gap:4, cursor:"pointer", color:r.played?"var(--accent)":"var(--muted)", whiteSpace:"nowrap" }}>
                    <input type="checkbox" checked={!!r.played} onChange={e=>updKO(m.id,"played",e.target.checked)} /> Gespeeld
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── EXTRAS ── */}
      {tab==="extra" && (
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={S.card()}>
            <div style={{ fontSize:13, color:"var(--muted)", marginBottom:10 }}>⚽ Officiële topscorer (na toernooi)</div>
            <select
              value={state.results["TOP_SCORER_COUNTRY"]||""}
              onChange={e=>setState(s=>{const ns={...s,results:{...s.results,TOP_SCORER_COUNTRY:e.target.value,TOP_SCORER:""}};persist(ns);return ns;})}
              style={{ background:"var(--bg)", color:"var(--text)", border:"1px solid var(--border)", borderRadius:6, padding:"8px 12px", fontSize:14, width:"100%", marginBottom:8, fontFamily:"var(--font)" }}>
              <option value="">— kies land —</option>
              {Object.keys(PLAYERS_BY_COUNTRY).sort().map(c => <option key={c} value={c}>{FLAG[c]||"🏳️"} {c}</option>)}
            </select>
            {state.results["TOP_SCORER_COUNTRY"] && (
              <select
                value={state.results["TOP_SCORER"]||""}
                onChange={e=>setState(s=>{const ns={...s,results:{...s.results,TOP_SCORER:e.target.value}};persist(ns);return ns;})}
                style={{ background:"var(--bg)", color:"var(--text)", border:"1px solid var(--border)", borderRadius:6, padding:"8px 12px", fontSize:14, width:"100%", fontFamily:"var(--font)" }}>
                <option value="">— kies speler —</option>
                {[...(PLAYERS_BY_COUNTRY[state.results["TOP_SCORER_COUNTRY"]]||[])].sort((a,b)=>b.kwal-a.kwal).map(p => (
                  <option key={p.name} value={p.name}>{p.name} ({p.kwal} kwal. goals)</option>
                ))}
              </select>
            )}
          </div>
          <div style={S.card()}>
            <div style={{ fontSize:13, color:"var(--muted)", marginBottom:10 }}>🇳🇱 Hoe ver is Nederland gekomen?</div>
            <select value={state.results["NL_STAGE"]||""} onChange={e=>setState(s=>{const ns={...s,results:{...s.results,NL_STAGE:e.target.value}};persist(ns);return ns;})}
              style={{ background:"var(--bg)", color:"var(--text)", border:"1px solid var(--border)", borderRadius:6, padding:"8px 12px", fontSize:14, width:"100%", fontFamily:"var(--font)" }}>
              <option value="">— nog niet bekend —</option>
              {NL_STAGES.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {/* Auto-derived: toplands and surprises */}
          {(() => {
            const topOuts = deriveTopOuts(state.results);
            const surpriseProgress = SURPRISE_TEAMS.map(team => ({
              team,
              stage: deriveSurpriseStage(team, state.koResults),
            })).filter(s => s.stage);
            return (
              <>
                <div style={{ ...S.card(), background:"rgba(88,166,255,.04)" }}>
                  <div style={{ fontSize:13, color:"var(--muted)", marginBottom:8 }}>💥 Toplands uitgeschakeld in groepsfase (automatisch)</div>
                  <div style={{ fontSize:11, color:"var(--muted)", marginBottom:8 }}>Wordt bepaald zodra alle groepswedstrijden gespeeld zijn.</div>
                  {topOuts.length === 0
                    ? <span style={{ fontSize:12, color:"var(--muted)", fontStyle:"italic" }}>Nog geen volledig gespeelde groepen met toplands</span>
                    : <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                        {topOuts.map(t => (
                          <span key={t} style={{ background:"rgba(248,81,73,.15)", border:"1px solid var(--red)", borderRadius:6, padding:"3px 10px", fontSize:13, fontWeight:700, color:"var(--red)" }}>
                            {FLAG[t]||"🏳️"} {t}
                          </span>
                        ))}
                      </div>
                  }
                </div>
                <div style={{ ...S.card(), background:"rgba(88,166,255,.04)" }}>
                  <div style={{ fontSize:13, color:"var(--muted)", marginBottom:8 }}>🌟 Verrassing-landen in KO-fase (automatisch)</div>
                  <div style={{ fontSize:11, color:"var(--muted)", marginBottom:8 }}>Punten worden automatisch berekend op basis van KO-uitslagen.</div>
                  {surpriseProgress.length === 0
                    ? <span style={{ fontSize:12, color:"var(--muted)", fontStyle:"italic" }}>Nog geen KO-wedstrijden gespeeld</span>
                    : <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                        {surpriseProgress.map(function(sp) { var team=sp.team; var stage=sp.stage; return (
                          <div key={team} style={{ display:"flex", alignItems:"center", gap:10, fontSize:13 }}>
                            <span style={{ fontWeight:700 }}>{FLAG[team]||"🏳️"} {team}</span>
                            <span style={{ color:"var(--muted)" }}>→</span>
                            <span style={{ color:"var(--accent)", fontWeight:700 }}>{stage}</span>
                            <span style={{ color:"var(--green)", fontWeight:700 }}>+{PTS_SURPRISE[stage]||0} pt</span>
                          </div>
                        ); })}
                      </div>
                  }
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}


// ─── APP ROOT ─────────────────────────────────────────────────────────────────


export {
  MyOverview,
  Rules,
  Standings,
  StandWithCompare,
  PwReveal,
  AdminPanel
};
