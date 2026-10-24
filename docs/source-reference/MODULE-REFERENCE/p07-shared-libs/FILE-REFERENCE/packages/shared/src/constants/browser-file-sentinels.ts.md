---
path: packages/shared/src/constants/browser-file-sentinels.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c0316b3544b3a8d070f144035eea7eb984acdcdc
sha256: 91986c705bdd15f4dfd1c10a14da9d04e5b3ce5e1b252596303f2de7e097acf4
lines: 78
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/constants/browser-file-sentinels.ts

## 1. 结论与边界

viewer 页（无 preload 的沙箱 webContents）→ 主进程的「意图回投」**哨兵 URL 单一真源**：两类本地文件意图（用系统默认应用打开、划词转对话引用）加证书插页按钮哨兵（eMudhra 泄露链拦截），共 3 组常量 + 3 个纯函数。页面只能借「开窗/导航」这一条出口，主进程在 `setWindowOpenHandler`/`will-navigate` 拦截伪协议 URL 并拒绝真正导航（`packages/shared/src/constants/browser-file-sentinels.ts:1-15`）。

边界：本文件不含任何拦截实现——谁拦、拦下做什么在主进程（`apps/electron/src/main/lib/browser-controller.ts` 等，见 §4）；安全性声明（只认本文件常量、回投只作用该标签自己的本地文件）由主进程消费方落实（`:13-14` + §7）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `BROWSER_LOCAL_FILE_OPEN_DEFAULT_URL` | const | 18 | `'profer-action://open-in-default-app'` | 「打开」哨兵，字面量唯一 |
| `BROWSER_LOCAL_FILE_SELECTION_URL_PREFIX` | const | 21 | `'profer-selection://'` | 划词回投前缀，载荷 = `encodeURIComponent(text)`；空串表示选区清空 |
| `BROWSER_LOCAL_FILE_SELECTION_MAX_CHARS` | const | 27 | `2000` | 与渲染进程 `usePreviewQuotedSelection` 的 MAX_QUOTED_CHARS 同值（`:23-26`，两侧有意同值、双侧截断） |
| `encodeBrowserLocalFileSelection` | function | 30-36 | `(text: string) => string` | 页面侧编码，超限先截断到 2000 |
| `parseBrowserLocalFileSelection` | function | 42-54 | `(url: string) => string \| null` | 主进程侧解析；非本协议/解码畸形 → null；解码后再截断一次 |
| `BROWSER_CERT_INTERSTITIAL_HOST` | const | 65 | `'profer-security.local'` | 证书插页伪域名（标准 HTTPS 形式，不真实解析） |
| `BROWSER_CERT_INTERSTITIAL_ALLOW_URL` | const | 68 | `` `https://${HOST}/cert-allow` `` | 【我已知晓风险，忽略并继续访问】按钮 |
| `BROWSER_CERT_INTERSTITIAL_BACK_URL` | const | 71 | `` `https://${HOST}/cert-back` `` | 【返回安全页面】按钮 |
| `parseCertInterstitialSentinel` | function | 74-78 | `(url: string) => 'allow' \| 'back' \| null` | 精确相等或 `?` 查询前缀匹配 |

导出计数：const 6 + function 3。无内部符号、无类型导出。

## 3. 内部逻辑与关键流程

- `encodeBrowserLocalFileSelection`（`:30-36`）：`text.length > 2000` 时 `slice(0,2000)`，再拼前缀 + `encodeURIComponent`。
- `parseBrowserLocalFileSelection`（`:42-54`）：`startsWith(PREFIX)` 否则 null（`:43`）；`decodeURIComponent` 包 try/catch，畸形百分号编码（如 `%E4%BD`、`%`）→ null 不抛（`:46-50`）；解码结果再截 2000（`:51-53`，边界兜底）。
- `parseCertInterstitialSentinel`（`:74-78`）：`allow`/`back` 两组，各接受精确 URL 或 `${url}?…`；其余 null（含 `profer-action://` 等其它哨兵）。
- 设计取舍（`:56-64`）：插页以 `data:text/html` 渲染（opaque 源），自定义伪协议顶层导航可能被 Chromium 静默丢弃，故改标准 HTTPS 伪域名；`onBeforeRequest` 对该 host 显式 cancel 兜底「导航永不触达网络栈」。

## 4. 调用者与调用链

出向：无 import。入向（grep 全冻结树）：

- **主进程拦截/解析**：`apps/electron/src/main/lib/browser-controller.ts:5-9`（导入 5 符号）；`:629-654` `forwardLocalFileSelection`：`parseBrowserLocalFileSelection`（`:634`）→ 三道闸（本地预览标签、`tab.localFilePath` 该标签自己的文件、截断已在解析内）→ `webContents.send(AGENT_IPC_CHANNELS.BROWSER_LOCAL_FILE_SELECTION, …)`（`:641-646`）；`:860-876` `setWindowOpenHandler` 与 `:877-903` `will-navigate` 双入口判 `parseCertInterstitialSentinel`（`:861,:881`）/ `BROWSER_LOCAL_FILE_OPEN_DEFAULT_URL`（`:866,:887`）/ `BROWSER_LOCAL_FILE_SELECTION_URL_PREFIX`（`:870,:892`），全部 `deny`/`preventDefault`；`:727-734` `onBeforeRequest` 对 `BROWSER_CERT_INTERSTITIAL_HOST` cancel 兜底。
- **证书插页生成**：`apps/electron/src/main/lib/security/cert-blacklist.ts:22`（别名导入 `SENTINEL_ALLOW_URL`/`SENTINEL_BACK_URL`）、`:371-372`（插页按钮 HTML 内嵌两个哨兵 URL）。间接测试 `cert-blacklist.test.ts:245-246`（HTML 含两哨兵）。
- **yanhu 受管浏览器**：`apps/electron/src/main/lib/cdut/yanhu/yanhu-express-manager.ts:23,673,689,705`（`parseCertInterstitialSentinel` 三处）。
- **页面侧使用**：`apps/electron/src/renderer/viewer/main.ts:30-31,69`（`encodeBrowserLocalFileSelection` + `BROWSER_LOCAL_FILE_SELECTION_URL_PREFIX`，180ms 静默后 `window.open`）；`apps/electron/src/renderer/lib/ofv-toolbar.ts:19,54`（`BROWSER_LOCAL_FILE_OPEN_DEFAULT_URL`，`window.open`）。preload 事件桥：`apps/electron/src/preload/index.ts:2208-2212`（`onAgentBrowserLocalFileSelection`，IPC 名 `agent:browser-local-file-selection` 定义于 `packages/shared/src/types/agent.ts:2153`）。
- 间接测试：`apps/electron/src/main/lib/browser-controller-local-file-sentinel.test.ts:5,21,103-107`（主进程侧截断到 2000 的实测断言）。
- `useBrowserLocalFileSelectionQuote.ts:11` 注释引用事件名（导航性）。

## 5. 数据 I/O、读写与副作用

无。纯字符串处理；副作用全部在消费方（IPC send、dialog、网络 cancel）。

## 6. 分支、失败、取消与恢复

- `parseBrowserLocalFileSelection` 的失败形态是 `null`（调用方忽略该次回投并留痕，`browser-controller.ts:635-638`）；`decodeURIComponent` 异常被吞（`:48-50`）。
- 无取消/恢复概念。回投丢失（非本地预览标签、畸形 URL、review-owned 会话）只留 trace 不重试（`browser-controller.ts:630-639`）。

## 7. 权限与权威状态

本文件无权限分支（无 sender/role 检查）。安全不变量由消费方落实（按实际消费者）：主进程只认本文件常量；`forwardLocalFileSelection` 仅对本地预览标签放行、只取该标签 `localFilePath`（`browser-controller.ts:626-632`）；「用默认应用打开」的真实放行还要过 `executable-open-guard` 确认（`confirmExecutableFileOpen`，`apps/electron/src/main/lib/security/executable-open-guard.ts:42-43`）——两道闸独立，不互相替代。证书哨兵被 `will-navigate`/`setWindowOpenHandler`/`onBeforeRequest` 三层拦截（`browser-controller.ts:727-734,860-903`）。

## 8. 修改影响面

- 改任一 URL 字面量：必须同步 `cert-blacklist.ts` 插页按钮（`:371-372`）、`viewer/main.ts:69`、`ofv-toolbar.ts:54`、`browser-controller.ts` 三处判断，以及两侧测试（本批 `browser-file-sentinels.test.ts`、间接 `browser-controller-local-file-sentinel.test.ts`/`cert-blacklist.test.ts`）。
- 改 `BROWSER_LOCAL_FILE_SELECTION_MAX_CHARS`：与渲染进程 `usePreviewQuotedSelection` 的同值约定被打破（`:23-26`），需两侧同步。
- 改解析宽容度（如接受更多协议形）：扩大页面可回投面，须复核 `browser-controller.ts` 拦截顺序。

## 9. 测试证据

直接测试 `packages/shared/src/constants/browser-file-sentinels.test.ts`（69 行，9 个 `test(`，1 个 `describe`）：

- `:16-20` 两哨兵字面量 + `parseBrowserLocalFileSelection(BROWSER_LOCAL_FILE_OPEN_DEFAULT_URL)===null`（互不误伤）。
- `:22-25` 中文/换行/特殊字符往返 `parse(encode(text))===text`。
- `:27-29` 空选区回投 `''`（撤引用语义）。
- `:31-36` 编码侧截断：`encode(long)` 解析后长度恰 2000。
- `:38-42` 解析侧再截断：手工拼 2010 字 URL → 2000。
- `:44-47` 畸形编码 `%E4%BD`、`%` → null 不抛。
- `:49-53` 非本协议（`https://…`、`file:///etc/passwd`、`profer-selection:/typo`）→ null。
- `:55-59` 证书哨兵为标准 HTTPS 伪域名三常量。
- `:61-68` `parseCertInterstitialSentinel` 6 例：allow/back/带查询/异 host/异哨兵/`/other`。

缺口：`encodeBrowserLocalFileSelection` 对非字符串输入无防御（TS 类型层保证，运行时越界无测试）；主进程三道闸的组合行为由间接测试覆盖（不在本批）。

**NOT_RUN**：本轮未执行测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三组常量字面量与协议名 | 已证实 | `:18,21,27,65,68,71`；测试 `:17-18,56-58` |
| 双侧截断（encode 与 parse 各一次） | 已证实 | `:31-34,51-53`；测试 `:31-42` |
| 畸形编码 fail-closed 返回 null 不抛 | 已证实 | `:46-50`；测试 `:44-47` |
| 主进程拦截双入口（window.open + will-navigate）+ onBeforeRequest 兜底 | 已证实 | `browser-controller.ts:860-903,727-734` |
| 回投三道闸（本地预览/自身文件/截断） | 已证实 | `browser-controller.ts:626-646` |
| 「打开默认应用」后经 executable-open-guard 确认 | 已证实 | `executable-open-guard.ts:42-43` + `browser-controller.ts:866-868`（openLocalFileWithDefaultApp 入口） |
| yanhu 侧插页哨兵消费 | 已证实 | `yanhu-express-manager.ts:673,689,705` |
| 2000 上限与渲染层同值 | 已证实（注释声明 + 测试） | `:23-27`；渲染侧 `usePreviewQuotedSelection` 未在本批读源，注释一致性未独立核 | 
| 页面被注入时的攻击面收敛效果 | 推断 | `:13-14` 注释 + `browser-controller.ts` 拦截实现；无渗透测试 |
| 真实 Chromium 对 data: 源→伪协议导航的丢弃行为 | 未知 | `:59-61` 注释声明动机，未独立验证 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 6 常量 | §2 | 18-71 | covered |
| `encodeBrowserLocalFileSelection` | §3 | 30-36 | covered |
| `parseBrowserLocalFileSelection` 三分支 | §3 | 42-54 | covered |
| `parseCertInterstitialSentinel` | §3 | 74-78 | covered |
| 主进程拦截链 | §4, §7 | 消费方 | covered |
| 渲染层同值上限 | §8 | `:23-27` | partial（对侧未读源） |
