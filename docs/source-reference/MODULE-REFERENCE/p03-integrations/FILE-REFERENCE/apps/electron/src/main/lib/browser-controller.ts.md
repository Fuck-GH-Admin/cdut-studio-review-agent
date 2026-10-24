---
path: apps/electron/src/main/lib/browser-controller.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 390187829184b4307323e440e7252566e39f957e
sha256: 24104c6be618677b9379150992e56351545ad95c97e96eedcd3f6c163c4a2e16
lines: 2154
kind: source
package: p03-integrations
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/browser-controller.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

受管浏览器控制器（2154 行）：Electron `WebContentsView` 唯一原生网页 frame；会话/标签/MRU/布局/CDP 操作全集；安全链（证书插页、URL 策略、下载拦截、权限、哨兵回投）；Agent 与用户双操作面（`getAgentTab`/`getDisplayTab` 分离，:397-412）。

## 2. 导出与关键符号

常量（:32-38）：`MAX_TRACE_ITEMS=30`、`MAX_BROWSER_TABS=20`（超限只回收 Agent 标签绝不关用户标签，:33 注释）、`MAX_INVALIDATED_LAYOUT_RENDERERS=16`、`MAX_SCREENSHOT_BYTES=3MB`、`ACTION_HIGHLIGHT_DURATION_MS=900`、`MAX_BROWSER_SCRIPT_RESULT_CHARS=64000`。

类型：`BrowserUserContextSnapshot`（:103-108）、`ConfigureBrowserSessionInput`（:150-153）、`BrowserObservation`（:155-161）。内部类型 `BrowserTabRecord`（:58-101，含 `localFilePath` 主进程私有/`localPreviewThemeSignature` null=主题不参与/`lastCommittedUrl` 证书回退可信落点）、`BrowserSessionRecord`（:110-145）。

导出函数/类：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `resolvePreviewTheme` | 175-179 | 显式>渲染进程记忆>settings 兜底（惰性） |
| `BrowserController` 类 | 240-2148 | 见 §3 |
| `browserController` | 2154 | 单例 |

类方法要点：`configureSession/setAllowedRoots`（:276-303）、`syncThemeBackground`（:311-322）、`setForegroundSession`（:330-353，同会话重申不隐藏防黑屏 :338-341）、`emit/buildState`（:355-395，review 会话不外发 :356）、`getUserContext`（:431-443）、`assertRiskDisclaimerAcknowledged`（:418-423）、`updateNavigationState`（:425-462，chrome-error/data: 不污染地址栏 :434-437、`lastCommittedUrl` 只记真实 HTTP(S)）、`trace`（:464-481，账本双层 30/100）、`refreshLocalPreviewThemes`（:494-524）、`openLocalFileWithDefaultApp`（:527-549，可执行文件守卫）、`tryLoadCertInterstitial`/`handleCertInterstitialSentinel`（:556-613，allow=back 语义防插页循环 :587-592）、`forwardLocalFileSelection`（:619-647，三道闸）、`enqueueTab/runTabOperation/agentSignal`（:656-690）、`cancelSession`（:718-733）、`installSessionGuards`（:735-808，权限仅剪贴板放行 :741-748、`onBeforeRequest` NUL/协议/子资源策略+证书哨兵域名硬拒 :750-779、下载拦截+脱敏事件 :781-807）、`installPreviewProtocol`（:810-813）、`createSession`（:815-847，UA 诚实化 :823）、`createTab`（:849-973，sandbox/contextIsolation/webSecurity、`backgroundThrottling:false` 防黑屏 :858-863、`setWindowOpenHandler` 哨兵/本地文件/站外转新标签 :895-914、`will-navigate` 失效+校验 :915-933、`did-fail-load` 证书插页/ERR_ABORTED 非失败 :935-953）、`getOrCreateSession`（:975-995，`ensureInitialTab` 防双标签 :981-985）、`cdp/recoverDebugger`（:1002-1030，超时重连）、`highlightAgentTarget`（:1033-1053，Overlay 不注入脚本）、`open/getState`（:1062-1081，只读不夺前台）、`hideOtherBrowserSessions`（:1088-1099，跨会话互斥）、`listTabs`（:1107-1131，严格只读）、`setZoom`（:1133-1141，0.5-3）、`setLayout`（:1143-1210，renderer 实例失效仲裁/强制重绘防白屏）、`activateDisplayTab`（:1213-1243）、`selectAdjacentActiveTab/selectMruActiveTab`（:1253-1281，Chrome 式右邻+MRU 兜底）、`reclaimExcessAgentTabs`（:1287-1301，无安全候选宁可超限）、`createNewTab/createDisplayTab`（:1304-1327，`ensureInitialTab:false` 防双标签）、`selectTab/selectAgentTab/closeAgentTab/closeTab`（:1330-1377）、`previewOpen`（:1379-1425）、`loadUrl`（:1427-1458，主框架可用即 resolve）、`navigate`（:1460-1487）、`openExternalLinkInDisplayTab`（:1493-1525，同步 deny+异步校验）、`navigateDisplay/goBack(F)/goForward(F)/reload(F)`（:1527-1612）、`translatePage`（:1618-1682，失败返回 error 不抛）、`evalPage`（:1685-1697）、`scroll`（:1699-1745，1-20000/selector≤1000）、`extract`（:1747-1780，四模式/limit 1-100）、`observe/observeInternal`（:1782-1840，AX 深度/可交互优先/generation 失效）、`resolveRef`（:1842-1846）、`readElementValue/writeElementValue`（:1851-1894，固定函数体回读/降级）、`centerForRef`（:1896-1911，滚动后重读 box）、`click`（:1913-1933）、`assertEditableFocus`（:1935-1951）、`fill`（:1953-1998，全选+insertText+回读校验+固定函数降级，失败文案含脱敏值）、`press`（:2000-2021）、`executePageExpression`（:2023-2039）、`waitFor`（:2041-2082，250-30000ms/250ms 轮询）、`domAction`（:2087-2100）、`pasteClipboard`（:2106-2132，仅用户面板）、`evaluate`（:2138-2150，页面内不暴露 Electron/Node）、`screenshot`（:2152-2180，空图显式失败）、`hide/hideAll`（:2188-2221，同步隐藏防视觉残留）、`disposeSession/close/dispose`（:2227-2148，hostView 收敛+保留前台所有权）。

## 3. 内部逻辑与关键流程

1. **安全链**：`will-navigate`/`setWindowOpenHandler` 双通道拦哨兵（证书插页伪域名触达网络栈前 `onBeforeRequest` 兜底硬拒）；导航目标 `assertSafeBrowserUrl/...Destination`；下载 `preventDefault`+脱敏事件（不落盘，:781-786）；权限仅 clipboard 读写放行（:744-748）。
2. **证书插页**（eMudhra 泄露链）：失败加载→安全警告插页；allow=内存态会话×标签×域名临时放行；back=显式加载 `lastCommittedUrl`/blank **绝不 goBack**（防插页循环，:587-592）。
3. **布局**：`setLayout` renderer 实例失效集合+sourceRevision 仲裁（旧实例晚到布局不得覆盖新实例）；隐藏→显示强制 `invalidate()` 重绘防白屏（:1204-1207）。
4. **截图诚实**（:2168-2175）：空 NativeImage/空 PNG 显式失败（注释：空图入会话历史会令部分模型挂起 ~105s 死循环）。
5. **fill 回读闭环**（:1977-1996）：insertText→回读→不匹配降级固定函数写值→再回读→仍不匹配抛错（值脱敏）。

## 4. 调用者与调用链

入向（生产）：`ipc.ts`/`index.ts`（用户面板）、`agent-orchestrator.ts`/`pi-builtin-tools.ts`（Agent 工具）、`agent-prompt-builder.ts`（getUserContext）。出向：本批 browser-* 策略族、`./security/cert-blacklist`、`./security/executable-open-guard`、`./local-file-protocol`、`./browser-view-layout`、`./browser-translate`、`./settings-service`、`./agent-session-manager` 等。

## 5. 数据 I/O、读写与副作用

Electron WebContentsView/Session/CDP；cdut-file 协议；`recordHistory` 写起始页；shell.openPath（经可执行守卫）；无自主网络（页面自身网络受 onBeforeRequest 策略约束）。

## 6. 分支、失败、取消与恢复

`BrowserOperationAbortedError`（结果未知语义）/`BrowserCdpTimeoutError`（超时重连 debugger）；ERR_ABORTED 非失败；导航失败保留下拉地址栏；`cancelSession` 留痕「结果未知」；`reclaimExcessAgentTabs` 无候选宁可超限。

## 7. 权限与权威状态

- 双操作面权威：Agent 工作标签（`agentTabId`）与用户显示标签分离（:397-412）；UI 切换不夺 Agent 目标。
- 风险告知门禁：首次使用前 `assertRiskDisclaimerAcknowledged`（:418-423）。
- review 会话隔离：`isReviewOwnedOrDeletedAgentSessionId` 不 emit/不转划词（:356/:640）。
- 本地文件 `localFilePath` 主进程私有不下发（:74-75）；划词三道闸（:613-617）。
- 下载不落盘；证书临时放行会话×标签×域名生命周期（关闭即撤销，:961-963）。

## 8. 修改影响面

浏览器面板/Agent 浏览工具全链。同测：5 个 `browser-controller*` 测试文件（23 用例）。

## 9. 测试证据

直接测试（均以替身/真实 mkdtemp 夹具；NOT_RUN）：
- `browser-controller-screenshot.test.ts`（3）：空图/空 PNG 报错、正常返回 base64。
- `browser-controller-local-file-sentinel.test.ts`（6）：划词回投三道闸（非预览/缺路径/畸形忽略、空串转投撤胶囊、超长截断）。
- `browser-controller-fresh-session-tab.test.ts`（4）：冷会话单标签（`ensureInitialTab:false` 回归）、已有会话加一。
- `browser-controller-preview-theme.test.ts`（6）：签名判重/HTML 不跟随/同色调皮肤切换重载/失败留痕不标记/`resolvePreviewTheme` 优先级惰性。
- `browser-controller.lifecycle.test.ts`（4）：末标签关闭移除 hostView（透明区不拦截点击）+保留前台所有权；`listTabs` 严格只读（无会话/有会话/失效 activeTabId 三态）。

未覆盖：CDP 真实页面操作（click/fill/observe）、证书插页链、setLayout 几何（需 Electron 实体）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 方法群/行号定位（以符号名为准） | 已证实 | 逐行核对（分段+补读） |
| 空截图拒假成功/划词三闸/单标签/hostView 移除/listTabs 只读 | 已证实 | 5 测试文件逐条 |
| 主题签名唯一口径/优先级 | 已证实 | preview-theme 测试 |
| CDP 操作链/证书插页/布局几何行为 | 已证实（代码）/未知（运行） | §3（无 Electron 实体测试） |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| screenshot 空图拒 | §3.4/§9 | 2152-2180 | covered |
| 划词哨兵三闸 | §3/§9 | 619-647 | covered |
| 冷会话标签/生命周期 | §9 | 975-1377 | covered |
| 主题重载/优先级 | §9 | 494-524/175-179 | covered |
| `listTabs` 只读 | §9 | 1107-1131 | covered |
| CDP 操作（click/fill/observe/scroll/extract） | §3 | 1782-2039 | partial（未测） |
| 证书插页/下载拦截/权限 | §3.1-3.2 | 556-807 | partial（未测） |
