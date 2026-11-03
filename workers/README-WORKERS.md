# Usque MASQUE Pro v6.21 — Cloudflare Workers 版

## 目录

```text
workers/
├─ package.json
├─ wrangler.jsonc
├─ deploy-windows.bat
├─ deploy-linux-macos.sh
├─ src/
│  └─ worker.js
└─ public/
   ├─ index.html
   ├─ style.css
   ├─ app.js
   ├─ usque-register.js
   ├─ warp-egress-selector.py
   └─ _headers
```

## 为什么这样改

Cloudflare 当前推荐使用 **Workers Static Assets** 来部署带前端静态文件的 Worker 应用。

`wrangler.jsonc`：

```jsonc
{
  "name": "usque-masque-pro-v67",
  "main": "./src/worker.js",
  "compatibility_date": "2026-09-03",
  "workers_dev": true,
  "assets": {
    "directory": "./public",
    "binding": "ASSETS",
    "run_worker_first": ["/api/*"]
  }
}
```

含义：

```text
/
index.html
style.css
app.js
...
      ↓
Workers Static Assets

/api/*
      ↓
src/worker.js
```

因此首页不会因为注册 API 上游异常而一起挂掉。

## Windows 最简单部署

解压后进入 `workers` 文件夹，双击：

```text
deploy-windows.bat
```

需要电脑已经安装 Node.js。

脚本会：

```text
npm install
npx wrangler login
npx wrangler deploy
```

## 手动部署

```bash
npm install
npx wrangler login
npx wrangler deploy
```

部署完成后 Wrangler 会显示类似：

```text
https://usque-masque-pro-v67.<你的子域>.workers.dev
```

测试首页：

```text
https://你的地址.workers.dev/
```

测试 API：

```text
https://你的地址.workers.dev/api/health
```

正常返回：

```json
{
  "ok": true,
  "service": "usque-register-relay",
  "worker": "running"
}
```

## 本地预览

```bash
npm install
npx wrangler dev
```

然后打开 Wrangler 给出的 localhost 地址。

## 自定义 Worker 名称

修改：

```text
wrangler.jsonc
```

里面：

```json
"name": "usque-masque-pro-v67"
```

名称只能使用 Cloudflare Worker 支持的项目命名格式。

## 扫码订阅的 KV 绑定（可选，v6.21）

面板「扫码获取订阅」需要一个 KV 命名空间临时存放生成的配置（24 小时自动过期）：

```text
npx wrangler kv namespace create SUB_KV
```

把得到的 id 填进 `wrangler.jsonc` 的 `kv_namespaces`（文件里已备好注释模板），或在 Cloudflare 控制台给 Worker 绑定变量名 `SUB_KV`，然后重新部署。不绑定的话扫码按钮会提示未启用，其它功能不受影响。

## 安全

- Worker API 只代理固定的 WARP 注册 / enroll 路径，以及同源的订阅托管路径（`/api/sub`、`/sub/:token`）。
- 页面请求要求 same-origin。
- 注册意图需要 `X-Usque-Intent: single-register`。
- 请求体大小有限制。
- 静态文件 `_headers` 继续生效。
- 不使用 KV / D1 / R2 保存 Usque 私钥；唯一例外是用户主动点「扫码获取订阅」时，把生成好的配置临时存入自己绑定的 KV，24 小时自动过期。
