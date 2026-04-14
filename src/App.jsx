import { useState, useRef } from "react";

const SYSTEM_PROMPT = `You are a professional translator with 20+ years of experience specializing in English to Indonesian translation.

Your task is to translate any given English text into Indonesian AND generate natural response options.

Return ONLY this exact JSON structure, no markdown, no backticks, no extra text:

{
  "original": "<the input text>",
  "formal": "<formal Indonesian translation of original>",
  "informal": "<informal/casual Indonesian translation of original>",
  "context": "<brief context/idiom explanation in Indonesian, or 'Tidak diperlukan'>",
  "responses": {
    "positive": {
      "en": "<a natural POSITIVE/AGREEABLE response to the original sentence in English>",
      "formal_id": "<formal Indonesian translation of the positive response>",
      "informal_id": "<informal Indonesian translation of the positive response>"
    },
    "negative": {
      "en": "<a natural NEGATIVE/DISAGREEING response to the original sentence in English>",
      "formal_id": "<formal Indonesian translation of the negative response>",
      "informal_id": "<informal Indonesian translation of the negative response>"
    },
    "question": {
      "en": "<a natural QUESTION response to the original sentence in English>",
      "formal_id": "<formal Indonesian translation of the question response>",
      "informal_id": "<informal Indonesian translation of the question response>"
    }
  }
}

RULES:
- Responses must feel like real conversational replies, not just transformations
- Example: "I love you" → positive: "I love you too", negative: "I don't love you", question: "Do you love me?"
- Example: "Let's go to the beach" → positive: "Sure, that sounds great!", negative: "I don't feel like going today.", question: "Which beach do you have in mind?"
- Example: "I'm tired" → positive: "Me too, let's rest.", negative: "I'm not tired at all.", question: "Did you sleep well last night?"
- Keep responses short, natural, conversational
- Use natural Indonesian — NOT robotic Google Translate style
- Informal = use gue/lo or aku/kamu style naturally
- Return ONLY valid JSON`;

const EXAMPLES = [
  "I love you.",
  "Let's go to the beach.",
  "I'm really tired today.",
  "You did a great job!",
  "I can't make it tonight.",
];

const RESPONSE_TYPES = [
  {
    key: "positive",
    icon: "✅",
    label: "Jawaban Positif",
    sublabel: "Setuju / Afirmatif",
    labelColor: "#4ade80",
    bg: "rgba(74,222,128,0.06)",
    border: "rgba(74,222,128,0.22)",
    tagColor: "#22c55e",
    tag: "Positive Reply",
  },
  {
    key: "negative",
    icon: "❌",
    label: "Jawaban Negatif",
    sublabel: "Menolak / Menyangkal",
    labelColor: "#f87171",
    bg: "rgba(248,113,113,0.06)",
    border: "rgba(248,113,113,0.22)",
    tagColor: "#ef4444",
    tag: "Negative Reply",
  },
  {
    key: "question",
    icon: "❓",
    label: "Jawaban Tanya",
    sublabel: "Balik Bertanya",
    labelColor: "#60a5fa",
    bg: "rgba(96,165,250,0.06)",
    border: "rgba(96,165,250,0.22)",
    tagColor: "#3b82f6",
    tag: "Question Reply",
  },
];

export default function TranslatorAgent() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("translation");
  const [activeResponse, setActiveResponse] = useState("positive");
  const textareaRef = useRef(null);

  const translate = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setLoading(true);
    setError("");
    setResult(null);
    setActiveTab("translation");
    setActiveResponse("positive");

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1500,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: trimmed }],
        }),
      });
      const data = await response.json();
      const raw = data.content?.map((b) => b.text || "").join("") || "";
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
      setHistory((prev) => [parsed, ...prev].slice(0, 5));
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const activeRT = RESPONSE_TYPES.find((r) => r.key === activeResponse);

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", color: "#e8e6f0", fontFamily: "'Georgia', serif", position: "relative", overflow: "hidden" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .ex-btn:hover { background: rgba(120,80,255,0.15) !important; color: #c4b8ff !important; }
        .tab-btn { transition: all 0.2s; }
        .tab-btn:hover { opacity: 0.8; }
        .rt-pill:hover { opacity: 1 !important; transform: translateY(-1px); }
        .hist-row:hover { background: rgba(255,255,255,0.04) !important; }
        .summary-row:hover { opacity: 1 !important; background: rgba(255,255,255,0.03) !important; border-radius: 8px; }
      `}</style>

      {/* BG glow */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 80% 55% at 50% 0%, rgba(120,80,255,0.12) 0%, transparent 68%), radial-gradient(ellipse 55% 40% at 85% 100%, rgba(255,140,60,0.07) 0%, transparent 60%)" }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 820, margin: "0 auto", padding: "44px 22px 80px" }}>

        {/* ── HEADER ── */}
        <div style={{ textAlign: "center", marginBottom: 42 }}>
          <div style={{ display: "inline-block", fontSize: 11, letterSpacing: "0.26em", textTransform: "uppercase", color: "#a08eff", background: "rgba(120,80,255,0.12)", border: "1px solid rgba(120,80,255,0.25)", borderRadius: 3, padding: "5px 14px", marginBottom: 18 }}>
            AI Translation Agent
          </div>
          <h1 style={{ fontSize: "clamp(28px,5vw,48px)", fontWeight: 400, letterSpacing: "-0.02em", margin: "0 0 10px", lineHeight: 1.1, background: "linear-gradient(135deg,#fff 0%,#c4b8ff 55%,#ff9f60 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            English → Indonesian
          </h1>
          <p style={{ color: "#7a7490", fontSize: 14, margin: 0, fontStyle: "italic" }}>
            Formal & santai · Opsi jawaban: positif · negatif · tanya
          </p>
        </div>

        {/* ── INPUT ── */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: 22, marginBottom: 14 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#6b6580", marginBottom: 10 }}>📥 English Text</div>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) translate(input); }}
            placeholder="Type your English sentence here…"
            rows={3}
            style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: "#e8e6f0", fontSize: 16, lineHeight: 1.7, resize: "vertical", fontFamily: "'Georgia', serif", boxSizing: "border-box" }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, color: "#4a4560" }}>⌘ + Enter to translate</span>
            <button
              onClick={() => translate(input)}
              disabled={loading || !input.trim()}
              style={{ background: loading ? "rgba(120,80,255,0.3)" : "linear-gradient(135deg,#7850ff,#a070ff)", border: "none", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 600, padding: "10px 26px", cursor: loading || !input.trim() ? "not-allowed" : "pointer", letterSpacing: "0.05em", transition: "all 0.2s", opacity: !input.trim() ? 0.45 : 1 }}
            >
              {loading ? "Menerjemahkan…" : "Terjemahkan →"}
            </button>
          </div>
        </div>

        {/* ── EXAMPLES ── */}
        <div style={{ marginBottom: 34 }}>
          <div style={{ fontSize: 11, color: "#4a4560", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 9 }}>Contoh cepat:</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7 }}>
            {EXAMPLES.map((ex, i) => (
              <button key={i} className="ex-btn"
                onClick={() => { setInput(ex); translate(ex); }}
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 20, color: "#9a90b8", fontSize: 12, padding: "6px 14px", cursor: "pointer", transition: "all 0.15s", fontFamily: "'Georgia',serif" }}>
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* ── ERROR ── */}
        {error && <div style={{ background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.2)", borderRadius: 12, padding: "13px 18px", color: "#ff8080", marginBottom: 22, fontSize: 14 }}>{error}</div>}

        {/* ── LOADING ── */}
        {loading && (
          <div style={{ textAlign: "center", padding: "38px 0" }}>
            <div style={{ display: "inline-block", width: 34, height: 34, border: "2px solid rgba(120,80,255,0.2)", borderTop: "2px solid #a070ff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <div style={{ color: "#6b6580", fontSize: 13, marginTop: 12, fontStyle: "italic" }}>Menerjemahkan & membuat opsi jawaban…</div>
          </div>
        )}

        {/* ── RESULTS ── */}
        {result && !loading && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>

            {/* Tab bar */}
            <div style={{ display: "flex", gap: 4, marginBottom: 18, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: 4 }}>
              {[{ id: "translation", icon: "🌐", label: "Terjemahan" }, { id: "responses", icon: "💬", label: "Opsi Jawaban" }].map((tab) => (
                <button key={tab.id} className="tab-btn"
                  onClick={() => setActiveTab(tab.id)}
                  style={{ flex: 1, padding: "10px 14px", borderRadius: 9, border: "none", background: activeTab === tab.id ? "rgba(120,80,255,0.25)" : "transparent", color: activeTab === tab.id ? "#c4b8ff" : "#6b6580", fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400, cursor: "pointer", fontFamily: "'Georgia',serif", borderBottom: activeTab === tab.id ? "2px solid #a070ff" : "2px solid transparent" }}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* ══ TRANSLATION TAB ══ */}
            {activeTab === "translation" && (
              <div>
                <Card icon="📥" label="ORIGINAL" labelColor="#6b6580" bg="rgba(255,255,255,0.02)" border="rgba(255,255,255,0.06)">
                  <div style={{ fontStyle: "italic", color: "#9a90b8", fontSize: 15 }}>"{result.original}"</div>
                </Card>
                <Card icon="🎓" label="FORMAL (RESMI)" labelColor="#a08eff" bg="rgba(120,80,255,0.06)" border="rgba(120,80,255,0.2)" tag="Bahasa Resmi" tagColor="#7850ff">
                  <div style={{ fontSize: 17, lineHeight: 1.75, color: "#e8e6f0" }}>{result.formal}</div>
                </Card>
                <Card icon="💬" label="INFORMAL (SANTAI)" labelColor="#ffb060" bg="rgba(255,140,60,0.05)" border="rgba(255,140,60,0.2)" tag="Bahasa Sehari-hari" tagColor="#ff9f60">
                  <div style={{ fontSize: 17, lineHeight: 1.75, color: "#e8e6f0" }}>{result.informal}</div>
                </Card>
                {result.context && result.context !== "Tidak diperlukan" ? (
                  <Card icon="🧠" label="CONTEXT / CATATAN" labelColor="#60c8a0" bg="rgba(60,180,120,0.05)" border="rgba(60,180,120,0.2)">
                    <div style={{ fontSize: 14, lineHeight: 1.7, color: "#9ab8a8" }}>{result.context}</div>
                  </Card>
                ) : (
                  <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 12, padding: "13px 18px", marginBottom: 10, display: "flex", alignItems: "center", gap: 9 }}>
                    <span>🧠</span>
                    <span style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#60c8a0" }}>CONTEXT / CATATAN</span>
                    <span style={{ fontSize: 12, color: "#4a4560", marginLeft: "auto", fontStyle: "italic" }}>Tidak diperlukan</span>
                  </div>
                )}
                <div style={{ display: "flex", gap: 9, marginTop: 18, flexWrap: "wrap" }}>
                  <CopyBtn label="Salin Formal" text={result.formal} color="#7850ff" />
                  <CopyBtn label="Salin Santai" text={result.informal} color="#ff9f60" />
                </div>
              </div>
            )}

            {/* ══ RESPONSES TAB ══ */}
            {activeTab === "responses" && result.responses && (
              <div>
                {/* Context bubble — original sentence */}
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "14px 18px", marginBottom: 18, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 13 }}>🗣️</span>
                  <div>
                    <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#5a5570", marginBottom: 3 }}>Kalimat asal</div>
                    <div style={{ fontSize: 15, color: "#c4b8e8", fontStyle: "italic" }}>"{result.original}"</div>
                  </div>
                  <div style={{ marginLeft: "auto", fontSize: 10, color: "#4a4560", textAlign: "right", lineHeight: 1.5 }}>
                    Pilih opsi<br />jawaban di bawah ↓
                  </div>
                </div>

                {/* 3 pill selectors */}
                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                  {RESPONSE_TYPES.map((rt) => (
                    <button key={rt.key} className="rt-pill"
                      onClick={() => setActiveResponse(rt.key)}
                      style={{
                        flex: 1, padding: "13px 8px", borderRadius: 14,
                        border: `1px solid ${activeResponse === rt.key ? rt.border : "rgba(255,255,255,0.07)"}`,
                        background: activeResponse === rt.key ? rt.bg : "rgba(255,255,255,0.02)",
                        color: activeResponse === rt.key ? rt.labelColor : "#6b6580",
                        fontSize: 11, fontWeight: activeResponse === rt.key ? 700 : 400,
                        cursor: "pointer", transition: "all 0.2s", fontFamily: "'Georgia',serif",
                        textAlign: "center", opacity: activeResponse === rt.key ? 1 : 0.65,
                      }}>
                      <div style={{ fontSize: 20, marginBottom: 5 }}>{rt.icon}</div>
                      <div style={{ letterSpacing: "0.04em", textTransform: "uppercase" }}>{rt.label.replace("Jawaban ", "")}</div>
                    </button>
                  ))}
                </div>

                {/* Active response detail */}
                {activeRT && result.responses[activeResponse] && (
                  <div style={{ animation: "fadeUp 0.28s ease" }}>

                    {/* Badge header */}
                    <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "13px 18px", background: activeRT.bg, border: `1px solid ${activeRT.border}`, borderRadius: 14, marginBottom: 14 }}>
                      <span style={{ fontSize: 22 }}>{activeRT.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: activeRT.labelColor }}>{activeRT.label}</div>
                        <div style={{ fontSize: 11, color: "#6b6580", marginTop: 1 }}>{activeRT.sublabel}</div>
                      </div>
                      <span style={{ marginLeft: "auto", fontSize: 10, color: activeRT.tagColor, background: `${activeRT.tagColor}18`, border: `1px solid ${activeRT.tagColor}40`, borderRadius: 20, padding: "3px 11px", fontWeight: 600, letterSpacing: "0.05em" }}>
                        {activeRT.tag}
                      </span>
                    </div>

                    {/* Chat bubble style: original → response */}
                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "16px 18px", marginBottom: 10 }}>
                      <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#5a5570", marginBottom: 12 }}>🇬🇧 DIALOG (ENGLISH)</div>
                      {/* Original bubble */}
                      <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 10 }}>
                        <div style={{ background: "rgba(120,80,255,0.15)", border: "1px solid rgba(120,80,255,0.2)", borderRadius: "4px 14px 14px 14px", padding: "9px 14px", maxWidth: "75%" }}>
                          <div style={{ fontSize: 10, color: "#a08eff", marginBottom: 4, letterSpacing: "0.08em" }}>Kalimat asal</div>
                          <div style={{ fontSize: 14, color: "#d8d4f0", fontStyle: "italic" }}>{result.original}</div>
                        </div>
                      </div>
                      {/* Response bubble */}
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <div style={{ background: activeRT.bg, border: `1px solid ${activeRT.border}`, borderRadius: "14px 4px 14px 14px", padding: "9px 14px", maxWidth: "75%" }}>
                          <div style={{ fontSize: 10, color: activeRT.labelColor, marginBottom: 4, letterSpacing: "0.08em" }}>{activeRT.label}</div>
                          <div style={{ fontSize: 15, color: "#e8e6f0", fontWeight: 500 }}>{result.responses[activeResponse].en}</div>
                        </div>
                      </div>
                    </div>

                    {/* Formal ID */}
                    <div style={{ background: "rgba(120,80,255,0.06)", border: "1px solid rgba(120,80,255,0.2)", borderRadius: 14, padding: "16px 18px", marginBottom: 10 }}>
                      <div style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#a08eff", marginBottom: 9, display: "flex", alignItems: "center", gap: 6 }}>
                        🎓 FORMAL (RESMI)
                        <span style={{ marginLeft: "auto", fontSize: 10, color: "#7850ff", background: "rgba(120,80,255,0.15)", border: "1px solid rgba(120,80,255,0.3)", borderRadius: 20, padding: "2px 9px" }}>Bahasa Resmi</span>
                      </div>
                      <div style={{ fontSize: 16, lineHeight: 1.7, color: "#e8e6f0" }}>{result.responses[activeResponse].formal_id}</div>
                    </div>

                    {/* Informal ID */}
                    <div style={{ background: "rgba(255,140,60,0.05)", border: "1px solid rgba(255,140,60,0.2)", borderRadius: 14, padding: "16px 18px", marginBottom: 16 }}>
                      <div style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#ffb060", marginBottom: 9, display: "flex", alignItems: "center", gap: 6 }}>
                        💬 INFORMAL (SANTAI)
                        <span style={{ marginLeft: "auto", fontSize: 10, color: "#ff9f60", background: "rgba(255,140,60,0.15)", border: "1px solid rgba(255,140,60,0.3)", borderRadius: 20, padding: "2px 9px" }}>Bahasa Sehari-hari</span>
                      </div>
                      <div style={{ fontSize: 16, lineHeight: 1.7, color: "#e8e6f0" }}>{result.responses[activeResponse].informal_id}</div>
                    </div>

                    {/* Copy row */}
                    <div style={{ display: "flex", gap: 9, flexWrap: "wrap", marginBottom: 26 }}>
                      <CopyBtn label="Salin (EN)" text={result.responses[activeResponse].en} color="#a08eff" />
                      <CopyBtn label="Salin Formal" text={result.responses[activeResponse].formal_id} color="#7850ff" />
                      <CopyBtn label="Salin Santai" text={result.responses[activeResponse].informal_id} color="#ff9f60" />
                    </div>

                    {/* Summary: all 3 response options */}
                    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "16px 18px" }}>
                      <div style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#4a4560", marginBottom: 14 }}>
                        📋 SEMUA OPSI JAWABAN (FORMAL)
                      </div>
                      {RESPONSE_TYPES.map((rt, idx) => (
                        <div key={rt.key} className="summary-row"
                          onClick={() => setActiveResponse(rt.key)}
                          style={{ display: "flex", gap: 11, alignItems: "flex-start", padding: "10px 6px", borderBottom: idx < 2 ? "1px solid rgba(255,255,255,0.04)" : "none", cursor: "pointer", transition: "all 0.15s", opacity: activeResponse === rt.key ? 1 : 0.55 }}>
                          <span style={{ fontSize: 17, flexShrink: 0, marginTop: 2 }}>{rt.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 10, color: rt.labelColor, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 3 }}>{rt.label}</div>
                            <div style={{ fontSize: 13, color: "#c8c4d8", lineHeight: 1.6 }}>
                              {result.responses[rt.key]?.formal_id || "—"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── HISTORY ── */}
        {history.length > 1 && (
          <div style={{ marginTop: 50 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", color: "#4a4560", marginBottom: 14, paddingBottom: 10, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              Riwayat Terjemahan
            </div>
            {history.slice(1).map((item, i) => (
              <div key={i} className="hist-row"
                onClick={() => { setResult(item); setActiveTab("translation"); }}
                style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "11px 15px", marginBottom: 7, cursor: "pointer", transition: "all 0.15s" }}>
                <div style={{ fontSize: 13, color: "#9a90b8", fontStyle: "italic", marginBottom: 3 }}>"{item.original.slice(0, 65)}{item.original.length > 65 ? "…" : ""}"</div>
                <div style={{ fontSize: 12, color: "#6b6580" }}>{item.formal.slice(0, 65)}{item.formal.length > 65 ? "…" : ""}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Card({ icon, label, labelColor, bg, border, tag, tagColor, children }) {
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: "18px 20px", marginBottom: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 15 }}>{icon}</span>
        <span style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: labelColor, fontWeight: 700 }}>{label}</span>
        {tag && <span style={{ marginLeft: "auto", fontSize: 10, color: tagColor, background: `${tagColor}18`, border: `1px solid ${tagColor}40`, borderRadius: 20, padding: "2px 9px", letterSpacing: "0.04em" }}>{tag}</span>}
      </div>
      {children}
    </div>
  );
}

function CopyBtn({ label, text, color }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const fallback = () => {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try { document.execCommand("copy"); } catch (e) {}
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(fallback);
    } else {
      fallback();
    }
  };

  return (
    <button
      onClick={handleCopy}
      style={{ background: copied ? `${color}30` : "rgba(255,255,255,0.04)", border: `1px solid ${copied ? color : "rgba(255,255,255,0.08)"}`, borderRadius: 8, color: copied ? color : "#6b6580", fontSize: 12, padding: "7px 16px", cursor: "pointer", transition: "all 0.2s", fontFamily: "'Georgia',serif" }}>
      {copied ? "✓ Tersalin!" : label}
    </button>
  );
}
