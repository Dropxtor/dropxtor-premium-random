import crypto from "crypto";
import { getEnv } from "../config.js";

const cache = new Map<string, Buffer>();

function stableIntSeed(seed: string): number {
  // Map arbitrary string -> stable signed int in Venice API range.
  const h = crypto.createHash("sha256").update(seed).digest();
  const n = h.readInt32BE(0);
  return Math.max(-999999999, Math.min(999999999, n));
}

export async function getOrGenerateVenicePng(args: {
  seed: string;
  prompt: string;
  width?: number;
  height?: number;
  model?: string;
}): Promise<Buffer> {
  const { seed, prompt } = args;
  const cacheKey = `${seed}:${prompt}`;
  const hit = cache.get(cacheKey);
  if (hit) return hit;

  const env = getEnv();
  if (!env.VENICE_API_KEY || env.VENICE_API_KEY.length === 0) {
    throw new Error("VENICE_API_KEY is required to generate images");
  }

  const base =
    env.VENICE_API_BASE_URL && env.VENICE_API_BASE_URL.length > 0
      ? env.VENICE_API_BASE_URL.replace(/\/$/, "")
      : "https://api.venice.ai/api/v1";

  const url = `${base}/image/generate`;

  const width = args.width ?? 955;
  const height = args.height ?? 500;
  const model = args.model ?? "z-image-turbo";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.VENICE_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      prompt,
      // Deterministic per seed
      seed: stableIntSeed(seed),
      width,
      height,
      format: "png",
      return_binary: true,
      safe_mode: false
    })
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Venice image generate failed: ${res.status} ${text.slice(0, 256)}`);
  }

  const ct = res.headers.get("content-type") ?? "";
  let buf: Buffer;
  if (ct.includes("image/")) {
    buf = Buffer.from(await res.arrayBuffer());
  } else {
    // Some configs may return JSON with base64 images.
    const j: any = await res.json();
    const b64 = j?.images?.[0];
    if (typeof b64 !== "string" || b64.length === 0) {
      throw new Error("Venice response did not include binary image nor base64 images[0]");
    }
    buf = Buffer.from(b64, "base64");
  }

  cache.set(cacheKey, buf);
  return buf;
}
