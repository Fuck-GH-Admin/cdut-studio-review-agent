---
path: apps/electron/src/main/lib/review/review-v3-f06-evidence.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 47aeb63508ea78eb2e6bf33926d7c410ea4fccb8
sha256: 4c0afae525c72bae65d8b11a5cf62362a3c30d79152486056e32cea46aba866f
lines: 166
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-f06-evidence.ts

## 1. 结论与边界

F06 证明链**只读投影**与人工绑定预检（头注 :1-6）：解释现有证据版本、候选来源和多对多关系；业务真值仍是 `CaseAggregateV2`/`SetEvidenceLink`。绝不按文件名/同名主体自动确定归属或计分；模型/提取器只产生提议。

边界：不写任何状态（预检纯函数）；不做 IPC/身份检查；`SetEvidenceLink` 写入由 `application-service` 承担。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `F06ExtractedFact` | interface | 9-13 | 提取事实（subjectId/fieldKey/sourceRefs?） |
| `F06LinkValidity` | type | 15 | `'current'\|'retired'\|'missing-document'\|'stale-source'` |
| `F06LinkedFact` | interface | 17-20 | `{link, validity}` |
| `F06EvidenceGroup` | interface | 22-32 | 文档分组（links/suggestions/sameContent/ambiguous/unassigned 等） |
| `f06LinkValidity` | fn | 43-51 | 单链接当前性 |
| `projectF06Evidence` | fn | 54-113 | 全案卷证明投影 |
| `F06AssignmentPreview` | interface | 115-122 | 预检结果形状 |
| `previewF06Assignment` | fn | 128-155 | 绑定预检（防复活/去重/校验） |
| `describeF06Location` | fn | 157-166 | SourceRef 位置的人读描述 |

内部：`nonEmptyHash`（:34-36）、`currentDocument`（:38-40）。

## 3. 内部逻辑与关键流程

1. **`f06LinkValidity`**（:43-51）：文档不存在 → `missing-document`；`active===false` → `retired`；`blockRef` 存在且 caseId/versionId/parseRevision 任一不匹配 → `stale-source`；否则 `current`。
2. **`projectF06Evidence`**（:54-113）：范围=role==='evidence' 或有链接或被提取事实引用的文档（:65-67）；每文档：
   - links 全量带 validity（:69-71）。
   - suggestions（:72-85）：仅 `active` 文档；提取事实须主体存在、fieldKey 非空、sourceRef 三重匹配（caseId/versionId/parseRevision + 有 location，:76-78）；同 `[subjectId,fieldKey]` 去重、已有同名链接不重复建议（:80-82）。
   - ambiguous（:87-98）：候选主体（`candidate`+`current` 链接 ∪ 建议）中，同名（title 相同）主体全部标歧义；单候选且多候选主体时也标（:93-98，注释 :92「同名主体必须显式区分 ID，绝不以姓名或文件名推断」）。
   - `sameContentVersionIds`（:99-106）：内容哈希相同的其他版本（仅提醒，注释 :27「不代表重复申报/可跨主体复用」）。
   - `currentConfirmedCount`（:108）：confirmed+current 链接数；`unassigned`（:109-110）：无 current 非 rejected 链接且无建议。
3. **`previewF06Assignment`**（:128-155）：文档缺失/退役 → errors（:137-138）；空事实/空主体/未知主体 → errors（:139-141）；同三元组已有 `rejected` 链接 → error `已有人工拒绝的同一绑定；须先单独复核旧记录，不可静默复活`（:145-146，注释 :124-126）；`subjectIdsToCreate` 去重后排除已存在（:134/:150）。
4. **`describeF06Location`**（:157-166）：五种 `location.kind` 人读文案；无 ref → `仅关联原件版本（尚无块级定位）`。

## 4. 调用者与调用链

入向：**生产零调用者**——全树检索 `projectF06Evidence|previewF06Assignment|f06LinkValidity|describeF06Location` 仅命中本文件与 `review-v3-f06-evidence.test.ts:4`（否定范围：`apps/electron/src` 全部 `.ts`）。出向：仅 `@profer/shared` 类型（:7）；纯函数。

## 5. 数据 I/O、读写与副作用

纯投影/预检：无磁盘/网络/日志；不改聚合。

## 6. 分支、失败、取消与恢复

无 throw 路径；全部结果经返回值表达（errors 数组 / validity 枚举）。无状态、无取消。

## 7. 权限与权威状态

- 归属权威：只认显式 ID 绑定（注释 :25-27/:92）；同名/同内容不推断、不折叠、不删除历史。
- 链接当前性权威：`active` 文档 + blockRef 三重一致（:43-51）；retired/stale 不计当前确认（:108）。
- 拒绝历史权威：rejected 三元组不静默复活（:145-146）。
- 无 sender/role 检查（纯读模型）。

## 8. 修改影响面

当前无生产消费方——改动只影响本文件测试；若 F06 UI/服务接线（未来），投影形状 `F06EvidenceGroup` 将成契约。历史消费线索：`application-service.setEvidenceLink`（`buildEvidenceLinks`）与 UI 证据面板可能计划消费（未知，静态未见接线）。

## 9. 测试证据

直接测试 `review-v3-f06-evidence.test.ts`（6 用例 / 1 describe；`fixture()` 构造 15 文档（12 photo + notice/notice-copy 同哈希 + old-scan 退役）与 5 链接（含两同名主体 `张同学`）:7-45；纯函数；NOT_RUN）：
1. `:48-53` 15 组、12 photo 一张不漏、`photo-12.unassigned===true`。
2. `:55-63` photo-1 两链接主体 `['student-101','student-102']`、`currentConfirmedCount===0`、`ambiguousSubjectIds` 两同名主体、`获奖等级` 一证多项 2 组。
3. `:65-72` validity 四态：old-scan 链接 `retired`、parseRevision 不符 `stale-source`、不存在 `missing-document`；退役文档 `currentConfirmedCount===0`。
4. `:74-80` 同内容互指 `sameContentVersionIds` `['notice-copy']`/`['notice']`；不改 `notice-one` 状态（不折叠）。
5. `:82-99` 建议仅真实来源：4 候选（跨案/旧 parseRevision/已被拒绝覆盖）只产生 `student-103` 一条建议且 sourceRef 相等；`previewF06Assignment` 报「不可静默复活」且 `subjectIdsToCreate` 仅 `student-103`。
6. `:101-116` 手动绑定：`supportsFact` trim 后去重（existing 2 条、待建 1 条）；旧原件+陌生主体 → 两条 error；`describeF06Location(file)` `'仅文件级定位'`。

未覆盖：`describeF06Location` 其余 4 种 kind 文案、`stale-source` 的 caseId/versionId 分支单独断言、无 location 的 sourceRef；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 导出/行号如 §2 | 已证实 | 逐条 |
| 同名不推断/不复活拒绝/不折叠同内容 | 已证实 | :87-98/:145-146 + 测试 :55-63/:74-99 |
| 生产零调用者 | 已证实（否定） | 全树检索 |
| 未来接线计划 | 未知 | 静态不可判 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `f06LinkValidity` 四态 | §3.1/§9 | 43-51 | covered |
| `projectF06Evidence`（建议/歧义/同内容/未绑定） | §3.2/§9 | 54-113 | covered |
| `previewF06Assignment`（防复活/去重/校验） | §3.3/§9 | 128-155 | covered |
| `describeF06Location` 5 kind | §3.4/§9 | 157-166 | partial（1/5 断言） |
