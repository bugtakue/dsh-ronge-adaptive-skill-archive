# 60 秒 Demo 脚本（v5.4.2，真实数据版）

成品：`docs/demo-60s.mp4`（1920×1080, 60s, H.264, 无旁白/有静音音轨；录屏页 `docs/demo.html`）。

> 目标：60 秒内让人看懂「拆任务 → 组队 → 造技能 → 看真实 A/B」。
> 不虚构数字；画面里的计划/草稿来自 live 5.3.3 或仓库内真实数据。

## 0–5s｜问题

- 画面：DSH 会话右侧「技能」抽屉。
- 文案：「你的技能很多，但此刻该用哪个？怎么组队？缺的怎么办？」
- 旁白：不是更大的技能库，是更懂当前任务的技能驾驶舱。

## 5–20s｜现场拆解一个真实任务

- 输入：`帮我把这份 docx 合同逐条核对，另外配一段 30 秒宣传视频`
- 点击「完整组合」，展示：
  - `installedCount=17`、`installedSource=scan+registry`
  - 主阶段 `office-docx`，次阶段 `beat-promo-director/hyperframes/media-use`
  - 每个阶段有 input/output/handoff/**acceptance**
  - `missing=[]`，`reviewGap=true`（诚实说明没有独立 reviewer）
- 旁白：先用自己的技能，缺口才给安装建议；不假装已复核。

## 20–30s｜已装优先

- 对比截图/数字：早先 plan+全量技能 4.1M tokens；现在是 plan-only。
- 展示 `loadPolicy: one-at-a-time`、stage 最多 2 技能。
- 旁白：技能不会默认全量加载；需要时只加载当前阶段那一个。

## 30–40s｜造一个新技能

- 打开「生成技能草稿」，输入「做一个合同条款比对技能」。
- 展示 draft：`business-contract-review`、lint ok、quality 100/A、safety low。
- 旁白：缺口不是丢给用户，而是生成可审阅的 SKILL.md；确认前不写盘。

## 40–52s｜真实 A/B，不吹

- 表格：
  - contract plan-only：458,980 → 352,580 tokens（-23%），但墙钟 52.7 → 70.7s（+34%）
  - xlsx：token +6%，墙钟 37.1 → 19.7s（-47%）
  - plan+全量技能：4,135,674 tokens（失败案例）
- 旁白：plan-only 有改善，但不是全面胜利；所以不写“效率提升 X%”。

## 52–60s｜CTA

- 文案：「装它：`plugin_manager install_bundle target=dsh-ronge-adaptive-skill-archive@5.3.3`」
- 「GitHub: bugtakue/dsh-ronge-adaptive-skill-archive」
- 「真实 A/B 原始数据在 docs/benchmark-live-artifacts.md」

## 拍摄清单

- 60s 横屏 1920×1080；字幕烧录。
- 画面只展示真实 UI/真实 API 返回；不 P 图改数字。
- 若某项未复跑（如 npm 5.3.3 传播延迟），画面标注「本地/发布中」，不能假装已发布。
