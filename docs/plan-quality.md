# 计划质量评测（真实复杂任务，2026-10-31）

不测 token，不承诺省时间；只看计划是否**可解释、可验收、诚实报缺口**。

## 用例与 live 结果（v5.4.2）

| 用例 | 结果 | 判定 |
|---|---|---|
| docx 合同核对 + 30 秒宣传视频 | 2 stages（office-docx / beat-promo-director+hyperframes）；每阶段 acceptance；missing=[]；reviewGap=true | ✅ 通过：已装优先、视频阶段保留、缺独立 reviewer 如实说明 |
| Excel 销售分析 + 8 页发布 PPT | live 5.4.2：pattern=escalation；primary 为 office-xlsx；不再混入 agent-experience；critical 缺口诚实 | ✅ live 已复验通过 |
| DSH 插件 + 安全审查 + 安装卸载验证 | v5.4.2 为 sequential，missing 有 security-audit 但未升级；本地已修为 escalation（critical gap 强制升级） | ✅ 修复方向正确，待 live 5.4.1 复验 |

## 规则

1. 每个 stage 必须有 input/output/handoff/acceptance；
2. 复杂跨域任务至少 2 个 stage，已装技能优先；
3. critical 缺口必须触发 escalation，不得假装 ready；
4. 无独立 reviewer 时必须 `reviewGap=true`，不得生成假 review stage；
5. 简单任务不进入 plan（工具返回 shouldPlan=false）。

## 未达标

- Excel 用例的 `agent-experience` 已由 v5.4.2 移除；live 复验通过；
- 复杂任务缺少“计划可读性/执行顺序合理性”的自动评分；
- 这些不影响“边界诚实”，但影响“够不够聪明”。

## 结论

当前产品定位：**可解释拆解、技能组队、缺口造技能、验收与安全**。
不承诺 token/时间效率；真实 A/B 负面数据见 `docs/benchmark-live-artifacts.md`。

## 重启后一键复验

```bash
node scripts/check-live-quality.mjs --port 57696 --cookie-file /tmp/dsh-cookie.txt
```

检查项：
- live `/version` = `package.json` 版本；
- simple 任务 `plan.simple=true` 且 ≤1 stage；
- Excel 计划不含 `agent-experience`、包含 `office-xlsx`；
- 安全审查计划 pattern=`escalation`，且 `security-audit` 为 critical missing。

2026-10-31/11-01 live 5.5.5 复验：**全部 7 项通过**（版本、simple、Excel 相关性、security escalation）。

## 上下文端点回归（本地 5.5.4）

`test/intelligence-routes.test.mjs` 用假 session 做端到端对比：

- 任务「继续」（无 session）：`contextAnaphora=false`，没有可用 stage；
- 同一任务带 `sessionId`（上文：docx 合同核对 + 30 秒视频）：`contextAnaphora=true`，计划出现 `office-docx` 和/或视频技能。

这说明 HTTP plan 的上下文补全链路在代码层已通过，不等同于 live 已验证；live 需重启后跑真实主会话测试。


## 上下文 live 测试（5.5.5）

同一任务「继续，把刚才那个收尾」：

| 输入 | contextAnaphora | 计划 |
|---|---|---|
| 无 session | false | `cordis-plugin-development` 等当前 cwd/任务信号 |
| 带主会话 sessionId | true（17 条消息） | `beat-promo-director` / `hyperframes` 视频阶段 |

结论：**上下文机制真实生效**（两次计划不同），但这次带 session 的结果偏向会话里更早的视频任务，**语义相关性未证明正确**。不写成“智能上下文已通过”；下一步要验证“最近任务优先级/语义正确性”。

## 最近任务优先（v5.8.1）

- 短句指代不再用整段会话切片直接规划；先选**最近一条实质用户任务**（过滤“继续/好/设置goal/重启/睡觉”等元指令），只把它作为 focused context；
- diagnostics 新增 `contextTask`，便于复核用的是哪条任务；
- 仍需 live 5.5.6 复验“继续收尾”是否优先最近 DSH 生态任务，而不是旧视频任务。

## 通知污染修复（v5.8.1）

live 5.5.6 实测发现：`lastSubstantiveTask` 会把「Background subagent ... finished」这类通知当成最近任务，导致「继续」计划选错技能。

v5.8.1 过滤：
- `Background subagent...`
- `Agent ...`
- `This is an automated...`
- `System...` / `Tool result...`

回归测试已加；live 需要重启到 5.5.7 复验。

## 垃圾输入过滤（v5.8.1）

live 5.5.7 发现最新实质任务会选到 `cv cdwdsswawsaq` 这类乱码。v5.8.1 增加 task-signal 过滤：没有 CJK / 常见任务词的消息不进入 `lastSubstantiveTask`；回归测试覆盖。

live 需重启后复验。

## system-reminder 污染修复（v5.8.1）

live 5.5.8 发现 `<system-reminder> <available_skills>` 会被当成最近任务，导致「继续」计划选到视频/技能目录。

v5.8.1 过滤 system-reminder / available_skills 消息；回归测试覆盖。live 需重启复验。


## live 5.5.9 复验（2026-11-01）

- `check-live-quality`：7/7 通过；
- `check-ecosystem`：10/10 通过；
- 同一任务「继续，把刚才那个收尾」：
  - 无 session：contextTask 空，计划使用 cordis 插件技能；
  - 带主会话：`contextTask='继续 记得把我们做出dsh生态'`，contextAnaphora=true，计划 escalation（无具体交付物）。
- 结论：**上下文污染已修复，最近任务选对**；但这条模糊任务仍无法生成可执行 stage，属于任务本身信息不足，不写成“上下文智能已全面提升”。

## live 5.5.9：显式 context 测试

同一任务「继续，把刚才那个收尾」：

| 输入 | 结果 |
|---|---|
| 无 context | `cordis-plugin-development` / `cordis-composition-reference` |
| 显式 context：之前任务=docx 合同核对 + 30 秒视频 | `office-docx` + `hyperframes/beat-promo-director` 两阶段 |

这是**真实的 API 结果改善**：有界 context 让模糊短句变成可执行的两阶段计划。  
但这不是“自动读取完整会话已完美”：主会话的 contextTask 已选对，若该任务本身模糊仍会 escalation；显式 context 是目前最可靠的路径。

## live 5.5.9：复杂任务质量

- contract + 30 秒视频：
  - 2 stages：`office-docx` / `hyperframes` + `beat-promo-director`
  - 每阶段 acceptance ✅
  - `reviewGap=true`，`missing=[]`
- 第三方 SKILL 安全审查：
  - `pattern=escalation`
  - `security-audit/compliance-check/prompt-injection-defense` critical missing
  - escalate stage 有 acceptance ✅

## live 5.5.11 最终复验（2026-11-01）

- `check-live-quality`：**7/7 通过**
- `check-ecosystem`：**10/10 通过**
- 任务「继续，把刚才那个收尾」：

| 输入 | contextTask | 计划 |
|---|---|---|
| 无 context | 空 | 无关插件技能 |
| 显式 context（docx 合同 + 30s 视频） | 空（request） | office-docx + 视频两阶段 |
| 主会话 session | `继续 记得把我们做出dsh生态` | escalation（任务本身没有具体交付物） |

结论：
- 显式 context 的真实改善已验证；
- 主会话能正确选到最近任务，但任务模糊时 escalation 是诚实行为；
- 不把“完整会话语义已解决”写成通过。

## 未安装技能临时试用 live 验证（5.6.1）

- 调用 `/discover/try`，`name=ideogram-ci-integration`：
  - HTTP 200
  - `temporary=true`、`installed=false`
  - 返回 4000 字符 bounded SKILL.md
  - security=medium
  - `~/.dsh/skills/ideogram-ci-integration` **不存在**（没有写盘/安装）
- `check-live-quality` 在 5.6.1 上 7/7 通过。
