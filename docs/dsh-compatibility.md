# DSH 兼容性与安装边界

测试对象：**DeepSeek Harness Desktop 0.2.1-rc.3**（Web GUI，macOS）。
测试日期：2026-10-29。插件版本：`dsh-ronge-adaptive-skill-archive` 5.0.0。

## 安装方式

```bash
# npm（推荐）
plugin_manager install_bundle target=dsh-ronge-adaptive-skill-archive@5.2.1

# GitHub tag（固定版本、可审源码）
plugin_manager install_bundle target=git+https://github.com/bugtakue/dsh-ronge-adaptive-skill-archive.git#v5.2.1

# 本地目录（开发）
plugin_manager install_bundle target=/absolute/path/to/dsh-ronge-adaptive-skill-archive
```

替换已安装包后，DSH 需要 **restart（重启）** 才会加载新的 Host JavaScript 模块；浏览器端 Client 插件刷新页面即可。仅新装一个尚未启用的 bundle 通常可以通过 HMR 生效，但不要用 slot 未变化来推断新代码已加载。

## 它注册了什么

- Host：`ctx.webServer.register` 下的 `/dsh-ronge-adaptive-skill-archive/*` 路由（含 `/intelligence/plan|compose|draft`、`/health`、`/version`）；`ctx.systemPrompt.section` 注入推荐路由段；`ctx.skills` 读取已安装技能；session 事件用于「正在使用」和完成提示音；`ctx.tools.register` 注册 `skill_archive_plan` / `skill_archive_compose` / `skill_archive_draft_skill`，不提供 install/force 工具。
- Client：`conversation.session.header.utilities` 里的「技能」按钮（id = 包名）；`shell.overlay` 里的右侧抽屉（id = 包名 + `-drawer`）。两者都通过 `ctx.slots.inject` 注册，live Slot 检查显示 active。
- 显示元数据：`locale/en.json` 与 `locale/zh.json` 的 `meta.title` / `meta.description`，`icon.svg`（631 B，< 256 KiB）通过 `exports["./icon"]` 暴露。
- 不导出 Host `Config` schema：所有设置都在面板内，DSH 设置页不会出现 Config 分区；这是有意为之，不是加载失败。

## 数据目录与迁移

- 当前：`~/.dsh/dsh-ronge-adaptive-skill-archive/`
- 自动合并：`~/.dsh/skill-studio/`、`~/.dsh/ronge-adaptive-skill-archive/`
- 旧目录**不删除**；新目录已存在时，按数据丰富度合并 `experience.json`、`evolution.json`、`rec-feedback.json`、`skills-lock.json` 等，旧值不会覆盖更丰富的新值。
- 卸载 bundle 不删除数据目录；重新安装后经验/权重/更新记录仍在。

## 网络与代理

安装/预览/更新远端 `SKILL.md` 时，Host 里 Node 的 `fetch` 在系统代理下可能不可用；实现会读取 `HTTPS_PROXY` / `HTTP_PROXY`，在 macOS 上回退到 `scutil --proxy`，并优先用系统 `curl` 经代理抓取，最后才尝试直连。只允许 `raw.githubusercontent.com/**/SKILL.md`，上限 256 KiB，先扫描后落盘。

## 已验证

- `npm test`：120/120（含 DSH 兼容性静态检查）
- Host E2E：20/20（真实 loopback HTTP + raw.githubusercontent.com）
- UI E2E：27/27
- `npm run check:dsh`：manifest / factory id / slots / routes / 数据迁移 / market index 全部通过
- npm registry 安装 v3.0.0 历史验证；v5.2.1 发布后以 registry 为准；市场索引 format 1 托管在 `https://bugtakue.github.io/dsh-ronge-adaptive-skill-archive/plugin-market.json`

## 已知边界

- 右侧抽屉是自定义 overlay，不是 DSH 原生 rightbar；DSH 大改布局时可能影响位置，需重跑 UI E2E。
- 没有 Host Config schema；DSH 设置页无法直接改插件配置。
- 推荐/检索仍是本地启发式（哈希向量 + 词表 + 信号分），不是神经模型。
- 安全扫描是正则启发式；安装/更新高风险默认拒绝，但不等同于安全保证。
