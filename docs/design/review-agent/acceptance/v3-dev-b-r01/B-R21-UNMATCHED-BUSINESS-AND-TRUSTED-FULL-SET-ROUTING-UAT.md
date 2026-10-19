# Dev-B R21｜无匹配业务候选入口 + Main 当前材料全集保守路由（工程验收）

**工程身份**：Review V3 Dev-B / B2+B3 + B-owned Renderer candidate-only；原 Draft [#142](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/142)，**基线 R20 已独立全绿** `984fbdda35590b39e8547860a025ef0db5a666b9`（PR CI 39328913067、D2 39328913007、Baseline 39328913046，全 Bun 4212 pass/5 skip/0 fail）。
**授权边界**：以唯一 #145 ABCI 协议及 C B-CR-001/B-CR-002/B-CR-003 为准。B3 技术路线仍是 `candidate-only`；不写 C Main/IPC/Preload/shared DTO/Case/Run/Outbox/SourceLedger/Business Writer，不制作学校政策发行者。本批新 SHA **不自动进入 I 已签 source-lock 或 C #144**。
**最终 Gate O**：最终 PR HEAD 提交本文件后另定 SHA 和独立三工作流验收，旧 R20 / 早期 R21 构建结果均不得冒充最终验收。

## 一、为什么需要这一批

原 `ReviewB3OwnerBoundRouteSession` 只对调用者提供的 `materialCandidates` 逐个核 B2 staging，但没核对 **是否遗漏了同案第二份原件**；`suggestions[*].availability` 虽标记 Main-required，却没有再对 Main 当前目录验证自动建议。旧纯路由若无 suggestion 一直显示 `awaiting-evidence`，不能清晰表达 *原件存在，但没有合适模板*。另外，单份来源证据即可掩盖同案剩余文件，可能在 20 秒后返回技术 `default-selected`。此风险虽仍被 C Case 最终验权挡住，但候选 UI 已可能产生错误匹配感知。

## 二、实际改动（仅 B-owned）

全部源路径相对 `apps/electron/src/`，精确 Git blob 锁如下：

| 路径 | R21 source Git blob SHA | 接口/语义 |
|---|---|---|
| `main/lib/review/review-intake-adapter-v3-b2.ts` | `e911663006cb105aad382a6a107630534e014739` | `ReviewB2StagingService.listScopedCandidateIds(ctx)`：返回当前 Owner generation+Case 下的**全部**真实已暂存 candidate ID（仅只读），Owner revoke/无授权 fail closed |
| `main/lib/review/review-intake-routing-adapter-v3-b3.ts` | `cd1d5b885e6fcc801b5e6c9df3e42a102b447f56` | B3 session 先核调用者材料集合===B2 当前全集，重复/遗漏 fail closed；对每份真实 bytes 重算 SHA 和 length；技术自动建议资格必须再与 Main 当前 `manualCatalog` 精确模板 ID+version 匹配；单 Application+单 Subject+每文件恰一次证据才可倒计时；无建议时明确 `unmatched` |
| `main/lib/review/review-intake-routing-adapter-v3-b3.test.ts` | `2c9d8497baa7c9b1bbf89c4b6a78c3c3041c67be` | R21-01..07、09..10 真实 staging、Main 人工目录、原件字节/多文件/撤权/缺目录/跨 Subject 和 No-match 负例 |
| `renderer/components/review-v3-dev-b/review-v3-route-view.ts` | `5828fe5ed54fbe21881b9bf06d864129abb9f299` | `unmatched` 清晰展示候选外业务，不伪称等待文件或学校已发布 |
| `renderer/components/review-v3-dev-b/ReviewV3CandidateIntakeSurface.tsx` | `b5b5407c06a1e9c4b414caec49ead4c0b6f57570` | 无匹配专门可见面板、人工复选与“创建新的候选审核模板（非正式发布）”入口；不自动创建 Case |
| `renderer/components/review-v3-dev-b/ReviewV3CandidateIntakeSurface.test.tsx` | `17e971fe81a11884cfca888e32991529676a184a` | R21-08 真实 React SSR 展示检查（SSR **不等于** Electron UI click UAT） |

## 三、行为及依赖

1. **无匹配不是无材料**。输入真实 B2 暂存且已明示角色+Subject，但无任何候选 suggestion 时输出 `unmatched`，`remainingMs=0` 且无 `chosen`；用户只能人工选择现有技术资格模板或开 B1 candidate-held 作者向导，不能让倒计时静默选择“通用模板”。没有可信材料仍是 `awaiting-evidence`。
2. **Main 当前全集**。B3 `evaluate` 首先经 B2 `listScopedCandidateIds(ctx)` 与提交的唯一 candidate ID 全集互证；遗漏任意同案原件、重复 ID 直接 `B3_ROUTING_INCOMPLETE_STAGED_SET`。这不是 C Principal 认证，可信 ctx 仍只能由 C Main 实际 session、senderFrame、Owner 派生；本方法不泄漏跨 Owner/Case 文件。
3. **物理字节**。逐个 `staging.getCandidate` 与 `staging.read`，重验 `byteLength/rawSha256`；不接受靠 Renderer 文件名、SHA 字符串或 candidate ID 代替实字节。
4. **目录而不是模型决定资格**。分类器对 `authorized-for-technical-selection` 的自述不构成授权：按模板 ID+version 必须精确在 Main 当前传入目录中且 status `authorized-for-technical-selection`，否则降级 `candidate-held`，禁自动/人工选择。目录变更重新计时 20 秒，不沿用过期推荐。目录本身必须由 C Main 权限验证，而非 UI 原样透传。
5. **全集业务歧义**。一条实际 Application+其支持附件、统一 Subject 且所有文件均恰有一次高置信物理 hash 证据，才可能进入技术倒计时。两申请文件、跨 Subject、未确认 role/Subject、少证据/重复证据/虚构 ID 均人工确认；任何 linked candidate 仍非学校业务判定。
6. **回滚与身份**。B2 原 stage/grant/原件内容不改，B3 source list 单独只读；R21 可按本表固定源 blob 与 R20 compare 精确回滚，不能通过重置 I 已签源覆盖 C 主线。20 秒表由 session 内 Main 时钟决定，user interrupt sticky，C Case write 不在这份代码。
7. **刻意未做**：从政策原文推断未知业务的高置信模型分类器、自动生成已获校方认可的临时模板、Main 实体 publisher、绕过 B1 候选编译/用户确认的无人化业务 Case。不符 50 套时 B1 自建**临时候选**，审批/出版由 C 与学校权威另行完成。

## 四、定向 Gate O、集中 Gate E/L/P

- 本批自动化 R21-01..10：真实 Main staged set vs caller omitted extra application；模型伪造授权但不在 Main 目录；只有部分文档证据；重复、陌生文件证据；多个独立 Application/Subject；当下 bytes SHA/长度变更；目录撤权再批准需重计时；无建议 `unmatched`；SSR 用户界面可见入口；Owner revoke/cross Case 无泄漏。还须完整重跑旧 B2/B3/B1/B19/B20/C0。
- 新精确 SHA 只有在 PR CI（锁定依赖、workspace TypeScript、boundaries、Main+Preload+Renderer 三端 build、全 Bun）、Review Baseline、D2 **全部 success** 且原始专项 PASS 后可记录 `R21_GATE_O=PASS_EXACT_SHA_SCOPED`；此时不是 Gate E。
- **集中 Gate E：NOT_RUN**。真正 Electron Main/Preload NativePicker、窗口 frame/Owner/epoch、20 秒倒计时重开、渲染器滞后响应、无匹配开作者、中文 IME、Office71/PDF/ZIP、3 OS、100 案/500 原件、进程故障/磁盘满/recovery，同批真实操作与录屏。
- **School L：BLOCKED_NO_AUTH**。50 套原始政策 47/50 raw match，3 处冲突隔离；G01 34 scope unknown，4163 applicability unknown，32 高风险 semantic validation unresolved，不能因此默认出版或变成 technically authorized。
- **Product P：NOT_RUN**。5 位非开发者各 30 分钟从空白自建第 51 套并完成 B2 真实原件关联、路由无匹配→B1 编辑→保存→显式冻结候选→重开冲突；统计任务完成率和错误并保留屏幕证据。必要前提仍是 C/I 将明确获批源接到真实 Main。
- **Release：NO_GO**。#142 Draft/未合并，I/C 不自动 import 本批来源。
