# nb-130 独立复核报告（QA：docs-r07-qa-extra-01-20261024）

- 批次：nb-130（T8，p01-app-shell · p01.main-cross，18 文件 / 3392 行）
- 冻结：`05fb2565e20eb1760233696be1832f68196b37c2`（HEAD 核对、clean）
- 作者：docs-r07-author-extra-01-20261024；封版 `seal-a7538012d1542f56`（sealedAt 2026-10-23T19:27:14Z）
- 复核时间：见 RESULT.json `reviewedAtUtc`
- **batchVerdict：accepted（18/18 文件 accepted，1 条 minor 非阻断）**

## G0 范围/基线/hash/ZIP/格式 — PASS

- 18/18 `blob`/`sha256`/`bytes`/`lines` 与 `manager/assignments/nb-130-SCOPE.json` 独立重算全等（QA 复用预读字节证据并当场复验）。
- 哈希链 MANIFEST→READY→DONE→ZIP 逐项复算全对；`sealId` 按 `sha256(batch|frozenSha|sorted manualHashes)[:16]` 复算一致。
- ZIP 21 条目 = 18 manual + `SOURCE-EVIDENCE.mechanical.tsv` + `COVERAGE.mechanical.tsv` + `MANIFEST.json`；**不含** READY/DONE/reviews；zip 条目 vs stage 字节 0 漂移。
- 18 篇手册 front matter（path/frozenSha/blob/sha256/lines/kind/package）逐字段 = scope；`status=authored`；`NOT_RUN` 齐全；章节 14×11（source）+ 4×6（test）全合规。

## G1 证据 — PASS

- `SOURCE-EVIDENCE.tsv`/`COVERAGE.tsv` 人工列逐文件亲笔（readSegments=全文逐行、humanEvidence/humanCoverageNotes 非空）。
- `UNVERIFIED.md` 六节显式：NOT_RUN 清单、静态不可定未知、域外边界（明示未深读文件）、否定检索范围、现存实现注意点 8 条、QA 预读计数偏差申报。
- `changes.diff`/`START.json`/`STATUS.json` 齐备；与 QA 独立预读（reviews/nb-130/SOURCE-CHECKLIST.md）同源一致。

## G2 逐文件事实 — PASS_WITH_MINOR（18/18 accepted）

- **导出计数**：1/2/6/1/4/11/4/2/2/4/2/4/2/9 与 QA 机械计数全等；**测试计数** 6/7/4/4=21 全等。
- **行为结论**：每文件 ≥5 条逐条回源（QA 逐行预读 3392/3392 行 + 封版后对照）——git-diff-service 的缓存失效/失败不缓存/超时 SIGTERM→SIGKILL、installer-downloader 的取消不降级/sha256 失败仍试下源、cert 无关、knowledge 的 allowlist/原子写、identity 的三级 deviceId 优先级、image-url-resolver 的魔数校验与 redirect 不复检、installer-manifest 的 fallback 不缓存等，全部与源码一致。
- **跨文件引证**：35+ 处 `file:line`（ipc handler 段、preload、DiffChangesList/DiffTabContent/WorktreeSelector/useGlobalAgentListeners、agent-workspace-manager:1763/1781、config-paths、windows-env、sleep-blocker 状态机、token-crypto、memory-search-router 回退、document-parser、agent-fork-workspace-copy、agent-session-manager:1580/2619、EnvironmentCheckCard、channel 表）抽样逐一实测命中，**0 处失配**。
- **否定结论**（作者 8 条，全部独立复核为真）：`isUserPresent`/`clearReleaseCache`/`resolveKnowledgeReferences`/`updateDeviceName`/`cleanInstallerDir` 零消费者、`searchKnowledgeItemsForChat` 仅测试消费、`copyForkFile` 引而未用、`buildForkProjectKey` 仅测试消费。
- **测试手册**：断言逐条与源码一致（含 `mac-traffic-light` 批外被测源对照：默认 `{18,18}`、`1.1`、scale 规则均实测吻合）。
- **真实动态**：Windows 检测链/注册表 keychain/真实 API/并发饱和均按合同界定 unknown + NOT_RUN，未伪造保证。

## Findings

| id | severity | 摘要 | 处置 |
| --- | --- | --- | --- |
| NB130-N-01 | minor | READY/DONE 的 author/reviewer 记为旧波次角色（author-models/qa-models），实际会话为 extra-01（START.json 与 18 篇 front matter 正确） | lead 合入登记按团队 JSON 记真实归属；未来 rN 顺带更正；非阻断 |

## QA 自身勘误（已关闭）

| id | 摘要 | 处置 |
| --- | --- | --- |
| QA-PRE130-N-01 | QA 预读 source/test 行数拆分 3165/227 有误（作者 UNVERIFIED §6 发现） | 回源 wc 确认更正为 **3143/249**（总数 3392 正确）；PRE_READ_DONE.json 追加 errata 留痕 |

## NOT_RUN

产品测试 / typecheck / build / Electron-GUI / 真实网络（GitHub、api.proma.cool、远程图片、安装包）/ bun test（21 用例仅断言级阅读）/ Windows、macOS 实机。未改源码/测试/依赖/作者正文/candidate/全局总账/旧 seal；未 commit/push；未自审。
