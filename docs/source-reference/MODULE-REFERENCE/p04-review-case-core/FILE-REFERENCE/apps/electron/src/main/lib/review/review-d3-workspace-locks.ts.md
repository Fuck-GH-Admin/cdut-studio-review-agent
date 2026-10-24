---
path: apps/electron/src/main/lib/review/review-d3-workspace-locks.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2f380b32ad12bb1f850ce6579b02837f806eb335
sha256: 19d5acd7bcdccd1ff8f06f3c48d2b5c910e6f3d246e18ab14b0a265c0ac53cfd
lines: 75
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-d3-workspace-locks.ts

## 1. 结论与边界

D3 工作区**共享资产锁**校验（头注 :1-5）：每次作者态校验都做本地身份检查（锁摘要 vs 本地模块定义），`installed=true` 时再对本机冻结库做安装态检查。不授予政策权威；未锁定模块仍是可编辑草稿。

边界：只读校验（除读冻结库 JSON 外无 I/O 写）；不生成/冻结模块（`review-d3-frozen-modules/` 的写入方不在本文件）；无身份/sender 检查。

## 2. 导出与关键符号

导出 1 个函数：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `validateD3WorkspaceLocks` | fn | 17 | `(workspace: ReviewAuthoringWorkspaceV1, installed = false) => string[]` | 返回去重错误码列表（空=通过） |

内部符号：`SAFE`（:12，moduleId `/^[a-z][a-z0-9-]{0,79}$/`）、`HASH`（:13，`/^[0-9a-f]{64}$/`）、`key(id, version)`（:14，`id@version`）、`digest(value)`（:15，`sha256(JSON.stringify(value))`）。

## 3. 内部逻辑与关键流程

按执行顺序（:17-74）：
1. `sharedModuleLocks` 非数组 → 返回 `['D3_LOCK_INVALID: sharedModuleLocks 必须为数组']`（:18-19）。
2. 建索引：`known`（锁表）、`modules`（`workspace.definitions.modules` 按 `id@version`）（:21-22）。
3. 逐锁（:23-35）：形状（moduleId 过 `SAFE`、version 安全整数 ≥1、digest 过 `HASH`）不过 → `D3_LOCK_INVALID: 共享资产锁标识、版本或摘要不合法`（:24-27）；重复键 → `D3_LOCK_DUPLICATE: k`（:30）；工作区无此模块 → `D3_LOCK_MISSING_MODULE: k`（:33）；`digest(module) !== lock.digest` → `D3_LOCK_DIGEST: 本地定义偏离已固定资产 k`（:34）。
4. `installed=true` 时的未声明检查（:36-43）：遍历工作区模块（形状合法者），若本机存在冻结文件 `{resolveConfigDir()}/review-d3-frozen-modules/{moduleId}/{version}.json` 而工作区未声明锁 → `D3_LOCK_UNDECLARED: 当前环境存在同名冻结模块，工作区却未声明冻结身份 k`（:40-42）。
5. 依赖闭包（:44-53）：每个已声明锁对应模块的 `references ?? []` 必须都在 `known` 中 → 否则 `D3_LOCK_DEPENDENCY_MISSING: child ← k`（:49-52）。
6. `installed=true` 时的安装态检查（:54-72）：冻结文件缺失 → `D3_LOCK_NOT_INSTALLED: k`（:56）；JSON 解析失败 → `D3_LOCK_CORRUPTED: k`（:59）；记录须 `status==='shared-frozen' && schemaVersion===1 && record.module.moduleId/version 匹配 && digest(record.module)===lock.digest && record.digest===lock.digest && dependencies 为数组`（:60-64），否则 `D3_LOCK_REGISTRY_MISMATCH: k`（:64）；依赖摘要三方核对（:67-72）：`declared`（记录的 dependencies，键唯一）与 `required`（模块 references 的键集）大小相等，且每个 required 子项的摘要等于**本工作区锁表** `known.get(child)?.digest`，否则 `D3_LOCK_DEPENDENCY_DIGEST: k`。
7. 返回 `[...new Set(errors)]` 去重（:74）。

## 4. 调用者与调用链

入向（全树 grep `review-d3-workspace-locks|validateD3WorkspaceLocks`，仅 2 个生产 import）：
- `review-d2-runtime.ts:13`，调用点 `:153`——`compileD2RuntimePlan` 以 `installed=false` 校验（失败抛 `D3_FROZEN_LOCK_INVALID: …`，:154；注释 :150-152：捆绑 D4 候选自带冻结模块，编译不依赖用户可变 D3 库）。
- `review-authoring-v1.ts:14`，调用点 `:136`——`validateReviewAuthoringV1` 内（默认 `installed=false`）；`:217`——`compileReviewAuthoringCandidateV1`（:197 起）以 `installed=true` 校验（失败抛 `D3_FROZEN_LOCK_INVALID`，:218）。
- 测试侧无直接 import；`review-d2-runtime.test.ts` 经 `compileD2RuntimePlan`/`makeD2CandidateShell` **间接执行两条路径的 happy path**（`D3_FROZEN_LOCK_INVALID` 从未被断言，全树 `.test.ts` 检索 `D3_LOCK_` 零命中）。

出向：`../config-paths resolveConfigDir`（:10；`config-paths.ts:57-59`，仅解析不 mkdir）；`node:crypto createHash`、`node:fs existsSync/readFileSync`、`node:path join`（:6-8）；`@profer/shared` 类型（:9）。

## 5. 数据 I/O、读写与副作用

- 只读：`{configDir}/review-d3-frozen-modules/{moduleId}/{version}.json`（:39/:55），只用 `existsSync`/`readFileSync`。
- 无写入、无日志、无网络；纯校验 + 路径探测。`resolveConfigDir` 不创建目录（区别于 `getConfigDir` 的 mkdir）。

## 6. 分支、失败、取消与恢复

全部失败为错误码字符串（不 throw），调用方将其拼接为 `D3_FROZEN_LOCK_INVALID`/`AUTHORING_INVALID` 异常（`review-d2-runtime.ts:154`、`review-authoring-v1.ts:218`）。错误码清单：`D3_LOCK_INVALID`（两类）、`D3_LOCK_DUPLICATE`、`D3_LOCK_MISSING_MODULE`、`D3_LOCK_DIGEST`、`D3_LOCK_UNDECLARED`、`D3_LOCK_NOT_INSTALLED`、`D3_LOCK_CORRUPTED`、`D3_LOCK_REGISTRY_MISMATCH`、`D3_LOCK_DEPENDENCY_DIGEST`（:19-71）。无恢复/重试逻辑；`installed=false` 模式下不做任何磁盘检查（:54 `if (!installed) continue`）。

## 7. 权限与权威状态

- 「锁」是**内容完整性权威**而非身份权威：`lock.digest` 固定模块定义字节（`digest` = sha256(JSON)，:15），偏离即拒绝——防止作者态偷偷改共享资产。
- `installed=true` 时要求本机冻结库记录 `status==='shared-frozen'` 且摘要三方一致（锁/模块/记录，:60-62），依赖摘要必须与工作区锁表一致（:67-71）。
- 无 sender/role 分支：依据为全文件无 IPC/角色检查；文件头明确「Does NOT grant policy authority」（:4）。

## 8. 修改影响面

- 改判据影响 D2 计划编译（`compileD2RuntimePlan`）与候选生成（`compileReviewAuthoringCandidateV1`）的准入；错误信息进入 `review-d2-runtime.test.ts` 的 `AUTHORING_INVALID`/`D3_FROZEN_LOCK_INVALID` 传播路径。
- `digest` 序列化方式（`JSON.stringify` 无排序）变更会使**存量锁全部失配**（构造顺序敏感）。
- 无专属测试；修改后只能间接经 `review-d2-runtime.test.ts` 回归。

## 9. 测试证据

**无直接测试**（否定范围：全冻结树 `.test.ts` 检索 `validateD3WorkspaceLocks|D3_LOCK_|review-d3-frozen-modules` 零命中）。间接：`review-d2-runtime.test.ts` 的 16 用例（NOT_RUN）在 `setup`/`compileD2RuntimePlan`/`makeD2CandidateShell` 中反复执行 `installed=false`（如 :202-212/:236-244 的计划编译）与候选壳路径的 `installed=true`（:73/:121/:162/:393/:411）；用例正常通过只证明 happy path 无误报，**九类错误分支均未被断言**。

缺口：全部错误码分支、`installed=true` 的 `NOT_INSTALLED/CORRUPTED/REGISTRY_MISMATCH/DEPENDENCY_DIGEST/UNDECLARED` 无用例；去重逻辑（:74）无用例；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 单导出、内部符号行号如 §2 | 已证实 | :12-17 |
| 九类错误码与判定条件 | 已证实 | :18-71 |
| 两调用点（installed=false/true） | 已证实 | `review-d2-runtime.ts:153`、`review-authoring-v1.ts:136/:217` |
| 只读冻结库 JSON、无写副作用 | 已证实 | :39/:55，仅 existsSync/readFileSync |
| 无任何测试断言（含间接） | 已证实（否定） | 全树 `.test.ts` 零命中 |
| `digest` 对键序敏感导致的兼容风险 | 推断 | :15 `JSON.stringify(value)` 无稳定排序 |
| 真实冻结库数据形态 | 未知 | 未读用户目录（NOT_RUN/只读冻结树） |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `validateD3WorkspaceLocks` 主流程 | §3 | 17-74 | covered |
| 形状/重复/缺失/摘要校验 | §3.3 | 23-35 | covered（未测） |
| `installed` 未声明检查 | §3.4 | 36-43 | covered（未测） |
| 依赖闭包 | §3.5 | 44-53 | covered（未测） |
| 安装态四类检查 | §3.6 | 54-72 | covered（未测） |
| `SAFE`/`HASH`/`key`/`digest` | §2 | 12-15 | covered |
