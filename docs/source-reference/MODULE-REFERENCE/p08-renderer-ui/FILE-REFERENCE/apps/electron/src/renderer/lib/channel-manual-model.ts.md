---
path: apps/electron/src/renderer/lib/channel-manual-model.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d5176b403bfb02adf810a8dafc3408fc9d245a1c
sha256: a340492eaf794d5b38661eea8a2a4d9036cf6a1d556833ec93e364f7cc5227cf
lines: 42
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/channel-manual-model.ts

## 1. 结论与边界

手动添加模型的纯函数校验/去重封装（42 行）：统一拦截输入法组词残留、粘贴夹带空白、重复提交三类垃圾条目，避免它们随编辑模式 auto-save 落盘后无法清洗（模块注释 `apps/electron/src/renderer/lib/channel-manual-model.ts:3-13`）。边界：只做字符串校验与数组追加，不落盘、不发请求；模型 ID 不允许任何空白字符（`apps/electron/src/renderer/lib/channel-manual-model.ts:20-21`）。

## 2. 导出与关键符号

- 类型导出 1 个：`AddManualModelResult` 判别联合（`apps/electron/src/renderer/lib/channel-manual-model.ts:14-18`：added/duplicate/empty/invalid 四态）。
- 函数导出 1 个：`addManualModel(current, idInput, nameInput)`（`apps/electron/src/renderer/lib/channel-manual-model.ts:23`）。
- 常量导出 0 个；`WHITESPACE_RE = /\s/` 为内部常量（`apps/electron/src/renderer/lib/channel-manual-model.ts:21`，标注"内部"）。
- 合计导出 2 个符号（类型 1 + 函数 1），与源码逐条一致。

## 3. 内部逻辑与关键流程

按执行顺序（`apps/electron/src/renderer/lib/channel-manual-model.ts:28-41`）：(1) `id = idInput.trim()`（`:28`）；(2) 空 id 返回 `{kind:'empty'}` 短路（`:29`）；(3) id 含空白返回 `{kind:'invalid'}` 短路（`:30`）；(4) 与 `current` 中任一 `model.id` 相同返回 `{kind:'duplicate', models: current, id}` 短路，列表不变（`:32-34`）；(5) `name = nameInput.trim() || id`（`:36`，显示名空缺时用 ID 兜底）；(6) 返回 `{kind:'added', id, models: [...current, {id, name, enabled: true, source: 'manual'}]}` 不可变追加（`:37-41`）。短路条件共 3 个：empty/invalid/duplicate。

## 4. 调用者与调用链

- 入向（冻结树全量 grep `addManualModel`）：`apps/electron/src/renderer/components/settings/ChannelForm.tsx:52`（import）→ `apps/electron/src/renderer/components/settings/ChannelForm.tsx:428`（手动添加模型提交处调用）。测试 import 点：`apps/electron/src/renderer/lib/channel-manual-model.test.ts:3`。无其它调用者。
- 出向：仅类型导入 `@profer/shared` 的 `ChannelModel`（`apps/electron/src/renderer/lib/channel-manual-model.ts:1`）；无 IPC/Worker/存储调用，无动态调用。
- 否定结论检索范围：冻结树 `**/*.{ts,tsx,js}` 全文（含测试）。

## 5. 数据 I/O、读写与副作用

纯函数：无模块级状态/缓存/Map；返回新数组不修改 `current`（`apps/electron/src/renderer/lib/channel-manual-model.ts:40`）。无 DOM/剪贴板/localStorage/Worker 副作用。注释说明其设计动机是防垃圾落盘（`apps/electron/src/renderer/lib/channel-manual-model.ts:11-12`），落盘动作在调用方（ChannelForm auto-save）完成，不在本文件。

## 6. 分支、失败、取消与恢复

- 空输入/纯空白 → `empty`（`apps/electron/src/renderer/lib/channel-manual-model.ts:29`，trim 后为空命中）。
- 内部空白（空格/Tab/换行）→ `invalid`（`apps/electron/src/renderer/lib/channel-manual-model.ts:30`，`WHITESPACE_RE` 匹配 `\s`）。
- 重复 ID → `duplicate` 且不改变列表（`:32-34`）。
- `nameInput` 空/纯空白 → 显示名回退为 id（`:36`）。全程不 throw、无异步、无取消概念（本文件不适用，依据：全文无 Promise/定时器/AbortSignal）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。权威约定写在注释：手动输入是异常模型名的主要来源，校验与去重以本函数为唯一入口（`apps/electron/src/renderer/lib/channel-manual-model.ts:6-12`）。

## 8. 修改影响面

- `apps/electron/src/renderer/components/settings/ChannelForm.tsx:428` 手动添加模型入口的校验结果分支（added/duplicate/empty/invalid 的 UI 提示）。
- 编辑模式 auto-save 落盘链路：放宽校验会让垃圾模型 ID 进入本地渠道配置并被远端发现刻意保留（`apps/electron/src/renderer/lib/channel-manual-model.ts:11-12` 注释所述约束）。

## 9. 测试证据

`NOT_RUN`（本轮未运行测试，纯静态阅读）。直接测试文件 `apps/electron/src/renderer/lib/channel-manual-model.test.ts`（本批次内）：机械计数 `test(` = 6、`it(` = 0（grep `^\s*(it|test)\(`）。真实断言：`apps/electron/src/renderer/lib/channel-manual-model.test.ts:8-12`（added 追加 enabled manual 模型）、`:17-24`（显示名生效）、`:32`（空格 ID → invalid）、`:36`（内部换行 → invalid）、`:40-41`（空/纯空白 → empty）、`:49`（duplicate 返回原列表）。断言引用≠运行，不得写"测试通过"。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 四态结果语义与短路顺序 | 已证实 | `apps/electron/src/renderer/lib/channel-manual-model.ts:28-41` |
| 显示名空缺回退 id、不可变追加 | 已证实 | `apps/electron/src/renderer/lib/channel-manual-model.ts:36-40` |
| 6 条测试断言与实现一致 | 已证实 | `channel-manual-model.test.ts:8-49` |
| 测试实际运行结果 | 未知 | NOT_RUN，本轮未执行任何测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 覆盖 |
| --- | --- | --- | --- |
| `AddManualModelResult` | §2 | `channel-manual-model.ts:14` | covered |
| `added` 分支 | §3,§9 | `channel-manual-model.ts:37-41` | covered |
| `duplicate` 分支 | §3,§9 | `channel-manual-model.ts:32-34` | covered |
| `empty` 分支 | §6,§9 | `channel-manual-model.ts:29` | covered |
| `invalid` 分支（空格/换行） | §6,§9 | `channel-manual-model.ts:30` | covered |
| 显示名回退 id | §6,§9 | `channel-manual-model.ts:36` | covered |
| 运行结果 | §9 | — | unknown（NOT_RUN） |
