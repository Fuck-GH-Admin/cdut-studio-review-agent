---
path: apps/electron/src/renderer/atoms/study-retrieval-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 548be85c4f729f0eb2648884a4adcf7e7ab474ba
sha256: 133722251e86544062e5eb99a48bd3ed810eec501f9e1cb9cb90746fb867f720
lines: 24
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/study-retrieval-atoms.ts

## 1. 结论与边界

**AI 速课堂「认知底座」双引擎状态 Atoms**（`apps/electron/src/renderer/atoms/study-retrieval-atoms.ts:1-10`）：课堂知识检索引擎（classic 精准查点/graphrag 全书脉络）+ 跨课终身记忆引擎（classic 当堂专注/hipporag 海马体联想）。**引擎取值与主进程 settings.json 一一对应**，弹窗/入口胶囊/设置页共享同一原子源实时同步；切换经 Electron IPC 异步落盘，**下一轮推理即刻生效**（`:8-9`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `StudyEngineType` | type | `:14` | classic/graphrag |
| `MemoryEngineType` | type | `:15` | classic/hipporag |
| `studyRetrievalEngineAtom` | atom | `:18` | 课堂检索引擎（默认 classic） |
| `memoryRetrievalEngineAtom` | atom | `:21` | 记忆引擎（默认 classic） |
| `cognitionModalOpenAtom` | atom | `:24` | 认知底座弹窗开关 |

## 3. 内部逻辑与关键流程

纯 atom；与 settings.json 一一对应（`:8`）；IPC 异步落盘+下一轮生效（`:9`）。

## 4. 调用者与调用链

- 消费方：认知底座弹窗/入口胶囊/设置页（共享原子源）。
- 出向：Electron IPC（落盘）。

## 5. 数据 I/O、读写与副作用

纯内存状态（或经注明的持久化）；无 I/O。

## 6. 分支、失败、取消与恢复

N/A（纯状态 atom，无分支逻辑）。

## 7. 权限与权威状态

「一一对应 settings.json」（`:8`）——UI 与主进程引擎选择同步权威。

## 8. 修改影响面

atom 形状与消费组件耦合。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

5 个导出、同步契约已证实（`:14-24`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 5 个导出 | `:14-24` | covered |
