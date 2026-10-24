# NB-47 独立复核报告（QA：docs-r07-qa-nb-47-20261023）

- 冻结 `05fb2565e20eb1760233696be1832f68196b37c2`（HEAD 核、clean）；scope 18 文件/2809 行（p02-agent-runtime · p02.agent-core）
- 交付：`deliveries/nb-47/`（seal_delivery.py/1 v2，sealId `seal-ab78d9648baba40c`，sealedAt 2026-10-23T15:59:21Z）；作者 `docs-r07-author-nb-47-20261023`
- 复核基线：QA 独立预读 `reviews/nb-47/SOURCE-CHECKLIST.md`（18 文件逐行全读+全树回源）；本轮 18 篇手册全文逐篇回源比对
- **批次判定：revision_required（17 accepted / 1 revision_required / 0 unknown）**——17 篇可按 exact hash 合入；`agent-end-reason.ts.md` 退回 nb-47-r1
- 测试断言≠运行：产品测试/typecheck/build/GUI/真实模型 **NOT_RUN**

## G0 完整性（PASS）

18/18 源绑定（blob=git ls-tree HEAD / sha256 / 行数）== MANIFEST == SCOPE 独立重算全等；18/18 `manualSha256` == stage 现字节 == COVERAGE/SOURCE-EVIDENCE 列值；DONE.manifest/ready/zip 三哈希链自洽；ZIP `R07-nb-47-05fb2565.zip` 21 条目（18 手册+MANIFEST+2 mechanical TSV，不含 READY/DONE 属 v2 设计）无穿越/符号链接/逐条目 0 mismatch；人工证据列 18/18 非空；交付 SCOPE 与 manager SCOPE 一致；changes.diff 与 stage 一致；元数据头 11 键 18/18。

## G1 结构（PASS）

18 篇章节齐全有内容；导出清单与源码逐条吻合（4/8/3/2/5/2/3/4/1/5 … 全数对源）；三分+NOT_RUN 18/18；8 个测试文件 **66 用例**（7+3+12+3+9+9+16+7）与源 `test(` 行号逐点一致；行号引用均可解析。

## G2 源码真实性（17 PASS / 1 返修）

重点回源（含 QA 预读硬约束与作者新增声明）：

1. **collaboration-tools（246 行手册）**：死代码三处（`jsonResult`:254/`getCurrentParentPermissionMode`:698/`buildCollaborationSchemas`:928，Zod schema 生产不可达）✓、`blockedEvents` 只增不删 ✓、权限恒 `bypassPermissions` ✓、嵌套委派双保险 ✓、自动续跑锁串行+run_idle 重查 ✓、10 工具/execute 行段 ✓。**作者新增 4 处矛盾照实记录全部为真**（我独立回源复核）：:797-798 注释「回退 Claude」vs 代码 `?? 'pi'`；`delegate_agents` TypeBox 无 maxItems（:1055）vs Zod `.max(50)`（:951）；:544/:742 跨父错误文案不一致；utils `fallbackPermissionMode` 形参未使用。
2. **协作 utils/preset/preset-schema**：恒 bypass、恢复收敛、候选优先级/三重越界校验、Zod trim vs TypeBox minLength 不对称、parity 测试弱点——全对。
3. **ask-user-service**：空题熔断、先登记再通知、toolInput 原始输入留 main/渲染层仅浅拷贝（与 QA 预读语义一致）、IPC/WS 守卫链（`assertSensitiveAgentIpcSender`+`assertOrdinaryPendingRequestId`）与协作代答旁路——全对。
4. **catalog-invalidation / event-bus / event-fanout / directory-utils**：生产仅 `invalidate('channels')`×3、三中间件语义、fanout 三条件判定、产物目录不含凭据、读依赖写副作用标未知（FACT-CHECKING 口径）——全对。
5. **end-reason**：10 出口行为描述与测试 16 用例正确，但两处「注释与代码一致」声明失实 → **F-01 返修**（见下）。

## 发现

| id | 级别 | 对象 | 摘要 | 处置 |
| --- | --- | --- | --- | --- |
| **F-01** | minor_factual | agent-end-reason.ts.md | §3/§10 两处称「注释 :40-53/:43-52 与代码一致」——注释 9 级清单实漏 `delegation_cancelled` 分支（代码 :76-78）；手册自身 10 步正确但与「注释一致」自相矛盾 | **nb-47-r1 修订**（改述两处，行为结论不变；保留父字节） |
| N-01 | non_blocking | agent-collaboration-tools.ts.md | §4 门禁行号偏 2（:2171→:2173、:2173→:2175） | r1 可选 |
| N-02 | non_blocking | agent-collaboration-tools.ts.md | §6「恢复出的 running 派生记录不入 Map」指向不可达分支（恢复恒收敛 interrupted） | r1 可选改述 |
| M-01 | info | 交付元数据 | STATUS.json status 陈旧（pre-seal），不在哈希链 | rN 同步 |
| M-02 | info | 手册 YAML | reviewer=包名惯例 | 无需动作 |
| M-03 | info | — | 预读硬约束落实+新增矛盾 4 处回源为真（正面确认） | 记录 |

## 合入绑定

- **acceptedHashes（17）**：除 `agent-end-reason.ts.md` 外全部手册的现字节 `manualSha256`，见 `RESULT.json`/`REVIEWED-HASHES.json`（rejectedHashes 含 end-reason 当前哈希，修订后按新 hash 复验，旧接受不套新字节）。
- 未写 deliveries/inventory/manager/candidate/全局 FILES/COVERAGE/MANIFEST/INDEX；未改作者正文/源码；旧 reviews（SOURCE-CHECKLIST/PRE_READ_DONE）原样保留。
