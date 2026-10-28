# Launch Kit：发布与涨星执行清单（v2.1.0）

> 目标：让陌生开发者在 30 秒内看懂「这是什么、比别的强在哪、怎么装」，然后愿意点 Star 或安装。
> 原则：**只写已实现的功能、只引用可核对的事实**。不要编 star / 用户数 / 下载量，不写「第一」「唯一」这类绝对词——除非同时给出统计口径。

---

## 1. 仓库元数据（About 栏）

### Description（英文，GitHub About 优先英文，便于搜索）

```
Context-aware, self-evolving skill cockpit for DeepSeek Harness: recommendations with reasons, live "now using", plan/immersive modes, experience memory, local pre-install safety scan, update diff/rollback, 6,399-skill public index. MIT.
```

### Description（中文备选）

```
面向 DeepSeek Harness 的自适应技能驾驶舱：带理由的上下文推荐、实时「正在使用」、计划/沉浸模式、经验记忆、本地安装前安全扫描、更新 diff/回滚，以及 6,399 条公开 SKILL.md 索引。
```

### Website

- 若把 `docs/` 设为 GitHub Pages 源：`https://bugtakue.github.io/ronge-adaptive-skill-archive/landing.html`
- 未开 Pages 时先填仓库地址：`https://github.com/bugtakue/ronge-adaptive-skill-archive`

### Topics（GitHub topics，建议按此顺序，最多 20 个）

```
deepseek-harness  dsh  dsh-plugin  agent-skills  skills-manager
adaptive  self-evolving  skill-recommendation  context-aware
plan-mode  local-first  ai-agent  productivity  mit-license
```

> 取舍：`deepseek-harness` / `dsh` / `dsh-plugin` 是精准检索词，必留；`agent-skills` / `skills-manager` 承接通用搜索；`adaptive` / `self-evolving` 是本项目差异点。不要加与项目无关的热门 tag。

### Social preview

- 尺寸 1280×640，用 `docs/panel.png` 的右侧抽屉 + 一句话定位排版；
- 图内文字 ≤ 12 个词，避免中文小字在缩略图里糊掉；
- 不放 star 数、下载量、未经验证的对比结论。

---

## 2. Release（GitHub Releases）文案要点

> v2.1.0 的变更以 `CHANGELOG.md` 与发布时的实测结果为准；v2.0.0 的重命名细节见 [`docs/release-notes-v2.0.0.md`](release-notes-v2.0.0.md)。Release 正文建议 = **3 行摘要 + 3–5 条亮点 + 升级提示 + 链接**，不要把安装表复制三遍。

标题：`v2.1.0 — adaptive weights: category learning, skill affinity, self-tuning exploration`

正文骨架：

1. **一句话**：推荐不再只靠写死的权重——你点了什么、赞了什么，会被归因到推荐理由类型，再小步调权；同时用 10% 探索配额保证系统不越推越窄。
2. **新增**：10% 自我探索配额（采用率低会自动调低、高会自动调高，范围 0–30%）、分类权重学习、技能亲和度（手感）；面板 UI 重做。
3. **升级**：从 v2.0.0 直接覆盖安装 v2.1.0（数据目录与经验/权重沿用）；从 v1.x 升级先移除旧 bundle 再装 v2.1.0（旧数据目录首次启动自动复制，旧目录保留）。
4. **继承**：v2.0.0 重命名（包名 / 路由前缀）与 v1.6.1 修复（卷轴馆崩溃、会话切换、中文简介）全部包含。
5. **验证**：`npm run check`、`npm test`、Host E2E、浏览器 UI、插件市场索引 format 1 校验（数量以 CI 和发布时的实际输出为准，不预填）。
6. **链接**：README / CHANGELOG / v2.0.0 重命名说明 / Issues。

Release 不要写：未来版本承诺、竞品贬低、未发布平台的「已上架」。

---

## 3. 短帖（各 1 条，发布当天用）

### 英文短帖（X / Reddit r/LocalLLaMA 风格，可加仓库链接）

> Most "skill managers" help you browse a catalog. This one answers a different question: **which skill should I use right now?**
>
> Ronge's Adaptive Skill Cockpit — a DeepSeek Harness plugin:
> · Top-4 recommendations from the current session + project files, with match reasons
> · live "now using", read from real `skill` tool calls
> · plan / immersive skill orchestration
> · experience memory + 👍/👎 that tunes local weights (10% exploration quota so it keeps trying new things)
> · local pre-install safety scan, update diff + rollback
> · 6,399 public SKILL.md index, browsable in the panel
>
> Everything runs locally. No telemetry. MIT.
> Single-host by design (DSH only) — feedback welcome, especially "the recommendation was wrong" reports.
>
> https://github.com/bugtakue/ronge-adaptive-skill-archive

### 中文短帖（即刻 / 小红书 / 掘金动态）

> 给 DeepSeek Harness 做了个「技能驾驶舱」：它不只列 skill，而是告诉你**此刻该用哪个、为什么、用得好不好**。
>
> · 读当前会话 + 项目文件名 → Top 4 推荐，每条带命中理由
> · 实时显示当前 turn 真正在用的 skill（读工具调用，不猜）
> · 计划模式先问再做；沉浸模式不问，自动组合 1–3 个
> · 任务完成写经验，👍/👎 会小步调整推荐权重；保留 10% 探索配额，避免越推越窄
> · 安装前本地安全扫描、更新 diff + 回滚
> · 6,399 条 GitHub 公开 SKILL.md 索引，在面板里直接浏览安装
>
> 全部本地完成，无遥测，MIT。只服务 DSH 单宿主，欢迎拿真实任务来「打脸」推荐结果。
>
> https://github.com/bugtakue/ronge-adaptive-skill-archive

### 发帖纪律

- 一次只发一个主渠道，观察 24h 评论再决定是否转发到其他社区；
- 中文帖不机翻成英文重复发，反之亦然（会显得 spam）；
- 有人指出错误时公开修正并更新 README，不在评论里争输赢；
- 不私信拉 star，不进无关群刷链接。

---

## 4. 分发与收录目标

按「相关度 × 维护活跃度」排序，逐条先读对方贡献规范再提交：

| 目标 | 动作 | 状态 / 备注 |
|---|---|---|
| DSH 官方插件市场索引 | 托管 `docs/plugin-market.json` 为 https URL，加入自定义市场索引 | 已产出 format 1 索引；发版后 `npm run build:market-index` |
| npm | `npm publish --provenance`（tag `v*` 的流水线已配） | 发布后用 `npm` 安装方式才成立 |
| `awesome-dsh` / `awesome-deepseek-harness` | PR 一行条目：名称 + 一句话 + 链接 | 先确认列表存在且接受插件类条目 |
| `awesome-agent-skills` | 若列表接受「skill 管理/驾驶舱」工具类条目再提交 | 不是 skill 本体，别硬塞 |
| `awesome-claude-skills` | **慎投**：本项目是 DSH 插件，不是 Claude Code 插件 | 仅在列表明确接受通用工具时提交 |
| `awesome-mcp-servers` | **不投**：本项目不是 MCP server | 目录只是浏览入口 |
| skills.sh | **不投**：它索引经其 CLI 分发的 skill，本项目是 DSH bundle | 不要蹭不适用生态 |

> 通用规则：一个列表只提交一次；被拒就记录原因，不重复骚扰维护者。

---

## 5. 发布节奏（可复用模板）

| 时间 | 动作 | 产出 |
|---|---|---|
| T-1 天 | 冻结 README / Release 文案；核对所有数字与相对链接；截 social preview | 发布检查表全绿 |
| T-0 | push tag → npm publish → GitHub Release → 开启 Discussions（可选） | Release 可访问 |
| T+0 | 发英文短帖（X + Reddit 其一）；中文短帖（即刻/掘金其一） | 首批外部流量 |
| T+1 天 | 回复所有 issue / 评论；把「推荐不准」案例记进 backlog | 反馈闭环 |
| T+7 天 | 检查 GitHub traffic / referrers、npm 下载、issue 质量；决定是否补投 awesome 列表 | 复盘一页 |
| T+30 天 | 按真实反馈决定下一个小版本（优先推荐质量，不加更多技能） | 路线图更新 |

**度量只看**：推荐被采用的比例、经验导入/导出使用、issue 中有多少是真实任务反馈。不看 star 增速做决策（star 是结果，不是目标）。

---

## 6. 边界：不要过度承诺（发任何材料前对照）

1. **推荐是本地启发式**，不是大模型语义推荐；不要写成「AI 智能推荐」「懂你的语义」。
2. **Plan / Immersive 是 prompt 级默认行为**，不是硬约束；不要写成「强制」「保证执行」。
3. **安全扫描是启发式提示，不构成安全保证**；不要写「安全认证」「已审计」。
4. **6,399 是 GitHub 公开、可检索的 SKILL.md 快照（2026-10-28）**，不是「全网所有 skill」；不拿来和 69,000 / 3M 比数量。
5. **不编数字**：star、用户数、下载量、准确率一概不写，除非有可点击的来源或自己的可复现评测。
6. **「唯一 / 第一」必须带口径**：例如「在我们 2026-10 对 28 个相关项目的公开资料梳理中，同时具备这四项的只有本插件（自报口径）」。
7. **竞品对比只写公开可查事实**并注明口径与日期；承认对方在生态规模、跨宿主、企业治理上更强。
8. **单宿主定位**：只服务 DeepSeek Harness，不承诺 Claude Code / Cursor / VS Code 适配。
9. **平台可用性**：npm 未发布时，所有材料都应引导到 GitHub tag / 本地目录安装，避免让人执行一条 404 的命令。
10. **隐私**：可以说「全本地、无遥测、不上传」；不要延伸成「匿名」「加密传输」等未实现的描述。

---

## 7. 发布前检查清单

- [ ] `README.md` 顶部截图显示正常（`docs/panel.png` 存在、路径相对）
- [ ] 所有相对链接可点：`LICENSE`、`CONTRIBUTING.md`、`docs/release-notes-v2.0.0.md`、`docs/plugin-market.json`
- [ ] README 全文无旧包名（历史 CHANGELOG 除外）
- [ ] 数字与仓库一致：6,399 / 5,398 / 14 类 / 快照日期 / 权重与探索参数
- [ ] `npm run check` 与 CI 徽章对应 workflow 一致
- [ ] GitHub About 填好 description + topics + website
- [ ] Release 正文按 `CHANGELOG.md` 的 v2.1.0 条目整理，补齐验证结果（发布时实测）；重命名引用链接到 `docs/release-notes-v2.0.0.md`
- [ ] `docs/landing.html` 可离线打开（单文件、无外部依赖、深浅色正常、`./panel.png` 存在）
- [ ] 短帖发布前重新核对一次数字与链接；发完 24h 内值守回复
