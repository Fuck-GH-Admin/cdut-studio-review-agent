# 02｜Pi 后台 session、权限、Owner 与终态生命周期

固定 P06 R03：`db0284879f75ce123b5d83cb6577a3cc7ad057da`。安全判断基于代码/测试源码，**并非本轮实机或 Provider 通过**。

## 为什么需要后台 Owner

后台审核不是把普通聊天窗口的 UI 隐藏：长任务拥有真实的 session/turn、动作授权、模型工具、源目录、取消、终态和内部事件。如果任由普通 Agent 列表、历史搜索、聊天发送/停止、Pocket/Relay 或 MCP 权限默认操作同一 session，可能让普通工作空间操纵受控审核，或把敏感材料/过期指派带入下一轮。Owner 在 Main 建立，**普通会话 IPC 不得设置 owner**；受管会话即使索引回滚也保留“此 ID 曾是审核专属”的身份屏障。将结果状态只投影自持久 V2 Run，是避免第二套业务事实的关键。

## 建立 → 受理 → 使用 → 收尾

1. `review-ipc.START_BACKGROUND_PI_REVIEW_V2` 要求真实 Main 窗口 sender；`startBackgroundPiReview` 校验 case、渠道模型、无其他活动 Run/Owner。模式 update 可复用同 owner + 模型会话，restart 创建新 internal session。
2. `createReviewOwnedAgentSession` 先把 ID 写入 `review-owner-ids.log`，然后原子写 session index；遇旧 `.bak` 恢复/owner 字段失踪、删除后的迟到 metadata，通过独立 UUID fence + tombstone 继续按特殊身份拒绝普通操作。
3. `preparePiReviewRunV2` 校验案卷、固定模板/D2 Plan、有效规则与目标，创建 V2 `running` Run 和 `review-agent-assignments.json` 指派（会话/用户真实 turn/案卷/run/action）。
4. `admitPreparedPiReviewTurn` 防双入场；**Main Orchestrator 真正获得活动 token 的回调**才发 ACK，持久 `running` 文件本身不构成 ACK。ACK 只有 session/Run 关联的受理事实，不是 Provider 或审核已完成证明。
5. `agent-orchestrator` 从当前 `review-operator` 用户 turn 获取有效 binding。后台 owner 若无此 binding **在 adapter 前抛错**，不降级到普通 Pi。`selectDirectReviewStrictTools` 严格选择 4 个 Main 工具 + Pi 内核 `CompactContext`：
   - `review_read_documents`
   - `review_inspect_document_image`
   - `review_submit_result`
   - `review_inspect_original`（按当前案卷 documentVersionId）
   - `CompactContext`
   禁止普通 Bash、MCP、Read/Write、任意路径与未白名单插件。
6. 工具准入 `isAuthorizedDirectReviewTool` 校验同 session/assignment/run；`checkAssignment` 按调用读取当前持久授权且仅 user-triggered；`review_inspect_original` 使用 realpathSync 确认文件处于当前案卷，渲染 await **前后**再次检查绑定，只有有效视觉返回才记原件浏览账本。模型提供的文档名/Prompt 不扩展授权根。
7. 正常终态来自 `review_submit_result(finish=true)` 成功提交，模型流结束未提交时写 `partially-completed`，取消写 `cancelled`，异常写 `failed`。Trusted `onRunOutcome` 只可为自己的 Run 收尾，不应复活新 Run。收尾必撤销指派，包含异常/终态落盘失败时本进程的 pending deny。
8. `STOP_BACKGROUND_PI_REVIEW_V2` 校验 runId 与当前 owner；`stopAgentAndWait` 等 Orchestrator owner finally **真正释放执行 token**，再尝试写 stopped/撤指派。普通“发送 stop 信号”不等于所有工具已退出；重启时 `markStaleRunsInterrupted` 先把遗留 queued/running 加入进程本地拒止，再尝试写 failed。

## 信任边界与真实语义

| 事件 | 代码负责层 | 可证明的结果 | 不能据此证明 |
|---|---|---|---|
| UI 返回 accepted ACK | `review-pi-admission` / Orchestrator token | Main 已受理并取得运行权 | Provider 已提交 Check |
| Renderer 隐藏会话 | projection publisher | 不暴露内部 Owner 元信息 | 工具、取消、远端访问已隔离 |
| 持久 `running` | run-store-v2 | 上次记录开始或未收尾 | 当前仍有真实执行权 |
| stop/abort | Orchestrator abort + `stopAgentAndWait` | 等实际 owner finally 后可安全再启动 | 网络请求已经物理撤回所有不可逆外部动作 |
| revokedAt 落盘失败 | assignment pendingRevocations | **当前进程**立即拒绝工具，log 故障可见 | 跨 PID/重启写盘原子性已经实测 |
| session 已删除、迟到 upsert | owner UUID fence + tombstone + projection revision | 普通 UI 不能重新认领该 ID（源码机制） | 真实所有远端客户端组合的实机覆盖 |

**待确认细节**：当前 `isAuthorizedDirectReviewTool` 通过 `verifyCurrentBinding` 验 binding，`checkAssignment` 在结果提交/业务写入口完成持久授权校验；原件预览 await 后检查绑定。仍须对每个 read/inspect/CompactContext 的真实 SDK callback 测试撤权和终态写失败，不能只凭外层缩减清单推导全链安全。渲染开始与文件实际使用之间仍有原件替换/TOCTOU 与原始 SHA 核验疑点，需要与 DOC-02/04 跨团队对证。

## 测试和原始证据位置

- [review-agent-assignment.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/review-agent-assignment.ts) blob `959eaf18efaaef302f3cbb9760501b90400e6549`。
- [review-pi-admission.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/review-pi-admission.ts) blob `f4a6369170dcfc2839b398b144afa07a9d1577d5`。
- [review-pi-run-bridge.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/review-pi-run-bridge.ts) blob `a4746a241e3d0a8c325ce927f3ea8e9f73cfa198`。
- [review-strict-pi-tools.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/review-strict-pi-tools.ts) blob `83d6ddf165d3547c81804708253c68e528ecdd9c`。
- [review-background-state.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/review-background-state.ts) blob `f7f240afd1f53856b3ad846584d3dbfbb2cf9c04`。
- [agent-orchestrator.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/agent-orchestrator.ts) blob `ff5f8de00918b24ecf1484e2103446d34d901c59`，关键 1315–1340、1558–1567、1692–1710、3059、3343、3453。
- [agent-session-manager.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/agent-session-manager.ts) blob `77f221d146656482e5152879d0eb18917ec12a0b`，关键 155–225、474–487、636–659、1417、1474–1557。
- [agent-session-ui-projection-publisher.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/agent-session-ui-projection-publisher.ts) blob `f597ea414dedaf638867905da9dd690963b9e7a1`。
- [Orchestrator Main 工具拒止测试](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/agent-orchestrator-review-tool-gates.p06.test.ts) blob `4d36527ff20073a54c593b697f4ed11f2c041bae`；[Owner 备份回滚与跨进程测试](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review-owner-index-recovery.p06-fix01.test.ts) blob `97a7b31d371ebf661b3f03f2c056e586b61a31f5`；[P02 删除投影测试](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/agent-session-delete-projection.p02.test.ts) blob `f7f79382159a9b550e6d5faebc2b145ee11f0647`。
- 上述测试**仅 inspected，全部 NOT_RUN_THIS_ROUND**。历史 P02 真实首败、复验、Provider S0 条件见 05 文件，历史受控 13/13 或 SDK five tools 不等于本轮验收。
