# v2.1.0 — 10% 自我探索 + 更深的在线学习 + UI/UX 重做

> 发布类型：minor｜发布日期：2026-10-28｜tag：`v2.1.0`｜npm：`ronge-adaptive-skill-archive@2.1.0`

## 一句话

推荐器现在会**主动探索**（默认 10% 推荐位留给平时少被推荐的技能），并同时学习「哪类技能对你有效」和「每个技能的实际手感」；面板 UI/UX 全面重做。

## 自进化 v2（越用越好用）

- **10% 自我探索配额**：`explorationRate` 默认 `0.1`（范围 0–0.3，UI 三档切换 0% / 10% / 20%）。触发时把一个推荐位替换成「探索」技能（优先从未用过/低使用次数），理由类型为 `explore`，推荐项带 `exploration: true`。
- **探索配额自调**：探索反馈累计 ≥8 次后，如果采用率 <5% 自动降 5%，≥30% 自动升 5%（0–30%），评估时写入历史、可回滚。
- **分类权重学习**：`video / office / harness / other` 四类权重（0.5–2），按该类技能的 👍/👎 自动升降，直接参与打分。
- **技能亲和度（手感）**：每次任务成功/失败、推荐 👍/👎 都用 EWMA 更新该技能亲和度（0–1，样本数可解释），推荐里体现为「手感×N」理由。
- **反馈归因增强**：反馈同时归因到「理由类型 + 技能类别 + 技能」，探索反馈单独统计（展示/反馈/采用）。
- 所有学习参数落盘 `~/.dsh/ronge-adaptive-skill-archive/evolution.json`，可查看、回滚、重置；新增 `POST /ronge-adaptive-skill-archive/evolution/config {explorationRate}`。

## UI/UX 重做

- 设计 token（间距/圆角/阴影/字号/过渡）+ DSH 主题变量，浅色/深色一致。
- 品牌头 + 分段 tabs + 吸顶搜索/筛选；内容区独立滚动。
- 推荐卡：排名、分数、理由 badge（名称/关键词/类别/经验/手感/探索）、一句话中文简介、复制 `/skill` 与 👍/👎。
- 技能列表按类别分组，trust/安全/许可证徽标更清晰；展开详情排版重做。
- 经验区：统计卡片、健康告警、自进化权重/探索配额进度条、历史时间线。
- 卷轴馆/发现/工具：统一卡片、吸顶筛选、空状态引导、skeleton loading。
- 移动端适配、focus-visible、aria、`prefers-reduced-motion`。
- 保留 `DrawerErrorBoundary`：任何 tab 异常只影响抽屉内提示，不再拖垮面板按钮。

## 升级

```bash
plugin_manager install_bundle target=/Volumes/Xunji SSD/ronge-adaptive-skill-archive
# 或 npm 发布后：plugin_manager install_bundle target=ronge-adaptive-skill-archive@2.1.0
```

- 数据兼容：v2.0.0 的 `evolution.json` 自动升级（新增字段有默认值）；旧 v1.x 数据仍按 `skill-studio` → 新目录迁移。
- 同一 profile 不能同时启用旧 bundle。

## 验证

- `npm test` 36/36：自进化规则（探索/分类/亲和度/配置端点）+ 路由 + 迁移；Host E2E 17/17（真实网络 + 探索配额配置）；浏览器 UI 17/17（含探索配额、探索卡、卷轴馆、会话切换）；真实 GUI 截图见 `docs/panel.png`。
- 推荐质量回归：`npm run eval:recommend` Recall@4 = 1（10/10）。
