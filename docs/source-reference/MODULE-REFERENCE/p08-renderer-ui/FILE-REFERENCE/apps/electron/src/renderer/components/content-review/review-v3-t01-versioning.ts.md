---
path: apps/electron/src/renderer/components/content-review/review-v3-t01-versioning.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e7b2054e19bca88894ef29d6ee1d08b2a9052b52
sha256: 27aa99748cecf17ddbcdd5602b72c785644bc9c0081a5257f60cce9a1ba2d80f
lines: 19
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-t01-versioning.ts

## 1. 结论与边界

**T01 作者侧版本派生**（`apps/electron/src/renderer/components/content-review/review-v3-t01-versioning.ts:1`）：**发布版和参考配置的确认只属于原始规则版本**——派生/拷贝必须重置数值规则签认。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `forkT01TemplateVersion` | 函数 | `:6-10` | `(source, version, createdAt) => TemplateVersion` 派生新版本 |
| `copyT01TemplateConfiguration` | 函数 | `:13-19` | `(source, templateId, createdAt) => TemplateVersion` 拷贝为新模板 |

## 3. 内部逻辑与关键流程

- `forkT01TemplateVersion`（`:6-10`）：`version` 须安全整数且 **> source.version**（否则抛 `T01_VERSION_NOT_NEWER`，`:7`）；剔除 `publishedAt`；`resetT01ImportedConfirmations` 重置签认；`status:'draft'`（`:9`）。
- `copyT01TemplateConfiguration`（`:13-19`）：剔 `publishedAt`；`version:1`、`name+'（我的配置）'`、`status:'draft'`、`catalogKind:'custom'`；同样重置签认（`:15-18`）——**绝不继承发布状态与数值确认**（`:12`）。

## 4. 调用者与调用链

- 消费方：T01 模板作者工具。
- 出向：`review-v3-t01-typed-criteria`（`resetT01ImportedConfirmations`）。

## 5. 数据 I/O、读写与副作用

纯函数；无写。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| version ≤ source.version | `:7` | 抛 `T01_VERSION_NOT_NEWER` |
| 派生/拷贝 | `:9`、`:15-18` | 重置签认+draft |

## 7. 权限与权威状态

「确认只属于原始规则版本」（`:1`、`:5`、`:12`）——签认不可随派生/拷贝继承（F02 权威边界）。

## 8. 修改影响面

- `resetT01ImportedConfirmations` 语义（typed-criteria 模块）。
- 版本号校验口径。

## 9. 测试证据

`review-v3-t01-versioning.test.ts`（53 行，4 用例）直接覆盖。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个导出、签认重置红线 | 已证实 | `:1-19` |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 2 个导出 | `:6-19` | covered |
