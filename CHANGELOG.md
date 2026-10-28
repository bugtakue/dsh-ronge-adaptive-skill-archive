# Changelog

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
