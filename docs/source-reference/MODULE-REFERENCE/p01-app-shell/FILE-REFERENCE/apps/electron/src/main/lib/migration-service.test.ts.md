---
path: apps/electron/src/main/lib/migration-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b611b485882b882337213491ffa50883edd79be4
sha256: 3c4483d286775b1f1a8a0b9ae695e52c8fb1b446a48b25aca623a3289654c0bd
lines: 156
kind: test
package: p01-app-shell
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/migration-service.test.ts

## 1. 测试目标

`migration-service` 的迁移导入导出 v3 本地文件链路（156 行，bun:test）：①归档条目的路径穿越/Windows 非法名/归一化冲突拒绝；②单/多工作区 v3 导出与 skill-overrides 覆盖状态保留。**mock 边界**：`mock.module('electron', …)`（`:8-26`，全量替身：`app.getPath→''`/`getName→'profer-dev'`/`isPackaged:false`、`safeStorage.isEncryptionAvailable→false`、`encryptString→Buffer.from(value)` 明文、其余 API 空对象）；注释 `:7`：migration-service 经工作区/渠道服务间接加载 Electron，本测试只覆盖本地迁移文件链路，**无真实 Electron/SDK**。被测函数经动态 `await import('./migration-service')`（`:32-39`）取得。

## 2. 用例清单

前置（`:28-30`）：`configRoot = tmpdir()/profer-migration-v3-<Date.now()>`；`PROFER_DEV='1'`、`PROFER_CONFIG_DIR=configRoot`。`beforeAll`（`:51-61`）建 `agent-workspaces/workspace-a/skills/local-demo/SKILL.md`、`skill-overrides.json`（`globalSkills['builtin-demo'] = {enabled:false, disabledReason:'user-disabled'}`）、`agent-workspaces.json`（v3，含 `workspace` fixture `:42-49`，type:'personal'）。`afterAll`（`:63-67`）删环境变量+rmSync 临时根。动态 import 另取 `getWorkspaceSkillOverridesPath`/`getWorkspaceSkillsDir`（`./config-paths`，`:40`）。

| # | 用例 | 行 | 设置 | 动作 | 断言 |
| --- | --- | --- | --- | --- | --- |
| 1 | 归档条目同时拒绝 POSIX、Windows、反斜杠与点路径穿越 | 70-79 | `target = configRoot/archive-target` | `assertSafeMigrationArchiveEntry` ×7 | 6×toThrow('非法路径')、1×not.toThrow |
| 2 | Given Windows 非法文件名 When 校验归档条目 Then 在解压前拒绝 | 81-100 | 同上；10 个非法条目清单 | 逐条 assertSafeMigrationArchiveEntry | 10×toThrow('Windows')、1×not.toThrow |
| 3 | Given Windows 规范化后冲突的归档路径 When 批量校验 Then 拒绝覆盖且允许正常目录层级 | 102-119 | 同上 | `assertSafeMigrationArchiveEntries` ×3 组 | 正常层级 not.toThrow；`A.txt`/`a.txt` toThrow('Windows 路径冲突')；反斜杠+大小写混写 toThrow('Windows 路径冲突') |
| 4 | 单工作区 v3 导出包含 workspace skill-overrides.json，导入后保留覆盖状态 | 121-142 | beforeAll 产物 | `exportData({mode:'personal', workspaceId, components:['skills']})` → AdmZip 检查 → `parseImportFile` → `confirmImport({conflictResolution:'skip'})` | 见 §3 |
| 5 | 多工作区 v3 导出按 workspace 保留各自 skill-overrides.json | 144-155 | 同上 | `exportDataV2({mode:'share', components:['skills'], workspaceSelections:[{workspaceId, skillSlugs:['local-demo']}]})` | 见 §3 |

声明合计 **5 test / 0 it**（机械计数 grep `test(`/`it(`）。依赖顺序：4/5 依赖 beforeAll 写入的 skill 目录/overrides/工作区注册表；4 会写回 overrides 后读取（顺序敏感，4 在 5 前执行）。

## 3. 真实断言

- 用例 1（`:72-78`）：`../escape.txt`、`skills/../escape.txt`、`skills\..\escape.txt`、`/absolute.txt`、`C:\absolute.txt`、`skills/./demo/SKILL.md` 均 `toThrow('非法路径')`；`skills/demo/SKILL.md` `not.toThrow()`。
- 用例 2（`:96-99`）：`skills/CON`、`skills/nul.txt`、`skills/COM1/readme.md`、`skills/COM¹.log`、`skills/CONOUT$`、`skills/SKILL.md:evil`、`skills/foo<bar`、`skills/bad?name`、`skills/trailing.`、`skills/trailing /SKILL.md` 均 `toThrow('Windows')`；`skills/demo.v1/SKILL.md` `not.toThrow()`。
- 用例 3（`:104-118`）：目录层级三元组 `not.toThrow()`；`[{A.txt},{a.txt}]` `toThrow('Windows 路径冲突')`；`[skills\demo\SKILL.md, SKILLS/demo/skill.md]` `toThrow('Windows 路径冲突')`。
- 用例 4（`:124-141`）：`result.success` `toBe(true)`；`zip.getEntry('manifest.json')` `not.toBeNull()`；`zip.getEntry('skills/skill-overrides.json')` `not.toBeNull()`；manifest `version` `toBe('3.0')`（`:129`）；`preview.manifest.version` `toBe('3.0')`；`existsSync(tempDir/skills/skill-overrides.json)` `toBe(true)`；confirmImport 后 `globalSkills['builtin-demo'].enabled` `toBe(false)`（`:141`，覆盖状态保留）。
- 用例 5（`:149-154`）：`result.success` `toBe(true)`；`workspaces/workspace-a/skills/skill-overrides.json` `not.toBeNull()`；`workspaces/workspace-a/skills/active/local-demo/SKILL.md` `not.toBeNull()`；manifest `version` `toBe('3.0')`。

## 4. 未覆盖与脆弱点

- **未覆盖**：`exportData` 的 mcp/channels/chattools/workspace-config/meta/personal-files 组件；`confirmImport` 的 overwrite 冲突路径与 v1 分派；`_importChannels` 的 safeStorage 可用/不可用分支（mock 恒 `isEncryptionAvailable:false`）；runtime artifacts（另见 migration-service.runtime-artifacts.test.ts）；parseImportFile 的坏 manifest/坏 zip 路径。
- **脆弱点**：`configRoot` 用 `Date.now()` 命名（并发运行同进程多实例可能冲突）；`PROFER_DEV/PROFER_CONFIG_DIR` 全局环境写入（`:29-30`）与 afterAll 恢复依赖执行顺序；electron mock 是模块级替身（其他测试文件同进程会受影响——bun `mock.module` 作用域语义照实记录）。
- 断言≠运行：本轮 `NOT_RUN`，bun test 未执行，通过状态未知。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| mock 边界（electron 全量替身/明文加密）与 5 用例断言如上 | 已证实 | `:1-156` 全文逐行 |
| 声明计数 5 test/0 it | 已证实（机械计数） | grep `test(`/`it(` |
| mock 后 safeStorage 不可用路径=明文存储 | 已证实（断言间接） | `:10` + 用例 4 round-trip |
| bun mock.module 跨文件作用域 | 未知 | 运行时语义未验证 |
| 真实运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| assertSafeMigrationArchiveEntry 穿越/绝对路径 | §2.1/§3 | 70-79 | covered |
| Windows 非法名清单 | §2.2/§3 | 81-100 | covered |
| assertSafeMigrationArchiveEntries 归一化冲突 | §2.3/§3 | 102-119 | covered |
| exportData+parseImportFile+confirmImport v3 skills | §2.4/§3 | 121-142 | covered |
| exportDataV2 多工作区 skills | §2.5/§3 | 144-155 | covered |
| 其余组件/overwrite/v1 分派 | §4 | - | unknown（未覆盖） |
