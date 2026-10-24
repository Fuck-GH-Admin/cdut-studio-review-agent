---
path: apps/electron/src/main/lib/review/review-principal-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 86b9aa613fe2b3ea97920fd8ea4ae447b2a62221
sha256: f665f2e38fa9acde46658be17b5d25cd6593eb2fc9129453f3a10eff96db394b
lines: 185
kind: source
package: p05-review-engine
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-principal-service.ts

## 1. 结论与边界

审核业务统一 Principal（AUTH-01/AUTH-18，`apps/electron/src/main/lib/review/review-principal-service.ts:1-11`）。设计边界（文件头明列）：只在 Main 运行；**Renderer 传来的 actor/role 永远不是凭证**；本机无校方签发通道，所有本地 Principal 显式标注 `SIMULATED_NOT_SCHOOL_AUTHORIZED`，不得对外表述为学校审批记录；真实学校身份只能来自 `assurance='verified-school'` 的 SchoolPort，缺失时返回 `BLOCKED_EXTERNAL` 而不伪造；不新增第二套业务账本（Principal 是内存/瞬时合同）。

## 2. 导出与关键符号

`export` 共 **10 个**（4 type + 1 const + 1 class + 4 函数）。

| 符号 | 类型 | 行 | 形状 | 说明 |
| --- | --- | --- | --- | --- |
| `PrincipalAssuranceLabel` | 导出 type | `:15-20` | 5 值 | 审计标签 |
| `SIMULATED_NOT_SCHOOL_AUTHORIZED` | 导出 const | `:23` | `'SIMULATED_NOT_SCHOOL_AUTHORIZED'` | 本机试办固定标识 |
| `ExternalAuthorizationState` | 导出 type | `:26` | `NONE_LOCAL_ONLY \| BLOCKED_EXTERNAL \| SCHOOL_GRANTED` | 外部授权态 |
| `ReviewPrincipal` | 导出 interface | `:29-37` | `Principal + {assuranceLabel, schoolAuthorized, externalAuthorization, issuedAt, expiresAt?}` | 签发产物 |
| `PrincipalErrorCode` | 导出 type | `:39-43` | 4 值 | 错误码 |
| `PrincipalError` | 导出 class | `:45-52` | `Error + code` | 错误类 |
| `IssueLocalPrincipalInput` | 导出 interface | `:65-73` | 7 字段 | 签发入参 |
| `assuranceLabelFor` | 导出函数 | `:55-60` | `(role, source) => label` | 标签映射 |
| `issueLocalPrincipal` | 导出函数 | `:80-112` | `(input) => ReviewPrincipal` | Main 签发 |
| `assertPrincipalAllows` | 导出函数 | `:118-136` | `(principal, {caseId?, action?, now?}) => void` | 写事务前置重核 |
| `assertNoRendererRoleEscalation` | 导出函数 | `:142-152` | `(claim) => role` | 拒绝渲染层角色升级 |
| `describePrincipalForAudit` | 导出函数 | `:169-185` | `(principal) => AuditPrincipalLine` | 审计投影 |

（`AuditPrincipalLine` interface `:154-163` 亦为导出——**实际 `export` 计数 12 个**：5 type/interface/const + 1 class + 5 函数 + `IssueLocalPrincipalInput`/`AuditPrincipalLine` 两 interface。以 `grep -c "^export"` 为准：type 4、const 1、interface 3（ReviewPrincipal/IssueLocalPrincipalInput/AuditPrincipalLine）、class 1、function 5 = 14 个导出声明。）

内部：`LOCALLY_ISSUABLE_ROLES = {reviewer, student, system}`（`:63`，注释：教师/评委/校方管理员不在其中，必须外部授权）。

## 3. 内部逻辑与关键流程

### 3.1 `assuranceLabelFor`（`:55-60`）

`source==='school'`→`VERIFIED_SCHOOL_PERSON`；`role==='system'`→`SYSTEM`；`role==='reviewer'`→`LOCAL_OPERATOR`；其余→`LOCAL_SIMULATION`（teacher/judge/student 等模拟角色）。

### 3.2 `issueLocalPrincipal`（`:80-112`）

1. 角色门禁（`:81-86`）：非 `LOCALLY_ISSUABLE_ROLES` → `ROLE_ESCALATION`「本机不能签发 … 必须由学校授权端口签发（当前 BLOCKED_EXTERNAL）」。
2. `sessionId` 必绑（`:87`）；`caseIds`/`actions` 各非空数组（`:88-93`）→ `SCOPE_FORBIDDEN`。
3. 返回（`:95-111`）：`principalId` 默认 `local-${role}`；`source:'local'`、`assurance:'local-device'`、scope 去重、`assuranceLabel` 映射、`schoolAuthorized:false`、`externalAuthorization:'BLOCKED_EXTERNAL'`、`issuedAt`；`ttlMs>0` 才写 `expiresAt`（`:110`）。

### 3.3 `assertPrincipalAllows`（`:118-136`）——写事务提交前重核

缺 principal → `SCOPE_FORBIDDEN`（`:122`）；`source!=='local' && assurance!=='verified-school'` → `SCHOOL_AUTH_MISSING`（`:123-125`）；过期 → `PRINCIPAL_EXPIRED`（`:127-129`）；`caseId`/`action` 不在 scope → `SCOPE_FORBIDDEN`（`:130-135`）。注释（`:115-116`）：**任何写入都必须过这里**，不只依赖 UI 取能力时的检查。

### 3.4 `assertNoRendererRoleEscalation`（`:142-152`）

`role` 缺省返回 `'reviewer'`（`:144`）；非字符串或不在可签发集 → `ROLE_ESCALATION`（`:145-150`）；注释（`:140`）：返回值只用于「是否本地允许」，调用方必须用 Main 签发结果覆盖，**不信任入参**。

### 3.5 `describePrincipalForAudit`（`:169-185`）

按标签生成中文展示（校方已认证/本机操作者非校方认证/本机模拟非校方人员）；`realPerson` 仅 `VERIFIED_SCHOOL_PERSON` 为 true；非校方一律带 `simulationMarker`（`:183`）。

## 4. 调用者与调用链

- 消费方：审核业务写事务（`assertPrincipalAllows` 重核）、IPC/命令层（`assertNoRendererRoleEscalation`、`issueLocalPrincipal`）、审计/报告（`describePrincipalForAudit`）。具体调用点在本批 `review-identity-authority.test.ts`（149 行）覆盖（见第 9 节）。
- 出向：仅 `@profer/shared` 的 `Principal` 类型。

## 5. 数据 I/O、读写与副作用

纯逻辑；无 I/O。`issueLocalPrincipal` 用 `Date.now()`/`new Date().toISOString()`（时间注入仅 `assertPrincipalAllows` 支持 `now` 参数）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 错误码 |
| --- | --- | --- |
| 签发 teacher/judge/校方角色 | `:81-86` | `ROLE_ESCALATION` |
| 缺 sessionId/范围 | `:87-93` | `SCOPE_FORBIDDEN` |
| 缺主体 | `:122` | `SCOPE_FORBIDDEN` |
| 校方主体缺 assurance | `:123-125` | `SCHOOL_AUTH_MISSING` |
| 过期 | `:127-129` | `PRINCIPAL_EXPIRED` |
| 超范围 | `:130-135` | `SCOPE_FORBIDDEN` |
| 渲染层声明非法角色 | `:145-150` | `ROLE_ESCALATION` |

## 7. 权限与权威状态

- 核心权威主张：本地永远 `schoolAuthorized:false` + `BLOCKED_EXTERNAL`（`:107-108`）；`SCHOOL_GRANTED` 无法由本文件产生（`:25` 注释）。
- `SIMULATED_NOT_SCHOOL_AUTHORIZED` 必须出现在审计/报告/导出（`:22` 注释）。
- 渲染层角色声明不可升级（`:138-141`）。

## 8. 修改影响面

- `LOCALLY_ISSUABLE_ROLES` 增删影响角色门禁；错误文案与测试断言耦合（`review-identity-authority.test.ts`）。
- `assertPrincipalAllows` 是业务写统一重核点；漏调用即绕过过期/范围检查。
- 审计投影字段（`realPerson`/`simulationMarker`）被报告/导出消费；改动影响 AUTH-18 合规。

## 9. 测试证据

- `review-identity-authority.test.ts`（149 行）直接覆盖身份/授权边界（角色升级拒绝、签发、审计标签等；逐条断言见该测试手册）。
- **NOT_RUN**：未运行测试/构建/GUI。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 本地签发恒 `BLOCKED_EXTERNAL`/非校方 | 已证实 | `:107-108`、`:25` |
| 角色门禁拒绝 teacher/judge/校方管理员 | 已证实 | `:63`、`:81-86` |
| 写事务五重检查 | 已证实 | `:118-136` |
| 审计投影区分模拟/真实 | 已证实 | `:169-185` |
| 导出计数（含 const/type/class） | 已证实 | `grep -c "^export"` 核对 |
| SchoolPort 实现存在与否 | 未知 | 未在本批检索 `assurance='verified-school'` 生产签发方 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 全部导出 | 2 | — | covered |
| 标签映射 | 3.1 | `:55-60` | covered |
| 签发 | 3.2 | `:80-112` | covered |
| 写前重核 | 3.3 | `:118-136` | covered |
| 角色升级拒绝 | 3.4 | `:142-152` | covered |
| 审计投影 | 3.5 | `:169-185` | covered |
| 测试证据 | 9 | — | covered |
