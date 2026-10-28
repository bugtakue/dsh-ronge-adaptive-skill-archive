# v1.5.0 — 必补五项：安全、更新、推荐评估、经验闭环、UI

> 发布类型：minor｜发布日期：2026-10-28｜对应 tag：`v1.5.0`｜npm：`ronge-skill-studio@1.5.0`
> GitHub Release 标题建议：`v1.5.0 — Safety Radar + Update Center + Recommendation Eval + Experience+`

## 摘要

荣哥技能卷轴收藏馆 v1.5.0 把 28 家竞品调研得出的 5 个「必须补」能力全部落地：**安装前安全扫描与信任分级、更新 diff/全部更新/回滚、可解释推荐 + 离线 Recall@K 评估 + 推荐反馈、跨会话经验统计/健康报告/导入导出、以及完整的面板 UI**。全部纯本地、无新增依赖、无账号体系、数据向后兼容。

## 亮点

### 🛡️ Safety Radar（安装前安全扫描）
- 本地启发式扫描 SKILL.md：shell 执行、`curl | bash`、动态解码（eval/base64/atob）、提示注入语句、网络访问、凭据路径、文件写入、过宽 `allowed-tools`。
- 输出 `low / medium / high` + 命中行号 + excerpt；**不联网、不上传、不执行**。
- 同时给出 `trust`（official / verified / community / local / unknown）与 `license`（frontmatter，缺失为 `null`）。
- 质量：20 条标注语料，高风险召回 8/8、干净样本误报 0/6。

### 🔄 Update Center（更新与回滚）
- `skills-lock.json`：url / repo / sha256 / trust / license / 时间戳 / previousSha256。
- 更新检查返回**内容 diff**（added / removed / changedAtLine / lines）+ 远端 license / risk。
- 新增 `POST /discover/update`（单条）、`/discover/update-all`（全部，单条失败不阻断）、`/discover/rollback`（回滚上一次备份）。
- 覆盖前自动备份到 `~/.dsh/skill-studio/backups/<skill>/`；回滚本身也先备份当前版本。

### 🧪 Recommendation Eval（推荐评估与反馈）
- `reasons` 之外新增结构化 `reasonsDetail`（name / keyword / category / experience + label/detail/weight）。
- 离线金标集 + `npm run eval:recommend`（Recall@K，默认 K=4、阈值 0.75）；当前基线 10/10。
- 推荐反馈：面板「复制 /skill」记 adopt，👍/👎 记 good/bad，写入 `rec-feedback.json`（只统计、不改权重）。

### 📊 Experience+（经验闭环）
- 每 skill 成功率 / 平均耗时 / 连续失败；失败的顶层 turn 记 uses + failureStreak。
- 健康报告：长期不用 / 连续失败 / 从未使用 / 许可证未知。
- 经验导出（version 2）/ 导入（按 entry id 去重、计数取较大值合并）。

### 🎨 面板 UI
- 推荐卡结构化理由 badge、Top 2「建议」chips、复制 `/skill`、👍/👎。
- 技能展开显示 trust / license / 安全等级 + 命中 finding。
- 发现页：更新 diff、单条更新/回滚、全部更新。
- 经验页：统计表、健康列表、导出/导入。
- 修复 HEAD 上「卷轴馆」tab 的 `renderLibrary` 未定义 bug。

## 安装 / 升级

```bash
# npm（v1.5.0 发布后可用）
plugin_manager install_bundle target=ronge-skill-studio@1.5.0

# GitHub（固定 tag）
plugin_manager install_bundle target=git+https://github.com/bugtakue/ronge-skill-studio.git#v1.5.0

# 本地开发目录
plugin_manager install_bundle target=/Volumes/Xunji SSD/ronge-skill-studio
```

- 从 v1.4.x 升级：无需迁移，旧 `experience.json` / 旧安装直接可用；新增文件 `skills-lock.json`、`rec-feedback.json`、`backups/` 会自动创建。
- DSH 插件市场索引：`docs/plugin-market.json`（format 1，官方 validator 校验通过，install target `ronge-skill-studio@1.5.0`）。

## 验证（本仓库实测）

| 项 | 结果 |
|---|---|
| `npm test`（单元 + 路由集成） | 18/18 |
| `npm run check` / `node --check` | 通过 |
| `npm run eval:recommend` | Recall@4 = 1（10/10） |
| Host 端到端（真实网络：install/update diff/rollback/反馈/导入导出/health） | 12/12 |
| 浏览器级 UI（无头 Chrome + 真实 React 18） | 11/11 |
| 安全语料（8 高 / 6 中 / 6 干净） | 高风险召回 100%，干净误报 0% |
| `npm pack` → 临时安装 → import | 通过 |

## 发布检查清单（维护者）

```bash
# 1) 本地确认
npm run check && npm test && npm run eval:recommend
node scripts/build-market-index.mjs          # 更新 docs/plugin-market.json 版本/时间戳
git diff --exit-code -- docs/plugin-market.json || git commit -am "chore(release): market index v1.5.0"

# 2) 打 tag 并推送（触发 .github/workflows/publish.yml）
git tag -a v1.5.0 -m "v1.5.0 — Safety Radar, Update Center, Recommendation Eval, Experience+"
git push origin main --tags

# 3) 若不用 CI，手动发布（官方 registry；本机默认是 npmmirror 镜像，不能发）
npm publish --registry https://registry.npmjs.org --provenance --access public

# 4) GitHub Release：粘贴本文件内容，附 docs/plugin-market.json
```

> 发布前请确认 `package.json` version、git tag、npm version、`docs/plugin-market.json` 版本四者一致；CI 会强制校验 tag/version 与索引是否最新。

## 已知限制

- 安全扫描是启发式提示，**不是安全保证**；静态匹配覆盖不了全部攻击面。
- 更新 diff 是行块 diff（显示第一段变化块），长文件多处改动会合并展示。
- 经验导入采用「计数取较大值」合并，适合换机/共享，不适合双向并发写入的团队。
- 推荐金标集 10 条是自建基线，100% 只代表「无回归」，泛化能力需扩充真实任务后重测。
- `Top 2 chips` 仍在面板内，尚未接入 composer。
