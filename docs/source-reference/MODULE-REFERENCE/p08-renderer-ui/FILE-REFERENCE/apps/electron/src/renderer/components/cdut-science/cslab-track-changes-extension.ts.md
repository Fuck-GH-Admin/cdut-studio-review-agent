---
path: apps/electron/src/renderer/components/cdut-science/cslab-track-changes-extension.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bc80dcc7b59d0bdeecad6f396431cb6013fc0569
sha256: c5d14355cc76106dc025f96e494d058572f5a4c8a85faf260206b2b6ce9882a5
lines: 764
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/cslab-track-changes-extension.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

CSLab Track Changes（764 行，头注 :1-8 架构抉择）：修订用 **Marks**（保留文本流可导出 Word）；块级删除/更新用 **Node Attributes**（不破坏 AST）；接受/拒绝单事务保持 Undo 干净；AI 建议按块切片（`planSuggestionApplication`）**绝不跨 Block 加 Inline Mark**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CsLabPersonaMeta`/`CSLAB_PERSONA_META` | interface/const | 22-62 | 5 人设样式（human+4 审稿人设） |
| `CSLAB_REVIEWER_PERSONAS` | const | 64-69 | 4 审稿人设 |
| `InsertionMark`/`DeletionMark`/`CommentMark` | Mark | 118-196 | 修订三 Mark（`inclusive:false`） |
| `TrackChangeBlockAttributes` | Extension | 199-242 | 块级 suggestion 四属性全局注入 |
| `CsLabCollectedKind`/`CsLabCollectedSuggestion` | type/interface | 246-258 | 收集结果 |
| `collectSuggestions` | fn | 272-322 | 文档→建议清单（连续文本合并） |
| `collectDocBlocks` | fn | 326-337 | 块切片（**含原子节点的块排除**，注释 :330-331） |
| `CsLabTrackChanges` | Extension | 371-637 | 6 命令（accept/reject/acceptAll/rejectAll/applyReviewSuggestions/clearAll） |
| `buildReviewerPromptText` | fn | 640-650 | 复制审稿指令兜底（严格 JSON/≤500 字/≤30 条/禁编造） |
| `parseReviewerJson` | fn | 656-706 | 外部粘贴 JSON 宽松解析（非法条目丢弃、≤40 条） |
| `buildLocalGrammarSuggestions` | fn | 709-756 | 本地确定性规则体检（不调模型） |
| `describeApplyResult` | fn | 759-763 | toast 汇总 |

内部：`TrackMarkAttrs`/`trackMarkAttributes`（:72-116）、`markAttrs`（:361-369）、`RangeAccumulator`（:260-268）。

## 3. 内部逻辑与关键流程

1. **`collectSuggestions`**（:272-322）：文本 mark 按 `type:suggestionId` 连续合并；块级 attr 直收；按 from 排序。
2. **acceptSuggestion**（:378-433）：insertion/comment 去 mark、deletion 真删；块级 `suggestionType==='delete'` 删块否则清属性；**删除按位置逆序执行防坐标漂移**（注释 :417-418）；`addToHistory:true`。
3. **rejectSuggestion**（:435-487）：insertion 删文本、deletion/comment 去 mark；先清块属性（不改长度）再逆序删插入文本（注释 :472-473）。
4. **acceptAll/rejectAll**（:489-565）：同语义批量。
5. **`applyReviewSuggestions`**（:567-637）：`planSuggestionApplication` 切片（`plan.ok && !plan.degraded` 才施加，:578-580）；comment/delete 加 mark；replace=原文划线+**末段末尾插新文本同 suggestionId**（注释 :617-618 前面 suggestion 可能已改长度，位置必须 `tr.mapping.map` 重映射）。
6. **`buildLocalGrammarSuggestions`**（:709-756）：重复助词/标点→replace；超长句（>120 字）只批注不改写（注释 :738）；≤40 条。

## 4. 调用者与调用链

入向：文稿编辑器审阅面板（AI 建议施加/接受拒绝/本地体检）。出向：`@tiptap/core`/`@tiptap/pm/model`、`@profer/shared`（`planSuggestionApplication`/`describeSuggestionPlanFailure`，:17-22）。

## 5. 数据 I/O、读写与副作用

编辑器事务；无磁盘/网络。

## 6. 分支、失败、取消与恢复

plan degraded→跳过该条；`!dispatch` 查询态回 true；无 mark schema→apply 回 false。

## 7. 权限与权威状态

- AST 完整性权威：块级更新用属性不破坏 AST（头注 :3-4）；**不跨 Block 加 Inline Mark**（:7）；原子块排除防误改（:330-331）。
- 审计权威：接受/拒绝单事务+`addToHistory`；AI 生成 id `ai-{ts36}-{index}`。
- 诚实兜底：本地体检「只给批注不擅自改写」超长句（:738）；prompt 模板禁编造文献数值（:648）。

## 8. 修改影响面

文稿审阅修订链：审阅面板（AI 建议施加/接受拒绝/全部接受拒绝/清空）、本地语法体检、外部粘贴 JSON 路径。
- 波及面：文稿保存序列化（Marks 可导出 Word）、Undo/Redo 栈、`planSuggestionApplication` 切片契约（shared 侧）。
- 回归关注：不跨 Block 加 Inline Mark、含原子块排除、删除逆序防坐标漂移、replace 末段插入+tr.mapping 重映射、addToHistory 语义。
- 无专属测试文件（全树检索确认）；回归须靠 TipTap 集成人工验证。

## 9. 测试证据

直接测试：无。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出群/行号 | 已证实 | 逐行核对 |
| 逆序删除/切片/不跨块语义 | 已证实 | :7/:330-331/:417-418/:578-580 |
| TipTap 真实集成行为 | 未知 | 无测试、NOT_RUN |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 三 Mark+块属性 | §2 | 118-242 | covered（未测） |
| 6 命令 | §3.2-3.3 | 371-637 | covered（未测） |
| collect/plan/parse/体检 | §3.1/§3.4-3.6 | 272-756 | covered（未测） |
