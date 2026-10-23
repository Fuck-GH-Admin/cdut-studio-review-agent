# 55｜P06 L02-U1 新版 Office / SourceRef / Pi / Preview / Owner 差分验收矩阵（2026-10-18）

> **U1 = NOT ADMITTED / NOT-RUN。** 本文是 U0 取得同一候选版本完整工程门禁后使用的测试合同与取证模板，**不是 U1 PASS 报告**。对应 Draft [#98](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/98)；完整 U0 候选、安装 chmod 首败及独立 gate 见 [54](54-p06-l02-u0-independent-candidate-and-gates-20261018.md)。

## 固定输入与可信等级

- 冻结整合源 main：`8989941b6fb5651564e32d11c4215b6a6d5a5209`，tree `b3df4773afc20ee46facd2366f35c5a78ee99e98`。
- PR #98 U0 candidate **必须以实际 CI checkout SHA/tree 为准**；下面不提前写入动态最终 SHA。先通过 54 的所有工程门禁，否则整个矩阵仍 `NOT ADMITTED`。
- 仅供差异复用：PR #72 `b1bcaffe5b9aa9ac7e02f71c95e651f24a17297f` 的 `review-office-v2-sourceref-boundary.l02.test.ts`；此前有局部 positive/negative 合同，但绝非真实 Main/IPC/Electron/Office 端到端结论。
- 真实历史：46 在 `b95b44f7` 的 16 场景/77 断言；U1 的新版入口需重新取证。
- 新上游 `8228d27ec27da21c8b71889d9addfa7f2e2e5658` 比历史参考上游增加 15 commits，含 IPC/Pi/SessionManager 差异，**未进入本轮冻结候选**。

## 可执行 U1 明细（逐项独立判词，默认全为 NOT-RUN）

字段约定：在每一项执行后另外填入同一 candidate SHA、OS/Electron/Bun/Node、真实命令/IPC 路径、输入与期望/实际、exit code、失败来源、raw/public 日志及 SHA256。只看 TS mock 不满足“LIVE Main/IPC”等级。不得直接改上游 Office #71。

| ID | 生产入口 / 范围 | 必须做的正例与负例 | 当前 |
| --- | --- | --- | --- |
| O01 | `document-parse-tools.ts` / `@profer/core/office-engine` DOCX | 不同路径同名 A/B 均可独立锚定；反例 A/B 同名不同内容、导入顺序调换不应错绑 `fN` | NOT-RUN |
| O02 | 上同 XLSX | 不同工作表/单元格正确锚定；反例跨表/同名异路径/同 stem 跨格式不能互认 | NOT-RUN |
| O03 | 上同 PPTX | slide 结构及引用可回读；同 stem 不同源/修改后索引不得替代旧文档 | NOT-RUN |
| O04 | `review/document-service.ts` PDF/Office | 真实可读 PDF 的真实来源与审核块；扫描/空页/损坏与无文本回退不得伪造“已读” | NOT-RUN |
| O05 | `materializeToWorkspace` / `manifest.json` / `registry.json` | 同物理源 unchanged revision 命中；源文件更改、缓存失效、重启后旧 `fileId/revision` 不得错误复用 | NOT-RUN |
| O06 | 普通 Office 锚点与审核材料版本接口 | 在两个独立空间索引同一字节材料，明确映射/不映射；普通 RAG 锚点不可冒充审核证据 | NOT-RUN |
| S01 | `review-tools.ts` / `buildReviewTools` | 复用 #72 的同名 `rev-a/rev-b` 正例，每次只接受正确 `documentVersionId + blockId + quote` | NOT-RUN |
| S02 | 同上 `submit_check`、`record_observation` | 拒绝 `fileId=f1/revision/f1:p1-b0`、错引文、跨版本块、过期版本、跨案引用 | NOT-RUN |
| S03 | `review-strict-pi-tools.ts` `review_inspect_original` | 本案活跃材料真实视觉工具回执；任意路径、符号链接案卷外和跨案拒绝 | NOT-RUN |
| S04 | 同上 async 读取 | 解析/视觉调用中变更 assignment 或 documentVersionId、await 返回后撤权必须拒绝写回 | NOT-RUN |
| S05 | Review V2 result/coverage/SourceRef | 版本/位置/引文/parseRevision 一致；普通 Office index / RAG / 仅 preview 截图不能写覆盖账本 | NOT-RUN |
| T01 | `agent-orchestrator.ts` → `selectDirectReviewStrictTools` | 真实 active Pi binding 正向仅四个 review 专属工具 + `CompactContext`；失效 binding 拒绝 | NOT-RUN |
| T02 | `pi-agent-adapter.ts` `toolProfile='review'` | 用真实 `runAgent` 确保 Bash/Write/Read/MCP/AskUser 与注入 customTools 均不可见/不可调用；Host 未授权不能靠 adapter 自动过滤 | NOT-RUN |
| T03 | `canUseTool` + `review-agent-assignment.ts` | 同案有效授权五工具可执行；跨案/已 revoke/旧 turn/伪造 owner 即使工具名正确也拒绝 | NOT-RUN |
| T04 | `CompactContext` + tool outcome | 分轮压缩前后仍需同案权限/材料版本；不允许普通上下文把旧授权复活 | NOT-RUN |
| T05 | 普通 Pi profile | 普通 Agent 的合法 Read/MCP/文档预览操作保持可用，严格白名单不得误作用于普通会话 | NOT-RUN |
| P01 | `preview-opener.ts` / `openSidebarFilePreview` | 普通会话只读侧栏正例；旧 Preview Tab API 不恢复、预览权限不变更 | NOT-RUN |
| P02 | `openFilePreviewTabAuthorized` / `ensureOrdinaryWorkTabOwner` | 合法 owner 可开侧栏；review owner、已删除 owner、伪造 lookup、延迟 lookup 不得预览内部文件 | NOT-RUN |
| P03 | `useGlobalAgentListeners.ts` / `useOpenSession.ts` | review owner 不投影进 sidebar/search/archive/events；普通归档/恢复正例必须保留 | NOT-RUN |
| P04 | `FilePreviewDialog` / `preparePdfPreview` / `review-private-file-access` | 真实 DOCX/XLSX/PPTX/扫描 PDF UI 只读；symlink/rename/路径越界与过期 owner 拒绝 | NOT-RUN |
| P05 | `review-actions-controller.ts` / Renderer fence | 结束轮次后旧响应/慢事件/旧 Hook 写入不回退；新版真实 Main/IPC E05 最小定向复验 | NOT-RUN |
| P06 | `review-pi-run-bridge.ts` / `RunStore V2` | 新版真实 Main ACK、stop pending/busy/restart(E03)、旧 outcome(E04)，关键权限影响时恢复失败安全 | NOT-RUN |
| P07 | 持久化、owner UUID journal、tombstone | 实际双失写、ENOSPC、故障重启及恢复重启，旧 owner/assignment 永不复活 | NOT-RUN |

## 需要先定界的可复现已知问题

**#71 / UPSTREAM / DEFERRED_FIX。** 普通 `allocateSessionFileId` 使用 `manifest[stem]` 的路径独立缓存键，旧实现缺 `existing.sourcePath === resolvedSourcePath` 校验；这是有源码依据的风险，先做真实 DOCX/XLSX/PPTX/路径/缓存/重启/新版 Main 影响证据。如错误影响多材料证据正确性，把本 U1/发布门禁 `BLOCKED_SECURITY_OR_UPSTREAM`，**不能在此 PR 顺手修共享 Office 源码**。集中验收后的下一轮，先上游独立 PR，再我方审核专属独立 PR。

**#79 / HARNESS。** U0 原 main 的 `bun install` 后入口 mode 漂移导致 clean exit1，修补 CLI 源码 mode 后应在 #98 的独立 U0 runner 工件中确认；如果仍失败，U1 不准入。原始 artifact/日志不覆盖。

## 证据分类与现实执行门槛

| 证据等级 | 合格材料 | 常见不可替代项 |
| --- | --- | --- |
| STATIC | 具体代码入口、blob、对应 diff | 不可宣称 LIVE |
| CONTROLLED | Bun 真实函数测试、固定 SHA、真实退出码 | 不等于 Electron IPC |
| MAIN_IPC | 真 Electron main/preload/renderer + 请求事件、时间线、权限拒绝回执 | mock 接线不足 |
| PI_PROVIDER | 实际 provider 模型 + tool calls、binding 证据、原件读取回执，公开前脱敏 | screenshot/普通 RAG 不代替 |
| IO_RECOVERY | 原子写真实故障、PID/磁盘状态、实际重启恢复 | 单纯 mock/EACCES 空注入无效 |

每条缺日志、缺运行权限或缺设备，必须留 `BLOCKED_ENV / NOT-RUN` 而非 PASS。Provider 秘钥、真实案卷、原始 transcript 不上传公共工件。避免修改 37/38/44/46 原始证据和隐藏 Gold。Main/IPC/owner 权限一旦修生产代码，按影响范围增加 E03/E04/E05/恢复/ENOSPC 回归。

## 下一步执行/交接

1. 从 PR #98 的 U0 workflow 下载对应 **current HEAD** 的 `manifest.json`、`commands.tsv`、`SHA256SUMS` 和 logs，对照 54 逐项签 U0。失败则保留原始首败、最小修补并以新候选重试。
2. 仅 U0 通过后，将 PR #72 局部测试与本 candidate diff 校验，再逐项实现 U1 的真实 Office/IPC/Pi/preview 正负例，严格分开 `STATIC/CONTROLLED/MAIN_IPC/PI_PROVIDER/IO_RECOVERY` 判词，引用每个成功的对应 SHA。
3. U1 的安全和兼容性入口签署以后才恢复 47 的 L02-00 C 技术失败归因、L02-01 A/B/C 人工闭环、L02-02 严格原件与压缩、L02-03 普通 Agent/多窗口/系统，L02-04 外部门禁与 29 的完整 LIVE 对账。
4. 不修改冻结历史、main、PR #21/#72、上游、Gold、P04 tombstone/journal，不开 P07/P08。仍为 `P06 PARTIAL` / `P06-S02 NOT ACCEPTED` / `MERGE NO-GO`。
