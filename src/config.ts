import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();
const AddressSchema = z.string().refine(
  (v): v is `0x${string}` => /^0x[a-fA-F0-9]{40}$/.test(v),
const AddressSchema = z.custom<`0x${string}`>(
  (v) => typeof v === "string" && /^0x[a-fA-F0-9]{40}$/.test(v),
  { message: "Expected an EVM address like 0x + 40 hex chars" }
);
const EnvSchema = z.object({
  NEYNAR_API_KEY: z.string().min(1),
  PUBLIC_BASE_URL: z.string().url().default("http://localhost:3000"),
  PORT: z.coerce.number().int().positive().default(3000),

  // Base (mainnet)
  BASE_CHAIN_ID: z.coerce.number().int().positive().default(8453),

  // Mint flow
  // - create2: deploy a fresh ERC-721 per mint using the on-chain CREATE2 Deployer (no manual deployment)
  // - factory: call a factory contract
  // - contract: call a pre-deployed ERC-721 contract
  MINT_MODE: z.enum(["create2", "factory", "contract"]).default("create2"),
  MINT_CONTRACT_ADDRESS: z.string().optional().or(z.literal("")),
  MINT_FACTORY_ADDRESS: z.string().optional().or(z.literal("")),

  X402_PAY_TO_ADDRESS: z.string().min(1),
  X402_NETWORK: z.string().min(1).default("base"),
  X402_PRICE_USD: z.coerce.number().positive().default(0.01),
  X402_FACILITATOR_URL: z.string().optional().or(z.literal("")),

  // Venice (optional until mint flow is wired)
  VENICE_API_KEY: z.string().optional().or(z.literal("")),
  VENICE_API_BASE_URL: z.string().optional().or(z.literal("")),

  CDP_API_KEY_ID: z.string().optional().or(z.literal("")),
  CDP_API_KEY_SECRET: z.string().optional().or(z.literal("")),
  CDP_WALLET_SECRET: z.string().optional().or(z.literal(""))
});

export type Env = z.infer<typeof EnvSchema>;

export function getEnv(): Env {
  // NEYNAR_API_KEY is required to validate Frame actions properly.
  return EnvSchema.parse(process.env);
}

