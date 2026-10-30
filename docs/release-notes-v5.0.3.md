# v5.0.3 — installed 输入合并修复

- `resolveInstalledSkills` 同时合并磁盘扫描与 DSH registry，修复 agent-scoped registry 只返回部分技能、漏掉本机 office/video 技能的问题。
- live 计划优先使用本机已安装技能；诊断显示 `installedSource=scan+registry`。
- 测试 119/119。
