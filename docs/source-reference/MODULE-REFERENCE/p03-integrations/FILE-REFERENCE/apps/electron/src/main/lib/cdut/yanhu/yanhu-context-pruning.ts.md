---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-context-pruning.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b5ee3ce9136e9f3cea43f131ce9fbda24b029f43
sha256: 3b43b9aad5c02981a9d79e16bc5691bc8dbd2713ad4bf0eac01e3416d5093341
lines: 156
kind: source
package: p03-integrations
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-context-pruning.ts

## 1. 结论与边界

智联万站·多步工具循环上下文剪枝（文件头 `:1-9`，纯函数、不依赖 Electron/供应商适配器）：只重写「早于最后 keepSteps 步」的旧 tool 结果，保留 `toolCallId`/`isError`，阻断续接消息 O(N²) 膨胀；最后 keepSteps 步完全不动（保护 Anthropic 家族必需的最新 thinking 签名块与工具配对完整性）。另含跨轮历史脱敏瘦身（History Slimming）。

不做的事：不改 assistant 消息/工具配对；不动最近观测结果。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `PRUNE_KEEP_STEPS` | const | `:14` | 2（默认保留末尾步数） |
| `HISTORY_RESULT_MAX_CHARS` | const | `:39` | 200（历史通用结果上限） |
| `HISTORY_ERROR_MAX_CHARS` | const | `:46` | 600（历史错误回执上限——错误含自愈诊断，远大于通用上限，`:42-45`） |
| `slimYanhuToolResultForHistory` | function | `:61-83` | 落盘历史时的单行紧凑摘要 |
| `pruneYanhuContinuationMessages` | function | `:96-156` | `(messages, {keepSteps}) => ContinuationMessage[]` |

内部：`PRUNED_READ_PAGE/PRUNED_LOGS/PRUNED_GENERIC`（`:17-20`，占位文本）；`PRUNED_PREFIX_CHARS=80`/`PRUNED_ERROR_CHARS=60`（`:22-24`）；`OBSERVATION_TOOLS={'yanhu_read_page','yanhu_capture_visual'}`（`:34`，**最近一次结果必须逐字保留**——不变式注释 `:26-33` 记历史缺陷根因：台账/标定表被压缩后模型只能猜编号猜坐标）；`extractPageDigestTitle`（`:49-53`，`=== [PageDigest: 标题] ===`）；`isToolStep`（`:86-88`）。

## 3. 内部逻辑与关键流程

### 3.1 `slimYanhuToolResultForHistory`（`:61-83`）

**错误回执绝不套成功态摘要模板**（`:62-67`，历史事故：熔断诊断无 PageDigest 头被压成 `[已读取页面]`，模型重启后盲目重复点击）——isError 仅按 600 截断。`yanhu_read_page`：含“页面无变化”→`[已读取页面: 无变化]`；有标题→`[已读取页面: 标题]`；否则 `[已读取页面]`。network/console 日志各折叠为一句。通用超 200 截断加 `…`。

### 3.2 `pruneYanhuContinuationMessages`（`:96-156`）

1. 统计总步数（含 toolCalls 的 assistant 消息为一步）并建 toolCallId→name 映射；`totalSteps<=keepSteps` 原样返回（`:102-110`）。
2. 记录每个观测工具的**最新** toolCallId 为 `preserved`（`:112-120`）。
3. 遍历：assistant 原样；tool 消息仅当属于旧步骤（`stepIndex < totalSteps-keepSteps`）才压缩——preserved 原样、read_page→`PRUNED_READ_PAGE`、日志→`PRUNED_LOGS`、**错误回执保留 60 字符诊断前缀**（`:141-145`，20 步循环长报错防膨胀）、其余超 80 截断/空→`PRUNED_GENERIC`；`toolCallId`/`isError` 保留（`{...result, content}`）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）：智联万站多步工具循环（continuationMessages 累积处）与助手消息落盘历史处；直接测试 `yanhu-context-pruning.test.ts`。出向：`@profer/core`（`ContinuationMessage`/`ToolResult` 类型）。

## 5. 数据 I/O、读写与副作用

纯函数；无 I/O/日志。

## 6. 分支、失败、取消与恢复

无 throw；分支见 §3（保留/压缩/截断）；无异步/取消/恢复。

## 7. 权限与权威状态

诚实边界：错误信息是“排查与自愈的唯一线索，一律原样保留（仅长度截断）”（`:67`）；观测台账逐字保留是不变式（`:26-33`）；占位文本自带“若找不到请重新调用”指引（`:18`）。

## 8. 修改影响面

改剪枝/瘦身规则 → 影响多步循环 Token 占用与模型行为（台账依赖）；`ContinuationMessage` 契约联动 `@profer/core`。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `yanhu-context-pruning.test.ts`（详见其手册）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 旧步压缩/末 keepSteps 不动 | 已证实 | `:122-155` |
| 观测工具最新结果逐字保留 | 已证实 | `:112-120/:136` |
| 错误回执保守（600/60 截断不套模板） | 已证实 | `:62-70/:141-145` |
| 历史事故口径 | 已证实 | `:62-67` 注释 |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 五常量/两占位族 | 2 | `:14-34` | covered |
| `slimYanhuToolResultForHistory` | 3.1 | `:61-83` | covered |
| `pruneYanhuContinuationMessages` | 3.2 | `:96-156` | covered |
