var CSS_VARS = { "--bg":"#0d1117","--card":"#161b22","--card2":"#1c2330","--border":"#30363d","--text":"#e6edf3","--muted":"#8b949e","--accent":"#58a6ff","--gold":"#D4AF37","--green":"#3fb950","--red":"#f85149","--orange":"#f0883e","--font":"'Barlow', sans-serif","--font-display":"'Bebas Neue', cursive" };

var S = {
  input: { background:"var(--bg)", color:"var(--text)", border:"1px solid var(--border)", borderRadius:8, padding:"10px 14px", fontSize:14, width:"100%", outline:"none", fontFamily:"var(--font)" },
  btn: function(c) { return { background:c||"var(--accent)", color:"#fff", border:"none", borderRadius:8, padding:"10px 20px", fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"var(--font)" }; },
  card: function() { return { background:"var(--card)", border:"1px solid var(--border)", borderRadius:10, padding:"14px 16px" }; },
  numInput: { width:46, textAlign:"center", background:"var(--bg)", color:"var(--text)", border:"1px solid var(--border)", borderRadius:6, padding:"5px 3px", fontSize:16, fontWeight:700, fontFamily:"var(--font)" },
};

export { CSS_VARS, S };
