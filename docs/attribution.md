# Attribution & Data Provenance · 数据来源与归属

> 适用对象：`library/skills-index.json`、`library/repo-metadata.json`、`library/capability-index.json`、`library/domain-packs.json`（v5 生成物）以及面板「卷轴馆 / 发现」展示的数据。
> 维护日期：2026-10-29。发版或重新采集后必须更新本文件的日期与计数。

---

## 1. 一句话边界

仓库只保存 **GitHub 上公开可检索的 `SKILL.md` 的元数据**（名称、描述摘录、路径、repo、raw URL、分类、信号分等），**不保存、不镜像、不再分发任何 SKILL.md 正文**。正文只在用户预览 / 安装时从原作者仓库按需拉取，并记录来源与 SHA-256。

---

## 2. 6,399 条索引的来源

| 项 | 内容 |
|---|---|
| 采集方式 | GitHub Code Search API，10 组 `filename:SKILL.md` 查询（`path:skills`、`path:.claude/skills`、`path:.agents/skills`、`path:agent-skills`、`path:claude` 等），分页拉取后去重 |
| 采集脚本 | `scripts/collect_github_skills.py`（原始结果 → `library/raw-results.json`）、`scripts/build_library.py`（去重、分类、评级 → `library/skills-index.json`） |
| 快照时间 | `generatedAt = 2026-10-28T12:54:19Z` |
| 规模口径 | 6,399 条候选，其中 5,398 条带 frontmatter 描述、26 条带 `whenToUse` |
| 分类 | 14 类：AI 2,070 / 编程 789 / 设计 663 / 数据 512 / 其他 1,662 / 视频 163 / 写作 155 / 效率 122 / 办公 86 / 营销 53 / 安全 48 / 研究 41 / 商业 24 / 教育 11 |
| 重复情况 | 512 个名称重复（其中 291 条都叫 `skill`），2,103 条属于重名组；发现 / 推荐会跳过重名非最佳版本，安装重名技能会自动改名 |
| 覆盖面 | 只覆盖 GitHub 上**公开、被 code search 索引到**的 `SKILL.md`；私有仓库、未索引仓库、其他格式（MCP tools、prompt 库、内部技能）都不在内。**不是「全网所有 skill」。** |
| 存储字段 | `name / description / whenToUse / category / rating / repo / path / url / rawUrl / trust / quality / duplicateName / duplicateRank / weak / completeness / repoScore / stars / pushedAt / repoLicense / repoSkillCount`。**没有正文字段。** |

**质量信号说明**：`quality` 是「完整度 55% + GitHub 仓库信号 45%」的启发式分值，`qualityLabel` 只是筛选档位；它**不是人工质量评审、不是安全评级、不是好用程度**。旧字段 `rating` 属历史遗留，不再作为质量依据。

---

## 3. GitHub stars / 仓库元数据快照

| 项 | 内容 |
|---|---|
| 文件 | `library/repo-metadata.json` |
| 来源 | GitHub GraphQL API（按索引中去重后的仓库批量查询 `stargazerCount / pushedAt / isArchived / licenseInfo`） |
| 快照时间 | `fetchedAt = 2026-10-29T06:10:28.939Z` |
| 规模 | 4,007 个仓库；4,005 个有 stars 数据（2 个缺失） |
| 更新脚本 | `scripts/fetch-repo-metadata.mjs`（需要 GitHub token，受 API 限额约束） |
| 用途 | 只作为 `quality` 信号的一部分（仓库热度 / 维护度 / 许可 / 归档），用于排序与筛选 |
| 边界 | ① stars 会变化，**任何对外引用必须带快照日期**；② 热门仓库有偏置，stars 不代表技能质量或安全；③ 6,399（技能条数）与 4,005（仓库数）不是同一口径，不能混写 |

---

## 4. 许可与归属

- **本仓库代码**：MIT（见 `LICENSE`）。文档（README、docs/）同为 MIT。
- **索引中的技能元数据**：名称、描述、路径、仓库归属原作者；描述仅作**短摘录**用于搜索 / 预览，权利归原作者。
- **每个技能仍受其来源仓库的许可证约束**：索引里 `repoLicense` / `license` 字段可能为空或 `NOASSERTION`；安装前请打开来源仓库确认，许可证未知的技能不要用于商业分发。
- **不转载正文**：仓库不包含任何 SKILL.md 指令正文；预览与安装时才从 `raw.githubusercontent.com/**/SKILL.md` 拉取（≤ 256 KiB），记录 URL + SHA-256 到 `skills-lock.json`，不做镜像分发。
- **官方示例**：`sources/anthropic-skills.json` 收录 `anthropics/skills` 的公开条目用于「发现」；版权归 Anthropic，按其仓库许可使用。
- **改名 / 品牌**：「荣哥技能卷轴收藏馆 / Ronge's Adaptive Skill Cockpit」是本项目显示名；第三方产品名（DeepSeek Harness、MCP、skills.sh、Claude Code、Codex、Cursor 等）仅作事实性指代，不表示隶属、赞助或背书。

---

## 5. 第三方数据使用边界

- 只使用 GitHub **公开** code search 与 GraphQL 返回的公开仓库信息；不采集私有仓库、不绕过访问控制。
- 采集需要维护者自己的 GitHub token（受 GitHub API 条款与 rate limit 约束）；token 不写入仓库。
- 索引是**某一天的快照**，会包含 fork、归档、重复版本与低质量条目；使用方需自行判断时效。
- 用户数据（会话内容、经验、推荐反馈）只保存在本机 `~/.dsh/dsh-ronge-adaptive-skill-archive/`，**不进入本仓库，也不进入索引**。
- 删除 / 更正请求：在本仓库开 issue（模板见 `docs/launch-kit.md` 的 Issue 模板建议），注明条目名称与来源 repo；核实后从下一版索引移除，并在 CHANGELOG 记录。移除只针对元数据，不影响原作者仓库。

---

## 6. v5 生成物（发布时补齐）

| 文件 | 生成方式 | 状态 |
|---|---|---|
| `library/capability-index.json` | `node scripts/build-capability-index.mjs`（从 `skills-index.json` 抽取 12 领域能力画像） | **已生成**（2026-10-29）：12 领域 / total 4,808 / unknown 926 / 合并重名 1,591。文件内 `generatedAt` 写 2026-10-29（疑似年份笔误），发布前修正 |
| `library/domain-packs.json` | 12 领域 × playbook + 候选技能 + 5 条 held-out 用例 | **已生成**（`generatedAt` 2026-10-29，12 领域 / 60 用例）；用例文本为作者半人工编写，不是线上遥测 |
| `docs/benchmark.md` | `node scripts/benchmark.mjs` 输出 | **尚未生成**；v5.0.0 发布前必须生成，数字只从脚本输出抄录 |

生成物中的技能名必须能在 `library/skills-index.json` 中找到；不允许手写不存在的技能。benchmark 的原始 JSON 建议随 Release 附件或 issue 存档，供复核。

---

## 7. 快照刷新流程

```bash
# 1) 重新采集 GitHub 公开 SKILL.md 元数据（需要 gh auth token）
python3 scripts/collect_github_skills.py
python3 scripts/build_library.py

# 2) 刷新仓库 stars / 维护度快照（需要 GITHUB_TOKEN）
node scripts/fetch-repo-metadata.mjs

# 3) 刷新质量信号
node scripts/upgrade-library-quality.mjs

# 4) 同步本文件与 README / docs/attribution.md 的日期与计数
#    6,399 / 5,398 / 14 类等数字必须以重新生成后的 skills-index.json 为准
```

采集与生成会影响 `library/*.json` 与包体积；不属于文档维护者的职责，请由维护者在发布窗口执行，并在 CHANGELOG 记录快照日期。
