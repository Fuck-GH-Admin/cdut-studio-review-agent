---
path: apps/electron/src/main/lib/review/review-remote-path-access.p05.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5232b3833729b347e53f8b40ed5b4107b8e95252
sha256: f41cf54dc944b1e9d9ccc8b30d092dc90c147124b24895687aa9d84d6ca38031
lines: 137
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-remote-path-access.p05.test.ts

## 1. 测试目标

P05-S03 Pocket 路径面隔离（头注 :1-4「合成工作区/附件；无 provider/WS/真实用户数据」）：Chat 附件读删限附件存储、私有审核文件/配置/symlink 逃逸拒、普通会话只读己有+共享、宽共享根不放行私邻会话、显式附件不越 owner 围栏、跨工作区 traversal 拒、`isReviewPrivateConfigPath` 识别范围。

## 2. 用例清单

7 用例 / 1 describe（`P05-S03 path-only remote access isolation` :35）。夹具 `fixture()`（:24-33，真实工作区/会话/文件/私有文件）；`denied` 帮手断言 error 含 `不在当前会话授权范围`（:16-20）；真实磁盘+真实 symlink。

| # | 用例 | 行 | 核心断言 |
| --- | --- | --- | --- |
| 1 | 附件相对/绝对读删（37-47） | base64 内容 `normal-attachment`；删除后文件消失 |
| 2 | Chat 不能读删私有/配置/逃逸（49-63） | 5 路径（私有文件/配置/前缀 trick 目录/symlink 逃逸/`../agent-workspaces/{owner}`）读删全拒；原文件完好 |
| 3 | 普通会话双别名读己有+共享（65-73） | sessionId/access 两形态+相对 `shared.txt` 全 ok |
| 4 | 宽共享根不放私邻会话（75-88） | 私有文件/`{owner}/secret.txt` 拒；删除后遗留文件仍拒（`isReviewOwnedOrDeletedAgentSessionId` true） |
| 5 | symlink/显式附件不越围栏（90-103） | 文件/目录 symlink、`attachedFiles/attachedDirectories` 显式挂载均拒 |
| 6 | 跨工作区 traversal/symlink 拒（105-116） | 他工作区文件+symlink 拒；共享文件仍 ok |
| 7 | 私有路径识别（118-133） | owner 工作文件/transcript/checkpoint → true；普通会话文件 → false；删除后 owner 路径仍 true |

## 3. 真实断言

如 §2 表（逐条读自 :37-133）。

## 4. 未覆盖与脆弱点

- 未覆盖：远程网络面（在 websocket-relay 篇）。
- 脆弱点：`denied` 假定错误文案 `不在当前会话授权范围`；POSIX symlink 语义。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 用例断言如 §2 | 已证实 | 本文件逐行 |
| 路径面全隔离被固定 | 已证实 | 用例族 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 附件存储边界 | §2 | covered |
| 私有/配置/逃逸拒 | §2 | covered |
| 普通读/共享/围栏 | §2 | covered |
| traversal/私有识别 | §2 | covered |
