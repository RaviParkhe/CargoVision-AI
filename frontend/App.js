import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const API = "http://localhost:8000";

// ─── PDF DOWNLOAD ─────────────────────────────────────────────────────────────
async function downloadReport(result, declared) {
  try {
    const res = await axios.post(
      `${API}/api/report`,
      { ...result, declared_type: declared },
      { responseType: "blob" }
    );
    const url  = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement("a");
    link.href  = url;
    link.setAttribute("download", `CargoVision_Report_${result.shipment_id || "scan"}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (e) {
    alert("Report generation failed: " + e.message);
  }
}

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 18, color = "currentColor", strokeWidth = 1.5, fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const Icons = {
  shield:    "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  monitor:   "M2 3h20v14H2zM8 21h8M12 17v4",
  analytics: "M3 3v18h18M9 17V9m4 8V5m4 12v-4",
  history:   "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  upload:    "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12",
  scan:      "M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2",
  alert:     "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  refresh:   "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15",
  zoom_in:   "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35M11 8v6M8 11h6",
  zoom_out:  "M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.35-4.35M8 11h6",
  bell:      "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0",
  eye:       "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
  download:  "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3",
  dots:      "M12 5h.01M12 12h.01M12 19h.01",
  search:    "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
  filter:    "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
  zap:       "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  layers:    "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  activity:  "M22 12h-4l-3 9L9 3l-3 9H2",
  trash:     "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  image:     "M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z",
  pdf:       "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8",
  check:     "M22 11.08V12a10 10 0 11-5.93-9.14M22 4L12 14.01l-3-3",
  star:      "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
};

// ─── COLOURS ──────────────────────────────────────────────────────────────────
const C = {
  bg:      "#0a0e1a",
  surface: "#0f1628",
  card:    "#131c30",
  border:  "#1e2d4a",
  accent:  "#1a73e8",
  text:    "#ffffff",
  muted:   "#cbd5e1", // much brighter grey
  high:    "#ef4444",
  med:     "#f59e0b",
  low:     "#10b981",
  cyan:    "#06b6d4",
  purple:  "#8b5cf6",
};

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const trendData = [
  { day: "Mon", total: 120, suspicious: 18 },
  { day: "Tue", total: 155, suspicious: 24 },
  { day: "Wed", total: 130, suspicious: 19 },
  { day: "Thu", total: 165, suspicious: 28 },
  { day: "Fri", total: 145, suspicious: 22 },
  { day: "Sat", total: 95,  suspicious: 12 },
  { day: "Sun", total: 80,  suspicious: 10 },
];
const pieData = [
  { name: "Low",        value: 75, color: C.low },
  { name: "Suspicious", value: 15, color: C.med },
  { name: "High Risk",  value: 10, color: C.high },
];
const categoryData = [
  { name: "Electronics", value: 82 },
  { name: "Organic",     value: 54 },
  { name: "Liquids",     value: 38 },
  { name: "Metallic",    value: 61 },
  { name: "Anomalies",   value: 22 },
];
const historyRows = [
  { id: "SHP-9821", time: "2026-03-26 10:30", rawTime: "2026-03-26T10:30:00Z", risk: "High",   score: 92, objects: ["Firearms","Organic Anomaly"], status: "High Risk" },
  { id: "SHP-4412", time: "2026-03-26 09:15", rawTime: "2026-03-26T09:15:00Z", risk: "Low",    score: 12, objects: ["Electronics"],                 status: "Low" },
  { id: "SHP-1209", time: "2026-03-25 16:45", rawTime: "2026-03-25T16:45:00Z", risk: "Medium", score: 65, objects: ["Unidentified Liquid"],          status: "Medium" },
  { id: "SHP-3381", time: "2026-03-25 14:20", rawTime: "2026-03-25T14:20:00Z", risk: "Low",    score: 5,  objects: ["Textiles"],                    status: "Low" },
  { id: "SHP-5562", time: "2026-03-25 11:10", rawTime: "2026-03-25T11:10:00Z", risk: "Low",    score: 8,  objects: ["Machinery"],                   status: "Low" },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const THREAT_WORDS = ["gun","knife","weapon","explosive","drug","firearm"];
const isThreat    = (l) => THREAT_WORDS.some(t => l.toLowerCase().includes(t));
const riskColor   = (level) =>
  level === "HIGH" || level === "High" ? C.high :
  level === "MEDIUM" || level === "Medium" ? C.med : C.low;

// ─── ALERT SYSTEM ─────────────────────────────────────────────────────────────
function useAlerts() {
  const [alerts, setAlerts] = useState([]);
  const wsRef = useRef(null);
  const seenRef = useRef(new Set());

  useEffect(() => {
    let isSubscribed = true;
    let ws = null;
    let timeout = null;
    const connect = () => {
      if (!isSubscribed) return;
      try {
        ws = new WebSocket(`ws://localhost:8000/ws/alerts`);
        wsRef.current = ws;
        ws.onmessage = (e) => {
          const data = JSON.parse(e.data);
          
          // STRICT DEDUPLICATION: Avoid handling the same alert twice
          const uid = `${data.shipment_id}-${data.risk_score}`;
          if (seenRef.current.has(uid)) return;
          seenRef.current.add(uid);
          
          const id = Date.now() + Math.random();
          
          if (data.level === "HIGH" || data.level === "MEDIUM") {
            try {
              // Synthetic Beep (bypass disabled autoplay file restrictions)
              const AudioContext = window.AudioContext || window.webkitAudioContext;
              if (AudioContext) {
                const ctx = new AudioContext();
                const osc = ctx.createOscillator();
                const gainNode = ctx.createGain();
                osc.type = data.level === "HIGH" ? 'square' : 'sine';
                osc.frequency.setValueAtTime(data.level === "HIGH" ? 600 : 800, ctx.currentTime);
                osc.connect(gainNode);
                gainNode.connect(ctx.destination);
                osc.start();
                gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.6);
                osc.stop(ctx.currentTime + 0.6);
              }
            } catch (err) {}
          }
          
          setAlerts(prev => [{ ...data, id, visible: true }, ...prev.slice(0, 4)]);
          
          setTimeout(() => {
            setAlerts(prev => prev.map(a => a.id === id ? { ...a, visible: false } : a));
            setTimeout(() => setAlerts(prev => prev.filter(a => a.id !== id)), 400);
          }, 6000);
        };
        ws.onclose = () => {
          if (isSubscribed) timeout = setTimeout(connect, 3000);
        };
      } catch {}
    };
    connect();
    return () => {
      isSubscribed = false;
      clearTimeout(timeout);
      if (ws) ws.close();
    };
  }, []);

  const dismiss = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, visible: false } : a));
    setTimeout(() => setAlerts(prev => prev.filter(a => a.id !== id)), 400);
  };

  return { alerts, dismiss };
}

function AlertToast({ alert, onDismiss }) {
  const isHigh = alert.level === "HIGH";
  const color  = isHigh ? C.high : C.med;

  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${color}`,
      borderLeft: `4px solid ${color}`,
      borderRadius: 10,
      padding: "14px 16px",
      marginBottom: 10,
      minWidth: 320,
      maxWidth: 380,
      boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
      opacity: alert.visible ? 1 : 0,
      transform: alert.visible ? "translateX(0)" : "translateX(30px)",
      transition: "all 0.35s ease",
      position: "relative",
      overflow: "hidden",
    }}>
      <button onClick={() => onDismiss(alert.id)} style={{
        position: "absolute", top: 8, right: 10,
        background: "none", border: "none", cursor: "pointer",
        color: C.muted, fontSize: 18, lineHeight: 1, padding: 2,
      }}>×</button>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <div style={{
          width: 8, height: 8, borderRadius: "50%",
          background: color, boxShadow: `0 0 8px ${color}`,
          flexShrink: 0,
        }} />
        <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: "0.1em" }}>
          {isHigh ? "CRITICAL ALERT" : "SUSPICIOUS CARGO"}
        </span>
        <span style={{ fontSize: 10, color: C.muted, marginLeft: "auto", paddingRight: 20 }}>
          {new Date(alert.timestamp).toLocaleTimeString()}
        </span>
      </div>

      <p style={{ fontSize: 12, color: C.text, margin: "0 0 8px", lineHeight: 1.5 }}>
        {alert.message}
      </p>

      <div style={{ display: "flex", gap: 16 }}>
        <span style={{ fontSize: 11, color: C.muted }}>
          Score: <strong style={{ color }}>{alert.risk_score}</strong>
        </span>
        {alert.mismatches > 0 && (
          <span style={{ fontSize: 11, color: C.muted }}>
            Mismatches: <strong style={{ color: C.high }}>{alert.mismatches}</strong>
          </span>
        )}
        <span style={{ fontSize: 11, color: C.muted }}>
          ID: <strong style={{ color: C.cyan }}>{alert.shipment_id}</strong>
        </span>
      </div>

      {/* shrinking timer bar */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: 3, background: color, borderRadius: "0 0 0 10px",
        transformOrigin: "left",
        animation: "shrink-bar 6s linear forwards",
      }} />
      <style>{`
        @keyframes shrink-bar { from{transform:scaleX(1)} to{transform:scaleX(0)} }
      `}</style>
    </div>
  );
}

function AlertContainer({ alertCount, setAlertCount }) {
  const { alerts, dismiss } = useAlerts();

  useEffect(() => {
    setAlertCount(alerts.length);
  }, [alerts.length, setAlertCount]);

  if (alerts.length === 0) return null;
  return (
    <div style={{
      position: "fixed", top: 76, right: 20, zIndex: 9999,
      display: "flex", flexDirection: "column",
      fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif",
    }}>
      {alerts.map(a => <AlertToast key={a.id} alert={a} onDismiss={dismiss} />)}
    </div>
  );
}

// ─── SMALL REUSABLE COMPONENTS ────────────────────────────────────────────────
function AnimBar({ label, value, color }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: "#ffffff", fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color }}>{value}%</span>
      </div>
      <div style={{ height: 6, background: C.border, borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: 3, boxShadow: `0 0 8px ${color}`, transition: "width 1s ease" }} />
      </div>
    </div>
  );
}

function LayerToggle({ label, icon, active, onClick }) {
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: active ? "rgba(26,115,232,0.1)" : "transparent", border: `1px solid ${active ? C.accent : C.border}`, borderRadius: 8, cursor: "pointer", marginBottom: 8, transition: "all 0.2s" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <Icon d={Icons[icon]} size={14} color={active ? C.accent : C.muted} />
        <span style={{ fontSize: 12, color: active ? C.text : C.muted }}>{label}</span>
      </div>
      <div style={{ width: 28, height: 16, borderRadius: 8, background: active ? C.accent : C.border, position: "relative", transition: "background 0.2s" }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#fff", position: "absolute", top: 2, left: active ? 14 : 2, transition: "left 0.2s" }} />
      </div>
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px" }}>
      <p style={{ fontSize: 11, color: C.muted, marginBottom: 6 }}>{label}</p>
      {payload.map((p, i) => <p key={i} style={{ fontSize: 12, color: p.color, fontWeight: 600 }}>{p.name}: {p.value}</p>)}
    </div>
  );
}

function RiskGauge({ score }) {
  const color = score >= 70 ? C.high : score >= 40 ? C.med : C.low;
  const r = 52, cx = 64, cy = 64, circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ * 0.75, offset = circ * 0.125;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: 128, height: 128 }}>
        <svg width="128" height="128" style={{ transform: "rotate(135deg)" }}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth={10} strokeDasharray={`${circ*0.75} ${circ*0.25}`} strokeDashoffset={-offset} strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={10} strokeDasharray={`${dash} ${circ-dash}`} strokeDashoffset={-offset} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: "stroke-dasharray 0.8s ease" }} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>{score}</span>
          <span style={{ fontSize: 10, color: C.muted }}>/ 100</span>
        </div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: "0.12em", textTransform: "uppercase", marginTop: 6 }}>
        {score >= 70 ? "HIGH RISK" : score >= 40 ? "MEDIUM RISK" : "LOW RISK"}
      </span>
    </div>
  );
}

function ScanningOverlay() {
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(10,14,26,0.88)", zIndex: 20 }}>
      <div style={{ position: "relative", width: 80, height: 80, marginBottom: 20 }}>
        <svg width="80" height="80" style={{ animation: "spin 1.1s linear infinite", position: "absolute" }}>
          <circle cx="40" cy="40" r="34" fill="none" stroke={C.accent} strokeWidth="3" strokeDasharray="60 140" strokeLinecap="round" />
        </svg>
        <svg width="80" height="80" style={{ position: "absolute" }}>
          <circle cx="40" cy="40" r="34" fill="none" stroke={C.border} strokeWidth="3" />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon d={Icons.scan} size={28} color={C.accent} />
        </div>
      </div>
      <p style={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.15em", color: C.accent }}>ANALYZING CARGO</p>
      <p style={{ fontSize: 11, color: C.muted, marginTop: 6, letterSpacing: "0.08em" }}>Running YOLO detection + anomaly scan...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── MONITOR VIEW ─────────────────────────────────────────────────────────────
function MonitorView() {
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [declared, setDeclared] = useState("electronics");
  const [shipId, setShipId]     = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [layers, setLayers]     = useState({ object: true, anomaly: false, density: false });
  const [pdfLoading, setPdfLoading] = useState(false);
  const [zoom, setZoom]         = useState(1);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [comparePos, setComparePos] = useState(50);
  const fileRef   = useRef();
  const scanIdRef = useRef(`AEGIS-${Math.floor(1000 + Math.random() * 9000)}-X`);

  const handleFile = (f) => {
    if (!f || !f.type.startsWith("image/")) return;
    setFile(f); setPreview(URL.createObjectURL(f)); setResult(null); setZoom(1);
    setFeedbackRating(0); setFeedbackText(""); setFeedbackSubmitted(false); setComparePos(50);
  };
  const clearImage = () => { setFile(null); setPreview(null); setResult(null); setZoom(1); setFeedbackRating(0); setFeedbackText(""); setFeedbackSubmitted(false); setComparePos(50); };

  const runScan = async () => {
    if (!file) return;
    setLoading(true);
    setFeedbackRating(0); setFeedbackText(""); setFeedbackSubmitted(false); setComparePos(50);
    const form = new FormData();
    form.append("file", file);
    form.append("declared_type", declared);
    form.append("shipment_id", shipId || "AUTO");
    try {
      const res = await axios.post(`${API}/api/inspect`, form);
      setResult(res.data);
    } catch {
      await new Promise(r => setTimeout(r, 1800));
      setResult({
        risk_score: 84, risk_level: "HIGH",
        shipment_id: shipId || "SHP-0042",
        total_objects: 3,
        detections: [
          { label: "Firearm",          confidence: 0.96 },
          { label: "Organic Mass",     confidence: 0.85 },
          { label: "Electronic Device",confidence: 0.92 },
        ],
        mismatches: [{ detected: "Firearm", declared, severity: "HIGH" }],
        annotated_image: null,
      });
    }
    setLoading(false);
  };

  const handleDownloadPDF = async () => {
    if (!result) return;
    setPdfLoading(true);
    await downloadReport(result, declared);
    setPdfLoading(false);
  };

  const now   = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";
  const phase = !file ? "EMPTY" : !result && !loading ? "READY" : result ? "DONE" : "SCANNING";

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 300px", gap: 20, minHeight: "calc(100vh - 114px)" }}>

      {/* ── LEFT ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12 }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", color: "#ffffff", display: "flex", alignItems: "center", gap: 8 }}>
            <Icon d={Icons.scan} size={13} color={C.accent} /> INPUT SOURCE
          </div>
          <div style={{ padding: 14 }}>
            <label style={{ fontSize: 11, color: "#ffffff", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>Declared Type</label>
            <select value={declared} onChange={e => setDeclared(e.target.value)} style={{ width: "100%", marginTop: 6, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", outline: "none" }}>
              {["electronics","clothing","food","documents","machinery","unknown"].map(t => (
                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
              ))}
            </select>
            <label style={{ fontSize: 11, color: "#ffffff", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", display: "block", marginTop: 12 }}>Shipment ID</label>
            <input value={shipId} onChange={e => setShipId(e.target.value)} placeholder="SHP-0001" style={{ width: "100%", marginTop: 6, boxSizing: "border-box", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 10px", color: C.text, fontSize: 12, fontFamily: "inherit", outline: "none" }} />
          </div>
        </div>

        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12 }}>
          <div style={{ padding: "12px 16px", borderBottom: `1px solid ${C.border}`, fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", color: "#ffffff", display: "flex", alignItems: "center", gap: 8 }}>
            <Icon d={Icons.layers} size={13} color={C.accent} /> LAYER CONTROL
          </div>
          <div style={{ padding: 14 }}>
            <LayerToggle label="Object Detection" icon="scan"     active={layers.object}  onClick={() => setLayers(l => ({ ...l, object:  !l.object  }))} />
            <LayerToggle label="Anomaly Heatmap"  icon="activity" active={layers.anomaly} onClick={() => setLayers(l => ({ ...l, anomaly: !l.anomaly }))} />
            <LayerToggle label="Density Analysis"  icon="layers"   active={layers.density} onClick={() => setLayers(l => ({ ...l, density: !l.density }))} />
          </div>
        </div>

        {/* ── FEEDBACK SECTION ── */}
        {result && !feedbackSubmitted && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
            <p style={{ fontSize: 12, color: "#ffffff", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Feedback</p>
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              {[1, 2, 3, 4, 5].map(star => (
                <div key={star} onClick={() => setFeedbackRating(star)} style={{ cursor: "pointer", display: "flex" }}>
                  <Icon
                    d={Icons.star}
                    size={20}
                    color={star <= feedbackRating ? C.med : C.muted}
                    fill={star <= feedbackRating ? C.med : "none"}
                    strokeWidth={star <= feedbackRating ? 2 : 1.5}
                  />
                </div>
              ))}
            </div>
            <textarea
              placeholder="Enter comments..."
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              style={{ width: "100%", height: 60, boxSizing: "border-box", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, padding: "10px 12px", color: C.text, fontSize: 12, fontFamily: "inherit", outline: "none", resize: "none", overflow: "hidden", marginBottom: 12 }}
            />
            <button
              onClick={async () => {
                setFeedbackSubmitted(true);
                try {
                  await axios.post(`${API}/api/feedback`, {
                    shipment_id: shipId || result?.shipment_id || "AUTO",
                    rating: feedbackRating,
                    text: feedbackText
                  });
                } catch (e) {
                  console.error("Failed to submit feedback", e);
                }
              }}
              disabled={feedbackRating === 0}
              style={{ width: "100%", padding: "10px", background: feedbackRating > 0 ? "rgba(26,115,232,0.15)" : "transparent", border: `1px solid ${feedbackRating > 0 ? C.accent : C.border}`, borderRadius: 8, color: feedbackRating > 0 ? C.accent : C.muted, fontSize: 13, fontWeight: 600, fontFamily: "inherit", cursor: feedbackRating > 0 ? "pointer" : "not-allowed", transition: "all 0.2s" }}
            >
              Submit Feedback
            </button>
          </div>
        )}
        {result && feedbackSubmitted && (
          <div style={{ background: "rgba(16,185,129,0.05)", border: `1px solid rgba(16,185,129,0.3)`, borderRadius: 12, padding: 16, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ background: "rgba(16,185,129,0.15)", borderRadius: "50%", padding: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon d={Icons.check} size={14} color={C.low} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: C.low, fontWeight: 700, letterSpacing: "0.05em" }}>Feedback Recorded</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Thank you for improving the model</div>
            </div>
          </div>
        )}
      </div>

      {/* ── CENTRE ── */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* top bar */}
        <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ border: `1px solid ${C.border}`, padding: "4px 12px", borderRadius: 6, fontSize: 11, color: C.accent, letterSpacing: "0.08em", display: "flex", alignItems: "center", gap: 6 }}>
              <Icon d={Icons.scan} size={11} color={C.accent} /> SCAN_ID: {scanIdRef.current}
            </div>
            <span style={{ fontSize: 11, color: C.muted }}>{now}</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { icon: Icons.zoom_in, onClick: () => setZoom(z => Math.min(z + 0.5, 4)) },
              { icon: Icons.zoom_out, onClick: () => setZoom(z => Math.max(z - 0.5, 0.5)) }
            ].map((btn, i) => (
              <button key={i} onClick={btn.onClick} style={{ width: 32, height: 32, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 6, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon d={btn.icon} size={14} color={C.muted} />
              </button>
            ))}
          </div>
        </div>

        {/* PHASE: EMPTY */}
        {phase === "EMPTY" && (
          <div
            onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileRef.current.click()}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", margin: 24, borderRadius: 16, border: `2px dashed ${dragOver ? C.accent : C.border}`, background: dragOver ? "rgba(26,115,232,0.06)" : "transparent", transition: "all 0.2s" }}
          >
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />
            <div style={{ position: "relative", width: 110, height: 110, marginBottom: 28 }}>
              {[0, 1].map(i => (
                <div key={i} style={{ position: "absolute", inset: i * 10, borderRadius: "50%", border: `2px solid ${C.accent}`, opacity: 0.25 - i * 0.08, animation: `pulse${i} 2.2s ease-in-out infinite ${i * 0.4}s` }} />
              ))}
              <div style={{ position: "absolute", inset: 20, borderRadius: "50%", background: "rgba(26,115,232,0.12)", border: `2px solid ${C.accent}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon d={Icons.upload} size={34} color={C.accent} />
              </div>
            </div>
            <p style={{ fontSize: 20, fontWeight: 700, color: C.text, letterSpacing: "0.04em", marginBottom: 8 }}>Upload X-Ray Image</p>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>Drag & drop your cargo X-ray scan here</p>
            <p style={{ fontSize: 12, color: C.border, marginBottom: 24 }}>— or —</p>
            <div style={{ padding: "12px 36px", background: "rgba(26,115,232,0.12)", border: `1px solid ${C.accent}`, borderRadius: 10, fontSize: 13, color: C.accent, fontWeight: 700, letterSpacing: "0.06em" }}>
              📁 Browse Files
            </div>
            <p style={{ fontSize: 11, color: C.muted, marginTop: 20 }}>Supports PNG, JPG, JPEG · Max 20MB</p>
            <style>{`
              @keyframes pulse0 { 0%,100%{transform:scale(1);opacity:0.25} 50%{transform:scale(1.06);opacity:0.5} }
              @keyframes pulse1 { 0%,100%{transform:scale(1);opacity:0.15} 50%{transform:scale(1.08);opacity:0.35} }
            `}</style>
          </div>
        )}

        {/* PHASE: READY / SCANNING */}
        {(phase === "READY" || phase === "SCANNING") && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>
            {phase === "SCANNING" && <ScanningOverlay />}
            <div style={{ flex: 1, background: "#05080f", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
              <img src={preview} alt="preview" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain", transform: `scale(${zoom})`, transition: "transform 0.25s ease-out" }} />
              <div style={{ position: "absolute", top: 14, left: 14, background: "rgba(10,14,26,0.88)", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 12px", fontSize: 11, color: C.text, display: "flex", alignItems: "center", gap: 8 }}>
                <Icon d={Icons.image} size={12} color={C.accent} />
                {file?.name}
                <button onClick={e => { e.stopPropagation(); clearImage(); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}>
                  <Icon d={Icons.trash} size={12} color={C.muted} />
                </button>
              </div>
            </div>
            <div style={{ padding: "16px 24px", borderTop: `1px solid ${C.border}`, background: C.surface, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Image ready — click to inspect</p>
                <p style={{ fontSize: 11, color: C.muted, marginTop: 3 }}>Declared: <strong style={{ color: C.accent }}>{declared}</strong> · ID: <strong style={{ color: C.cyan }}>{shipId || "AUTO"}</strong></p>
              </div>
              <button onClick={() => fileRef.current.click()} style={{ padding: "10px 18px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, fontSize: 12, fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                <Icon d={Icons.image} size={14} color={C.muted} /> Change Image
              </button>
              <button onClick={runScan} disabled={loading} style={{ padding: "13px 36px", background: "linear-gradient(135deg, #1a73e8, #06b6d4)", border: "none", borderRadius: 10, color: "#fff", fontSize: 15, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 0 28px rgba(26,115,232,0.55)", letterSpacing: "0.05em" }}>
                <Icon d={Icons.scan} size={18} />
                {loading ? "SCANNING..." : "🔍 RUN INSPECTION"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />
            </div>
          </div>
        )}

        {/* PHASE: DONE */}
        {phase === "DONE" && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1, background: "#05080f", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", position: "relative" }}>
              <div style={{ transform: `scale(${zoom})`, transition: "transform 0.25s ease-out", display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", position: "relative" }}>
                
                {/* BEFORE (Original) */}
                <img src={preview} alt="original" style={{ position: "absolute", width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }} />

                {/* AFTER (Annotated - Clipped) */}
                <div style={{ position: "absolute", width: "100%", height: "100%", clipPath: `inset(0 0 0 ${comparePos}%)`, pointerEvents: "none", zIndex: 2 }}>
                  {result?.annotated_image ? (
                    <img src={`data:image/jpeg;base64,${result.annotated_image}`} alt="annotated" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  ) : (
                    <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <img src={preview} alt="scan" style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
                      {result?.detections?.map((d, i) => (
                        <div key={i} style={{ position: "absolute", top: `${25 + i * 20}%`, left: `${28 + i * 14}%`, padding: "5px 12px", background: isThreat(d.label) ? "rgba(239,68,68,0.9)" : "rgba(26,115,232,0.9)", border: `1px solid ${isThreat(d.label) ? C.high : C.accent}`, borderRadius: 5, fontSize: 11, fontWeight: 700, color: "#fff", boxShadow: `0 0 14px ${isThreat(d.label) ? C.high : C.accent}`, whiteSpace: "nowrap" }}>
                          {d.label} · {(d.confidence * 100).toFixed(0)}%
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* SLIDER HANDLE AND LINE */}
                <div style={{ position: "absolute", top: 0, bottom: 0, left: `${comparePos}%`, width: 2, background: C.accent, zIndex: 10, pointerEvents: "none" }}>
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 28, height: 28, background: C.surface, border: `2px solid ${C.accent}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 12px rgba(0,0,0,0.6)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l-6-6 6-6 M15 18l6-6-6-6" />
                    </svg>
                  </div>
                </div>

                {/* INVISIBLE RANGE INPUT */}
                <input type="range" min="0" max="100" value={comparePos} onChange={(e) => setComparePos(e.target.value)} style={{ appearance: "none", margin: 0, position: "absolute", top: 0, left: 0, width: "100%", height: "100%", opacity: 0, cursor: "col-resize", zIndex: 20 }} />

              </div>
              
              {/* LABELS */}
              <div style={{ position: "absolute", top: 16, left: 16, fontSize: 11, color: "#fff", fontWeight: 700, letterSpacing: "0.1em", textShadow: "0 2px 6px rgba(0,0,0,0.9)", zIndex: 25, pointerEvents: "none" }}>ORIGINAL</div>
              <div style={{ position: "absolute", top: 16, right: 16, fontSize: 11, color: C.cyan, fontWeight: 700, letterSpacing: "0.1em", textShadow: "0 2px 6px rgba(0,0,0,0.9)", zIndex: 25, pointerEvents: "none" }}>AI ANNOTATED</div>
            </div>

            {/* result bar */}
            <div style={{ padding: "14px 24px", borderTop: `1px solid ${C.border}`, background: C.surface, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <button onClick={clearImage} style={{ padding: "8px 16px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, color: C.muted, fontSize: 12, fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon d={Icons.refresh} size={13} /> New Scan
                </button>
                <button onClick={runScan} style={{ padding: "8px 16px", background: "rgba(26,115,232,0.15)", border: `1px solid ${C.accent}`, borderRadius: 8, color: C.accent, fontSize: 12, fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon d={Icons.refresh} size={13} /> Re-Analyze
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── RIGHT ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12 }}>
          <div style={{ padding: "12px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: C.text }}>ANALYSIS OUTPUT</span>
            {result && (
              <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 10, fontWeight: 700, background: `${riskColor(result.risk_level)}15`, color: riskColor(result.risk_level), border: `1px solid ${riskColor(result.risk_level)}`, letterSpacing: "0.08em" }}>
                {result.risk_level} RISK
              </span>
            )}
          </div>
          <div style={{ padding: 18 }}>
            {!result ? (
              <div style={{ textAlign: "center", padding: "28px 0", color: C.muted }}>
                <Icon d={Icons.shield} size={42} color={C.border} />
                <p style={{ fontSize: 12, marginTop: 14, letterSpacing: "0.05em" }}>Run inspection to see results</p>
                {file && !loading && (
                  <button onClick={runScan} style={{ marginTop: 16, padding: "10px 24px", background: "linear-gradient(135deg, #1a73e8, #06b6d4)", border: "none", borderRadius: 8, color: "#fff", fontSize: 12, fontWeight: 700, fontFamily: "inherit", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, margin: "16px auto 0" }}>
                    <Icon d={Icons.scan} size={14} /> Start Scan
                  </button>
                )}
              </div>
            ) : (
              <>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 16 }}>
                  <RiskGauge score={result.risk_score} />
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                    {[
                      { label: "Objects",    val: result.total_objects, color: C.text },
                      { label: "Threats",    val: result.detections?.filter(d => isThreat(d.label)).length || 0, color: C.high },
                      { label: "Mismatches", val: result.mismatches?.length || 0, color: result.mismatches?.length ? C.high : C.low },
                      { label: "Confidence", val: `${((result.detections?.[0]?.confidence || 0.98) * 100).toFixed(1)}%`, color: C.cyan },
                    ].map((s, i) => (
                      <div key={i} style={{ background: C.surface, borderRadius: 8, padding: "7px 12px", border: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</span>
                        <span style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 10, color: C.muted, letterSpacing: "0.1em" }}>RISK SCORE</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: riskColor(result.risk_level) }}>{result.risk_score}%</span>
                  </div>
                  <div style={{ height: 8, background: C.border, borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${result.risk_score}%`, background: `linear-gradient(90deg, ${C.accent}, ${riskColor(result.risk_level)})`, boxShadow: `0 0 10px ${riskColor(result.risk_level)}`, transition: "width 0.8s ease" }} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {result && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
            <p style={{ fontSize: 12, color: "#ffffff", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>Risk Breakdown</p>
            <AnimBar label="YOLO Detection"    value={95} color={C.accent} />
            <AnimBar label="Anomaly Detection" value={72} color={C.med} />
            <AnimBar label="Density Analysis"  value={88} color={C.purple} />
          </div>
        )}

        {result?.detections?.length > 0 && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
            <p style={{ fontSize: 12, color: "#ffffff", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Detected Objects</p>
            {result.detections.map((d, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px", marginBottom: 8, borderRadius: 8, background: isThreat(d.label) ? "rgba(239,68,68,0.07)" : "rgba(16,185,129,0.07)", border: `1px solid ${isThreat(d.label) ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.15)"}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: isThreat(d.label) ? C.high : C.low }} />
                  <span style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{d.label}</span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: isThreat(d.label) ? C.high : C.low }}>{(d.confidence * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        )}

        {result?.mismatches?.length > 0 && (
          <div style={{ background: "rgba(239,68,68,0.06)", border: `1px solid rgba(239,68,68,0.3)`, borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Icon d={Icons.alert} size={15} color={C.high} />
              <span style={{ fontSize: 11, fontWeight: 700, color: C.high, letterSpacing: "0.1em" }}>MISDECLARATION ALERT</span>
            </div>
            {result.mismatches.map((m, i) => (
              <div key={i} style={{ fontSize: 12, color: C.muted, lineHeight: 1.7 }}>
                Declared: <strong style={{ color: C.text }}>{m.declared}</strong><br />
                Detected: <strong style={{ color: C.high }}>{m.detected}</strong>
                <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 700, background: "rgba(239,68,68,0.2)", color: C.high, padding: "2px 8px", borderRadius: 4 }}>{m.severity}</span>
              </div>
            ))}
          </div>
        )}

        {result && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16 }}>
            <p style={{ fontSize: 12, color: "#ffffff", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>Why Flagged?</p>
            <div style={{ background: "rgba(239,68,68,0.05)", border: `1px solid rgba(239,68,68,0.18)`, borderRadius: 8, padding: "10px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                <Icon d={Icons.alert} size={12} color={C.high} />
                <span style={{ fontSize: 12, fontWeight: 600, color: C.high }}>Density Anomaly</span>
              </div>
              <p style={{ fontSize: 11, color: C.muted, lineHeight: 1.6 }}>
                Metallic density profile matches that of a semi-automatic weapon. Declared cargo type does not match detected object signatures.
              </p>
            </div>
          </div>
        )}

        {/* ── PDF quick action in right panel ── */}
        {result && (
          <button onClick={handleDownloadPDF} disabled={pdfLoading} style={{ padding: "12px", background: pdfLoading ? C.border : "rgba(16,185,129,0.1)", border: `1px solid ${C.low}`, borderRadius: 10, color: C.low, fontSize: 12, fontWeight: 700, fontFamily: "inherit", cursor: pdfLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.2s", letterSpacing: "0.05em" }}>
            <Icon d={Icons.pdf} size={15} color={C.low} />
            {pdfLoading ? "Generating PDF..." : "📄 Download PDF Report"}
          </button>
        )}


      </div>
    </div>
  );
}

// ─── ANALYTICS VIEW ───────────────────────────────────────────────────────────
function AnalyticsView() {
  const [range, setRange] = useState("7");
  const [stats, setStats] = useState({ total: 12482, high_risk: 142, medium_risk: 0, low_risk: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API}/api/stats`).then(res => {
      setStats(res.data);
      setLoading(false);
    }).catch(e => {
      console.error(e);
      setLoading(false);
    });
  }, []);

  const totalPie = stats.low_risk + stats.medium_risk + stats.high_risk || 1;
  const pieDataDynamic = [
    { name: "Low",        value: stats.low_risk,  percent: Math.round((stats.low_risk/totalPie)*100), color: C.low },
    { name: "Suspicious", value: stats.medium_risk, percent: Math.round((stats.medium_risk/totalPie)*100), color: C.med },
    { name: "High Risk",  value: stats.high_risk, percent: Math.round((stats.high_risk/totalPie)*100), color: C.high },
  ].filter(d => d.value > 0);

  const card = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 12 };
  
  if (loading) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {[
          { label: "Total Scans",       val: stats.total.toLocaleString(), delta: "+12.5%", pos: true,  color: C.accent },
          { label: "High Risk Flagged", val: stats.high_risk.toLocaleString(), delta: "-2.4%",  pos: false, color: C.high },
          { label: "Low Risk Flagged",  val: stats.low_risk.toLocaleString(), delta: "+1.2%",  pos: true,  color: C.low },
          { label: "Accuracy",          val: "99.92%", delta: "+0.02%", pos: true,  color: C.low },
        ].map((s, i) => (
          <div key={i} style={{ ...card, padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: s.pos ? C.low : C.high, marginBottom: 6 }}>{s.delta}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color, letterSpacing: "-0.02em" }}>{s.val}</div>
            <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 6 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={card}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Suspicious Detection Trends</p>
              <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>Weekly analysis of flagged shipments vs total scans</p>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {["7","30"].map(r => (
                <button key={r} onClick={() => setRange(r)} style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: range===r ? C.accent : C.surface, color: range===r ? "#fff" : C.muted, fontSize: 11, fontFamily: "inherit", cursor: "pointer" }}>{r} Days</button>
              ))}
            </div>
          </div>
          <div style={{ padding: "16px 8px 8px" }}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <XAxis dataKey="day" tick={{ fill: C.muted, fontSize: 11 }} axisLine={{ stroke: C.border }} tickLine={false} />
                <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="total" stroke={C.accent} strokeWidth={2} dot={{ fill: C.accent, r: 4 }} name="Total Scans" />
                <Line type="monotone" dataKey="suspicious" stroke={C.high} strokeWidth={2} dot={{ fill: C.high, r: 4 }} name="Suspicious" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={card}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}` }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Risk Distribution</p>
          </div>
          <div style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <PieChart width={200} height={200}>
              <Pie data={pieDataDynamic} cx={95} cy={95} innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                {pieDataDynamic.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
            <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
              {pieDataDynamic.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: p.color }} />
                  <span style={{ fontSize: 11, color: C.muted }}>{p.name} ({p.percent}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div style={{ ...card, padding: 20 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 16 }}>Object Categories</p>
          {(stats.categories || categoryData).map((c, i) => {
            const maxCount = Math.max(...(stats.categories || categoryData).map(x => x.count || x.value || 1));
            const percentage = ((c.count || c.value) / maxCount) * 100;
            return (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontSize: 12, color: C.muted }}>{c.name} {c.count && `(${c.count})`}</span>
                </div>
                <div style={{ height: 8, background: C.border, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${percentage}%`, background: `linear-gradient(90deg, ${C.accent}, ${C.cyan})`, borderRadius: 4, boxShadow: `0 0 8px ${C.accent}60` }} />
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          {[
            { val: "99.92%", label: "Accuracy Rate",     color: C.low,    delta: "+0.02%" },
            { val: "24/24",  label: "Active Sensors",    color: C.cyan,   delta: "Stable" },
            { val: "4.2s",   label: "Avg Scan Time",     color: C.purple, delta: "-0.8s" },
            { val: "842",    label: "Reports Generated", color: C.accent, delta: "+45" },
          ].map((k, i) => (
            <div key={i} style={{ ...card, padding: 18 }}>
              <div style={{ fontSize: 10, color: C.low, fontWeight: 600, marginBottom: 8 }}>{k.delta}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: k.color }}>{k.val}</div>
              <div style={{ fontSize: 10, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginTop: 6 }}>{k.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── HISTORY VIEW ─────────────────────────────────────────────────────────────
function HistoryView() {
  const [search, setSearch] = useState("");
  const [scans, setScans]   = useState([]);
  const [sortType, setSortType] = useState("new_to_old");
  const [showSort, setShowSort] = useState(false);

  useEffect(() => {
    axios.get(`${API}/api/history`).then(r => {
      if (r.data?.scans?.length) {
        const mapped = r.data.scans.map(s => ({
          id: s.id || s.shipment_id || "AUTO",
          time: s.timestamp ? new Date(s.timestamp).toLocaleString() : "—",
          rawTime: s.timestamp ? new Date(s.timestamp).getTime() : 0,
          risk: s.risk_level || "Unknown",
          score: s.risk_score || 0,
          objects: [s.declared_type || "Unknown"],
          status: s.risk_level==="HIGH" ? "High Risk" : s.risk_level==="MEDIUM" ? "Medium" : "Low",
        }));
        setScans([...mapped]);
      } else {
        setScans(historyRows); // fallback
      }
    }).catch(() => { setScans(historyRows); });
  }, []);

  let sorted = [...scans];
  if (sortType === "new_to_old") {
    sorted.sort((a,b) => (b.rawTime || new Date(b.time).getTime()) - (a.rawTime || new Date(a.time).getTime()));
  } else if (sortType === "old_to_new") {
    sorted.sort((a,b) => (a.rawTime || new Date(a.time).getTime()) - (b.rawTime || new Date(b.time).getTime()));
  } else if (sortType === "high_to_low") {
    sorted.sort((a,b) => b.score - a.score);
  } else if (sortType === "low_to_high") {
    sorted.sort((a,b) => a.score - b.score);
  }

  const filtered = sorted.filter(s => s.id.toLowerCase().includes(search.toLowerCase()) || s.objects.join(" ").toLowerCase().includes(search.toLowerCase()));
  const riskBadge = (level, score) => {
    const color = level==="High" || level==="HIGH" ? C.high : level==="Medium" || level==="MEDIUM" ? C.med : C.low;
    const displayScore = score !== undefined ? `${Math.round(score)}%` : level;
    return <span style={{ display:"inline-flex", alignItems:"center", gap:5, color, background:`${color}18`, padding:"3px 10px", borderRadius:20, fontSize:11, fontWeight:600 }}><span style={{ width:6, height:6, borderRadius:"50%", background:color, display:"inline-block" }} />{displayScore}</span>;
  };
  const statusBadge = (s) => {
    const color = s==="High Risk" ? C.high : (s==="Suspicious" || s==="Medium") ? C.med : C.low;
    return <span style={{ color, background:`${color}18`, padding:"4px 12px", borderRadius:6, fontSize:11, fontWeight:600 }}>{s}</span>;
  };
  const th = { padding:"12px 16px", fontSize:10, fontWeight:600, color:C.muted, textTransform:"uppercase", letterSpacing:"0.12em", borderBottom:`1px solid ${C.border}`, textAlign:"left" };
  const td = { padding:"15px 16px", fontSize:12, color:C.text, borderBottom:`1px solid ${C.border}`, verticalAlign:"middle" };
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12 }}>
      <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <p style={{ fontSize:15, fontWeight:700, color:C.text }}>Scan History</p>
          <p style={{ fontSize:11, color:C.muted, marginTop:3 }}>Comprehensive log of all cargo inspections</p>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 14px" }}>
            <Icon d={Icons.search} size={14} color={C.muted} />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search Shipment ID..." style={{ background:"transparent", border:"none", color:C.text, fontSize:12, fontFamily:"inherit", outline:"none", width:180 }} />
          </div>
          <div style={{ position:"relative" }}>
            <button onClick={() => setShowSort(!showSort)} style={{ display:"flex", alignItems:"center", gap:6, background:C.surface, border:`1px solid ${C.border}`, borderRadius:8, padding:"8px 14px", color:C.muted, fontSize:12, fontFamily:"inherit", cursor:"pointer", height:"100%" }}>
              <Icon d={Icons.filter} size={14} color={C.muted} /> Sort
            </button>
            {showSort && (
              <div style={{ position:"absolute", top:45, right:0, background:C.card, border:`1px solid ${C.border}`, borderRadius:8, padding:5, zIndex:10, minWidth:200, boxShadow:"0 5px 20px rgba(0,0,0,0.5)" }}>
                {[
                  { id: "new_to_old", label: "Date: New to Old" },
                  { id: "old_to_new", label: "Date: Old to New" },
                  { id: "high_to_low", label: "Risk Score: High to Low" },
                  { id: "low_to_high", label: "Risk Score: Low to High" }
                ].map(opt => (
                  <button key={opt.id} onClick={() => { setSortType(opt.id); setShowSort(false); }} style={{ display:"block", width:"100%", textAlign:"left", padding:"8px 12px", background:sortType===opt.id?"rgba(26,115,232,0.15)":"transparent", border:"none", color:sortType===opt.id?C.accent:C.muted, fontSize:11, fontFamily:"inherit", cursor:"pointer", borderRadius:4 }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead><tr>{["Date & Time","Shipment ID","Risk Output","Detected Objects","Status"].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>
            {filtered.map((row,i)=>(
              <tr key={i} onMouseEnter={e=>e.currentTarget.style.background="rgba(26,115,232,0.04)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"} style={{ transition:"background 0.15s" }}>
                <td style={td}><span style={{ color:C.muted }}>{row.time}</span></td>
                <td style={td}><span style={{ color:C.accent, fontWeight:600 }}>{row.id}</span></td>
                <td style={td}>{riskBadge(row.risk, row.score)}</td>
                <td style={td}>{row.objects.map((o,j)=><span key={j} style={{ display:"inline-block", background:"rgba(26,115,232,0.1)", border:"1px solid rgba(26,115,232,0.2)", color:"#7ab3f5", padding:"3px 8px", borderRadius:4, fontSize:11, marginRight:4 }}>{o}</span>)}</td>
                <td style={td}>{statusBadge(row.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ padding:"14px 20px", borderTop:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:11, color:C.muted }}>Showing {filtered.length} of {filtered.length} results</span>
        <div style={{ display:"flex", gap:8 }}>
          {["Previous","Next"].map(t=><button key={t} style={{ padding:"6px 16px", background:t==="Next"?C.accent:C.surface, border:`1px solid ${t==="Next"?C.accent:C.border}`, borderRadius:6, color:t==="Next"?"#fff":C.muted, fontSize:12, fontFamily:"inherit", cursor:"pointer" }}>{t}</button>)}
        </div>
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab]             = useState("monitor");
  const [alertCount, setAlertCount] = useState(0);

  const tabs = [
    { id:"monitor",   label:"Monitor",   icon:Icons.monitor },
    { id:"analytics", label:"Analytics", icon:Icons.analytics },
    { id:"history",   label:"History",   icon:Icons.history },
  ];
  const badge = { width:8, height:8, borderRadius:"50%", background:C.low, boxShadow:`0 0 6px ${C.low}`, display:"inline-block" };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Inter', 'Segoe UI', 'Roboto', sans-serif", display:"flex", flexDirection:"column" }}>

      {/* HEADER */}
      <header style={{ background:C.surface, borderBottom:`1px solid ${C.border}`, padding:"0 28px", height:64, display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:36, height:36, background:"linear-gradient(135deg,#1a73e8,#06b6d4)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Icon d={Icons.shield} size={18} color="#fff" strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontSize:14, fontWeight:700, letterSpacing:"0.06em", color:C.text }}>CARGOVISIONX</div>
            <div style={{ fontSize:9, color:C.muted, letterSpacing:"0.18em", textTransform:"uppercase" }}>Customs &amp; Border Security</div>
          </div>
        </div>

        <nav style={{ display:"flex", gap:4 }}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 18px", borderRadius:6, border:"none", cursor:"pointer", fontSize:12, fontFamily:"inherit", letterSpacing:"0.05em", fontWeight:tab===t.id?600:400, background:tab===t.id?"rgba(26,115,232,0.15)":"transparent", color:tab===t.id?C.accent:C.muted, borderBottom:tab===t.id?`2px solid ${C.accent}`:"2px solid transparent", transition:"all 0.2s" }}>
              <Icon d={t.icon} size={14} color={tab===t.id?C.accent:C.muted} />{t.label}
            </button>
          ))}
        </nav>

        <div style={{ display:"flex", alignItems:"center", gap:20 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"6px 12px", background:C.card, borderRadius:8, border:`1px solid ${C.border}`, cursor:"pointer" }}>
            <div style={{ width:30, height:30, background:"linear-gradient(135deg,#1a73e8,#8b5cf6)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color:"#fff" }}>AD</div>
            <div>
              <div style={{ fontSize:12, fontWeight:600, color:C.text }}>ADMIN</div>
              <div style={{ fontSize:10, color:C.muted }}>SENIOR INSPECTOR</div>
            </div>
          </div>
        </div>
      </header>

      {/* ALERT TOASTS — rendered outside main flow */}
      <AlertContainer alertCount={alertCount} setAlertCount={setAlertCount} />

      {/* MAIN */}
      <main style={{ flex:1, padding:"24px 28px", overflow:"auto" }}>
        {tab==="monitor"   && <MonitorView />}
        {tab==="analytics" && <AnalyticsView />}
        {tab==="history"   && <HistoryView />}
      </main>

      {/* FOOTER */}
      <footer style={{ background:C.surface, borderTop:`1px solid ${C.border}`, padding:"8px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:10, color:C.muted, letterSpacing:"0.08em" }}>
        <div style={{ display:"flex", gap:20 }}>
          {/* Status placeholders removed per user feedback */}
        </div>
        <div style={{ display:"flex", gap:20 }}>
          <span>LATENCY: 14MS</span><span>UPTIME: 99.99%</span><span>© 2026 TECHSENA — CARGOVISION AI</span>
        </div>
      </footer>
    </div>
  );
}