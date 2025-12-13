import type { Request } from "express";

export function getRequestBaseUrl(req: Request, fallback?: string): string {
  // Prefer explicit config for local dev.
  if (fallback && fallback.length > 0) return fallback;

  const protoHeader = req.headers["x-forwarded-proto"];
  const proto = Array.isArray(protoHeader)
    ? protoHeader[0]
    : typeof protoHeader === "string" && protoHeader.length > 0
      ? protoHeader
      : "http";

  const hostHeader = req.headers["x-forwarded-host"] ?? req.headers.host;
  const host = Array.isArray(hostHeader) ? hostHeader[0] : hostHeader;

  if (!host) return "http://localhost";
  return `${proto}://${host}`;
}
