# v2.0.0 — Rename to dsh-ronge-adaptive-skill-archive

> 发布类型：major（破坏性重命名）｜发布日期：2026-10-28｜tag：`v2.0.0`｜npm：`dsh-ronge-adaptive-skill-archive@2.0.0`

## 变更

本版把包名/仓库统一为 **`dsh-ronge-adaptive-skill-archive`**（只影响安装标识，产品名不变）：

| 项 | 旧 | 新 |
|---|---|---|
| npm 包 / 仓库 | `ronge-skill-studio` | **`dsh-ronge-adaptive-skill-archive`** |
| client factory id / cordis bundle id | `ronge-skill-studio` | **`dsh-ronge-adaptive-skill-archive`** |
| HTTP 路由前缀 | `/skill-studio/*` | **`/dsh-ronge-adaptive-skill-archive/*`** |
| locale scope / system-prompt section | `skill-studio` | **`dsh-ronge-adaptive-skill-archive`** |
| 数据目录 | `~/.dsh/skill-studio/` | `~/.dsh/dsh-ronge-adaptive-skill-archive/`（首次启动自动复制旧目录，旧目录保留） |
| 中文 / 英文产品名 | 荣哥技能卷轴收藏馆（可沉浸式体验版本） / Ronge's Adaptive Skill Cockpit | 不变 |

已安装 skill 的 `.skill-studio-source.json`、`~/.dsh/skills/` 目录不变，升级后仍可识别与更新。

## 安装 / 升级

```bash
# 旧 bundle 先移除（同一 profile 不能同时启用两个同名路由的版本）
plugin_manager remove_bundle target=ronge-skill-studio

# 安装新版（npm 发布后可用）
plugin_manager install_bundle target=dsh-ronge-adaptive-skill-archive@2.0.0

# 或本地目录
plugin_manager install_bundle target="/Volumes/Xunji SSD/dsh-ronge-adaptive-skill-archive"
```

## 兼容性说明

- 旧数据目录会在首次启动时**复制**到新目录（不删除旧数据），经验/自进化/反馈/lock/备份全部保留。
- 旧路由 `/skill-studio/*` 不再注册；如果外部有脚本调用旧接口，需要同步改为新前缀。
- 旧包名在 npm 上从未发布，不存在同名冲突；新包名已确认可用（registry 404）。

## 验证

- `npm test` 27/27；`npm run check` 通过（factory id = 新包名）
- Host E2E（真实网络 + 新路由）16/16
- 浏览器 UI（真实 React + 新路由 mock）15/15
- 插件市场索引 format 1 校验通过，install target `dsh-ronge-adaptive-skill-archive@2.0.0`
