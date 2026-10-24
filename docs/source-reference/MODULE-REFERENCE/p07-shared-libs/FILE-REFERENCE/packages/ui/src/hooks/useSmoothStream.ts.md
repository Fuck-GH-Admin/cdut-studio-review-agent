---
path: packages/ui/src/hooks/useSmoothStream.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 91998093779575ea1ed9e4d39a2f92a34b7287f8
sha256: 58c7a596f92b1f4493adb6ea821d0d5558ee029ea0014c79e3392b75feba4335
lines: 191
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/ui/src/hooks/useSmoothStream.ts

## 1. 结论与边界

**流式文本平滑渲染 Hook**（`packages/ui/src/hooks/useSmoothStream.ts:1-14` 注释，参考 Cherry Studio）：把每秒几十次的流式增量转为打字机式逐字渲染。机制：`Intl.Segmenter` 字符粒度入队（`:8`）+ rAF 循环（`:9`）+ 每帧动态渲染量（队列长加速，`:10`）+ 流结束渐进排空（不一次性 dump，`:11`）。只管显示层平滑，不改数据。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `useSmoothStream` | function（export） | `:58-191` | `({content, isStreaming, minDelay=10}) => { displayedContent }` | 唯一导出 |
| `UseSmoothStreamOptions` | interface（内部） | `:18-25` | `{ content; isStreaming; minDelay? }` | 未导出 |
| `UseSmoothStreamReturn` | interface（内部） | `:27-30` | `{ displayedContent: string }` | 未导出 |
| `segmenter`/`segmentText` | const/function（内部） | `:33-40` | `Intl.Segmenter`（10 locale）/ 拆字符 | 多字节安全 |

## 3. 内部逻辑与关键流程

内部状态（`:63-76`）：`chunkQueueRef`（待渲染字符队列）、`rafRef`、`displayedRef`、`prevContentRef`（算 delta）、`lastRenderTimeRef`、`streamDoneRef`（每渲染同步 `:79`）。

1. **增量检测 effect**（`:82-106`）：content 变化时——`startsWith(prev)` 视为追加，delta 拆字符入队（`:91-97`）；否则视为**重置**（用户重发），清队列并直接全量显示（`:98-103`）。
2. **非流式安全网 effect**（`:109-124`）：`isStreaming=false` 时若 rAF 已停且队列非空 → 同步排空并对齐 `content`（`:114-122`）；rAF 在跑则让其自然排空（`:112`）。
3. **渲染循环 `renderLoop`**（`:127-174`）：队列空 + 流完 → 对齐最终内容并停帧（`:131-140`）；队列空 + 流中 → 等下一帧（`:142`）；`minDelay` 节流（`:147-150`）；每帧渲染量 `count = max(1, floor(queue.length / divisor))`，divisor 流中 8 / 流后 4（`:155-156`）；排空+流完 → 对齐收尾（`:166-173`）。
4. **启动/清理 effect**（`:177-188`）：`isStreaming || 队列非空` 且无 rAF 时启动；cleanup `cancelAnimationFrame`。

## 4. 调用者与调用链

- 入向：`packages/ui/src/hooks/index.ts:5`、`packages/ui/src/index.ts:10` 再导出；包外唯一消费者 `apps/electron/src/renderer/components/agent/AgentMessages.tsx`（流式消息渲染）。
- 出向：React（`useCallback/useEffect/useRef/useState` `:16`）、`Intl.Segmenter`（`:33`）、`requestAnimationFrame/cancelAnimationFrame`。

## 5. 数据 I/O、读写与副作用

- 输入：`content`（累积全文）/`isStreaming`；输出：`displayedContent`（平滑后）。
- 副作用：rAF 循环（帧驱动 setState）；无网络/磁盘/全局共享状态（`segmenter` 为模块级只读单例 `:33`）。
- 并发：单 hook 实例内 ref 串行；无锁。内存：队列随未渲染 delta 增长，流结束后自然排空。

## 6. 分支、失败、取消与恢复

- 分支：追加 vs 重置（`:89-103`）；流中/流后 divisor（`:155`）；空队列两态（`:131-143`）；`minDelay` 节流（`:147-150`）。
- 无 throw；卸载 cleanup 取消 rAF（`:182-187`）即中断平滑（残余队列丢弃——`displayedRef` 不再更新，未显式 flush，行为=卸载即终态）。
- 恢复：`isStreaming` 重新变 true 时 effect `:177` 重启循环。

## 7. 权限与权威状态

无权限分支（纯显示）。`content` 权威在上游（流式状态），本 hook 不回写。

## 8. 修改影响面

改队列/divisor/节流 → AgentMessages 流式观感；`segmentText` 语义（字符边界）→ 中日韩/emoji 渲染完整性。无直接测试（§9）。

## 9. 测试证据

无直接测试（负向：冻结树 `apps/`+`packages/` 全部 `*.test.*` 检索 `useSmoothStream` → 0 专属命中）。间接：AgentMessages 渲染存在。未覆盖：追加/重置判定、排空收尾、minDelay、多字节切分。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一导出 + 4 内部符号；全分支 | 已证实 | 逐行读 `:1-191` |
| 追加/重置判定与渐进排空语义 | 已证实 | `:82-174` |
| 唯一消费者 AgentMessages | 已证实（负向检索） | 全树检索 |
| 动画观感/性能 | 未知 | NOT_RUN |
| 卸载时残余队列的显示终态 | 推断 | cleanup `:182-187` 无 flush |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `useSmoothStream` 全流程 | §3 | `:58-191` | covered |
| 内部 4 符号 | §2 | `:18-40` | covered |
| 调用链 | §4 | 两侧行号 | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
