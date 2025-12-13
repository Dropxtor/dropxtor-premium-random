# farcaster-random-frame-agent

Squelette **TypeScript (Express)** pour:

- **Farcaster Frame** (vNext) qui affiche un visuel "random" et génère un nouvel état à chaque interaction.
- **Validation des frame actions** via **Neynar Node.js SDK**.
- **Miniapp** (simple page) qui sert de point d’entrée pour la partie monétisée.
- **Endpoint paywalled via x402** (HTTP 402) sur `/api/premium-random`.
- Exemple de **registration file ERC-8004**: `erc8004/agent-registration.json`.

## Prérequis

- Node.js (version moderne)
- npm / pnpm
- Une clé **Neynar** (obligatoire pour valider les actions)
- Pour les paiements x402 en prod: une adresse receveuse + config facilitateur/CDP selon ton setup.

## Démarrage rapide

1) Copie l’env:

```bash
cp .env.example .env
```

2) Remplis au minimum:

- `NEYNAR_API_KEY`
- `X402_PAY_TO_ADDRESS`

3) Installe & lance:

```bash
npm install
npm run dev
```

- Frame: `http://localhost:3000/frames`
- Image: `http://localhost:3000/frames/image`
- Miniapp: `http://localhost:3000/miniapp`
- API paywalled: `http://localhost:3000/api/premium-random`

## Notes sur Frames / MiniApps / x402

- Les **Frames** sont basées sur des meta tags `fc:frame:*` (vNext). Voir la spec Farcaster.
- Les clients Frames ne gèrent pas nativement le flux x402; le pattern recommandé est de router vers une **MiniApp** (ou web app) qui peut exécuter le flow 402.
- x402 v2 est annoncé comme backward-compatible avec v1.

## ERC-8004

- L’EIP-8004 définit une `registration file` référencée via le `tokenURI` d’un ERC-721 (identity registry). Le fichier `erc8004/agent-registration.json` est un exemple à adapter.
