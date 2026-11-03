# HarnessMM 原则：确定性执行复用

来源：用户提供的公众号文章《DeepSeek Harness被清华和微软联手「瘦身」！token省87.93%，成功率反涨14%》
<https://mp.weixin.qq.com/s/EBudTthtKFQuSbl1qO0tIg>（外部文章，仅作背景；数字需回到论文/复现验证）

## 核心思想

传统 ReAct harness 在每次工具返回后都重新让模型推理“下一步”。但很多下一步在首次规划时已经确定，工具反馈只是确认条件。

HarnessMM 拆成三部分：

1. **EDG（可执行决策图）**：慢思考时把后续动作、精确参数、依赖和 guard 一次写好；
2. **GDR（守卫决策复用）**：工具回执满足 guard 时直接执行缓存动作，跳过 LLM 回调；不确定时回到模型；
3. **CCS（认证回调替换）**：记录每次跳过，形成可审计的证书/日志。

## 文章报告的边界

- 87.93% token 降幅是整套配置（含上下文管理和收尾规则）的结果，消融里核心机制大约 20%–27%；
- 基线本身偏弱，成功率提升空间大；
- 部分基准变差（如 Terminal-Bench 2.0 开发任务）、数学类任务 token 反而增加；
- 接入真实框架需要公开状态适配器，不是零成本；
- 本仓库**没有复现论文**，不把文章数字当自己的 benchmark。

## 在本仓库的落地方式

- 写入 `skills/dsh-skill-cockpit/SKILL.md` 的“确定性执行契约”；
- 只对确定性工具链使用；
- guard 不成立/证据不足时立即回到模型；
- 执行参数不可变；记录跳过审计；
- 不承诺固定 token 节省比例，需用真实 A/B 验证。

## 设计原则

- **省 token 的前提是安全**：不能为了跳过模型而跳过校验；
- **只缓存确定性**：语义不确定的任务不做；
- **可审计**：每次跳过可追溯；
- **可回退**：guard 失败就回模型，不静默执行错误动作。

## 参考

- 文章 URL（用户提供，外部内容）
- 文章称论文/代码：`YuhuaJiang2002/HarnessMM`，Apache-2.0；arXiv 2610.32813（未在本仓库独立验证）

## 本仓库 pilot（2026-11-03）

强制在简单任务上加载本 skill 做 A/B，结果**不支持“省 token”**：

| 任务 | baseline | 强制 skill arm |
|---|---|---|
| 新建 sum 实现 + 测试 | 135,174 tok / 5 calls / 10.5s | 258,308 tok / 8 calls / 25.9s |
| 修复已失败 sum 测试 | 214,866 tok / 7 calls / 10.3s | 299,938 tok / 10 calls / 21.7s |

两次都是 skill arm 更高 token/更慢；但这两条是**简单任务**，按本 skill 规则本来就不该加载 skill，因此不能据此评价复杂确定性链。

结论：
- 仅把论文原则写成 skill 指令**无法复现 87.93%**；真正的跳过模型回调需要 harness 级执行器，不是技能提示；
- 目前只作为**实验性指导**保留，简单任务不要用；
- 下一步若要做，应实现插件级 guarded executor，并在复杂确定性任务上做 A/B。

## guarded runner 原型 A/B（2026-11-03）

`scripts/guarded-runner.mjs`：只允许 `node --test tests/*.test.mjs`，无 shell、无写文件，最多 8 步；一次工具调用执行整条确定性测试链。

| 任务 | baseline（一条 bash 循环/多步） | guarded runner |
|---|---|---|
| 3 个测试文件 | 79,130 tok / 4 calls / 5.1s | 81,456 tok / 2 calls / 7.7s（+3%） |
| 8 个测试文件 | 106,392 tok / 3 calls / 6.7s | 82,326 tok / 2 calls / 5.1s（**-22.6%**） |

结论：
- 短链没有收益；长链出现约 22.6% token 下降和更快墙钟；
- 但 baseline 本身用了一条 bash 循环，所以这不是“跳过 7 次模型回调”的证据；`modelCallbacksAvoided` 是理论值；
- 值得继续做**受控的** guarded executor，但不值得直接做成任意命令执行器；需要更多任务/失败重试验证。

## 已吸收：`skill_archive_guarded_run`（v5.8.1）

原型已验证长链有价值，因此作为**可选的原生工具**吸收：

- 一次工具调用执行最多 8 个 `tests/*.test.mjs`；
- 只允许 `node --test`，无 shell、无写文件；
- 每步 guard（默认 exit code 0），失败停止；
- 返回 pass/fail、stderr 摘要、`modelCallbacksAvoided`；
- 仅限可信工作区；不是任意命令执行器。

边界：它减少“多次测试调用 + 中间模型回调”的开销，但不复现论文的 87.93%，也不适用于语义不确定任务。
