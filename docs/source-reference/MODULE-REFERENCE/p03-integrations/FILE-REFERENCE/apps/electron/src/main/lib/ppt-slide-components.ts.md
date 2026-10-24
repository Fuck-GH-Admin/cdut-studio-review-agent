---
path: apps/electron/src/main/lib/ppt-slide-components.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4f3d81e4bca5cd5036e812e372c6a68e9042f321
sha256: efa7545c7e94c39c336130f374647d7b68563078ba627388992ef97bd67f49fb
lines: 426
kind: source
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/ppt-slide-components.ts

## 1. 结论与边界

PPT 幻灯片组件库：按视觉角色（`DeckVisualRole`）+样式包+布局计划向 PptxGenJS slide 绘制组件（标题/断言/图表/图片证据/机制/对比/结论/参考文献），统一 objectName 命名与页脚。核心红线：**绝不使用默认数字填充图表**——缺数据仍生成可预览「待补数据」页，交付审计标记 P0 阻止误称成品（`:238-241` 注释）。

## 2. 导出与关键符号

`export` 逐条核对：1 个接口 + 2 个函数 = 3 个导出（类/常量 0）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SlideComponentContext` | 接口（导出） | 8-16 | `{pptx,slide,deckId,projectDir,spec,pack,plan}` |
| `renderSlideComponent` | 函数（导出） | 395-413 | 角色分派（`chart`/`mechanism_diagram`/`conclusion`/`references`/`comparison`/`section`→renderTitle/`image_with_annotation`；`assertion_evidence`/`limitations`/default→renderAssertion）+`addFooter` |
| `buildSpeakerNotes` | 函数（导出） | 415-426 | Speaker Notes（短引/完整引用/讲述要点/证据绑定/转场/时长/追问） |

内部：`noHash/color/objectName/isInside`（`:20-38`，win32 大小写归一包含判定）；`resolveEvidenceImage`（`:40-47`，**assetRef 越界/不存在即抛**）；`readImageSize`（`:49-69`，PNG 头/JPEG SOF 段解析尺寸）；`containImage`（`:71-77` 等比居中）；`addText/addShape/addFooter/addHeader/addCoverKicker/addAcademicAccent/addCloudMotifs/addCrescent`（`:79-185`）；`renderTitle/renderAssertion/niceAxis/renderChart/renderImageEvidence/renderMechanism/renderComparison/renderConclusion/renderReferences`（`:187-393`）。

## 3. 内部逻辑与关键流程

- **图表缺数据**（`:238-264`）：labels/values 过滤（string 非空/finite）；不齐/空→`missing-data-panel`+`待补充真实数据`+说明并 return（不造假数据）。
- 坐标轴（`niceAxis:227-235`）：1.15 倍余量、1/2/2.5/5/10 步进；`axisMin/Max/MajorUnit` 可由 spec 覆盖（`:266-268`）。
- 断言页（`renderAssertion:208-224`）：主张/观察结果/解释三段；侧栏「证据与边界」+citation 短引（缺省 `来源定位见 Speaker Notes`）。
- 图片证据（`renderImageEvidence:294-327`）：`resolveEvidenceImage` 沙箱校验→`readImageSize`→`containImage` 等比放置。
- objectName 统一 `${deckId}/${slideId}/${objectId}`（`:28-30`，可编辑对象命名）。

## 4. 调用者与调用链

入向：PPT 生成链（deck 装配逐页 `renderSlideComponent`）；测试：本批**无专属测试**（scope 无 `.test.ts`）。出向：`pptxgenjs`（类型）、`node:fs/path`、`@profer/shared`（`DeckSlideSpec`/`DeckVisualRole`）、`./ppt-style-pack-service.ts:5`、`./ppt-layout-engine.ts:6`。

## 5. 数据 I/O、读写与副作用

读：`<projectDir>/assets/<assetRef>`（PNG/JPEG 尺寸探测）；写：无（PptxGenJS 内存对象）。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| assetRef 越界/缺 | 抛 `页面 X 的 assetRef 越界或不存在` | 45 |
| 图表缺数据 | 待补数据页（不造假） | 246-264 |
| 尺寸未知 | 按 rect 原样 | 72 |
| 未知角色 | renderAssertion 兜底 | 405-407 |

## 7. 权限与权威状态

- 证据图资产沙箱=`<projectDir>/assets` + `isInside`（`:43-45`）。
- 反造假红线=缺数据显式占位（审计 P0 语义，`:238-241`）。

## 8. 修改影响面

改组件绘制影响幻灯片视觉；改占位语义影响交付审计；影响 deck 生成链。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型/真实 PPT 渲染。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 缺数据不造假+P0 语义 | 已证实 | `:238-264` |
| assetRef 沙箱 | 已证实 | `:40-47` |
| PNG/JPEG 尺寸探测 | 已证实 | `:49-69` |
| 角色分派+兜底 | 已证实 | `:395-413` |
| 真实 PPT 渲染 | 未知 | 未运行 |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| helpers/沙箱/尺寸 | §2 | 20-77 | covered |
| 组件绘制族 | §2,§3 | 79-393 | covered |
| 分派/Notes | §2 | 395-426 | covered |
| 断言 | §9,§10 | — | unknown |
