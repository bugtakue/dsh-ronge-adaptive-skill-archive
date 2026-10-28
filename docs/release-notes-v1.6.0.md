# v1.6.0 — 自进化推荐 + 英文名更新

> 发布类型：minor｜发布日期：2026-10-28｜对应 tag：`v1.6.0`｜npm：`ronge-skill-studio@1.6.0`
> GitHub Release 标题建议：`v1.6.0 — Self-evolving recommendations + Adaptive English name`

## 摘要

v1.6.0 让推荐**自进化**：四个推荐权重（名称 / 关键词 / 类别 / 经验）不再是写死常数，而是根据「哪类理由带来的推荐被采用 / 好评 / 差评」自动、小步、可回滚地调整。同时英文名从 `Ronge's Skill Scroll Archive` 改为 **`Ronge's Adaptive Skill Cockpit (Immersive Edition)`**，一眼能看出是「自适应技能驾驶舱」；包名保持 `ronge-skill-studio` 不变。

## 自进化（Self-evolution）

- **可学习权重**：`token / name / category / experience`，默认 `1 / 8 / 0.6 / 1`；上下界 `0.5–2 / 4–14 / 0.2–1.5 / 0.4–2`。
- **反馈归因**：推荐带结构化 `reasonsDetail`；「复制 /skill」记 adopt、👍/👎 记 good/bad，并归因到产生该推荐的 top 理由类型；经验条目的 👍/👎 通过 `kindBySkill` 归因。
- **评估规则**：累计 10 条反馈自动评估；某类 `good/(good+bad)` ≥ 70% → 权重 ×1.1，≤ 40% → ×0.9；样本 < 8 不动；每次改动记录 before/after/证据/原因，最多 50 条历史。
- **可解释可回滚**：`GET /skill-studio/evolution` 看权重/成功率/待评估反馈/最近调整；`POST /evolution/evaluate|rollback|reset` 手动评估、回滚、重置；面板「自进化」区可视化。
- **护栏**：本地、无网络、无模型；有界步长；不自动回滚、不删数据；冷启动不动权重。

## 英文名

- 旧：`Ronge's Skill Scroll Archive (Immersive Edition)`
- 新：**`Ronge's Adaptive Skill Cockpit (Immersive Edition)`**
- 包名/repo/数据目录不变（`ronge-skill-studio` / `~/.dsh/skill-studio/`）；client factory id 仍等于包名（`npm run check` 校验）。
- 面板英文标题、locale、插件市场索引、README English、package description 同步更新；中文名不变。

## 安装 / 升级

```bash
plugin_manager install_bundle target=ronge-skill-studio@1.6.0
# 或本地目录 / git tag
plugin_manager install_bundle target=git+https://github.com/bugtakue/ronge-skill-studio.git#v1.6.0
```

- 从 1.5.x 升级：新增 `~/.dsh/skill-studio/evolution.json`（自动创建）；经验 / lock / 反馈数据兼容。
- 同一 profile 不能与旧 `ronge-skill-studio-v16` 同时启用（相同精确路由），切换先禁用/移除旧 bundle。

## 验证（本仓库实测）

| 项 | 结果 |
|---|---|
| `npm test`（含自进化规则 + 路由） | 24/24 |
| `npm run check` / `node --check` | 通过 |
| `npm run eval:recommend` | Recall@4 = 1（10/10） |
| Host 端到端（真实网络 + 自进化快照/自动调权/回滚） | 14/14 |
| 浏览器级 UI（真实 React + 无头 Chrome，含「自进化」区） | 13/13 |
| 安全语料 | 高风险召回 100%，干净误报 0% |
| 插件市场索引（format 1 官方校验） | 通过，install target `ronge-skill-studio@1.6.0` |

## 发布检查清单

```bash
npm run check && npm test && npm run eval:recommend
node scripts/build-market-index.mjs
git add -A && git commit -m "feat: v1.6.0 — self-evolving recommendations + Adaptive English name"
git tag -a v1.6.0 -m "v1.6.0 — Self-evolving recommendations + Adaptive English name"
git push origin main --tags    # 触发 publish.yml
```
