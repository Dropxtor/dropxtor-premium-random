import crypto from "crypto";

export function randomSeed(): string {
  return crypto.randomBytes(16).toString("hex");
}

export function svgForSeed(seed: string, label: string): string {
  const color = "#" + crypto.createHash("sha256").update(seed).digest("hex").slice(0, 6);
  const bg = "#" + crypto.createHash("sha256").update(seed + "bg").digest("hex").slice(0, 6);

  // 1.91:1 (approx 955x500) recommended.
  const w = 955;
  const h = 500;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="${bg}" />
      <stop offset="100%" stop-color="${color}" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)" />
  <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle"
        font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI" font-size="44" fill="#ffffff">
    ${escapeXml(label)}
  </text>
  <text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle"
        font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas" font-size="24" fill="#ffffff" opacity="0.9">
    seed: ${escapeXml(seed)}
  </text>
</svg>`;
}

function escapeXml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}
