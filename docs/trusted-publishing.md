# 启用 Trusted Publishing（npm OIDC）— 一分钟手动步骤

CI 现在用的是 `NPM_TOKEN`（bypass-2FA granular token）。npm 正在收紧 bypass token：2027-01 起不能再直接发布。迁移到 Trusted Publishing 后，GitHub Actions 用 OIDC 直发，不需要任何长期 token。

## 为什么没有自动完成

npm 的包设置页（Trusted Publishing 入口）要求**重新输入账号密码 + 2FA**；自动化无法代替这一步（也不应该代替）。所以这项保留给账号本人完成。

## 步骤

1. 打开 <https://www.npmjs.com/package/dsh-ronge-adaptive-skill-archive/access>，输入 npm 密码。
2. 找到 **Trusted Publishing** / **Trusted Publishers**，选择 **GitHub Actions**。
3. 填写：
   - Repository: `bugtakue/dsh-ronge-adaptive-skill-archive`
   - Workflow file: `publish.yml`
   - Environment: 留空
   - 勾选 **Allow publish**（按需也可勾 stage publish）
4. 保存（可能需要一次 2FA 确认）。

## 启用后改 CI

把 `.github/workflows/publish.yml` 的发布步骤改为 OIDC（可选保留 token 回退）：

```yaml
      - name: publish via OIDC (Trusted Publishing)
        run: |
          npm install -g npm@latest
          npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: ''   # 显式清空，确保走 OIDC
```

并把 GitHub secret `NPM_TOKEN` 删除、在 npm 后台删除对应 bypass token。

## 验证

推一个 patch tag（如 `v2.3.1`）→ Actions 里 `publish` 成功 → registry 出现版本，且 **不再产生 `0.0.0-stage` 占位版本**。

> 当前状态：见 `docs/release-notes-v2.3.0.md`；OIDC 未启用，CI 仍用 `NPM_TOKEN`，功能不受影响。
