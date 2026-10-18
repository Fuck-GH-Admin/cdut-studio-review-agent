# 63｜P06 L02-U1 本机 Agent 独立实机验收任务书（2026-10-18）

> **必须实际执行**。本任务仅承担云端无法签署的真实 Electron/Main/IPC/Pi Provider、Office Parser、Preview/Owner、I/O/重启及 L02-00 纯文本合成业务复演。它不是重新写计划，也不自动发布 U1。先读 [62](62-p06-l02-u1-two-stage-handoff-20261018.md)、[55](55-p06-l02-u1-differential-matrix-20261018.md)、[56](56-p06-l02-u0-u1-first-failure-fix-evidence-handoff-20261018.md)、[59](59-p06-l02-00-session-handoff-20261018.md)、[60](60-p06-l02-00-restart-execution-task-20261018.md)、[61](61-p06-l02-00-r02-independent-reexecution-20261018.md)、`AGENTS.md` 和原始客户端代码。保留 P06 PARTIAL / P06-S02 NOT ACCEPTED / MERGE NO-GO、P07/P08 NOT STARTED、#71 延后修复。

## 一、接手前 8 个实际动作（顺序不可跳）

1. 通过 `git fetch --prune`、`gh pr view 103 --json headRefName,headRefOid,baseRefName,isDraft`、`git ls-remote` 核对 PR #103 最新 HEAD/父 SHA，核对 PR #101 固定父 `0524604cac13794af5f43cff7771160f98f176d9`、PR #98 `2d9e93f3a637e8325862769f80fe4b4e884c51a1`。若最新 HEAD/父已漂移，重新差分阅读并锁定实际 SHA；不静默换版。
2. 下载 PR #103 **相同 HEAD** 的专项 Actions 和完整 PR CI logs、artifact，核对 `checkout-sha.txt`、`checkout-tree.txt`、`commands.tsv`、`SHA256SUMS`、原始失败（如果有）。单独登记 remote PASS / FAIL / PENDING；旧 CI 不转用。
3. 从 PR #103 实际 HEAD 建**新的独立 worktree**及 `audit/p06-l02-u1-local-real-r01`，原 PR #103 不修改。工作树应无污点，保留最初 `git status --porcelain=v1`、`git rev-parse HEAD`、`git rev-parse HEAD^{tree}`。
4. `node --version`、`bun --version`、`git --version`、Electron `process.versions.electron`、操作系统、文件系统类型、GPU/GUI/Xvfb 状态、runner/应用版本写入 `environment.json`。检测当前客户端支持 Linux/Windows/macOS 的真实 GUI 驱动；原自动脚本的 Xvfb/localhost 调试端口只适合受控 Linux 场景，不默认支持 Windows。
5. 在**新建的、不含真实用户数据**的隔离目录配置 `PROFER_CONFIG_DIR`、`PROFER_USER_DATA_DIR` 和 Pi JSONL/session 路径；配置渠道仅由本机授权用户操作，凭证不得出现在 shell 历史、日志、仓库、PR 和公开 artifact。准备测试期间禁止指向真实 `~/.cdutai` 目录。所有清理只许针对本任务创建且已核对 realpath 的目录。
6. 执行 `bun install --frozen-lockfile`、`bun run typecheck`、`bun run check:boundaries`、`bun run electron:build`、`bun test --isolate --timeout 30000`（若全仓过重，仍必须完整单独报告），逐条记录真实 exit/status/日志。失败先保存，不先修改目标测试以求绿。
7. 阅读已有 `scripts/qa/review-live-*.mjs`、`review-live-main.ts`、`review-live-command.py`、`review-live-gates.py` 和当前 `.github/workflows/`；**不要未经审查直接复用 2026-10-14 的 `review-live-launch.py`**：它有固定 `p06-recheck-live-` 名称、旧 profile 目录、5176/9222/9230 端口、硬编码实例名和授权前提。必须按本次测试显式化这些配置并保存差异；绝不为适配旧脚本重用旧私有 profile。
8. 将每条真实执行包装成独立命令，捕获开始/结束 UTC、cwd、args（脱敏）、exit code、stdout/stderr、文件 SHA256。推荐在私有 `evidence/local-u1-raw-<run-id>` 保存原件，在新分支 `docs/design/review-agent/acceptance/p06-u1-local-r01/` 只保存公开脱敏机器摘要/清单。若 Git 默认忽略敏感文件，不强制 add。

## 二、最小安全真实冒烟 S0（放行后才允许运行合成业务）

| ID | 必须用真实链路执行的操作 | 通过标准（不能仅靠 mock 或 TS 单测） |
| --- | --- | --- |
| L-M01（Main/ACK） | 真 Electron Main + preload + renderer 创建**新**合成案卷，点击开始审核，回收真实 `onRunOwned` ACK，离开页面等待继续 | accepted 前 run ownership 真实存在；ACK 不含 sessionId、assignmentId、内部路径；V2 与 Main 事件同一 runId；页面卸载不结束 Main run |
| L-T01（Pi 白名单） | 用户启动有可信 `review-case` binding 的真实 Pi turn；在最终 Pi SDK tool registration 和 Main `canUseTool` 两侧记录工具名（只存名字） | 仅 `review_read_documents`、`review_inspect_document_image`、`review_submit_result`、`review_inspect_original`、`CompactContext` 可见/可调用；`Read/Bash/Write/Edit/AskUser/MCP/inspect_preview` 不可调用。必须有真实 SDK/host 见证 |
| L-T02（撤权与降级） | 先让内部 owner 处于**无有效绑定**、旧轮已撤销、预设意外切换、跨案或非用户触发；分别尝试工具发现与执行 | 真实 `runAgent` 不进入普通 Pi 工具集合；非法请求 fail closed，不发生工具调用/模型额外写入；新 guard 的错误与权限回执可见 |
| L-T03（普通正例） | 同版本普通非 review owner 会话，用户主动执行其允许的只读 Read/合法普通预览/MCP（仅测试本地安全 mock server） | 合法动作保持可用，不把 U1 审核白名单错误加到普通会话；真实禁止网络副作用，不访问生产 MCP |
| L-S01（SourceRef） | 导入两份同名不同字节及一份退役版本的合成材料，调用真实审核文件读/提交工具 | 有效本案当前 version+block+quote/parseRevision 可提交；`fileId=f1`、`f1:p1-b0`、跨案、错引用、停用旧版、伪造路径一律拒绝，V2 无伪造引用或覆盖 |
| L-S02（async / path） | 用真实授权 `review_inspect_original` 读取当前原件，并在 await 渲染中撤销指派/变更版本；测试案外 symlink、父目录、跨案 | 读取仅在 active documentVersionId+本案 realpath 下；撤销后**不写回**预览 receipt、V2 引用/新的成功终态；业务预览不能转换成审核文字出处 |
| L-P01（Owner/Renderer） | 真窗口离开/重入、页面卸载时继续 Main、保留旧 IPC 响应再启动新 run、延迟交付旧回执 | 旧回执不能覆盖新 runId/状态；review owner 不投影到普通 sidebar/search/archive/events/remote；普通 owner 正例仍存在 |
| L-P02（stop/restart） | 在 stop pending 下尝试 restart，成功停止后以新 runId 重试，注入旧终态回调 | pending 时不能启动第二 run；旧 stop/旧 outcome 不能结束新 run、复活授权或伪造 ACK；真实 V2 终态和 UI 一致 |

**S0 签收规则**：L-M01/T01/T02/T03/S01/S02/P01/P02 全部实测且有逐条原始安全见证，才可标 `S0_REAL_MAIN_PI_SECURITY_PASS`。任一缺授权 provider/GUI/有效 binding 即 `BLOCKED_ENV`，任一越权或迟到写入 `FAIL_SECURITY` 并保存首败。运行到此也**不能标整个 U1 PASS**。

## 三、Office/Preview/IO 全量 U1 本机部分 S1

严格映射 55 号 O01–O06、S01–S05、T01–T05、P01–P07，**凡未在 S0 中覆盖的测试仍须逐项独立输出 NOT-RUN / FAIL / PASS**。重点：

- **O01–O03 真解析**：创建有效 DOCX（至少两段与表格）、XLSX（至少两 Sheet、多个 Cell）、PPTX（至少两页），要求两个不同绝对路径、相同 basename `proof.ext` 分别存内容 A/B；再做同字节、不同字节、反向导入、改版、重启及跨格式同 stem。通过实际解析工具和 `materializeToWorkspace` 核对每次 `fileId/sourcePath/revision/anchor` 能唯一指向本源，索引和缓存不可错绑。**已知 #71 允许复现，但复现即 `BLOCKED_UPSTREAM`，绝不能写 O01–O03 PASS，不在此 PR 修共享 Office。**
- **O04–O06 真材料证据**：可读 PDF 要有可回溯文字来源；扫描 PDF、空白/损坏 PDF 必须明确标人工视觉/不可自动证明，不可凭 OCR 假造文字证据。普通 Office index 与审核 DocumentVersion 属不同权限空间；不得跨域转用。
- **P01–P04 Preview UI**：真实普通只读侧栏、新 Tab 禁止恢复、旧 owner / revoked / 伪造 session lookup 及目录 symlink 拒止；真实 PDF canvas、Office 页面可见内容和恢复后效果；原脚本 `review-live-preview-restore.mjs` 已含旧版专用硬编码和被测 API，先做差分适配再运行，保留首败。
- **P05–P07 Main & IO**：E03/E04/E05 真实 stop/pending/race/restart、RunStore 和 Renderer 迟到事件；真实受限磁盘 ENOSPC/原子写失败/重启后的 tombstone/journal/assignment fail-closed。参考 `review-live-io.mjs`，**仅在支持非 root 有界 8MiB tmpfs 且确认 `statfs` 与挂载点归属后运行**；不具备安全条件则标 `NOT-RUN_ENV`，不可把 mock 说成真实 I/O。
- **T04 压缩、T05 普通 Agent**：压缩前后旧 binding/工具权限不得复活；普通合法 Agent 工具不回归。已存在的受控单测不能顶替真实 Pi session/工具注册。

## 四、L02-00 单独 NEW_SYNTHETIC C 诊断 S2

- 只有 S0 安全准入后才允许。用本机获授权 provider、全新三案 A=`读书交流活动，总预算100元`、B=`总预算120元`、C=`未提供预算金额`，真实 Main/IPC/Pi 复演；保存**本轮新** `caseId/runId/assignmentId/turnId/inputManifest.sha256/templateVersion/policyVersion/documentVersionId/parseRevision`。
- 确保每案都产生真实 `review_read_documents` / 严格提交的 tool input/output、SourceRef `quote/location`、provider 请求/回执摘要（用量不可对流式事件重复求和）、V2 checks、batch queue、人工决定数量；含撤权 timeline。任何字段取不到写 `MISSING` 和来源，不自行补 UUID。
- 预期 A `compliant`、B `non-compliant`、C `awaiting-supplement`；若出现重复 `execution-failed`、工具异常、夸大引用，独立保留失败并归为执行器/夹具/正确拒止/材料不足/未定。C **不自动批准**；三案 queue done 不代表行政审批成功。旧九案仍是 `ARCHIVED`，本轮属于 `NEW_SYNTHETIC`。
- L02-01 的真实补件回流、人工审批及幂等闭环**不在本轮代签**；只有用户审阅 S0/S1/S2 证据且所需门禁满足后才评估正式准入。

## 五、必须交付的机器证据与验收报告

本地新分支提交文件建议：

```text
docs/design/review-agent/acceptance/p06-u1-local-r01/
  README.md
  environment-redacted.json
  candidate-lock.json
  command-ledger.json
  case-provenance-redacted.json
  u1-matrix.json
  known-failures.json
  SHA256SUMS
docs/design/review-agent/64-p06-l02-u1-local-result-20261018.md
```

`u1-matrix.json` 每个 55 项测试具备 `id,sourceSha,level,inputHash,command,exit,expected,actual,status,evidencePublicPaths,evidenceSha256,rawPrivateReference,firstFailure,classification`，状态仅 `PASS / FAIL / NOT-RUN / BLOCKED_ENV / BLOCKED_UPSTREAM`。完整原始 log、含密钥的 provider transcript、授权 profile、用户数据留在本机；只推脱敏数据和其安全的 hash。日志不存在就不能给该项 PASS。所有失败保留最早 raw/time/SHA，不能将失败用例改成期望成功或删除。

完成时单独输出：`REMOTE_CONTROLLED`、`S0_MAIN_IPC_PI`、`S1_OFFICE_PREVIEW_IO`、`S2_NEW_SYNTHETIC_C`、`L02-00 EXIT`、`L02-01 ENTRY`，每个各自 PASS/FAIL/NOT-RUN，不得拿另一栏证明本栏。附环境限制、SHA、复现命令、PR 地址、真正待解问题与责任分支。

## 六、绝对禁止

不更改 29 历史 LIVE-01～08 原记录、37/38/44/46/57/58/61 原始证据、隐藏 Gold、真实校方业务数据、旧 A/B/C identity。未经用户明确授权不改上游 Office #71 共享实现，不合并 #21/#72/#98/#99/#101/#103，不删除 tombstone / UUID journal，不放宽五工具白名单、SourceRef、owner / assignment 授权。不得自动运行 P07/P08，不开启真实行政审批。

任何必须访问真实用户 profile、校内业务后台、公开密钥、越权工具的测试，立即停下来用合成环境替代；替代不了就如实记 `BLOCKED_ENV`。
