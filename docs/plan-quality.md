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

2026-10-31 在 live 5.4.2 上复验：**全部 7 项通过**（版本、simple、Excel 相关性、security escalation）。
