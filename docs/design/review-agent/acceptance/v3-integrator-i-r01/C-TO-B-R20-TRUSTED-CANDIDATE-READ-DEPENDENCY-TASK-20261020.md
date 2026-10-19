# CDUT Studio Review V3｜Dev-C → Dev-B：下一批必须补齐的候选来源只读组合合同

**任务号**：`B-PREREQ-R20-CMAIN-READ-SOURCE-CONTRACT-R01`  
**下达方**：Dev-C；**执行 Owner**：Dev-B；**生效授权依据**：同协调分支唯一 `ABCI-UNIFIED-COORDINATION-AND-STATUS.md` 的最新 `DECISIONS:C`，具体 `B-CR-003 / APPROVED_SCOPED_C_OWNED_OFFLINE_READ_CONTRACT_ONLY / B_FOLLOWUP_REQUIRED`。  
**性质**：真实 B-owned 服务开发及 Gate O，非新架构研究、非 C Main 代开发、非发布授权。此文档是定向 C→B 工程任务，不替代四线共同协议。

## 1. 不要重复已经完成的 B R18 / R19

已独立 Gate O 的 B R19 #142 **`77e6df0511098e084b045a711d16c48cad93c758`**：PR CI `39324901639` Bun 4200 PASS/5 SKIP/0 FAIL，Baseline `39324901534`、D2 `39324901546` 3/3 success；新增 13/13 真 ZIP→InputLedger receipt→physical parser→B1 immutable Check candidate provenance 正反例通过。必须保留旧 SHA、差异、测试及候选-only 拒发布语义。

已有 B-owned 关键源：
- `review-template-author-store-v3-b1.ts` blob `065251ca843c51e68e225dc688bb7a8caab2fea7`：完整 history-chain 的 `readB1AuthorRevision`、frozen candidate。
- `review-template-plan-adapter-v3-b1.ts` blob `974f0b0d127301ed71ad10df5ae64623ce378882`：`B1AuthorDocument`、Plan compiler/immutable descriptor 校验。
- `review-v3-b1-b2-candidate-source-bridge.ts` blob `e322df7ddc0910f5065d7a887507218cac7a7713`：`buildB19CandidateSourceBindings(ctx,author,frozen,selections,environment)`，只生成候选快照。
- B2 staging、archive vault、InputLedger、source-version parser/read-extent/current bytes 既有服务。

**缺口并非重新做算法**，而是可被 C Main 安全消费的*明确有界、可固定来源*的只读依赖组合合同，而不是让 C 去复制 B1 vault、维护 B2 另一份 ledger 或按 UI 文本拼装 source identity。

## 2. B 必须交付的工程接口

在 **B-owned** `apps/electron/src/main/lib/review/` 下补一个明确的 **read-only current author + candidate source bundle/facade**（可用 `review-v3-b1-b2-main-read-bundle-v3-b.ts` 及专项 `.test.ts`；命名前先检查仓库已有同等接口，避免重复）。此接口可接收**由 C 未来受信 Main 主动提供**的 Principal/Case/Owner scope 和必要的 B-owned 现有能力对象，但绝不能自己通过 Renderer 输入推断 Principal、Owner、native archive key 或创建学校 issuer。

所需合同：
1. B1 当前作者候选源：复用现有 `readB1AuthorRevision(templateId)` **完整历史链校验**、current revision/digest、`candidate-held` 约束；可独立获取与其 source exact revision 一致的 immutable frozen candidate 并复验 descriptor/digest/fingerprint；不存在、revision 改动、cross-template、损坏或不匹配明确 fail closed。作者临时未保存编辑不能被自动合并、回写或当成已发布 Plan。
2. B19 当前来源集合：将 B2 staging+physical original+ZIP archive **当前 native-picked physical key**（只从**受信 C Main 能力输入**）、accepted InputLedger /2 receipt、current Owner generation、parser registered source block、B1 frozen candidate 调用为已有 `buildB19CandidateSourceBindings`。禁止通过传入存储 key 文本或 synthetic `SourceIdentity` 伪造受信来源；候选选择器必须重新查原件与 ledger。
3. 版本可见性：输出 schemaVersion、current author revision/digest、frozen Plan fingerprint、candidate provenance snapshot、依赖 sourceVersion/parseRevision/raw SHA/receipt hash 的失效/UNKNOWN/needs-human-confirmation。禁止把当前同文件名或同 bytes 的**不同物理候选**合并；旧 audit snapshot 只能作保守 diff，不能当 authority/signature。
4. **单向安全**：完整 API 只读，无自建 Case/SourceLedger、Plan/Run/Decision/Outbox，不能写 Business Receipt，不能安装 C IPC/Preload channel、不能发 School publication 证明。结果保持 `candidateOnly=true`、`publicationAllowed=false`、`businessWriteAllowed=false`、`schoolPolicyVerified=false`，缺校方发行者也允许看合法候选，但决不把 candidate linked 解释为正式 Check PASS。
5. C Main 不存在的受信身份能力必须以明确 **dependency required / not installed** 表示。B **不得**提供 `canRead=true` 默认授权、`local-reviewer` 假教师身份、模拟 Main picker 或 mock publisher 作为生产默认。若缺 C-owned 当前 Principal/frame/Owner epoch，B 只能暴露严格接口和离线假能力测试，不要修改 C 文件。
6. 明确发布**精确接口依赖清单**（每个实际 B-owned 路径、来源 commit+blob SHA、import graph、对 C 只读入参/出参、失效模式、是否易受符号链接/跨 PID/stale byte 影响）。由 C/I 另行签 source import CR，**B R20 新 HEAD 绝不自动进入 C #144 或 I3/I4 已签 checkpoint**。

## 3. 必须覆盖的正反例回归

- 真正 B1 save revision→重新读取全链→一致 frozen candidate；current revision 改版、缺父修订、digest 错/恶意文件、跨 template 源、草稿未保存 vs frozen 均拒绝或显式 conflict。
- B2 ZIP 当前实字节+accepted /2 ledger + current Owner+registered parser block 成功形成 **candidate-only** Check×target/source；不同物理 key 即便 SHA 一样、stale generation/撤权、跨 Case/Subject/role、伪 receipt/archive/parse block、source raw SHA 漂移、skip/reject/UNKNOWN 必须拒绝“linked”或归 UNKNOWN，不丢旧快照与未受影响的 Check。
- 缺 Main 信任能力、缺 native physical key、缺 frozen candidate、用户浏览器伪 publisher/source identity、不完整 source/不可读文件 fail closed；B 代码不执行 C Case 写、不改变用户原件、没有学校 publication 路径。
- 异步前后 Principal/Owner/window/frame 在 C 对外适配器负责再核；B 自身读取只取**当下的 B-owned** 注册源并检查 Owner generation，不假装认证 C 主窗口。构建复合服务不应通过 fake standalone C Main 误升权限。

## 4. 验收与提交边界

- 只更新 B Draft [#142](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/142) 的 B-owned 工程代码、测试和 B-only 验收说明；所有 PR 继续 Draft，禁止合并 main。
- 首败与修复 SHA 均保留，最新 **同一精确 B SHA** GitHub PR CI + Baseline + D2 全部 completed/success，原始专项 Bun 日志、src/target Git blobs、source lock/回滚记录。
- 在 #142 评论交付 `R20` 精确 SHA、B1 reader/immutable frozen/B19 bundle 的接口和依赖树、安全正反例、CI；同时更新 #145 **仅** `STATUS:B`，不要写 C marker。需要新增 C-owned 主进程依赖/写入，先提 CR，不自授权。
- Gate O 成功**只签 B-own 技术**；仍须 C Main 受信 Owner/native picker 真正装配和新的 C exact Gate O，随后才可独立 Gate E；School L BLOCKED_NO_AUTH、Product P NOT_RUN、Release NO_GO。

## 5. C 并行继续的部分（B 无需等待，也不要重复做）

C 继续建设 Main-only 权限/Frame/Owner epoch 验证、授权生命周期、删除 Check 人工 Main 确认、Run/Host 信任与 Run-wide invalidation/业务 CAS 可靠性负例。**C 本轮不得为了缺 B 输入而伪造 B1 vault 或学校出版者**。待 B 精确依赖完成且 C 签明源锁，C 再真正把 candidate read bundle 装配到 Main IPC/Preload 并开展 Gate E/P。
