# Dev-B B4-R02｜G01–G08 50 候选模板：3,875 Check 来源血缘与原文可得性专项核验

**性质**：工程资产/来源血缘验证 + 可执行冻结资产校验器；不是学校政策验收，也不是新一轮 A/B/C/D/E。
**历史冻结输入**：PR #97，`b68443b23293b4714e61a3b81383d3d3a56434fc`；D4 领域 G01–G08 历史 workspace/catal​og/manifest。
**工程线**：#142 `feat/v3-dev-b-template-intake-r01`，从 C0 `5682057c7232c914e72fdae525ce95fd33f32b53` 派生。
**权限**：本批只读历史源，提交 B-owned JSON/CSV 和独立检测代码，不更改历史源工作区、校规、Gold、Main IPC、Preload 或正式 CurrentCase/Run/Decision。

## A. 技术 workspace 逐义务覆盖（仅限历史技术原件）

| 领域 | 候选模板 | 逐 Check 记录 | 绑定结构缺失/孤立 | 缺少显式对象或全案 scope |
|---|---:|---:|---:|---:|
| G01 | 5 | 536 | 0 | **34** |
| G02 | 3 | 171 | 0 | 0 |
| G03 | 10 | 613 | 0 | 0 |
| G04 | 8 | 972 | 0 | 0 |
| G05 | 6 | 391 | 0 | 0 |
| G06 | 9 | 610 | 0 | 0 |
| G07 | 7 | 466 | 0 | 0 |
| G08 | 2 | 116 | 0 | 0 |
| **总计** | **50** | **3,875** | **0** | **34** |

每一条独立 Check 的归档数据包含 `checkId`、`taskId`、原任务标题、模块引用、workspace Git blob、源 ID 数组、逐源 `documentVersionId/locator`、客体 Scope 或 caseScope 理由、适用性备注、及待政策/Gold 状态。来源中的 `verification=content-checked` 仅证明固定历史母版内容的技术记录，不表示**校方签署/当前有效**。

新工件：
- `B4-OBLIGATION-SOURCE-G01.json` 至 `B4-OBLIGATION-SOURCE-G08.json`：8 域冻结 Check 血缘快照，50 套、3,875 条，不把虚拟 Scope、当前审批人或政策有效性补出来。G04 采用等价紧凑 JSON，以保证低于 GitHub Contents API 单文件读取上限。
- `B4-50-CHECK-SOURCE-COVERAGE-R02.csv`：每模板 Check 数、固定原始 workspace Git Blob、源 SHA256 声明、显式作用域缺口及未知适用来源数量。
- `B4-G01-34-SCOPE-GAPS-R02.csv`：全部 **34** 条需独立确认 Check ID、来源行定位、模块与责任。不能将缺失 object scope 静默合并为 `CASE` 或默认对每个 Subject 全部适用。
- `review-v3-b4-obligation-lineage.ts` + `review-v3-b4-obligation-lineage.test.ts`：可执行读入验证，拒绝错 SHA、重复/丢失 Check、缺 source locator、跨模板 Check、政策/Gold 假发布和 8 域重复。**注意 Gate O 仍须 CI 同 SHA 实际执行**。

逐源链接中共有 **4,163 个** `sourceApplicability='unknown'` 项（按来源链接计，而非独立 Check 数）。未知条件保留为 unknown，不转换为 false、不适用或正式 PASS。

## B. 与独立原始业务 Markdown 的可得性不等同

另从 50 份固定技术 manifest 检查 `source/businessOriginal/fullBusinessMd/original` 差异，区分“历史 SHA256 声明”与“真正取得不可变 Git 原件”。全部 50 份 manifest 的源 SHA256 **字段**与目录来源 SHA256 一致，但本批**没有对 50 份实际原文字节独立重新计算 SHA256**。

| 原文证据分级 | 数量 | 结论 |
|---|---:|---|
| **Git Blob 预期 SHA 与取得文件完全一致** | 9 | G01 2、G07 7；G07 从 manifest 锁定的历史 `original.branchCommit` 取回。文件 Git Blob 与原 manifest 完全一致，不代表现行校规 |
| 可取得原文字节的 Git Blob，但 manifest 未签出预期 Git Blob | 1 | G01 1；仅作为归档观察，不等价于独立 SHA256 校验 |
| Manifest 与目录 SHA256 元数据一致，未找到可重新读取的已提交 Markdown 原件 | 40 | 不能宣称原文字节已经被本批独立核验；需要用户提供历史 Library 完整原件或校内有效制度文本再校验 |

- `B4-ORIGINAL-MD-GIT-G01.json` 至 `G08.json`：每模板 manifest Git Blob、原文路径、历史 Git SHA、观测/预期 Git Blob、可得性及独立 SHA256 尚未重算标志。
- `B4-50-ORIGINAL-MD-GIT-AUDIT-R02.csv`：50 套最终原文证据分级。
- `review-v3-b4-original-evidence.test.ts`：检验 9/1/40 分级不被篡改，候选不会被描述成 Gold 或校方政策通过。

**原始来源的业务保全验收尚未通过**：未取得/无法重新核验的 40 份原文意味着不可据此签署“原始逐条规则无损保全”。上述 3,875 行是 **D4 冻结 workspace 任务+引用** 的客观数量，不应混写为独立 Gold 答案或 50 套现行正式审批规则。

## C. 不能忽略的历史产品缺口

G03 历史标签包含 `GENERATED_NOT_RUN`，G04、G07 存在以前已记录的业务/回归缺口；技术 Check 绑定完整不自动抹掉这些问题。历史资料未证明 50 套全体已通过 D3 roundtrip、真实 Pi、政策版本核对、独立 E 盲审或真实 2026 CDUT 业务正式发布。

**正式状态固定为**：

- `publication=candidate-held`、`publicationAllowed=false`；
- `policyApproval=NOT_VERIFIED`、`independentGold=NOT_AUTHORIZED_OR_NOT_RUN`；
- `historicalIntegrationStatus=NOT_RUN` 或各原领域保留历史文字，不改写为 PASS；
- Gate O: 冻结资产与验证器源码已提交，**等待当前完整 B HEAD 的真实 TypeScript/boundaries/Bun CI**；
- Gate E: `NOT_RUN`（真实 Office/Runner/Electron/目标机）；
- Gate L: `BLOCKED_NO_AUTH`（现行校规、身份、发布人 ACL、原文字节）；
- Gate P: `PARTIAL`（无法完成 50 原始母版独立逐义务签收或第 51 套真人 UAT）。

## D. 给 Integrator-I/Dev-C 的新切片

`B4-50-LINEAGE-R02`：B 独占来源 #142 新工程 SHA，8 JSON + 50 行 CSV + 34 缺口 + 原文 9/1/40 明细 + 2 个离线测试。**入口仅为候选资产浏览/比较/差分诊断**；I 可以在新的锁定 SHA Gate O 绿灯后移入技术资源侧，不能将 `WORKSPACE_BOUND` 解释为来源可认证、policy published 或真实 Subject 全覆盖。

由 C 主导的正式 `InstallPlan/UpgradePlan` 必须继续要求独立政策来源/权限/Gold、冻结 descriptor digest、Check×target×object/Subject 与删除责任 ACK。B 的技术血缘报告不是政策签名。

## E. 离线核验

```bash
bun run typecheck
bun run check:boundaries
bun test apps/electron/src/main/lib/review/review-v3-b4-obligation-lineage.test.ts apps/electron/src/main/lib/review/review-v3-b4-original-evidence.test.ts
```

本报告以原始 Git Blob、工程源码路径、各自动化结果为准；以文档文字自称“已完成”不等于独立测试完成。