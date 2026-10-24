---
path: apps/electron/src/main/lib/migration-service.runtime-artifacts.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1aa549b3ffaaf6e6058ce89a3257bd8fb9b21178
sha256: 263dad34ef33ced0e7d47a87dd140d83199612879915b793008a1dbc50c047a1
lines: 189
kind: test
package: p01-app-shell
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/migration-service.runtime-artifacts.test.ts

## 1. 测试目标

`migration-service` 的 runtime artifacts（Pi 原生 transcript）导出/导入链路（189 行，bun:test，describe `'migration runtime artifacts'` `:58`）：①选中会话的 Pi transcript 入 zip 且 manifest 记录 runtime 元数据、未选中不导出；②导入映射工作区后重绑 `piSessionFile` 并改写 cwd；③`__testRewriteRuntimeCwd` 只改合法 JSONL 行；④`__testSdkProjectKey` 稳定/有界/后缀格式；⑤`parseImportFile` 暴露 runtimeArtifacts 清单且不动源文件名。**mock 边界**：本文件**无 `mock.module`**（`import` 全部为真实模块：`agent-session-manager`/`agent-workspace-manager`/`migration-service`/`config-paths`，`:6-19`）；真实写临时目录与 zip（AdmZip `:5`）；不碰真实 Electron GUI。

## 2. 用例清单

前置/清理（`:21-56`）：保存原 `PROFER_CONFIG_DIR`（`:21`）；`beforeEach` 每例 `mkdtempSync` 新 root 并设 `PROFER_CONFIG_DIR`（`:53-56`）；`afterEach` 恢复原值并 rmSync root/secondaryRoot（`:44-51`）。辅助：`writeJson`/`writeJsonl`（`:25-33`）；`createSession(runtime, sdkSessionId)`（`:35-42`）——建 workspace+session（runtime:'pi'）、`updateAgentSessionMeta` 写 sdkSessionId、写 messages jsonl。

| # | 用例 | 行 | 设置 | 动作 | 断言 |
| --- | --- | --- | --- | --- | --- |
| 1 | exports selected Pi native transcripts and records runtime metadata | 59-99 | 3 个 pi 会话（first/second/skipped）+ 3 个 `getSdkConfigDir()/sessions/pi/*.jsonl` transcript | `exportDataV2({mode:'personal', components:['sessions'], sessionIds:[first,second]})`；AdmZip 检查 | 见 §3 |
| 2 | imports Pi artifacts into mapped workspaces and rebinds Pi metadata | 101-145 | 2 会话+2 transcript；导出后切 `secondaryRoot` 为新配置根 | `parseImportFile` + `confirmImport({tempDir, manifest, pathMappings:{}})`；读 `getAgentSessionsIndexPath()` | 见 §3 |
| 3 | rewrites cwd on every valid runtime JSONL record without changing malformed lines | 147-157 | 手写 3 行 jsonl（2 合法 + `not-json`） | `__testRewriteRuntimeCwd(filePath, 'C:/new/session')` | 见 §3 |
| 4 | uses a stable bounded SDK project key for long paths | 159-167 | 超长路径（`'nested/'.repeat(80)`） | `__testSdkProjectKey` ×2 | 见 §3 |
| 5 | parseImportFile exposes a runtime artifact manifest from the generated archive | 169-188 | 1 会话+1 transcript；导出 | `parseImportFile(outputPath)` | 见 §3 |

声明合计 **5 test / 0 it**（机械计数）。依赖顺序：每例独立 temp root；用例 2 在导出后切换配置根（`secondaryRoot`）再导入，依赖 `confirmImport` 的动态 import（`:125`）。

## 3. 真实断言

- 用例 1（`:92-98`）：`names` `toContain('runtime/pi/pi-export-id.jsonl')`、`toContain('runtime/pi/pi-export-secondary-id.jsonl')`；`manifest.runtimeArtifacts?.piSessions` `toEqual([expect.objectContaining({sessionId:'pi-export-id', runtime:'pi'}), …'pi-export-secondary-id'…])`；`names` `not.toContain('sessions/agent/<skipped.id>.jsonl')`。
- 用例 2（`:137-144`）：`importedFirst?.agentRuntime` `toBe('pi')`；`piSessionFile` `toBe(join(getSdkConfigDir(),'sessions','pi','pi-import-id.jsonl'))`；`existsSync(piSessionFile)` `toBe(true)`；transcript `cwd` `toContain(secondaryRoot)`（`:141`，cwd 被改写进新 root）；second 同断言（`:142-144`）。
- 用例 3（`:154-156`）：`lines[0].cwd` `toBe('C:/new/session')`；`lines[1]` `toBe('not-json')`（坏行原样）；`lines[2].cwd` `toBe('C:/new/session')`。
- 用例 4（`:164-166`）：`first` `toBe(second)`（稳定）；`first.length` `toBeLessThanOrEqual(240)`（有界）；`first` `toMatch(/-[0-9a-z]+$/)`（短哈希后缀）。
- 用例 5（`:183-187`）：`preview.manifest.runtimeArtifacts?.piSessions` `toEqual([expect.objectContaining({sessionId:'pi-preview-id', runtime:'pi'})]`)`；`existsSync(outputPath)` `toBe(true)`（导出源文件不被删）；`basename(outputPath)` `toBe('preview.profer-backup')`（源文件名不改）。

## 4. 未覆盖与脆弱点

- **未覆盖**：claude runtime 的 `_addRuntimeArtifacts`/`_importRuntimeArtifacts` 分支（仅 pi）；`_rewriteRuntimeCwd` 整体失败静默路径；`_sdkProjectKey` 短哈希冲突行为；manifest 缺 runtimeArtifacts 字段的旧档案；导入冲突（目标已存在 transcript 不覆盖）。
- **脆弱点**：`importedFirstTranscript` 用 `JSON.parse(readFileSync(…).trim())` 读整文件（`:140`，若 transcript 多行会抛错——本用例单行）；用例 3 断言依赖 `\n` 行拆分（`:153`）；`createAgentSession`/`createAgentWorkspace` 为真实实现（跨批），其字段演进会影响 fixture。
- 断言≠运行：本轮 `NOT_RUN`，bun test 未执行，通过状态未知。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 用例设置/动作/断言如上；无 mock.module | 已证实 | `:1-189` 全文逐行 |
| 声明计数 5 test/0 it | 已证实（机械计数） | grep `test(`/`it(` |
| piSessionFile 重绑目标路径格式 `getSdkConfigDir()/sessions/pi/<id>.jsonl` | 已证实（断言） | `:138` |
| `agent-session-manager`/`config-paths` 内部实现 | 边界（跨批未深读） | `:6-19` 引入 |
| 真实运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 导出选中 transcript + manifest.runtimeArtifacts | §2.1/§3 | 59-99 | covered |
| 导入重绑 piSessionFile + cwd 改写 | §2.2/§3 | 101-145 | covered |
| __testRewriteRuntimeCwd 坏行保留 | §2.3/§3 | 147-157 | covered |
| __testSdkProjectKey 稳定/有界/后缀 | §2.4/§3 | 159-167 | covered |
| parseImportFile manifest 暴露+源文件不动 | §2.5/§3 | 169-188 | covered |
| claude 分支/失败静默/冲突 | §4 | - | unknown（未覆盖） |
