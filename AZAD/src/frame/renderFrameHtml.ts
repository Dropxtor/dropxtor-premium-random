type Button = {
  label: string;
  action?: "post" | "post_redirect" | "link" | "mint" | "tx";
  target?: string;
  postUrl?: string;
};

export function renderFrameHtml(args: {
  title?: string;
  imageUrl: string;
  postUrl?: string;
  aspectRatio?: "1.91:1" | "1:1";
  buttons?: Button[];
  state?: unknown;
}): string {
  const {
    title = "Random Frame",
    imageUrl,
    postUrl,
    aspectRatio = "1.91:1",
    buttons = [],
    state
  } = args;

  const meta: string[] = [];
  meta.push(`<meta property="og:title" content="${escapeHtml(title)}" />`);
  meta.push(`<meta property="og:image" content="${escapeHtml(imageUrl)}" />`);

  // Frames v1 / vNext
  meta.push(`<meta property="fc:frame" content="vNext" />`);
  meta.push(`<meta property="fc:frame:image" content="${escapeHtml(imageUrl)}" />`);
  meta.push(`<meta property="fc:frame:image:aspect_ratio" content="${escapeHtml(aspectRatio)}" />`);

  if (postUrl) {
    meta.push(`<meta property="fc:frame:post_url" content="${escapeHtml(postUrl)}" />`);
  }

  if (state !== undefined) {
    // Max 4096 bytes in spec; keep it small.
    const stateStr = JSON.stringify(state);
    meta.push(`<meta property="fc:frame:state" content='${escapeHtml(stateStr)}' />`);
  }

  for (let i = 0; i < Math.min(buttons.length, 4); i++) {
    const idx = i + 1;
    const b = buttons[i]!;
    meta.push(`<meta property="fc:frame:button:${idx}" content="${escapeHtml(b.label)}" />`);
    if (b.action) meta.push(`<meta property="fc:frame:button:${idx}:action" content="${escapeHtml(b.action)}" />`);
    if (b.target) meta.push(`<meta property="fc:frame:button:${idx}:target" content="${escapeHtml(b.target)}" />`);
    if (b.postUrl) meta.push(`<meta property="fc:frame:button:${idx}:post_url" content="${escapeHtml(b.postUrl)}" />`);
  }

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    ${meta.join("\n    ")}
  </head>
  <body>
    <p>${escapeHtml(title)}</p>
  </body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
