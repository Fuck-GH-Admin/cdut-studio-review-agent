---
path: apps/electron/src/main/lib/agent-permission-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a0a6bb1417429083e0d6e14e4f17fac4ea2ef0e1
sha256: 2ae999ca96211f1904a087e6499f0c3797d5c54989361e838825ea1262b850fd
lines: 447
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-permission-service.ts

## 1. 结论与边界

**Agent 权限服务**（单例 `permissionService`，`agent-permission-service.ts:447`）：实现 canUseTool 回调（SDK query 用）、pending 权限请求管理（Promise+Map 异步等待）、会话级白名单、工具/命令分类（`:1-11`）。参考 Craft Agents OSS 模式（`:10`）。无磁盘/网络（内存状态）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `PermissionUpdate` | 类型 | `:44` | addRules/replaceRules/removeRules/setMode/addDirectories 三形态 | 匹配 SDK 0.2.63（`:43`） |
| `PermissionResult` | 类型 | `:63` | allow{updatedInput?,updatedPermissions?,toolUseID?,decisionClassification?} \| deny{message,interrupt?} | 匹配 SDK 0.2.120（`:62`） |
| `CanUseToolOptions` | 接口 | `:78` | signal/suggestions?/blockedPath?/decisionReason*/classifierApprovable?/toolUseID/agentID?/title?/displayName?/description? | `agentID` 存在=subagent（worker） |
| `AgentPermissionService` | 类 | `:111` | 见 §3 | 状态：pendingPermissions Map（`:113`）、sessionWhitelists Map（`:116`） |
| `permissionService` | 常量 | `:447` | 全局单例 | |

内部：`PendingPermission`（`:93`，resolve+request）、`SessionWhitelist`（`:99`，allowedTools/allowedCommandBases）。

## 3. 内部逻辑与关键流程

- **createCanUseTool**（`:124-193`）决策序：①AskUserQuestion 拦截转 askUserHandler（`:132-134`）；②**subagent（options.agentID 存在）分支**（`:140-163`）——worker 无交互通道：CSLab 工具硬阻断 `deny+interrupt:true`（`:142-147`，文案 "Custom Python tool execution is disabled in non-interactive subagent channels."）；PowerShell/Bash 非只读→deny+interrupt（`:151-158`）；其余 allow；③白名单命中→allow（`:166`）；④只读工具→allow（`:171`）；⑤构建请求发渲染层（`:174-175`）+ Promise pending（`:177-187`），`signal` abort→resolve deny '操作已中止'（`:181-186`）。
- **respondToPermission**（`:196-214`）：`alwaysAllow`→`addToWhitelist`（`:197`）；allow→resolve `{behavior:'allow', updatedInput: pending.request.toolInput}`（`:206-209`；**代码不写 decisionClassification**——该字段仅存在于 `PermissionResult` 类型，未由本服务赋值）；deny→`{behavior:'deny', message}`（`:211-212`）；返回 sessionId 或 null（无此请求，`:213`）。
- **clearSessionPending**（`:219-226`）：该会话 pending 全部 resolve deny '会话已结束' 并删（`:221-224`）。
- **isReadOnlyTool**（`:247-260`）：CSLab 工具永不只读（`:250`）；`SAFE_TOOLS`（shared registry 短名，`:252`）；Bash/PowerShell 走 `isSafeBashCommand`/`isSafePowerShellCommand`（`:256-257`）。
- **isWhitelisted**（`:265-285`）：CSLab 永不（历史白名单也不生效，`:266-267`）；非命令工具按逻辑名（`:273-275`）；命令工具**即使基础命令在白名单也要重新查危险结构**（`:277-282`），键=`${tool}:${baseCommand}`（`:284`）。
- **addToWhitelist**（`:290-305`）：CSLab 不提供持久白名单（防隐式提权，`:291-292`）；命令基础词=前两词（git/npm/bun/yarn/pnpm）或首词（`:327-334`）。
- **buildPermissionRequest**（`:339-364`）：`requestId=randomUUID()`（`:350`）、description、`assessDangerLevel`、SDK 元数据透传。
- **buildDescription**（`:369-418`）：12 工具分支文案（命令截 200 字，`:373,377`）。
- **assessDangerLevel**（`:423-443`）：仅 Bash 的 `isDangerousCommand`→'dangerous'（`:424-428`）；其余一律 'normal'（含 PowerShell，见 §10）。

## 4. 调用者与调用链

- 入向（grep 全树）：`agent-orchestrator`（canUseTool 注入 SDK）、`ipc.ts`（PERMISSION_RESPOND/GET_PENDING_REQUESTS，nb-05 批已读：`ipc.ts:4010-4024,4381`）、`agent-session-manager`（clearSessionPending/clearSessionWhitelist 于会话结束）。
- 出向：`@profer/shared`（SAFE_TOOLS/isSafeBashCommand/isSafePowerShellCommand/isDangerousCommand/hasDangerousStructure/hasDangerousPowerShellStructure/canonicalAgentToolName/isCsLabExecutionTool，`:20-29`，域外）。
- 测试：`agent-permission-service.cslab.test.ts` 3 用例、`agent-permission-service.powershell.test.ts` 4 用例、`agent-orchestrator-permission-wiring.p06.test.ts` 2 用例（真实接线，见 §9）。

## 5. 数据 I/O、读写与副作用

内存两 Map（pending/whitelist）；`sendToRenderer` 回调外发权限请求（副作用归回调方）；无磁盘/网络。白名单生命周期=会话（clearSessionWhitelist `:238-240`）。

## 6. 分支、失败、取消与恢复

- 取消：`signal` abort→deny '操作已中止'（`:181-186`）。
- 恢复：`getPendingRequests()` 供渲染层重载恢复（`:228-233`）；会话结束清理（`:219-226`）。
- 失败：pending 不抛错（全部 resolve）。

## 7. 权限与权威状态

本文件即权限决策核心：
- **CSLab Python 工具**：永不只读放行、永不白名单、worker 硬阻断（三处 `isCsLabExecutionTool` 检查 `:250,267,292`）。
- **subagent/worker**：无交互通道，只读外全拒+interrupt（`:140-163`）。
- 白名单语义：工具级（逻辑名）+命令级（`tool:base`，且每次重查危险结构防绕过）。
- 危险级权威：`assessDangerLevel`（注意 PowerShell 不评 dangerous，§10）。

## 8. 修改影响面

影响全部 Agent 工具执行的放行/审批链路（orchestrator/SDK、ipc.ts 审批通道、渲染层审批 UI）；`PermissionResult` 形状与 SDK 版本绑定（0.2.120，`:62`）；改动需同步 9 个测试用例。

## 9. 测试证据

`NOT_RUN`。直接测试 3 文件 **9 个 `test(`**（逐条）：
- `agent-permission-service.powershell.test.ts`（54 行/4）：主 agent 只读 PS（Get-Location）直放不请求审批（`:14-21`，sendToRenderer 抛错替身断言不触发）；PS 读敏感文件（`Get-Content $HOME\.ssh\id_rsa`）请求审批且 deny 生效（`:23-35`，pending 断言+respondToPermission）；worker PS 变更→deny+interrupt:true（`:37-44`）；worker 只读 PS→allow（`:46-53`）。
- `agent-permission-service.cslab.test.ts`（71 行/3）：'总是允许'不写白名单，二次调用重新排队审批（`:20-44`，requestId 不同）；worker CSLab→deny+interrupt+固定文案（`:46-59`）；只读 `cslab_list_lab_tools` 不受硬阻断→allow（`:61-70`）。
- `agent-orchestrator-permission-wiring.p06.test.ts`（76 行/2，**真实接线**：真实 Orchestrator+PiAgentAdapter 子类 WitnessAdapter+真实 permissionService/会话/渠道，临时 PROFER_CONFIG_DIR，`:10-21`）：auto Write 真实进入 pending、人工 deny 传回 adapter、pending 清空（`:37-55`）；同查询内 Read allow→plan 热切换 Write deny→bypassPermissions 恢复 allow（`:57-75`）。
- mock 边界：前两文件为纯服务直测（无 mock）；p06 用 WitnessAdapter 替身 query，权限链路为真实。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 决策序/白名单/CSLab 三重加固/worker 分支/abort 恢复 | 已证实 | `:124-443` 逐行 + 9 测试互证 |
| **assessDangerLevel 仅 Bash 评 dangerous；PowerShell 危险命令也标 'normal'**（`:424-428` vs `:442`）——与 isWhitelisted 的 PS 危险结构检查不对称，照实记录 | 已证实（不一致存在） | `:423-443` |
| SDK 类型匹配（0.2.63/0.2.120） | 推断（注释声明） | `:43,62`；SDK 本体域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 条 export（PermissionUpdate/PermissionResult/CanUseToolOptions/AgentPermissionService/permissionService）+内部类/方法 | §2/§3 | 32-447 | covered |
| 权限模型 | §7 | — | covered |
| 测试 9 用例（3 文件） | §9 | test 文件 | covered（NOT_RUN） |
