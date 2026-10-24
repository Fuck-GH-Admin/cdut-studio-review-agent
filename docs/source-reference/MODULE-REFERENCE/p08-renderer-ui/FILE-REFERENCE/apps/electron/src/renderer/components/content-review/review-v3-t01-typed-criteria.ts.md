---
path: apps/electron/src/renderer/components/content-review/review-v3-t01-typed-criteria.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f12cc4455ab3adbf71ad21f44ea23d205e397050
sha256: fe595ec9a8f85ec311f91bb53d7673775ad73e570d103fc0d45ad6b97fb95816
lines: 158
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-t01-typed-criteria.ts

## 1. 结论与边界

**T01 数值规则确认合同**（`apps/electron/src/renderer/components/content-review/review-v3-t01-typed-criteria.ts:1-18`）：数值上限是**声明式规则**（非表单最大值/臆造政策，test A15 锁定）；负责人确认产生可序列化、来源版本化的 T04 交接。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| （re-export） | `:19-25` | 上游类型 |
| `T01PublishedNumericCheck` | interface | `:27-40` | 已确认数值检查 |
| `T01PublishedMaterialRequirement` | interface | `:41-50` | 材料最低数要求 |
| `setT01NumberLimit` | 函数 | `:51-62` | 设置数值条件 |
| `confirmT01NumberLimit` | 函数 | `:63-74` | 负责人签认（ownerStatement） |
| `collectT01ConfirmedNumericChecks` | 函数 | `:79-102` | 收集已签认检查（T04 交接） |
| `collectT01RequiredMaterials` | 续 | `:104-115` | 材料最低数（T04/Main 绑定真实 DocumentVersion） |
| `resetT01ImportedConfirmations` | 函数 | `:121-124` | 导入清空签认 |
| `reconcileT01OwnerConfirmations` | 函数 | `:129-158` | 改动使旧签认失效/无关编辑保留 |

## 3. 内部逻辑与关键流程

- `setT01NumberLimit`/`confirmT01NumberLimit`（`:51-74`）：声明数值条件→owner 签认（enteredBy/enteredAt）。
- `collectT01ConfirmedNumericChecks`（`:79-102`）：只收已签认项（**T04 交接只认签认过的**）。
- `resetT01ImportedConfirmations`（`:121-124`）：清 ownerStatement（导入/派生/拷贝共用——见 versioning/template-portability）。
- `reconcileT01OwnerConfirmations(previous, next)`（`:129-158`）：**数值边界/字段含义改动→旧签认失效**；仅 description 等无关编辑→保留（versioning.test 3-4 锁定）。

## 4. 调用者与调用链

- 消费方：T01 作者工具、`review-v3-t01-versioning`/`template-portability`/`model-draft-port`（`resetT01ImportedConfirmations`）、T04 交接。
- 出向：`@profer/shared`（`TemplateVersion`）。

## 5. 数据 I/O、读写与副作用

纯函数；无写。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 导入/派生 | `:121-124` | 清签认 |
| 数值/字段含义改动 | `:129-158` | 签认失效 |
| 无关编辑 | `:129-158` | 保留 |

## 7. 权限与权威状态

ownerStatement 是**负责人签认权威**（enteredBy/enteredAt 留痕）；只随原始规则版本生效（versioning 红线配套）。

## 8. 修改影响面

- 失效判定口径（requirement/字段 label 等）影响签认生命周期。
- T04 交接形状（`T01PublishedNumericCheck`）。

## 9. 测试证据

`review-v3-t01-typed-criteria.test.ts`（96 行，5 用例）直接覆盖。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6+ 导出、签认生命周期 | 已证实 | `:27-158` |
| 失效/保留口径 | 已证实 | `:129-158` |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 6+ 导出 | `:27-158` | covered |
| 签认/失效 | `:51-158` | covered |
