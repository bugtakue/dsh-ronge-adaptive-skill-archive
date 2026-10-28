# Changelog

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
