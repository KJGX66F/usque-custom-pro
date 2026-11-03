const API_ORIGIN = "https://api.cloudflareclient.com";
const API_VERSION = "v0a4471";

const CF_HEADERS = {
  "User-Agent": "WARP for Android",
  "CF-Client-Version": "a-6.35-4471",
  "Content-Type": "application/json; charset=UTF-8",
  "Accept": "application/json"
};

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...extra
    }
  });
}

function allowedSameOrigin(request) {
  const target = new URL(request.url);
  const origin = request.headers.get("Origin");

  if (origin) {
    try {
      if (new URL(origin).origin !== target.origin) return false;
    } catch {
      return false;
    }
  }

  const site = request.headers.get("Sec-Fetch-Site");
  if (site && site !== "same-origin" && site !== "none") return false;
  return true;
}

async function readSmallJson(request) {
  const type = request.headers.get("Content-Type") || "";
  if (!type.toLowerCase().includes("application/json")) {
    throw new Error("Content-Type 必须为 application/json");
  }

  const text = await request.text();
  if (text.length > 16384) throw new Error("请求体过大");

  try {
    return JSON.parse(text || "{}");
  } catch {
    throw new Error("JSON 格式无效");
  }
}

function validB64(s, max = 4096) {
  return typeof s === "string" &&
    s.length > 0 &&
    s.length <= max &&
    /^[A-Za-z0-9+/]+={0,2}$/.test(s);
}

async function upstreamJson(url, init) {
  let res;
  try {
    res = await fetch(url, init);
  } catch (e) {
    return json({
      message: "无法连接 Cloudflare WARP 上游 API",
      detail: String(e?.message || e)
    }, 502);
  }

  const body = await res.text();
  const retryAfterHeader = res.headers.get("Retry-After");
  const retryAfter = Math.max(
    0,
    Number.parseInt(retryAfterHeader || "0", 10) || 0
  );

  // Cloudflare's 1015 page may be HTML/plain text rather than JSON.
  const is1015 =
    res.status === 429 ||
    /\b1015\b/i.test(body) ||
    /rate\s*limit/i.test(body);

  if (is1015) {
    const wait = retryAfter || 30;
    return json({
      error: "rate_limited",
      code: 1015,
      retry_after: wait,
      message: `Cloudflare WARP 注册接口触发限流，请等待 ${wait} 秒后再试。不要连续点击注册。`
    }, 429, {
      "Retry-After": String(wait)
    });
  }

  const headers = {
    "Content-Type": res.headers.get("Content-Type") || "application/json; charset=UTF-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  };
  if (retryAfterHeader) headers["Retry-After"] = retryAfterHeader;

  return new Response(body, {
    status: res.status,
    headers
  });
}
async function relayRegister(request) {
  if (!allowedSameOrigin(request)) {
    return json({ message: "跨站请求已拒绝" }, 403);
  }

  if (request.headers.get("X-Usque-Intent") !== "single-register") {
    return json({ message: "缺少注册意图标记" }, 400);
  }

  let b;
  try {
    b = await readSmallJson(request);
  } catch (e) {
    return json({ message: e.message }, 400);
  }

  if (!validB64(b.key, 256)) {
    return json({ message: "key 无效" }, 400);
  }

  if (!/^[0-9a-f]{16}$/i.test(String(b.serial_number || ""))) {
    return json({ message: "serial_number 无效" }, 400);
  }

  if (typeof b.tos !== "string" || b.tos.length < 20 || b.tos.length > 64) {
    return json({ message: "tos 时间无效" }, 400);
  }

  const payload = {
    key: b.key,
    install_id: "",
    fcm_token: "",
    tos: b.tos,
    model: "PC",
    serial_number: b.serial_number,
    os_version: "",
    key_type: "curve25519",
    tunnel_type: "wireguard",
    locale: "en_US"
  };

  return upstreamJson(`${API_ORIGIN}/${API_VERSION}/reg`, {
    method: "POST",
    headers: CF_HEADERS,
    body: JSON.stringify(payload),
    redirect: "manual"
  });
}

async function relayEnroll(request) {
  if (!allowedSameOrigin(request)) {
    return json({ message: "跨站请求已拒绝" }, 403);
  }

  if (request.headers.get("X-Usque-Intent") !== "single-register") {
    return json({ message: "缺少注册意图标记" }, 400);
  }

  let b;
  try {
    b = await readSmallJson(request);
  } catch (e) {
    return json({ message: e.message }, 400);
  }

  const id = String(b.id || "");
  const token = String(b.token || "");
  const publicKey = String(b.public_key || "");
  const name = String(b.name || "Web-Usque").slice(0, 64);

  if (!/^[A-Za-z0-9._:-]{4,256}$/.test(id)) {
    return json({ message: "device id 无效" }, 400);
  }

  if (token.length < 8 || token.length > 4096 || /[\r\n]/.test(token)) {
    return json({ message: "token 无效" }, 400);
  }

  if (!validB64(publicKey, 4096)) {
    return json({ message: "P-256 public_key 无效" }, 400);
  }

  const payload = {
    key: publicKey,
    key_type: "secp256r1",
    tunnel_type: "masque",
    name
  };

  return upstreamJson(
    `${API_ORIGIN}/${API_VERSION}/reg/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        ...CF_HEADERS,
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(payload),
      redirect: "manual"
    }
  );
}

// ---------- Hosted subscription (QR-code import) ----------
// POST /api/sub {format, content, tier} stores the generated config in KV
// (binding name: SUB_KV) under an unguessable token and returns a fetchable
// URL. tier: "24h" (default) / "7d" expire by TTL; "perm" never expires and
// supports in-place update (/api/sub/update), rotation (/api/sub/rotate,
// old link dies immediately) and revocation (/api/sub/revoke).
// GET /sub/<token> serves it to proxy clients. The stored config contains
// the user's WARP private key, so the token URL is a credential: never
// log it, never list keys.
const SUB_TIERS = { "24h": 86400, "7d": 604800, "perm": 0 };
const SUB_FORMATS = {
  native: { type: "application/json; charset=UTF-8", filename: "usque-config.json" },
  clash: { type: "text/yaml; charset=UTF-8", filename: "masque-clash-smart.yaml" },
  shadowrocket: { type: "text/yaml; charset=UTF-8", filename: "masque-shadowrocket.yaml" },
  singbox: { type: "application/json; charset=UTF-8", filename: "sing-box-usque.json" },
  vless: { type: "text/plain; charset=UTF-8", filename: "usque-vless-local.txt" }
};

function subToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function createSubscription(request, env) {
  if (!env?.SUB_KV) {
    return json({ message: "订阅托管未启用：请先在 Cloudflare 给本项目绑定 KV 命名空间，变量名必须为 SUB_KV（步骤见 README「扫码获取订阅」）。" }, 503);
  }
  if (!allowedSameOrigin(request)) return json({ message: "Origin 不被允许" }, 403);
  const type = request.headers.get("Content-Type") || "";
  if (!type.toLowerCase().includes("application/json")) return json({ message: "Content-Type 必须为 application/json" }, 400);
  const text = await request.text();
  if (text.length > 262144) return json({ message: "配置内容过大" }, 413);
  let body;
  try { body = JSON.parse(text || "{}"); } catch { return json({ message: "JSON 格式无效" }, 400); }
  const meta = SUB_FORMATS[body.format];
  const content = typeof body.content === "string" ? body.content : "";
  if (!meta || !content || content.length > 200000) return json({ message: "format 或 content 无效" }, 400);
  const tier = body.tier === undefined ? "24h" : body.tier;
  if (!(tier in SUB_TIERS)) return json({ message: "tier 无效（可选 24h / 7d / perm）" }, 400);
  const ttl = SUB_TIERS[tier];
  const token = subToken();
  const putOptions = { metadata: { type: meta.type, filename: meta.filename, tier } };
  if (ttl > 0) putOptions.expirationTtl = ttl;
  await env.SUB_KV.put(`sub:${token}`, content, putOptions);
  const origin = new URL(request.url).origin;
  return json({ ok: true, url: `${origin}/sub/${token}`, token, tier, expiresInSeconds: ttl > 0 ? ttl : null });
}

function subKvMissing(env) {
  return !env?.SUB_KV
    ? json({ message: "订阅托管未启用：请先在 Cloudflare 给本项目绑定 KV 命名空间，变量名必须为 SUB_KV（步骤见 README「扫码获取订阅」）。" }, 503)
    : null;
}

async function readSubJson(request) {
  const type = request.headers.get("Content-Type") || "";
  if (!type.toLowerCase().includes("application/json")) return { error: json({ message: "Content-Type 必须为 application/json" }, 400) };
  const text = await request.text();
  if (text.length > 262144) return { error: json({ message: "请求内容过大" }, 413) };
  try { return { body: JSON.parse(text || "{}") }; } catch { return { error: json({ message: "JSON 格式无效" }, 400) }; }
}

async function loadPermSubscription(env, token) {
  if (!/^[a-f0-9]{48}$/.test(token || "")) return { error: json({ message: "token 无效" }, 400) };
  const got = await env.SUB_KV.getWithMetadata(`sub:${token}`);
  if (!got || !got.value) return { error: json({ message: "订阅不存在或已过期，请重新生成。" }, 404) };
  if ((got.metadata || {}).tier !== "perm") return { error: json({ message: "只有常驻订阅支持此操作。" }, 400) };
  return { got };
}

async function updateSubscription(request, env) {
  const missing = subKvMissing(env); if (missing) return missing;
  if (!allowedSameOrigin(request)) return json({ message: "Origin 不被允许" }, 403);
  const parsed = await readSubJson(request); if (parsed.error) return parsed.error;
  const loaded = await loadPermSubscription(env, parsed.body.token); if (loaded.error) return loaded.error;
  const meta = SUB_FORMATS[parsed.body.format];
  const content = typeof parsed.body.content === "string" ? parsed.body.content : "";
  if (!meta || !content || content.length > 200000) return json({ message: "format 或 content 无效" }, 400);
  await env.SUB_KV.put(`sub:${parsed.body.token}`, content, {
    metadata: { type: meta.type, filename: meta.filename, tier: "perm" }
  });
  return json({ ok: true });
}

async function rotateSubscription(request, env) {
  const missing = subKvMissing(env); if (missing) return missing;
  if (!allowedSameOrigin(request)) return json({ message: "Origin 不被允许" }, 403);
  const parsed = await readSubJson(request); if (parsed.error) return parsed.error;
  const loaded = await loadPermSubscription(env, parsed.body.token); if (loaded.error) return loaded.error;
  const token = subToken();
  await env.SUB_KV.put(`sub:${token}`, loaded.got.value, { metadata: loaded.got.metadata });
  await env.SUB_KV.delete(`sub:${parsed.body.token}`);
  const origin = new URL(request.url).origin;
  return json({ ok: true, url: `${origin}/sub/${token}`, token, tier: "perm", expiresInSeconds: null });
}

async function revokeSubscription(request, env) {
  const missing = subKvMissing(env); if (missing) return missing;
  if (!allowedSameOrigin(request)) return json({ message: "Origin 不被允许" }, 403);
  const parsed = await readSubJson(request); if (parsed.error) return parsed.error;
  const token = parsed.body.token;
  if (!/^[a-f0-9]{48}$/.test(token || "")) return json({ message: "token 无效" }, 400);
  await env.SUB_KV.delete(`sub:${token}`);
  return json({ ok: true });
}

async function serveSubscription(request, env, token) {
  if (!env?.SUB_KV) return new Response("Subscription hosting is not enabled.", { status: 503 });
  if (!/^[a-f0-9]{48}$/.test(token)) return new Response("Not Found", { status: 404 });
  const got = await env.SUB_KV.getWithMetadata(`sub:${token}`);
  if (!got || !got.value) return new Response("Subscription not found or expired.", { status: 404 });
  const meta = got.metadata || {};
  const headers = {
    "Content-Type": meta.type || "text/plain; charset=UTF-8",
    "Content-Disposition": `inline; filename="${meta.filename || "subscription.txt"}"`,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  };
  if (meta.tier === "perm") headers["profile-update-interval"] = "24";
  return new Response(got.value, { status: 200, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Quick deployment test:
    // https://YOUR-PROJECT.pages.dev/api/health
    if (url.pathname === "/api/health") {
      return json({
        ok: true,
        service: "usque-register-relay",
        worker: "running"
      });
    }

    if (url.pathname === "/api/warp/register") {
      if (request.method !== "POST") {
        return json({ message: "Method Not Allowed" }, 405, { "Allow": "POST" });
      }
      return relayRegister(request);
    }

    if (url.pathname === "/api/warp/enroll") {
      if (request.method !== "POST") {
        return json({ message: "Method Not Allowed" }, 405, { "Allow": "POST" });
      }
      return relayEnroll(request);
    }

    if (url.pathname === "/api/sub") {
      if (request.method !== "POST") {
        return json({ message: "Method Not Allowed" }, 405, { "Allow": "POST" });
      }
      return createSubscription(request, env);
    }

    if (url.pathname === "/api/sub/update" || url.pathname === "/api/sub/rotate" || url.pathname === "/api/sub/revoke") {
      if (request.method !== "POST") {
        return json({ message: "Method Not Allowed" }, 405, { "Allow": "POST" });
      }
      if (url.pathname.endsWith("update")) return updateSubscription(request, env);
      if (url.pathname.endsWith("rotate")) return rotateSubscription(request, env);
      return revokeSubscription(request, env);
    }

    if (url.pathname.startsWith("/sub/")) {
      if (request.method !== "GET") {
        return json({ message: "Method Not Allowed" }, 405, { "Allow": "GET" });
      }
      return serveSubscription(request, env, url.pathname.slice(5));
    }

    return json({ message: "API Not Found" }, 404);
  }
};