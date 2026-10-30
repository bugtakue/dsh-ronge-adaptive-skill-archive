# Claims & Evidence · 对外声明与证据矩阵

> 核对对象：`README.md`、`docs/landing.html`、`docs/launch-kit.md`、`docs/benchmark.md`。
> 核对日期：2026-10-30（v5.0.0 工作树）；所有数字以脚本输出为准，发布前必须复跑。
> 标签：`verified`（有可指名的文件/命令证据）、`needs-human`（需真实 UI/人工操作确认）、`unsupported`（不得对外使用）。

## 1. 证据快照

| 证据 | 位置 | 版本 / 时间 |
|---|---|---|
| 技能索引 | `library/skills-index.json` | 6,399 条；2026-10-28 快照 |
| 仓库 stars | `library/repo-metadata.json` | 4,007 仓库 / 4,005 有 stars；2026-10-30 快照 |
| 能力画像 | `library/capability-index.json` | 4,808 唯一名 / 6,399 候选；unknown 926；12 域；2026-10-30 生成 |
| 领域包 | `library/domain-packs.json` | 12 领域 × 5 held-out |
| 智能评测 | `test/fixtures/intelligence-cases.json` + `scripts/benchmark.mjs` | 60 条；数字见下 |
| 已安装推荐评测 | `docs/eval.md` + `scripts/eval-real.mjs` | 30 条，v2.7.2 工作树；需 v5 复跑 |
| 库检索评测 | `docs/eval.md` + `scripts/eval-discover.mjs` | 24 条，v2.8.1 工作树；需 v5 复跑 |
| 单元/集成测试 | `npm test` | **129/129 通过**（2026-10-30） |
| Host E2E | `verify/host-e2e.mjs` | **20/20**（含 v5 端点） |
| UI E2E | `verify/ui-e2e.mjs` | **27/27** |
| DSH 兼容 | `docs/dsh-compatibility.md` | DSH Desktop 0.2.1-rc.3；安装/重启/迁移 |

## 2. 可验证声明

### A. 数据事实（文件可核对）

| # | 声明 | 证据 | 标签 |
|---|---|---|---|
| A1 | 6,399 条公开 `SKILL.md` 元数据（2026-10-28 快照），不是全网全部技能 | `skills-index.json.total=6399` | verified |
| A2 | 5,398 条有描述；512 个重名（291 个叫 `skill`），2,103 条在重名组 | 索引统计 | verified |
| A3 | stars 覆盖 4,007 仓库 / 4,005 有 stars，只是信号不是质量 | `repo-metadata.json` | verified |
| A4 | 能力画像覆盖 4,808 个唯一名；926 条 unknown 未编造 | `capability-index.json` | verified |
| A5 | 12 领域、每领域 5 条 held-out，共 60 条 | `domain-packs.json` / `intelligence-cases.json` | verified |
| A6 | 代码 MIT；第三方技能保留原仓库许可，索引只存元数据不存正文 | `LICENSE`、`library/NOTICE.md`、`docs/attribution.md` | verified |
| A7 | 当前版本 5.0.0；npm 发布前 `@5.0.0` 会 404 | `package.json`；npm registry 查询 | needs-human（发版前） |

### B. 能力（需要真实运行确认）

| # | 声明 | 证据 / 复现 | 标签 |
|---|---|---|---|
| B1 | 面板上下文推荐 + 结构化理由；实时「正在使用」 | 真实 DSH 会话；`docs/eval.md` | needs-human |
| B2 | 计划 / 沉浸模式是 prompt 级行为，不是硬约束 | DSH 面板；README | needs-human |
| B3 | 经验记忆、反馈、自进化、10% 探索配额 | `npm test`；真实会话 | needs-human |
| B4 | 安装前本地安全扫描；高风险默认拒绝 | `npm test`；真实安装 | needs-human |
| B5 | 更新 diff / 全部更新 / 回滚 | Host E2E；真实技能 | needs-human |
| B6 | MCP 7 工具（recommend/search/discover/scan/install/record/experience） | `test/mcp.test.mjs` | needs-human（跨 agent 实机） |
| B7 | 三个 DSH 原生工具 plan/compose/draft；无 install/force | `test/intelligence-routes.test.mjs`；真实 DSH 工具列表 | needs-human（发布前 live 验证） |
| B8 | 无遥测；推荐/扫描/学习本地 | 代码走读；无网络调用 | needs-human（可抓包复验） |
| B9 | DSH Desktop 0.2.1-rc.3 兼容 | `npm run check:dsh`；真实 GUI | needs-human（发布前复验） |

### C. 评测数字（只引用脚本输出）

| # | 声明 | 证据 | 标签 |
|---|---|---|---|
| C1 | 智能 benchmark 60 条：planCoverage **0.333**、compositionValidity **1.00**、capabilityCoverage **0.717**、hintRecall **0.45**、gapDetection **1.00**（宽松口径）、contextTokens mean 131.5 / p95 191 | `node scripts/benchmark.mjs`；`docs/benchmark.md` | verified（2026-10-30 快照） |
| C2 | 基线 keyword：plan 0.083 / coverage 0.217 / hint 0.25 / gap 0.532；random 0.017/0.289/0.017/0 | 同上 | verified |
| C3 | **installLoad 0.3**：计划中约 30.0% 技能需先安装；planCoverage 不是成功率、不是已装可用率 | 同上 | verified（必须一起引用） |
| C4 | hintRecall 0.45 是当前短板（AI 领域 0.00，多个领域 0.20）；latency 是机器相关单次墙钟，不作为对外 SLA | `docs/benchmark.md` | verified |
| C5 | 已安装推荐 Recall@4 = 0.9（27/30）、discover Hit@5 0.958 等为旧版半人工基线 | `docs/eval.md` | needs-human（v5 复跑） |
| C6 | 真实任务 A/B（pilot 2 条） | `docs/benchmark-live-pilot.json` + `docs/benchmark-live.md` | **v5.3.2 复跑：brief plugin token 82,092（baseline 50,970），video 136,336（baseline 64,404）；仍不是效率胜利** |
| C7 | Artifact A/B pilot（2 条） | `docs/benchmark-live-artifacts.md` | **plan+全量技能无效率胜利（docx 4.1M/9×）；plan-only 有改善：contract -23% token、xlsx -47% 墙钟，但非双指标全胜** |
| C8 | 12-task A/B | 6 条 artifact/text 样本；meeting plan-only **12.9× token/5.2× 墙钟**；pptx plan-only **+29% token/+36% 墙钟**；contract 单点 -23% token 但更慢；**无一致改善** | **not-achieved**（不能对外写效率提升；需简单任务短路后重测） |
| C9 | 效率提升百分比 | `efficiencyEstimate` 只给 `method:'estimate'`；benchmark 不测真实任务 token 节省 | **unsupported**（禁止写具体百分比） |

### D. v5 新能力（已交付）

| # | 声明 | 证据 | 标签 |
|---|---|---|---|
| D1 | 任务拆解：交付物/约束/领域/主次意图/子任务 | `test/intelligence.test.mjs`；`decomposeTask` | verified（启发式，不是 LLM） |
| D2 | 2–5 技能组队、四种 pattern、冲突/缺口/handoff | 同上 + benchmark validity 1.00 | verified |
| D3 | 生成 SKILL.md draft + lint + 安全扫描，不写盘不执行 | `draftSkill` 测试；`written:false` | verified |
| D4 | DSH 原生工具与 HTTP 端点 | `test/intelligence-routes.test.mjs`；live DSH 工具列表（发布前复验） | verified（静态/集成）→ needs-human（live） |
| D5 | 12 领域 taxonomy + 领域包 | `taxonomy.js`、`domain-packs.json` | verified（元数据映射，不是人类专家认证） |
| D6 | 跨域过滤：不把 video 技能放进合同阶段 | `intelligence.test.mjs` 断言 | verified |

### E. 冲突与时效（发版前检查）

| # | 事项 | 状态 |
|---|---|---|
| E1 | 测试数 55/57 旧冲突 | 已统一为 **129/129**（2026-10-30）；发布前以 `npm test` 为准 |
| E2 | README 版本 3.0.0 | 已改为 v5.0.0；发布前与 package/tag 同步 |
| E3 | 技能条数 vs 仓库数 | 已分开写：6,399 条技能 / 4,007 仓库 |
| E4 | 索引 vs stars 快照日期 | 已分别标注 2026-10-28 / 2026-10-30 |
| E5 | capability generatedAt 年份 | 已重建为 2026-10-30；发布前再确认 |

## 3. 明确不能证明（禁止对外宣称）

| 声明 | 原因 | 可替代表述 |
|---|---|---|
| GitHub stars 榜首 / 增长第一 | 不可控、受曝光影响、本仓库未做榜单实验 | 「值得 star 的 DSH 原生插件，欢迎反馈」 |
| 绝对无漏洞 / 零风险 | 正则扫描 + 启发式；威胁模型有边界 | 「本地启发式扫描；高风险默认拒绝；不构成安全保证」 |
| 全行业人类专家 / 12 领域专家 | 领域来自元数据映射，无人类盲评 | 「12 领域任务路由与组合，有可复跑基准」 |
| AI 懂语义 / 神经推荐 | 本地词法/哈希向量/规则 | 「本地启发式 + 可解释理由」 |
| 效率提升 X% | 只有 estimate；没有真实 A/B | 「效率估算；benchmark 指标见 docs/benchmark.md」 |
| 推荐准确率 90% | 30 条半人工、10 条技能快照的回归指标 | 「半人工评测 Recall 见 docs/eval.md」 |
| 6,399 个都能装 / 都优质 | 索引含弱条目、重名、无人工标注 | 「6,399 条元数据索引；安装前预览」 |
| 跨平台/全宿主 | 只验证 DSH 0.2.1-rc.3；MCP 另入口 | 「DSH 原生；MCP 可接入其他 agent」 |

## 4. 发布前复跑清单

```bash
cd "/Volumes/Xunji SSD/dsh-ronge-adaptive-skill-archive"
npm test
node scripts/benchmark.mjs --json
node scripts/eval-real.mjs
node scripts/eval-discover.mjs
npm run check:dsh
npm pack --dry-run --json
# 真实 DSH：安装 5.0.0 → 重启 → 工具列表/面板 plan-compose-draft → 卸载/重装数据保留
```

发版前以实际输出更新 §1/§2 的日期与标签；不达标就删数字，不改阈值凑数。
