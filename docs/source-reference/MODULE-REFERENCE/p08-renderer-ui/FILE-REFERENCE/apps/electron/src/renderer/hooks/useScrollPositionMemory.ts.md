---
path: apps/electron/src/renderer/hooks/useScrollPositionMemory.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ff2546e3f41e1b1087ab0f769982d90509715f90
sha256: a31b5ebef3bd0ae46fc56a82950fc4d1a677af4f2f3e0e7494e65174aa240d0c
lines: 90
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/hooks/useScrollPositionMemory.ts

## 1. 结论与边界

滚动位置记忆（运行时）：切换对话/会话时保存并恢复滚动位置，绕开 StickToBottom 弹簧动画导致的卡顿（文件头注释 `apps/electron/src/renderer/hooks/useScrollPositionMemory.ts:1-14`）。导出 `ScrollPositionManager`——放在 `Conversation`（StickToBottom）内部、返回 `null` 的组件（`:33-35`）。

边界：不持久化到磁盘（模块级 Map，应用重载即失）；不管理 StickToBottom 本体（借 `use-stick-to-bottom` 的 context）；“距底部距离”语义而非 scrollTop 绝对值；`ready` 的产生时序由宿主（AgentMessages）负责。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数（组件）导出。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ScrollPositionManager` | 函数/组件（导出） | 35-90 | `({id: string, ready: boolean}) => null` | 渲染期无输出组件 |
| `SCROLL_CACHE_MAX` | 常量（内部） | 20 | `50` | LRU 容量 |
| `scrollPositionCache` | 模块级 Map（内部） | 21 | `Map<string, number>` | id → 距底部像素 |
| `setScrollPosition` | 函数（内部） | 23-30 | `(id, distance) => void` | 先删后插维持 LRU，超 50 淘汰最旧（`:26-29`） |

## 3. 内部逻辑与关键流程

### 3.1 保存（`:42-53`）

`useEffect`：`!el || !restoredRef.current` 直接 return（`:43-44`）——**仅恢复完成后才注册 scroll 监听**，防初始化/恢复前自动滚动污染缓存（注释 `:41`）。`savePosition` 计算 `scrollHeight - scrollTop - clientHeight` 存入（`:46-49`）；`el.addEventListener('scroll', savePosition, {passive: true})`（`:51`）。deps 含 `ready`，`ready→true` 后重跑（`:53` 注释）。

### 3.2 id 切换重置（`:56-61`）

`id !== prevIdRef.current` 时更新 ref 并置 `restoredRef.current = false`，下次 ready 恢复新会话位置。

### 3.3 恢复（`useLayoutEffect`，`:64-87`，绘制前执行避免闪烁）

1. `!ready || restoredRef.current` 短路；否则立即置 `restoredRef=true`（`:65-66`）。
2. 有保存且 `savedDistance > 5`（`:72`）：`stopScroll()`（令 StickToBottom 内部 isAtBottom=false，注释 `:10`）→ 直接设 `el.scrollTop = max(0, scrollHeight - clientHeight - savedDistance)`（`:75-76`）→ `requestAnimationFrame` 下一帧再设一次对抗 ResizeObserver 竞争（`:78-82`）。
3. 无保存或 ≤5px（视为在底部）：`scrollToBottom('instant')`（`:83-86`）。

配合宿主 `Conversation resize={ready && !transitioning ? 'smooth' : 'instant'}`（实际调用点 `components/agent/AgentMessages.tsx:813`；注释 `:12-13` 处为简写 `ready ? …`，实际多 `!transitioning` 条件）。

## 4. 调用者与调用链

入向（全树 `*.ts/*.tsx` 检索，证实）：`components/agent/AgentMessages.tsx:36`（import）、`:815`（`<ScrollPositionManager id={sessionId} ready={ready} />`，位于 `Conversation` 内）。无其它调用者、无测试引用。

出向：`use-stick-to-bottom` 的 `useStickToBottomContext`（`:17`，第三方 npm 包，不在冻结树；取 `scrollRef/stopScroll/scrollToBottom` `:36`）；React effect API；DOM scrollTop/scroll 事件/rAF。

## 5. 数据 I/O、读写与副作用

- 写：模块级 `scrollPositionCache`（内存，LRU 50）；DOM `el.scrollTop`（`:76,:81`）。不写盘、不发网络、无 IPC（依据：本文件无 fs/IPC/fetch）。
- 副作用：scroll 监听（passive）；rAF 一次巩固写。
- 并发：同 id 多组件实例会共享同一 Map 键（后写覆盖，推断）；rAF 写与 ResizeObserver 存在竞争，源码用二次写缓解（`:78-82` 注释）。
- 幂等：恢复置 `restoredRef` 后重复 effect 不二次恢复（`:65-66`）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 |
| --- | --- | --- |
| 不注册保存监听 | 未恢复过/元素缺失 | 43-44 |
| 恢复位置 | `savedDistance != null && > 5` | 72-82 |
| 跳到底部 | 无保存或 ≤5 | 83-86 |
| 重置恢复标记 | id 变化 | 56-61 |

卸载清理：移除 scroll 监听（`:52`）；effect 无 rAF 取消（`requestAnimationFrame` 在恢复回调内，无 handle 保存，`:79`——卸载后回调仍会执行一次写 scrollTop，属无害残留，推断）。无 try/catch；无恢复/重试概念，依据：状态仅内存 Map + ref。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查；纯渲染进程滚动 UI 状态，权威=组件生命周期内内存缓存。

## 8. 修改影响面

- 调用方：`AgentMessages.tsx:815`（唯一）。改 props 形状影响该处。
- 距底部距离语义被保存/恢复两侧共同依赖（`:47,:75`）；改计算公式需同时改两处。
- `> 5` 阈值影响“底部判定”，改动会改变用户感知的恢复行为。
- `SCROLL_CACHE_MAX`/LRU 影响长会话多切换下的记忆保留数。
- 需同步的测试：无（0 test）。

## 9. 测试证据

直接测试：**无**。全树 `*.test.*`/`*.spec.*` 检索 `ScrollPositionManager`/`useScrollPositionMemory` 0 命中。间接证据：无。

真实断言：不适用。未覆盖：LRU 淘汰、恢复阈值、rAF 巩固写、id 切换重置。

NOT_RUN：本轮未运行任何测试/typecheck/构建/GUI/真实滚动；以上行为均为冻结源码静态可见。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出 + 3 内部符号 | 已证实 | `:20-35` |
| 保存仅恢复后注册（防污染） | 已证实 | `:41-53` |
| 恢复两分支 + rAF 巩固 | 已证实 | `:64-87` |
| LRU 50 淘汰 | 已证实 | `:23-30` |
| 唯一调用方 AgentMessages | 已证实 | `AgentMessages.tsx:36,815` |
| 缓存不持久化 | 已证实 | 模块级 Map（`:21`） |
| 卸载后 rAF 残留写无害 | 推断 | `:79` 无 handle 保存 |
| 多实例同 id 覆盖 | 推断 | Map 键语义 |
| `ready` 产生时序 | 未知 | 在 AgentMessages，超出本批 |
| use-stick-to-bottom 内部实现 | 未知 | 第三方包不在冻结树 |
| 运行期滚动表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `ScrollPositionManager` | §2, §3 | 35-90 | covered |
| `setScrollPosition` LRU | §2 | 23-30 | covered |
| 保存监听守卫 | §3.1 | 42-53 | covered |
| id 重置 | §3.2 | 56-61 | covered |
| 恢复/跳底两分支 | §3.3, §6 | 64-87 | covered |
| 调用方 | §4 | - | covered |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |
