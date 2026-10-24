---
path: apps/electron/src/main/lib/conversation-manager.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 96a5a670be1cfbed7f1c14ba46413e533ec873d3
sha256: 001f41223dc12dc0991a48e16cdd67896cfb5b22f5ba980f3c684b5b06770bcf
lines: 1171
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/conversation-manager.ts

## 1. 结论与边界

**对话管理器**（`conversation-manager.ts:1-16` 注释）：对话 CRUD 与消息持久化。索引 `~/.proma/conversations.json`（轻量元数据含 activePath）、消息 `~/.proma/conversations/{id}.jsonl`（逐行追加、每条带 parentId）、旧 sidecar `.discarded.jsonl` 仅历史兼容读取（`:7`）。**消息结构=DAG（parentId 链）**；activePath 必须 root→leaf 全段（根 parentId=null、链连续、不跳节点），入库前 `setActivePath` 校验、删除后 `deleteMessageFromTree` 归一化兜底，**所有写入路径统一契约**（`:9-15`）。

## 2. 导出与关键符号（24 条，分组）

**元数据 CRUD**：`DEFAULT_CONVERSATION_TITLE='新对话'`（`:96`）、`getConversationMeta`（`:101`）、`listConversations`（含归档开关、updatedAt 降序 `:110-115`）、`countArchivedConversations`（轻量计数 `:120-127`）、`createConversation`（`:137-162`）、`updateConversationMeta`（白名单字段 `:297-323`；**非手动归档操作自动恢复活跃** `:309-314`）、`deleteConversation`（`:332-361`：索引+消息文件+丢弃段+附件目录四清）、`autoArchiveConversations`（置顶不归档 `:438-456`）、`updateContextDividers`（`:426-428`）。

**消息读写**：`getConversationMessages`（`:173-187`，lazy 迁移后读）、`getMessageContent`（hover 用单条 `:195-200`）、`getRecentMessages`（尾部分页 `:212-238`）、`appendMessage`（`:248-268`：追加+updatedAt+归档自动恢复）、`saveConversationMessages`（全量覆写 `:278-288`）、`deleteMessage`（转 deleteMessageFromTree `:372-374`）、`truncateMessagesFrom`（`:387-417`：截断起点起全删，可保留起点附件供重发 `:404-412`）。

**搜索**：`searchConversationMessages`（`:473-529`：query≥2、maxResults 30、主流+sidecar 双源、命中早退）。

**分支树（DAG）**：`getConversationBranch`（`:801-834`：activePath 优先、断链回退最长根链 `:821-833`）、`setActivePath`（**:847-872，严格 root→leaf 校验**，PR #121 review 注释 `:839-845`：空/不存在/非根起点/链不连续均抛）、`ensureActivePath`（`:875-884`，缺省才写）、`forkBranchAt`（**:899-936**：新 user 消息与 anchor 兄弟（同 parentId）；写 JSONL+activePath 截断到 anchor 前+append）、`appendBranchTail`（`:946-973`：挂 active 末端+append activePath）、`getBranchTree`（`:978-1012`：nodes/rootIds/activePath 快照，childIds 按 createdAt 排序）、`isOnActiveBranch`（`:1017-1020`）、`deleteMessageFromTree`（**:1041-1123**：删除 target+整 descendant 子树不动兄弟 `:1052-1063`；清附件 `:1065-1077`；activePath 过滤+链连续性二次截断 `:1083-1118`；清空则**退到根**（不退中间节点，守严格契约 `:1109-1114`））。

**丢弃段（旧 sidecar）**：`DiscardedSegmentRecord` re-export（`:65`）、`listDiscardedSegments`（倒序 `:1130-1154`）、`deleteDiscardedSegments`（`:1161-1171`）。

内部：`readIndex/writeIndex`（原子写+失败抛 `:70-89`）、`messagesCache`（in-memory，写类函数必须 invalidate `:682-692`）、`ensureTreeMigrated`（**:703-748**：缺 parentId 按线性推断首 null 其余=前一条、重写文件、初始化 activePath、幂等 `:701`）、`readAllMessagesFresh`/`writeAllMessages`/`touchConversationUpdatedAt`（`:753-794`）、搜索内部 `findMatchesInJsonl`/`findMatchesInDiscardedSegments`/`makeSnippet`（流式逐行、±40 片段 `:540-678`）。

## 3. 内部逻辑与关键流程

核心=**DAG+activePath 契约**（§1）：写入口（appendMessage 旁路链/`setActivePath`/forkBranchAt/appendBranchTail/deleteMessageFromTree）统一维护 root→leaf；`ensureTreeMigrated` 把旧线性 JSONL 惰性迁移为链（`:731-738`）；缓存读写（`:753-784`）在变更时同步更新。

## 4. 调用者与调用链

- 入向：conversation-title-service（meta/branch/update）、Chat UI/侧边栏、搜索 UI（跨文件）；测试 `conversation-manager.test.ts`（同批）。
- 出向：`./safe-file`（writeJsonFileAtomic/readJsonFileSafe `:20`）、`./config-paths`、`./attachment-service`（deleteAttachment/deleteConversationAttachments `:28`）、`@profer/shared` 类型、`node:fs`/`readline`/`crypto`。

## 5. 数据 I/O、读写与副作用

读写索引 JSON/消息 JSONL/丢弃段 JSONL/附件文件（删除）；in-memory 缓存；console。写失败路径多处 throw（`:87/:266/:286`）或 warn 降级（删除类 `:350/:1073`）。

## 6. 分支、失败、取消与恢复

解析失败跳行（`:721-723/:766-769`）；删除后 activePath 归一（§2）；迁移幂等（`:701`）；不适用取消/恢复（同步 fs）。

## 7. 权限与权威状态

契约红线：activePath 严格 root→leaf（`:839-845`）、删除清空退根不退中间节点（`:1109-1114`）、归档自动恢复语义（`:255-261/:309-314`）。

## 8. 修改影响面

改 DAG/activePath 语义 → Chat 分支树 UI、重发/编辑重发、搜索、标题服务（激活分支）；缓存一致性牵动全部读写路径。

## 9. 测试证据

**直接测试 `conversation-manager.test.ts`（243 行，同批，NOT_RUN）**，断言见测试手册。未覆盖项见测试手册 §4。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 24 导出+11 内部+DAG 全分支 | 已证实 | 逐行读 `:1-1171` |
| PR #121 契约背景 | 已证实（注释） | `:839-845` |
| 调用方（Chat UI）行为 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号组 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 元数据 CRUD | §2 | `:96-456` | covered |
| 消息读写/搜索 | §2 | `:173-678` | covered |
| DAG/activePath | §2/§3 | `:680-1123` | covered |
| 丢弃段兼容 | §2 | `:1125-1171` | covered |
| 测试 | §9 | 测试文件 | covered（NOT_RUN） |
