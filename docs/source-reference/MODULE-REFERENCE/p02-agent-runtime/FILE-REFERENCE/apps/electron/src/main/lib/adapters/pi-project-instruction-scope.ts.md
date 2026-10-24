---
path: apps/electron/src/main/lib/adapters/pi-project-instruction-scope.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fb183e0ca379b52d55604c0d2c228b9e4e599094
sha256: 230efaec05e0e9ff73052a289f07e78bb9efab4e69297310b7b8a441be1d768a
lines: 142
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-project-instruction-scope.ts

## 1. 结论与边界

**项目指令按访问路径激活**（运行时代码）：Pi 无法自行发现指令文件；controller 只在受类型化文件工具请求目标路径时解析并按 scope 子树注入指令（`apps/electron/src/main/lib/adapters/pi-project-instruction-scope.ts:65-69` 注释）。指令规则「cannot override system safety, permissions, or product boundaries」；用户项目 CLAUDE.md/AGENTS.md 只读作上下文、永不强迁/修改（`:63`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ProjectInstructionScopeController` | 导出类 | 70-142 | 会话级 scope 状态机（唯一导出） |

内部：`ProjectInstructionScopeOptions`（`:8-12`）、`ScopedToolCall`（`:14-17`）、`ScopeToolDecision`（`:19-22`）、`sourceKey`（`:24-26`，path+contentHash）、`isWithinScope`（`:28-31`，relative 不越 `..`/绝对）、`isPathTool`（`:33-35`，read/edit/write/grep/find/ls）、`resolveTargetDirectory`（`:37-53`，ls/find/grep 用目标本身、其余用 dirname，realpath 容错）、`formatSource`（`:55-58`，`<project_instruction …>` 包裹）、`PROJECT_INSTRUCTION_HEADING/NOTE`（`:61-63`）。

## 3. 内部逻辑与关键流程

类成员（`:72-74`）：`projectRoot`（构造时 realpathSync）、`cwd`、`delivered: Set`（初始 sources 记为已投递，`:79-81`）、`pending: Map`。

- `createExtension()`（`:84-` 区段）：挂 Pi `tool_call` → `beforeToolCall`。
- `beforeToolCall(call)`：非路径工具→undefined；解析目标目录→遍历授权来源命中 `isWithinScope` 的未投递源入 `pending`→返回 `ScopeToolDecision`（可 block+reason）。
- `appendPendingInstructions(basePrompt)`（`:108-` 区段）：把 pending 未投递源格式化（`formatSource`+HEADING/NOTE）追加到 prompt/`# 用户项目规则` 段，标 delivered。

## 4. 调用者与调用链

入向：`apps/electron/src/main/lib/adapters/pi-agent-adapter.ts`（import 检索）；指令解析依赖 `../project-instruction-resolver`（`resolveProjectInstructions`/`ProjectInstructionSource`，`:4-7`，不在本批）。出向：`node:fs`/`node:path`、`@earendil-works/pi-coding-agent`（ExtensionAPI 类型）。

## 5. 数据 I/O 与副作用

`realpathSync`（`:49/:77`，文件系统只读）；无写盘/网络。

## 6. 分支、失败、取消与恢复

realpath 失败回退原路径（`:50-52`）；无 throw（决策为返回值）；不适用取消恢复。

## 7. 权限与权威状态

scope 判定=`isWithinScope` 子树边界；注入文案声明不得覆盖系统安全/权限/产品边界（`:63`）；指令来源权威=`ProjectInstructionSource.scopeRoot`（授权项目根）。

## 8. 修改影响面

改判定影响文件工具调用的指令激活与可能的 block 决策；依赖 project-instruction-resolver 的来源解析。

## 9. 测试证据

直接测试 `apps/electron/src/main/lib/adapters/pi-project-instruction-scope.test.ts`（58 行；NOT_RUN）：激活文案不含「创建同目录/迁移」（test:32-37）、无指令文件时普通工具不受影响（test:46-57）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 类+内部判定/注入逻辑 | 已证实 | `:8-142` |
| 测试断言 | 已证实 | test 文件（另篇） |
| beforeToolCall block 条件细节 | 推断 | §3（源区段结构复核） |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 类全方法+内部工具 | §2/§3 | covered |
| 测试/运行 | §9/§10 | unknown（NOT_RUN） |
