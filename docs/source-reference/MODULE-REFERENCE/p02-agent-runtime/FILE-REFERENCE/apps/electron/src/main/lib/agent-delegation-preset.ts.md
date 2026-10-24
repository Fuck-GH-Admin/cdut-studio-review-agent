---
path: apps/electron/src/main/lib/agent-delegation-preset.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 15b1f1e90c2f77249a875a06de1f4a340181543e
sha256: 8667086345df14d4f3babd68fa05da2fb8dc299eab1d3aa85e594214756a6ca4
lines: 54
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-delegation-preset.ts

## 1. 结论与边界

解析协作子会话将持久化并运行的目标 Agent 预设：目标引用 > 父会话稳定引用 > 旧父会话 presetId 转换；对工作区预设做父工作区归属校验，最终经 `agent-preset-manager` 规范化并解析出 `AgentPreset`。单一导出函数的校验模块（注释 :19-26 说明工作区上下文永远由调用方提供，目标不得逃逸该工作区）。

不做的事：不做预设存取（`apps/electron/src/main/lib/agent-preset-manager.ts` 负责）；不决定权限模式（`agent-collaboration-utils.ts:35-41` 恒 bypass）；不创建会话。

## 2. 导出与关键符号

导出 3 条（`export` 逐条核 :8/:13/:27）：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `DelegationPresetResolution` | interface | `:8-11` | `{reference: PresetReference, preset: AgentPreset}` | 解析结果 |
| `ResolveDelegationPresetInput` | interface | `:13-17` | `{parent?: Pick<AgentSessionMeta,'presetId'\|'presetReference'>, target?: PresetReference, workspaceSlug?: string}` | 输入 |
| `resolveDelegationPreset` | function | `:27-54` | `(input) => DelegationPresetResolution \| undefined` | 主逻辑（§3） |

无内部函数。

## 3. 内部逻辑与关键流程

`resolveDelegationPreset`（:27-54）顺序：
1. 候选优先级（:30-32）：`input.target` ?? `parent.presetReference` ?? （父有 `presetId` 时 `presetReferenceForId(workspaceSlug, presetId)`）。
2. 无候选返回 `undefined`（:34）——保留既有默认行为（不强制预设）。
3. 校验 A（:36-38）：显式 target 是 `workspace` 作用域但缺 `workspaceSlug` → throw `目标工作区预设必须提供 workspaceSlug`。
4. 校验 B（:39-44）：候选是 workspace 作用域、调用方给了 `workspaceSlug`、候选自带 `workspaceSlug` 且不等 → throw `目标工作区预设不属于父会话工作区: <slug>`。
5. `normalizePresetReference(candidate, workspaceSlug)`（:46，实现 `apps/electron/src/main/lib/agent-preset-manager.ts:302`）。
6. 校验 C（:47-50）：规范化后仍是 workspace 作用域且 `workspaceSlug !== input.workspaceSlug` → 同 B 的 throw（拦住规范化补全后的越界）。
7. `getAgentPresetByReference(reference, workspaceSlug)`（:52，实现 agent-preset-manager.ts:397）→ 返回 `{reference, preset}`（:53）。该函数内部还会拒绝被禁用的全局预设（测试 :116-125 断言 throw 文案含 `当前工作区`）与给全局引用附加 workspaceSlug 的情况（测试 :127-136 断言 `全局预设引用不得携带 workspaceSlug`）——这两类 throw 发生在被调方，不在本文件行内。

## 4. 调用者与调用链

入向（grep 全冻结树 `*.ts`）：
- `apps/electron/src/main/lib/agent-collaboration-tools.ts:46` 导入；`:819-823` 在 `startDelegation` 内调用（draft 父会话晋升之前，注释 :817-818 强调失败校验先于副作用）。
- 直接测试：`apps/electron/src/main/lib/agent-delegation-preset.test.ts:13`（本批内）。

出向：`apps/electron/src/main/lib/agent-preset-manager.ts`：`getAgentPresetByReference`（:52 调用，定义 :397）、`normalizePresetReference`（:46，定义 :302）、`presetReferenceForId`（:32，定义 :457）；类型 `@profer/shared`（:1）。

## 5. 数据 I/O、读写与副作用

本文件自身无 I/O（依据：导入的三个函数属 preset-manager，读写预设存储是被调方行为）。无全局状态写入；纯解析+校验。副作用仅可能由 `getAgentPresetByReference`/`normalizePresetReference` 内部产生（未逐行读该文件，属 p02 其它批范围，此处只证调用关系）。

## 6. 分支、失败、取消与恢复

- 三个 throw 分支（§3 步骤 3/4/6）+ 被调方 throw（禁用全局预设、全局引用带 slug）；返回 `undefined` 分支（:34）。
- 错误文案均为中文用户可见字符串（:37/:43/:49）。
- 失败后状态：本文件无状态残留；调用方（startDelegation :819）在校验抛错时未创建子会话（失败前置，见 collaboration-tools 手册 §3.1 步骤 6）。
- 不适用「取消/恢复」：依据同步纯校验函数无异步、无持久化。

## 7. 权限与权威状态

- 越界防护是本文件的核心权限语义：目标工作区预设不得逃逸父会话工作区（:39-50，注释 :19-26）；`workspaceSlug` 权威由调用方传入（collaboration-tools:813 从持久化父会话工作区解析）。
- 全局/内置引用用同一 workspace 上下文解析（:52），禁用态校验统一交给 `getAgentPresetByReference`（注释 :22-25）。
- 无 sender/role 检查（依据：全文无 sender/role 字段）。

## 8. 修改影响面

- 改优先级/校验顺序影响 `startDelegation` 的「校验先于晋升 draft 父会话」保证（collaboration-tools:818-830）。
- 改 throw 文案会破坏 `agent-delegation-preset.test.ts` 4 个 toThrow 断言（:82/:113/:124/:135，部分为子串匹配）。
- 依赖 `normalizePresetReference`/`getAgentPresetByReference` 的行为变化（如 slug 补全规则）会经校验 C（:47-50）放大为拒绝。
- 需同步修改的测试：`agent-delegation-preset.test.ts`（本批内）。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/agent-delegation-preset.test.ts`（本批内，9 用例，真实 preset-manager + tmp 目录，`__setAgentPresetsBaseDirForTest` :19 重置 :23）。
- 未指定目标继承父引用（:38）：断言 reference 相等与 `preset.id==='code'`（:48-49）。
- 旧父会话仅 presetId 转换（:52）：断言 `toMatchObject({presetId:'minimal', presetScope:'builtin-meta'})`（:58-61）。
- 显式目标覆盖（:64）：断言 reference/preset 均为目标（:71-72）。
- 显式 workspace 目标缺 slug 抛错（:75）：`toThrow('目标工作区预设必须提供 workspaceSlug')`（:82）。
- 同工作区 workspace 预设允许（:85）：真实 `createAgentPreset` 后解析成功，断言 id 与 slug（:100-101）。
- 跨工作区抛错（:104）：`toThrow('目标工作区预设不属于父会话工作区')`（:113）。
- 禁用全局预设抛错（:116）：`disableGlobalPresetInWorkspace` 后 `toThrow('当前工作区')`（:124，子串断言——实际文案由被调方产生）。
- 全局引用附加 workspaceSlug 抛错（:127）：`toThrow('全局预设引用不得携带 workspaceSlug')`（:135，同样来自被调方）。
- 无父预设无目标返回 undefined（:138）：`toBeUndefined()`（:142）。
- mock/边界：preset-manager 真身 + 文件系统 tmp 目录；无 IPC/会话存储。未覆盖：`presetVersion` 匹配语义、builtin-meta 内容、并发/持久化损坏。`NOT_RUN`：本轮未执行测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 候选优先级 target > parent.presetReference > presetId 转换 | 已证实 | `:30-32`；测试 :38/:52/:64 |
| 三处 throw 与文案 | 已证实 | `:37/:43/:49`；测试 :82/:113 |
| 无候选返回 undefined（不强制预设） | 已证实 | `:34`；测试 :138-142 |
| 工作区越界双检（校验 B/C） | 已证实 | `:39-44/:47-50` |
| 禁用全局预设/全局带 slug 的 throw 来自 `getAgentPresetByReference`/`normalizePresetReference` 内部 | 推断（实现未逐行读） | 测试 :116-136 断言文案；本文件无对应 throw 行 |
| `presetReferenceForId` 对未知 presetId 的返回形状 | 未知 | 定义在 agent-preset-manager.ts:457，未读 |
| `presetVersion` 语义 | 未知 | 本文件仅透传（:46），匹配逻辑在被调方 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `resolveDelegationPreset` 优先级 | §3 | :30-32 | covered |
| 校验 A/B/C | §3/§6 | :36-50 | covered |
| `undefined` 返回 | §3 | :34 | covered |
| `DelegationPresetResolution`/`ResolveDelegationPresetInput` | §2 | :8-17 | covered |
| 被调方 throw 语义 | §9/§10 | agent-preset-manager:302/:397 | partial |
| `presetVersion`/`presetReferenceForId` 细节 | §10 | — | unknown |
