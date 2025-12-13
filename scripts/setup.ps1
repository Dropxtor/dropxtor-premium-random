Param(
  [switch]$NoInstall
)

$ErrorActionPreference = "Stop"

Write-Host "[1/6] Checking prerequisites"
node -v | Out-Host
npm -v | Out-Host

Write-Host "[2/6] Creating .env if missing"
if (!(Test-Path .env)) {
  Copy-Item .env.example .env
  Write-Host "Created .env from .env.example"
}

Write-Host "[3/6] Configure env vars"
$neynar = Read-Host "NEYNAR_API_KEY (required)"
$venice = Read-Host "VENICE_API_KEY (required for mint image)"
$baseUrl = Read-Host "PUBLIC_BASE_URL [http://localhost:3000]"
$port = Read-Host "PORT [3000]"
$payTo = Read-Host "X402_PAY_TO_ADDRESS (EVM address to receive funds)"
$network = Read-Host "X402_NETWORK [base-sepolia]"
$price = Read-Host "X402_PRICE_USD [0.01]"
$mintMode = Read-Host "MINT_MODE [create2|contract|factory] (default: create2)"
$mintContract = Read-Host "MINT_CONTRACT_ADDRESS (if MINT_MODE=contract)"
$mintFactory = Read-Host "MINT_FACTORY_ADDRESS (if MINT_MODE=factory)"

if ([string]::IsNullOrWhiteSpace($baseUrl)) { $baseUrl = "http://localhost:3000" }
if ([string]::IsNullOrWhiteSpace($port)) { $port = "3000" }
if ([string]::IsNullOrWhiteSpace($network)) { $network = "base-sepolia" }
if ([string]::IsNullOrWhiteSpace($price)) { $price = "0.01" }
if ([string]::IsNullOrWhiteSpace($mintMode)) { $mintMode = "create2" }

# Rewrite relevant keys in .env (simple line-based approach)
$lines = Get-Content .env
$set = @{
  "NEYNAR_API_KEY" = $neynar
  "VENICE_API_KEY" = $venice
  "PUBLIC_BASE_URL" = $baseUrl
  "PORT" = $port
  "X402_PAY_TO_ADDRESS" = $payTo
  "X402_NETWORK" = $network
  "X402_PRICE_USD" = $price
  "MINT_MODE" = $mintMode
  "MINT_CONTRACT_ADDRESS" = $mintContract
  "MINT_FACTORY_ADDRESS" = $mintFactory
}

$newLines = foreach ($line in $lines) {
  $m = [regex]::Match($line, "^([A-Z0-9_]+)=")
  if ($m.Success) {
    $k = $m.Groups[1].Value
    if ($set.ContainsKey($k)) {
      "$k=$($set[$k])"
      continue
    }
  }
  $line
}
Set-Content -Path .env -Value $newLines -Encoding UTF8

Write-Host "[4/6] Installing dependencies"
if (-not $NoInstall) {
  npm install
}

Write-Host "[5/6] Build"
npm run build

Write-Host "[6/6] Start dev server"
npm run dev
