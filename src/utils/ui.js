const S = {
  input: {
    background: "var(--bg)",
    color: "var(--text)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 14,
    width: "100%",
    outline: "none",
    fontFamily: "var(--font)",
  },

  btn: (color) => ({
    background: color || "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 20px",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    fontFamily: "var(--font)",
  }),

  card: () => ({
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: 10,
    padding: "14px 16px",
  }),

  numInput: {
    width: 46,
    textAlign: "center",
    background: "var(--bg)",
    color: "var(--text)",
    border: "1px solid var(--border)",
    borderRadius: 6,
    padding: "5px 3px",
    fontSize: 16,
    fontWeight: 700,
    fontFamily: "var(--font)",
  },
};

export { S };
