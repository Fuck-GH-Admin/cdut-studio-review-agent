---
path: apps/electron/src/main/lib/cslab/cslab-debounce.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5b38be68ff3c7c66cebda264194dec425ff7742f
sha256: 1b14d5e141f7b1787d4bd9a8ad00538117e40fbe9ab0a7e5ea665875841a7c91
lines: 57
kind: source
package: p03-integrations
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-debounce.ts

## 1. 结论与边界

CSLab **零依赖防抖器**（`apps/electron/src/main/lib/cslab/cslab-debounce.ts:1-7`）：与 lodash.debounce 差异——额外 `maxWait`（防持续 WAL 追加使同步永不触发）、计时器统一 `unref`（不阻塞 Electron 退出）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CsLabDebounced` | interface | `:9-13` | 调用体 + `cancel()`/`flush()` |
| `createDebouncer` | 函数 | `:15-57` | `(callback, waitMs, maxWaitMs=waitMs*4) => CsLabDebounced` |

## 3. 内部逻辑与关键流程

- `debounced()`（`:36-44`）：首次调用记录 `firstCallAt`；`delay = max(0, min(waitMs, maxWaitMs - elapsed))`（`:41`）——**上限由 maxWait 约束**，持续调用也会在 maxWait 内触发；`setTimeout(...).unref?.()`（`:42-43`）。
- `invoke`（`:30-34`）：清计时、重置 `firstCallAt`、执行回调。
- `cancel`（`:46-49`）：清计时+重置；`flush`（`:51-54`）：有计时才立即 `invoke`（无挂起则无操作）。

## 4. 调用者与调用链

消费方：cslab 画布/DB 同步节流（如 canvas-sync）。出向：无。

## 5. 数据 I/O、读写与副作用

`setTimeout`/`clearTimeout`（unref）；无 I/O。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 持续调用 | `:41` | maxWait 到顶即触发 |
| `flush` 无挂起 | `:52` | 直接返回 |
| `cancel` | `:46-49` | 彻底取消（不触发） |

## 7. 权限与权威状态

无身份语义。

## 8. 修改影响面

`maxWait` 默认 `waitMs*4`；`unref` 移除会阻塞退出。

## 9. 测试证据

无专属测试（全树检索 `createDebouncer` 测试命中 0）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出、maxWait/unref 语义 | 已证实 | `:15-57` |
| 实际节流效果 | 未知 | 未运行 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `createDebouncer`/cancel/flush | `:15-57` | covered |
