---
path: apps/electron/src/renderer/lib/debounce.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 12f6ed5a3adf3bbccb418fcb6d5678da2de4784d
sha256: a345f9cde59fc782e5a3e678a0ddce7aeca2814b193791f068bedcb0f95fa90c
lines: 95
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/debounce.ts

## 1. 结论与边界

尾部触发防抖原语（trailing-edge debounce）工厂（95 行）：`createDebouncedCallback` 返回带 `flush`/`cancel`/`pending` 附加方法的防抖函数，语义对齐 `lodash.debounce(fn, wait, { trailing: true })` 与 `use-debounce` 的 `useDebouncedCallback`（`apps/electron/src/renderer/lib/debounce.ts:4-9`）。边界：纯本地闭包状态，无模块级可变状态、无 I/O；只做时间片防抖，文档明确禁止用于 resize/scroll/pointer 跟帧场景（`apps/electron/src/renderer/lib/debounce.ts:17-19`）；冻结树内当前无生产调用者（见 §4）。

## 2. 导出与关键符号

- 函数导出 1 个：`createDebouncedCallback`（`apps/electron/src/renderer/lib/debounce.ts:40-95`）。
- 类型导出 2 个：`DebounceOptions`（`apps/electron/src/renderer/lib/debounce.ts:22-28`，仅 `maxWait?` 一个字段）、`DebouncedCallback`（`apps/electron/src/renderer/lib/debounce.ts:30-38`，调用签名 + `flush`/`cancel`/`pending` 三方法声明）。
- 常量导出 0 个。合计导出 3 个符号，与源码逐条一致。
- 内部符号（标注"内部"）：闭包状态 `timer`/`pendingArgs`/`burstStart`（`apps/electron/src/renderer/lib/debounce.ts:46-49`）、`clearTimer`（`apps/electron/src/renderer/lib/debounce.ts:51-56`）、`invoke`（`apps/electron/src/renderer/lib/debounce.ts:58-64`）、`debounced` 闭包本体（`apps/electron/src/renderer/lib/debounce.ts:66-82`）及三个附加方法实现（`apps/electron/src/renderer/lib/debounce.ts:84-92`）。

## 3. 内部逻辑与关键流程

1. 工厂初始化（`apps/electron/src/renderer/lib/debounce.ts:40-49`）：解构 `maxWait`（`:45`），`timer=null`、`pendingArgs=null`、`burstStart=null`（`:46-49`），返回 `debounced`（`:94`）。
2. `clearTimer`（内部，`apps/electron/src/renderer/lib/debounce.ts:51-56`）：仅当 `timer !== null` 才 `clearTimeout` 并置 null，幂等。
3. `invoke`（内部，`apps/electron/src/renderer/lib/debounce.ts:58-64`）：取走 `pendingArgs` 并置 null、`burstStart=null`、`clearTimer()`（`:59-62`）；`args` 非空才调 `fn(...args)`（`:63`）。这是唯一执行用户回调的位置，执行后全部状态复位。
4. 主调用 `debounced(...args)`（`apps/electron/src/renderer/lib/debounce.ts:66-82`）：`pendingArgs` 覆盖为最后一次参数（`:67`）→ `clearTimer()` 重启等待（`:68`）→ `now=Date.now()`（`:70`），`burstStart` 为空则记为本轮突发起点（`:71`）→ 若 `maxWait !== undefined && elapsed >= maxWait` 同步短路 `invoke()` 并 return（`:74-78`）→ 否则 `delay = maxWait 未设 ? wait : Math.min(wait, maxWait - elapsed)`（`:80`）后 `setTimeout(invoke, delay)`（`:81`）。
5. `flush`（`apps/electron/src/renderer/lib/debounce.ts:84-86`）：`pendingArgs` 非空才 `invoke()`，否则无操作。
6. `cancel`（`apps/electron/src/renderer/lib/debounce.ts:87-91`）：清 `pendingArgs`、`burstStart`、定时器三者。
7. `pending`（`apps/electron/src/renderer/lib/debounce.ts:92`）：返回 `pendingArgs !== null`。

## 4. 调用者与调用链

- 入向（冻结树全量 grep `createDebouncedCallback|DebouncedCallback|DebounceOptions` 与 import 说明符 `debounce`、动态 `import()`/`require`）：仅测试文件 `apps/electron/src/renderer/lib/debounce.test.ts:2`（import），调用点 `apps/electron/src/renderer/lib/debounce.test.ts:9,26,45,64,76,91,109`。生产代码零引用。
- 出向：无任何 import 语句（全文件无 `import`）；运行时调用 `setTimeout`（`apps/electron/src/renderer/lib/debounce.ts:81`）、`clearTimeout`（`apps/electron/src/renderer/lib/debounce.ts:53`）、`Date.now`（`apps/electron/src/renderer/lib/debounce.ts:70`）、用户回调 `fn`（`apps/electron/src/renderer/lib/debounce.ts:63`）。
- 否定结论检索范围：冻结树 `**/*.{ts,tsx,js}` 全量；`apps/electron/src/main/lib/cslab/cslab-debounce.ts` 的 `createDebouncer` 是同主题不同模块（主进程），非本文件调用者；`apps/electron/src/renderer/main.tsx:904,1017`、`apps/electron/src/renderer/components/file-browser/FileSearchBar.tsx:97` 等为手写 `setTimeout` 防抖，均未引用本模块。

## 5. 数据 I/O、读写与副作用

纯函数工厂 + 闭包内状态：`timer`/`pendingArgs`/`burstStart` 属于每次 `createDebouncedCallback` 调用的独立闭包（`apps/electron/src/renderer/lib/debounce.ts:46-49`），模块级无共享状态、无缓存。副作用仅三类：定时器 `setTimeout`/`clearTimeout`（`apps/electron/src/renderer/lib/debounce.ts:81,53`）、读时钟 `Date.now`（`apps/electron/src/renderer/lib/debounce.ts:70`）、调用用户回调 `fn`（`apps/electron/src/renderer/lib/debounce.ts:63`）。无 Worker/剪贴板/DOM/IPC/localStorage。

## 6. 分支、失败、取消与恢复

- 边界条件：`maxWait` 未设时为纯尾部语义（持续触发永不执行，`:80` 取 `wait`）；`elapsed >= maxWait` 在调用当下同步执行（`:74-78`）；`flush` 无等待调用时幂等无操作（`:85`）；`cancel` 后实例可继续复用（`:87-91` 不销毁工厂能力）；`invoke` 后 `burstStart` 归零，maxWait 窗口重新计时（`:61`）。
- `wait`/`maxWait` 传入负数或非数无校验分支（`apps/electron/src/renderer/lib/debounce.ts:40-44` 无参数校验语句），行为由 `setTimeout`/比较运算兜底，本文件未定义。
- 失败与 throw 约定：`fn` 抛错时不捕获（`apps/electron/src/renderer/lib/debounce.ts:63` 直调），异常传播至定时器回调、`flush` 或 maxWait 短路的调用栈；本文件无自有 throw 语句。
- 取消语义：`cancel` 丢弃 `pendingArgs` 并清定时器（`:87-91`），已触发的调用不可撤销；无 AbortSignal。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。无跨进程/共享权威状态，全部状态在单个闭包内。

## 8. 修改影响面

- 直接消费方仅 `apps/electron/src/renderer/lib/debounce.test.ts`（7 用例全量锁语义，见 §9）；生产零引用，语义改动当下不触及 UI 行为。
- 契约面：`apps/electron/src/renderer/lib/debounce.ts:4-9` 注释声明与 `lodash.debounce`/`use-debounce` 语义对齐，改动 `flush`/`cancel`/`maxWait` 任一语义须同步该契约注释与 `apps/electron/src/renderer/lib/debounce.test.ts`。
- 潜在接入点（文档动机 `apps/electron/src/renderer/lib/debounce.ts:11-14` 指出手写防抖缺 flush/cancel/maxWait）：`apps/electron/src/renderer/main.tsx:904,1017`、`apps/electron/src/renderer/components/file-browser/FileSearchBar.tsx:97`、`packages/ui/src/mermaid-block/MermaidBlock.tsx:534` 当前均未接入，重构时为替换对象。

## 9. 测试证据

`NOT_RUN`（本轮未运行测试，纯静态阅读）。直接测试文件 `apps/electron/src/renderer/lib/debounce.test.ts`：机械计数 `test(` = 7、`it(` = 0、`describe(` = 1。真实断言（expect 行）：`apps/electron/src/renderer/lib/debounce.test.ts:15-16,20-21`（静默后单次执行 + `pending` 翻转）、`:31-32,36,40`（flush 立即执行、二次 flush 无重复、定时器已清）、`:48,51,54,59`（cancel 丢弃后可复用）、`:71`（状态不残留）、`:84-85`（纯尾部语义）、`:101-104`（maxWait 中途执行且递增）、`:115,119`（maxWait 后重新计时）。断言引用≠运行，不得写"测试通过"。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 个导出符号、闭包状态机、flush/cancel/pending/maxWait 语义 | 已证实 | `apps/electron/src/renderer/lib/debounce.ts:1-95` 全文 |
| 生产调用者为零 | 已证实 | 冻结树 `**/*.{ts,tsx,js}` 全量 grep（§4 检索范围） |
| 与 lodash/use-debounce 的语义一致性 | 推断 | 仅注释声明（`apps/electron/src/renderer/lib/debounce.ts:5-9`），未与外部实现逐条比对 |
| `fn` 抛错的实际传播影响 | 未知 | 无相关测试与调用方，未验证 |
| 测试实际运行结果 | 未知 | NOT_RUN，本轮未执行任何测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 覆盖 |
| --- | --- | --- | --- |
| `createDebouncedCallback` 尾部语义 | §3,§9 | `debounce.ts:66-82` | covered |
| `flush` | §3,§9 | `debounce.ts:84-86` | covered |
| `cancel` | §3,§9 | `debounce.ts:87-91` | covered |
| `pending` | §3,§9 | `debounce.ts:92` | covered |
| maxWait 中途执行与重计时 | §3,§9 | `debounce.ts:74-78,80` | covered |
| maxWait 到点同步短路（`:74-78` 逐次累进触发） | §3,§9 | `debounce.ts:74-78` | partial（`:101-104` 断言结果序列，未逐次断言同步执行点） |
| `fn` 抛错路径（`:63`） | §6 | `debounce.ts:63` | unknown |
| 运行结果 | §9 | — | unknown（NOT_RUN） |
