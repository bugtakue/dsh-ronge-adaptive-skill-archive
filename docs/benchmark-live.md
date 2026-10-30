# Live task-level A/B（真实任务效率）

## 为什么需要它

`scripts/benchmark.mjs` 只测「计划质量」；它不能证明用户少花了 token、时间或工具调用。
本目录的协议用真实 DSH 任务记录来补上这一层。

## 方法

- 任务：`test/fixtures/live-ab-tasks.json`，12 条跨领域任务（视频/Office/编码/数据/研究/营销/安全/DSH/效率）。
- 两个 arm，同一模型、同一工具、同一时间预算：
  - `baseline`：不使用技能驾驶舱的 `skill_archive_*` 工具/panel；
  - `plugin`：先调用 `skill_archive_plan`，按计划执行。
- 每条任务记录：`taskId, arm, success, tokens, toolCalls, wallMs, notes`。
- 成功由 rubric / 文件验收判定，不由插件自报。

## 命令

```bash
# 打印协议与任务（不调用模型，不产生假数字）
node scripts/benchmark-live.mjs --dry-run

# 汇总真实运行记录
node scripts/benchmark-live.mjs --record runs.json --out report.json
```

脚本**不会调用模型，也不会编造数据**；没有 `runs.json` 就没有对外数字。

## 记录格式

```json
[
  {"taskId":"video-01","arm":"baseline","success":false,"tokens":20000,"toolCalls":12,"wallMs":60000,"notes":"..."},
  {"taskId":"video-01","arm":"plugin","success":true,"tokens":12000,"toolCalls":8,"wallMs":45000,"notes":"..."}
]
```

## 当前状态

**尚未运行真实 A/B**。只有 `--dry-run` 协议与汇总工具，不能据此宣称效率提升。
运行后必须同时报告：样本量、成功率、token、toolCalls、wallMs、模型/任务集，以及原始记录文件。

## 真实 pilot（2026-10-30，2 条任务）

这不是完整 12 条 A/B，而是先跑的 2 条 pilot；同模型、同工具、同时间预算，记录 DSH session usage。

| 任务 | arm | success | tokens | toolCalls | wallMs |
|---|---|---:|---:|---:|---:|
| pilot-brief（产品简报，纯文本） | baseline | 1 | 50,970 | 1 | 7,098 |
| pilot-brief | plugin | 1 | 125,940 | 5 | 19,919 |
| pilot-video-plan（3 阶段视频计划） | baseline | 1 | 64,404 | 1 | 28,201 |
| pilot-video-plan | plugin | 1 | 127,528 | 3 | 24,438 |

**结论：这不是效率胜利。** 两条任务成功率打平；plugin arm 的 token 约为 baseline 的 2.1–2.6 倍，brief 还更慢。主要原因：
- brief 是纯文本任务，但旧 plan 仍推荐/加载了 office 文档技能；
- plugin arm 额外付出 plan + skill 加载的上下文。

原始记录：`docs/benchmark-live-pilot.json`（4 条 runs）。
已据此修复「纯文本任务不加载 office/video 技能」，但修复后的完整 A/B 需重跑，不能把旧数字当结论。
