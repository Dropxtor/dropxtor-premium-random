#!/usr/bin/env bash
set -Eeuo pipefail

# Interactive bootstrap for this repo.
# Designed to be run in bash (WSL/Git-Bash on Windows).

say() { printf "\n%s\n" "$1"; }
need() { command -v "$1" >/dev/null 2>&1 || { echo "Missing required command: $1"; exit 1; }; }

say "[1/6] Checking prerequisites"
need node
need npm

say "[2/6] Creating .env if missing"
if [[ ! -f .env ]]; then
  cp .env.example .env
  say "Created .env from .env.example"
fi

say "[3/6] Configure env vars"
read -r -p "NEYNAR_API_KEY (required): " NEYNAR_API_KEY
read -r -p "VENICE_API_KEY (required for mint image): " VENICE_API_KEY
read -r -p "PUBLIC_BASE_URL [http://localhost:3000]: " PUBLIC_BASE_URL
read -r -p "PORT [3000]: " PORT
read -r -p "X402_PAY_TO_ADDRESS (EVM address to receive funds): " X402_PAY_TO_ADDRESS
read -r -p "X402_NETWORK [base-sepolia]: " X402_NETWORK
read -r -p "X402_PRICE_USD [0.01]: " X402_PRICE_USD
read -r -p "MINT_MODE [create2|contract|factory] (default: create2): " MINT_MODE
read -r -p "MINT_CONTRACT_ADDRESS (if MINT_MODE=contract): " MINT_CONTRACT_ADDRESS
read -r -p "MINT_FACTORY_ADDRESS (if MINT_MODE=factory): " MINT_FACTORY_ADDRESS

PUBLIC_BASE_URL=${PUBLIC_BASE_URL:-http://localhost:3000}
PORT=${PORT:-3000}
X402_NETWORK=${X402_NETWORK:-base-sepolia}
X402_PRICE_USD=${X402_PRICE_USD:-0.01}
MINT_MODE=${MINT_MODE:-create2}

# naive .env update (overwrite keys)
perl -0777 -i -pe "s/^NEYNAR_API_KEY=.*/NEYNAR_API_KEY=$NEYNAR_API_KEY/m; s/^PUBLIC_BASE_URL=.*/PUBLIC_BASE_URL=$PUBLIC_BASE_URL/m; s/^PORT=.*/PORT=$PORT/m; s/^X402_PAY_TO_ADDRESS=.*/X402_PAY_TO_ADDRESS=$X402_PAY_TO_ADDRESS/m; s/^X402_NETWORK=.*/X402_NETWORK=$X402_NETWORK/m; s/^X402_PRICE_USD=.*/X402_PRICE_USD=$X402_PRICE_USD/m" .env

# append / replace Venice + mint vars
perl -0777 -i -pe "s/^VENICE_API_KEY=.*/VENICE_API_KEY=$VENICE_API_KEY/m; s/^MINT_MODE=.*/MINT_MODE=$MINT_MODE/m; s/^MINT_CONTRACT_ADDRESS=.*/MINT_CONTRACT_ADDRESS=$MINT_CONTRACT_ADDRESS/m; s/^MINT_FACTORY_ADDRESS=.*/MINT_FACTORY_ADDRESS=$MINT_FACTORY_ADDRESS/m" .env

say "[4/6] Installing dependencies"
npm install

say "[5/6] Build"
npm run build

say "[6/6] Start dev server"
exec npm run dev
