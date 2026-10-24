---
path: apps/electron/src/main/lib/agent-file-preview-session.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a3e1f7efe8856b6de1cd96cc2b8364789d8a1c87
sha256: e2786aac0af7fb6498407715c8a58f66fde1ce59a2f541c487343cce97c564ce
lines: 125
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-file-preview-session.ts

## 1. 结论与边界

正式 PPTX 预览会话管理器：渲染进程 viewer 回执与主进程请求的配对等待（Promise+Map+超时）；**回执身份三元校验**（sessionId/filePath/revision :113-122，revision 不一致=过期拒）。

## 2. 导出与关键符号

导出 2 条（`export` :19/:125）：`AgentFilePreviewSessionManager`（:19-123）、`agentFilePreviewSessionManager`（:125，单例）。内部：`Pending<T>`（:8-15）、`PreviewEvent`（:17）。

## 3. 内部逻辑与关键流程

- `waitUntilReady(event, emit)`（:25-30）/`inspect(request, emit)`（:32-37）：走通用 `wait`（:83-111）——timeoutMs 默认 20s（:23）；超时删项+reject（:90-93，消息「正式 PPTX 预览加载/观察超时」）；emit 同步调用，抛错即 reject+清理（:102-109）。
- `reportReady(report)`（:39-57）：未命中返 false；校验链：身份 mismatch（:44-46）→status error 拒（:47-48）→slideCount 整数≥1（:49-50）→currentSlide 在 [1,slideCount]（:51-52）→resolve。
- `reportInspection(result)`（:59-71）：身份/错误/页图有效性（images 非空、页码合法、data 非空 :67-68）。
- `dispose()`（:73-81）：全部 reject「会话已关闭」。

## 4. 调用者与调用链

入向（子agent 交叉核）：生产 `lib/ipc.ts:19`、`lib/agent-orchestrator.ts:187`；测试 `agent-file-preview-session.test.ts:2`。出向：`@profer/shared` 类型（无运行时依赖）。

## 5. 数据 I/O、读写与副作用

setTimeout 定时器（cleanup :43/:63/:75）；事件 emit 回调。无磁盘 I/O。

## 6. 分支、失败、取消与恢复

校验链多分支（§3）；超时/emit 异常/dispose 三路 reject。恢复：渲染层重载由调用方重新发起（本模块无持久状态）。

## 7. 权限与权威状态

revision 一致性=新鲜度权威（:120「viewer revision 与磁盘文件不一致」）。

## 8. 修改影响面

ipc/orchestrator 的 PPTX 预览链。需同步测试（6 用例）。

## 9. 测试证据

`agent-file-preview-session.test.ts`（批内，1 describe/6 用例，NOT_RUN）：ready 解析（:14-30）、缺页数拒（:32-37）、error 拒（:39-44）、stale revision 拒（:46-51）、超时拒（:53-56）、inspect 匹配解析（:58-77）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 2 条；身份三元校验 | 已证实 | :39-71/:113-122 |
| 2 生产消费点 | 已证实 | §4 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 全方法+校验链 | §2/§3 | :19-125 | covered |
| 测试 | §9 | — | covered（NOT_RUN） |
