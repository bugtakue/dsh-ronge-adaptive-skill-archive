# Changelog

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
