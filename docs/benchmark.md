# Skill Intelligence 基准（12 领域 × 5 held-out 用例）

一句话：`test/fixtures/intelligence-cases.json` 是 60 条跨行业 held-out 任务，
`scripts/benchmark.mjs` 调用 `lib/intelligence` 的 `decomposeTask` / `composeSkillPlan`，
输出 plan 覆盖率、组合合法率、能力覆盖率、上下文 token 估算、p50/p95 延迟，
并与 none / random / keyword 三个基线对照。**这是仓库自建的半人工基准，不是线上遥测，
也不代表 6,399 条公共技能索引的整体质量。**

## 资产

| 文件 | 内容 |
| --- | --- |
| `library/domain-packs.json` | 12 个领域包：playbook（任务模式/交付物/质量检查/常见坑）、8 条真实 library 候选技能（含能力标注）、5 条 held-out 用例 id |
| `test/fixtures/intelligence-cases.json` | 60 条用例（12×5）：`id/domain/task/deliverables/primaryIntent/expectedCapabilities/expectedSkillHints/note` |
| `scripts/benchmark.mjs` | 基准 harness：动态 import `lib/intelligence`，跑引擎 + 3 基线，输出摘要与原始 JSON |
| `test/benchmark.test.mjs` | fixtures 完整性（12 领域/60 条/真实技能名/规范能力 id）+ `--smoke` 可运行 + `--out`/阈值行为 |
| `library/capability-index.json` | intel-core 生成的技能能力索引（benchmark 读取它做 library 技能能力映射） |

领域 id 与 intel-core 对齐：`video / office / coding / data / research / marketing / design /
security / education / business / productivity / ai`。intel-core 内部把软件工程叫
`engineering`，benchmark 通过 `DOMAIN_ALIASES` 做等价映射。

## 运行

```bash
node scripts/benchmark.mjs --smoke            # 12 条（每领域 1 条），摘要 + 原始 JSON 到 stdout
node scripts/benchmark.mjs                    # 全量 60 条，同上
node scripts/benchmark.mjs --json             # 只输出原始 JSON（stdout）
node scripts/benchmark.mjs --out /tmp/benchmark-full.json   # 原始 JSON 写文件（默认不写仓库）
node scripts/benchmark.mjs --smoke --fail-on-threshold      # 按阈值硬失败（默认不硬失败）
```

可配置参数：`--limit=N`、`--seed=N`（random 基线种子，默认 42）、`--max-skills=N`（默认 5）、
`--min-plan-coverage`、`--min-validity`、`--min-capability-coverage`、`--min-hint-recall`、
`--min-gap-detection`。阈值只做报告，只有显式 `--fail-on-threshold` 才影响退出码；
`intel-core` 尚未落地时脚本输出 `status: skipped` 并 exit 0，不阻塞 CI。

## 方法

- **用例是半人工的**：由作者按真实任务风格编写，中英混合、带噪声与多意图（预算、deadline、
  同事转述、「顺便/再/两个都要」等），不是线上用户日志。
- **期望能力用 19 个规范 capability id**（见 `domain-packs.json.capabilityTaxonomy`）：
  `analysis, generation, transformation, extraction, retrieval, review, planning, rendering,
  automation, validation, presentation, research, coding, design, media, document, data,
  security, orchestration`。intel-core 的 57 个细粒度 capability 通过 `FINE_TO_CANONICAL`
  归一后再比对（如 `document-write → document/generation`），保证不同实现/基线同一把尺子。
- **已安装技能固定为 `test/fixtures/eval-skills.json` 的 10 条**（video 4、office 3、coding 3），
  全部手工标注能力；`libraryEntries` 用 `library/skills-index.json` 全量 6,399 条。
  因此大量用例本来就超出已安装能力，此时引擎应给 missing/建议安装，而不是假装能直接执行。
- **`expectedSkillHints` 是真实技能名**（library 或已安装）。空数组表示作者认为没有合适候选，
  应由 compose 报 missing/draftNeeded；有值表示「计划或建议里出现任一即合理」。
- **候选技能都是真实 library 技能**：96 条（12×8）候选逐条对照 `skills-index.json` 校验，
  测试里也会重新校验，不允许编造技能名。
- **基线**：
  - `none`：空计划（不规划）——下限；
  - `random`：固定种子随机挑 1–2 个已安装技能，单阶段，不报缺口；
  - `keyword`：中文二元组 + Latin token 词面匹配已安装技能（≤2 个）；没有已安装命中时，
    用同一套 token 在非弱、非重复、quality≥40 的 library 条目里取 top-3 作为安装建议。
- **评测口径固定**：不联网、不写仓库、不执行安装；`--smoke` 采样每个领域第一条，
  全量模式跑 60 条；同一环境下结果确定（random 基线用固定 seed）。

## 指标定义

| 指标 | 定义 |
| --- | --- |
| `planCoverage` | plan 的 stages 技能覆盖了全部 `expectedCapabilities` 的用例比例（允许包含标记为「需安装」的 library 技能，因此可能高于已安装能力上限） |
| `compositionValidity` | 结构合法率：`ok=true`、1–5 个 stage、每 stage 有 role 和技能、技能名真实存在、未安装技能必须显式 `installed:false`、同一 stage 不重复、技能条目数 ≤ `maxSkills`、pattern 属于契约枚举 |
| `capabilityCoverage` | 每个用例「期望能力被 plan 技能覆盖」的比例，再对用例取平均 |
| `hintRecall` | 有 `expectedSkillHints` 的用例中，任一 hint 出现在 stages 或 missing 建议里的比例 |
| `hintStageRecall` | 同上，但只算出现在 stages 里的（更严） |
| `gapDetection` | 已安装 10 条技能「领域或能力」覆盖不了的用例（gap case）中，plan 报告 missing/draftNeeded **或**显式放入需安装技能的比例 |
| `installLoad` | plan stages 中「非已安装技能」的平均占比——直接反映计划有多依赖安装 |
| `decomposeCapabilityCoverage` | `decomposeTask` 抽出的能力（归一后）覆盖期望能力的平均比例 |
| `domainMatch` | `decomposeTask().domains` 命中用例领域的比例（`engineering`↔`coding` 等价） |
| `contextTokens` | plan 注入上下文的 token **估算**：中文字符×1 + 其他字符/4，取整；不是真实 tokenizer |
| `latencyMs` | 单用例 `decomposeTask + composeSkillPlan` 的墙钟耗时（不含进程启动与数据加载），报告 p50/p95 |
| `ceiling` | 10 条已安装技能的理论上限：领域命中且能力并集全覆盖的用例数（13/60；如果只看能力不看领域是 40/60） |

`contextTokens` 是 **estimate**、`latencyMs` 是 **measured（单机单次，未做统计显著性）**；
文档与 README 引用时不要把 estimate 写成实测节省，也不要用单次延迟下结论。

## 当前结果（快照）

**快照**：2026-10-29 22:13 CST，engine `lib/intelligence/index.js` v5.0.0（intel-core task-9 已完成，
`library/capability-index.json` 22:11 生成），`library/skills-index.json` 6,399 条
（qualityUpdatedAt 2026-10-29T06:39:56Z），已安装技能 10 条，`--seed 42 --max-skills 5`。
两次全量运行指标一致（两次运行除 generatedAt/latency 外指标一致（2026-10-29 复核））；延迟随机器波动。

### 全量 60 条

| 指标 | 数值 |
| --- | ---: |
| `planCoverage` | **0.333**（36/60） |
| `compositionValidity` | **1.00**（60/60） |
| `capabilityCoverage` | **0.717** |
| `hintRecall` | **0.45** |
| `hintStageRecall` | **0.333** |
| `gapDetection` | **1.00**（47 个 gap case 全部被诚实处理） |
| `installLoad` | **0.3**（计划中约 78% 技能需要安装） |
| `decomposeCapabilityCoverage` | **0.967** |
| `domainMatch` | **0.933** |
| `contextTokens` | mean 131.5 / p50 181 / p95 191 / max 237 |
| `latencyMs` | p50 28.4ms / p95 34.2ms / max 89.1ms（60 条合计 90ms） |
| 错误 | decompose 0 / compose 0 |

### 基线对照（全量）

| 基线 | planCoverage | compositionValidity | capabilityCoverage | hintRecall | gapDetection | installLoad |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| none | 0 | 0 | 0 | 0 | 0 | 0 |
| random | 0.017 | 1.0（结构平凡合法） | 0.289 | 0.017 | 0 | 0 |
| keyword | 0.083 | 0.517 | 0.217 | 0.25 | 0.532 | 0 |

读法：引擎的 planCoverage 约为 keyword 基线的 7.2×、capabilityCoverage 约 3.9×，
gapDetection 为 1.0（keyword 0.532）；但 hintRecall（0.45）只比 keyword（0.25）高，
且 hintStageRecall 只有 0.333，说明「选对具体技能」仍是弱项。`random` 的
compositionValidity=1 是因为它只输出 1 个 stage 的已安装技能，结构上不可能不合法——
合规率只能当护栏，不能单独用来排名。

### `--smoke`（12 条，每领域 1 条）

| 指标 | 数值 |
| --- | ---: |
| planCoverage | 0.50 |
| compositionValidity | 1.00 |
| capabilityCoverage | 0.806 |
| hintRecall | 0.50 |
| gapDetection | 1.0 |
| installLoad | 0.771 |
| decomposeCapabilityCoverage | 0.944 |
| domainMatch | 0.833 |
| contextTokens | mean 174.2 / p50 170 / p95 237 |
| latencyMs | p50 31.5ms / p95 62.0ms |

smoke 的样本小、每领域只取第一条，数字只用于快速回归，不能和全量数字混用。

### 分领域（全量）

| 领域 | planCoverage | capabilityCoverage | hintRecall | gapDetection | 结构不合法 | tokens 均值 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| video | 0.80 | 0.93 | 0.80 | n/a（无 gap case） | 0/5 | 149 |
| office | 0.80 | 0.93 | 1.00 | 1.00 | 0/5 | 185 |
| coding | 0.80 | 0.93 | 0.20 | 1.00 | 0/5 | 193 |
| data | 0.60 | 0.87 | 0.60 | 1.00 | 0/5 | 174 |
| research | 0.20 | 0.73 | 0.20 | 1.00 | 0/5 | 184 |
| marketing | 0.80 | 0.87 | 0.20 | 1.00 | 0/5 | 167 |
| design | 0.40 | 0.73 | 0.20 | 1.00 | 0/5 | 168 |
| security | 0.60 | 0.80 | 0.40 | 1.00 | 0/5 | 209 |
| education | 0.40 | 0.67 | 0.20 | 1.00 | 0/5 | 172 |
| business | 0.20 | 0.73 | 0.40 | 1.00 | 0/5 | 192 |
| productivity | 0.80 | 0.93 | 0.40 | 1.00 | 0/5 | 193 |
| ai | 0.80 | 0.93 | 0.00 | 1.00 | 0/5 | 155 |

结构与覆盖的规律符合预期：已安装技能覆盖 video/office（coverage 0.93）明显好于
research/education（0.67–0.73）；gapDetection 全部 1.0，说明引擎在「装不了的领域」
会报缺口或显式放入需安装技能，而不是假装已安装。hintRecall 的短板集中在 ai（0.00）、
coding/marketing/design/education（0.20）。

## 已知问题（不美化）

1. **hintRecall 偏低（0.45；hintStageRecall 0.333）**：引擎倾向选「能力匹配但名字不相关」的
   library 技能（例如 AI 任务选到通用技能、设计任务选到非设计技能），domain/capability 排序
   压过了「具体技能适配度」。这是 plan 质量的主要短板；AI 领域 hintRecall=0.00，coding/marketing/
   design/education 只有 0.20。
2. **installLoad 0.3**：计划里约 78% 是需安装的 library 技能。对只有 10 条已安装技能的环境
   这是合理的（计划=「装什么」），但 README 引用时必须同时给 installLoad，不能把
   「计划覆盖」说成「已装即可用」。
3. **planCoverage 0.333 不是成功率**：它只表示期望能力是否被计划（含需安装技能）覆盖；
   真实执行还要安装、执行、验收，本基准不测这些。对比 ceiling：只靠 10 条已安装技能，
   理论上限只有 13/60（0.217）——0.333 是「算上建议安装」后的数字，两者不能混读。
4. **上下文成本不低**：plan 的上下文 token 估算 mean 131.5，约是 keyword 基线（6.9）的 26×；
   组合计划换来了覆盖与缺口诚实度，但不是零成本。引用时要一并给出，别只讲收益。
5. **domainMatch 0.933**：仍有约 4/60 用例的 decompose 没把正确领域排进 domains，
   集中在多意图任务（主/次领域竞争）。
6. **结构合法率已是 1.00，但要正确解读**：它只说明 plan 符合契约结构（stage/role/技能标记/
   数量上限），不代表计划质量；random 基线的合法率也是 1.0，因为单 stage 的已安装技能
   在结构上不可能不合法。合规率只能当护栏。

## 局限

1. **半人工、不是线上遥测**：60 条任务由作者编写，分布不能代表真实用户；样本量小，
   单条用例变动会明显改变指标。
2. **能力口径是 benchmark 自定的**：19 个规范 id 是粗粒度标签，`FINE_TO_CANONICAL`
   归一和 10 条已安装技能的能力/领域标注都是手工映射；换一套映射数字会变。它是
   「可复现的评测口径」，不是客观真理。
3. **技能库质量参差**：6,399 条来自公开 GitHub 索引，有重名、弱条目和奇怪命名；
   benchmark 依赖 intel-core 的 capability index 与 quality 字段，索引质量会传导到结果。
4. **已安装集过小**：10 条只覆盖 video/office/coding 三域，导致 47/60 是 gap case；
   这是故意设计的「缺口诚实度」测试，不是真实用户安装画像。
5. **estimate vs measured**：contextTokens 是字符启发式估算；latency 是单机单次墙钟，
   不含 GC/冷启动/并发，不能当生产 SLA。没有统计显著性检验。
6. **不评估执行结果**：不看装完后能不能跑、产物质量、安全性；也不评估理由可解释性、
   用户满意度。`expectedSkillHints` 是「合理候选」，不是唯一正确答案。
7. **基线很朴素**：random/keyword 只用来标定下限，不代表任何真实产品；keyword 基线的
   hintRecall（0.25）与引擎（0.45）已经很接近，说明引擎在「具体技能选择」上优势不大。
8. **引擎是首版（v5.0.0）**：本文数字是 2026-10-29 22:13 快照；引擎继续迭代后必须重跑并更新，
   不要把快照数字永久写进对外物料。

## 复现与更新数字

```bash
cd "/Volumes/Xunji SSD/dsh-ronge-adaptive-skill-archive"
node scripts/benchmark.mjs --json > /tmp/benchmark-full.json
node scripts/benchmark.mjs --smoke --json > /tmp/benchmark-smoke.json
node --test test/benchmark.test.mjs
```

原始 JSON 默认只写 stdout，不落仓库；需要留存时用 `--out /tmp/...`。
更新本文数字时：重跑全量 → 替换「当前结果」表 → 若结构问题/短板变化，同步改「已知问题」，
**不要手改数字去凑好看的结论**。
