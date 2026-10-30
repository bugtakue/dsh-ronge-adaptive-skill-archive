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
