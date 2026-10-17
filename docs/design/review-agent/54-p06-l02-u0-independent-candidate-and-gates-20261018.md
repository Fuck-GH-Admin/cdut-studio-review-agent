# 54｜P06 L02-U0 独立接手、CLI 安装模式修复与候选验证（2026-10-18）

> **当前判定：U0 = PARTIAL / CI EVIDENCE PENDING；U1 = NOT ADMITTED / NOT-RUN；P06 = PARTIAL，P06-S02 = NOT ACCEPTED。** 本文为本次独立 Draft PR #98 的候选与验证入口，不是完整验收签署。所有历史失败继续有效；29 是 LIVE-01～08 唯一正式台账。

## 1. 当前远端实查与输入冻结

| 对象 | 精确 SHA/状态 | 用途 |
| --- | --- | --- |
| 我方 `main` | `8989941b6fb5651564e32d11c4215b6a6d5a5209`，tree `b3df4773afc20ee46facd2366f35c5a78ee99e98` | 本轮已获用户确认的集成源基线 |
| 我方 PR #21 | `ecea6de83e2a384caad03805a6b2e7b12fb05dea`，Draft/Open | 旧研发与 46/49/50/52 历史证据；不得盲 rebase |
| 我方 PR #72 | `b1bcaffe5b9aa9ac7e02f71c95e651f24a17297f`，Draft/Open | 严格 SourceRef 的局部正负例，仅以后精确差异复用 |
| 上游当年比对 | `c179f2575d5bb5abdc883268fb885d1a6449325e` | 48/49 的冻结上游 |
| 上游 2026-10-18 实查 main | `8228d27ec27da21c8b71889d9addfa7f2e2e5658` | 比冻结上游前进 **15 commits**，含 IPC/Pi/SessionManager；**不纳入本候选，不代表最新版上游兼容已验** |
| 旧 46 实机 | `b95b44f7a06bb1e1ae21a985b5bb4cd9f5581027` | 16/16 场景、77/77 断言属旧 SHA |
| 本 PR #98 | `audit/p06-l02-u0-u1-r01`，自冻结 main 的独立新分支 | U0 完成前不执行 U1，不替代 PR #21 或 #72 |

阅读依据：27 架构、29 唯一 LIVE、32 P05 外部、46 历史实机、47 L02-00～04、48 main 整合、49 U0→U1 新顺序、50/51 接手、52 初审、53 SourceRef 边界和 #71/#79。

## 2. 首次失败：不可消除历史事实

- 原第三轮真实 Actions：[38867959248](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38867959248)，[原始 artifact 12032580281](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38867959248/artifacts/12032580281)。
- 同一**原 main SHA**、Bun 1.4.0 / Node 22，自托管 Runner：安装、typecheck、boundaries、skin、Main/Preload/Renderer build、focused、全仓测试退出码均 0，全仓 **3983 PASS / 5 SKIP / 0 FAIL**。
- 紧接 `bun install --frozen-lockfile` 的快照首次出现 ` M apps/cli/src/index.ts`；最终 `git diff` 为**仅 mode：100644→100755，无内容差异**，`14-clean-gate exit 1`。#79 仍 Open。
- 源码 `apps/cli/package.json` 声明 `bin.profer=./src/index.ts`，入口存在 `#!/usr/bin/env bun`；安装对可执行入口调整模式与现象吻合。**这是源头阶段和可执行包元数据的因果推断，尚未独立审计 Bun 安装源码，因此不声称某个 Bun 内部函数已被证明。**

## 3. 最小修复与候选

第一笔提交：[faa06777](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/commit/faa06777d8bfa1f8064e0c0497386936471f7c19)；该 commit 以原 main 为唯一 parent，其 tree `eb88a79bf063ba41a98409fa7a7f3d39a1045ec8`。

仅 `apps/cli/src/index.ts` **Git tree mode 100644→100755**，blob 保持 `8c0e1e3ce51c62fee413e643b0bdeca738631133`；未改 CLI 的任何源代码正文，未改审核生产代码、Office、Pi、owner/RunStore 或测试预期。与声明为 CLI 可执行文件的打包语义一致。此模式修复属于**新 candidate**，不得称原 `main@8989941b` clean-gate PASS。

U0 gate 实现：
- `scripts/qa/p06-l02-u0-candidate-gate.sh`：强制原 main 是候选祖先、验证原 main tree/当前候选 tree、CLI blob 与 executable mode；不设置 `core.filemode=false`、不删除 clean gate、不中途 reset。
- `.github/workflows/p06-l02-u0-candidate.yml`：在 PR Head 固定 checkout 后建立独立 detached worktree，自托管 Linux x64、Bun 1.4.0、Node 22；真实冻结安装、阶段快照、typecheck、boundaries、skin、三端构建、8 组聚焦测试与全仓测试，严格 `git status`/diff 清洁检查；失败仍归档日志、首次失败、命令退出码、candidate commit/tree、文件 SHA256 清单。工作树临时目录由 runner 清理。
- 不把 CI 的通过自动升级为真实 Electron / Provider / 案卷业务正确性通过。

## 4. U0 独立退出表

| 门禁 | 对原 main 实测 | 对 PR #98 新候选 |
| --- | --- | --- |
| commit/tree、CLI blob/mode、一开始工作树清洁 | 原 SHA/tree 可核验，mode 100644 | **NOT-RUN**，必须严格得到 100755 |
| `bun install --frozen-lockfile` + 安装后差异 | exit0；首次 mode 脏变更 | **NOT-RUN** |
| Typecheck、boundaries、skin | exit0 | **NOT-RUN** |
| Electron Main / Preload / Renderer builds | exit0 | **NOT-RUN** |
| Office/Review/Owner 聚焦测试 | exit0 | **NOT-RUN** |
| 全仓回归 | 3983 PASS / 5 SKIP / 0 FAIL | **NOT-RUN** |
| Git clean 最终门禁 | **FAIL exit1** | **NOT-RUN** |
| 证据清单 / 首败 / SHA256 | 历史 artifact 可复查 | 新版须取 Actions artifact 后锁定 |

**只有当前候选对应的新完整 Actions 门禁（相同 commit + tree）真实退出 0、模式不再脏、全仓无新失败，才能由验收人员将 U0 改为 PASS。** 如 Actions 缺 Runner/被阻断，则标 `BLOCKED_ENV`，不替换成旧 main 的绿灯。

## 5. U1 的串行准入与边界

**U1 当前不启动。** U0 达标后先将 #72 的 `review-office-v2-sourceref-boundary.l02.test.ts` 与本候选当前代码逐行比较，必要时单独提交测试。重点对照：
1. Office DOCX/XLSX/PPTX/PDF 的 `fileId/revision/anchor` 与审核材料 `documentVersionId/parseRevision/location/quote`。#71 同名 stem 缓存风险，集中验收前不改公共 Office 源码。
2. 真实 Main `runAgent` + Pi `review` 工具白名单，普通 `Read/Bash/Write/MCP/AskUser` 不得注入。已知 adapter 单独不负责过滤外部 custom tools，Host 须 fail closed。
3. 严格 `review_inspect_original` 与普通 sidebar preview 分离，案卷/指派/版本失效、symlink / cross-case、旧响应/迟到事件、owner 删除/恢复及普通 Agent 正例。
4. 影响 Main/Owner/RunStore/Renderer 写权限时补 E03/E04/E05、ENOSPC 和持久化/重启定向回归；需要真正 Electron/IPC/Provider 的项目必须提供真实证据，否则 `NOT-RUN`。

## 6. 阻断、责任及下一会话

- **HARNESS/ENV**：当前 ChatGPT 执行容器无 Bun，并且容器 Git 无法解析 github.com；无法在该容器执行 Bun/Electron。已通过 GitHub 连接提交 Runner gate；等待的是客观 CI 执行证明，而非“已在本地测过”。
- **UPSTREAM**：#71 同名 Office stem 索引问题在真实跨模块证明前 `DEFERRED_FIX / E2E NOT-RUN`；任何影响多文档证据正确性的明确复现将阻止 U1 安全发布；修复在集中验收后的**下一轮**拆为原项目 Office PR 与我方审核侧 PR。
- **EXTERNAL**：P05 Relay `BLOCKED`，Pocket `PATCH READY / TARGET NOT-RUN`。
- **SECURITY**：P04 tombstone/UUID owner journal 不允许未经证明的 GC；审核五工具、SourceRef、owner≠authorization 等权限不放松。
- **ENGINE**：U1 真实 Main/IPC/Office/严格 Pi 与新 sidebar 尚无本候选证据；禁止用旧 46 的 PASS 填充。

交接顺序：先检查 #98 对应最新 **候选 SHA** 的 U0 workflow、下载原始 artifact 并逐项核对 `manifest.json` / `SHA256SUMS` / `commands.tsv` / `first-failure.txt`，必要时修脚本或安装问题并以新 candidate 重跑；仅在 U0 PASS 后执行 U1 matrix，然后 L02-00～04 逐阶段推进。继续保持 #21/#72 Draft，#79 未复核不关闭、#71 不先修、P06 PARTIAL、P06-S02 NOT ACCEPTED、MERGE NO-GO、P07/P08 NOT STARTED。
