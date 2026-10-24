---
path: apps/electron/src/renderer/hooks/useScrollSpy.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3ce938538ad40128eb1e0bb994be28f79a7d1270
sha256: 74330045f4c9d2d5a0821878312d2c2931069fff47afac4878983c81fd2114bb
lines: 67
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/hooks/useScrollSpy.ts

## 1. 结论与边界

滚动联动章节高亮 hook（运行时）：以滚动容器为 IntersectionObserver root，监听标题进入容器顶部 ~30% 判定带，返回当前章节 id（文件头注释 `apps/electron/src/renderer/hooks/useScrollSpy.ts:4-13`）。

边界：不提取标题（标题树来自 `useTocHeadings`）；不做滚动跳转/锚点导航；不渲染 UI；判定带几何参数固定（`rootMargin`）不可配。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数导出。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `useScrollSpy` | 函数（导出） | 14-67 | `(containerRef: React.RefObject<HTMLElement>, headings: TocHeading[]) => string \| null` | 返回当前章节 id |
| `visible` | 状态（内部） | 27 | `Set<string>` | 判定带内标题 id 集 |
| `recompute` | 函数（内部） | 29-45 | `() => void` | 计算 activeId |
| `observer` | 实例（内部） | 47-58 | `IntersectionObserver` | 判定带监听 |

## 3. 内部逻辑与关键流程

### 3.1 守卫（`:21-25`）

容器未挂或 `headings.length === 0` → `setActiveId(null)`，不建 observer。

### 3.2 `recompute`（`:29-45`）

1. `headings.find(h => visible.has(h.id))`——按 `headings` 数组顺序（即 DOM 顺序）取第一个可见标题（`:30-35`）。
2. 无命中：回退“最后一个顶端已滚过容器顶部”的标题——`h.el.getBoundingClientRect().top - containerTop <= 1` 的最后一个（`:36-43`）；初值 `headings[0]?.id ?? null`（`:38`）。

### 3.3 Observer（`:47-61`）

`IntersectionObserver(callback, {root: container, rootMargin: '0px 0px -70% 0px', threshold: 0})`（`:57`）：判定带=容器顶部约 30%（注释 `:7-8` 与参数一致）。回调维护 `visible` 增删（`:49-55`，`entry.target.id` 为空则跳过 `:51`）后 `recompute()`。逐标题 observe（`:60`）并立即 `recompute()` 一次（`:61`）。清理 `observer.disconnect()`（`:63`）。effect deps `[containerRef, headings]`（`:64`），headings 引用变化即重建。

## 4. 调用者与调用链

入向（全树 `*.ts/*.tsx` 检索，证实）：`components/diff/MarkdownToc.tsx:5`（import）、`:26`（`useScrollSpy(containerRef, headings)`）。无其它调用者、无测试引用。

出向：类型 `TocHeading`（`./useTocHeadings`，`:2`，`apps/electron/src/renderer/hooks/useTocHeadings.ts:4-9`）；React state；IntersectionObserver/几何读取（`getBoundingClientRect` `:37,:40`）。

## 5. 数据 I/O、读写与副作用

- 写：仅 React state（activeId）。不写盘/网络/atom（依据：本文件无 fs/IPC/fetch/store）。
- 副作用：IntersectionObserver 注册；几何读取（布局抖动仅在 recompute 时）。
- 并发：回调内同步 recompute；无锁需求。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 |
| --- | --- | --- |
| activeId=null | 容器缺失/headings 空 | 21-25 |
| 取首个可见 | visible 命中 | 30-35 |
| 回退已滚过 | 无命中 | 36-44 |
| 初值回退 | headings[0] | 38 |

卸载即 `disconnect`（`:63`），无遗留；无 try/catch，observer 回调异常直接冒泡（推断）；无恢复概念，依据：无持久状态与异步任务。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查；纯 UI 几何状态。

## 8. 修改影响面

- 唯一调用方 `MarkdownToc.tsx:26`；返回值驱动目录高亮。
- `rootMargin`/阈值 `<=1` 改动会改变“当前章节”判定手感。
- 依赖 `TocHeading.el`（真实 DOM 引用，`useTocHeadings.ts:4-9`）；改该接口需同步两个文件。
- 需同步的测试：无（0 test）。

## 9. 测试证据

直接测试：**无**。全树 `*.test.*`/`*.spec.*` 检索 `useScrollSpy` 0 命中。间接证据：无。

真实断言：不适用。未覆盖：判定带命中、回退逻辑、headings 变化重建。

NOT_RUN：本轮未运行任何测试/typecheck/构建/GUI/真实滚动观察；以上行为均为冻结源码静态可见。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出 + 参数形状 | 已证实 | `:14-17` |
| 判定带参数与注释一致 | 已证实 | `:57` vs `:7-8` |
| 双分支计算 activeId | 已证实 | `:29-45` |
| 唯一调用方 | 已证实 | `MarkdownToc.tsx:5,26` |
| 无持久化/无副作用写 | 已证实 | 全文读 |
| observer 回调异常冒泡 | 推断 | 无 try/catch |
| IntersectionObserver 运行期行为 | 未知 | NOT_RUN |
| 浏览器兼容性 | 未知 | 未验证 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `useScrollSpy` | §2-3 | 14-67 | covered |
| `visible`/`recompute` | §3.2 | 27-45 | covered |
| observer 参数 | §3.3 | 47-58 | covered |
| 守卫分支 | §3.1, §6 | 21-25 | covered |
| 回退分支 | §3.2, §6 | 36-44 | covered |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |
