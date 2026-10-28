# 荣哥技能卷轴收藏馆

GitHub 公开 `SKILL.md` 的**分类 + 评级**索引快照，供 Ronge Skill Studio 的「卷轴馆」tab 浏览。

**当前快照：6,399 条候选**（5,398 条带 frontmatter 描述）；分类：AI 2,070、编程 789、设计 663、数据 512、视频 163、写作 155、其他 1,662 等 14 类；评级 1–5。

- 数据文件：`skills-index.json`（由 `scripts/collect_github_skills.py` + `scripts/build_library.py` 生成）
- 只存元数据：名称、描述、whenToUse、分类、评级、repo/path/html/raw URL；不存 SKILL.md 全文
- 分类：video / design / office / data / ai / writing / marketing / coding / education / productivity / research / business / security / other
- 评级 1–5：官方组织、描述完整度、路径规范、frontmatter 完整度综合；不是人工评审
- 安装时仍会从 GitHub 拉取原文，记录来源 URL + SHA-256

> 这不是「全网所有 skill」：只覆盖 GitHub 上公开可被 code search 检索到的 `SKILL.md`，私有仓库、未索引、其他格式（MCP tools、prompt 库等）不在内。
