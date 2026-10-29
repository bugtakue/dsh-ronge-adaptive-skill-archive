# v2.2.0 — 跨智能体 MCP：Claude Code / Codex / Cursor 也能用

- 新增 `npx dsh-ronge-adaptive-skill-archive mcp`（MCP stdio，协议 2024-11-05）。
- 6 个工具：`recommend_skills`、`search_skills`、`scan_skill_text`、`install_skill`、`record_outcome`、`experience_summary`。
- 复用同一套推荐/探索/分类权重/亲和度引擎；数据独立在 `~/.ronge-adaptive-skill-cockpit/`，与 DSH 插件互不影响。
- `install_skill` 支持 Claude Code / Codex / DSH / agents 目录，带安全扫描、备份、高风险拦截。
- 接入方式见 `docs/cross-agent.md`；Claude Code 一行：`claude mcp add ronge -- npx -y dsh-ronge-adaptive-skill-archive mcp`。
