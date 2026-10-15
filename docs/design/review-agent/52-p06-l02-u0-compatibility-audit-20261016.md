# CDUT Studio — P06-RECHECK-LIVE-02 / L02-U0 独立代码兼容性审计

**冻结日**：2026-10-16（GitHub 信息于 2026-10-15T16:xxZ 获取）  
**审计性质**：历史恢复 + 三源仓库只读代码交叉核验 + Git 静态候选基线 + 本地执行环境实测。未执行/未伪造完整本地构建或 Electron/Pi/provider 验收。  
**结论**：`U0 = PARTIAL / BLOCKED_ENV`，`CANDIDATE = REMOTE_STATIC_IDENTIFIED`；`U1 = NOT-RUN (NOT ADMITTED)`；`L02-00～04 = NOT-RUN`；`P06-S02 = NOT ACCEPTED`；`P06 = PARTIAL`；`PR #21 = Draft/Open, MERGE NO-GO`。

## 1. 权威历史与不可修改约束

按 50 → 49 → 48（main）→ 47 → 46 → 29 → 27 → 30 → 31 → 32 顺序读取；另补 51（新会话任务）。文档根路径 `docs/design/review-agent/`。50/49 在当前审核开发分支；48/47 在 main；46 与 27/29/30/31/32 在审核分支。

| 文件 | 作用 | 冻结 Git Blob SHA |
| --- | --- | --- |
| 50 | 跨会话上下文；不代表测试 PASS | `81862f7a6f564bd00dfc94e903f52f2dcf2964f0` |
| 49 | 修改顺序为 U0→U1→L02-00～04 | `96f5a34f142ef18db3b982335580992c1765f13a` |
| 48 (main) | 上游与审核文件树合成、8 处取舍、首败 | `26d8f796a3820292a96ef13c01e542aa17957bc0` |
| 47 (main) | E06 真实业务验收计划及证据等级 | `0aa55bcf4885d837a329c7e2287d8eb4b49ea02e` |
| 46 | 旧 Electron/Pi/IO 实机证据及历史失败 | `efeb2662e7009ec5be30466cf3ad5bb8cc61a080` |
| 29 | 唯一 LIVE-01～08 判词/发布门禁 | `d1b5e5b7c829ad658337ddd33aad1c330995779f` |
| 27 | 最小架构：Main-owned Pi, V2，owner≠授权 | `862072a955696d1c0f7275bf617cbce6361a2cdd` |
| 30 | 并发接手与历史工作交接 | `7dae660bc9805b3af5730f33ba754f5bdf8eadc1` |
| 31 | 历史执行提示，须以 49/50/51 修订为先 | `136cd2871f07359286bcfe95f28442d8e09641a3` |
| 32 | P05 Relay/Pocket 外部验收阻断 | `4384543462c42a08b7684196fc4a8fac66f74c34` |

**硬约束**：不更改独立 Gold/37/38/44 首败和 46 证据，不降审核五工具权限，不把 preview 当严格审核原件回执；P04 ID-only tombstone 与 UUID owner journal 无证明不得 TTL/GC；P05 Relay 生产中心 `BLOCKED`、Pocket 补丁 `PATCH READY/TARGET NOT-RUN`；不启动 P07/P08，不更改上游、main、PR HEAD、Draft 状态，不 merge/rebase/force push。

## 2. 三源 Git、CI 与候选

| 代码对象 | 远程提交 SHA | 经 Git commit API 查证的 tree | 角色 |
| --- | --- | --- | --- |
| 自有 main | `8989941b6fb5651564e32d11c4215b6a6d5a5209` | `b3df4773afc20ee46facd2366f35c5a78ee99e98` | **候选技术代码**（现成受控文件树整合） |
| 自有审核分支 | `ad92e3965d43f551849d5e490a4c8e5a134d1ad8` | `0c1b156209a6ed89efbf6b5d7eb4f8c17f05fa5b` | 审核历史与最新文档，不是新版可运行组合 |
| 原项目 main | `c179f2575d5bb5abdc883268fb885d1a6449325e` | 未单独请求 commit tree | 只读上游来源 |
| 46 的实测代码 | `b95b44f7a06bb1e1ae21a985b5bb4cd9f5581027` | `bfcb5863a4d20c2d2a5c95c0a94a25d94b38cf33`（46 号历史记录） | 历史 E2E，仅原代码有效 |

PR #21 **Draft/Open、merged=false、mergeable=false、mergeable_state=dirty**。`main...feat/review-owned-background-sessions` 比较为 `diverged`、merge-base `dd5a553c34a92b559559a7cb3c4e9c3f67fd9c8e`、审核分支 ahead 196 / behind 2。Git 比较的大批历史差异不等同当前代码内容没有被整合。审计从 `60e805cfa5b55865add80856f2e9a27f6271de08` 到审核 HEAD 的新增 3 提交只改文档（27/28/29/30/31/47/49/50/51），**无生产代码变更**；`main` 仍缺这些最新交接文档，不能拿它们作为已运行 main 自带的文档事实。

- 我方 main 当前 PR CI：[Actions #38749615086](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38749615086)，`success`，48/49 记录 **3983 pass / 5 skip / 0 fail**；这是 GitHub 已运行的静态/CI，不是当前工作环境的本地实机。
- main 首轮整合：[Actions #38748810136](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38748810136)，`failure`，旧中文身份断言与上游英文提示冲突；主分支后续仅调整测试预期，保留首败。
- 当前审核开发 HEAD `ad92...` 仅看到 [current gate + legacy risk archive #38764024870](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38764024870) `success`；完整标准 CI 最近对应 `60e805cf...` 的 [#38739858192](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38739858192) 等，不得借给 ad92 或 main。旧 38 原探针仍 **3 PASS / 1 FAIL、exit 1**，新版 workflow SUCCESS 不等于旧失败变 PASS。

### U0 集成候选路线

**最小候选**：保留已经整合的 `main@8989941b...` 完整代码与依赖锁定，固定 Git tree `b3df4773...`，不向它额外合并整个审核 PR；仅从 PR 分支读取 49/50/51 为本阶段合同。这样不会倒退新 Office、只读侧栏与身份提示，也不会重复引入之前的审核老版本。**已从 GitHub commit API 确认候选 commit/tree，但当前无法把它检出为隔离可运行 worktree；所以候选还没有达到 U0 签署要求。**

隔离检出的精确可复验脚本为 `u0-run-isolated.sh`：只创建独立 clone，detached checkout 指定 SHA，强制比对 tree，运行冻结安装、typecheck、boundaries、皮肤、Electron build、Office/严格审核/owner 相关专项与全仓测试；以日志和 SHA256 文件记录逐项真实退出码，首错停止。脚本绝不 push、修改 main/PR 或旧 Gold。

## 3. 生产代码/API/调用路径与旧证据矩阵

比较对象：老 `b95b44f7`、当前 main `8989941b`、原项目 `c179f257`。`旧/新相同` 指 Git Blob SHA 逐字节相等；`变更` 指实码而非仅文件名不同。下表提供明确验证入口；**其中提到的测试是已存在的测试文件/名称，不能冒充本轮在新候选运行了它们。**

| ID / 风险 | 新版主要文件、调用路径及接口 | 旧版差异 / 来源 | 测试覆盖与必须新增的反例 | 判词 |
| --- | --- | --- | --- | --- |
| O01 · 高 | `document-parse-tools.ts` → `executeParseDocumentTool` → `@profer/core/office-engine`；`OFFICE_INDEX_SCHEMA_VERSION='v2'`；按 `sha256:v2:<content-hash>` 记 revision | main 与原项目该文件 blob **完全相同** `092fdf2e...`，与 46 旧版 `24fa5f05...` 不同 | `office-engine.test.ts` 有 DOCX/XLSX/PPTX 三类引擎结构例；`document-parse-tools.test.ts` 有 PDF/Read/锚点例。新增真实 DOCX/XLSX/PPTX 多页、公式、批注/合并、修订/损坏、版本更替 | STATIC CHECKED；候选 E2E NOT-RUN |
| O02 · 高 | `materializeToWorkspace` → `<stem>.md` + `.context/artifacts/<stem>.anchored.md`/`.index.json` + `manifest.json` + `registry.json`；`fileId=fN` / `fN:pX-bY` | 新版普通 Agent 数据平面；旧审核 `documentVersionId/SourceRef` **不是**它的等价物 | 有不同文件名多文档定位测试；**没有同名不同路径/缓存旧 revision/跨会话迁移直接反例**。见候选 D-U0-01 | CODE-RISK CONFIRMED / REPRO NOT-RUN |
| O03 · 高 | `review/document-service.ts` → `extractDocxReviewContent` / `extractSpreadsheetReviewContent` / Office 双平面备选 → Review `DocumentVersion.blocks`；`review-tools.ts` `ref(documentVersionId, blockId, quote)` 核验 `SourceRef` 和原材料文本 | `document-service.ts` 已变；`review-tools.ts` 与旧 b95 **完全相同** `b6f95eb7...`；没有从普通 `fN` 锚点自动获得审核授权的可证映射 | `document-service.test.ts` 与严格 P02 probe 有独立材料块读/引文；缺同一物理文件 Office anchor ⇄ Review block 跨路径精确对应、同名、换版、OCR 空页负例 | UNMAPPED INTEGRATION; NOT-RUN |
| T01 · 最高 | `agent-orchestrator.ts` 可信 `activePiReviewBinding` → `selectDirectReviewStrictTools` → Adapter `toolProfile='review'` + `canUseTool`；`review-strict-pi-tools.ts` 精确三操作+ `review_inspect_original`，Adapter 添加 `CompactContext` | `agent-orchestrator` 与 `pi-agent-adapter` 新旧不同；`review-strict-pi-tools` blob **相同**；普通工具/MCP 的构建路径也已更新 | `review-strict-profile.p02.probe.test.ts` 明确测试 strict 删通用工具，**也明确其 known gap：adapter 不自行过滤外部 customTools，必须由 Host 筛选**；新版实际运行添加正常严格五工具和 Read/Bash/MCP 注入负例 | STATIC HOST PATH FOUND / TRUE-PI NOT-RUN |
| T02 · 高 | `pi-builtin-tools.ts` 新普通 Kernel Document Engine 提示、preview、Read 自动重定向；`pi-agent-adapter.ts` 普通 profile 注册 builtin/product/MCP，review profile 不注册 | main `pi-builtin-tools.ts` 与旧/上游不相同；普通工具功能变多 | 新普通 agent 文档 preview、Read、压缩后继续的正例与在审核 bind 时同工具不可见/不可调用的负例，真实 provider receipts | NOT-RUN |
| T03 · 高 | `review-strict-pi-tools.ts:66-137` `review_inspect_original(documentVersionId,scope,page)` → 当前案卷 active document → `realpath` 落在 caseRoot → visual → await 后重新核验 binding → V2 receipt | strict 文件字节同旧 b95，预览的底层渲染器可受新版影响；与普通 canvas 预览不同 | 既有 P02 probe 包括跨案、失效 assignment、调用中变更、路径拒止。新增新版扫描 PDF/PNG 真实 Main/视觉回执/换版后撤销，**不可拿普通 PDF iframe 代替** | SECURITY DESIGN RETAINED / E2E NOT-RUN |
| M01 · 最高 | `review-pi-run-bridge.ts` start/stop → `admitPreparedPiReviewTurn` → Main `runAgent/onRunOwned`；`review-agent-assignment.ts` `caseId/sessionId/turnId/runId/assignmentId` + revokedAt | Bridge、admission、assignment Blob 与 b95 完全相同；`agent-orchestrator.ts` 新版不同 | 既有 `review-pi-run-bridge.main.test.ts` 覆盖 ACK、重复拒止、旧指派/stop；新版跨调用 Main ACK、stop_pending、E03/E04 差分需复测 | LOGIC INHERITED / INTEGRATION NOT-RUN |
| M02 · 最高 | `run-store-v2.ts` 原子 tmp/rename、启动 `interruptedRunIds` 进程拒止；assignment `pendingRevocations` 写盘失败仍内存否决 | RunStore / Assignment 文件与 b95 完全同 SHA；preload、ipc、orchestrator 更新 | 46 历史 8MiB ENOSPC、双失写、二次重启仍只属 b95；U1 Main/IPC 受影响时应真实复测拒止和恢复 | COMPONENT INHERITED / E2E NOT-RUN |
| P01 · 高 | `preview-opener.ts` → `openSidebarFilePreview`，`readOnly:true`，`previewFileMapAtom`，展开 right panel；`openFilePreviewTab` **保留名称作为 sidebar alias**；不新建顶栏 Tab | 旧功能是真 preview Tab；最新文件与 old/upstream 均有差异 | `agent-tab-access.test.ts` 有 owner 事件/恢复/迟到测试；缺新版 Electron 真侧栏打开、关页重入、版本/路径刷新与 PDF 可见性 | STATIC VERIFIED / TRUE-UI NOT-RUN |
| P02 · 高 | `openFilePreviewTabAuthorized` → `ensureOrdinaryWorkTabOwner` → Main `getAgentSessionMeta` + `isCurrent()` → side panel；`useGlobalAgentListeners.ts` 使用该路径 | 旧 Event/Tab 处理已退役，Main permission 仍应最终把关 | 既有 early owner/deleted/forged lookup 受控单测；新增真实异步请求乱序、owner 切换/删除/事件迟到、普通已归档会话正例 | STATIC PATH FOUND / E05 NEW NOT-RUN |
| P03 · 中高 | `FilePreviewDialog.tsx` → `OfficePreview` / `preparePdfPreview`；`useOpenSession` 普通 Agent/Browser tab 保留，preview Tab 类型退出 | 不要恢复旧 `docxToHtml/officeToHtml` IPC 或旧 Preview Tab。主仓为审核引用保留 `FilePreviewDialog`，原项目不存在同路径文件 | 新 Office render/扫描 PDF/不支持变体（ODT/ODS/ODP）fallback + 系统应用打开，普通会话不误伤 | NOT-RUN |
| M03 · 高 | Main `ipc.ts` → `review-ipc.ts` + `review-private-file-access.ts` / `preview-path-policy.ts`；preload → Renderer SidePanel/普通 agent workspace | `ipc.ts`、preload、session-manager 实体均变更；P04 原旧路径和 owner 隔离仍须负例 | `preview-path-policy.test.ts`、`agent-tab-access.test.ts`、`review-owner-index-recovery.p06-fix01.test.ts`；新 Main IPC 真实 owner 与路径拒止、符号链接/rename TOCTOU | BOUNDARY NEEDS LIVE CHECK |
| C01 · 中高 | `useOpenSession.ts` → `resolveOrdinaryTabSession`, `getAgentSessionMeta` 与 session MRU；Pi 普通会话 create/list/send/Read/stop 与 fork | 普通恢复语义和侧栏迁移；不能延用 46 的旧 Tab PASS | 新 normal Pi + Claude（有许可时）、双窗、fork、关闭/恢复；无授权/设备 NOT-RUN | NOT-RUN |
| C02 · 高 | 各包 `package.json` + `bun.lock`、`@profer/core/office-engine`（锁定） | 与 b95 依赖多处差异；48 记录 Electron `0.15.162`、shared `0.1.68`、core `0.2.15`、ui `0.2.1` | `bun install --frozen-lockfile` / `typecheck` / boundaries / skin / main-preload-renderer build / 专项 / full tests，同一 tree 真实 exit 哈希；main 已有远端 CI，但本地未重跑 | REMOTE CI SUCCESS / LOCAL NOT-RUN |

**关键 Git Blob 核验**：如下文件 `main` 与 46 旧 b95 逐字节相同：`review-agent-assignment.ts` (`959eaf18...`)、`review-pi-admission.ts` (`f4a63691...`)、`review-pi-run-bridge.ts` (`a4746a24...`)、`run-store-v2.ts` (`479be69f...`)、`review-strict-pi-tools.ts` (`83d6ddf1...`)、`review-tools.ts` (`b6f95eb7...`)、`review/v2-executor-factory.ts` (`0c0b34f5...`)、Renderer `review-actions-controller.ts` (`7588c490...`) 与 `review-workspace-write-fence.ts` (`b64ab9c3...`)；但是与它们相连接的 Adapter/Orchestrator/Main IPC/Renderer 入口已改变，**旧接口局部证据仍是历史真实证据，不构成新版运行复验**。

### D-U0-01：同名不同源文档的普通索引身份冲突（最高优先级差分反例）

`document-parse-tools.ts:309-342` 中 `allocateSessionFileId` 首先按 `manifest[stem]` 返回旧 fileId，**这里未要求 `existing.sourcePath === resolvedSourcePath`**。同一文件的 `.anchored.md`、`.index.json` 和 `manifest[stem]` 以文件名 stem 作为键（同文件 `:353-490`）。当同一普通 Agent 工作区分别索引路径 A 的 `proof.docx` 与路径 B 的 `proof.docx`，在代码静态推演上可能发生复用 `fileId=f1`、覆盖同名索引与交叉引用定位。`resolveMaterializedIndex(:885-970)` 优先从已有 index 读取，也没有每次独立核验当前文件 revision。**这是有代码依据的候选真实缺陷，并非已经运行触发/量化过的生产事故**。`document-parse-tools.test.ts` 当前的多文件例使用不同文件名 `sample.pdf` 与 `attached.pdf`，未证明同名不同路径安全。

正式复现应在新隔离树中准备 A/B 两个同名但不同内文的 DOCX 与 PDF；导入同一普通 Agent workspace，检查 `manifest.json/registry.json/index.json` 的 `fileId`、两份锚点各自指向、顺序无关、先读取再修改文件并再次按 `fileId`/路径读取；正负例都记录原始输入 SHA。此缺陷来自**与上游完全相同的普通索引文件**，不应为了修它而降审核 SourceRef 校验或将普通索引直接转成审核业务依据。

### D-U0-02：Office v2 对审核 SourceRef 的跨索引等价关系尚无证明

新版普通索引使用 `fileId + revision + fN:pX-bY`，审核 `review-tools.ts:94-110,363-391` 使用 active `documentVersionId` / 审核专用材料 blocks / quote / location 校验；`review/document-service.ts` DOCX 和 XLSX 还有独立专用结构抽取和不等价 block ID。不能从两者都能显示某段文字推断审核已取得授权引用或全覆盖。**这更准确地属于未证明的兼容性合同，不是已确认代码缺陷。** U1 要从同一字节输入做两侧坐标和版本映射，确认若无显式映射则严格审核直接使用它自己的 SourceRef 并拒绝普通锚点混入，覆盖换版/跨案/部分扫描页。

### D-U0-03：外部 customTools 的 Host 白名单是必须保留的约束

`review-strict-profile.p02.probe.test.ts` 直接写有 known gap：`pi-agent-adapter` 的 review 档案本身不自动过滤外部 customTools。现行真实路径 `agent-orchestrator.ts` 已先用 `selectDirectReviewStrictTools` 精确过滤，再交给 Adapter。**这是依赖 Host 的明确安全合同，不代表当前 Host 已被攻破。** U1 必须在真实 runtime 断言普通 RAG/Read/Bash/MCP 不能出现在严格五工具、不能调用，不得“修”成放宽审查权限。

## 4. 46 号历史证据可继承边界

| 历史证据 | 46 原版结论 | 当前候选应如何使用 |
| --- | --- | --- |
| E05 真旧 IPC 回执迟到，9/9 | 旧 b95 真 Electron PASS | Renderer Controller/栅栏 blob 相同，可保留**组件实现证据**；上游只读侧栏、Main/IPC/事件改变，**新 E05 回归 NOT-RUN** |
| E03 stop pending/busy/restart 8/8、E04 迟到回调 7/7 | 真实生产回调受控复演 PASS，不是自然网络延迟穷尽 | Admission/Bridge/RunStore 主体同 SHA；Orchestrator/Adapter/Main IPC 变化，需差分复跑，不直接继承实时行为 |
| ENOSPC 8/8、双落盘 5/5、故障重启 2/2+3/3 | 旧 b95 真实内核 I/O PASS | 同一 RunStore/assignment 逻辑可继承代码级证据；新版进程入口权限与恢复新组合仍 NOT-RUN |
| 旧普通 Pi Read/Write/stop、文本 Office PDF preview/跨进程恢复 | 46 在旧 preview Tab 通过子集 | 当前 Office v2+readonly sidebar+pi prompt 均变，原普通 agent 真机证据**只能作为历史对照** |
| 原 A/B/C 批量 | 合成子集 PASS；C `execution-failed` | 不能写业务成功；U1 之后才启动 L02-00 原因归类 |
| 旧 38 风险精确 probe | 3 PASS / 1 FAIL、退出 1 | 原始失败不改；新 current writer gate 的独立 SUCCESS 不是原 probe PASS |

## 5. 本次确实运行的命令、失败与环境

执行隔离环境 `container`：Git `2.47.3`、Node `v22.16.0`，**Bun 不存在**；`/mnt/data` 起始无 repo，未发现 `.git`。GitHub 连接器可只读拉取元数据与文件，但本地 shell 不能联网克隆。

| 实际执行项目 | 实际退出码 | 本地证据 |
| --- | ---: | --- |
| `git ls-remote https://github.com/Fuck-GH-Admin/cdut-studio-review-agent.git HEAD` | **128** | `git-lsremote.stderr`：`Could not resolve host: github.com`；stdout 空 |
| `bash -n u0-run-isolated.sh`（仅脚本语法） | **0** | 仅证明脚本可由 bash 解析，绝不是业务通过 |
| `u0-run-isolated.sh /mnt/data/cdut_l02_u0_evidence/local-probe` | **128** | **首次失败** `00-clone`；`local-probe/command-index.txt` 记录实际时间/exit；stderr 同为 DNS 失败 |
| 冻结安装、typecheck、boundaries、skin、build、focused test、full test、U1 实机 | **NOT-RUN** | 克隆失败后未执行；不能引用 main 的 CI 冒充本地运行 |

上述克隆失败 stderr 原始 SHA256：`6c6f96c3bc6d34f5acaab99d74595a196f830d8563beae90060397b80f75519d`；空 stdout SHA256：`e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`。仅以本环境实际日志计算。用户原项目、PR、main 与 Gold 均未修改。运行根因是此会话的本地网络/DNS 和 Bun 缺失，**不是源码 `build FAIL`**。

## 6. 下一个可执行批次（严格门禁）

1. **继续 U0（先补执行证据）**：获可克隆仓库且已装 Bun 的隔离机器，从 `main@8989941b` detached checkout 验证 tree `b3df4773...`；执行附带 `u0-run-isolated.sh` 并归档每条原始 stdout/stderr、退出码、first fail 和 SHA。将 GitHub main CI 已通过与本地安装/构建/聚焦/全仓结果分开记录。失败先归因，不立即改 Gold/权限/旧接口。
2. **U0 差分反例**：在新版候选里新增独立回归试验覆盖同名不同路径文档索引、旧缓存 revision 与 Office ⇄ Review 版本索引及 owner 授权。若 D-U0-01 真能复现，用最小局部补丁、首次失败与修后完整证据记录；严格审核 `SourceRef` 不可降级。
3. **U0 签收后才准入 U1**：按 Office v2 DOCX/XLSX/PPTX/扫描 PDF、5 严格工具 vs 普通 Pi 文档工具、Main/IPC 实际 owner + assignment/RunStore、侧栏只读/过期回调/ordinary session 正例建正负例；如核心链路变化，定向重跑 E05/E03/E04/ENOSPC/重启。真实 provider/设备未授权则 NOT-RUN。
4. **U1 完成后才回 47**：L02-00 C execution-failed 事实归因 → L02-01 A/B/C 完整人工/补件/代批与幂等 → L02-02 原件/长上下文 → L02-03 Claude/多窗/OS → L02-04 外部 P05 与 29 LIVE 逐项签收。未取得生产中心 Relay、Pocket、跨端证明前 MERGE NO-GO。

**需要用户批准的 Git 方向**：推荐在**完成 U0 复现和确认修复需求之后**，从当前 main 冻结点切出独立 `feat/p06-l02-current-compat` 做最小差分测试/补丁，单独 PR；将 PR #21 留作 Draft 审核历史与验收证据，避免它的 196 个祖先差异再覆盖最新 Office/侧栏。不执行该分支创建或 push，直到明确批准；另一方案是之后重定现有 PR，但必须先单独设计 ancestry/patch 等价方案，严禁盲目 rebase/force push。

## 7. 查证入口

- [我方 main 固定源码](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/tree/8989941b6fb5651564e32d11c4215b6a6d5a5209)
- [审核分支固定源码与 docs 50/49](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/tree/ad92e3965d43f551849d5e490a4c8e5a134d1ad8)
- [上游 main 固定源码](https://github.com/Nya-Angle/CDUT-Studio/tree/c179f2575d5bb5abdc883268fb885d1a6449325e)
- [原 PR #21](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/21)
- [Office fileId 分配与覆盖逻辑](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8989941b6fb5651564e32d11c4215b6a6d5a5209/apps/electron/src/main/lib/document-parse-tools.ts#L307-L490)
- [审核 SourceRef 校验逻辑](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8989941b6fb5651564e32d11c4215b6a6d5a5209/apps/electron/src/main/lib/review/review-tools.ts#L94-L108)
- [Strict host permission](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8989941b6fb5651564e32d11c4215b6a6d5a5209/apps/electron/src/main/lib/review/review-strict-pi-tools.ts#L20-L137)
- [普通/审核工具注册分流](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8989941b6fb5651564e32d11c4215b6a6d5a5209/apps/electron/src/main/lib/adapters/pi-agent-adapter.ts#L2528-L2554)
- [只读侧栏与 owner 保护](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8989941b6fb5651564e32d11c4215b6a6d5a5209/apps/electron/src/renderer/components/diff/preview-opener.ts#L76-L152)
- [29 唯一 LIVE 台账](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/ad92e3965d43f551849d5e490a4c8e5a134d1ad8/docs/design/review-agent/29-background-session-preflight-audit.md#L392-L409)
