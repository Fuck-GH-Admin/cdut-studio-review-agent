---
path: apps/electron/src/main/lib/remote-file-access.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1522e98403a7f1be7d0a074faae1a9e1920d0407
sha256: d3d866bd9811ce48aeb669b591e94dea78a71e5d6dba50db35aeceed88b59146
lines: 120
kind: source
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/remote-file-access.ts

## 1. 结论与边界

**Remote WS 文件预览授权解析**（`remote-file-access.ts:4-7` 英文注释）：**远程文件访问刻意严于桌面 IPC 策略**——远程客户端可选路径但**永不扩张自身授权根**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `RemoteFileAccessContext` | interface（export） | `:8-13` | directoryRoots/exactFiles/**denyPath?（对候选与 realpath 目标双查** `:11`） |
| `resolveAuthorizedRemoteFilePath` | function（export） | `:41-70` | 文件解析（§3） |
| `resolveAuthorizedRemoteChatAttachmentPath` | function（export） | `:77-89` | 附件路径（根内真实文件→root 相对路径，禁 `..` `:88`） |
| `isReviewPrivateConfigPath` | function（export） | `:96-120` | review 私有布局判定（**本 helper 不授予任何文件访问** `:93`；候选与规范目标双查 `:94`） |

内部：`realpathIfFile/realpathIfExisting`（`:15-30`）、`isInsideDirectory`（`:32-34`）。

## 3. 内部逻辑与关键流程

1. **文件解析**（`:41-70`）：根/显式文件先 realpath 归一（`:47-54`）；相对路径按各根展开（`:56-58`）；候选链：denyPath（原始 `:61`）→ realpath+denyPath（**符号链接目标也要过栅栏** `:62-63`）→ 命中显式文件或根内（`:64-66`）。**根内符号链接逃逸被 realpath 拦截**（`:38-39` 注释）。
2. **review 私有判定**（`:96-120`）：config 根内相对路径；`review-owner-ids.log` 直判（单调 owner 日志，UUID 身份不得经普通文件入口暴露/篡改 `:104-106`）；`agent-workspaces/<slug>/<sessionId>…`（`:107-110`）、`agent-checkpoints/<sessionId>`（`:111-113`）、`agent-sessions`（remote-uploads 偏移 `:115`，UUID 正则提取 `:116`）→ `isReviewOwnerId` 由调用方（Main owner/tombstone 谓词 `:92-93`）。

## 4. 调用者与调用链

入向：remote-service（同批）WS 文件预览/附件/回放隐私栅栏。出向：`node:fs`/`node:path`。

## 5. 数据 I/O、读写与副作用

只读（realpath/stat/existsSync）；纯判定。

## 6. 分支、失败、取消与恢复

realpath 失败→null（`:20-21/:28-29`）；所有未命中→null（fail closed）。不适用取消/恢复。

## 7. 权限与权威状态

**远程授权权威**：denyPath 双查（`:61-63`）、符号链接防逃逸（`:38-39`）、附件根内禁 `..`（`:88`）、review 私有双查（`:94`）、helper 零授权（`:93`）。

## 8. 修改影响面

改判定 → 远程文件预览/附件/回放的越权面。

## 9. 测试证据

**直接测试 `remote-file-access.test.ts`（5 用例，NOT_RUN）**：根内文件/相对路径/他工作区拒绝（绝对路径也拒）/显式附件不授权兄弟/**根内符号链接逃逸拒绝**——断言见测试手册。未覆盖：chat 附件/review 私有两函数。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出+3 内部+双查全链 | 已证实 | 逐行读 `:1-120` |
| 测试 5 用例断言 | 已证实 | 测试文件；NOT_RUN |
| Main 谓词 isReviewOwnerId | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出 | §2/§3 | `:8-120` | covered |
| 测试 | §9 | 测试文件 | covered（NOT_RUN） |
