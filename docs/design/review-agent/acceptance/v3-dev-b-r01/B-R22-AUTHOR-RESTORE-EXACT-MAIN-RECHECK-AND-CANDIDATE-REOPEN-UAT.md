# Dev-B R22｜B1 真实修订冲突 / 空白重新打开 / 两次 Main 读回一致性

**Owner：Dev-B；候选工程主线**：Draft [#142](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/142)，B1 Author Wizard。依据唯一 [ABCI 协议](../v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md) 和 Dev-C 的 B-CR-002-A/C、B-CR-003 C-only Main 权限裁决，B 仅开发自己可组合的 candidate-held 消费/安全回归，**不编辑 C Main/IPC/Preload/shared/Case/Run/SchoolPort**。工程基线 B R21 独立已绿 `f1fd56c8c61149e40dc2c916ad7fbcf87a23d66b`；PR `39331517763`、D2 `39331517696`、Baseline `39331517726` completed/success，旧 Bun 4222 PASS /5 SKIP/0 FAIL。

## 1. 缺口、修复和实际用户动作

B1 作者工作台已经有 `onReadLatestCandidate` 主进程**可选**只读调用、保存快照的版本 diff、明确备份核对/人工载入。此前作者看完首次 Main 最新修订之后到点击“确认载入”之间仍有**第二位作者写入新修订**的时间竞争，原 UI 直接采用第一次的旧对象。虽后续 C CAS 应阻止旧 revision 的业务写入，但产品仍可能显示过期结果。空白新会话仅为重新打开已有 template ID 而填入业务标识时也被一概视为脏草稿，要求对无其他内容的空白配置先导出备份，造成不必要的重开成本。

本批 R22：
- `review-v3-author-resume.ts` 引入 `assertB1ResumeReadStillCurrent(staged,currentResponse,local)`，在**用户确认载入时由 C Main 当前 read 回调重新读**后，使用现存候选读回结构/模板约束重验 `templateId+revision+digest+整个 B1AuthorDocument+epoch` 均与先前屏幕 diff 一致，任何变动拒绝且清除过时待载入预览；只返回 candidate-held 深拷贝，不变更存储，也不据此赋予 Principal/学校 issuer。
- `isB1PristineReopenLookup(draft,revision,saved,blank)` 限定**只有 revision=0、saved=null、templateId 合法且草稿与完整空白作者模板完全相等（仅 templateId 可不同）**，才可不导出一份没业务内容的空白备份而明确加载真实已保存候选。仅凭 fields 数量少或名字空白，绝不可免除本地有意义业务草稿备份。
- `ReviewV3AuthorWizard.tsx` 从原同步 `adoptLatestRead` 改为带单实例操作锁/忙碌反馈的异步“**确认后再次 Main 读当前版本**”，读前验证 dirty backup 与是否原始空白；调用 `onReadLatestCandidate(templateId,revision)`，再检查两次回执和当前 epoch/版本/备份确认、最后**仅在本地内存**替换显示/清空旧 technical preview、试跑和删除 Check 提示。Main 读失败/旧 revision/撤权/新编辑/返回不同摘要或 doc 必须保留原屏幕草稿；不做自动三方合并/自动重试/新版覆盖保存。
- 正式持久修订仍严格使用原 B1 `readB1AuthorRevision` 全链，`saveB1AuthorRevision` revision CAS，`freezeB1Candidate` 仅 candidate-held。用户曾保存但当前有新编辑，明确导出并**用户亲自检查文件成功**后才能选择舍弃，否则强制拒绝。
- 原 React B1/B3 技术 UI 仍不是已接入真实 C Main 的工作台；B 的测试通过只能证明在未来真实 Main read 源安装后，B 可拒绝陈旧消费者结果。**第二次读后到下一次 Main 持久写的权限/版本竞争，只能由 C 主进程重验并通过原生 CAS 拒绝**，B 不声称消除全部 TOCTOU。

## 2. 固定 B source import graph / blob SHA

均在 `apps/electron/src/renderer/components/review-v3-dev-b/`：

| R22 变更 | Git source blob | 作用 |
|---|---|---|
| `review-v3-author-resume.ts`（新增） | `5e2e5b03e3997fdc23bbd7c8777004a1f09bb164` | 严格第二次 Main read 合同，未编辑空白候选重开判定 |
| `review-v3-author-resume.test.ts`（新增） | `193a9d85b9d657d78d34f7b6b3362737170c1b0a` | R22-01..10 真实 B1 author vault/修订/CAS/freeze + 首次/二次读差异负例 |
| `ReviewV3AuthorWizard.tsx`（修改） | `49d0d848ddb07a91a0345457e5f23744f3562cc5` | 真实 UI 二次读回与 dirty backup 操作防冲突 |

依赖原有（**本轮不改它们**）：`review-v3-author-revision-read.ts`（候选来源响应与新旧比较），`review-v3-author-diff.ts`（只读 Check 差异），`review-v3-author-trial.ts`（样例与保存严格隔离），B1 原作者 `review-template-author-store-v3-b1.ts` 和 `review-template-plan-adapter-v3-b1.ts`；B R20 `review-v3-b1-b2-main-read-bundle-v3-b.ts` 仍为 C Main 即将组合的只读依赖，不获得 C Main 权限。本 R22 新 HEAD **不是** I4 当前已签来源，可用精确 blob 交 C/I 审查，但绝不可自动导入/宣称 C 签收。

## 3. 本批真实 Gate O 正反例和首败记录

`review-v3-author-resume.test.ts` **10 条**：
1. 真正保存并冻稿，空白会话只填 templateId → 最新主进程读两次一致，用户明确重新打开；
2. 两次读之间真实 append-only version 1→2，新读拒绝旧预览；
3. revision+digest 相同但 body 不同的伪响应仍拒绝；
4. 跨模板、published 假发布、摘要非法、旧修订拒绝；
5. Main 请求期间编辑 epoch、CAS baseline、templateId 变化导致取消；
6. 严格空白 ID-only 唯一免备份；姓名/目的/来源/旧修订/非法标识皆不得跳过；
7. 真正脏草稿必须有同 epoch 的用户已检查备份确认；
8. 实际两个作者并发 CAS，旧 revision 不能覆盖，历史不可变，旧冻稿拒绝；
9. 非更高修订不能冒充恢复；
10. 读回深拷贝，临时回执对象改变不得改写早先 diff。

**首个代码+测试 SHA `1a84e9e04910f7968ce81a914b8e11f068049d00`**：PR CI [39333420457](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39333420457) 的工作空间 TS/三端构建成功，全量 Bun **4236 PASS/5 OS SKIP/1 FAIL**；唯一 R22-06 **测试夹具**把与空白骨架完全相同的 `doc.sources` 误认成“新增了来源”，`expected false, received true` 是预期空白判定的正确行为。原始日志位置 `review-v3-author-resume.test.ts:123`，未更改任何产品校验逻辑。D2 [39333420644](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39333420644) 和 Baseline [39333420466](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39333420466) 已成功，但**首败代码 SHA 不许签绿**。测试修复 commit `a57877af82344da605ab36133e5bc2bd2b32d111` 仅将负例替换为真正新添的来源（并保留 R22-06 其余严格拒绝场景），不降低任何逻辑门槛。**最终 Gate O 必须是本验收说明提交后的新精确 HEAD 三条 GitHub Actions 全 completed/success，且原始新 10/10 和全 Bun 0 fail。**

## 4. 下一轮 B 产品发展与验收门禁

**B1 后续**：已做到有界候选作者源、引用重命名和删除 ACK 预览、版本回读和双确认；下一批优先从真实编辑中发现的字段/对象/Check 配置体验、真正 C Main 工作台回调接线后验证复杂 51st，避免过度分拆成许多无法操作的函数。可并行 B2 ZIP/Office 原件异常处理、B4 3 原始字节冲突/34 G01 scope unknown/4163 applicability unknown/32 高风险语义证据复核。

- **Gate O**：仅本批 B-only exact SHA PR CI + D2 + Baseline + raw 10/10 通过时 PASS；本地无实际 C Main AuthorGrant。
- **Gate E**：NOT_RUN。C/I 签实际 source lock 之后做一次集中 3 OS 的真实 Electron window+senderFrame/Main Principal, 20s route 到新建、中文 IME、断网/异常断进程/ENOSPC、多窗口并发改同作者、save/reopen/freeze/backup 下载真实落盘与错误、Office71/ZIP/100案500文件。
- **Gate L**：BLOCKED_NO_AUTH。校方模板的政策原件/版本/签发者/Gold 不能由作者 user-declared 自动升级为出版。
- **Gate P**：NOT_RUN。5 位独立非开发者×30 分钟，第51套从空白建立 Check×target 两人、无模板路由入口→字段/来源/条件/责任→保存冲突/重开/冻结/真实来源验证；录屏、逐任务失败和恢复。
- **Release**：NO_GO；#142 Draft/unmerged，不对 C Main/IPC/Preload/Case/Run/OfficialPolicy 产生写入。
