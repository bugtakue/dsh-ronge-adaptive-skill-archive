# v5.0.0 — Skill Intelligence

- 12 领域 taxonomy、4,808 唯一技能能力画像、任务拆解、多技能组合、SKILL.md draft（不写盘）。
- DSH 原生工具 `skill_archive_plan` / `skill_archive_compose` / `skill_archive_draft_skill`；HTTP `/intelligence/*`、`/health`、`/version`。
- 安全加固：严格 URL/禁重定向、原子写、锁、备份上限、force 双门禁、Origin 校验、MCP 去 SSRF/去覆盖/去模型 force。
- 客户端智能组合/创作入口、AbortController、外链安全、a11y。
- 60 条 held-out 基准：planCoverage 0.60 / validity 1.00 / capabilityCoverage 0.839 / gapDetection 1.00；installLoad 0.782、hintRecall 0.383 已如实标注。
- 测试 115/115、Host 20/20、UI 27/27。
