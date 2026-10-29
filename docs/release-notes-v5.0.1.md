# v5.0.1 — 扫描器绕过修复

- 全文化安全扫描：修复跨行续行、CRLF、超长空白 padding 的 pipe-to-shell 绕过；保留长行检测；补 4 条回归测试。
- 索引刷新 raw 抓取 `redirect:'error'`；MCP bin 支持 npm `.bin` 符号链接启动。
- 测试 119/119。
