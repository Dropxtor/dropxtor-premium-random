import type { RequestHandler } from "express";
import { paymentMiddleware } from "x402-express";
import { getEnv } from "../config.js";

export function createX402Middleware(): RequestHandler {
  const env = getEnv();

  // The coinbase/x402 README shows:
  //   paymentMiddleware("0xYourAddress", { "/your-endpoint": "$0.01" })
  // We keep pricing configurable.
  const price = `$${env.X402_PRICE_USD}`;

  const config: Record<string, string> = {
    "/api/premium-random": price
  };

  // Some deployments may want to set a custom facilitator.
  // x402-express supports options; we pass only when configured.
  const facilitator = env.X402_FACILITATOR_URL && env.X402_FACILITATOR_URL.length > 0 ? env.X402_FACILITATOR_URL : undefined;

  return paymentMiddleware(env.X402_PAY_TO_ADDRESS, config, facilitator ? { facilitator } : undefined);
}
