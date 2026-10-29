# v2.6.4 — 修复 npm latest 指针

- 发布工作流发布后显式执行 `npm dist-tag add` 指向当前版本，避免并行 tag 把 latest 留在旧版本。
- 功能等价 v2.6.3（discover 修复 + 技能/卷轴馆/更新三 tab）。
