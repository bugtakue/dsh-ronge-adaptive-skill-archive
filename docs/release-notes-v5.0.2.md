# v5.0.2 — 版本可信 + installed-first 计划

- `/version`、`/health` 从 package.json 读取版本，修复 live 显示 5.0.0。
- 统一 installed skills 解析：registry 优先、scan 回退、library 元数据合并；HTTP 与 DSH 工具一致。
- 计划优先使用已安装技能；库候选只作为安装建议。
- review 阶段必须独立技能，否则显式 `reviewGap`，不假复核。
- plan 默认最多 5 个技能，减少残缺计划。
- 测试 119/119；benchmark 按 installed-first 重新校准。
