# v1.6.1 — 用户反馈修复（卷轴馆、会话切换、中文简介）

> 发布类型：patch｜发布日期：2026-10-28｜tag：`v1.6.1`｜npm：`ronge-skill-studio@1.6.1`

## 修了三个用户报告的问题

1. **点「卷轴馆」之后面板没了、再点右上角按钮也打不开**
   - 原因：`renderLibrary` 定义在错误组件内，`SkillDrawer` 引用不到，点击抛 `ReferenceError`，React 把整棵抽屉卸载，按钮状态也一起失效。
   - 修复：渲染逻辑移入 `SkillDrawer`；新增 `DrawerErrorBoundary`，任何 tab 异常都只在抽屉内显示「重试 / 关闭」，不再牵连面板按钮。
2. **切换不同对话，推荐还是同一批**
   - 原因：`SkillButton` 只在点击按钮那一刻写入 `sessionId`；切换会话后 store 仍是旧会话，抽屉轮询也一直用旧 id。
   - 修复：`SkillButton` 监听 `sessionId` prop 变化并同步到 store，抽屉按新会话重新拉 catalog。
3. **中文界面下技能没有简洁中文简介**
   - 原因：catalog 用「会话上下文」推断语言，而上下文中项目文件名（英文）会把判定压成 `en`；未知技能则直接回退英文 description。
   - 修复：catalog 优先使用面板 locale（`lang=zh|en`）；新增中文兜底简介（「类别」技能 + 关键词 + 原文截断）；卷轴馆返回中文 `categoryLabel` 与本地化 `intro`；补 15 条 Anthropic 官方技能人工中文简介。

## 验证

| 项 | 结果 |
|---|---|
| 单元 + 路由 | 27/27 |
| Host E2E | 16/16 |
| 浏览器 UI | 15/15（新增：卷轴馆渲染中文简介、A→B 会话切换请求） |
| 推荐评估 | Recall@4 = 1（10/10） |
| 市场索引 | format 1 通过，target `ronge-skill-studio@1.6.1` |
| 真实 GUI | 切换 desktop profile 到本版后实测（见 `09`/`10` 记录） |

## 升级

```bash
# 同一 profile 不能与旧 bundle 同时启用：先禁用/移除旧 bundle
plugin_manager set_bundle target=ronge-skill-studio-v16 enabled=false
plugin_manager install_bundle target=ronge-skill-studio@1.6.1
# 或本地目录
plugin_manager install_bundle target=/Volumes/Xunji SSD/ronge-skill-studio
```

> 若 profile 的 `cordis.patch.yml` 里还残留 `- id: ronge-skill-studio / disabled: true`，需删掉该覆盖后重启会话（HMR 会应用）。
