---
path: apps/electron/src/main/lib/review/review-v3-f18-school-profile.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f4ce951c597b9171420132f6a5fa366b6f67ef46
sha256: 06463b95b046b285e710024058babcf21163ce483433a665f3e2f5fc35889e70
lines: 96
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-f18-school-profile.ts

## 1. 结论与边界

F18：可替换 SchoolPort 的**能力协商**与**字段/状态映射**。学校没有授权的 API 不能被模拟成真实接口；未知数据绝不推断为通过或 0 分（文件头 `apps/electron/src/main/lib/review/review-v3-f18-school-profile.ts:1-4`）。

边界：纯映射/协商函数，不发请求、不写存储；`SchoolPort`/`ExternalCaseSnapshot` 形状来自 `external-ports.ts`（`:5`）。

## 2. 导出与关键符号

`export` 逐条核对：3 个接口 + 1 个类型 + 3 个函数 = 7 个导出（类/常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `IntegrationProfile` | 接口（导出） | 7-16 | `{id,workflowOwner:'local'\|'school',fieldMapping,statusMapping}` | `school`=外部主持业务阶段，本地只能提交待确认建议（`:9-10`）；映射外字段保持 unknown（`:11-12`）；未知状态不能默认完成（`:13-14`） |
| `SchoolPortActionPlan` | 接口（导出） | 18-26 | `{source,mode,canFetchCase,canReadTasks,canVerify,canClaimSchoolIdentity,explanation}` | `mode` 四值 |
| `negotiateSchoolPort` | 函数（导出） | 32-57 | `(port,profile)=>SchoolPortActionPlan` | 能力协商 |
| `MappedField` | type（导出） | 59 | `{state:'available',value,externalKey}` ∪ `{state:'unknown',reason}` | |
| `MappedExternalCase` | 接口（导出） | 61-67 | `{caseId,externalId,revision,source,fields,unmappedExternalKeys}` | |
| `mapExternalCase` | 函数（导出） | 69-89 | `(snapshot,profile,canonicalFields)=>MappedExternalCase` | 显式字段映射 |
| `mapExternalStatus` | 函数（导出） | 91-96 | `(status,profile)=>{mapped,canonical}\|{unknown,external}` | 状态映射 |
| `hasReadCapabilities` | 内部 | 28-30 | 类型守卫 `capabilities===function` | |

## 3. 内部逻辑与关键流程

### 3.1 协商（`negotiateSchoolPort`，`:32-57`）

`capability=hasReadCapabilities(port)?port.capabilities():undefined`；`realAuthenticatedIdentity = port.kind==='school' && capability?.identity===true`（`:34-35`）。base：`canFetchCase=Boolean(capability && fetchCase===function)`、`canReadTasks=Boolean(capability?.tasks)`、`canVerify=Boolean(capability?.verification)`、`canClaimSchoolIdentity=realAuthenticatedIdentity`（`:36-42`）。分支：

1. `offline-package` → `mode:'offline-handoff'`（仅离线交接包；独立回执前不宣称受理，`:43-46`）。
2. `profile.workflowOwner==='local'` → `mode:'local-decision'`（本地决定走现有案卷命令，外部数据仅参考，`:47-50`）。
3. 无 `capability.push` 或（school 且无真实认证身份）→ `mode:'unavailable'`（外部有审批权但写入/身份未授权，`:51-54`）。
4. 其余 → `mode:'proposal-awaiting-receipt'`：`mock` 解释“只能演练建议与回执，不构成学校正式审批”，否则“只提交业务建议等待外部回执”（`:55-71` 即 `:55-57`）。

### 3.2 字段映射（`mapExternalCase`，`:69-89`）

逐 `canonicalFields`：`fieldMapping[key]` 存在且 snapshot 字段 own-property 且非 `undefined/null` → `available{value,externalKey}` 并记 consumed；否则 `unknown`（reason：有映射=“外部接口未返回该字段”，无映射=“尚未配置字段映射”）（`:71-83`）。返回含 `unmappedExternalKeys`（snapshot 有但未消费的键）（`:85`）。注释：缺字段不补假成绩、不制造默认事实（`:68`）。

### 3.3 状态映射（`mapExternalStatus`，`:91-96`）

反查 `statusMapping`（外部值→canonical）；命中 `{state:'mapped',canonical}`，否则 `{state:'unknown',external}` 原样保留（注释：未配置的校方状态不能强映射为本地 approved，`:90`）。

## 4. 调用者与调用链

入向（冻结树 grep）：调用者在 UI/工作流侧（`negotiateSchoolPort`/`mapExternalCase`/`mapExternalStatus` 的生产消费点在渲染/服务层，本批检索见 §10）；测试：`review-v3-f18-school-profile.test.ts:4`（本批 3 例）。出向：`external-ports.ts`（`ExternalCaseSnapshot`/`SchoolPort`/`SchoolReadPort` 类型）。

## 5. 数据 I/O、读写与副作用

纯函数：无 IO/网络/状态；同一输入恒同输出。

## 6. 分支、失败、取消与恢复

无抛错路径（全部分支返回结构）；“失败”语义体现为 `mode:'unavailable'`/`state:'unknown'`。无取消/恢复概念。

## 7. 权限与权威状态

- `canClaimSchoolIdentity` 仅当 `kind==='school'` 且 `capabilities().identity===true`（`:35,41`）；mock/本地身份绝不升级为学校身份（`:31` 注释）。
- 能力缺失即禁用（`:31`）；未知状态不默认完成（`:90`）；未知字段不补默认值（`:68`）。

## 8. 修改影响面

- 改 `SchoolPortActionPlan.mode` 影响 UI 启用逻辑（各消费组件）。
- 改映射语义影响 `MappedExternalCase` 消费与 `review-v3-f18-school-profile.test.ts` 断言。

## 9. 测试证据

直接测试：`review-v3-f18-school-profile.test.ts`（40 行，3 例，详见其手册）：mock 只能 `proposal-awaiting-receipt` 且无学校身份、离线包 `offline-handoff`；school 无身份/写入 → `unavailable`；缺成绩保留 unknown、未知状态不映射、`unmappedExternalKeys` 正确。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

缺口：`workflowOwner:'local'` 分支、`canFetchCase` 真端口、多映射冲突无独立用例。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 身份不升级（mock→非学校） | 已证实 | `:35,41,55-57`；测试 `:12-21` |
| 未知不推断（字段/状态） | 已证实 | `:68,83,90-96`；测试 `:30-38` |
| 能力缺失即禁用 | 已证实 | `:51-54`；测试 `:23-28` |
| 纯函数无副作用 | 已证实 | 全文无 IO |
| 生产消费点 | 未知 | 渲染/服务层未逐行核 |
| `SchoolPort` 实现行为 | 未知（文件外） | `external-ports.ts` 未逐行读 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `negotiateSchoolPort` 四分支 | §3.1 | 32-57 | covered |
| `mapExternalCase` | §3.2 | 69-89 | covered |
| `mapExternalStatus` | §3.3 | 91-96 | covered |
| 权限/未知语义 | §7 | 31,35,68,90 | covered |
| local 分支/消费点 | §9,§10 | 47-50 | partial |
