# v2.8.0 — GitHub 信号 + 真实评测 + 本地向量检索

- 4,007 个仓库的 stars/维护度/许可/归档信号进入 6,399 索引；`quality` = 完整度 55% + 仓库信号 45%，UI 显示「信号分」和 ★ stars。
- 新增 30 条真实任务评测（`npm run eval:real`），Recall@4 = 0.9 (27/30)；3 条已知 MISS 如实记录。
- MCP `discover_skills`/`search_skills` 增加 256 维本地哈希向量 + 中英概念词表；无网络/无模型/无新依赖。
- 安全与去重修复见 v2.7.x；自动安装仍默认关闭。
