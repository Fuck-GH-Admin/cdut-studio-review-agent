# P06 E06｜独立本机 Agent 操作与验收任务书

**执行者**：本机有真实 Electron GUI、授权普通 Pi/Claude 配置和可隔离 profile 的独立 Agent。禁止在云端 CI 无凭据地伪造 LIVE，禁止复制真实账号或凭据到仓库。

## 0. 固定版本与环境

1. 克隆/检出 Draft PR #127 的**最新固定 SHA**（不要直接运行已经推进的 mutable 分支，先固定后冻结），核实 `git rev-parse HEAD` 与 `git status --porcelain`，无本轮之外并行写入；父 #121 `4f8a68e…`，U1 #118 只读。
2. 在独立 test profile 中准备 `config/review-module-settings.json` 的已获授权普通 Pi 选择，`config/agent-workspaces`、Electron user-data 与服务；不要直接使用用户默认 `~/.cdutai` 或 `~/.cdutai-dev`。先检查 CDP renderer 9222（`localhost:5176`）和 Main 9230 确实是**本候选构建**。不能仅因环境变量写对就声称 APP SHA 已验证；保存可重放构建命令、构建产物 hash 和进程 PID。
3. 按仓库已有真实 Electron 启动流程运行；**需独立授权访问本地模型时才调用 Provider**，不得通过通用 GitHub CI、日志、PR 公开 token。
4. 参照如下环境变量配置及受控执行命令，目录请使用安全独立绝对路径，确保固定 SHA 与现场工作树一致：

```bash
export QA_APPLICATION_SHA="$(git rev-parse HEAD)"
export QA_E06_ISOLATED_PROFILE=1
export QA_PROFILE_ROOT="/absolute/path/to/isolated-p06-e06-profile"
export QA_REPORT_DIR="/absolute/path/to/p06-e06-evidence"
bun test scripts/qa/review-live-e06-contract.test.ts
node --check scripts/qa/review-live-e06.mjs
node scripts/qa/review-live-e06.mjs
printf 'E06_EXIT=%s\n' "$?"
```

启动前确保 PID/CDP 与构建快照对应，`node --check` 或 `bun test` 成功**不等于真实 E06 PASS**。若无 Pi 模型/没有 GUI，必须明确 `BLOCKED_ENV`，不触发收费调用。

## 1. E06 本次必测的普通 Pi 四项子矩阵

- **普通会话可见性与 Read**：真实 Main create/list/meta、SDK tool_use `Read`、SDK 返回含随机隔离合成材料标记（不得只看模型自然语言、请求名称）、executor 最终释放；普通列表不得混入 review owner。
- **Write 权限拒绝→允许**：真实 IPC pending 与授权弹窗截图，`deny` 后目标文件绝不能存在，下一次 `allow` 才写入，pending 完全清理；任何不经用户授权的后台代批、学校角色伪造应拒止。
- **运行中 Stop**：真实发送未结束时 stop，Main executor 无残留、SDK 回调不得污染其他普通或内部 owner 会话；保留 PID/事件时间线。
- **只读文本预览与页面切换**：真实 Main 授权读取+Renderer Tab+Shadow DOM 具体文本+返回材料审核页，独立截图（发布前去敏），不得用 body.innerText 或 DOM 容器存在冒充文件实际渲染。

四条全部通过，报告最高也只能是 `E06 PARTIAL`，因为不是所有历史 E06 lane 均已执行。

## 2. E06 尚待各环境独立证据的扩展矩阵

| 场景 | 要求 | 无环境时的结论 |
| --- | --- | --- |
| Claude ordinary runtime | 真 create/list/send/Read/Write 权限/Stop，不从 provider 名称猜 runtime | NOT-RUN |
| 普通 fork / 两窗口 | 新旧 ordinary 会话前后投影、Owner 不泄漏，tab 恢复、预览读回、旧事件延迟重放 | NOT-RUN |
| Windows/macOS | 同一固定候选的原生构建、独立 profile/权限/文件与恢复，多平台不可用 Linux 代签 | NOT-RUN |
| Office / 扫描 PDF / 原件 | 真实预览和读取，严格审核工具另须 `review_inspect_original` + SourceRef 可追溯 | PARTIAL/NOT-RUN |
| 原 A/B/C 完整业务流程 | case/run/assignment/材料版本/人工处置/补件/重审/授权/批次账本一致；C 错误不可改 Gold 求绿 | L02-01 E05 未签收 |
| Relay / Pocket | 真实多 viewer、ticket、独立 Pocket FIFO 后端正反回执 | BLOCKED，仍属 P05/LIVE-06/08 |

## 3. 原始证据和交付

每项至少记录：候选 HEAD/tree、脚本 hash、仓库 dirty、Node/Bun 版本、设备与 OS、独立 profile 路径**脱敏别名**、进程 PID、CDP target、真实 provider/runtime 类别（不包括密钥与 channelId）、每条断言、SDK tool-use 与返回标记的**布尔证据**、Main executor 释放、真实 IPC/截图、command exit，以及 **raw/private 与 public/redacted 分开** SHA-256。

保留所有首败，不覆盖旧失败或截断日志；远端只上传脱敏清单和安全截图。缺省材料、网络、模型、校方授权或原件为 `NOT-RUN/BLOCKED_ENV`；业务正确拒止写 `CORRECT_DENIAL`，不能当 `COMPLIANT`。

## 4. 统一报告格式

每场景 `caseId/testId | sourceSHA | local case/profile alias | state PASS/FAIL/BLOCKED/NOT-RUN | proof path | actual exit | blocker/defect`，并在最后填原 29 台账 LIVE-06/07/08 的**差分建议**，不得直接编辑或改签 29 台账。阶段结论 E06 子集即使全绿也不解除 P06/U1/L02 的合并门禁。

待本机 agent 运行产生真实证据后，再进入验收审查。不得先行自行将 PR #127 合并，也不推进 P07/P08。
