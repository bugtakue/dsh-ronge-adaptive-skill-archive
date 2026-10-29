# 推荐评测：真实任务基准（30 条）

一句话：`test/fixtures/recommend-cases-real.json` 是一组「更像真实用户说法」的半人工金标，
`scripts/eval-real.mjs` 用仓库自己的 `evaluateRecommendations` 离线跑 Recall@4。
它衡量的是「这句任务描述下，top-4 推荐里有没有一个能用的已安装技能」，
**是仓库作者的回归基准，不等于 6,399 条公共技能索引的推荐质量。**

## 为什么从 10 条升级到 30 条

旧的 `test/fixtures/recommend-cases.json`（10 条，`npm run eval:recommend`）是作者自写用例，
句子几乎逐字包含技能关键词（如「用 hyperframes-cli 检查项目然后渲染预览」），
Recall@4 长期是 1.0，但覆盖窄、没有噪声、也没有多意图，很难反映真实会话里用户怎么说话。

新基准的 30 条做了几件事：

- 口语化：带预算、deadline、同事转述、日志现象等噪声，而不是关键词堆砌；
- 多意图：一句话里同时出现两个任务（如「先核对合同，再配个视频」）；
- 中英混写：DSH 用户会自然混用 `docx`、`PPT`、`bundle`、`composition`、`header token` 等；
- 跨类别干扰：视频/Office/Harness 词混在一句里，考察推荐器会不会被次要意图带跑；
- 覆盖视频/动效、Office、Harness 插件、skill 设计、MCP、agent preset、文档校验、跨类别干扰；
- `expect` 允许 1–3 个「本轮可接受」的已安装技能，命中任一即算可用，而不是只认唯一答案。

## 文件与运行方式

| 文件 | 作用 |
| --- | --- |
| `test/fixtures/recommend-cases-real.json` | 30 条金标：`id` / `category` / `context` / `expect` / `note` |
| `scripts/eval-real.mjs` | 读金标 + 技能清单，调用 `evaluateRecommendations`，输出逐条 HIT/MISS、Recall@4、按类别汇总 |
| `test/eval-real.test.mjs` | 断言 ≥30 条、`expect` ⊆ 技能名、脚本 exit 0 且 Recall ≥ 0.8、低阈值时 exit 1 |
| `test/fixtures/eval-skills.json` | 固定 10 条技能清单（与旧基准共用，未改动） |

```bash
node scripts/eval-real.mjs                     # 默认 K=4，阈值 0.8
EVAL_K=4 EVAL_THRESHOLD=0.8 node scripts/eval-real.mjs
node --test test/eval-real.test.mjs            # 或 npm test 一起跑
```

脚本纯本地、无网络、无随机探索（不传经验统计/权重，K 固定 4），同一输入每次结果一致。
`expect` 里出现清单外的技能名会直接失败，防止「编造技能名」把指标做虚。
脚本退出码：`Recall < EVAL_THRESHOLD`（默认 0.8）→ 1，否则 0。

## 口径

- **一条用例** = 一段用户任务描述（模拟用户原话，不含文件内容与会话历史）；
- **HIT** = `expect` 中任意一个技能出现在推荐 top-4；
- **Recall@4** = HIT 用例数 / 总用例数；K=4 是因为面板默认展示前 4 条，`recommendSkills` 内部也最多返回 4 条；
- **技能清单固定**为 `test/fixtures/eval-skills.json` 的 10 条快照，保证离线可复现；不跟随本机实时安装集变化；
- **已知 MISS 保留**：不删除、不改写 context 去「洗」成 HIT，它们用于记录当前真实短板（见下节）。

## 类别分布

| 类别 | 条数 | 主要覆盖技能 |
| --- | ---: | --- |
| 视频/动效 | 7 | `beat-promo-director`、`hyperframes`、`hyperframes-cli`、`media-use` |
| Office 文档 | 6 | `office-docx`、`office-xlsx`、`office-render` |
| 文档校验 | 2 | `office-render`、`office-docx` |
| Harness 插件 | 4 | `cordis-plugin-development` |
| MCP | 2 | `cordis-plugin-development` |
| skill 设计 | 4 | `agent-experience` |
| preset/组合 | 3 | `editing-cordis-compositions` |
| 跨类别干扰 | 2 | 视频 + Office + Harness 词混合 |

## 当前基线

2026-10-29 在 v2.7.2 工作树、`EVAL_K=4`、`EVAL_THRESHOLD=0.8` 下运行：

| 指标 | 结果 |
| --- | --- |
| Recall@4 | **0.9（27/30）**，阈值 0.8（通过） |
| 视频/动效 | 7/7 = 100% |
| Office 文档 | 5/6 = 83% |
| 文档校验 | 1/2 = 50% |
| Harness 插件 | 4/4 = 100% |
| MCP | 2/2 = 100% |
| skill 设计 | 4/4 = 100% |
| preset/组合 | 3/3 = 100% |
| 跨类别干扰 | 1/2 = 50% |

数字会随 `index.js` 的推荐逻辑变化，以 `node scripts/eval-real.mjs` 实际输出为准；不要手改本文档的数字表。

## 已知短板（3 条 MISS，保留不删）

| 用例 | 期望技能 | 现状 | 原因与改进方向 |
| --- | --- | --- | --- |
| `office-02`（会议录音→纪要/周报） | `office-docx` | top-4 为空 | 口语里没有任何 Office 领域词，纯词袋拿不到信号；需要语义/向量召回，或利用会话上下文（文件名、历史消息）补位 |
| `doc-check-02`（英文 slides 打印版式检查） | `office-render` | top-4 为空 | tokenizer 的中文二元组和类别线索都是中文，英文任务零信号；需要英文 token 与英文类别线索 |
| `cross-02`（docx 合同核对 + 30 秒视频） | `office-docx` | top-4 全是视频技能 | 词袋加法下后半句的「转场/片头/音乐/配音」让 4 个视频技能都过 2 分，`office-docx` 只有 2 分被挤出；需要主意图识别、句内权重或类别配额 |

## 局限（必读）

1. **半人工基准**：`context` 是作者按真实使用风格写的，不是线上遥测；措辞和任务分布不代表真实用户总体。30 条样本的统计误差也很大，单条用例变动会明显影响 Recall。
2. **技能清单只有 10 条快照**：不是本机全部已安装技能（本机另有 `office-pptx`、`office-export-pdf`、`moai-workflow-docs-claim-check` 等未进池），更不是 6,399 条公共索引；因此 PPT 类任务只能落到 `office-render` 上，覆盖有限。
3. **推荐器是启发式**：关键词/中文二元组 + 名称/类别/经验加权，不是语义模型。Recall 高很大程度反映「用户用词和技能描述重合」，不能据此宣称推荐「懂语义」。
4. **只看召回**：没有 MRR/NDCG/精确率，不评估推荐理由是否说得通、安全扫描是否拦得住、装完是否真能跑；HIT 仅代表 top-4 里出现了期望技能名。
5. **不含真实会话状态**：一句话 context，没有文件内容、长历史、工具结果；也不评估 10% 探索、经验记忆、自进化、类别亲和这些动态行为（评测固定传空统计）。
6. **阈值 0.8 是回归护栏，不是质量目标**：改推荐器后指标下降，要同时看 per-category 和 MISS 列表；不要通过删除/改写用例让数字变好看。新增用例只能来自真实任务。

## 如何新增用例

1. 追加到 `test/fixtures/recommend-cases-real.json` 末尾，字段：`id`（`<类别>-<序号>`）、`category`、`context`（用户原话，带点噪声更好）、`expect`（1–3 个 `eval-skills.json` 里的技能名）、`note`（为什么是这些技能）。
2. 运行 `node scripts/eval-real.mjs` 与 `npm test`。
3. 保持总数 ≥30、阈值不下调；新增用例照样允许暴露 MISS，但要有真实来源，不要为了「看起来覆盖了」编造任务。
4. 与旧基准的关系：`npm run eval:recommend` 的 10 条作者用例保留作快速 smoke，本 30 条是主回归基准；两者结果不要混算，也不要把本文件说成「6,399 条库的评测」。

---

# 第二部分：6,399 库的 `discover_skills` 基准（v2.8.1）

## 口径

- 用例：`test/fixtures/discover-cases.json`，24 条真实任务式 prompt（中文为主、少量英文），覆盖 video / office / coding / design / data / AI / marketing / research / security / productivity / 跨类别。
- 指标：`Category Hit@5`（top5 里是否出现期望类别）、可选 `Keyword Hit@5`（名称/描述是否出现期望关键词）、结果平均信号分。
- 脚本：`npm run eval:discover`（可调 `--k` / `--min`，默认 0.75 阈值，低于阈值退出码 1）。
- 检索：MCP `discover_skills` 的 256 维本地哈希向量 + 中英概念词表 + 关键词 + 信号分融合；过滤 weak / 重名非最佳 / 信号分 <45。

## 当前基线（v2.8.1）

- **Category Hit@5 = 0.958 (23/24)**（偏松指标：top5 只要有一个类对就算命中）
- **Category P@5 = 0.733**（top5 中属于期望类别的比例）
- **Top-1 category hit = 0.917**
- **Category MRR = 0.938**
- **Keyword Hit@5 = 0.875 (21/24)**
- 结果平均信号分：49.1
- 说明：v2.8.2 加入查询意图类别加权后，严格指标明显上升；但 Category Hit@5 仍偏松，P@5 / Top-1 / MRR 也不能证明技能本身好用。
- 已知 MISS：`marketing-01`（竞品分析 + 定位）——top5 全是 data 类，类别未命中；`office-03`、`coding-03` 类别命中但关键词未命中（PPT 得到 implement-import-export；依赖升级得到 reviewing-changes）。
- 已知 MISS：
  - `ai-01`（写 Claude Code SKILL.md）：top5 给了 coding 类，未命中 ai/writing；
  - `marketing-01`（竞品分析 + 定位）：top5 偏 data/design，未命中 marketing/research；
  - `productivity-01`（会议录音→纪要→周报）：top5 偏 video/ai，未命中 productivity/writing。

## 局限（必读）

1. 仍是半人工基准：prompt 按真实使用风格写，但不是线上遥测；24 条样本误差大。
2. 类别标签来自索引的自动分类，不是人工 quality 标注；Category Hit 只说明「找到了对的类」，不代表技能好用。
3. 信号分含 stars/维护度，热门仓库有偏置；不能把 Hit@5 当质量证明。
4. 向量是哈希 + 词表，不是神经 embedding；同义改写、小语种、隐喻泛化仍弱。
5. 与第一部分（已安装技能 Recall@4）口径不同，不要混算。
