# Artifact A/B pilot（真实文件任务，2026-10-30）

## 任务

- `contract.docx`：读合同，生成 `review.docx` 核对报告（金额/日期矛盾，至少 2 条）。
- `sales.csv`：生成 `summary.xlsx`，12 行 + 合计 SUM + Profit 公式。

两个 arm：baseline 不使用 `skill_archive_*`/面板；plugin 先 `skill_archive_plan`，按建议加载技能。
允许写 `/tmp`；模型/工具相同。

## 结果

| 任务 | arm | success | tokens | toolCalls | wallMs |
|---|---|---:|---:|---:|---:|
| contract review | baseline | 1（2 问题，条款出处） | 458,980 | 12 | 52,746 |
| contract review | plugin | 文件已生成；运行未结束，不能计入 | >1,067,148（未完成） | 20 | >? |
| xlsx summary | baseline | 1（12 行 + SUM + Profit） | 199,652 | 7 | 37,114 |
| xlsx summary | plugin | 1（12 行 + SUM + Profit，含 LibreOffice 复算） | 325,628 | 12 | 26,370 |

## 结论

- **没有效率胜利**：xlsx plugin token 比 baseline 高约 **63%**，虽然墙钟更快；
  contract plugin 的上下文成本失控（>1M tokens，仍未结束）。
- 产物质量：两个 xlsx 都通过结构/公式检查；两个 docx 都包含两条矛盾，baseline 版本更详细。
- **方法缺陷**：baseline 被要求不用 cockpit，但为了完成 docx 仍用了本机 `office-docx`；
  这不是严格 baseline，下一轮必须用“无技能/无工具技能”的受控 runner，否则数字不能对外。

## 下一步

1. 插件侧只在阶段真正需要时装一个技能，禁止一次性加载 3 个；
2. 对简单 artifact 任务提供 compact execution path，不返回完整 plan；
3. 设计严格 baseline（无 installed skills）后再跑 12 条；
4. 未达标前不写效率百分比。
