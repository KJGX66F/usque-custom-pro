# Usque MASQUE v6.20 — 节点来源总览 + 自定义源高亮

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
