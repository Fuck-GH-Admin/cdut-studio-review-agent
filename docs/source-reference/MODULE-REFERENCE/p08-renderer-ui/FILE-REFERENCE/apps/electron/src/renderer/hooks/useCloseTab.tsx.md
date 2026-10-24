---
path: apps/electron/src/renderer/hooks/useCloseTab.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 10dd01c14600dd96b93cadc6c13bcd2823c781a3
sha256: 7a5fe2eca3d29c8652d4667ed56c55c0c2d4ede895604f12699c220f1e59ade4
lines: 164
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/hooks/useCloseTab.tsx

## 1. 结论与边界

**统一关闭会话入口 hook**（164 行，头注释 `:1-15`）：TabBar×/中键/组合、GlobalShortcuts Cmd+W 共用。关键：关闭入口**不停止后台 Agent**（运行/阻塞态经侧栏 indicator 恢复）；idle 态清除完成提醒；删除/归档由侧边栏路径清理。**防竞态约定=全链 Jotai store 实时读取**（旧闭包快照会让连续关闭复活已关标签，`:12-14`）。

## 2. 导出与关键符号

1 导出：`useCloseTab(): {requestClose, executeClose, requestCloseGroup}`（`:48`）。内部 `clearIdleAgentCompletionNotice`（`:52`，running/blocked 保留提示其余清 `completedButUnconfirmed`/manualWorking）。

## 3. 内部逻辑与关键流程

`executeClose`（`:73-152`）：store 实时取 tabs/activeTabId/MRU→`closeTab`→`selectSameModeCloseFallback`（同类 MRU 优先回退，不跨模式，`:79-87`）→写三 atom→**浏览器 Tab 级联**（`:98-133`：直关单浏览器 Tab 调 closeAgentBrowserTab；某会话浏览器 Tab 归零→hideAgentBrowser+记 dismissed）→激活变化→`syncActiveTabSideEffects`（`:136-141`）→agent Tab 关闭释放重型缓存（agentSDKMessagesCache/resolvedBlobMessages/tabMinimapCache，`:143-151` 注释：不释放会驻留到进程重启）+清 idle 提醒。`requestCloseGroup` 逐个基于实时状态关（`:158-161` 防重排复活）。

## 4. 调用者与调用链

- 入向：TabBar（×/中键/组合关闭）、GlobalShortcuts（Cmd+W，nb-113 批）。
- 出向：tab/browser/agent atoms、`useSyncActiveTabSideEffects`、`window.electronAPI.clearAgentCompletionState/closeAgentBrowserTab?/hideAgentBrowser?`。

## 5. 数据 I/O、读写与副作用

IPC（清完成态/关浏览器 Tab/隐藏浏览器视图）；写 Tab/MRU/浏览器 dismissed/缓存删除。

## 6. 分支、失败、取消与恢复

同类回退/浏览器级联/缓存释放三段（§3）；IPC 失败 console.error 或吞（`.catch(()=>undefined)` `:115`）。

## 7. 权限与权威状态

关闭语义权威=不停止后台 Agent（注释 `:5-10`）；状态权威=store 实时读（防闭包陈旧）。

## 8. 修改影响面

全部关闭路径；浏览器工作标签级联与缓存回收；与 useGlobalAgentListeners 的会话删除关闭链（closeTab 同源）联动。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批该文件无 test）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 同类回退/浏览器级联/缓存释放/防复活 | 已证实 | `:1-164` 全文 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+3 动作+内部 | §2/§3 | 39-163 | covered |
