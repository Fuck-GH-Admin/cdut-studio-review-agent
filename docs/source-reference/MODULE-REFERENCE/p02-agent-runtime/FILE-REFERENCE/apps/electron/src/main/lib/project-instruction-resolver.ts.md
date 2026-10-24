---
path: apps/electron/src/main/lib/project-instruction-resolver.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4c69d7a85215eb91904daf6baabd05b1c89b4ade
sha256: 49ef5900cde3f46c0631d24725c75647f206fcfc5ec13629ec97e272b5b835a9
lines: 153
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/project-instruction-resolver.ts

## 1. 结论与边界

**确定性**项目指令解析，不使用 Pi 的 ambient context-file 发现：每目录至多贡献一个文件（Pi 兼容候选优先级），只有项目根内的路径有资格（注释 `apps/electron/src/main/lib/project-instruction-resolver.ts:73-78`）。用户授权的项目根之上**永不遍历**（`:37-38`）。

## 2. 导出与关键符号

`export` 逐条核对：1 个 type + 4 个接口 + 1 个函数 = 6 个导出（类/常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ProjectInstructionKind` | type（导出） | 15 | `'agents'\|'claude'` | |
| `ProjectInstructionSource` | 接口（导出） | 17-27 | `{path,relativePath,scopeRoot,kind,content,contentHash}` | path 为可审计标识（`:18`） |
| `ProjectInstructionDiagnostic` | 接口（导出） | 29-32 | `{path,message}` | |
| `ProjectInstructionManifest` | 接口（导出） | 34-39 | `{projectRoot,sources,diagnostics,totalBytes}` | |
| `ResolveProjectInstructionsOptions` | 接口（导出） | 41-49 | `{projectRoot,targetPath?}` | |
| `resolveProjectInstructions` | 函数（导出） | 84-153 | `(options)=>ProjectInstructionManifest` | 主解析 |
| `INSTRUCTION_FILE_CANDIDATES` | 内部 | 5-10 | AGENTS.md/AGENTS.MD→agents、CLAUDE.md/CLAUDE.MD→claude（优先级序） | |
| `MAX_SOURCE_BYTES`/`MAX_TOTAL_BYTES` | 内部 | 12-13 | 64KB / 128KB | |
| `isWithinRoot`/`sha256`/`instructionDirectories` | 内部 | 51-76 | 相对路径根包含判定；内容 hash；根→目标目录链 | |

## 3. 内部逻辑与关键流程

`resolveProjectInstructions`（`:84-153`）：

1. 根校验：存在且目录，否则抛 `项目根目录不存在或不是文件夹`（`:85-88`）；target 必须 `isWithinRoot`（`relative` 不出 `..`，`:51-53`），越界抛 `项目指令目标路径必须位于已授权的项目根目录内`（`:90-92`）。
2. macOS `/var`↔`/private/var` 别名稳定化：root 取 `realpathSync`，target 保持相对路径（`:93-97` 注释）。
3. 逐目录（`instructionDirectories` 从根到目标目录链，`:60-76`）逐候选（优先级序）：
   - 不存在跳过（`:106`）。
   - 符号链接 realpath 后出根 → 诊断 `已忽略指向项目根目录外的符号链接指令文件`（`:110-114`）；非普通文件 → `已忽略非普通文件的项目指令`；>64KB → `已忽略超过 64 KB 的项目指令文件`；总和 >128KB → `已达到 128 KB 的项目指令总大小上限`（`:119-127`）。
   - 读取成功 push source（relativePath/scopeRoot 统一 `/` 分隔，`contentHash=sha256`，`:129-137`）。
   - 读取异常 → 诊断 `无法读取项目指令: …`（`:139-144`）。
   - **每目录 break**（`:145-148` 注释）：保持 Pi 一候选/目录语义——更高优先级候选无效时**不得**悄悄暴露低优先级 CLAUDE.md。

## 4. 调用者与调用链

入向：`pi-agent-adapter.ts` 的 `projectInstructionFiles`/`projectInstructionScope` 装配（nb-53 手册）；`project-instruction-migration.ts:1` 消费 `ProjectInstructionSource`。测试：本批无专属测试（scope 无 `.test.ts`）。出向：`node:crypto/fs/path`。

## 5. 数据 I/O、读写与副作用

读：`existsSync/lstatSync/statSync/readFileSync/realpathSync`；返回 manifest（内容+hash+诊断）；无写/副作用。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 根不存在/非目录 | 抛错 | 86-88 |
| target 出根 | 抛错 | 90-92 |
| 软链出根/非普通文件/超限 | 诊断+break | 110-127 |
| 读取异常 | 诊断 | 139-144 |
| 高优先候选无效 | 不回落低优先（break） | 145-148 |

无取消概念；恢复=修复文件后重解析。

## 7. 权限与权威状态

- 授权根为唯一遍历边界（`isWithinRoot`）；软链消解防绕过（`:110-114`）。
- 每目录唯一候选（Pi 兼容优先级）为激活权威；诊断如实记录忽略原因。

## 8. 修改影响面

改候选序/限额/根判定影响指令加载与审计；影响 `pi-agent-adapter` 的 `projectInstructionFiles` 与迁移 helper 输入。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

缺口：软链/限额/诊断分支无专属断言证据。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 确定性解析/一目录一候选 | 已证实 | `:73-78,145-148` |
| 软链出根拒绝 | 已证实 | `:110-114` |
| 64KB/128KB 限额 | 已证实 | `:12-13,119-127` |
| macOS 别名稳定化 | 已证实 | `:93-97` |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 类型/常量族 | §2 | 5-49 | covered |
| 主解析 | §3 | 84-153 | covered |
| 目录链/判定 | §3 | 51-76 | covered |
| 断言 | §9,§10 | — | unknown |
