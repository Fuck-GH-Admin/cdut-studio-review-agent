---
path: apps/electron/src/main/lib/team-memory-agent-tools.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 93b07b4ea201662f73c2dab5f53ff0688e38ae88
sha256: 3ad44201bc542f36434a00d95779696a026bdaa8cc3d7f785cb3d52d67ced956
lines: 32
kind: source
package: p03-integrations
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/team-memory-agent-tools.ts

## 1. 结论与边界

团队记忆 **Agent 工具受限面**（32 行）：`teamMemoryOperations(workspaceId?)` 返回 5 方法受限对象（list/read/search/create/update），供团队 Agent 按需读写团队共同知识。**安全红线**（`:11`）："团队 Agent 只使用此受限集合：可按需读写，不能归档/恢复/强制覆盖团队共同知识"——归档/版本历史能力刻意不透出（`archiveTeamMemory`/`listTeamMemoryRevisions` 在服务层存在但此处不暴露）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `teamMemoryOperations` | `:12` | `(workspaceId?) => {list, read, search, create, update}`；workspaceId 空→throw（`:7`："当前会话不属于团队工作区，无法访问团队共享记忆。"） |

内部：`requireTeamWorkspace:6-9`；5 方法：`list()`（→data??[]/error）、`read(memoryId)`、`search(query)`（list 全量后 `path+title` 子串过滤；**空 query 恒真返回全部**；返回形状 `{matches}` 与同级不一致）、`create(input)`、`update(memoryId, expectedVersion, input)`（conflict 透传 `{error,conflict}`）。
孤儿：`ToolResult`/`result()`（`:4-5` 定义后零调用）、`TeamMemoryDocument` import（`:1` 零使用）。

## 3. 内部逻辑与关键流程

单工厂函数：校验 workspaceId→委托 `./team-memory-service` 4 个 API→结果归一为 `{data}`/`{error}`/`{matches}`。

## 4. 调用者与调用链

团队 Agent 工具注册层；出向 `./team-memory-service`（list/read/create/update 4 个）。

## 5. 数据 I/O、读写与副作用

经 service 层 HTTP；本层无本地 I/O。

## 6. 分支、失败、取消与恢复

无 workspaceId→throw（权限闸）；service 失败→`{error}`（不抛）；update 冲突→`{conflict}` 交 Agent 决策。

## 7. 权限与权威状态

- **受限集合红线**（`:11`）：5 方法白名单，无 archive/restore/强制覆盖入口。
- 乐观锁是"不强制覆盖"的唯一保障（update 命中 expectedVersion 时仍可整体替换 content——红线范围有限，照实记录）。
- 红线只约束工具层暴露面：绕过本层直调 service 仍可归档（矛盾⑭）。

## 8. 修改影响面

改暴露面直接影响 Agent 能力边界（安全敏感）；search 语义影响 Agent 检索质量。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件/红线/5 方法语义 | 已证实 | 32 行全读（子agent 字节核对） |
| **②** 孤儿代码 result()/ToolResult 零调用；**⑬** search 形状不一致+空 query 恒真；**⑭** 红线仅工具层（service 仍公开 archive） | 已证实 | `:4-5`/search 实现/`./team-memory-service:30-31` |
| Agent 实际调用面 | 未知 | 工具注册层不在本批 |

## 11. 覆盖表

全文件 covered；调用面/测试 unknown。
