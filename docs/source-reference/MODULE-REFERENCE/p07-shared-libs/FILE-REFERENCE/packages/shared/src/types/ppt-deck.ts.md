---
path: packages/shared/src/types/ppt-deck.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 72495b8ddd0b0534933fa677bf06fefea91cdb1a
sha256: b3e78fd50d33e2c45a20d3c9fdbf7932d08ded9b479d9c46df766d24df648778
lines: 103
kind: source
package: p07-shared-libs
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# packages/shared/src/types/ppt-deck.ts

## 1. 结论与边界

PPT Deck Project 领域合同（`:1`："领域服务和 Claude/Pi 工具共享"）：来源谱系 → Brief（含确认态）→ SlideSpec/DeckSpec → 项目 Manifest 的全链数据形状。5 个枚举 + 8 个接口。

不做的事：无运行时逻辑（纯类型）；渲染/编译在领域服务与工具侧。

## 2. 导出与关键符号

**枚举（`:3-21`）**：`DeckSourceStatus`（`current/superseded/historical/conflicted/unknown`）、`DeckSourceKind`（7 值）、`DeckProjectState`（`draft/awaiting_confirmation/confirmed/compiled/needs_revision`）、`DeckDensityBudget`（low/medium/high）、`DeckVisualRole`（10 值：title/section/assertion_evidence/chart/mechanism_diagram/comparison/image_with_annotation/limitations/conclusion/references）。

**接口**：

| 符号 | 行 | 要点 |
| --- | --- | --- |
| `DeckSourceRecord` | `:23-36` | 来源文件记录：路径/`kind`/`size`/`mtimeMs`/`contentHash`/`status`/`locator?`/`title?`/`excerpt?`/`versionSignals?[]` |
| `DeckSourceLineage` | `:38-43` | `{schemaVersion:1; sources[]; conflicts?[]; gaps?[]}` |
| `DeckBrief` | `:45-64` | 目标/受众/场合/时长/页数/核心主张/纳入排除来源/`styleId`/`citationPolicy:'inline_short_notes_full_references'`/`speakerNotesPolicy:'talking_points_transitions_timing_questions'`/`state` + 确认三字段（`confirmedAt`/`confirmationHash`/`confirmedByRequestId`，`:61-63`） |
| `DeckSlideSpec` | `:66-78` | `{slideId; claim; evidenceRefs[]; visualRole; layoutIntent; densityBudget; editableObjects[]; content:Record<string,unknown>; speakerNotes[]; citations[]; assetRefs?[]}` |
| `DeckSpec` | `:80-88` | `{schemaVersion:1; deckId; title; styleId; slides[]; sourceHashes; compiledSlideCache?}` |
| `DeckProjectManifest` | `:90-103` | 项目各文件路径（brief/contextManifest/sourceLineage/deckSpec/stylePack/outputDir/preview?）+ `confirmationTokenHash?` |

## 3. 内部逻辑与关键流程

纯声明。生命周期语义：`DeckProjectState` 五态（draft→awaiting_confirmation→confirmed→compiled，needs_revision 回退）；`confirmationHash`/`confirmationTokenHash` 承载确认防伪；`sourceHashes`/`contentHash`/`compiledSlideCache.specHash` 构成变更检测链。

## 4. 调用者与调用链

PPT 领域服务（deck 项目管理）与 Claude/Pi 工具（`:1` 注释：工具与服务共享合同）；渲染层 PPT 视图。出向：无 import。

## 5. 数据 I/O、读写与副作用

纯类型，无 I/O。

## 6. 分支、失败、取消与恢复

不适用（无控制流）。冲突/缺口语义由 `DeckSourceLineage.conflicts?/gaps?`（`:41-42`）与 `DeckSourceStatus:'conflicted'` 承载；`needs_revision` 是失败回退态。

## 7. 权限与权威状态

确认权：`DeckBrief.confirmedByRequestId`/`confirmationHash`（`:61-63`）与 `DeckProjectManifest.confirmationTokenHash`（`:102`）是确认权威的防伪字段；`citationPolicy`/`speakerNotesPolicy` 是**字面量单值**类型（`:57-58`），锁定引用与讲者备注策略不可随意扩展（改则全链类型破）。

## 8. 修改影响面

改枚举/字段影响 deck 服务、工具协议与渲染；`schemaVersion:1` 四处（`:39`/`:46`/`:81`/`:91`）是持久化格式版本，破坏性改动需迁移；策略字面量（`:57-58`）改动会波及所有构造点。

## 9. 测试证据

无直接测试（检索 `DeckBrief`/`DeckSpec` 于 `*.test.ts` 为 0 命中）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 13 导出（5 枚举 + 8 接口）、字段如 §2 | 已证实 | 文件全读 |
| 五态生命周期/确认防伪字段 | 已证实 | `:7`、`:61-63`、`:102` |
| 策略字面量单值锁定 | 已证实 | `:57-58` |
| 领域服务/工具的实际消费一致性 | 未知 | 不在本批 |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 13 导出全量 | §2 | covered |
| 生命周期/变更链 | §3 | covered |
| 确认权威/策略锁定 | §7 | covered |
| 影响面 | §8 | covered |
| 测试/未知 | §9/§10 | covered |
