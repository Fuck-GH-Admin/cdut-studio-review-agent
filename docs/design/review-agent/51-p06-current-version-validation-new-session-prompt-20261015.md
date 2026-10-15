# 51｜新会话提示词：P06 最新主分支兼容性与独立验证（2026-10-15）

> 这是给**新 ChatGPT 会话**直接使用的任务提示。先看 [50 号总交接](50-p06-current-version-handoff-20261015.md)，49 的 U0/U1 优先于 47 的 L02-00～04。本提示不授权合并、更改 main 或动用真实生产数据。

## 复制下列内容作为新会话第一条消息

宝宝，正式接手 CDUT Studio 审核后台化项目的 **P06-RECHECK-LIVE-02 / L02-U0（最新版本兼容性核验）**。项目测试仓库：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent，工作 PR：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/21，原项目只读：https://github.com/Nya-Angle/CDUT-Studio。

此任务的重点不是继续老版本 E06-C 开发，而是**先恢复历史真实工作与最新主分支的整合事实，再判断现有审核功能在新 Office 引擎、只读预览侧栏、普通 Pi 文档工具/提示词/压缩机制下是否保持正确，最后在一个隔离候选版本上做 U0→U1 的分层验证**。真正有价值的是可复现事实与失败归因，不是测试数量或 CI 全绿。

**接手开始先执行**：
1. 完整读取 docs/design/review-agent/50-p06-current-version-handoff-20261015.md（所有历史/SHA/边界）→49-upstream-impact-replan-20261015.md（现行顺序）→我方 main 固定版 48-upstream-cloud-main-integration-20261015.md（八文件整合与失败证据）→47-p06-evidence-driven-followup-plan-20261015.md（后续业务质量目标）→46-p06-recheck-live-local-acceptance-20261014.md 及 acceptance-status.json（旧源码实机冻结证据）→29-background-session-preflight-audit.md（唯一 LIVE-01～08 台账）→27-background-review-session-proposal.md（架构）和30/31、32。
2. 不相信提示里任何 SHA 永远最新。重新从 GitHub 读我方 main、feat/review-owned-background-sessions、Nya-Angle/CDUT-Studio main 的 HEAD；PR #21 Draft 状态、近期提交、Git merge-base/ancestry、compare 文件/接口、当前 Actions CI，严格区分不同 SHA。
3. 初始快照仅供定位：我方 main 8989941b6fb5651564e32d11c4215b6a6d5a5209，审核 PR 分支 d9c22c409345d0ba0844dfcc09525f24dc92f1cc，上游 main c179f2575d5bb5abdc883268fb885d1a6449325e；旧实机源码 b95b44f7a06bb1e1ae21a985b5bb4cd9f5581027。main 是文件树整合而非正常 Git merge，PR 并未合并，不能盲目 rebase/merge/cherry-pick 或恢复旧 Preview Tab。
4. 本批 U0 详细检查八个冲突落点：Main ipc.ts、document-parser.ts、review/pi-review-executor.ts、review/v2-executor-factory.ts、preview-opener.ts、FilePreviewDialog.tsx、useGlobalAgentListeners.ts、useOpenSession.ts，并沿调用图检查 Office engine index v2、fileId/revision/anchor 与 review documentVersionId/SourceRef 的映射、普通 Kernel Document Engine 与严格五工具的隔离、canUseTool/owner/assignment/RunStore/Bridge、preview 只读侧栏、晚到事件和新依赖。每个入口列新旧版本差异、生产实际调用点、影响等级、旧测试何处失效和新版应有反例，不能只看文件名或 CI 是否绿色。
5. 在**只读/隔离工作树**设计并在条件允许时冻结候选集成 tree/hash，注明选取基线、差异、怎样保留新上游解析/预览且不重复覆盖已整合的审核代码。未经用户明确批准不推送 main 或重写 PR HEAD；如必须决定分支迁移/新 PR，先提供精确方案和影响，等待批准。候选版本存在时实际运行冻结依赖、typecheck、boundaries、构建、适用专项及全仓测试，记录真实退出码和失败。如果没有有效候选，标 BLOCKED_INPUT，不假定 U0 完成。
6. U0 取得可审计候选版本与有效安全矩阵后，若有隔离真实执行环境，继续 U1 **定向**验证 Office v2 解析/来源锚点、strict review 工具与普通 Read/RAG 隔离、readonly sidebar/owner/权限撤销/版本过期及旧回复迟到等，成功/拒止/失败各要真实证据。核心 Main/权限/RunStore 改动若影响以前 E05/E03/E04/ENOSPC/重启的条件，按影响范围复验在**候选新 SHA**，不可拿 46 号旧实机 PASS 代签。没有 provider 授权或新版本未构建时如实 NOT-RUN。
7. 完成 U0/U1 后**才**依据47进入 L02-00 E06-C 失败归因、L02-01 A/B/C 业务闭环、L02-02 严格扫描 PDF/PNG/压缩、L02-03 Claude/双窗/平台、L02-04 P05 外部与最终 LIVE 对账；未完成前不可越阶段。

**必须保留的安全和事实**：27 的轻量 Main-owned Pi、V2 唯一事实、owner 不代表工具授权、有效 case/run/assignment/材料版本/SourceRef 与严格工具白名单，不得降级；原 38 审计仍 3 PASS/1 FAIL、旧 SETTLE chmod 故障注入无效，失败原样留存；46 的 16 实机场景/77 断言仅对 b95b44f7 旧生产源码有效；E06 完整矩阵 PARTIAL、C 有 execution-failed；P05 Relay BLOCKED、Pocket PATCH READY/TARGET NOT-RUN；P04 永久 tombstone/UUID journal 禁止无安全证明 TTL/GC；P06-S02 NOT ACCEPTED / P06 PARTIAL / LIVE-07 PARTIAL，PR #21 Draft/Open/MERGE NO-GO，不进入 P07/P08、不写上游。

**保密与交付**：隔离 profile 和合成材料；不用真实账号/个人案卷，不上传 provider 密钥、设备、原始 transcript、私有 binding。每项保留源码 SHA/tree、输入 hash、实际 IPC/工具/模型、退出码、截图/时间线、脱敏/原始 SHA、PASS/FAIL/NOT-RUN/BLOCKED/UNKNOWN 分类和首败。新会话应尽可能完成当前授权范围内可进行的只读与隔离验证；将事实写为新的编号审计文档，必要时同步29唯一台账、30/31交接和 PR 注记；不得为了交差修改 Gold 或把不同版本的成功混为一谈。最后给出 U0 实际结论、U1 是否准入、用户需要批准的具体分支处理和最值得执行的下一批。

## 提醒

若仓库存在更新，以真实远端 HEAD 和新文档为准。**先恢复工作和事实，再测试，最后决定代码更改**；证据不全时交付可信的 PARTIAL，比伪造完整 PASS 更有价值。
