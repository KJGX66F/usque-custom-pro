# Usque MASQUE Pro v6.26 — P2 小件：更新提示 / 向导演示 / SNI 轮换 / 诊断导出

**中文** | [English](./README_EN.md)

> 基于 Cloudflare WARP / MASQUE 的可视化注册、配置生成与多客户端转换工具。  
> 支持 **Cloudflare Pages + Cloudflare Workers 双部署**，浏览器完成 Usque 注册、原生配置保存、MASQUE 多节点生成、Clash/Mihomo 智能分流、Shadowrocket、sing-box、本地 VLESS 桥接，以及可选的 WARP 出口检测。
> v6.18 起内置**免费落地多源合并**（Au1rxx + 4 个公共源，可加自定义源），v6.21 起支持**扫码获取订阅**（手机扫码直接导入，见核心功能第 10 节），v6.22 起订阅可选 24 小时 / 7 天 / 常驻三档，常驻可更新内容、可轮换吊销；v6.23 起在原生格式下生成订阅会先弹防呆提示；v6.24 起可给公开部署加部署者口令与频率限制；v6.25 起有账户库、全部订阅管理、分客户端一键导入、端点池远程清单与链式出口；v6.26 起有面板新版本提示、新手向导与演示模式、SNI 候选池轮换、脱敏诊断导出，并新增英文 README。
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

**Usque MASQUE Pro v6.26** 是一个面向 Cloudflare WARP / MASQUE 的浏览器可视化工具。

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
（可选）开启免费落地：多源合并 + 自定义源
  ↓
一键生成客户端配置
  ↓
Clash / Mihomo / Shadowrocket / sing-box / VLESS 本地桥接
  ↓
下载文件导入，或扫码获取订阅直接导入手机
```

项目重点面向：

- 第一次接触 Usque / MASQUE 的用户
- 不想手工编辑大量 YAML / JSON 的用户
- 需要批量生成 MASQUE 候选节点的用户
- 需要 Clash / Mihomo 智能分流的用户
- 想给 AI / 流媒体准备免费落地节点（多源合并、支持自定义源）的用户
- 想扫码把订阅直接导入手机的用户
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

当前版本默认推荐：

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
- v6.19 起支持自定义源，v6.20 起入口移到「查看节点来源与说明」展开区并高亮显示（展开可看到全部 5 个内置源的地址）：每行填一个订阅地址（最多 10 个），与内置源一起拉取测速；只填自定义源、不勾国家也可单独使用，想换掉内置源时关掉多源合并并取消国家勾选、只留自定义源即可
- 4 个公共源不分国家，只进「免费落地自动 / AI / 流媒体」总组，不进国家组
- 稳定模式的协议排除（Hysteria2 / TUIC / WireGuard / HTTP / SOCKS）对所有源一致生效
- 不同源之间可能有个别重复节点，测速会自动选最快的一个，不影响使用

---

## 10. 扫码获取订阅（v6.21 新增，v6.22 起可选常驻；需要一次性绑定 KV）

下载配置区点「📱 扫码获取订阅」：把当前生成的配置托管到你自己的 Cloudflare，生成订阅链接 + 二维码。手机用 Clash Verge / FlClash 扫码可直接导入订阅，不用再手动传文件；其它格式扫码得到下载链接。生成前先选「订阅有效期」：24 小时（默认）/ 7 天到期自动失效；选「常驻」则长期有效，之后换配置只需在面板里更新内容，链接不变、不用重新扫码。注意订阅里装的是**当前格式**的配置：要在 Clash Verge / FlClash 里导入，必须先生成 Clash / Mihomo 格式再做订阅；停在「原生 config.json」格式时面板会先弹防呆提示（原生 JSON 无法被 Clash 客户端导入）。

安全说明：链接里包含 WARP 私钥，等同于凭据，只扫自己的设备、不要外传。令牌为 192 位随机值、不可枚举。常驻档长期有效请妥善保管：怀疑泄露时在面板下方「我的常驻订阅」点「轮换链接」，旧链接立即作废；不用了点「删除常驻订阅」；换配置点「更新为当前配置」即可（常驻记录只保存在你当前浏览器的本地存储里，换浏览器/设备请重新生成一条常驻订阅）。

公开部署保护（可选，v6.24）：面板部署在你自己的 Cloudflare 账号上，别人打开你的站点用，所有注册与订阅流量都消耗你账号的免费额度（函数请求每天 10 万次、KV 写入每天 1,000 次），访客的订阅配置也会存进你的 KV。如果要把站点公开给别人用，建议再设置一个环境变量 `SUB_OWNER_KEY`（任意一串只有你知道的口令；Pages 在项目「设置 → 环境变量」添加，Workers 用 `npx wrangler secret put SUB_OWNER_KEY`）：设置后，常驻订阅只有输入了口令的浏览器能创建/轮换（面板会弹窗询问，口令只存在你自己的浏览器里），访客只能建 24 小时 / 7 天订阅，到期自动清掉、不会把你的 KV 塞满。不设置则不启用该保护（自己部署自己用的默认情形，行为与之前一致）。另外，后端已内置单 IP 每小时 60 次的订阅写入频率限制；想更严格，可在 Cloudflare 控制台再给 `/api/*` 添加 Rate Limiting 规则。

一次性设置（绑定 KV，变量名必须为 `SUB_KV`）：

```
Pages 版：Cloudflare 控制台 → Workers 和 Pages → KV → 创建命名空间
        → 回到 Pages 项目 → 设置 → 绑定 → 添加 KV 命名空间
        → 变量名 SUB_KV → 选择命名空间 → 保存并重新部署

Workers 版：npx wrangler kv namespace create SUB_KV 创建后，
        把 id 填进 workers/wrangler.jsonc 的 kv_namespaces（已备好注释模板），
        或在控制台给 Worker 绑定同名 SUB_KV，然后重新部署
```

没绑 KV 时点生成会直接提示未启用，不影响其它任何功能。


## 11. v6.25 功能包说明

- **账户库**：导入区下方可以把多个 WARP 账户存进浏览器本地，一键切换，不用反复找 config.json 文件。含私钥，只存本机浏览器，公用电脑不要用。
- **恢复常驻订阅管理**：换浏览器 / 设备后，在订阅区粘贴以前的常驻链接即可恢复管理（更新 / 轮换 / 删除），不用再新建一条。
- **全部已发订阅（部署者）**：设置过 `SUB_OWNER_KEY` 的部署者可以在订阅区查看本站发出的全部订阅（只显示档位、文件名、到期时间，不显示内容），并逐条复制或吊销；没设口令时此功能关闭，避免访客列出全部链接。
- **分客户端一键导入**：生成订阅后，二维码旁会按当前格式给出对应客户端的一键导入入口——Clash / Mihomo、Shadowrocket、sing-box、v2rayNG（仅列出能正确导入当前格式的客户端）。
- **端点池远程清单**：面板启动时读取仓库根目录的 `endpoints.json` 覆盖内置端点池，读取失败自动回退内置。以后某个端点失效，改这一个文件推送即可全网生效，不用再发版。
- **链式出口**：设置里填一个二级代理（HTTP / SOCKS5，可带账号密码），生成的 Clash 配置会多一个「⛓ 链式出口」节点：流量先过 WARP 再从二级代理落地。典型用法是填 Opera 浏览器代理的凭据或本机 opera-proxy 的地址（凭据需要你自备，本工具不提供 Opera 账号）。仅 Clash / Mihomo 格式生效。


## 12. v6.26 小件说明

- **面板新版本提示**：面板启动时向 GitHub 查询最新 Release，比当前版本新时在顶部显示横幅，可按版本关闭提醒。仓库从本版起在推送 `v*` 标签时由 GitHub Actions 自动创建 Release。
- **新手向导 + 演示模式**：面板顶部有三步向导，完成自动打勾；没有账号时可点「演示模式」用假数据体验全部生成效果（假配置不能真连接）。
- **SNI 候选池轮换**：高级设置里开启后，生成的节点会轮流使用候选列表里的不同 SNI，个别网络下能改善连通性；候选可自由编辑。
- **脱敏诊断导出**：订阅区「导出诊断信息」生成一份只含版本、格式、端点、功能开关等非敏感信息的文本，报错求助时发它即可，不含私钥与令牌。
- **链式出口默认折叠**：链式出口设置改为默认收起，点击标题才展开（v6.26 起，按用户反馈）。
- **端点池双源读取**：远程清单改为 GitHub raw 与 jsdelivr 镜像双源，国内网络读不到 raw 时自动走镜像。
- **英文 README**：新增 `README_EN.md`，与中文版互相链接。

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

v6.26 双部署版：

```text
usque-custom-pro-v67-dual/
│
├─ README.md
│
├─ pages/
│  ├─ index.html
│  ├─ app.js
│  ├─ qrcode.js
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
      ├─ qrcode.js
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

本项目同时提供完整 Workers Static Assets 版本。

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

## 免费落地节点设置（可选）

想让 AI / 流媒体优先走免费公共节点时，在面板的免费落地设置区：

```text
1. 勾选「启用免费落地节点」（默认已开）
2. 勾选落地国家 / 地区（默认 US / JP / SG）
3. 「多源合并」保持开启：Au1rxx 主源 + 4 个公共源一起拉取测速
4. （可选）展开「📚 查看节点来源与说明」：
   - 能看到全部 5 个内置源的地址
   - 在底部高亮框里填自己的订阅源（每行一个，最多 10 个）
5. 协议筛选保持「稳定优先」
6. 点击「应用设置并重新生成」，再下载 Clash 配置
```

导入客户端后，配置会每小时自动重新拉取这些源的最新节点，并在
`🤖 AI自动优选`、`🎬 流媒体自动优选`、`⚡ 免费落地自动`、`🌍 免费落地可手动`
里按延迟自动选最快的。第一次导入时节点较多，测活需要等一会儿，属正常现象。

只想用自己的源：关掉「多源合并」、取消全部国家勾选、只在自定义源框里填地址即可。

---

## 扫码获取订阅（手机导入）

前提：已按核心功能第 10 节给项目绑定 KV（变量名 `SUB_KV`），只需设置一次。

```text
1. 顶部选择 Clash / Mihomo 格式并生成配置
2. 在下载配置区点击「📱 扫码获取订阅（生成二维码）」
3. 手机用 Clash Verge / FlClash 等客户端扫码 → 直接导入订阅
   （其它格式扫码得到的是下载链接，下下来再导入）
4. 链接按所选有效期失效（24 小时 / 7 天）；选了常驻的长期有效，换配置在「我的常驻订阅」点「更新为当前配置」即可，客户端更新一次订阅就是新配置
```

注意：订阅链接里包含 WARP 私钥，只扫自己的设备，不要外传或截图发群。

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

当前版本默认推荐：

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

想用「扫码获取订阅」（含 v6.22 的常驻订阅），需一次性给项目绑定变量名为 `SUB_KV` 的 KV 命名空间（见核心功能第 10 节）；不绑也不影响其它功能。

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

本项目会把原始 MASQUE 节点加入主要服务策略组，方便：

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

## 9. 扫码获取订阅提示「未启用 SUB_KV」

扫码功能需要把配置临时存到你自己的 Cloudflare KV 里，没绑定就会看到这个提示，其它功能不受影响。

按核心功能第 10 节绑定变量名为 `SUB_KV` 的 KV 命名空间并重新部署即可。

---

## 10. 订阅链接打不开 / 已过期

扫码生成的订阅链接按生成时选的有效期失效（24 小时 / 7 天），过期后客户端拉取会 404。常驻档不会过期；如果常驻链接也 404，多半是被轮换/删除过，或 KV 里被手动清掉。

回到面板重新点一次「📱 扫码获取订阅」生成新链接，再让客户端更新订阅即可；不想再遇到过期，生成时选「常驻」档。

---

## 11. 自定义源填了，但没有多出节点

按顺序检查：

```text
1. 地址是不是 http(s) 开头、每行一个（多余空格没关系，重复行会自动去掉）
2. 填完有没有点「应用设置并重新生成」，并重新下载 / 导入配置
3. 客户端里看「免费落地自动 / AI / 流媒体」总组（自定义源不进国家组）
4. 源本身暂时不可用时，该源会被跳过，其它源不受影响
```

---

## 12. 开了多源合并后节点特别多、第一次测速很久

这是正常现象：5 个源合并后候选可达数千个，客户端第一次要逐个测活。

等第一轮测速完成即可；日常嫌多的话，关掉「多源合并」只用主源 Au1rxx，或在客户端里只用自动优选组。

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

唯一的例外是「扫码获取订阅」：只有当你主动点击生成按钮时，生成好的配置才会被存入**你自己项目绑定的 KV**，用于手机拉取；24 小时 / 7 天档到期自动删除，常驻档会保留到你点「删除常驻订阅」或「轮换链接」为止；不点就不会存。令牌为 192 位随机值，无法枚举。

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

## 想用免费落地节点

```text
免费落地：开
落地国家：US / JP / SG
多源合并：开（节点更多）或关（只用 Au1rxx 主源）
协议筛选：稳定优先
自定义源：按需在「查看节点来源与说明」展开区里填
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
导入客户端（或扫码获取订阅，直接导入手机）
      ↓
自动测速并使用
```

---

**Usque MASQUE Pro v6.26** 重点是把注册、保存、配置、转换、分流和部署整合在一个页面中；第一次完成部署和注册后，后续绝大多数操作都只需要“导入 `config.json` → 调整设置 → 重新生成”。
