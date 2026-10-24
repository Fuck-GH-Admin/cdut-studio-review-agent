---
path: apps/electron/src/renderer/components/content-review/review-v3-t08-suggestion.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 12212473de82b5c835b3517f160a40429c0facd1
sha256: 8a2f030480fd46258d60c38eaa3052e64c992d95a054ff8bb9cc2071c946a138
lines: 91
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-t08-suggestion.ts

## 1. 结论与边界

**T08 已复核应用模型**（`:1-5` 注释）：**AI 意见是散文不是可信字段命令**；审核员必须显式选择**既有模板字段**并亲写替换值，才可进入 Main 持有的 UpdateFields 命令。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `T08FieldTarget` | interface（export） | `:8-15` | id/label/scope/subjectId?/field/before? |
| `getT08FieldTargets` | function（export） | `:19-38` | 目标清单（§3） |
| `showT08FieldValue` | function（export） | `:40-46` | 值展示（未填写/附件/multi/object 归一） |
| `parseT08FieldDraft` | function（export） | `:48-77` | 草稿→类型化值（§3） |
| `makeT08FieldUpdate` | function（export） | `:79-91` | 更新负载（§3） |

内部：`editableKinds` 6 类（`:17`）。

## 3. 内部逻辑与关键流程

1. 目标（`:19-38`）：**模板须与案卷 templateId+version 完全一致**否则空（`:20-21`）；readOnly/不可编辑 kind 跳过（`:24`）；case 字段单条、subject 字段逐事项（sectionId 过滤 `:30`）。
2. 解析（`:48-77`）：空值拒（**空值不能代替删除字段** `:51`）；number 有限+min/max 边界（`:53-58`）；boolean 只认 'true'/'false'（`:61`）；date 三重校验（格式+可解析+真实日期，`2026-02-30` 会被拒 `:64-66`）；enum 校验选项（`:69-70`）；multi 分隔去重（`:73`）。
3. 更新（`:79-91`）：类型必须与模板一致（`:83`）；**Main 当前 updateFieldsC0 把一切输入回退成 text——在 L 接通模板类型写入前仅允许真正 text**（**:84-87，防数字/日期被误存为文本**）；case/subject 双负载（`:88-90`）。

## 4. 调用者与调用链

入向：`ReviewV3T08SuggestionReview`（nb-86 手册）。出向：`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

纯函数。

## 6. 分支、失败、取消与恢复

各校验抛错（§3）；不适用。

## 7. 权限与权威状态

红线：散文≠命令（`:2-4`）；模板一致性（`:20`）；text-only 限制（`:84-87`）。

## 8. 修改影响面

- 改目标筛选（模板版本一致性/readOnly）→ 可应用字段面。
- 放宽 text-only 限制（`:87`）→ 需先接通 Main 类型化写入（注释即工单）。
- 改解析校验（数字/日期/枚举边界）→ 人工更正的录入约束。
- 改负载形状（case/subject `:88-90`）→ UpdateFields 命令兼容性。
- 测试锁定（同批 35 行测试）：见测试手册。

## 9. 测试证据

**直接测试 `review-v3-t08-suggestion.test.ts`（2 用例，NOT_RUN）**，断言见测试手册。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出+1 内部+三链 | 已证实 | 逐行读 `:1-91` |
| 测试 2 用例断言 | 已证实 | 测试文件；NOT_RUN |
| Main updateFieldsC0 行为 | 未知（注释自述） | `:84-86` |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 导出 | §2/§3 | `:8-91` | covered |
| 测试 | §9 | 测试文件 | covered（NOT_RUN） |
