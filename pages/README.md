# Usque MASQUE v6.27 — 延迟调优：入口与测速参数

核心逻辑：

```text
面板勾选哪些国家
        ↓
Clash 策略组里就只出现哪些国家
```

例如只勾 US + SG：

```text
☑ US
☐ JP
☑ SG
```

则 AI / 流媒体 / YouTube / Telegram / 微软 / 苹果 / CloudflareCDN / 国外网站 / 漏网之鱼里只出现：

```text
🇺🇸 US
🇸🇬 SG
```

新增参考成熟 Mihomo 配置的策略：

```text
🚀 节点选择
♻️ 自动选择
🛡️ 故障转移
⚖️ 负载均衡
🎯 全球直连
🛑 全球拦截
🐟 漏网之鱼
```

并完善服务规则：

```text
🤖 AI
🎬 流媒体
▶️ YouTube高速
✈️ 电报信息
Ⓜ️ 微软服务
🍎 苹果服务
☁️ CloudflareCDN
🌐 国外网站
```

使用 MetaCubeX MRS：
telegram / microsoft / apple / cloudflare / youtube / netflix / disney / spotify / tiktok / primevideo / hbo / category-emby / cn 等。

Pages 部署方式不变：

```text
生产分支：main
框架预设：无
构建命令：exit 0
构建输出目录：.
根目录：pages
```

v6.18–v6.27 同步说明：

```text
v6.18 免费落地多源合并（Au1rxx + ermaozi / cbusifabcap / LeilaoMi真测 / ALIILAPRO）
v6.19 免费落地支持自定义源
v6.20 来源说明展开可看全部 5 个内置源，自定义源入口移入展开区并高亮
v6.21 下载配置区新增「扫码获取订阅」
v6.22 订阅有效期可选 24 小时 / 7 天 / 常驻，常驻支持更新内容、轮换与删除
v6.23 原生格式下生成/更新订阅时增加防呆警告与确认（原生 JSON 无法导入 Clash 客户端）
v6.24 公开部署保护：设置环境变量 SUB_OWNER_KEY 后常驻订阅需部署者口令，访客只能建短期订阅；订阅写入单 IP 每小时限 60 次
v6.25 P1 功能包：账户库（多账户本地保存/切换）、恢复常驻订阅管理、部署者全部订阅列表（/api/sub/list，口令门，只出元数据）、分客户端一键导入、端点池远程清单（仓库 endpoints.json）、链式出口（WARP 后接二级代理）
v6.26 P2 小件：面板新版本提示（查 GitHub 最新 Release）、新手向导 + 演示模式、SNI 候选池轮换、脱敏诊断导出、链式出口默认折叠、端点池清单双源读取（raw + jsdelivr）、英文 README、打 Tag 自动建 Release 的工作流
v6.27 延迟调优：默认入口 162.159.198.2:443 优先、SNI 默认 Cloudflare 测速域、节点数默认甜点 48、测速 lazy + 300 秒间隔 + 3 秒超时 + 50ms 容差、「WARP自动」按入口 IP 分小组测速、H2 扩展池已知优先 + 随机抽样、握手超时默认 5 秒、MTU 稳定/速度两档标注
```

扫码功能需要给 Pages 项目绑定 KV（只需一次）：

```text
Cloudflare 控制台 → KV 创建命名空间
→ Pages 项目 → 设置 → 绑定 → 添加 KV 命名空间
→ 变量名 SUB_KV → 保存并重新部署
```

不绑定时扫码按钮会提示未启用，其它功能不受影响。`_routes.json` 已包含 `/api/*` 与 `/sub/*`。
