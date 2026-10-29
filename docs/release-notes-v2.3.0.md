# v2.3.0 — MCP prompts/resources + npm 收尾

- MCP：新增 prompts（`recommend` / `skill-workflow`，Claude Code 中为 `/mcp__ronge__recommend`）与 resources（`ronge://experience/summary`、`ronge://library/{name}`、`ronge://skill/{name}`），协议测试覆盖。
- npm 页面 README 已验证正常渲染（2.2.0 起）；`0.0.0-stage` 占位版本已 deprecate。
- Trusted Publishing（OIDC）：迁移步骤已写入 `docs/trusted-publishing.md`；npm 设置页需账号密码 + 2FA，自动化无法完成，CI 暂保留 `NPM_TOKEN`（账号本人 1 分钟可启用，不阻塞功能）。
- 功能等价 v2.2.0 + 上述增强。
