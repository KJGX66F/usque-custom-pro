# Usque MASQUE Pro v6.26

[中文](./README.md) | **English**

> A visual browser tool for Cloudflare WARP / MASQUE: register, save, generate and convert configs entirely in the browser.
> Deploys to **Cloudflare Pages or Cloudflare Workers**. Generates the native Usque `config.json`, multi-node MASQUE configs, Clash / Mihomo smart routing, Shadowrocket, sing-box, a local VLESS bridge, and optional WARP egress detection.

YouTube tutorial: https://youtu.be/eRIjgiVHsbs

---

## Features

1. **One-click WARP / MASQUE registration** in the browser (WebCrypto key generation, nothing uploaded except the registration request relayed through your own deployment).
2. **The native `config.json` is the single source of truth** — register once, save the file, then re-generate any format at any time without registering again.
3. **Multi-node generation** from curated endpoint pools (QUIC / H3 by default, H2 / TCP fallback with an extended pool of up to 500 nodes), with per-node SNI, DNS, MTU and routing options.
4. **Clash / Mihomo smart routing** with service groups (AI, YouTube, Netflix, Telegram, …), url-test auto-selection, fallback and load-balance groups.
5. **Multiple output formats**: native Usque JSON, Clash / Mihomo YAML, Shadowrocket YAML, sing-box JSON (via a local Usque SOCKS bridge), and a local VLESS bridge for v2rayN on Windows.
6. **Free egress (landing) nodes**: built-in multi-source merge of public node sources (Au1rxx per-country + 4 community sources, plus up to 10 custom sources you add yourself), emitted as mihomo proxy-providers that refresh hourly.
7. **Hosted subscriptions with QR codes** (v6.21+): the panel stores the generated config in your own Cloudflare KV and gives you a link / QR code to import on your phone. Three lifetimes: 24 hours, 7 days, or permanent (v6.22+). Permanent links support in-place content update, rotation (old link dies instantly) and revocation — the link itself never changes when you update the content.
8. **Public-deployment protection** (v6.24+): set a `SUB_OWNER_KEY` environment variable and only the deployer can create or rotate permanent subscriptions (visitors can still create 24 h / 7 d ones); subscription writes are rate-limited per IP.
9. **Account library** (v6.25+): store multiple WARP accounts in the browser and switch between them in one click.
10. **Subscription management** (v6.25+): restore management of a permanent link on a new browser by pasting it; deployers can list every issued subscription (metadata only — tier, filename, expiry) and revoke them individually.
11. **One-click import** (v6.25+): per-client import buttons / deeplinks next to the QR code (Clash, Shadowrocket, sing-box, v2rayNG), shown only for formats that client can actually import.
12. **Remote endpoint pool** (v6.25+): the panel fetches `endpoints.json` from this repository at startup and uses it instead of the built-in pool; if the fetch fails it silently falls back to the built-in pool.
13. **Chained egress** (v6.25+): optionally send traffic WARP first, then out through your own secondary HTTP / SOCKS5 proxy (for example an Opera proxy you run yourself).
14. **Beginner wizard, demo mode, update notice, SNI rotation, redacted diagnostics export** (v6.26).

## Deploy

### Option A: Cloudflare Pages (recommended)

1. Fork this repository.
2. In Cloudflare: **Workers & Pages → Create → Pages → Connect to Git**, pick your fork, framework preset **None**, build output directory `pages`.
3. Deploy. Your panel is live at `https://<your-project>.pages.dev`.

### Option B: Cloudflare Workers

Use the `workers/` directory with Wrangler (`npx wrangler deploy`). See `workers/README-WORKERS.md`.

## Hosted subscriptions (one-time KV setup)

QR-code subscriptions need a KV namespace bound to your project:

1. Cloudflare console → **Storage & Databases → KV → Create namespace** (any name).
2. Your Pages project → **Settings → Bindings → Add → KV namespace**: variable name **must be `SUB_KV`**, select the namespace.
3. Redeploy. The subscription buttons in the panel now work.

Without the binding, the panel simply reports that hosting is not enabled; every other feature works as before.

**Security model:** the stored config contains your WARP private key, so a subscription link is a credential. Short-lived links expire on their own. Permanent links stay valid until you rotate or revoke them. Configs live in **your own** Cloudflare account's KV — if you open your deployment to the public, visitors' subscriptions also live (and consume quota) in your account, which is what `SUB_OWNER_KEY` protects against.

## Free egress sources

Built-in sources are public community projects (Au1rxx/free-vpn-subscriptions and others listed in the panel). Free nodes are short-lived and shared by many people — expect some to be dead or slow, and never use them for sensitive accounts. You can add your own sources in the panel （每行一个 URL) or turn the merge off entirely.

## Endpoint pool (`endpoints.json`)

The MASQUE entry endpoints the panel generates from live in the repository-root `endpoints.json`. To retire a dead endpoint or add a new one, edit that file and push — every panel picks it up on next load, no release needed. The panel shows which pool is active (remote / built-in) in the settings area.

## Safety & privacy

- Keys are generated locally in the browser; the native config is the only credential file and it never leaves your machine except inside subscriptions **you** create in **your own** KV.
- The diagnostics export (panel → 导出诊断信息） contains no private keys, tokens or subscription links and is safe to share when asking for help.
- The account library stores configs (including private keys) in your browser's local storage only. Don't use it on shared computers.

## Notes

- WARP is a free Cloudflare service; this tool does not bypass its rate limits. If registration returns 1015, wait and retry, or switch accounts in the account library.
- MASQUE nodes cannot be imported into v2rayN directly; use the local VLESS bridge on Windows (the panel generates a one-click BAT) or the sing-box format.
- Free for learning and personal use; see the repository for details.
