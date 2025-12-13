import type { Router } from "express";
import express from "express";
import { getEnv } from "../config.js";
import { getRequestBaseUrl } from "../http/baseUrl.js";

export function createMiniappRouter(): Router {
  const env = getEnv();
  const r = express.Router();

  r.get("/", (req, res) => {
    const seed = typeof req.query.seed === "string" ? req.query.seed : "";
    const baseUrl = getRequestBaseUrl(req, env.PUBLIC_BASE_URL);

    // Minimal miniapp landing page.
    // This page can call x402-protected APIs (e.g. /api/premium-random) from a proper x402 client.
    res
      .status(200)
      .type("html")
      .send(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Premium Random (x402)</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
      :root {
        --bg: #020402;
        --green: #00ff66;
        --green-dim: rgba(0, 255, 102, 0.5);
        --border: rgba(0, 255, 102, 0.25);
        --shadow: rgba(0, 255, 102, 0.12);
      }
      html, body { height: 100%; }
      body {
        margin: 0;
        background: radial-gradient(1200px 800px at 15% 10%, rgba(0,255,102,0.08), transparent 60%),
                    radial-gradient(1200px 800px at 85% 90%, rgba(0,255,102,0.06), transparent 60%),
                    var(--bg);
        color: var(--green);
        font-family: "Share Tech Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        letter-spacing: 0.2px;
        overflow-x: hidden;
      }
      a { color: var(--green); }
      .wrap { max-width: 860px; margin: 48px auto; padding: 0 20px; }
      .card {
        border: 1px solid var(--border);
        background: rgba(0,0,0,0.35);
        box-shadow: 0 0 0 1px rgba(0,255,102,0.06) inset, 0 18px 60px var(--shadow);
        border-radius: 14px;
        padding: 22px 20px;
      }
      .row { display: grid; grid-template-columns: 1fr; gap: 14px; }
      .pill {
        display: inline-flex;
        gap: 10px;
        align-items: center;
        padding: 6px 10px;
        border: 1px solid var(--border);
        border-radius: 999px;
        background: rgba(0,0,0,0.55);
        color: var(--green);
        font-size: 12px;
      }
      .kv { color: var(--green-dim); }
      .muted { color: rgba(0,255,102,0.72); }
      .glitch {
        position: relative;
        font-size: 28px;
        margin: 0 0 14px;
        text-transform: uppercase;
        letter-spacing: 2px;
      }
      .glitch::before, .glitch::after {
        content: attr(data-text);
        position: absolute;
        inset: 0;
        opacity: 0.75;
        pointer-events: none;
      }
      .glitch::before {
        transform: translate(1px, -1px);
        color: rgba(0,255,255,0.85);
        clip-path: inset(0 0 55% 0);
        animation: glitchTop 2.2s infinite linear alternate-reverse;
      }
      .glitch::after {
        transform: translate(-1px, 1px);
        color: rgba(255,0,102,0.75);
        clip-path: inset(55% 0 0 0);
        animation: glitchBottom 1.9s infinite linear alternate-reverse;
      }
      @keyframes glitchTop {
        0% { clip-path: inset(0 0 65% 0); }
        35% { clip-path: inset(0 0 40% 0); }
        70% { clip-path: inset(0 0 52% 0); }
        100% { clip-path: inset(0 0 60% 0); }
      }
      @keyframes glitchBottom {
        0% { clip-path: inset(55% 0 0 0); }
        45% { clip-path: inset(68% 0 0 0); }
        80% { clip-path: inset(50% 0 0 0); }
        100% { clip-path: inset(62% 0 0 0); }
      }
      .scanlines {
        position: fixed;
        inset: 0;
        pointer-events: none;
        background: repeating-linear-gradient(
          to bottom,
          rgba(0,0,0,0) 0px,
          rgba(0,0,0,0) 2px,
          rgba(0,0,0,0.25) 3px
        );
        mix-blend-mode: overlay;
        opacity: 0.35;
      }
      .noise {
        position: fixed;
        inset: 0;
        pointer-events: none;
        background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" stitchTiles="stitch"/></filter><rect width="160" height="160" filter="url(%23n)" opacity="0.35"/></svg>');
        opacity: 0.08;
      }
      code {
        background: rgba(0,0,0,0.6);
        padding: 2px 6px;
        border: 1px solid var(--border);
        border-radius: 8px;
      }
      .btn {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        border: 1px solid var(--border);
        border-radius: 12px;
        background: rgba(0,0,0,0.55);
        text-decoration: none;
        box-shadow: 0 0 0 1px rgba(0,255,102,0.06) inset;
      }
      .btn:hover { background: rgba(0,0,0,0.75); }
      .footer { margin-top: 14px; font-size: 12px; color: rgba(0,255,102,0.55); }
    </style>
  </head>
  <body>
    <div class="scanlines"></div>
    <div class="noise"></div>
    <div class="wrap">
      <div class="card">
        <div class="pill"><span class="kv">seed</span> <code>${escapeHtml(seed)}</code> <span class="kv">network</span> <code>base</code></div>
        <h1 class="glitch" data-text="PREMIUM RANDOM by dropxtor">PREMIUM RANDOM by dropxtor</h1>
        <div class="row">
          <p class="muted">
            🔐🛡️ Endpoint protected by <strong>x402</strong> (HTTP 402) 🧬 Matrix - glitch for Vercel deployment 🖥️.
          </p>
          <ol class="muted">
            <li>Call <code>/api/premium-random</code> sans header <code>X-PAYMENT</code> → 402 + requirements.</li>
            <li>Pay via client x402 (ex: <code>x402-fetch</code>) puis re-tente → 200 OK.</li>
          </ol>
          <a class="btn" href="${escapeHtml(new URL(`/api/premium-random?seed=${encodeURIComponent(seed)}`, baseUrl).toString())}">
            <span>→</span><span>OPEN /api/premium-random</span>
          </a>
          <div class="footer">
            📝⚠️ Note: Frames do not natively support x402 payments, so monetization is handled via the mini-app instead.
          </div>
        </div>
      </div>
    </div>
  </body>
</html>`);
  });

  return r;
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}


