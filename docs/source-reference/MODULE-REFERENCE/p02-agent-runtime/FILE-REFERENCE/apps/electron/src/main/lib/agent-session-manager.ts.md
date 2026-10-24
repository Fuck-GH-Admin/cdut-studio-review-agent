---
path: apps/electron/src/main/lib/agent-session-manager.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b573a67c8cacfb940daab6702ff699f1f7170829
sha256: 3ce25a205b03ff71eb246b8c9dd64d2a4f0e6e18b7d42a0d1ba4ff26c90142e7
lines: 3473
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-session-manager.ts

## 1. 结论与边界

**Agent 会话管理器**：会话 CRUD 与消息持久化（索引 `agent-sessions.json` + 消息 `{id}.jsonl`，`agent-session-manager.ts:1-9`）。全量 3473 行逐行读毕，覆盖：索引缓存/审核 owner 安全围栏（P06-FIX-01）、CRUD、大载荷外部化（blob）与截断兜底、消息读写/分页/搜索、Pi 分叉/撤销（rewind）、文件快照回退、迁移/归档/清理。写盘经 `writeJsonFileAtomic`；`CLAUDE_CONFIG_DIR` 模块加载时**无条件强制覆盖**为隔离目录（`:38-57`，防三方 SDK 数据串目录）。

## 2. 导出与关键符号

导出 30+，按域分组（行号为准）：

**安全围栏（P06-FIX-01）**：`isReviewOwnedOrDeletedAgentSessionId`（`:475`，ID-only 不可逆 deny journal `review-owner-ids.log` + 索引派生集合双源；**索引/日志损坏时 fail-closed 返回 true** `:489-494`）；`assertOrdinaryAgentSession`（`:660`，抛“内部审核会话不可通过普通 Agent 入口访问”）；`createReviewOwnedAgentSession`（`:642`，caseId 校验 `:650-653`，fence 先于索引写 `:593-597`）；fence 内部读写（`readOwnerFences` `:170`——撕裂条目/非法 UUID 抛错不降级 `:188-192`；`persistReviewOwnerFences` `:199`——0o600 追加+fsync+回读验证 `:206-215`）。

**索引/元数据**：`setAgentSessionActiveChecker`（`:85`，agent-service 注入活跃态）；`snapshotAgentRuntimeMeta`/`restoreAgentRuntimeMeta`（`:246,264`，runtime 切换回滚专用，绕过清理规则 `:260-263`）；`createAgentSession`（`:552`，预设/工作区自动绑定 `:565-578`，审核 owner 原子嵌入 `:593-597`，初始化 `.claude/settings.json`+`.context/` `:604-631`）；`createDelegatedChildSessionMeta`（`:388`，幂等+tombstone 拒绝 `:404-406`）；`listAgentSessions`（`:447`）/`countArchivedAgentSessions`（`:457`）/`getAgentSessionMeta`（`:469`）；`updateAgentSessionMeta`（`:1408`，owner 不可改 `:1420-1422`；runtime 实际切换→清 SDK/fork/resume/checkpoint 元数据 `:1443-1453`+回收 stale checkpoints `:1461-1468`；非停更更新自动解归档 `:1428-1430`；revision 自增 `:1440`）；`ensureProjectDraftAgentSession`（`:667`，一项目一草稿；有 user 消息则晋升 `:680-683`）。

**消息读写/外部化**：`MAX_SDK_MESSAGE_LENGTH=256K`（`:757`）；`sanitizeSerializedSessionLine`（`:768`，截断兜底，写入/迁移共用 `:761-767`）；`externalizeSerializedSessionLine`（`:973`，两级抽取：一级片段 2000/下限 2000，二级片段 200/下限 512（真实形态：大量中等字符串，`:810-816`）；含引用表预算收敛 `:918-926`；抽不动/写失败退截断 `:1004-1009`）；`resolveMessageBlobs`（`:1033`，**唯一还原入口**，缺失记 `_proferBlobsMissing` 不抛 `:1029-1031`）；`readSerializedBlobRefs`（`:1018`）；`appendAgentMessage`（`:733`）/`appendSDKMessages`（`:1063`，写入不丢错误卡 `:1064-1066`）；`getAgentSessionMessages`（`:691`，坏行跳过+已恢复断流卡过滤 `:710-723`）；`getAgentSessionSDKMessages`（`:1295`，双 overload 全量/分页 `SDKMessagePage`，分页只解析窗口 `:1312-1330`）；`truncateSDKMessagesBefore`/`truncateSDKMessages`（`:2711,2737`）；`DESKTOP_AGENT_PAGE_SIZE=60`（`:1231`）；`paginateSDKMessages`（`:3438`，**按 turn 边界向前扩展**防页间缺口 `:3454-3464`）；`searchAgentSessionMessages`（`:3188`，≤30 结果/会话 1 条早退）/`searchAgentSessionReferences`（`:3350`）。

**删除/维护**：`deleteAgentSession`（`:1477`：RAG 索引失效 `:1479`；checkpoint 迁移先于源清理 `:1490-1549`；owner tombstone 与索引删除原子提交 `:1550-1556`；清理消息/任务图/harness/工作目录/checkpoints/速课堂目录 `:1559-1607`；**SDK 清理只删自己 sdkSessionId 绝不动 forkSourceSdkSessionId** `:1611-1617`；Pi transcript 按 header 精确 ID 删 `:1635-1647`）；`deleteAgentSessionsByWorkspace`（`:1698`）；`getAgentSessionDeletionOrder`（`:527`，仅 sourceDelegationId 子会话级联、叶子到根）；`findOrphanSessions`（`:1719`，审核会话不进桌面健康面 `:1724-1725`）；`autoArchiveAgentSessions`（`:3124`，置顶/审核除外）；`cleanupStaleAttachedPaths`（`:3148`，**保留 updatedAt** `:3152-3153`）。

**Pi 分叉/撤销**：`forkAgentSession`（`:2557`，运行中拒/并发 fork 锁 `:2563-2568`）→ `forkPiAgentSession`（`:1911`：需已完成 assistant 目标 `:1913`、entry 映射/artifact 校验 `:1914-1918`、branch bindings 只带新分支 entry `:1965-1969`、检查点迁移到分叉自己的目录 `:2042-2071`、中断消息回退到上一完整 entry+隐藏上下文 `:1955-1964,2073-2099`、工作区基线还原=分叉点完成态语义 `:2101-2135`、失败清理半成品 `:2029-2033`）；`rewindPiSession`（`:2172`：9 步——定位 turn 用户提问/提取 undoneUserText/找检查点/保留 entry 候选/**物理截断 Pi JSONL**（header+主路径，临时文件原子替换 `:2392-2402`）/文件恢复失败即取消撤销 `:2378-2382`/展示 JSONL 截断/bindings/checkpoints 清理+workspaceId 补写 `:2431-2433`）；`resolveUserUuidFromSDK`（`:2772`，fork 回退到源会话 JSONL；`__LAST_TURN__` 特殊标记 `:2853-2855`）；`rewindFilesFromSnapshot`（`:2934`，file-history 快照恢复+路径越界拒绝 `:3065-3070`+fork fallback `:2960-2977`）。

**其它**：`moveSessionToWorkspace`（`:1793`，EXDEV 退复制+删 `:1836-1843`）；`migrateChatToAgentSession`（`:1876`）；`collectForeignCheckpointPaths`（`:505`）；`isAgentSessionForking`（`:89`）；测试替身（`__setAgentPreset…` 无；本文件用 `setAgentSessionActiveChecker` 注入）。

## 3. 内部逻辑与关键流程

- **索引缓存**（`:137-151,307-380`）：mtime+size 校验；派生 reviewOwnerIds/deletedReviewOwnerIds 从同一快照重建（`:219-231`）；写失败清缓存抛错（`:374-379`）；损坏索引**拒绝按空恢复**（`:322-326,357-361`）。
- **外部化两级**（`:788-1011`）：tokenize 路径 `a.b[0].c`（`:835-844`）；按长度降序抽最大字符串（`:929-961`）；blob 内容寻址去重；预算含引用表（`:918-926`）。
- **sanitize 收紧**（`:1205-1228`）：按序列化长度逐级收紧阈值（128K→32K→8K→4K，`:1092-1093`），JSON 转义膨胀对策（`:1206-1210`）；`applyOversizedSanitization` 四类膨胀源（text block/tool_result/base64 图片两种结构/error.message，`:1140-1203`）。
- **rewind 断流卡可见性**（`:1249-1283`）：只丢“之后已恢复”的瞬时断流卡，尾部失败保留（回归注释见 pi-runtime 测试）。

## 4. 调用者与调用链

- 入向（grep 全树）：`agent-service.ts`（本批）、`ipc.ts`（SESSION 族 40+ 通道，nb-05 批已读）、`agent-preset-operations.ts`（getAgentSessionMeta）、ui-projection-publisher（本批）、compaction（本批）、域外 orchestrator/remote/goal。
- 出向：safe-file/config-paths/agent-workspace-manager/agent-model-selection（assertEnabledModelForChannel）/agent-preset-manager/pi-harness/pi-session-fork/pi-file-checkpoint/fork-file-ops/error-patterns/@profer/shared/@profer/session-core/@profer/project-core/blob-store。
- 测试：6 个测试文件/**54 用例**（index-cache 2、pi-runtime 17、pi-fork 11、oversized-sanitize 13、payload-externalization 10、pagination 1）；全组口径另计（含 compaction 11、send-binding 6、send-coordinator 4、deletion 6）共 10 文件 81 用例。

## 5. 数据 I/O、读写与副作用

- 读写：`agent-sessions.json`（原子写）、`agent-sessions/{id}.jsonl`、`{id}-graph.jsonl`、Pi harness 事件、`review-owner-ids.log`（0o600+fsync）、Pi transcripts、SDK file-history/projects、blob 存储、备份。
- 模块加载副作用：强制 `CLAUDE_CONFIG_DIR`（`:47-57`）。

## 6. 分支、失败、取消与恢复

- fail-closed 三处：索引损坏拒普通访问（`:357-361`）、fence 损坏抛错（`:180-192`）、身份不可确认时拒普通入口（`:489-494`）。
- 回滚：fork 失败删半成品（`:2029-2033`）；rewind 文件恢复失败取消整个撤销（`:2378-2382`）；updateSettings 失败用 `restoreAgentRuntimeMeta` 快照回滚。
- 删除：checkpoint 迁移失败→摘除引用不悬空（`:1534-1549`）。

## 7. 权限与权威状态

- **审核 owner 权威**：ID-only deny journal（不可 GC，`:158-161`）+ 索引派生集合 + tombstone 三源；创建 fence 先于索引写（`:593-597`）；删除 tombstone 与索引原子（`:1550-1556`）。
- 数据完整权威：外部化“搬出不删”；截断仅兜底；旧 AgentMessage→SDKMessage 兼容转换（`:1350-1403`）。

## 8. 修改影响面

会话全链（IPC 40+ 通道/编排/预设/投影/远程）；`agent-sessions.json` schema 迁移需协调；测试 54 断言（6 文件口径）锁定文案与形状。

## 9. 测试证据

`NOT_RUN`。直接测试 6 文件 **54 个 `test(`**（机械核 2/17/11/13/10/1=54）：
- `agent-session-index-cache.test.ts`（2）：外部替换失效缓存、删索引不返陈旧数据（`:40-60`）。
- `agent-session-manager.pi-runtime.test.ts`（17）：健康检查递归找 Pi transcript、删除清理 transcript/graph/harness 不误伤、委派删除序、预设/渠道选择持久化、同 runtime 更新保元数据、快照回滚保 SDK/fork/resume、checkpoint 迁移/摘除、stale 回调不破坏 Pi 元数据、rewind entry 缺失优雅降级、缺 workspaceId 撤销补写、断流卡尾部可见/恢复后隐藏（`:56-423`）。
- `agent-session-manager.pi-fork.test.ts`（11）：运行中拒/并发 fork 锁、branch 元数据/检查点迁移且源删除后仍可回退、缺 bindings/artifact/目标拒、中断上下文、默认沙箱+路径重写、分叉点完成态还原、取消下一轮不误还原（`:132-519`；mock 仅 `./pi-session-fork` 边界，注释禁 mock 正式 SDK `:22-23`）。
- `agent-session-manager.oversized-sanitize.test.ts`（13）：四类膨胀源外部化（HTML/PDF base64/扁平 data 图/嵌套 text）、转义膨胀、多字段累加、截断兜底含标记、第二级 200 片段、两级抽不动原样保留（`:101-376`）。
- `agent-session-payload-externalization.test.ts`（10）：未超限零改动、片段+引用表、还原逐字节、同内容去重、幂等、blob 缺失降级不抛、无引用零开销（`:91-222`）。
- `agent-session-pagination.test.ts`（1）：向前扩展 turn 边界无缺口（`:51-75`）。
- mock 边界：electron 最小 mock+临时 PROFER_CONFIG_DIR；pi-fork 仅替换本地分叉边界。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 围栏 fail-closed/CRUD/外部化两级/rewind 9 步/删除清理序 | 已证实 | 全 3473 行四段逐行 + 60 测试互证 |
| `writeJsonFileAtomic`/blob-store/pi SDK 实现语义 | 边界 | 域外 |
| 真机大文件性能 | 未知 | NOT_RUN |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 30+ 导出（围栏/CRUD/外部化/删除/分叉/rewind/搜索） | §2 | 85-3473 | covered |
| 缓存/外部化/收紧/rewind 流程 | §3 | 137-1283 | covered |
| 测试 54 用例（6 文件口径；全组 10 文件 81） | §9 | test 文件 | covered（NOT_RUN） |
