# v2.8.2 — 信号分校准 + 严格检索指标 + MCP 修复

- 信号分加入 repo-focus：热门仓库里的附带 SKILL.md 不再霸榜；high 31 / medium 3,588 / low 2,780。
- 扫描增加 `rm -rf /绝对路径` 中风险。
- discover 基准增加 P@5 / Top-1 / MRR：0.733 / 0.917 / 0.938（加入查询意图类别加权后），文档承认 Hit@5 偏松并列出 1 条类别 MISS、3 条关键词 MISS。
- MCP `discover_skills` 排除已安装；`search_skills.category` 支持 14 个分类；查询意图加权。
