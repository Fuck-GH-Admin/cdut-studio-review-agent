# pilot-models-r2 独立复验结论（QA：docs-r07-qa-models-20261023）

- 交付：`deliveries/pilot-models-r2/`（revisionOf pilot-models-r1，作者已封版后只读复验）
- 冻结：`baseline/source@05fb2565e20eb1760233696be1832f68196b37c2`（HEAD 已核、clean）
- 复验封版：READY `444312d8…` / DONE `ceac9af0…` / MANIFEST `ec85933f…` / ZIP `8900673e…`
- **批次判定：accepted（6 accepted / 0 revision_required / 0 unknown）**；G0/G1/G2 全 PASS
- 产品测试/typecheck/GUI/真实模型：`NOT_RUN`（静态复验，测试断言≠已运行）

## 1. G0/G1（封版机械 + 格式）

6 文件 blob/sha256/lines 与 MANIFEST/SOURCE-EVIDENCE/手册元数据三处一致；READY/DONE/MANIFEST manualHashes 一致；`before/` 全部等于 r1 stage；4 篇未变字节 == r1 accepted hash；2 篇变化字节 != before 且 COVERAGE 标记相符；`changes.diff` 重放与 stage 逐字节一致；ZIP 22 条目内容与 stage/before 逐文件一致、无路径穿越/符号链接/外批/reviews/密钥；hash 链无自引用且全部对得上实际字节；r0/r1 报告与交付未被改写（`history/` seal 未混用）。变化 2 篇元数据头与冻结源实测相符，章节完整、行号可解析、三分表与 NOT_RUN 明示。

过程观察 **P-R2-01（非阻断）**：写入序 MANIFEST→DONE→ZIP→READY 与合同"DONE 最后发布"及 seal 工具文档层序不一致（READY 含 doneSha256 致必然倒置，三批同构）；不影响字节一致性与合入，交 lead 统一。

## 2. G2 变化 2 篇（重点 BR2-01/02、BT2-01）

### `review-pi-run-bridge.ts.md`（`95d398ae…`）—— accepted

**BR2-01 已修并逐条回源验证。** 新叙述改为三路径分述：
1. **显式审核选择保存被拒**：`review-ipc.ts:1515` 校验白名单（实测吻合）；`saveReviewModuleSettings` 生产入口唯一（`:1522-1523`）；渲染层 `review-first-use-readiness.ts:2,9` 为 UI 过滤非强制（实测吻合）。
2. **全局回退（explicit:false）产品可达**：`module-settings-store.ts:44-49` 取全局设置（实测）；`settings-service.ts:93-118` 无 provider 校验（实测）；bridge `:37-43` 只查 `enabled`（实测）；QA 独立补证 UI 入口 `ChannelSettings.tsx:127-142` 的 `isAgentEnabledForChannel`（`channel.ts:184-189`）不含白名单，任意 provider 渠道可设为应用默认。
3. **文件旁路**：`getReviewModuleSettings`（`:20-35`）仅形状校验，手改 `review-module-settings.json` 可绕过保存闸（实测）。

并保留**"无闸 ≠ 必成功"边界**：provider 透传到 Pi 运行时（`agent-orchestrator.ts:1101`、`:2162`，实测）不等于该 provider 必定完成真实远端调用——措辞与实际代码一致，未夸大。

**BR2-02 已修**：`.ts/.tsx` 19 处引用（grep 实测 19 行）、生产强制点仅 `review-ipc.ts:1515` 与网关 `:157`（`:309-312` 调用）、渲染层为 UI 过滤、另 6 处非代码历史提及（实测 docs 1 + work/reports 5）——与全树检索一致，"仅此三处"错误表述已消除。

### `review-pi-run-bridge.main.test.ts.md`（`a8b8340c…`）—— accepted

**BT2-01 已修**：分述"用 `pendingExecution()` 的 10 个用例（1,2,3,4,6,7,8,10,11,12）在 draft 案卷成功启动 / 用例 5 被拒（'停用'、'非法 caseId'、'模式非法'，`:151-160`）/ 用例 9 不建案不启动（`:210-224`）"，并保留"无用例断言 draft 被拒绝"。调用点与拒绝断言逐条实测吻合。12 行用例表的断言行号（`:78/:82/:85-87/…/:307`）逐条对源无错位；mock 边界（仅 mock `../agent-service`）与 `NOT_RUN` 声明准确。

### UNVERIFIED.md 同源一致性 —— PASS

§3 全部 13 点（ollama 自检/调用矛盾、pickChannelModelId 回退、双口径解密、revokedAt、无 sender 断言入口、void source、5s 登记、cancelledRunIds、白名单三路径、draft 门禁差异、补偿无内层 try、引用面 19/6）与本轮实测一致；§5 元数据处置 M-01/M-03/M-04 落实，M-02 部分落实（见 P-R2-01）。

## 3. 未变 4 篇（hash 绑定 r1 accepted）

| 手册 | manualSha256 | 判定 |
| --- | --- | --- |
| `module-settings-store.ts.md` | `5c5732455f6b…` | accepted（== r1；源 58 行重读一致） |
| `module-settings-store.test.ts.md` | `d5c5c571ee43…` | accepted（== r1；24 行重读一致） |
| `review-model-gateway.ts.md` | `19b7a4f994ca…` | accepted（== r1；GW-03/04 关键行复抽一致） |
| `run-async-service.ts.md` | `86a9ecbdd9b9…` | accepted（== r1；RA-01/02/03 关键行复抽一致） |

完整 6 篇 exact hash 见 `REVIEWED-HASHES.json` 与 `RESULT.json.acceptedHashes`，lead 可机械合入。

## 4. 遗留（不阻断本批）

- **XF-R2-01**：draft 门禁不一致（run-async 拒 draft、bridge 放行）与 Pi 路径白名单缺口仍待产品/安全裁决；UNVERIFIED 已如实登记。
- **P-R2-01**：封版写入序与合同/工具层序不一致（元数据层），交 lead 统一口径。
- 后续任何修订另开 `pilot-models-r3/`，不得原地改字节。
