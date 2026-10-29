# Launch Kit：v5.0.0 发布与冲星执行清单

> 目标：让陌生开发者在 30 秒内看懂「这不是又一个技能管理器，而是会拆解、会组队、会造技能、效率可证的 DSH 驾驶舱」，然后愿意试用、反馈、Star。
> 原则：**只写已实现的能力、只引用有证据的数字**。不刷星、不承诺榜单、不写「绝对无漏洞 / 全行业专家 / 效率提升 X%」。所有声明先过 [docs/claims.md](claims.md)。

---

## 1. 仓库元数据（About 栏）

### Description（英文，GitHub About 优先英文，便于搜索）

```
DSH-native skill cockpit for DeepSeek Harness: decomposes a task, composes a skill team, drafts the missing SKILL.md, and keeps efficiency auditable. Local, no telemetry, MIT.
```

### Description（中文备选）

```
DeepSeek Harness 原生技能驾驶舱：拆解任务、给技能组队、按缺口造 SKILL.md 草稿，并提供可复跑的效率与推荐评测。全本地、无遥测、MIT。
```

### Website

- GitHub Pages：`https://bugtakue.github.io/dsh-ronge-adaptive-skill-archive/`（`docs/index.html` 已跳转到 `landing.html`）
- 仓库：`https://github.com/bugtakue/dsh-ronge-adaptive-skill-archive`

### Topics（最多 20 个，按检索价值排序）

```
deepseek-harness  dsh  dsh-plugin  agent-skills  skills-manager
task-decomposition  skill-composition  skill-generation  skill-recommendation
context-aware  adaptive  self-evolving  local-first  benchmark  mit-license
```

> `deepseek-harness` / `dsh` / `dsh-plugin` 是精准检索词；`task-decomposition` / `skill-composition` / `skill-generation` 是 v5 新增差异点；`benchmark` 表明「效率可复跑」。不要加与项目无关的热门 tag，也不要为了搜索加竞品名。

### Social preview（1280×640）

- 左侧：一句话「Plan → Compose → Draft」+ 12 domains 小字；右侧：面板截图（与 README 同款）；
- 图内文字 ≤ 12 个词，中文小字不要进缩略图；
- 不放 star 数、下载量、未经验证的对比结论。

---

## 2. Demo 资产（发布的核心）

### 2.1 45–60 秒 GIF（README 顶部 / X / Reddit 用）

真实录屏，不加速、不剪辑掉等待；若必须剪，标注「部分片段加速」。

| 时间 | 画面 | 字幕（中文） |
|---|---|---|
| 0–6s | 打开会话，点右上角「技能」，抽屉滑出 | 一个面板，三种动作：拆、组、造 |
| 6–20s | 输入任务，调用 `skill_archive_plan`，展示拆解结果 | Step 1：把一句话拆成交付物和子任务 |
| 20–36s | 调用 `skill_archive_compose`，展示阶段表 / 缺口 | Step 2：给任务组一队技能 |
| 36–50s | 调用 `skill_archive_draft_skill`，展示 SKILL.md 草稿 + 安全扫描 | Step 3：缺什么，现场造草稿（不写盘） |
| 50–60s | 收尾：切计划 / 沉浸模式，GitHub 地址 | 本地运行 · 无遥测 · MIT |

### 2.2 90 秒视频（GitHub Release / B 站 / YouTube / 公众号嵌入）

- 0–15s：问题（技能太多，不知道该用哪个 / 怎么组合）；
- 15–75s：GIF 的完整版，加旁白解释「拆解不是执行」「draft 不写盘」；
- 75–90s：效率口径（estimate vs benchmark）+ 安装一行命令 + 开源地址。

### 2.3 静态素材

- `docs/panel.png`：面板主截图（v5 UI 定稿后替换，路径不变）；
- social preview 1280×640；
- 三张流程截图：plan 输出 / compose 阶段表 / draft 预览（放 `docs/` 或 Release 附件，供 README / 帖子复用）。

**素材纪律**：截图里的数字必须是当次真实运行的输出；不要用设计稿假装真实界面；demo 里出现真实任务时，先脱敏。

---

## 3. Release 文案骨架（v5.0.0）

标题建议：

```
v5.0.0 — decompose, compose, draft: the DSH skill cockpit goes beyond recommendations
```

正文 6 段（不要把安装表复制三遍）：

1. **一句话**：v5 把「选技能」升级成「拆任务 → 组队 → 造技能 → 验效率」，全部本地、可复核。
2. **新增**：`skill_archive_plan` / `skill_archive_compose` / `skill_archive_draft_skill`；12 领域包；效率估算与 benchmark harness；面板 UI 更新。
3. **证据**：链接 `docs/claims.md`、`docs/benchmark.md`、`docs/eval.md`；写明哪些是 estimate、哪些是实测、哪些还没测。
4. **升级**：从 v3.x 覆盖安装即可；v1/v2 旧包名需先移除旧 bundle（见 v3.0.0 发布说明）。
5. **验证**：`npm run check && npm test`、`node scripts/eval-real.mjs`、`node scripts/benchmark.mjs`、`npm run check:dsh`，数字以发布当天实际输出为准；当前已生成 60 条 benchmark（planCoverage 0.60、validity 1.00、installLoad 0.782）。
6. **链接**：README / CHANGELOG / claims / attribution / Issues。

**不要写**：未来版本承诺、竞品贬低、「无漏洞」「榜单第一」「全行业专家」「效率提升 X%」。

---

## 4. 短帖（每渠道 1 条，按节奏发布）

### 英文短帖（X；Reddit / HN 用变体）

> Most skill tools stop at "here's a catalog". The hard part is knowing what a task actually needs.
>
> Ronge's Adaptive Skill Cockpit v5 for DeepSeek Harness:
> · plan: decompose a task into deliverables, constraints, sub-tasks, gaps
> · compose: stage 2–5 skills with handoffs, conflicts, fallbacks
> · draft: generate the missing SKILL.md with eval cases + lint + safety scan — never writes or runs it
> · honest efficiency: estimate by default; measured numbers only from a reproducible benchmark
> · 12 domains, 6,399-skill public metadata index, local-only, no telemetry, MIT
>
> Read-only tools: no install/force. Claims & evidence matrix in docs/claims.md.
> Single-host by design (DSH). Feedback welcome — especially "the plan was wrong".
>
> https://github.com/bugtakue/dsh-ronge-adaptive-skill-archive

**Reddit 变体**（r/LocalLLaMA / r/DeepSeek）：开头改成「I built a local skill planner for DeepSeek Harness — here's the benchmark methodology, including what I haven't measured」，结尾明确求批评；不要贴三张以上图。

**HN 变体**：标题克制（"Show HN: Local skill planner/composer for DeepSeek Harness (MIT)"），正文先讲方法（启发式、estimate、benchmark 局限），不贴营销图。

### 中文短帖（即刻 / 小红书；公众号用长文）

> 给 DeepSeek Harness 做了个「技能驾驶舱」：不只告诉你此刻该用哪个 skill，而是**先拆任务，再给技能组队，缺什么就现场造草稿**。
>
> · plan：把一句话拆成交付物 / 约束 / 子任务 / 缺口
> · compose：2–5 个技能按顺序、并行或 review-gate 组队
> · draft：生成缺失的 SKILL.md 草稿 + eval cases + lint + 安全扫描，**不写盘、不执行**
> · 效率：默认 estimate，实测数字只放可复跑的 benchmark
> · 12 领域、6,399 条公开索引、全本地、无遥测、MIT
>
> 不会自动装技能，也不会跑脚本；计划先给你看，确认后再执行。
> https://github.com/bugtakue/dsh-ronge-adaptive-skill-archive

**公众号长文**（1500–2500 字）结构：
1. 问题：技能多了之后，缺的不是货架，是「拆解 + 组队」；
2. 三个动作的真实演示（配 GIF 截图）；
3. 为什么坚持「只出计划 / 草稿，不自动执行」；
4. 效率怎么量：estimate 与 benchmark 的区别、已知局限；
5. 为什么只做 DSH 单宿主；
6. 安装 + 邀请「推荐不准 / 组队不合理」反馈。

### 发帖纪律

- 每个渠道只发一次，24h 内值守回复；被人指出错误时公开修正并更新 `docs/claims.md`；
- 中文帖不机翻成英文重复发；不私信拉 star；不进无关群刷链接；
- 发帖前再核一次链接与数字：**没有 `docs/benchmark.md` 的实测数字，就只写 estimate**。

---

## 5. 分发与收录目标

| 目标 | 动作 | 备注 |
|---|---|---|
| DSH 官方插件市场索引 | 托管 `docs/plugin-market.json` 为 https URL，加入自定义市场 | 发版后 `npm run build:market-index`，CI 会校验索引不过期 |
| npm | tag `v5.0.0` → `publish.yml` 发布（provenance） | 发布后 `@5.0.0` 安装方式才成立 |
| `awesome-dsh` / `awesome-deepseek-harness` | PR 一行条目：名称 + 一句话 + 链接 | 先确认列表存在且接受插件类条目 |
| `awesome-agent-skills` | 若接受「skill 规划 / 管理工具」再提交 | 不是 skill 本体，别硬塞 |
| `awesome-claude-skills` | 慎投：本项目是 DSH 插件 | 仅在列表明确接受通用工具时提交 |
| `awesome-mcp-servers` | 不投：不是 MCP server | MCP 只是跨 agent 入口 |
| skills.sh | 不投：索引对象是经其 CLI 分发的 skill | 不蹭不适用生态 |

> 一个列表只提交一次；被拒记录原因，不重复骚扰维护者。

---

## 6. 发布节奏

| 时间 | 动作 | 产出 |
|---|---|---|
| T-7 天 | 冻结 README / landing / claims；生成 benchmark 与评测数字；统一测试数等冲突（见 claims §E） | 证据链就绪 |
| T-3 天 | 录 demo GIF / 90s 视频；做 social preview；换 v5 面板截图 | 素材就绪 |
| T-1 天 | 核对所有相对链接、安装命令、版本号；Release 文案内审 | 发布检查表全绿 |
| T-0 | push tag → npm publish → GitHub Release → 开 Discussions | Release 可访问 |
| T+0 | 英文短帖（X）；Reddit 或 HN 二选一；中文短帖（即刻 / 小红书二选一） | 首批外部流量 |
| T+1 | 公众号长文；回复所有 issue / 评论 | 反馈闭环 |
| T+7 | 看 referrers / npm 下载 / issue 质量；补投 awesome 列表 | 一页复盘 |
| T+30 | 按真实反馈做下一版（优先修 plan / compose 的错，不加更多技能） | Roadmap 更新 |

> HN 与 Reddit 不要同日连发；公众号与中文短帖错开 1–2 天。宁少发，不发重复内容。

---

## 7. 案例（决定是否被转发的关键）

每个案例按同一模板写，发布在 `docs/` 或 Discussions，并在 README 的「案例」段链接（无案例前不占位造假）：

```md
## 案例：会议录音 → 纪要 + 30 秒宣传片
- 任务（脱敏后的原话）：
- plan 输出：主/次意图、交付物、缺口、被用户改掉的假设
- compose 输出：几个技能、为什么、哪些冲突被提前发现
- draft：造了什么技能、是否最终采用
- 结果：实际交付物 / 耗时 / 返工点
- 效率：estimate 值 + 真实观测值（分开写；没有实测就只写 estimate）
- 用户原话（征得同意后引用）：
```

**案例纪律**：失败案例同样发布（「plan 把主意图判错了，用户手动改了」），这比全成功更能建立信任。

---

## 8. Issue 模板建议

在 `.github/ISSUE_TEMPLATE/` 增加（本任务不改仓库配置，此处只给模板建议）：

1. **Bug**：DSH 版本 / 插件版本 / 复现步骤 / 面板截图 / 相关日志。
2. **Plan wrong（拆解错了）**：原任务、plan 输出、期望的交付物 / 子任务、是否多意图。
3. **Compose wrong（组队不合理）**：阶段表截图、缺失 / 冲突、实际执行结果。
4. **Claim without evidence（声明没证据）**：引用 README / landing 原文、指出缺失的证据、建议措辞——优先处理这类 issue。
5. **Skill draft feedback**：draft 的 SKILL.md、eval cases、lint 结果、是否被采用。

Issue 模板里统一加一句：「请不要粘贴未脱敏的会话内容 / 密钥 / 私有仓库地址。」

---

## 9. 每周 metrics（只看决策相关，不刷）

| 指标 | 来源 | 用途 |
|---|---|---|
| 唯一访客 / referrers | GitHub Traffic | 判断渠道质量，不追总量 |
| npm 周下载 | npm registry | 判断安装转化 |
| demo 完成率（视频完播 / GIF 链接点击） | 平台后台 | 判断「30 秒看懂」是否成立 |
| issue 质量：真实任务 / 声明纠错 / 纯提问 | Issues | 真实任务反馈 ≥ 其他说明产品被用起来了 |
| plan / compose 被用户手动修改的比例 | 案例与 issue 归纳 | v5 质量的核心指标 |
| benchmark 复跑次数 / 外部 PR | GitHub | 效率可证是否被认可 |
| stars | GitHub | **只做背景数据，不做目标、不做考核** |

### 不刷星政策（硬性）

- 不买星、不换星、不用 bot、不注册小号、不群发求 star；
- 不参与「star 互赞」群；不把 star 数写进宣发文案当卖点；
- 不为了「涨得快」发重复内容或标题党；
- 如果发现异常 star 增长，公开说明并不据此宣传；
- **star 是结果，不是目标**；对外只承诺「问题会被回复、声明会被核对」。

---

## 10. 边界（任何材料发布前对照）

1. 推荐 / 检索是**启发式**，不写「AI 智能推荐」「懂语义」。
2. decompose / compose 是**规则引擎**，不写「自动规划保证正确」；必须保留 assumptions / conflicts。
3. draft **不写盘、不执行**；不写「自动生成并安装技能」。
4. 效率默认 **estimate**；没有 `docs/benchmark.md` 的实测数字前，不出现任何百分比。
5. 安全扫描是**启发式提示，不是安全保证**；不写「无漏洞」「已审计」「安全认证」。
6. 6,399 是 **GitHub 公开元数据快照（2026-10-28）**，不是「全网所有技能」，不比数量。
7. 12 领域是**任务路由与覆盖**，不是「全行业人类专家」。
8. 单宿主：只验证 DSH Desktop 0.2.1-rc.3；MCP 是跨 agent 入口，不是多宿主 UI。
9. 不承诺 star 榜 / trending / 榜首；不写「第一」「唯一」除非带统计口径。
10. 所有数字先过 [docs/claims.md](claims.md)；`needs-human` 的声明不得在对外材料里写成既成事实。

---

## 11. 发布前检查清单

- [ ] `README.md` 的版本号 / 安装命令 / tag 与 `package.json`、Release tag 一致
- [ ] README 相对链接可点：`docs/claims.md`、`docs/attribution.md`、`docs/eval.md`、`docs/benchmark.md`、`docs/dsh-compatibility.md`、`docs/cross-agent.md`、`docs/release-notes-v3.0.0.md`、`LICENSE`、`CONTRIBUTING.md`
- [ ] `docs/benchmark.md` 已由脚本生成，README / landing 数字与之逐字一致（或只写「见 benchmark」）
- [ ] `docs/claims.md` §E 的计数冲突已消除（测试数、版本号、stars 口径）
- [ ] `docs/landing.html` 单文件可打开、深浅色、移动端无横向溢出；效率图占位已换成真实数据或保留「待生成」标识
- [ ] demo GIF / 90s 视频 / social preview / panel 截图齐备且无未脱敏内容
- [ ] GitHub About：description + topics + website + social preview
- [ ] Release 正文数字全部来自当天实际输出；未测项明确写「待实测」
- [ ] 短帖链接、数字、措辞再过一遍 §10；确认不刷星
- [ ] 发布后 24h 值守：所有 issue / 评论 48h 内首次回复
