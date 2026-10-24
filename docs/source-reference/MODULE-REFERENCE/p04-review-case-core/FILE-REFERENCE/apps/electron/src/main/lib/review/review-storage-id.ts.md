---
path: apps/electron/src/main/lib/review/review-storage-id.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1c668c515f7982ae47699ea133799ddf38fa8b6b
sha256: e00408d4e1db4dd764ec4fbaded53028bbc6e0c5fa7135e0bb903bbaeb532583
lines: 16
kind: source
package: p04-review-case-core
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-storage-id.ts

## 1. 结论与边界

V2 文件系统路径段的**唯一信任边界**：`assertSafeReviewStorageId` 把来自渲染层 IPC、模型编排、导入记录、磁盘扫描的 case/run/node ID 收窄为安全路径段（`apps/electron/src/main/lib/review/review-storage-id.ts:1-15`）。

明确不做的事：不解析路径、不建目录、不查存储——只做入参断言（`:8-15`）。

## 2. 导出与关键符号

`export` 共 **1 个**。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `assertSafeReviewStorageId` | 导出断言函数 | `:8-15` | `(value: unknown, kind: 'caseId'\|'runId'\|'nodeId' = 'caseId') => asserts value is string` | 非法即抛 |

内部：`SAFE_SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/`（`:6`）。

## 3. 内部逻辑与关键流程

拒绝条件（`:12-14`，任一命中即抛「非法 ${kind}：只能使用安全的字母数字、单点、下划线或连字符，不能包含路径或 ..」）：

1. 非字符串；
2. 不匹配 `SAFE_SEGMENT`（首字符必须字母数字，之后最多 127 个 `[A-Za-z0-9._-]`）；
3. 等于 `.` 或 `..`；
4. 含 `..`（如 `bad..id`）。

注意正则本身允许 `.`，故第 3、4 条独立拦截点段与双点。

## 4. 调用者与调用链

**生产调用者 19 个文件**（全冻结树检索，含本文件自身与测试）：`application-service.ts`、`batch-store.ts`、`case-lifecycle-v3.ts`、`case-store-v2.ts`、`pi-case-review-service.ts`、`report-export-v2-service.ts`、`review-c0-authority.ts`、`review-ipc.ts`、`review-pi-run-bridge.ts`、`review-strict-pi-tools.ts`、`review-v3-background-technical-coordinator.ts`、`review-v3-case-disk-tx.ts`、`review-v3-f13-main-service.ts`、`review-v3-main-author-plan-ipc.ts`、`review-v3-main-local-product-intake.ts`、`review-v3-main-trust-port.ts`、`review-v3-t09-main-service.ts`、`run-store-v2.ts`（另 `review-storage-id.test.ts` 为测试）。调用点计数最高：`run-store-v2.ts` 11 处、`review-ipc.ts` 11 处、`batch-store.ts` 10 处、`case-store-v2.ts` 8 处。

## 5. 数据 I/O、读写与副作用

无 I/O、无副作用；纯同步断言。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 非字符串/不匹配/`.`/`..`/含 `..` | `:12-14` | 抛 `非法 ${kind}：…` |
| 合法段 | `:15` | 断言通过（无返回值） |

失败即抛、无恢复态；调用方通常在目录生成前调用。

## 7. 权限与权威状态

- 无身份检查；这是**路径安全**边界而非权限边界。
- 文件头明示入参来源不可信（`:2-5`）。

## 8. 修改影响面

- 收紧/放宽正则会同时影响 19 个生产文件的全部 ID 校验（`review-storage-id.test.ts` 以 `badIds` 全集回归：`../../escaped`、`/tmp/traversal`、`a/b`、`a\b`、`.`、`..`、`bad..id`、`%2e%2e`、空串、前导空格、129 字符超长，`review-storage-id.test.ts:30-31`）。
- `kind` 参数只影响错误文案，不影响判定。

## 9. 测试证据

- `review-storage-id.test.ts`（120 行，7 用例）直接覆盖：非法 ID 全集 ×3 kind 拒绝、合法 ID 通过（`:34-43`）、`createCaseFromTemplate` 服务层拒绝（`:45-52`）、聚合读写/命令事务拒绝（`:54-67`）、运行/产物 ID 拒绝（`:69-89`）、Pi 目录与报告导出拒绝（`:91-99`）、批次成员拒绝（`:101-109`）、合法路径成功（`:111-119`）。
- **NOT_RUN**：本轮未运行测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一导出为断言函数 | 已证实 | `:8` |
| 拒绝规则四条 | 已证实 | `:12-14` |
| 19 个生产调用文件 | 已证实 | 全冻结树检索（`*.ts`/`*.tsx`，apps+packages） |
| 测试 7 用例的断言内容 | 已证实 | `review-storage-id.test.ts:33-119` 只读核对 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `assertSafeReviewStorageId` | 2、3 | `:8-15` | covered |
| `SAFE_SEGMENT` | 3 | `:6` | covered |
| 拒绝分支四条 | 6 | `:12-14` | covered |
| 调用者面 | 4 | — | covered |
| 测试证据 | 9 | — | covered |
