---
path: apps/electron/src/main/lib/agent-preset-operations.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 02b378b049ceb7ef91ef4d2b484fb6b89dd15c12
sha256: 439c61070510f3abf2ab1d500380f3acee5e9dbe125ffbc693f9a49167dca666
lines: 329
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-preset-operations.test.ts

## 1. 测试目标

`agent-preset-operations.ts` 意图门禁/提案两段式/创建复制切换/拒斥前置。bun:test；真 `createAgentPreset`/`listAgentPresets`（manager）+ 假依赖（PresetChangeOperationDependencies/SwitchOperationDependencies 记录调用）混合；临时目录（`__setAgentPresetsBaseDirForTest`，`:29-39`）。

## 2. 用例清单

共 **12 个 `test(`**（机械 grep 核），三 describe：

| 组 | 行 | 用例要点 |
| --- | --- | --- |
| 意图门禁 2 | `:42` | 显式命令→单操作（5 断言：创建/复制/固化→create、中英 switch） |
| | `:50` | 疑问/否定/无关→[]（8 断言）+“请修改研究模式预设”→`['propose_update']`+“把极简预设设为默认”→`['propose_default']` |
| 提案 3 | `:65` | update 提案未确认零写入（updateCalls 空直至 commit） |
| | `:94` | 默认提案影响面/审计 id |
| | `:119` | commit 归属校验/回滚 |
| 创建复制切换 7 | `:146-` | 创建不改当前会话/默认（`created_not_applied`） |
| | `:166-` | 复制跨 scope 校验 |
| | `:186-` | 切换以冻结引用为基准+回滚 |
| | `:206-230` | diff 摘要（elevatesCapabilities 判定） |
| | `:264` | pending 提案生命周期 |
| | `:311` | 非 user 源/意图不匹配/源预设不可用三类拒斥（3 抛错+`listAgentPresets('ws-a')` 长度 4 不变） |

## 3. 真实断言

代表：`:43-47` `toEqual(['create'])` 等；`:51-58` `toEqual([])`×8；`:59-60` 两 propose 值；`:315` `toThrow('只有用户发起的交互会话')`；`:320` `toThrow('当前用户消息没有明确请求创建预设')`；`:325` `toThrow('当前工作区不可用的源预设')`；`:327` 长度 4。断言体逐条已读。

## 4. 未覆盖与脆弱点

未覆盖：`userMessage` 注入点（orchestrator 域外）、审计文件格式、commit 的 sourceUpdatedAt TOCTOU 组合。断言≠已运行：**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 12 用例/断言/替身结构 | 已证实 | 全 329 行 |
| 与 preset-operations.ts 语义一致 | 已证实 | 逐条对照 |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 12 用例 | §2/§3 | 42-328 | covered |
