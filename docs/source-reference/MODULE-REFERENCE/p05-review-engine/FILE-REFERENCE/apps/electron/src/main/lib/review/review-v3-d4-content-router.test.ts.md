---
path: apps/electron/src/main/lib/review/review-v3-d4-content-router.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ba5a78528a7665daf56636924f66fa4e2b9c48f9
sha256: e782870fcf8efe080430858f6e4847ba5c6d27bef21e0a38390a15a279fc71d1
lines: 94
kind: test
package: p05-review-engine
author: docs-r07-author-nb-01-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-d4-content-router.test.ts

## 1. 测试目标

验证一次拖入多份材料时，业务识别逐份原件独立判断：多份申请件可共同指向同一业务，但不得把两份材料的词拼成“对象+动作”；同时验证显式申请事项、未解析原件与非申请角色的保守行为（文件头 `apps/electron/src/main/lib/review/review-v3-d4-content-router.test.ts:1-4`）。测试只调用纯函数，不读写磁盘、不启动 Electron。

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 2. 用例清单

共 8 个 `test(`。夹具：`templates` 只有 `g03-t01`（公共教学教室借用）与 `g06-t01`（专利成果登记）（`:9-12`）；`doc(id,text,patch)` 构造一个 `role:'application'`、`parseStatus:'parsed'`、单文本块的 `DocumentVersion`（`:14-21`）。

| # | 用例（行） | 设置 | 动作 | 断言 | 依赖 |
| --- | --- | --- | --- | --- | --- |
| 1 | 单份原件仍是唯一候选并可自动建议（`:24-31`） | 一份文本“申请借用公共教学教室，用于班会活动。” | `classifyD4ApplicationDocuments(templates,[doc])` | 长度 1；`g03-t01`；`autoEligible=true` | 无 |
| 2 | 主表+无信号附件：仍按主表给出唯一候选（`:33-41`） | 主表含教室借用；附件只有“姓名/学号” | 同上 | 长度 1；`g03-t01`；`autoEligible=true` | 附件无任何信号词 |
| 3 | 两份材料分别指向不同业务时不抢答（`:43-50`） | 一份教室借用、一份专利登记 | 同上 | 两个模板 ID 排序后相等；全部 `autoEligible=false` | 无 |
| 4 | 两份材料都写同一申请事项时按显式声明匹配（`:52-61`） | 两份都写“申请事项：专利成果登记” | 同上 | 长度 1；`g06-t01`；`confidence=1`；`autoEligible=true` | 显式标签路径 |
| 5 | 两份材料声明的业务互相矛盾时不猜（`:63-69`） | 一份专利、一份教室 | 同上 | `toEqual([])` | 标签数 >1 分支 |
| 6 | 有申请件尚未解析完成时不给自动建议（`:71-78`） | 一份可读教室借用 + 一份 `parseStatus:'pending'`、`blocks:[]` 的申请件 | 同上 | 长度 1；`autoEligible=false`（未断言 templateId，也未断言人工选择路径） | `allParsed` 看全部申请件 |
| 7 | 词分散在两份材料不算同时命中（`:80-86`） | 一份只提“公共教学教室”，一份只提“借用” | 同上 | `toEqual([])` | 逐份原件判定 |
| 8 | 非申请角色不参与业务识别（`:88-93`） | 一份 `role:'evidence'` 的教室借用文本 | 同上 | `toEqual([])` | `role==='application'` 过滤 |

## 3. 真实断言

- 用例 1：`expect(result).toHaveLength(1)`（`:28`）；`expect(result[0]!.templateId).toBe('g03-t01')`（`:29`）；`expect(result[0]!.autoEligible).toBeTrue()`（`:30`）。
- 用例 2：长度 1（`:38`）；`g03-t01`（`:39`）；`autoEligible=true`（`:40`）。
- 用例 3：`expect(result.map(item => item.templateId).sort()).toEqual(['g03-t01', 'g06-t01'])`（`:48`）；`expect(result.every(item => !item.autoEligible)).toBeTrue()`（`:49`）。
- 用例 4：长度 1（`:57`）；`g06-t01`（`:58`）；`expect(result[0]!.confidence).toBe(1)`（`:59`）；`autoEligible=true`（`:60`）。
- 用例 5：`expect(result).toEqual([])`（`:68`）。
- 用例 6：`expect(result).toHaveLength(1)`（`:76`）；`expect(result[0]!.autoEligible).toBeFalse()`（`:77`）。
- 用例 7：`expect(result).toEqual([])`（`:85`）。
- 用例 8：`expect(result).toEqual([])`（`:92`）。

## 4. 未覆盖与脆弱点

未覆盖：

- `ocr-text`/`vision-text` 块被排除的分支（`review-v3-d4-content-router.ts:86-87`）。
- 显式标签唯一但匹配 0 个/多个模板后回落正文信号的分支（`:105-110`）。
- 显式标签使用 `templateId` 精确匹配（`:107` 的第二个条件）。
- 同一模板跨多份原件命中并合并 `matchedSignals`（`:122-125`）。
- 每块 100 行、每块 6000 字符、整体 30000 字符的截断（`:98,115`）。
- 50 个信号键的逐一命中/别名覆盖；测试只用到 `g03-t01`/`g06-t01`。
- `normalized` 的标点/全角/NFKC 边界。
- `doc.blocks` 缺失或非数组。

脆弱点：

- 测试硬编码两个模板与中文文本；信号表增删别名可能改变用例 1/2/3/7 的结果。
- 用例 2 依赖“姓名/学号”不含任何信号词；若未来给 `g03-t01` 增加“姓名”类别名，会改变结果。
- 用例 4/5 依赖正则前缀与“申请事项”字面量；改前缀会破坏。
- 用例 3 用 `sort()` 规避返回顺序，说明实现顺序不是契约；其它断言未排序。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 个用例 | 已证实 | `grep test(` 计数；`:24,33,43,52,63,71,80,88` |
| 逐份原件独立判定，跨文档拼词返回空 | 已证实 | 用例 7 `:80-86`；实现 `:114-125` |
| 多业务候选不自动 | 已证实 | 用例 3 `:43-50` |
| 显式标签唯一时 confidence=1 | 已证实 | 用例 4 `:59` |
| 显式标签冲突返回空 | 已证实 | 用例 5 `:63-69` |
| 未解析申请件使自动资格为假 | 已证实 | 用例 6 `:71-78` |
| 非申请角色不参与 | 已证实 | 用例 8 `:88-93` |
| 测试不读写磁盘/不启动 Electron | 已证实 | 仅 import 纯函数与类型（`:5-7`） |
| OCR/vision/截断/长文本未覆盖 | 已证实（本文件检索） | 无 `format`/长文本构造 |
| 夹具 `doc()` 的 `parseRevision` 等字段不参与分类 | 推断 | 实现只读 active/role/blocks/parseStatus（`:83-92`） |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 单份原件唯一候选 | 1 | 24-31 | covered |
| 主表 + 无信号附件 | 2 | 33-41 | covered |
| 多业务候选不自动 | 3 | 43-50 | covered |
| 显式声明唯一 | 4 | 52-61 | covered |
| 显式声明冲突 | 5 | 63-69 | covered |
| 未解析申请件 | 6 | 71-78 | covered |
| 跨文档拼词 | 7 | 80-86 | covered |
| 非申请角色 | 8 | 88-93 | covered |
| OCR/vision 排除 | 无 | — | unknown |
| 显式标签回落正文 | 无 | — | unknown |
| templateId 显式匹配 | 无 | — | unknown |
| 长文本截断 | 无 | — | unknown |
| 50 信号键逐一 | 无 | — | partial |
