---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-express-manager.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bd0d6be66c4ea9d493e0087612a9543b66d4b80d
sha256: 1da4c8ab7d6124436b5eab4a6e994cdd45404f3866735558e2e7b080193d3441
lines: 2102
kind: source
package: p03-integrations
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-express-manager.ts

## 1. 结论与边界

智联万站**主调度服务**（2102 行，规格书 4.3/4.4/4.6）：WebContentsView 实例池（多标签）+ 惰性恢复 + 内存休眠守护 + 安全网关三处裁决 + 主题跟随 + 特区账户分区（`persist:cdut-auth-zone`）+ 静默 CDP 总线（`:1-13`）。边界红线（`:14-15`）："不向前端暴露任何调试入口；登录态由分区 Session 自然承载，不主动嗅探/解密内网 Cookie"（**措辞过强见矛盾②**）。

## 2. 导出与关键符号

**模块导出（4）**：`buildSyntheticEnterScript:182-192`（合成回车脚本，不触发表单隐式提交 `:176-181`）、`buildOneTimeTicketSanitizeScript:201-229`（票据无痕清洗 `history.replaceState`）、`YanhuExpressManager:231`（主类）、`yanhuExpressManager:2102`（单例）。

**公共 API（40+）**：生命周期 `setOwnerWindow:256`/`initOrRestore:442-481`（惰性恢复：仅实例化激活标签 `:2`）/`showView:484`/`hideView:506`/`dispose:513-532`（wipeSessionGrants 清证书放行）；标签 `createTab:1009`/`activateTab:1077`/`closeTab:1096`/`closeOtherTabs:1130`/`closeRightTabs:1148`/`reorderTabs:1168`（不丢标签补尾）；导航 `navigate:1180`/`loadUrl:1265`/`goBack:1284`/`goForward:1301`/`reload:1312`/`retryTabWithClean:1325`/`returnFromBlocked:884`；CDP 群 `cdpGetDom:1598`…`cdpExecuteScript:1639`（委托 DevToolsHub）；工具层 `getTabLiveUrl:1671`（真实 URL 判废票 `:1665-1670`）/`captureViewport:1695`（JPEG 72）/`evalInPage:1734`（64k 上限 DevToolsHub 把关）/`collectCrossOriginFrameElements:1751-1824`（OOPIF 隔离世界 `:1745`）/`dispatchHumanClick:1866-1915`（isTrusted 物理点击 `:1859-1864`）/`dispatchHumanTextInput:1924-2010`/`awaitStable:2062`/`waitForIdle:2076`。

## 3. 内部逻辑与关键流程

- **会话守卫**（`installSessionGuards:272-305`）：权限仅放行 clipboard 二项（`:276`）；`onHeadersReceived` 400 自愈（`handleMainFrameResponse:313-332`→`healStaleSignature:352-415`，带票据**严禁裸 reload**（`:343-351` 事故复盘红线））。
- **票据治理**：`sanitizeOneTimeTicket:837-848`（has→strip+页面清洗+log）；落盘前剔票（`:815`）；SSO 应用页恢复回入口（`:615-616`）。
- **视图/休眠**：`instantiateTab:576-624`（webPreferences：partition+preload+`contextIsolation:false`（瑞数多 Realm 红线 `:588-591`）+sandbox+webSecurity）；`enforceDormancy:1514-1536`（闲置超阈值后台释放，仅三处触发）；`applyLayoutToActive:1419-1490`（可见性六条件）。
- **拦截/插页**：`blockTab:864-881`（哨兵 URL）；`tryLoadCertInterstitial:916-968`（data: 渲染不触网 `:951`）；`handleCertInterstitialSentinel:975-1000`（allow 标签级临时放行/back 显式加载防插页循环 `:970-973`）。
- **window.open 合并**（`openTabFromWindow:1058-1075`，`windowOpenKey:1042` origin+pathname 忽略 query——吞 ticket 但牺牲 query 区分度，缺口⑤）。

## 4. 调用者与调用链

main/ipc.ts（`apps/electron/src/main/ipc.ts:6316-6490`） 入站 handler（约 25 通道 `yanhu:*`）+ 出站广播 3 条（on-loading-changed/on-url-changed/on-tabs-changed）；工具层直调（browser-tools/visual-anchor）；联动同目录 15 模块（constants/gatekeeper/tabs-store/cookie-utils/cert 三件套/fingerprint/devtools-hub/theme/diagnostic/dom-distillation/event-log/stabilization/preload）。

## 5. 数据 I/O、读写与副作用

持久化 `~/.cdutai/yanhu-express/tabs.json`（persist `:1575-1587`，空拓扑绝不落盘 `:1576`）；视图创建/销毁；CDP 派发；IPC 广播；证书放行内存态（wipeSessionGrants）。

## 6. 分支、失败、取消与恢复

400 自愈（单次防死循环 `:342-351`）；ERR_ABORTED 降噪（`:130-134`）；dispose/destroyed 复位链；`waitForIdle` 双平面+硬超时（`:2073-2074`）。

## 7. 权限与权威状态

30 条安全红线（子agent 逐条列，要点：合成回车防误提交 `:176-181`/`:1978-1981`（实测"请假申请"误提交事故）、票据绝不再发 `:613`/`:815`、contextIsolation 强制理由 `:588-591`、权限最小化 `:276`、撤销先于判空 `:638`、新窗口不外弹 `:703`、物理点击 isTrusted `:1859-1864`）。

## 8. 修改影响面

改裁决/票据链影响登录与白屏事故面；改 webPreferences 影响瑞数放行；改 IPC 面需同步 ipc.ts/preload；enforceDormancy 触发点缺失（缺口①无定时器）。

## 9. 测试证据

**本文件无直接单测**（同目录多模块有 test，唯 express-manager 无 .test.ts；apps+packages 全范围检索）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（矛盾照实记录，子agent 4 段精读+主根抽查 11 行命中）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全导出/40+ API/红线/票据链 | 已证实 | 2102 行全读（子agent）+ 主根抽查（`:182`/`:201`/`:231`/`:303`/`:343`/`:366`/`:588`/`:1503`/`:1576`/`:1978`/`:2102` 全命中，exports=4） |
| **矛盾①** `:303`"中途抛错标记不落地可重试"与实现不符：两段安装 try/catch 吞异常后 `:304` 总置位，守卫缺失无恢复 | 已证实 | `:283-285`/`:299-301`/`:303-304` |
| **矛盾②** `:14`"不暴露任何调试入口"vs `openDiagnosticConsole`/CDP_* 经 IPC 暴露（措辞过强） | 已证实 | `:497`+`apps/electron/src/main/ipc.ts:6490`/`apps/electron/src/main/ipc.ts:6402-6418` |
| **矛盾③** `syncTheme(_isDark)` 入参被忽略（用 resolveCurrentIsDark） | 已证实 | `:1503`/`:1507` |
| **矛盾④** blockTab 日志文案只覆盖"非网页协议"场景 | 已证实 | `:880` |
| **矛盾⑤** loadUrl 唤醒缺省 restoring:true 与注释/同层不一致；windowOpenKey 忽略 query 误合并 | 已证实 | `:1271`/`:1042-1049` |
| 缺口清单 14 条（无定时休眠/did-fail-load 不 persist/跨域 iframe 票据不清洗/openExternal 无内网黑名单/will-navigate 未判主框架等） | 已证实 | 子agent §6 |
| 规格书引用 | 推断 | 注释自述，文档不在冻结树 |
| 运行实效（瑞数放行/自愈成功率） | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 4 导出+40 API | §2 | covered |
| 会话守卫/票据/视图/插页/合并 | §3 | covered |
| 30 红线 | §7 | covered |
| 5 矛盾+14 缺口 | §10 | covered |
