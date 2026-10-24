---
path: apps/electron/src/main/lib/agent-session-manager.pi-runtime.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5f2516de6c3cb47ef097c860c32d646b9bf0481b
sha256: 3665dfb3c1225b543d64c9f27ee045f6855a9ac0b29a33416b1cffe2b829df5b
lines: 424
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-session-manager.pi-runtime.test.ts

## 1. 测试目标

Pi runtime 会话持久化隔离（健康检查/删除清理/删除序/预设与选择持久化/runtime 切换保护/检查点迁移/rewind 降级）+ **瞬时断流错误卡可见性回归**（`:374-375` 注释：曾被静默丢弃）。bun:test；electron mock+临时目录+动态 import 隔离（`:31-38`）。

## 2. 用例清单

共 **17 个 `test(`**（机械核）：隔离组 15（`:56-371`）+ 断流卡组 2（`:401,412`）。要点：健康检查递归找嵌套 Pi transcript（`:56`）；删除清理 transcript/graph/harness 不误伤他会话（`:70`）；委派删除序叶到根且普通 parentSessionId 不级联（`:99`）；预设/引用持久化（`:122,130`）；渠道/模型独立持久化（`:138`）；stale 附加路径清理保 updatedAt（`:150`）；同 runtime 更新保 SDK/fork/resume 元数据（`:167`）；快照回滚保元数据（`:185`）；同 runtime 保检查点（`:208`）；旧 fork 引用源检查点删除源时迁移（`:221`）/缺失时摘除（`:242`）；stale 回调不破坏 Pi 元数据（`:252`）；rewind entry 缺失优雅降级（`:264`）；缺 workspaceId 撤销补写（`:309`）。

## 3. 真实断言

代表：`:64-67` `hasSdkJsonl:true`/`hasPiHarnessJsonl:false`/`isOrphan:false`；`:91-96` 三文件删除+他会话 transcript 保留；`:118-119` `toEqual([grandchild,child,parent])`+unrelated 自身；`:159-164` 清理 2 条+`updatedAt` 不变；`:231-239` 迁移路径≠原路径且可还原“baseline”；`:302-306` `undoneUserText`/`remainingMessages:2`；`:363-370` `canRewind:true`+文件回“基线”+workspaceId 补写；`:406-409` 尾部失败卡全量/分页均可见；`:421` 恢复后旧卡不进历史。

## 4. 未覆盖与脆弱点

`autoArchiveAgentSessions`/搜索族无断言（缺口如实）；rewind 物理截断主路径在 pi-fork/本文件均覆盖降级侧，成功截断序列经 `:301` 间接。断言≠已运行：**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 17 用例/断言/回归注释 | 已证实 | 全 424 行 |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 17 用例 | §2/§3 | 56-423 | covered |
