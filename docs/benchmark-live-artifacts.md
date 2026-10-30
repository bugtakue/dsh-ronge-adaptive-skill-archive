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
| contract review | plugin | 1（2 问题，条款出处；文件有效） | **4,135,674** | 45 | 247,062 |
| xlsx summary | baseline | 1（12 行 + SUM + Profit） | 199,652 | 7 | 37,114 |
| xlsx summary | plugin | 1（12 行 + SUM + Profit，含 LibreOffice 复算） | 325,628 | 12 | 26,370 |

## 结论

- **没有效率胜利**：xlsx plugin token 比 baseline 高约 **63%**，虽然墙钟更快；
  contract plugin 最终 **4,135,674 tokens / 45 calls / 247s**，约为 baseline 的 **9 倍 token、4.7 倍耗时**，属于上下文成本失控。
- 产物质量：两个 xlsx 都通过结构/公式检查；两个 docx 都包含两条矛盾，baseline 版本更详细。
- **方法缺陷**：baseline 被要求不用 cockpit，但为了完成 docx 仍用了本机 `office-docx`；
  这不是严格 baseline，下一轮必须用“无技能/无工具技能”的受控 runner，否则数字不能对外。

## 下一步

1. 插件侧只在阶段真正需要时装一个技能，禁止一次性加载 3 个；
2. 对简单 artifact 任务提供 compact execution path，不返回完整 plan；
3. 设计严格 baseline（无 installed skills）后再跑 12 条；
4. 未达标前不写效率百分比。

## plugin-lite（只 plan、不加载技能）后续实验

| 任务 | arm | success | tokens | toolCalls | wallMs |
|---|---|---:|---:|---:|---:|
| contract review | baseline | 1 | 458,980 | 12 | 52,746 |
| contract review | plugin-lite | 1（3 个问题，含 1 条条款效力瑕疵） | **352,580** | 9 | 70,709 |
| xlsx summary | baseline | 1 | 199,652 | 7 | 37,114 |
| xlsx summary | plugin-lite | 1 | **211,700** | 7 | **19,720** |

结论：**plan-only 明显优于 plan+全量技能**，但仍不是干净的效率胜利：
- contract：token 约 -23%，但墙钟约 +34%；
- xlsx：token 约 +6%，但墙钟约 -47%；
- 成功率和产物质量均未下降，contract 还多识别出一个条款效力瑕疵。

产品含义：默认应 **plan-only**，技能加载必须按阶段显式、可选，不能默认全量加载。

## 第三批：meeting minutes + pptx（2026-10-30，plan-only）

| 任务 | arm | success | tokens | toolCalls | wallMs |
|---|---|---:|---:|---:|---:|
| meeting minutes | baseline | 1（6 行动项，负责人/日期） | 212,714 | 6 | 38,196 |
| meeting minutes | plan-only | 1（6 行动项，文件有效） | **2,737,424** | 33 | 196,875 |
| pptx deck | baseline | 1（5 页，含图表/表） | **1,071,024** | 13 | 170,500 |
| pptx deck | plan-only | 1（5 页，图表/表可解析） | **1,377,456** | 18 | 232,010 |

结论：**plan-only 不可复现为效率改进**。meeting 任务反而出现约 2.8× token；contract 的 -23% 只是单点，不足以对外宣称效率。当前应停止把“省 token”作为卖点，转向计划质量/可解释性，或重做 planner 成本结构后再测。


**最终判定**：meeting plan-only 约 **12.9× baseline token、5.2× 墙钟**；pptx plan-only 约 **+29% token、+36% 墙钟**。这不是偶发噪声；plan-only 在所有完整 artifact 任务上都没有双指标改善，contract 的 -23% token 是唯一单点且更慢。下一步必须先做“简单任务不进入 planner/不输出验收阶段”的短路，否则不能把 plan-only 作为默认。
