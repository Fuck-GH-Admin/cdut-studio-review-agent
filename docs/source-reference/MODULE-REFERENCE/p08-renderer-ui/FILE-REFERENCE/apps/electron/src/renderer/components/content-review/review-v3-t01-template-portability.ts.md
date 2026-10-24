---
path: apps/electron/src/renderer/components/content-review/review-v3-t01-template-portability.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: eb2b68684bcfc69d693b88b5b29da1d9824aa7cc
sha256: 86ed7a4d5cdfd601d54374a192c78a364bed953a6cd1ba51f3465152f742d6dc
lines: 117
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-t01-template-portability.ts

## 1. 结论与边界

**T01 便携无代码模板**（`apps/electron/src/renderer/components/content-review/review-v3-t01-template-portability.ts:1`）：**data only，绝不构成审批或政策签名**。导出剥 `publishedAt` 且强制 `status:'draft'`（`:12-13`）；导入**不继承外部政策/发布声明**（`:108`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `T01TemplateEnvelope` | interface | `:5-8` | `{format:'review-t01-template/1', template}` |
| `exportT01Template` | 函数 | `:9-14` | 导出（draft 化） |
| `importT01Template` | 函数 | `:93-117` | 导入（深验+清空降级） |

内部：`isObj`/`nonEmpty`（`:15-17`）、`FIELD_KINDS`/`EXECUTIONS`/`TARGET_SCOPES`/`STAGE_KINDS`（`:18-21`）、`assertImportedTemplateShape`（`:28-91`，TAR-19 深验）。

## 3. 内部逻辑与关键流程

- **`assertImportedTemplateShape`（TAR-19 深验）**（`:28-91`）：fields（key/label/kind/required+作用域+sectionId，`:32-43`）、materialSlots（id/name/minCount/maxCount/acceptedKinds+requiredAt，`:44-54`）、sections/criteria（execution∈3、targetScope∈3、deterministicConstraint 格式——`schemaVersion:1/kind:'field-number-limit'/operator∈{lte,gte}/threshold 有限数`，`:55-79`）、stages（kind∈7+executorRole，`:80-85`）、outputs（`:86-90`）——**错误带字段路径**（`:25`）。
- **`importT01Template`**（`:93-117`）：JSON 解析（`T01_IMPORT_JSON`）→format 校验→顶层校验（`schemaVersion:2`/objectType∈6，`:101-106`）→深验→**强制降级**：`policyVersionIds:[]`、`policyRefs:[]`、`executionScope/publishedAt:undefined`、`status:'draft'`、`catalogKind:'custom'`、`sourceNote` 加「外部导入草稿：政策引用已清空」（`:109-116`）+ `resetT01ImportedConfirmations`（清 owner 签认）。

## 4. 调用者与调用链

- 消费方：T01 导入导出工具、`model-draft-port`（`importT01Template` 复用）。
- 出向：`review-v3-t01-typed-criteria`（`resetT01ImportedConfirmations`）。

## 5. 数据 I/O、读写与副作用

纯函数（JSON 编解码）；无写。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| JSON 坏 | `:96` | `T01_IMPORT_JSON` |
| format 错 | `:99` | `T01_IMPORT_FORMAT` |
| 顶层不合规 | `:101-106` | `T01_IMPORT_TEMPLATE_INVALID` |
| 深验失败 | `:28-91` | 分类错误（FIELDS/SLOTS/SECTIONS/CRITERIA/STAGES/OUTPUTS）+路径 |
| 伪造发布/政策 | `:109-116` | 强制降级清空 |

## 7. 权限与权威状态

- 「绝不构成审批或政策签名」（`:1`）；「外部文件对本机政策/发布状态的声明一律不继承」（`:108`）。
- 保留数值约束但**清 ownerStatement**（`:26`、`resetT01ImportedConfirmations`）——待本地重新签署。

## 8. 修改影响面

- `FIELD_KINDS`/`STAGE_KINDS` 等集合与 `TemplateVersion` 联合绑定。
- TAR-19 深验口径是导入安全面。

## 9. 测试证据

`review-v3-t01-template-portability.test.ts`（68 行，6 用例）直接覆盖。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 个导出、TAR-19 深验+强制降级 | 已证实 | `:5-117` |
| 不继承政策/清签认红线 | 已证实 | `:26`、`:108-116` |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 3 个导出 | `:5-117` | covered |
| 深验 | `:28-91` | covered |
| 降级清空 | `:109-116` | covered |
