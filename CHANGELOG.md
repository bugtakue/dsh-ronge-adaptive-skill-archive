# Changelog

## v2.5.0 — 2026-10-29

- **更优技能自动升级**：推荐时同时评估已安装技能与 6,399 条库中未安装技能；按上下文关键词命中、类别、评分、信任做文本级对比，发现明显优于已装方案时给出「发现更优的未装技能」。
- 面板新增「更优」区块：候选名、评分、命中关键词、为什么更优（相比已装技能的证据）、安装并使用 / 忽略。
- **默认自动安装**：开启后自动安装第一个更优候选（每页面一次），安装前走现有安全扫描，高风险会拦截；已安装技能如果仍然更合适则不会替换。可在区块标题处关闭。
- 后端新增 `betterOptions` 与 `buildBetterOptions()`；复用 `/discover/install`（扫描+落盘+lock）。
- 测试：44/44（后端）；浏览器 UI 20/20（含自动安装调用断言）。


## v2.4.4 — 2026-10-29

- 推荐上下文改为**整段会话**：最多 24 条用户消息（字符预算 12,000），不再只是最近 12 条/最后一段话。
- 加入项目上下文：递归扫描项目文件列表（最多 200 个），读取 AGENTS.md / CLAUDE.md / README.md / package.json / pyproject.toml / Cargo.toml / go.mod 的小段内容（缓存 30s）。
- 面板「基于」显示最近两条消息 + `会话消息 N · 项目文件 M · 项目文档 K`；发现推荐同样使用整段上下文。
- 测试 43/43；浏览器 UI 19/19。


## v2.4.3 — 2026-10-29

- 推荐使用更完整的上下文：从「最近 8 条消息」扩到「最近 12 条消息 + 项目文件名」；面板「基于」处标注上下文窗口（最近消息 / 项目文件数量）。
- 「库里还没装的」也改为用完整上下文窗口挑选（原先只看最后一句）。
- 推荐提示文案更新，不再让人误以为只看当前一段话。
- 测试 43/43；浏览器 UI 19/19（含上下文窗口断言）。


## v2.4.2 — 2026-10-29

- 修复组合卡片/通知的 CSS 被误放进 `prefers-reduced-motion` 媒体块，导致「当前组合」无边框背景、顶部布局挤压的问题。
- 组合卡片回到正常位置（品牌头下方、tabs 上方），文字与卡片样式恢复。
- 测试 43/43；浏览器 UI 19/19。


## v2.4.1 — 2026-10-29

- 修复组合评级在「已安装技能不在卷轴馆索引」时显示 `★ 0.0` 的问题：改为显示本地使用成功率（例如「本地成功率 100%」），有索引评级时仍显示 ★。
- 「库里还没装的」改为按当前推荐技能的名称关键词 + 类别挑选，比纯类别/上下文 token 更贴近当前任务。
- 组合通知 watcher 依赖补上 sessionId，面板关闭/切换会话后也能正确触发切换通知。
- 测试 43/43；浏览器 UI 19/19。


## v2.4.0 — 2026-10-29

- **当前组合常驻卡片**：面板顶部显示运行中的 skill/组合、平均评级（来自卷轴馆索引）、为什么切到这个组合（推荐理由归因）；空闲时显示推荐组合。
- **组合切换小弹窗（bot 通知）**：面板关闭时也会每 12s 静默轮询；运行中组合变化时右下角弹出通知（组合名 ×、★ 评级、原因），可一键打开面板或关闭。
- **卷轴馆「只看未安装」**：卷轴馆筛选默认隐藏已安装技能；切到「全部」显示已安装徽标；新增「库里还没装的」区块，按上下文从 6,399 条索引取 3 个未安装技能（评分/预览/安装）。
- 后端新增 `activeCombo`、`discoveries`、`/library?hideInstalled=1`；`searchLibrary` 支持多 token 匹配与排除已安装。
- 测试：43/43（组合/发现/库过滤）；浏览器 UI 19/19。


## v2.3.0 — 2026-10-29

- **MCP prompts + resources**：新增 `prompts/list|get`（`recommend`、`skill-workflow`，Claude Code 中即 `/mcp__ronge__recommend`）与 `resources/list|read|templates/list`（`ronge://experience/summary`、`ronge://library/{name}`、`ronge://skill/{name}`，SKILL.md 读取截断 8 KiB 并标注）。
- **Trusted Publishing（OIDC）准备**：已写好迁移步骤（`docs/trusted-publishing.md`）。npm 包设置页要求账号密码 + 2FA，无法自动化完成，因此 CI 暂保留 `NPM_TOKEN`；账号本人 1 分钟即可启用，启用后按文档切 OIDC、删除 token。
- npm 页面 README 已验证正常渲染（2.2.0 起）；`0.0.0-stage` 占位版本已 deprecate。
- 测试扩展 MCP prompts/resources 协议用例。


## v2.2.0 — 2026-10-29

- **跨智能体 MCP server**：`npx ronge-adaptive-skill-archive mcp` 以 MCP stdio 暴露推荐/索引/安全扫描/安装/反馈/经验 6 个工具，Claude Code、Codex、Cursor 等任意 MCP 客户端可用；DSH 抽屉 UI 仍为 DSH 专属。
- 推荐引擎复用 DSH 同一套 `recommendSkills`（含 10% 探索、分类权重、技能亲和度）；经验/自进化数据独立存 `~/.ronge-adaptive-skill-cockpit/cross-agent.json`，与 DSH 数据目录分开。
- `install_skill` 支持 Claude Code / Codex / DSH / agents 技能目录，raw.githubusercontent.com/SKILL.md、≤256 KiB、安装前启发式扫描、旧文件备份、高风险需 `force`。
- CLI 新增 `mcp` 子命令；新增 `test/mcp.test.mjs`（协议握手、tools/list、推荐、搜索、扫描、反馈、经验）。
- README 增加跨智能体接入段；新增 `docs/cross-agent.md`。


## v2.1.3 — 2026-10-29

- **`npx ronge-adaptive-skill-archive` 安装助手**：默认打印本机该用的安装命令；`doctor` 检查 Node / DSH profile / 已安装 bundle / 数据目录 / 经验 / 自进化 / 卷轴馆索引；`eval` 离线跑推荐评估 Recall@4；`market` 打印 DSH 插件市场索引信息。CLI 不做任何 profile 写入，实际安装仍走 `plugin_manager`。
- README 首屏改为「npx 体检 → 一行安装」三步；安装表增加「不用 npm」的 GitHub tag / 本地目录两种方式；说明 npx 不是 npm 的替代品。
- `package.json` 增加 `bin`（`ronge-adaptive-skill-archive`）与 `npm start`。
- 新增 `test/cli.test.mjs`（help/version/doctor/market/eval）。
- 功能等价 v2.1.2。


## v2.1.2 — 2026-10-29

- **首次发布到 npm**：`ronge-adaptive-skill-archive@2.1.2`（MIT）；README 主截图改为 GitHub raw 绝对地址，npm 页面也能正常显示；加入 npm 版本 badge。
- GitHub Actions `publish` 已配置 `NPM_TOKEN`，后续 tag 推送会自动发布（无 token 时优雅跳过）。
- 功能等价 v2.1.1（无运行时变更）。


## v2.1.1 — 2026-10-28

- **GitHub 发布链路**：新增 `docs/index.html`（Pages 根路径跳转到 `landing.html`），开启 GitHub Pages 后可直接访问 `https://bugtakue.github.io/ronge-adaptive-skill-archive/`。
- 首个通过 tag 触发的 `publish` workflow 因 tag 在 workflow 注册前推送未运行；v2.1.1 用来验证 CI 发布流水线（无 `NPM_TOKEN` 时优雅跳过 npm publish，仅跑 check/test）。
- 无功能变更（等价 v2.1.0）。


## v2.1.0 — 2026-10-28

- **10% self-exploration quota (自探索配额)**：默认把 1 个推荐位留给平时很少被推荐的技能（`explorationRate` 默认 0.1、范围 0–0.3，可 UI 三档切换）；探索结果（adopt/good/bad）单独计数，采用率长期过低会自动调低配额、采用率高会自动调高。
- **Deeper online learning（越用越好用）**：新增「分类权重」（video/office/harness/other，0.5–2，按该类反馈自动升降）与「技能亲和度」（每次成功/失败/👍/👎 更新 EWMA，推荐分里体现为「手感」理由）；全局权重、分类权重、探索配额统一进 `evolution.json`，均可回滚/重置。
- **UI/UX 全面重做**：设计 token（间距/圆角/阴影/字号/过渡）、品牌头 + 分段 tabs + 吸顶工具区、推荐卡（排名/分数/理由 badge/操作）、按类别分组的技能列表、经验统计卡片、健康告警、自进化权重与探索进度条、统一卡片/空状态/skeleton、移动端与 focus-visible/aria。
- 新增 `POST /ronge-adaptive-skill-archive/evolution/config {explorationRate}`；catalog 的 `evolution` 增加 `explorationRate/categoryWeights/categoryLabels/learning`，推荐项可带 `exploration:true` 与 `kind:'explore'` 理由。
- Tests：探索配额/分类权重/亲和度/配置端点（36/36）；Host E2E 17/17；浏览器 UI 17/17（含探索配额与探索卡断言）。


## v2.0.0 — 2026-10-28

- **BREAKING rename**: package/repo `ronge-skill-studio` → **`ronge-adaptive-skill-archive`**. Client factory id, cordis bundle id, HTTP route prefix (`/ronge-adaptive-skill-archive/*`), locale scope and system-prompt section ids all follow the new name.
- **Data migration**: `~/.dsh/skill-studio/` is copied (old dir kept) to `~/.dsh/ronge-adaptive-skill-archive/` on first start; `experience.json/md`, `config.json`, `evolution.json`, `rec-feedback.json`, `skills-lock.json`, `backups/`, `remote-index.json` carry over. Installed skills' `.skill-studio-source.json` stays compatible.
- Display name unchanged: Chinese 荣哥技能卷轴收藏馆（可沉浸式体验版本） / English Ronge's Adaptive Skill Cockpit (Immersive Edition).
- All existing v1.6.1 fixes included (library crash, session switch, Chinese intros, self-evolution, safety scan, update center).


## v1.6.1 — 2026-10-28

- **Fix: 「卷轴馆」tab 崩溃 / 再次点按钮打不开**：早期版本里 `renderLibrary` 定义在错误组件内，点卷轴馆会抛 ReferenceError 并让抽屉失去响应；本版把渲染移入 `SkillDrawer`，并新增 `DrawerErrorBoundary`——任何 tab 异常都只在抽屉内显示「重试/关闭」，不再影响面板按钮。
- **Fix: 切换对话后推荐不变**：`SkillButton` 现在监听 `sessionId` 变化并同步到 store（之前只在点击时更新），抽屉会按新会话重新拉 catalog；新增 UI 测试验证 session A → session B 的请求切换。
- **Fix: 中文界面下技能简介仍是英文**：catalog 现在优先使用面板 locale（`lang=zh|en`），只有未指定时才用会话语言推断；同时新增中文兜底简介——没有人工中文简介的技能会生成「「类别」技能，涉及…。原文：…」，卷轴馆条目返回 `intro` 与中文 `categoryLabel`。
- 补充 Anthropic 官方常见技能的人工中文简介（pdf/docx/xlsx/pptx/frontend-design/skill-creator/mcp-builder/webapp-testing 等 15 条）。
- Tests: 27/27（新增语言跟随、卷轴馆本地化、未知技能中文兜底）；Host E2E 16/16；浏览器 UI 15/15（新增卷轴馆渲染、会话切换）。


## v1.6.0 — 2026-10-28

- **English rename**: Ronge's Skill Scroll Archive → **Ronge's Adaptive Skill Cockpit (Immersive Edition)**; the package name stays `ronge-skill-studio` (client factory id must equal the package name). Chinese name unchanged.
- **Self-evolution (自进化推荐)**: learnable recommendation weights (`token/name/category/experience`) auto-tuned in 10% bounded steps from feedback attributed to the reason kind that produced each recommendation; min 8 samples per kind, evaluation every 10 feedback signals, history log (max 50), full rollback/reset.
- New endpoints: `GET /skill-studio/evolution`, `POST /skill-studio/evolution/evaluate|rollback|reset`; catalog now carries an `evolution` snapshot.
- Recommendation feedback accepts `kind` so adopt/good/bad can be attributed; experience 👍/👎 is attributed through the last recommendation's top reason kind (`kindBySkill`).
- Client: new「自进化」block (weights, feedback success rate, pending signals, recent changes, evaluate/rollback/reset), English panel title updated.
- Tests: evolution rule tests + route test (auto-tune, rollback, reset); total 24.


## v1.5.0 — 2026-10-28

- **Safety Radar**: local, heuristic pre-install scan of SKILL.md (shell execution, pipe-to-shell, dynamic eval, prompt injection, network, credential paths, file writes, over-broad `allowed-tools`) with `low/medium/high` level and line-level findings; no upload, no execution.
- **Trust & license**: each skill now reports a trust level (`official` / `verified` / `community` / `local` / `unknown`) resolved from recorded source metadata + known org allowlist, plus the `license` frontmatter field (or `null`).
- **Update Center**: `skills-lock.json` records source URL / repo / SHA-256 / trust / license; update checks return a content diff; new endpoints apply one update, apply all updates, and roll back to the previous backup (`~/.dsh/skill-studio/backups/<skill>/`).
- **Recommendation evaluation**: `reasons` now also ship as structured `reasonsDetail` (name / keyword / category / experience); offline labelled cases + `npm run eval:recommend` report Recall@K; recommendation quality feedback (`adopt` / `good` / `bad`) stored in `rec-feedback.json`.
- **Experience+**: aggregate success rate, average duration, failure streak per skill; failed top-level turns record a failure streak; health report (stale / failing / never used / license unknown); `GET /skill-studio/experience/export` + `POST /skill-studio/experience/import` (versioned, dedupe by entry id, merge counters).
- Client: recommendation reason badges, copy-`/skill` and 👍/👎 actions, top-2 suggestion chips, trust/license/risk badges, update diff + update-all + rollback controls, experience table / health / export-import UI.
- Tests: `test/features.test.mjs` (pure helpers), `test/routes.test.mjs` (loopback routes with a mock host), eval fixtures/script; version bumped to 1.5.0.
- Distribution: DSH plugin-market index (`docs/plugin-market.json`, format 1, validated with `@deepseek-ai/dsh-plugin-market-index`), `npm run build:market-index`, GitHub Actions publish workflow (`tag v*` → test → verify tag/version → `npm publish --provenance`), README three install channels (npm / git tag / local path).


## v1.4.2 — 2026-10-28

- Renamed the product to **荣哥技能卷轴收藏馆（可沉浸式体验版本）** / **Ronge's Skill Scroll Archive (Immersive Edition)**.
- Panel title, header button («卷轴馆»), locale metadata, README, icon and docs updated.

## v1.4.1 — 2026-10-28

- Ignore background-job notification messages when deriving the language/context, so Chinese sessions keep Chinese skill intros and better recommendations.

## v1.4.0 — 2026-10-28

- **荣哥技能卷轴收藏馆**: a categorized, rated index of public GitHub SKILL.md files, bundled as `library/skills-index.json`.
- New panel tab **卷轴馆** with search, category chips, rating filter, pagination, preview and install.
- Collection/build scripts included for reproducibility.

## v1.3.0 — 2026-10-28

- **Discover**: remote skill search over a curated GitHub index (`anthropics/skills` built in), SKILL.md preview, install with source metadata + SHA-256, update checks, and index refresh via the GitHub API.
- **Tools**: browse the official MCP registry separately from skills.
- Sources config at `~/.dsh/skill-studio/sources.json`; `GITHUB_TOKEN` support for higher API quota.
- Security limits: raw.githubusercontent.com/SKILL.md only, 256 KiB max, no automatic assets, no overwrite.

## v1.0.1 — 2026-10-28

- Renamed the project to **ronge-skill-studio** (Ronge Skill Studio).
- Package, repository, panel title, icon and docs updated; data paths stay compatible (`~/.dsh/skill-studio`).

## v1.0.0 — 2026-10-28

- Default mode is now **Plan**: the agent asks for confirmation before executing.
- **Localized skill intros**: one-line Chinese/English summaries based on session language.
- **Experience memory**: task / skills / outcome / duration written to `experience.md` + `experience.json`.
- **Feedback loop**: 👍/👎 on the latest experience entry; ratings reweight future recommendations.
- Icon/display metadata, `npm run check`, unit tests and GitHub Actions CI.
- Skill Studio is no longer a panel + a chime: one bundle, one experience.

## v0.3.0

- Localized intros and clearer plan/immersive semantics.

## v0.2.0

- Plan/immersive modes and experience memory.

## v0.1.0

- Initial public release: recommendations, active skills, catalog/factory, completion chime.
