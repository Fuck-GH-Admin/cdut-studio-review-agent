---
path: packages/shared/src/types/cdut.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9d6adc5761c46a1ce433a9ffb289e36e4eb9785b
sha256: 41a9396d9c4c17f2a74b71aa59da83e7e56e4162b5e75e164285b32d7d977378
lines: 895
kind: source
package: p07-shared-libs
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/cdut.ts

## 1. 结论与边界

CDUT 校园集成**类型 + 工具域 + 延河门户 + AI 速课堂/宠物**模块（`packages/shared/src/types/cdut.ts`，895 行）：账号/登录、工具域参数映射、变更确认、延河反向代理/标签/宠物、三组 IPC 通道。含 3 个纯函数（`:401-423`）。

## 2. 导出与关键符号

`export` 共 **74 个**（`grep -n "^export"` 全表），分 8 组：

**A. 账号/登录（`:10-57`）**：`CdutAccountStatus`（disconnected/connecting/active/expired，`:10`）、`CdutAccountProfile`（`:12`）、`CdutLoginInput`/`Result`（`:31`/`:37`）、`CdutSavedAccountSummary`（`:47`）。

**B. 工具域（`:59-267`）**：`CdutToolDomain`（`:59-68`，schedule/grades/exam-affairs/classroom/curriculum/course-selection/notices/academic-profile 等）、8 个 `*Params`（`:70-212`）、`CdutToolParamsMap`（`:214`）、`CdutDomainToolResult`（`:226`）、`CdutToolInvokeParams`（`:240`）、`CdutMutationConfirmRequest`/`Result`（`:246`/`:261`，变更双确认）。

**C. 子视图/反代/门禁（`:269-300`）**：`CdutSubViewId`（ai-class/yanhu-express/material-review/null，`:269`）、`CdutReverseProxyParams`/`Result`（`:272`/`:282`）、`CdutGatekeeperNoticeEvent`/`Decision`（`:287`/`:294`）。

**D. AI 速课堂（`:302-377`）**：`CDUT_AI_CLASS_WORKSPACE_SLUG='cdut-ai-class'`（`:302`）、`CDUT_AI_CLASS_WORKSPACE_NAME='AI速课堂'`（`:305`）、`CDUT_AI_CLASS_IPC_CHANNELS`（`:307`）、`StudyGraphProgressEvent`（`:327`）、`StudySearchKnowledgeInput`/`ResultItem`/`Result`（`:340-377`）。

**E. 延河基础（`:379-513`）**：`YANHU_DEFAULT_HOME_URL`（`bsdt.cdut.edu.cn` 个人中心，`:379`）、`YanhuBookmark`+`YANHU_BOOKMARKS`（`:384`/`:390`）、`YANHU_BLOCKED_URL_PREFIX='yanhu://blocked'`（`:398`）、3 函数（见第 3 节）、`YanhuTabError`/`TabItem`/`TabsState`/`ViewLayout`/`CreateTabInput`/`TabRefInput`/`NavigateInput`/`ReorderTabsInput`/`CloseRightInput`/`SyncThemeInput`（`:425-513`）。

**F. 延河调试/CDP（`:515-579`）**：`YanhuNetworkEntry`/`ConsoleEntry`/`LoadedResource`/`CdpResult`/`CdpInput`/`DevToolsHubContract`（`:515-579`）。

**G. 延河宠物（`:581-728`）**：`YanhuPetSpriteState`（blinking/breathing/walking/yawning，`:581`）、`YanhuPetConfig`（`:584`）、`ToolInvocation`/`MessageUsage`/`Message`/`ChatInput`/`StreamEvent`/`ChatStatus`/`TourFillEvent`/`Viewport`/`WindowGeometry`/`Bootstrap`/`StateEvent`（`:610-728`）。

**H. 蒸馏/IPC/缓存（`:730-895`）**：`YanhuBidNode`（`:730`）、`YanhuDistilledPage`（`:751`）、`YANHU_EXPRESS_IPC_CHANNELS`（`:781`）、`YanhuLoadingChangedEvent`/`UrlChangedEvent`（`:857`/`:863`）、`CDUT_ZONE_IPC_CHANNELS`（`:871`）、`CdutDomainCacheName`（`schedule/grades`，`:895`）。

## 3. 内部逻辑与关键流程

3 个纯函数（`:401-423`）：`buildYanhuBlockedUrl(targetUrl)`（拼 `yanhu://blocked?…`）、`isYanhuBlockedUrl(rawUrl)`（前缀判定）、`parseYanhuBlockedTarget(rawUrl)`（解析回目标 URL，非法返回 `null`）——延河拦截 URL 的编解码对。

## 4. 调用者与调用链

消费方：CDUT 工具服务、延河门户桥、AI 速课堂/宠物 UI、门禁。出向：无。

## 5. 数据 I/O、读写与副作用

纯类型+3 纯函数；无 I/O。

## 6. 分支、失败、取消与恢复

`parseYanhuBlockedTarget` 非法输入返回 `null`（`:411-423`）；其余无逻辑。

## 7. 权限与权威状态

`CdutMutationConfirmRequest/Result`（`:246-267`）是变更双确认契约；`CdutGatekeeperDecision`（`:294`）是门禁判定形状——权威在执行方。

## 8. 修改影响面

- 三组 IPC 通道名（`CDUT_AI_CLASS_IPC_CHANNELS`/`YANHU_EXPRESS_IPC_CHANNELS`/`CDUT_ZONE_IPC_CHANNELS`）是跨进程契约。
- 工具域参数映射与 CDUT 工具服务耦合。

## 9. 测试证据

纯类型+3 纯函数；本批无 cdut 专属测试（全树检索命中 0）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 74 个导出、8 组 | 已证实 | `grep -n "^export"` 全表 |
| 拦截 URL 编解码三函数 | 已证实 | `:401-423` |
| 变更双确认/门禁契约 | 已证实 | `:246-300` |
| 工具/门户/宠物行为 | 未知 | 不在本批 |

## 11. 覆盖表

| 组 | 行 | 状态 |
| --- | --- | --- |
| A 账号 | `:10-57` | covered |
| B 工具域 | `:59-267` | covered |
| C 子视图/反代/门禁 | `:269-300` | covered |
| D AI 速课堂 | `:302-377` | covered |
| E 延河基础 | `:379-513` | covered |
| F 调试/CDP | `:515-579` | covered |
| G 宠物 | `:581-728` | covered |
| H 蒸馏/IPC | `:730-895` | covered |
