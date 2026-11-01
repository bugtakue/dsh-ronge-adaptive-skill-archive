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

## 最近任务优先（v5.5.9）

- 短句指代不再用整段会话切片直接规划；先选**最近一条实质用户任务**（过滤“继续/好/设置goal/重启/睡觉”等元指令），只把它作为 focused context；
- diagnostics 新增 `contextTask`，便于复核用的是哪条任务；
- 仍需 live 5.5.6 复验“继续收尾”是否优先最近 DSH 生态任务，而不是旧视频任务。

## 通知污染修复（v5.5.9）

live 5.5.6 实测发现：`lastSubstantiveTask` 会把「Background subagent ... finished」这类通知当成最近任务，导致「继续」计划选错技能。

v5.5.9 过滤：
- `Background subagent...`
- `Agent ...`
- `This is an automated...`
- `System...` / `Tool result...`

回归测试已加；live 需要重启到 5.5.7 复验。

## 垃圾输入过滤（v5.5.9）

live 5.5.7 发现最新实质任务会选到 `cv cdwdsswawsaq` 这类乱码。v5.5.9 增加 task-signal 过滤：没有 CJK / 常见任务词的消息不进入 `lastSubstantiveTask`；回归测试覆盖。

live 需重启后复验。

## system-reminder 污染修复（v5.5.9）

live 5.5.8 发现 `<system-reminder> <available_skills>` 会被当成最近任务，导致「继续」计划选到视频/技能目录。

v5.5.9 过滤 system-reminder / available_skills 消息；回归测试覆盖。live 需重启复验。
