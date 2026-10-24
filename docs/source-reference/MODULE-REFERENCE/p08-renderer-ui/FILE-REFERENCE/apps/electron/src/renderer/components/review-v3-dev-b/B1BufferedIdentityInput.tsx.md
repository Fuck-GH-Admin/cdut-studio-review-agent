---
path: apps/electron/src/renderer/components/review-v3-dev-b/B1BufferedIdentityInput.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c2461b6b7a2f0fa4bdbfce8b6ba4368ff499684e
sha256: fbd4d26f78315ef440dae99d2496f026f93e7f4055bfdf0440cadc898046ed00
lines: 103
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/review-v3-dev-b/B1BufferedIdentityInput.tsx

## 1. 结论与边界

**B1 author 标识编辑边界**（`apps/electron/src/renderer/components/review-v3-dev-b/B1BufferedIdentityInput.tsx:1-5`）：**IME 中间文本永不触发 source/field/target 图变更**；聚焦编辑期间父 prop 变化**不得被过期 blur/Enter 回调覆盖**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `B1BufferedIdentityInputProps` | interface | `:8-13` | 输入 props |
| `B1IdentityFinishResult` | type | `:14-18` | 完成结果 |
| `resolveB1IdentityFinish` | 函数 | `:19-37` | 完成解析（防过期回调） |
| `B1BufferedIdentityInput` | 组件 | `:38-103` | 缓冲输入 |

## 3. 内部逻辑与关键流程

- 缓冲输入（IME 中间态本地缓冲，不发图变更，`:2`）。
- `resolveB1IdentityFinish`（`:19-37`）：**聚焦期间 prop 变化检测**——过期 blur/Enter 回调不覆盖（`:3-4`）。

## 4. 调用者与调用链

- 消费方：ReviewV3AuthorWizard（标识编辑）。
- 出向：React。

## 5. 数据 I/O、读写与副作用

本地缓冲；图变更仅在完成时（经回调）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| IME 中间态 | `:2` | 不发图变更 |
| 过期回调 | `:19-37` | 不覆盖 |

## 7. 权限与权威状态

**IME≠图变更**（`:2`）；**过期回调防御**（`:3-4`）——B1 author 编辑边界红线。

## 8. 修改影响面

`B1IdentityFinishResult` 结果契约。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 个导出、IME/过期防御 | 已证实 | `:1-103` |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 4 个导出 | `:8-103` | covered |
