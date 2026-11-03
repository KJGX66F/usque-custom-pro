# Usque MASQUE Pro v6.19 — 免费落地自定义源 + 多源合并

> 基于 Cloudflare WARP / MASQUE 的可视化注册、配置生成与多客户端转换工具。  
> 支持 **Cloudflare Pages + Cloudflare Workers 双部署**，浏览器完成 Usque 注册、原生配置保存、MASQUE 多节点生成、Clash/Mihomo 智能分流、Shadowrocket、sing-box、本地 VLESS 桥接，以及可选的 WARP 出口检测。
>
> # YouTube视频教程 [点击查看](https://youtu.be/eRIjgiVHsbs)
> # v6.17 视频教程 [点击查看](https://youtu.be/GREPEjjRQwc)
---

## 目录

- [项目介绍](#项目介绍)
- [核心功能](#核心功能)
- [项目原理](#项目原理)
- [目录结构](#目录结构)
- [部署方式一：Cloudflare Pages（推荐）](#部署方式一cloudflare-pages推荐)
- [部署方式二：Cloudflare Workers](#部署方式二cloudflare-workers)
- [首次使用教程](#首次使用教程)
- [Clash / Mihomo 使用教程](#clash--mihomo-使用教程)
- [ChatGPT / OpenAI 简单模式](#chatgpt--openai-简单模式)
- [节点数量与 H2 扩展池](#节点数量与-h2-扩展池)
- [其它输出格式](#其它输出格式)
- [WARP 出口国家检测（高级）](#warp-出口国家检测高级)
- [升级项目](#升级项目)
- [常见问题](#常见问题)
- [安全与隐私](#安全与隐私)
- [重要说明](#重要说明)

---

# 项目介绍

**Usque MASQUE Pro v6.7** 是一个面向 Cloudflare WARP / MASQUE 的浏览器可视化工具。

它解决的主要问题是：

```text
手动注册 WARP / MASQUE
        ↓
配置字段复杂
        ↓
不同客户端格式不一致
        ↓
需要手工写 Clash / sing-box / VLESS 配置
```

本项目把整个流程整理成：

```text
打开网页
  ↓
一键注册 Usque / WARP MASQUE
  ↓
自动下载原生 config.json
  ↓
按需要设置 Endpoint / Port / SNI / DNS / 节点数量
  ↓
一键生成客户端配置
  ↓
Clash / Mihomo / Shadowrocket / sing-box / VLESS 本地桥接
```

项目重点面向：

- 第一次接触 Usque / MASQUE 的用户
- 不想手工编辑大量 YAML / JSON 的用户
- 需要批量生成 MASQUE 候选节点的用户
- 需要 Clash / Mihomo 智能分流的用户
- 想把原生 Usque 配置长期保存、以后重复使用的用户

---

# 核心功能

## 1. 一键注册 Usque / WARP MASQUE

浏览器中完成：

- WARP 设备注册
- P-256 MASQUE 密钥生成
- MASQUE 公钥 enroll
- 自动整理原生 Usque `config.json`

注册成功后可以立即下载：

```text
usque-config.json
```

以后只需要重新导入这个文件，不必每次重新注册。

---

## 2. 原生配置作为唯一源文件

项目不会要求你每次重新创建账户。

推荐流程：

```text
第一次：注册 → 保存 config.json
以后：导入 config.json → 修改参数 → 重新生成
```

原生配置通常包含：

```text
private_key
endpoint_v4
endpoint_v6
endpoint_h2_v4
endpoint_h2_v6
endpoint_pub_key
license
id
access_token
ipv4
ipv6
```

> `config.json` 包含私钥与设备凭据，请勿上传到 GitHub、网盘、公开群组或公开网页。

---

## 3. 多节点生成

支持：

```text
13 节点
32 节点
64 节点
100 节点
自定义 1～500 节点
```

生成方式包括：

- 精选 Endpoint + Port
- Endpoint × Port 组合
- 均衡分布
- 全排列
- 稳定打散
- 自动去重
- 自定义附加 Endpoint

---

## 4. QUIC / H3 与 H2

支持：

```text
QUIC / H3
H2 / TCP
```

H2 模式提供扩展地址池，适合生成大量候选节点进行测速筛选。

> 节点数量多不代表每个节点都一定可用。不同网络、地区、运营商对不同入口和端口的可达性会不同。

---

## 5. Clash / Mihomo 智能分流

自动生成：

- MASQUE 节点
- 自动测速 `url-test`
- PROXY 策略组
- AI
- YouTube
- Emby
- TikTok
- Netflix
- Disney+
- Spotify
- GitHub
- Telegram
- Google
- Twitter / X
- Instagram
- Facebook
- Apple
- Microsoft
- Steam
- Xbox
- PlayStation
- Nintendo
- Bilibili
- 国外网站
- 漏网之鱼

并使用 MetaCubeX MRS 规则集进行智能分流。

---

## 6. ChatGPT / OpenAI 简单模式

v6.7 默认推荐：

```text
ChatGPT / OpenAI → DIRECT
其它国外流量     → WARP / MASQUE
```

目的是避免某些共享 WARP 出口被 ChatGPT 拒绝时，整个代理配置都不可用。

网页中可以切换：

```text
DIRECT 直连
WARP · AI 自动选择
WARP · 地区优选
WARP · PROXY
AI 策略组
```

---

## 7. 多格式输出

当前支持：

```text
原生 Usque config.json
Clash / Mihomo
Shadowrocket
sing-box
VLESS 本地桥接
```

---

## 8. WARP 出口检测

高级功能可以通过本机 Mihomo API：

- 逐节点切换 MASQUE 节点
- 检测实际出口 IP
- 检测国家 / 地区 / 城市
- 检测 Cloudflare PoP
- 测试延迟
- 测试 ChatGPT HTTP 可达性
- 输出 JSON / CSV 报告
- 根据国家偏好自动选择候选节点

这个功能默认折叠，新手可以完全不使用。

---

## 9. 免费落地多源合并（v6.18 新增）

免费落地节点默认多源合并拉取：

```
主源 Au1rxx/free-vpn-subscriptions（按国家 Clash YAML）
        +
ermaozi / cbusifabcap / LeilaoMi真测 / ALIILAPRO（公共链接源）
        ↓
mihomo proxy-provider 分别拉取（每小时自动更新）
        ↓
同一批 url-test 组一起测活竞速，哪个快用哪个
```

- 多源合并可在面板里关闭，关掉后只用主源 Au1rxx
- v6.19 起支持自定义源：面板「自定义节点源」每行填一个订阅地址（最多 10 个），与内置源一起拉取测速；只填自定义源、不勾国家也可单独使用，想换掉内置源时关掉多源合并并取消国家勾选、只留自定义源即可
- 4 个公共源不分国家，只进「免费落地自动 / AI / 流媒体」总组，不进国家组
- 稳定模式的协议排除（Hysteria2 / TUIC / WireGuard / HTTP / SOCKS）对所有源一致生效
- 不同源之间可能有个别重复节点，测速会自动选最快的一个，不影响使用

---

# 项目原理

## 整体架构

### Cloudflare Pages 版

```text
浏览器
  │
  ├─ index.html / app.js / usque-register.js
  │
  ├─ 浏览器本地生成 P-256 私钥
  │
  └─ POST /api/warp/*
          ↓
      Pages _worker.js
          ↓
 Cloudflare WARP 注册 API
```

Pages 中：

```text
静态页面 → Pages 直接提供
/api/*   → _worker.js
```

由 `_routes.json` 控制：

```json
{
  "version": 1,
  "include": ["/api/*"],
  "exclude": []
}
```

这样静态页面不会经过 API Worker。

---

### Cloudflare Workers 版

```text
浏览器
   ↓
Workers Static Assets
   ├─ public/index.html
   ├─ public/app.js
   └─ public/style.css

/api/*
   ↓
src/worker.js
   ↓
Cloudflare WARP 注册 API
```

Workers 版通过：

```text
wrangler.jsonc
```

配置：

```jsonc
"assets": {
  "directory": "./public",
  "binding": "ASSETS",
  "run_worker_first": ["/api/*"]
}
```

因此：

```text
普通静态资源 → Static Assets
/api/*       → Worker
```

---

## 注册原理

### 第一步：创建设备

浏览器生成注册所需随机信息，并请求：

```text
/api/warp/register
```

Worker 只把固定格式请求转发到 Cloudflare WARP 注册接口。

---

### 第二步：浏览器生成 P-256 MASQUE 密钥

MASQUE 私钥使用浏览器 WebCrypto：

```text
ECDSA
P-256 / secp256r1
```

生成。

项目会把私钥转换成 Usque 所需的 SEC1 DER Base64 格式。

关键点：

```text
P-256 私钥在浏览器本地生成
```

Worker enroll 时只需要 MASQUE 公钥。

---

### 第三步：Enroll MASQUE

浏览器请求：

```text
/api/warp/enroll
```

Worker 将 P-256 公钥提交给 WARP API，并获取：

```text
MASQUE endpoint
endpoint public key
interface IPv4 / IPv6
设备信息
```

随后浏览器把这些信息与本地私钥组合成：

```text
usque-config.json
```

---

## MASQUE 多节点原理

这里生成的 13 / 32 / 64 / 100 / 500 个节点，并不是注册 500 个账户。

核心逻辑是：

```text
同一套 Usque / WARP 凭据
          +
不同 Endpoint
          +
不同 Port
          ↓
多个 MASQUE 候选连接
```

例如：

```text
Endpoint A : 443
Endpoint A : 500
Endpoint A : 4500
Endpoint B : 443
Endpoint B : 500
...
```

因此：

- 节点数量 ≠ WARP 账号数量
- 节点数量 ≠ 独立出口数量
- 节点数量 ≠ 每个节点都有独立流量额度

大量候选主要用于：

```text
测速
自动选择
寻找当前网络更稳定的入口组合
```

---

## WARP 入口与出口不是一回事

这是本项目最容易误解的地方。

```text
MASQUE Endpoint
      ↓
Cloudflare 入口
      ↓
Cloudflare 网络
      ↓
WARP 出口 IP
```

修改：

```text
Endpoint
Port
SNI
```

主要改变的是 **如何进入 Cloudflare 网络**，并不能保证把最终 WARP 出口强制切换成美国、日本、新加坡等国家。

因此项目中的“出口国家优选”是：

```text
检测现有节点的真实出口
        ↓
从已经出现的出口中选择更符合偏好的节点
```

不是：

```text
强制 Cloudflare 生成指定国家出口
```

---

# 目录结构

v6.7 双部署版：

```text
usque-custom-pro-v67-dual/
│
├─ README.md
│
├─ pages/
│  ├─ index.html
│  ├─ app.js
│  ├─ style.css
│  ├─ usque-register.js
│  ├─ _worker.js
│  ├─ _routes.json
│  ├─ _headers
│  └─ warp-egress-selector.py
│
└─ workers/
   ├─ package.json
   ├─ wrangler.jsonc
   ├─ deploy-windows.bat
   ├─ deploy-linux-macos.sh
   ├─ src/
   │  └─ worker.js
   └─ public/
      ├─ index.html
      ├─ app.js
      ├─ style.css
      ├─ usque-register.js
      ├─ _headers
      └─ warp-egress-selector.py
```

---

# 部署方式一：Cloudflare Pages（推荐）

如果你是第一次使用，推荐 Pages。

## 方法 A：GitHub + Cloudflare Pages

这是最推荐的部署方式，因为以后更新代码只需要 Git Push。

### 第 1 步：上传项目到 GitHub

GitHub 仓库建议保持：

```text
usque-custom-pro/
├─ README.md
├─ pages/
└─ workers/
```

如果使用 GitHub Desktop：

```text
1. Add Local Repository
2. 选择项目仓库目录
3. Commit to main
4. Publish repository / Push origin
```

上传完成后 GitHub 首页应该能看到：

```text
pages/
workers/
README.md
```

---

### 第 2 步：Cloudflare 创建 Pages

进入 Cloudflare：

```text
Workers & Pages
→ Create application
→ Pages
→ Connect to Git
```

选择你的 GitHub 仓库。

建议配置：

```text
Production branch:
main

Framework preset:
None

Root directory:
pages

Build command:
留空

Build output directory:
.
```

> Cloudflare 控制台不同版本的字段名称可能略有变化。核心原则是：**项目根目录必须指向 `pages/`，最终发布目录必须让 `index.html` 与 `_worker.js` 位于发布根目录。**

然后点击：

```text
Save and Deploy
```

---

### 第 3 步：测试 Pages API

部署完成后会获得：

```text
https://你的项目.pages.dev
```

先测试首页。

然后打开：

```text
https://你的项目.pages.dev/api/health
```

正常应返回：

```json
{
  "ok": true,
  "service": "usque-register-relay",
  "worker": "running"
}
```

如果 `/api/health` 正常，说明：

```text
静态页面 ✅
_worker.js ✅
_routes.json ✅
API 路由 ✅
```

---

## 方法 B：Pages 直接上传

如果不想连接 GitHub，可以使用 Pages 直接上传。

只上传 `pages/` 目录中的内容。

最终发布根目录必须直接看到：

```text
index.html
app.js
style.css
usque-register.js
_worker.js
_routes.json
_headers
warp-egress-selector.py
```

不要上传成：

```text
/pages/index.html
```

否则首页路径会错误。

---

# 部署方式二：Cloudflare Workers

v6.7 同时提供完整 Workers Static Assets 版本。

进入：

```text
workers/
```

---

## Windows 一键部署

### 第 1 步：安装 Node.js

电脑需要安装 Node.js LTS。

安装完成后重新打开终端或资源管理器。

### 第 2 步：运行部署脚本

双击：

```text
deploy-windows.bat
```

脚本会依次运行：

```bash
npm install
npx wrangler login
npx wrangler deploy
```

第一次会打开浏览器要求授权 Cloudflare。

部署完成后 Wrangler 会显示类似：

```text
https://usque-masque-pro-v67.xxxxx.workers.dev
```

---

## Linux / macOS

进入 `workers/`：

```bash
chmod +x deploy-linux-macos.sh
./deploy-linux-macos.sh
```

或者手动：

```bash
npm install
npx wrangler login
npx wrangler deploy
```

---

## Workers 本地预览

```bash
npm install
npx wrangler dev
```

然后打开 Wrangler 输出的本地地址。

---

## Workers 部署后测试

首页：

```text
https://你的项目.workers.dev/
```

API：

```text
https://你的项目.workers.dev/api/health
```

正常返回：

```json
{
  "ok": true,
  "service": "usque-register-relay",
  "worker": "running"
}
```

---

# 首次使用教程

## 第 1 步：打开项目网页

访问：

```text
https://你的项目.pages.dev
```

或：

```text
https://你的项目.workers.dev
```

---

## 第 2 步：一键注册

点击网页上的 Usque / WARP 注册按钮。

注册过程通常包括：

```text
1. 创建 WARP 设备
2. 浏览器生成 P-256 MASQUE 密钥
3. Enroll MASQUE 公钥
4. 生成原生 config.json
```

注册成功后建议第一时间下载：

```text
usque-config.json
```

这是以后重复使用的核心文件。

---

## 第 3 步：妥善保存 config.json

建议保存在：

```text
本机私人文件夹
加密备份
私人云盘
```

不要上传到：

```text
GitHub 公共仓库
公开网盘链接
Telegram / Discord 公共频道
论坛
视频简介
```

因为里面包含：

```text
private_key
access_token
设备 id
WARP 账户相关凭据
```

---

## 第 4 步：以后直接导入

以后再打开网页，不需要重新注册。

直接：

```text
导入 config.json
→ 修改设置
→ 应用设置并重新生成
```

即可。

---

# Clash / Mihomo 使用教程

这是本项目最推荐的使用方式。

## 推荐新手设置

第一次建议：

```text
节点数量：13 或 32
网络 / 传输：QUIC / H3
Endpoint：IPv4 + IPv6 自动选择
Port：推荐端口
SNI：www.microsoft.com
DNS：Cloudflare + Google IPv4 + IPv6
MTU：1280
规则模式：完整智能分流
自动测速：开启
策略组图标：开启
节点自动去重：开启
```

然后点击：

```text
应用设置并重新生成
```

---

## 生成 Clash 配置

顶部选择：

```text
Clash / Mihomo
```

下载 YAML。

---

## 导入 Clash Verge Rev

Clash Verge Rev 中：

```text
订阅 / 配置
→ 导入本地配置
→ 选择生成的 YAML
→ 启用配置
```

然后进入：

```text
代理
```

应该可以看到：

```text
地区优选
自动选择
AI自动选择
PROXY
AI
YouTube
Emby
TikTok
Netflix
Disney
...
```

其中每个主要服务组都可以展开查看原始 MASQUE 节点。

---

## 自动测速

`自动选择` 使用 `url-test` 对节点做延迟筛选。

推荐日常使用：

```text
PROXY → 自动选择
YouTube → 自动选择
Netflix → 自动选择
Telegram → 自动选择
```

如果某个服务无法访问，可以进入对应策略组手动切换节点测试。

---

# ChatGPT / OpenAI 简单模式

v6.7 默认推荐：

```text
ChatGPT / OpenAI 出口 → DIRECT
```

规则会把关键 OpenAI 域名单独处理，例如：

```text
chatgpt.com
openai.com
oaistatic.com
oaiusercontent.com
oaistatsig.com
openaimerge.com
workos.com
workoscdn.com
challenges.cloudflare.com
```

这样：

```text
ChatGPT / OpenAI → DIRECT
YouTube / Netflix / Telegram / 其它国外流量 → WARP
```

适合本地网络本身能够访问 ChatGPT，但共享 WARP 出口被拒绝的情况。

---

## DIRECT 仍打不开怎么办？

可以把：

```text
ChatGPT / OpenAI 出口
```

依次尝试：

```text
AI 自动选择
地区优选
PROXY
AI 策略组
```

如果 WARP 页面显示：

```text
Unable to load site
If you are using a VPN, try turning it off.
```

通常说明当前 WARP 出口并不适合 ChatGPT。

增加 MASQUE 节点数量不一定能解决，因为多个入口可能仍然对应同一类 WARP 出口。

---

# 节点数量与 H2 扩展池

## 为什么选择 64 个，实际可能不足 64？

节点生成会自动去重。

例如：

```text
7 个 Endpoint × 7 个 Port = 49 个唯一组合
```

那么即使目标选择：

```text
64
```

也不会复制相同的 `Endpoint:Port` 来伪造 64 个节点。

网页会提示：

```text
唯一组合不足
```

---

## 想要 100～500 节点

建议：

```text
网络 / 传输：H2 / TCP
H2 扩展地址池：开启
Port：全部常用
节点数量：100 / 200 / 500
```

H2 模式会从扩展 IPv4 地址池生成更多唯一候选组合。

> 大量节点主要适合测速筛选。500 个候选节点会增加 Clash 启动、测速、UI 渲染和规则组展开的压力，日常使用通常 13～64 个已经足够。

---

# 其它输出格式

## 原生 Usque

下载：

```text
usque-config.json
```

Windows 运行 Usque SOCKS 示例：

```bash
usque.exe -c usque-config.json socks -b 127.0.0.1 -p 1080
```

---

## sing-box

项目生成的 sing-box 配置使用：

```text
sing-box
   ↓
127.0.0.1:1080 SOCKS
   ↓
Usque
   ↓
WARP MASQUE
```

因此先启动 Usque：

```bash
usque.exe -c usque-config.json socks -b 127.0.0.1 -p 1080
```

然后：

```bash
sing-box run -c sing-box-usque.json
```

---

## VLESS 本地桥接

请特别注意：

```text
Cloudflare MASQUE ≠ VLESS
```

项目不会伪造一个远程 Cloudflare VLESS 服务器。

生成的是：

```text
VLESS 127.0.0.1:2081
        ↓
sing-box 本地 VLESS inbound
        ↓
SOCKS 127.0.0.1:1080
        ↓
Usque
        ↓
WARP MASQUE
```

所以生成的 VLESS 链接地址是：

```text
127.0.0.1:2081
```

它只能在本机使用。

如果直接导入 v2rayN 而没有启动桥接服务，测速会显示：

```text
-1
```

这是正常的。

Windows 最简单方式：

```text
1. 下载 usque-config.json
2. 下载 usque-vless-bridge.json
3. 下载 Windows 一键启动 BAT
4. 把 usque.exe 与 sing-box.exe 放在同一目录
5. 双击 BAT
6. 再在 v2rayN 测试 127.0.0.1:2081
```

---

## Shadowrocket

选择：

```text
Shadowrocket
```

生成适用于支持 MASQUE 配置的客户端格式。

如果客户端版本不识别相关字段，请优先使用 Clash/Mihomo，或确认客户端本身是否支持当前 MASQUE 配置。

---

# WARP 出口国家检测（高级）

这个功能不是使用项目的必要条件。

默认建议保持折叠。

如果确实需要检查不同 MASQUE 节点实际对应的 WARP 出口，可以使用：

```text
warp-egress-selector.py
```

网页还可以下载：

```text
Windows 一键检测 BAT
出口偏好 JSON
```

---

## 使用条件

需要：

```text
Clash / Mihomo 已运行
Python 3
Mihomo Controller API 可访问
Mixed Proxy 可访问
```

默认：

```text
Controller:
http://127.0.0.1:9090

Mixed Proxy:
http://127.0.0.1:7890
```

如果 Clash Verge 使用不同端口或 Secret，需要在网页里改成实际值。

---

## 检测流程

```text
隐藏“出口检测”策略组
        ↓
脚本逐个切换 MASQUE 节点
        ↓
通过本地代理查询真实出口
        ↓
记录 IP / 国家 / 地区 / 城市 / PoP
        ↓
测试 ChatGPT HTTP 可达性
        ↓
按偏好与延迟排序
        ↓
设置“地区优选”节点
```

结果会输出：

```text
warp-egress-report-时间.json
warp-egress-report-时间.csv
```

---

# 升级项目

如果通过 GitHub + Pages 部署，升级最方便。

例如以后发布 v6.8：

```text
1. 下载新版本
2. 覆盖本地 pages/ 与 workers/
3. 打开 GitHub Desktop
4. 填写 Summary
5. Commit to main
6. Push origin
```

Cloudflare Pages 如果已经绑定 GitHub，会自动重新部署。

---

# 常见问题

## 1. `/api/health` 打不开

先检查部署结构。

Pages 根目录必须包含：

```text
_worker.js
_routes.json
index.html
```

测试：

```text
/api/health
```

如果首页正常、API 404，通常是 Worker / 路由文件没有部署到正确根目录。

---

## 2. 注册提示 1015 / 429

这是 Cloudflare WARP 注册接口限流。

项目会显示等待时间。

不要连续点击注册。

建议：

```text
等待倒计时结束
再尝试一次
```

已经保存 `config.json` 的用户无需重新注册。

---

## 3. Clash 显示节点，但全部失败

依次检查：

```text
网络 / 传输模式
Endpoint
Port
IPv4 / IPv6 可达性
UDP 是否可用
运营商是否限制 QUIC
```

如果 QUIC 全部失败，可以尝试：

```text
H2 / TCP
```

---

## 4. 为什么节点很多，但出口 IP 一样？

因为：

```text
MASQUE 节点 = Cloudflare 入口候选
WARP IP      = 最终出口
```

不同入口可以最终使用相同或相近的 WARP 出口。

这是正常现象。

---

## 5. ChatGPT 还是无法访问

先把：

```text
ChatGPT / OpenAI 出口 → DIRECT
```

然后重新打开浏览器测试。

如果 DIRECT 正常，而 WARP 不正常，说明当前问题主要在 WARP 出口。

此时无需继续增加 100 / 500 个 MASQUE 节点。

---

## 6. VLESS 为什么是 `127.0.0.1`？

因为这是本地协议桥接，不是远程 VLESS。

必须同时运行：

```text
Usque SOCKS 127.0.0.1:1080
sing-box VLESS 127.0.0.1:2081
```

否则 v2rayN 会显示 `-1`。

---

## 7. 为什么分流组节点很多？

v6.7 会把原始 MASQUE 节点加入主要服务策略组，方便：

```text
自动测速
手动切换
排查单个服务可达性
```

如果生成 64 个节点，每个服务组可能出现六十多个选项，这是预期行为。

---

## 8. 500 节点是不是速度更快？

不是。

500 节点只是更多候选入口。

它可能帮助找到：

```text
更低延迟
更稳定端口
更适合当前网络的 Cloudflare 入口
```

但也会增加：

```text
测速时间
Clash 内存占用
UI 渲染压力
配置体积
```

日常更推荐：

```text
13 / 32 / 64
```

---

# 安全与隐私

项目采用以下原则：

## 私钥本地生成

MASQUE P-256 私钥由浏览器 WebCrypto 本地生成。

---

## 固定上游

Worker 只用于项目需要的 WARP 注册接口，不作为通用代理。

---

## Same-Origin 检查

API 会检查来源，拒绝明显跨站请求。

---

## 请求体限制

API 对 JSON 大小和字段格式进行校验。

---

## 不使用数据库保存凭据

默认不使用：

```text
KV
D1
R2
localStorage
sessionStorage
```

保存 Usque 私钥或账户凭据。

---

## 仍然需要你自己保护 config.json

下载到本机后的：

```text
usque-config.json
```

由你自行保管。

建议把以下内容加入 `.gitignore`：

```gitignore
node_modules/
.wrangler/
.dev.vars
.env
*.log

usque-config.json
warp-egress-report-*.json
warp-egress-report-*.csv
```

---

# 重要说明

1. 本项目是 **WARP / MASQUE 配置与客户端转换工具**，不是 VPN 服务提供商。
2. Endpoint 数量增加不等于拥有更多独立 WARP 账户或独立出口。
3. 普通 WARP 无法通过本项目保证指定最终出口国家。
4. 流媒体、AI、网站可达性会受到出口 IP、地区、运营商、服务商策略等影响，不能保证永久解锁。
5. H2 扩展池中的大量地址是候选连接，需要实际测速，不代表全部可用。
6. VLESS 输出属于 **本地桥接**，不是把 MASQUE 直接转换成远程 VLESS 服务器。
7. 请遵守所在地法律法规、Cloudflare 服务条款及所访问服务的使用规则。

---

# 推荐配置速查

## 新手日常使用

```text
节点：13 / 32
传输：QUIC / H3
规则：完整智能分流
自动测速：开
ChatGPT：DIRECT
```

## 想多测速一些入口

```text
节点：64
传输：QUIC / H3
端口：全部常用
自动测速：开
```

## 想生成 100～500 个候选

```text
传输：H2 / TCP
H2 扩展池：开
节点：100 / 200 / 500
用途：批量测速筛选
```

## ChatGPT 无法访问

```text
第一选择：ChatGPT → DIRECT
第二选择：AI 自动选择
第三选择：高级 WARP 出口检测
```

---

# 一句话使用流程

```text
部署 Pages / Workers
      ↓
首次注册并保存 config.json
      ↓
以后直接导入 config.json
      ↓
设置节点 / SNI / DNS / 分流
      ↓
生成 Clash / Mihomo
      ↓
导入客户端
      ↓
自动测速并使用
```

---

**Usque MASQUE Pro v6.7** 重点是把注册、保存、配置、转换、分流和部署整合在一个页面中；第一次完成部署和注册后，后续绝大多数操作都只需要“导入 `config.json` → 调整设置 → 重新生成”。
