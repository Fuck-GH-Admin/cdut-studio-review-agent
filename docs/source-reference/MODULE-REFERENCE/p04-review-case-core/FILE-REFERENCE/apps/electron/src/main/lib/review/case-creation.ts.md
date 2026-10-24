---
path: apps/electron/src/main/lib/review/case-creation.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: aaf89591d1781d834308dfae960322d2e7e05b87
sha256: 54ed2ca7a02ad9f1cbff88ca53b765ca9e4436f6db18c4b4095ba891adfba31a
lines: 52
kind: source
package: p04-review-case-core
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/case-creation.ts

## 1. 结论与边界

旧版（V1）**空案卷创建**：组装 `ReviewCase` 默认值并经 `saveCase` 持久化（`apps/electron/src/main/lib/review/case-creation.ts:19-49`）。文件头声明定位是「与 case-store 解耦：case-store 只管持久化，这里负责业务默认值」（`:3-5`）。

明确不做的事：

- **不是现行 CREATE_CASE 的实现**：Main 的 `CREATE_CASE` handler 用的是 `createNativeWorkspaceCaseV3`（`review-ipc.ts:150-181`）；本文件当前**无生产调用者**（见第 4 节）。
- **不做字段校验**：`title/type/applicant/academicYear` 不做类型/枚举校验，仅 `trim()`；注释指明非法输入「由 saveCase 的安全校验兜底」（`:17`）。
- **不建 V2 聚合**：只写 V1 案卷文件，不触达 `case-store-v2`。

## 2. 导出与关键符号

`export` 共 **1 个**。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `createEmptyCase` | 导出函数 | `:19-49` | `(input: {title; type: ReviewCaseType; applicant; academicYear; domainPackId?: string; reviewTemplate?: {templateId; version}}) => ReviewCase` | 创建并持久化空案卷 |

内部：`UNTITLED_PREFIX = '未命名案卷'`（`:12`）。`getConfigDir` 以 `void getConfigDir` 形式引用（`:52`），仅保证配置目录存在，不参与逻辑。

## 3. 内部逻辑与关键流程

1. `now = new Date().toISOString()`（`:29`）。
2. 组装 `ReviewCase`（`:30-45`）：
   - `id = case-${Date.now()}-${Math.random().toString(36).slice(2,8)}`（`:31`）——时间戳+6 位随机后缀，**非**服务端序列；注释所称「案卷 ID 服务端生成」指不接受用户输入的 ID（`:17`）。
   - `title: input.title.trim() || UNTITLED_PREFIX`（`:32`）——空标题回落「未命名案卷」。
   - `applicant/academicYear` 各自 `trim()`（`:34-35`），不做非空校验。
   - 空集合默认：`documents/rulePacks/items/evidences` 均 `[]`、`isDemo:false`（`:38-42`）。
   - `domainPackId`/`reviewTemplate` 仅在提供时展开（`:43-44`）。
3. `saveCase(reviewCase)` 持久化（`:46`）。
4. `console.log('[审核专区] 已创建案卷: …')`（`:47`）并返回（`:48`）。

**幂等**：不幂等——每次调用生成新 ID 并新写一份案卷。

## 4. 调用者与调用链

- **生产调用者：无**（已证实）——全冻结树 `apps/`+`packages/` 检索 `createEmptyCase`，仅命中本文件定义与 `single-case-workspace.e2e.test.ts:49`（动态 import）、`:108`（测试内创建「青禾竞赛单案审核」案卷）。
- 现行 `CREATE_CASE` IPC（`review-ipc.ts:150-181`）委托 `createNativeWorkspaceCaseV3`（`native-workspace-case-v3.ts:231-282`），不经本文件。
- 出向：`saveCase`（`case-store`，V1 写盘）、`getConfigDir`（`config-paths`，仅副作用保证）。

## 5. 数据 I/O、读写与副作用

- **写**：V1 案卷文件（`saveCase`）；`console.log` 日志。
- **读**：无。
- **无** 网络/定时器/atom/剪贴板。
- **持久化格式**：V1 `ReviewCase` JSON；无迁移逻辑（创建即当前 schema）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 空标题 | `:32` | 回落「未命名案卷」 |
| `saveCase` 抛错（校验失败） | `:17`、`:46` | 向上抛（本文件不 catch） |
| `domainPackId`/`reviewTemplate` 缺省 | `:43-44` | 字段不写入（区别于显式 `null`） |

**恢复**：无部分状态——组装与写入之间无异步间隙；失败即整体未创建。

## 7. 权限与权威状态

- 无 sender/actor 检查；本文件不接触身份。ID 由时间戳+随机生成，不接受外部 ID。
- 权威状态在 `case-store`（V1）；与 V2 聚合（`case-store-v2`）不同账本。

## 8. 修改影响面

- 当前无生产调用者，改动不影响运行路径；但 `single-case-workspace.e2e.test.ts` 依赖其签名与「空标题回落」行为。
- 若将来被接回生产，需注意它绕过 `createNativeWorkspaceCaseV3` 的领域包/模板校验（`native-workspace-case-v3.ts:240-249`）。
- 无存储格式变更。

## 9. 测试证据

- **直接测试**：无专属测试文件；仅 `single-case-workspace.e2e.test.ts:108` 在 e2e 场景里调用（该测试不在本批，未逐行读）。
- **NOT_RUN**：本轮未运行测试/构建/GUI。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一导出 `createEmptyCase` | 已证实 | `:19` |
| 当前无生产调用者 | 已证实 | 全冻结树检索仅 e2e 测试引用 |
| 空标题回落「未命名案卷」 | 已证实 | `:32` |
| `domainPackId` 缺省不写字段 | 已证实 | `:43` |
| ID 生成含 `Math.random` | 已证实 | `:31` |
| e2e 测试的运行结果 | 未知 | 未运行 |
| 「ID 服务端生成」注释与 `:31` 随机生成的口径差 | 推断 | 注释指不接受用户 ID；实际是本地生成 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `createEmptyCase` | 2、3 | `:19-49` | covered |
| `UNTITLED_PREFIX` / 空标题回落 | 3、6 | `:12`、`:32` | covered |
| 字段默认与可选展开 | 3 | `:30-45` | covered |
| 调用者（无生产） | 4 | — | covered |
| 数据 I/O | 5 | `:46-47` | covered |
| 权限 | 7 | — | covered |
| 测试证据 | 9 | — | covered（无专属测试） |
