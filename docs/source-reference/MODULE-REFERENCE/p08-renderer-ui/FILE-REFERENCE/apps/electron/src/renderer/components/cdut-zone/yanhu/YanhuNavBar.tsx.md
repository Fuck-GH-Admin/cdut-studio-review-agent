---
path: apps/electron/src/renderer/components/cdut-zone/yanhu/YanhuNavBar.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d18e7743258aaa434b0eb438c156f053340f02be
sha256: 628ab39b1c60ee69ed3a544e27791a3076473494a96232d2514f5303d676a145
lines: 184
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/yanhu/YanhuNavBar.tsx

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

智联万站导航控制栏（184 行，头注 :1-6）：前进/后退/刷新+安全地址栏（可信绿锁/可输入）+校内高频书签胶囊+诊断控制台入口。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `YanhuNavBar` | 组件 | 52-162 | 导航栏 |

内部：`isTrustedHost`（:33-39，`cdut.edu.cn`/`*.cdut.edu.cn` 可信域→绿锁）、`BOOKMARK_CLICK_DEBOUNCE_MS=300`（:42，注释——连点触发互相打断的导航致 ERR_ABORTED 抖动）、`NavButton`（:166-184）。

## 3. 内部逻辑与关键流程

地址栏 draft 状态（聚焦时不被外部 url 打断，:64-66）；提交 `onNavigate(draft)`；锁标志三态（blocked 三角红/可信绿锁/解锁灰）；书签 `handleBookmarkClick` 300ms 去抖；诊断控制台按钮 `yanhuExpress.openDiagnosticConsole`（:133-155，title 注明 CDP/DOM 蒸馏/因果边）；loading 底边 0.5px 进度条（注释 :156 DOM 层不被原生视图遮挡）。

## 4. 调用者与调用链

入向：`YanhuExpressView`（导航栏位）。出向：`@profer/shared`（YANHU_BOOKMARKS）、`window.electronAPI.yanhuExpress`、lucide。

## 5. 数据 I/O、读写与副作用

经回调导航；诊断控制台 IPC。

## 6. 分支、失败、取消与恢复

URL 解析失败→untrusted 灰锁；不抛。

## 7. 权限与权威状态

- 安全标识权威：可信绿锁仅限 `cdut.edu.cn` 域（:33-39）；站外访问支持但显式解锁图标（placeholder :111「支持站外访问」）。无 sender/role 检查。

## 8. 修改影响面

- 受影响消费者：智联万站导航交互。
- 回归关注：书签去抖、聚焦态 draft 不被打断、可信域判定。
- 无专属测试文件（全树检索确认）；回归靠 UI 人工验证。

## 9. 测试证据

直接测试：无。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 组件/内部符号/行号 | 已证实 | 逐行核对 |
| 可信域/去抖语义 | 已证实 | :33-42/:70-75 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `YanhuNavBar` 全链 | §3 | 52-162 | covered（未测） |
