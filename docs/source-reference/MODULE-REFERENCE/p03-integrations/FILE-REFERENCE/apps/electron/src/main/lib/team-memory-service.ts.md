---
path: apps/electron/src/main/lib/team-memory-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1d3b9be40bf95b0b81dedfe118c5299a4c53985f
sha256: 06c90a326b02ef227d33579fbdf622d7398785eb68858a067ab76d14e09c9a79
lines: 31
kind: source
package: p03-integrations
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/team-memory-service.ts

## 1. 结论与边界

团队记忆 REST 客户端（31 行）：6 个 CRUD/归档 API 直连团队服务 `/v1/workspaces/{id}/memories*`。薄封装（无本地状态/无缓存）；认证经 auth-service（`getTeamAuth`/`refreshAuthToken`），401 自动刷新重试一次（`:11-12`）。

## 2. 导出与关键符号

| 符号 | 行 | 行为 |
| --- | --- | --- |
| `listTeamMemories` | `:26` | GET 列表（`includeArchived`；返回去 content 摘要） |
| `readTeamMemory` | `:27` | GET 单文档 |
| `createTeamMemory` | `:28` | POST（path/title/content/changeSummary） |
| `updateTeamMemory` | `:29` | PATCH（**`expectedVersion` 乐观锁**） |
| `listTeamMemoryRevisions` | `:30` | GET 修订历史 |
| `archiveTeamMemory` | `:31` | POST archive/unarchive |

内部：`teamMemoryFetch:5-14`（鉴权+401 刷新重试）、`request:15-25`（统一 `TeamMemoryApiResult<T>`；**版本冲突特判** `:21-22`：`TEAM_MEMORY_VERSION_CONFLICT` 回 `conflict.current`）。

## 3. 内部逻辑与关键流程

请求链：auth→fetch→非 401 直返/401 刷新重试→`request` 归一 ok/error/conflict。纯 API 层。

## 4. 调用者与调用链

团队记忆 UI/工具层（main）；出向 `undici.fetch`、`./auth-service`、`@profer/shared`（TeamMemory* 类型）。

## 5. 数据 I/O、读写与副作用

HTTP(S) 至团队服务；无本地持久化。

## 6. 分支、失败、取消与恢复

未登录→`{ok:false,error:'未登录'}`；网络异常→'网络请求失败'；版本冲突→conflict 结构（调用方决定合并/放弃）；401 刷新失败返回原响应。

## 7. 权限与权威状态

`expectedVersion` 乐观并发（update 的权威闸）；token 由 auth-service 持有。

## 8. 修改影响面

改动影响团队记忆 UI 全部读写；冲突语义改动影响并发编辑体验。

## 9. 测试证据

无直接测试（同批无 team-memory-service.test.ts）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件 6 导出/冲突特判/401 重试 | 已证实 | 文件全读（31 行） |
| 服务端契约（字段/错误码） | 未知 | 服务端不在冻结树 |

## 11. 覆盖表

全文件 covered；服务端契约/测试 unknown。
