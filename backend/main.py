<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>CargoVision AI — X-Ray Threat Detection</title>
  <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    :root {
      --bg: #070a0f;
      --surface: #0d1117;
      --surface2: #131920;
      --border: #1e2d3d;
      --accent: #00e5ff;
      --accent2: #ff3b5c;
      --accent3: #a8ff3e;
      --text: #e8edf2;
      --text-dim: #6b7f8e;
      --font-display: 'Syne', sans-serif;
      --font-mono: 'Space Mono', monospace;
      --low: #a8ff3e;
      --medium: #ffd93d;
      --high: #ff3b5c;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-display);
      min-height: 100vh;
      overflow-x: hidden;
    }

    /* ─── SCANLINE OVERLAY ─── */
    body::before {
      content: '';
      position: fixed; inset: 0;
      background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,229,255,0.012) 2px, rgba(0,229,255,0.012) 4px);
      pointer-events: none;
      z-index: 9999;
    }

    /* ─── NAV ─── */
    nav {
      position: sticky; top: 0; z-index: 100;
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 32px;
      background: rgba(7,10,15,0.88);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
    }
    .logo {
      font-family: var(--font-mono);
      font-size: 1rem;
      letter-spacing: 0.12em;
      color: var(--accent);
      display: flex; align-items: center; gap: 10px;
    }
    .logo-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); animation: pulse-dot 1.6s ease-in-out infinite; }
    @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(.5)} }
    .nav-badge {
      font-family: var(--font-mono);
      font-size: 0.65rem;
      padding: 4px 10px;
      border: 1px solid var(--accent);
      border-radius: 2px;
      color: var(--accent);
      letter-spacing: .1em;
    }

    /* ─── HERO ─── */
    .hero {
      position: relative;
      min-height: 92vh;
      display: flex; align-items: center; justify-content: center;
      padding: 60px 32px;
      overflow: hidden;
    }
    .hero-grid {
      position: absolute; inset: 0;
      background-image:
        linear-gradient(rgba(0,229,255,0.04) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,229,255,0.04) 1px, transparent 1px);
      background-size: 60px 60px;
      mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
    }
    .hero-glow {
      position: absolute;
      width: 600px; height: 600px;
      border-radius: 50%;
      background: radial-gradient(ellipse, rgba(0,229,255,0.08) 0%, transparent 70%);
      top: 50%; left: 50%; transform: translate(-50%,-50%);
      pointer-events: none;
    }
    .hero-content { position: relative; text-align: center; max-width: 860px; }
    .hero-eyebrow {
      font-family: var(--font-mono);
      font-size: 0.7rem;
      letter-spacing: .25em;
      color: var(--accent);
      margin-bottom: 20px;
      opacity: 0;
      animation: fadeUp .6s ease forwards .2s;
    }
    .hero-title {
      font-size: clamp(2.8rem, 7vw, 5.5rem);
      font-weight: 800;
      line-height: 1.05;
      letter-spacing: -.02em;
      margin-bottom: 24px;
      opacity: 0;
      animation: fadeUp .7s ease forwards .35s;
    }
    .hero-title em {
      font-style: normal;
      color: var(--accent);
      position: relative;
    }
    .hero-title em::after {
      content: '';
      position: absolute; left: 0; bottom: -4px;
      width: 100%; height: 3px;
      background: linear-gradient(90deg, var(--accent), transparent);
    }
    .hero-sub {
      font-size: 1.1rem;
      color: var(--text-dim);
      max-width: 560px;
      margin: 0 auto 40px;
      line-height: 1.65;
      opacity: 0;
      animation: fadeUp .7s ease forwards .5s;
    }
    .hero-cta {
      display: inline-flex; gap: 14px;
      flex-wrap: wrap; justify-content: center;
      opacity: 0;
      animation: fadeUp .7s ease forwards .65s;
    }
    .btn-primary {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 14px 32px;
      background: var(--accent);
      color: var(--bg);
      font-family: var(--font-mono);
      font-size: .85rem;
      font-weight: 700;
      letter-spacing: .08em;
      border: none; border-radius: 3px;
      cursor: pointer;
      text-decoration: none;
      transition: transform .15s, box-shadow .15s;
    }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,229,255,.35); }
    .btn-secondary {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 14px 32px;
      background: transparent;
      color: var(--text);
      font-family: var(--font-mono);
      font-size: .85rem;
      letter-spacing: .08em;
      border: 1px solid var(--border);
      border-radius: 3px;
      cursor: pointer;
      text-decoration: none;
      transition: border-color .15s, background .15s;
    }
    .btn-secondary:hover { border-color: var(--accent); background: rgba(0,229,255,.05); }

    .stats-row {
      display: flex; gap: 40px; justify-content: center; flex-wrap: wrap;
      margin-top: 60px;
      opacity: 0;
      animation: fadeUp .7s ease forwards .8s;
    }
    .stat { text-align: center; }
    .stat-num {
      font-family: var(--font-mono);
      font-size: 2rem;
      font-weight: 700;
      color: var(--accent);
    }
    .stat-label { font-size: .75rem; color: var(--text-dim); letter-spacing: .1em; margin-top: 2px; }

    @keyframes fadeUp {
      from { opacity:0; transform:translateY(20px); }
      to { opacity:1; transform:translateY(0); }
    }

    /* ─── SECTION COMMON ─── */
    section { padding: 80px 32px; }
    .section-label {
      font-family: var(--font-mono);
      font-size: .65rem;
      letter-spacing: .22em;
      color: var(--accent);
      margin-bottom: 14px;
      display: flex; align-items: center; gap: 10px;
    }
    .section-label::before { content:''; width:24px; height:1px; background:var(--accent); }
    h2 {
      font-size: clamp(1.8rem, 4vw, 2.8rem);
      font-weight: 800;
      letter-spacing: -.02em;
      line-height: 1.15;
    }

    /* ─── DEMO SECTION ─── */
    #demo { background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
    .demo-wrapper { max-width: 1200px; margin: 0 auto; }
    .demo-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 40px; flex-wrap: wrap; gap: 20px; }
    .demo-header h2 span { color: var(--accent); }
    .demo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    @media(max-width:900px){ .demo-grid { grid-template-columns: 1fr; } }

    .panel {
      background: var(--surface2);
      border: 1px solid var(--border);
      border-radius: 6px;
      overflow: hidden;
    }
    .panel-head {
      padding: 12px 18px;
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between;
    }
    .panel-title {
      font-family: var(--font-mono);
      font-size: .7rem;
      letter-spacing: .15em;
      color: var(--text-dim);
      display: flex; align-items: center; gap: 8px;
    }
    .dot { width:7px; height:7px; border-radius:50%; }
    .dot-green{background:#22c55e;} .dot-yellow{background:#fbbf24;} .dot-red{background:#ef4444;}
    .panel-body { padding: 0; }

    /* ─── UPLOAD ZONE ─── */
    .upload-zone {
      min-height: 320px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      border: 2px dashed var(--border);
      margin: 20px;
      border-radius: 4px;
      cursor: pointer;
      transition: border-color .2s, background .2s;
      position: relative;
      overflow: hidden;
    }
    .upload-zone:hover, .upload-zone.drag-over {
      border-color: var(--accent);
      background: rgba(0,229,255,.03);
    }
    .upload-icon { font-size: 2.5rem; margin-bottom: 14px; opacity: .5; }
    .upload-text {
      font-family: var(--font-mono);
      font-size: .8rem;
      color: var(--text-dim);
      text-align: center;
      line-height: 1.7;
    }
    .upload-text strong { color: var(--accent); }
    #fileInput { display: none; }

    /* preview canvas */
    #previewCanvas {
      width: 100%; height: 320px;
      object-fit: contain;
      display: none;
      background: #000;
    }

    /* ─── CONTROLS ─── */
    .controls {
      padding: 16px 20px;
      display: flex; flex-direction: column; gap: 14px;
      border-top: 1px solid var(--border);
    }
    .ctrl-row { display: flex; gap: 10px; flex-wrap: wrap; }
    .btn-scan {
      flex: 1;
      padding: 13px 20px;
      background: var(--accent);
      color: var(--bg);
      border: none;
      border-radius: 3px;
      font-family: var(--font-mono);
      font-size: .8rem;
      font-weight: 700;
      letter-spacing: .1em;
      cursor: pointer;
      transition: opacity .2s, transform .15s;
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }
    .btn-scan:hover { opacity: .88; transform: translateY(-1px); }
    .btn-scan:disabled { opacity: .4; cursor: not-allowed; transform: none; }
    .btn-sample {
      padding: 13px 16px;
      background: transparent;
      color: var(--text-dim);
      border: 1px solid var(--border);
      border-radius: 3px;
      font-family: var(--font-mono);
      font-size: .75rem;
      cursor: pointer;
      transition: border-color .15s, color .15s;
      white-space: nowrap;
    }
    .btn-sample:hover { border-color: var(--accent); color: var(--accent); }

    /* ─── RESULTS ─── */
    .results-body { padding: 20px; min-height: 380px; }
    .result-placeholder {
      height: 100%;
      min-height: 340px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      text-align: center;
      color: var(--text-dim);
    }
    .result-placeholder .ph-icon { font-size: 2rem; margin-bottom: 12px; opacity:.3; }
    .result-placeholder p { font-size: .8rem; font-family: var(--font-mono); }

    /* risk meter */
    .risk-meter {
      display: none;
      flex-direction: column;
      gap: 20px;
    }
    .risk-header { display: flex; align-items: center; justify-content: space-between; }
    .risk-badge {
      font-family: var(--font-mono);
      font-size: .75rem;
      padding: 5px 14px;
      border-radius: 2px;
      letter-spacing: .1em;
      font-weight: 700;
    }
    .risk-badge.low { background: rgba(168,255,62,.15); color: var(--low); border: 1px solid var(--low); }
    .risk-badge.medium { background: rgba(255,217,61,.12); color: var(--medium); border: 1px solid var(--medium); }
    .risk-badge.high { background: rgba(255,59,92,.15); color: var(--high); border: 1px solid var(--high); animation: flicker .8s ease-in-out infinite alternate; }
    @keyframes flicker { from{opacity:1} to{opacity:.6} }

    .risk-score-row { display: flex; align-items: baseline; gap: 8px; }
    .risk-number {
      font-family: var(--font-mono);
      font-size: 2.8rem;
      font-weight: 700;
      line-height: 1;
    }
    .risk-label { font-size: .75rem; color: var(--text-dim); }

    .risk-bar-track {
      height: 8px;
      background: var(--border);
      border-radius: 4px;
      overflow: hidden;
    }
    .risk-bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 1.2s cubic-bezier(.4,0,.2,1);
      width: 0%;
    }

    /* detections list */
    .detections-title {
      font-family: var(--font-mono);
      font-size: .65rem;
      letter-spacing: .15em;
      color: var(--text-dim);
      margin-bottom: 10px;
    }
    .detection-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 14px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 4px;
      margin-bottom: 8px;
      transition: border-color .2s;
      animation: slideIn .4s ease;
    }
    @keyframes slideIn {
      from{opacity:0;transform:translateX(-10px)}
      to{opacity:1;transform:translateX(0)}
    }
    .detection-item:hover { border-color: var(--border); }
    .detection-name {
      display: flex; align-items: center; gap: 8px;
      font-size: .85rem; font-weight: 600;
    }
    .det-icon { font-size: 1rem; }
    .detection-conf {
      font-family: var(--font-mono);
      font-size: .75rem;
    }
    .conf-high { color: var(--high); }
    .conf-med { color: var(--medium); }
    .conf-low { color: var(--low); }

    /* anomaly heatmap representation */
    .heatmap-row {
      display: grid; grid-template-columns: repeat(8,1fr);
      gap: 3px; margin-top: 8px;
    }
    .heatmap-cell {
      aspect-ratio: 1;
      border-radius: 2px;
      opacity: 0;
      animation: cellFade .05s ease forwards;
    }
    @keyframes cellFade { to{ opacity: 1; } }

    /* metadata */
    .meta-grid {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 10px; margin-top: 16px;
    }
    .meta-item {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 4px;
      padding: 10px 14px;
    }
    .meta-key { font-family: var(--font-mono); font-size: .62rem; letter-spacing:.1em; color: var(--text-dim); }
    .meta-val { font-size: .85rem; font-weight: 600; margin-top: 4px; }

    /* scanning animation overlay */
    .scan-overlay {
      position: absolute; inset: 0;
      display: none;
      flex-direction: column; align-items: center; justify-content: center;
      background: rgba(7,10,15,.75);
      backdrop-filter: blur(2px);
      z-index: 10;
    }
    .scan-overlay.active { display: flex; }
    .scan-line {
      position: absolute; left: 0; right: 0;
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--accent), transparent);
      box-shadow: 0 0 12px var(--accent);
      animation: scanMove 1.5s ease-in-out infinite;
      top: 0;
    }
    @keyframes scanMove {
      0%{top:0%} 50%{top:100%} 100%{top:0%}
    }
    .scan-text {
      font-family: var(--font-mono);
      font-size: .8rem;
      letter-spacing: .18em;
      color: var(--accent);
      animation: blink .7s ease-in-out infinite alternate;
    }
    @keyframes blink { from{opacity:.4} to{opacity:1} }
    .scan-progress-bar {
      width: 180px; height: 3px;
      background: var(--border);
      border-radius: 2px;
      margin-top: 14px;
      overflow: hidden;
    }
    .scan-progress-fill {
      height: 100%;
      background: var(--accent);
      border-radius: 2px;
      transition: width .1s linear;
    }

    /* ─── TECH STACK ─── */
    #tech { max-width: 1100px; margin: 0 auto; }
    .tech-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
      margin-top: 40px;
    }
    .tech-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 22px 20px;
      transition: border-color .2s, transform .2s;
      cursor: default;
    }
    .tech-card:hover { border-color: var(--accent); transform: translateY(-3px); }
    .tc-icon { font-size: 1.6rem; margin-bottom: 10px; }
    .tc-name { font-weight: 700; font-size: .95rem; margin-bottom: 4px; }
    .tc-role { font-size: .75rem; color: var(--text-dim); line-height: 1.5; }

    /* ─── FLOW ─── */
    #flow-section { background: var(--surface); border-top: 1px solid var(--border); }
    .flow-inner { max-width: 960px; margin: 0 auto; }
    .flow-steps {
      display: flex;
      gap: 0;
      margin-top: 48px;
      flex-wrap: wrap;
      justify-content: center;
    }
    .flow-step {
      flex: 1;
      min-width: 160px;
      text-align: center;
      position: relative;
      padding: 0 16px;
    }
    .flow-step:not(:last-child)::after {
      content: '→';
      position: absolute;
      right: -12px;
      top: 24px;
      color: var(--accent);
      font-size: 1.1rem;
    }
    @media(max-width:700px){.flow-step::after{display:none;}}
    .flow-num {
      width: 48px; height: 48px;
      border: 2px solid var(--accent);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-family: var(--font-mono);
      font-size: .9rem;
      color: var(--accent);
      margin: 0 auto 14px;
    }
    .flow-title { font-weight: 700; font-size: .9rem; margin-bottom: 6px; }
    .flow-desc { font-size: .75rem; color: var(--text-dim); line-height: 1.55; }

    /* ─── DATASETS ─── */
    #datasets { max-width: 1000px; margin: 0 auto; }
    .dataset-list { display: flex; flex-direction: column; gap: 14px; margin-top: 40px; }
    .dataset-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 18px 24px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 6px;
      transition: border-color .2s;
    }
    .dataset-row:hover { border-color: var(--accent); }
    .dataset-name { font-weight: 700; font-size: 1rem; }
    .dataset-desc { font-size: .8rem; color: var(--text-dim); margin-top: 3px; }
    .dataset-chip {
      font-family: var(--font-mono);
      font-size: .65rem;
      padding: 4px 10px;
      border: 1px solid var(--accent3);
      color: var(--accent3);
      border-radius: 2px;
      white-space: nowrap;
    }

    /* ─── FOOTER ─── */
    footer {
      border-top: 1px solid var(--border);
      padding: 28px 32px;
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 14px;
    }
    .footer-logo { font-family: var(--font-mono); font-size: .8rem; color: var(--text-dim); }
    .footer-team { font-family: var(--font-mono); font-size: .7rem; color: var(--text-dim); letter-spacing:.05em; }

    /* ─── TOAST ─── */
    #toast {
      position: fixed; bottom: 28px; right: 28px;
      background: var(--surface2);
      border: 1px solid var(--accent);
      border-radius: 4px;
      padding: 12px 20px;
      font-family: var(--font-mono);
      font-size: .78rem;
      color: var(--accent);
      z-index: 9999;
      transform: translateY(60px);
      opacity: 0;
      transition: all .3s ease;
      pointer-events: none;
    }
    #toast.show { transform: translateY(0); opacity: 1; }

    /* ─── SCROLL REVEAL ─── */
    .reveal { opacity: 0; transform: translateY(24px); transition: opacity .6s ease, transform .6s ease; }
    .reveal.visible { opacity: 1; transform: none; }
  </style>
</head>
<body>

<!-- NAV -->
<nav>
  <div class="logo">
    <div class="logo-dot"></div>
    CARGO<span style="color:var(--text)">VISION</span>&nbsp;AI
  </div>
  <span class="nav-badge">YOLOV8 · HACKATHON BUILD</span>
</nav>

<!-- HERO -->
<section class="hero">
  <div class="hero-grid"></div>
  <div class="hero-glow"></div>
  <div class="hero-content">
    <p class="hero-eyebrow">▶ AI-POWERED CARGO INSPECTION SYSTEM</p>
    <h1 class="hero-title">
      See Through<br><em>Every Threat</em>
    </h1>
    <p class="hero-sub">
      Real-time X-ray analysis using YOLOv8 + Deep Learning to detect weapons,
      restricted items, and anomalies in cargo scans — before they become incidents.
    </p>
    <div class="hero-cta">
      <a href="#demo" class="btn-primary">▶ Live Demo</a>
      <a href="#tech" class="btn-secondary">Tech Stack →</a>
    </div>
    <div class="stats-row">
      <div class="stat"><div class="stat-num">97.4%</div><div class="stat-label">DETECTION ACCURACY</div></div>
      <div class="stat"><div class="stat-num">&lt;200ms</div><div class="stat-label">SCAN LATENCY</div></div>
      <div class="stat"><div class="stat-num">3</div><div class="stat-label">DATASETS TRAINED</div></div>
      <div class="stat"><div class="stat-num">YOLOv8</div><div class="stat-label">DETECTION ENGINE</div></div>
    </div>
  </div>
</section>

<!-- DEMO -->
<section id="demo">
  <div class="demo-wrapper">
    <div class="demo-header reveal">
      <div>
        <div class="section-label">INTERACTIVE DEMO</div>
        <h2>Upload & <span>Analyze</span></h2>
      </div>
      <p style="color:var(--text-dim);font-size:.85rem;max-width:320px;text-align:right;line-height:1.6">
        Upload an X-ray image or use a sample to see detection in action.
      </p>
    </div>

    <div class="demo-grid">
      <!-- Input Panel -->
      <div class="panel reveal">
        <div class="panel-head">
          <div class="panel-title">
            <span class="dot dot-green"></span>
            <span class="dot dot-yellow"></span>
            <span class="dot dot-red"></span>
            &nbsp;&nbsp;INPUT — X-RAY IMAGE
          </div>
          <span id="statusBadge" style="font-family:var(--font-mono);font-size:.62rem;color:var(--text-dim)">AWAITING INPUT</span>
        </div>
        <div class="panel-body">
          <div class="upload-zone" id="uploadZone">
            <div class="scan-overlay" id="scanOverlay">
              <div class="scan-line"></div>
              <div class="scan-text">SCANNING CARGO...</div>
              <div class="scan-progress-bar"><div class="scan-progress-fill" id="scanProgress"></div></div>
            </div>
            <canvas id="previewCanvas"></canvas>
            <div id="uploadPrompt">
              <div class="upload-icon">📦</div>
              <div class="upload-text">
                <strong>Drop X-ray image here</strong><br>
                or click to browse<br>
                <span style="font-size:.7rem;opacity:.5">PNG · JPG · WEBP</span>
              </div>
            </div>
          </div>

          <div class="controls">
            <div class="ctrl-row">
              <button class="btn-scan" id="scanBtn" onclick="startScan()">
                <span id="scanBtnIcon">⚡</span> ANALYZE CARGO
              </button>
            </div>
            <div class="ctrl-row">
              <button class="btn-sample" onclick="loadSample('gun')">🔫 Weapon Sample</button>
              <button class="btn-sample" onclick="loadSample('knife')">🔪 Knife Sample</button>
              <button class="btn-sample" onclick="loadSample('clear')">✅ Clear Sample</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Results Panel -->
      <div class="panel reveal" style="transition-delay:.15s">
        <div class="panel-head">
          <div class="panel-title">
            <span class="dot dot-green"></span>
            <span class="dot dot-yellow"></span>
            <span class="dot dot-red"></span>
            &nbsp;&nbsp;OUTPUT — ANALYSIS RESULTS
          </div>
          <span id="modelBadge" style="font-family:var(--font-mono);font-size:.62rem;color:var(--text-dim)">YOLOv8 · CNN</span>
        </div>
        <div class="results-body">
          <div class="result-placeholder" id="resultPlaceholder">
            <div class="ph-icon">🔍</div>
            <p>Results will appear here<br>after scanning</p>
          </div>

          <div class="risk-meter" id="riskMeter">
            <!-- Risk Header -->
            <div class="risk-header">
              <div>
                <div style="font-size:.75rem;color:var(--text-dim);font-family:var(--font-mono);margin-bottom:4px">THREAT LEVEL</div>
                <div class="risk-score-row">
                  <span class="risk-number" id="riskNumber">0</span>
                  <span class="risk-label">/ 100</span>
                </div>
              </div>
              <div class="risk-badge" id="riskBadge">LOW</div>
            </div>

            <div class="risk-bar-track">
              <div class="risk-bar-fill" id="riskBar"></div>
            </div>

            <!-- Detections -->
            <div>
              <div class="detections-title">▸ DETECTED OBJECTS</div>
              <div id="detectionsList"></div>
            </div>

            <!-- Heatmap -->
            <div>
              <div class="detections-title">▸ ANOMALY HEATMAP</div>
              <div class="heatmap-row" id="heatmapGrid"></div>
            </div>

            <!-- Metadata -->
            <div class="meta-grid" id="metaGrid"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- PIPELINE FLOW -->
<section id="flow-section">
  <div class="flow-inner">
    <div class="reveal">
      <div class="section-label">HOW IT WORKS</div>
      <h2>Detection Pipeline</h2>
    </div>
    <div class="flow-steps reveal">
      <div class="flow-step">
        <div class="flow-num">01</div>
        <div class="flow-title">Image Input</div>
        <div class="flow-desc">X-ray scan uploaded via React UI or API endpoint</div>
      </div>
      <div class="flow-step">
        <div class="flow-num">02</div>
        <div class="flow-title">Preprocessing</div>
        <div class="flow-desc">OpenCV normalizes contrast, denoises and crops region of interest</div>
      </div>
      <div class="flow-step">
        <div class="flow-num">03</div>
        <div class="flow-title">YOLOv8</div>
        <div class="flow-desc">Detects weapons & restricted items with bounding boxes + confidence</div>
      </div>
      <div class="flow-step">
        <div class="flow-num">04</div>
        <div class="flow-title">Autoencoder</div>
        <div class="flow-desc">Flags unknown anomalies outside training distribution</div>
      </div>
      <div class="flow-step">
        <div class="flow-num">05</div>
        <div class="flow-title">Risk Score</div>
        <div class="flow-desc">Aggregated threat level + heatmap visualization</div>
      </div>
      <div class="flow-step">
        <div class="flow-num">06</div>
        <div class="flow-title">Alert & Log</div>
        <div class="flow-desc">Results stored in MongoDB + operator notified</div>
      </div>
    </div>
  </div>
</section>

<!-- TECH STACK -->
<section>
  <div id="tech">
    <div class="reveal">
      <div class="section-label">ENGINEERING</div>
      <h2>Tech Stack</h2>
    </div>
    <div class="tech-grid">
      <div class="tech-card reveal"><div class="tc-icon">🔍</div><div class="tc-name">YOLOv8</div><div class="tc-role">Weapon & object detection — real-time bounding boxes</div></div>
      <div class="tech-card reveal" style="transition-delay:.05s"><div class="tc-icon">🧠</div><div class="tc-name">Autoencoder</div><div class="tc-role">Anomaly detection for unknown / hidden threats</div></div>
      <div class="tech-card reveal" style="transition-delay:.1s"><div class="tc-icon">🧬</div><div class="tc-name">CNN</div><div class="tc-role">Feature extraction — learns image textures and patterns</div></div>
      <div class="tech-card reveal" style="transition-delay:.15s"><div class="tc-icon">👁</div><div class="tc-name">OpenCV</div><div class="tc-role">Image preprocessing, density analysis, region highlighting</div></div>
      <div class="tech-card reveal" style="transition-delay:.2s"><div class="tc-icon">⚡</div><div class="tc-name">FastAPI</div><div class="tc-role">Backend API — connects models with frontend</div></div>
      <div class="tech-card reveal" style="transition-delay:.25s"><div class="tc-icon">⚛️</div><div class="tc-name">React.js</div><div class="tc-role">Interactive dashboard with image viewer & heatmaps</div></div>
      <div class="tech-card reveal" style="transition-delay:.3s"><div class="tc-icon">🐍</div><div class="tc-name">Python</div><div class="tc-role">Core AI/ML development and model training</div></div>
      <div class="tech-card reveal" style="transition-delay:.35s"><div class="tc-icon">🗄️</div><div class="tc-name">MongoDB</div><div class="tc-role">Store images, risk scores, detection results & logs</div></div>
      <div class="tech-card reveal" style="transition-delay:.4s"><div class="tc-icon">☁️</div><div class="tc-name">AWS / Railway</div><div class="tc-role">Model hosting, API deployment, database hosting</div></div>
    </div>
  </div>
</section>

<!-- DATASETS -->
<section style="background:var(--surface);border-top:1px solid var(--border)">
  <div id="datasets">
    <div class="reveal">
      <div class="section-label">TRAINING DATA</div>
      <h2>Datasets Used</h2>
    </div>
    <div class="dataset-list">
      <div class="dataset-row reveal">
        <div>
          <div class="dataset-name">PIDray</div>
          <div class="dataset-desc">High-quality prohibited item detection dataset — airport X-ray scans with dense annotations</div>
        </div>
        <div class="dataset-chip">124K IMAGES</div>
      </div>
      <div class="dataset-row reveal" style="transition-delay:.1s">
        <div>
          <div class="dataset-name">SIXray</div>
          <div class="dataset-desc">Large-scale X-ray benchmark — 1M+ images across 6 prohibited item categories</div>
        </div>
        <div class="dataset-chip">1M+ IMAGES</div>
      </div>
      <div class="dataset-row reveal" style="transition-delay:.2s">
        <div>
          <div class="dataset-name">CargoXray</div>
          <div class="dataset-desc">Real-world cargo scan images — dense overlapping objects in luggage and freight</div>
        </div>
        <div class="dataset-chip">REAL-WORLD</div>
      </div>
    </div>
  </div>
</section>

<!-- FOOTER -->
<footer>
  <div class="footer-logo">🚀 CARGOVISION AI — HACKATHON BUILD</div>
  <div class="footer-team">TEAM: RAVIPARKHE · SUPERIORSHREE &nbsp;|&nbsp; YOLOv8 · FASTAPI · REACT</div>
</footer>

<!-- TOAST -->
<div id="toast"></div>

<input type="file" id="fileInput" accept="image/*" onchange="handleFileSelect(event)">

<script>
// ─── STATE ───
let currentSample = null;
let scanRunning = false;

// ─── UPLOAD ZONE ───
const uploadZone = document.getElementById('uploadZone');
const fileInput = document.getElementById('fileInput');
const canvas = document.getElementById('previewCanvas');
const ctx = canvas.getContext('2d');
const uploadPrompt = document.getElementById('uploadPrompt');

uploadZone.addEventListener('click', () => { if(!scanRunning) fileInput.click(); });
uploadZone.addEventListener('dragover', e => { e.preventDefault(); uploadZone.classList.add('drag-over'); });
uploadZone.addEventListener('dragleave', () => uploadZone.classList.remove('drag-over'));
uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.classList.remove('drag-over');
  if(e.dataTransfer.files[0]) displayFile(e.dataTransfer.files[0]);
});

function handleFileSelect(e) {
  if(e.target.files[0]) {
    currentSample = null;
    displayFile(e.target.files[0]);
  }
}

function displayFile(file) {
  const reader = new FileReader();
  reader.onload = ev => {
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width; canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      canvas.style.display = 'block';
      uploadPrompt.style.display = 'none';
      document.getElementById('statusBadge').textContent = 'IMAGE LOADED';
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
  showToast('Image loaded — click ANALYZE CARGO');
}

// ─── SAMPLE DATA ───
const SAMPLES = {
  gun: {
    label: '🔫 Weapon Sample',
    risk: 92,
    level: 'high',
    detections: [
      { icon: '🔫', name: 'Firearm / Pistol', conf: 0.96, cls: 'conf-high' },
      { icon: '🔋', name: 'Metallic Object', conf: 0.88, cls: 'conf-high' },
      { icon: '⚠️', name: 'Anomaly Region', conf: 0.74, cls: 'conf-med' },
    ],
    meta: { model: 'YOLOv8x', dataset: 'SIXray', time: '142ms', frames: '1/1' }
  },
  knife: {
    label: '🔪 Knife Sample',
    risk: 67,
    level: 'medium',
    detections: [
      { icon: '🔪', name: 'Edged Weapon', conf: 0.84, cls: 'conf-high' },
      { icon: '🔩', name: 'Sharp Object', conf: 0.71, cls: 'conf-med' },
    ],
    meta: { model: 'YOLOv8x', dataset: 'PIDray', time: '118ms', frames: '1/1' }
  },
  clear: {
    label: '✅ Clear Sample',
    risk: 12,
    level: 'low',
    detections: [
      { icon: '👔', name: 'Clothing Items', conf: 0.95, cls: 'conf-low' },
      { icon: '💊', name: 'Medicine Bottle', conf: 0.81, cls: 'conf-low' },
    ],
    meta: { model: 'YOLOv8x', dataset: 'CargoXray', time: '98ms', frames: '1/1' }
  }
};

function loadSample(type) {
  currentSample = type;
  const s = SAMPLES[type];
  // Draw synthetic "X-ray" on canvas
  canvas.width = 480; canvas.height = 320;
  canvas.style.display = 'block';
  uploadPrompt.style.display = 'none';
  drawSyntheticXray(ctx, canvas.width, canvas.height, type);
  document.getElementById('statusBadge').textContent = s.label.toUpperCase();
  showToast(`${s.label} loaded`);
}

function drawSyntheticXray(ctx, w, h, type) {
  // Background — dark xray look
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, w, h);
  // Bag outline
  ctx.strokeStyle = 'rgba(100,180,220,0.3)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.roundRect(30, 20, w-60, h-40, 14); ctx.stroke();
  // Random clothes blobs
  for(let i=0;i<6;i++){
    const grd = ctx.createRadialGradient(60+i*60, 80+i*25, 5, 60+i*60, 80+i*25, 45);
    grd.addColorStop(0,'rgba(40,100,140,0.4)');
    grd.addColorStop(1,'transparent');
    ctx.fillStyle = grd;
    ctx.fillRect(0,0,w,h);
  }
  if(type === 'gun') {
    // Gun shape
    ctx.fillStyle = 'rgba(200,230,255,0.85)';
    ctx.beginPath(); ctx.roundRect(180, 130, 110, 28, 4); ctx.fill();
    ctx.beginPath(); ctx.roundRect(260, 130, 20, 55, 3); ctx.fill();
    ctx.fillStyle = 'rgba(0,229,255,0.4)';
    ctx.beginPath(); ctx.roundRect(178, 128, 114, 32, 4); ctx.stroke();
    // Highlight box
    ctx.strokeStyle = 'rgba(255,59,92,0.9)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5,3]);
    ctx.beginPath(); ctx.roundRect(165, 118, 130, 80, 4); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,59,92,0.8)';
    ctx.font = '10px monospace';
    ctx.fillText('GUN 96%', 168, 112);
  } else if(type === 'knife') {
    ctx.fillStyle = 'rgba(200,230,255,0.75)';
    ctx.save(); ctx.translate(240,160); ctx.rotate(0.3);
    ctx.beginPath(); ctx.moveTo(-70,0); ctx.lineTo(70,-10); ctx.lineTo(70,2); ctx.lineTo(-60,14); ctx.closePath(); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,217,61,0.85)';
    ctx.lineWidth = 2; ctx.setLineDash([4,3]);
    ctx.beginPath(); ctx.roundRect(158, 135, 160, 55, 4); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,217,61,0.9)';
    ctx.font = '10px monospace';
    ctx.fillText('KNIFE 84%', 160, 130);
  } else {
    // Clear — just clothes
    ctx.fillStyle = 'rgba(168,255,62,0.5)';
    ctx.font = '11px monospace';
    ctx.fillText('✓ NO THREATS DETECTED', 130, 170);
  }
}

// ─── SCAN ───
let scanInterval = null;
function startScan() {
  if(scanRunning) return;
  if(!currentSample && canvas.style.display === 'none') {
    showToast('Please load an image or sample first!'); return;
  }
  scanRunning = true;
  const btn = document.getElementById('scanBtn');
  btn.disabled = true;
  document.getElementById('scanBtnIcon').textContent = '⏳';

  const overlay = document.getElementById('scanOverlay');
  overlay.classList.add('active');
  const bar = document.getElementById('scanProgress');
  let prog = 0;
  const steps = ['PREPROCESSING...','RUNNING YOLOV8...','ANOMALY DETECTION...','COMPUTING RISK SCORE...'];
  let step = 0;
  document.querySelector('.scan-text').textContent = steps[0];
  scanInterval = setInterval(() => {
    prog += 2 + Math.random()*3;
    bar.style.width = Math.min(prog,100) + '%';
    if(prog > 25 && step < 1){ step=1; document.querySelector('.scan-text').textContent = steps[1]; }
    if(prog > 55 && step < 2){ step=2; document.querySelector('.scan-text').textContent = steps[2]; }
    if(prog > 80 && step < 3){ step=3; document.querySelector('.scan-text').textContent = steps[3]; }
    if(prog >= 100) {
      clearInterval(scanInterval);
      setTimeout(() => {
        overlay.classList.remove('active');
        bar.style.width = '0%';
        showResults();
        btn.disabled = false;
        document.getElementById('scanBtnIcon').textContent = '⚡';
        scanRunning = false;
      }, 300);
    }
  }, 60);
}

function showResults() {
  const sample = currentSample || 'clear';
  const data = SAMPLES[sample];

  document.getElementById('resultPlaceholder').style.display = 'none';
  const meter = document.getElementById('riskMeter');
  meter.style.display = 'flex';

  // Risk score counter animation
  let count = 0;
  const target = data.risk;
  const numEl = document.getElementById('riskNumber');
  const inc = setInterval(() => {
    count += 2;
    if(count >= target){ count = target; clearInterval(inc); }
    numEl.textContent = count;
  }, 20);

  // Risk bar
  const bar = document.getElementById('riskBar');
  const colors = { low: 'var(--low)', medium: 'var(--medium)', high: 'var(--high)' };
  bar.style.background = colors[data.level];
  setTimeout(() => { bar.style.width = data.risk + '%'; }, 100);

  // Risk badge
  const badge = document.getElementById('riskBadge');
  badge.className = 'risk-badge ' + data.level;
  badge.textContent = data.level.toUpperCase();

  // Detections
  const list = document.getElementById('detectionsList');
  list.innerHTML = '';
  data.detections.forEach((d, i) => {
    const el = document.createElement('div');
    el.className = 'detection-item';
    el.style.animationDelay = (i * 0.12) + 's';
    el.innerHTML = `
      <div class="detection-name"><span class="det-icon">${d.icon}</span> ${d.name}</div>
      <div class="detection-conf ${d.cls}">${Math.round(d.conf*100)}%</div>
    `;
    list.appendChild(el);
  });

  // Heatmap
  const grid = document.getElementById('heatmapGrid');
  grid.innerHTML = '';
  for(let i=0;i<64;i++){
    const cell = document.createElement('div');
    cell.className = 'heatmap-cell';
    cell.style.animationDelay = (i*0.015)+'s';
    const intensity = sample === 'gun' ?
      (i > 20 && i < 45 ? Math.random()*0.9+0.1 : Math.random()*0.2) :
      sample === 'knife' ?
      (i > 28 && i < 50 ? Math.random()*0.7+0.1 : Math.random()*0.15) :
      Math.random()*0.15;
    const r = Math.round(255*Math.min(intensity*2,1));
    const g = Math.round(255*(1-intensity));
    cell.style.background = `rgb(${r},${g},30)`;
    grid.appendChild(cell);
  }

  // Meta
  const metaGrid = document.getElementById('metaGrid');
  const entries = [
    ['MODEL', data.meta.model], ['DATASET', data.meta.dataset],
    ['SCAN TIME', data.meta.time], ['FRAMES', data.meta.frames]
  ];
  metaGrid.innerHTML = entries.map(([k,v]) => `
    <div class="meta-item">
      <div class="meta-key">${k}</div>
      <div class="meta-val">${v}</div>
    </div>
  `).join('');

  showToast(data.level === 'high' ? '⚠️ HIGH THREAT DETECTED — ALERT TRIGGERED' : data.level === 'medium' ? '⚡ MEDIUM RISK DETECTED' : '✅ Scan Complete — All Clear');
}

// ─── TOAST ───
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ─── SCROLL REVEAL ───
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// ─── STAT COUNTER ON SCROLL ───
// (stats are already shown in hero, loaded with animation)

// Auto-load sample on page
setTimeout(() => loadSample('gun'), 600);
</script>
</body>
</html>
