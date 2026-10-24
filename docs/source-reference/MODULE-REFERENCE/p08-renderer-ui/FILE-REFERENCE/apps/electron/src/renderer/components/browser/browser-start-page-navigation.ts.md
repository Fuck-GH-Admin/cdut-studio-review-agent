---
path: apps/electron/src/renderer/components/browser/browser-start-page-navigation.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 82372e0893f7dd8aec4fcf9063066e2103d476ec
sha256: 8672511fac68b686c04542b71356c2b8d24a62775be1357c71b598c32b938280
lines: 42
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/browser/browser-start-page-navigation.ts

## 1. 结论与边界

起始页输入归一化与默认首页导航判定（纯函数，运行时代码）：区分「本地开发地址/公网域名/搜索词」，与主进程 browser-policy 协议默认规则一致（`apps/electron/src/renderer/components/browser/browser-start-page-navigation.ts:10-13`）。边界：不发起导航、不做网络。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名 | 说明 |
| --- | --- | --- | --- | --- |
| `normalizeStartPageInput` | 函数 | 14-26 | `(input): string` | 四级判定（见 §3） |
| `shouldNavigateDefaultHome` | 函数 | 35-42 | `(state, defaultHomeUrl, lastAutoNavigatedTabId): boolean` | 默认首页只导航真实空标签一次 |

内部：`LOCAL_OR_PRIVATE_HOST` 正则（`:8`，本机回环/私网段/.local/IPv6 回环）。

## 3. 内部逻辑

`normalizeStartPageInput`：①带协议原样（`:18`）②本地/私网缺省补 **http://**（`:20`）③形如域名（含 "." 无空格）补 **https://**（`:23`）④其余走 Bing 搜索（`:25`）。`shouldNavigateDefaultHome`：state null/无默认首页/已有 url→false（`:40`）；`activeTabId` 非空且≠已自动导航过（`:41`）——防反向创建会话（注释 `:31-33`）。

## 4. 调用者与调用链

入向：`BrowserStartPage.tsx:6`、`BrowserPanel.tsx:22`；测试另篇。出向：`@profer/shared` 类型。

## 5-7. I/O/分支/权限

无 I/O；分支见 §3；无权限逻辑（依据：纯函数无 sender/role 检查）。

## 8. 修改影响面

协议默认规则须与主进程 browser-policy 同步（`:12` 注释）。

## 9. 测试证据

`browser-start-page-navigation.test.ts`（6 用例，另篇）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出+四分支+判定条件 | 已证实 | `:1-42` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出/分支 | §2/§3 | covered |
