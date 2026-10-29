# v2.1.2 — 首次 npm 发布

- ✅ 已发布到 npm：`dsh-ronge-adaptive-skill-archive@2.1.2`（MIT，公开，带 GitHub Actions provenance）。
  - 安装：`npm i dsh-ronge-adaptive-skill-archive` 或 `plugin_manager install_bundle target=dsh-ronge-adaptive-skill-archive@2.1.2`
  - 页面：https://www.npmjs.com/package/dsh-ronge-adaptive-skill-archive
- README 主截图改为 GitHub raw 绝对地址，加 npm 版本 badge。
- GitHub Actions `publish` 已配置 `NPM_TOKEN`；后续 tag 会自动发布（无 token 时优雅跳过）。
- 注：首次发布经由 npm staged-publishing 流程（bypass-2FA granular token 的新限制），包内 README 已在 registry 元数据中；npm 网站 README 渲染偶有延迟（npm/cli#7967），刷新/等待即可。
- 功能等价 v2.1.1。
