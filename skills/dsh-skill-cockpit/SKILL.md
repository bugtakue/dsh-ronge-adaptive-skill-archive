---
name: dsh-skill-cockpit
description: Use when a DSH task is complex, multi-step, cross-domain, or needs an explicit skill team, acceptance criteria, or a missing-skill draft. Do not call for simple single-deliverable tasks.
whenToUse: 复杂/跨域任务需要拆解、技能组队、阶段验收，或需要为缺口生成 SKILL.md 草稿时；简单任务不要调用。
---

# DSH Skill Cockpit

## 何时使用

只在这些情况使用：

- 任务跨 2 个以上领域（例如合同核对 + 宣传视频）；
- 需要 2 个以上阶段、交接物或验收标准；
- 需要确认本机已装技能能否覆盖，缺口是否要补；
- 需要为缺口生成 SKILL.md 草稿。

**不要使用**：短、单交付物、单领域的任务（会议纪要、单个文件改写等）。那些直接执行。

## 工具

### `skill_archive_plan`

先调用它，检查返回的 `shouldPlan`：

- `shouldPlan: false`：不要继续规划；直接执行任务；
- `shouldPlan: true`：读取 `stages`，每阶段有 `input` / `output` / `handoff` / `acceptance`。

规则：

1. 已安装技能优先；不要为了“更好”自动安装库技能；
2. 每阶段最多使用 2 个技能，一次只加载当前阶段真正需要的技能；
3. `missing` 里 `critical: true` 的能力缺失时，先告诉用户并等待确认，不要假装 ready；
4. `reviewGap: true` 表示没有独立复核技能；不要伪造 review；
5. 不承诺省 token/更快；计划是质量工具，不是效率承诺。

### `skill_archive_compose`

需要显式组合方案时使用；同样只服务复杂任务。

### `skill_archive_draft_skill`

为缺口生成完整 `SKILL.md` 草稿（含输入/输出/步骤/质量检查/失败处理/evalCases）。

- 默认只预览，不写盘；
- 写入必须由用户确认；
- 不自动安装、不自动执行。

## 执行约定

1. 按 stage 顺序执行；上一阶段 `acceptance` 不通过不得进入下一阶段；
2. 失败时回退到出问题的阶段，不回退全片；
3. 交付时列出：用了哪些技能、每阶段产物、未完成项、风险；
4. 不把计划当成执行结果；不把 estimate 当成实测。

## 示例

用户：`帮我把这份 docx 合同逐条核对，另外配一段 30 秒宣传视频`

1. `skill_archive_plan` → `shouldPlan: true`，2 个 stage；
2. stage 1 用 `office-docx`，验收「金额/日期/主体无遗漏，风险项有出处」；
3. stage 2 用视频技能，验收「时长/画幅/字幕/关键镜头」；
4. 没有独立复核技能 → 明确说 `reviewGap`，不假装复核。
