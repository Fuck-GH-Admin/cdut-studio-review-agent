---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-theme-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bedd76c0ce259f7bbd06799b0c4416289b31e285
sha256: ee72d0b72584649ea0587c043ae6900e19747cd8213c63c49d3fe389beb915e2
lines: 171
kind: source
package: p03-integrations
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-theme-service.ts

## 1. 结论与边界

智联万站主题跟随服务（文件头 `:1-10`，规格书 4.1 三位一体）：①底层 WebContentsView 底色防白闪（深 #09090b/浅 #ffffff）；②`prefers-color-scheme` 媒体特征动态仿真（CDP Emulation，失败降级注入 CSS）；③全局主题切换遍历活跃视图热更新不重载。前端外壳配色归渲染层 Tailwind，本服务只管原生侧跟随。运行时模块（Electron WebContents/WebContentsView/nativeTheme）。

**关键红线**（`:57-59`）：严禁为主题跟随主动附加调试器——瑞数 Botgate 检测调试器附着会激活断点陷阱；只有 CDP 已被 AI/调试总线附着才走 Emulation，否则 insertCSS 降级（0 调试器介入）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `YanhuThemeMode` | type | `:22` | `'light'\|'dark'\|'system'`（special 皮肤由 app-theme-service 解析） |
| `resolveYanhuIsDark` | function | `:28-32` | 纯函数（light/dark 直判、system 跟随） |
| `resolveYanhuThemeBackground` | function | `:37-39` | 纯函数（经 `resolveYanhuViewBackground`） |
| `YanhuThemeListener` | type | `:42` | `(isDark) => void` |
| `syncThemeToWebContents` | function | `:56-88` | 单 WebContents 明暗同步（CDP→CSS 降级） |
| `YanhuThemeService` | class | `:95-168` | 视图注册/热更新/订阅 |
| `yanhuThemeService` | const | `:171` | 全局单例 |

内部：`insertedCssKeys`（`:54`，WeakMap 记账已注入 CSS key——重复注入前回收，防样式表累积）。

## 3. 内部逻辑与关键流程

### 3.1 `syncThemeToWebContents`（`:56-88`）

`wc.debugger.isAttached()` 时才发 `Emulation.setEmulatedMedia`（prefers-color-scheme）；异常忽略。降级：回收上次 CSS（`removeInsertedCSS`，页面销毁忽略）→ `insertCSS`（深/浅滚动条 CSS 常量）记 key。

### 3.2 `YanhuThemeService`（`:95-168`）

- `resolveCurrentIsDark`：`resolveAppThemeIsDark()`（含 special 皮肤）。
- `applyViewBackground`：`setBackgroundColor`（销毁忽略）。
- `registerView/unregisterView`：Set 维护；注册即上底色+确保系统主题订阅（`ensureSystemThemeSubscription` 只订一次，`nativeTheme.on('updated')`→`syncAll`，测试环境忽略异常）。
- `onThemeChanged`：返回退订函数。
- `syncAll`：逐视图底色+媒体仿真（单视图失败不影响其余）→ 广播监听者（异常不影响主流程）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）：智联万站视图/标签管理（registerView/syncAll）；直接测试 `yanhu-theme-service.test.ts`。出向：`electron.{WebContents,WebContentsView,nativeTheme}`、`app-theme-service.resolveAppThemeIsDark`、`yanhu-constants`（滚动条 CSS/底色解析）。

## 5. 数据 I/O、读写与副作用

Electron 视图/CSS 注入/nativeTheme 订阅；无网络/磁盘。WeakMap 记账防泄漏。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| CDP 不可用/命令异常 | `:60-70` | 降级 insertCSS |
| insertCSS/removeInsertedCSS 失败 | `:79-87` | 忽略（页面可能销毁） |
| 单视图/监听器异常 | `:143-152` | 不影响其余 |
| nativeTheme 订阅失败 | `:164-166` | 忽略（测试环境） |
| 取消/恢复 | 无 | 异步无 AbortSignal |

## 7. 权限与权威状态

安全红线：0 调试器介入（`:57-59`，Botgate 断点陷阱规避）；三态主题口径（special 归 app-theme-service）。

## 8. 修改影响面

改同步/降级 → 影响智联万站暗色体验与瑞数规避；`yanhu-constants`/`app-theme-service` 契约联动。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `yanhu-theme-service.test.ts`（详见其手册）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 0 调试器红线+CDP→CSS 降级 | 已证实 | `:57-88` |
| CSS 注入记账回收 | 已证实 | `:54/:74-84` |
| 热更新+订阅容错 | 已证实 | `:135-167` |
| 纯函数可测 | 已证实 | `:24-39` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 纯函数两枚/类型 | 2 | `:22-42` | covered |
| `syncThemeToWebContents` | 3.1 | `:56-88` | covered |
| `YanhuThemeService` | 3.2 | `:95-168` | covered |
| 全局单例 | 2 | `:171` | covered |
