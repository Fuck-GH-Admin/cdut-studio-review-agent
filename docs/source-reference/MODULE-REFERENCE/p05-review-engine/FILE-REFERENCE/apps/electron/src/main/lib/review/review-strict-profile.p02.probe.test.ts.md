---
path: apps/electron/src/main/lib/review/review-strict-profile.p02.probe.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 26282d6a691f2af710e76361eccae83bbb2a4692
sha256: 8203367f84d1f516c5eb4b6379deab6a9c85026302243c477c3757e9a64ae9f4
lines: 441
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-strict-profile.p02.probe.test.ts

## 1. 测试目标

P02 特性刻画（头注 :1-8「不改生产行为」）：现有 strict Pi profile + **真实**直接案卷审核工具/账本——工具面、文档/图像证据、部分提交续跑、压缩摘要、Pi 适配器工具组装、空闲压缩。不跑真实模型/Electron。

## 2. 用例清单

14 用例 / 3 describe。夹具 `caseFixture()`（:50-107，真模板发布/真建案/真 `registerMaterial` 图片+文本/PNG 字节）；`strictTools`（:109-123，fakeSdk 捕获工具）；渲染器可注入 stub。

| describe | # | 用例（行） | 核心断言 |
| --- | --- | --- | --- |
| 直接工具/账本兼容 | 6 | 仅 3 个案卷域工具（126-138） | 名单恰好 `review_inspect_document_image/read_documents/submit_result`；Bash/Read/decide_stage 等 8 禁 |
| | | 真读+图像+V2 账本（140-153） | acceptedCount 1、文本含 `2026 年项目申请`、图像 image/png；`node-pi-read-state` 双 blockId 回执 |
| | | 部分提交+续同 run（155-199） | status `running`+missingChecks；压缩摘要含 caseId/`尚缺语义检查`/`P02`；续交 `continuedRun:true`+`【续审同一运行】`；最终 `completed`+2 checks |
| | | 跨案读拒（201-213） | acceptedCount 0/rejectedCount 1、图像 isError、本 run 无回执 |
| | | stale 指派提交拒（215-229） | isError 含 `审核授权失效`、新 run 仍 running |
| | | automation 回合不可写（231-238） | isError 含 `审核授权失效` |
| 生产准入+原件预览 | 4 | host 权限 5 名单（241-258） | 5 true/8 false；绑定更新后旧 false 新 true |
| | | 只留 3+1（260-280） | 混入 Bash 等被丢；重复/缺失 → `审核工具清单异常` |
| | | inspect_original 只收 ID（282-313） | 忽略 `filePath:'/tmp/evil'`（路径含 caseId、roots 限案卷目录）；回执记 `fullyPreviewedDocumentVersionIds`；跨案/缺失/页码 0 全 isError |
| | | stale turn 不写回执（315-346） | 渲染中换指派 → isError、新 run 无回执 |
| Pi 适配器特性刻画 | 4 | （241-258 行外）inspectPreview 授权（248-265 段 :217-235） | 案卷资产渲染 1 次、案卷外拒（渲染不得触发） |
| | | strict profile 组装（349-383） | `review` profile → `[CompactContext+3 review 工具]`；`general` 含 Read/Write/Bash/AskUserQuestion |
| | | 已知缺口：不滤 external customTools（385-395） | `mcp__arbitrary__write`/`inspect_preview` 被保留（注释「NOT an approved secure tool list」） |
| | | 空闲压缩阈值（397-418） | 600/1000+300 不压；750 → 调 `compact('仅按持久化账本总结')` |

## 3. 真实断言

要点如 §2 表（逐条读自 :126-418）；适配器组装用例用 `Bun.Transpiler` 从源码文本切片重组 `assemble`（:349-375，特性刻画非隔离）。

## 4. 未覆盖与脆弱点

- 未覆盖：真实模型回合、Electron 查看器（头注 :7-8 明示范围外）。
- 脆弱点：适配器切片依赖源码锚点字符串（:352-353，移动即 throw `Adapter tool composition moved`）；`fakeSdk` 捕获语义。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 14 用例断言如 §2 | 已证实 | 本文件逐行 |
| 工具面/跨案/stale/回执防御被固定 | 已证实 | 用例族 |
| **已知缺口**：review profile 不过滤 external customTools | 已证实（记录） | 用例 12 :385-395 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 3 直接工具+账本+续跑 | §2 | covered |
| strict 准入/inspect_original | §2 | covered |
| stale/automation 防御 | §2 | covered |
| 适配器组装/压缩 | §2 | covered（特性刻画） |
