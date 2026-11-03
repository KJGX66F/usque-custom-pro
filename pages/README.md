# Usque MASQUE v6.22 — 订阅可选常驻 + 轮换吊销

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

v6.18–v6.22 同步说明：

```text
v6.18 免费落地多源合并（Au1rxx + ermaozi / cbusifabcap / LeilaoMi真测 / ALIILAPRO）
v6.19 免费落地支持自定义源
v6.20 来源说明展开可看全部 5 个内置源，自定义源入口移入展开区并高亮
v6.21 下载配置区新增「扫码获取订阅」
v6.22 订阅有效期可选 24 小时 / 7 天 / 常驻，常驻支持更新内容、轮换与删除
```

扫码功能需要给 Pages 项目绑定 KV（只需一次）：

```text
Cloudflare 控制台 → KV 创建命名空间
→ Pages 项目 → 设置 → 绑定 → 添加 KV 命名空间
→ 变量名 SUB_KV → 保存并重新部署
```

不绑定时扫码按钮会提示未启用，其它功能不受影响。`_routes.json` 已包含 `/api/*` 与 `/sub/*`。
