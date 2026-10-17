# 56｜P06 L02 U0 / U1 首败、修复复验与继续交接（2026-10-18）

> **报告性质：实测证据索引 / 发布门禁声明。** 保留旧 main、PR #21/#72 和首败报告；本文件不修改 29 号 LIVE-01～08 的权威台账。U0 对固定、明确标识的修复后候选通过工程验证；U1 只有 SourceRef 局部受控修复，有 Office #71 和真实 Main/IPC/Provider/Preview 的发布阻断。P06 仍 PARTIAL、P06-S02 NOT ACCEPTED，MERGE NO-GO。

## 1. 输入拓扑与不可转用的历史结果

| 对象 | 固定 SHA / 状态 | 结论边界 |
| --- | --- | --- |
| 我方整合 main | `8989941b6fb5651564e32d11c4215b6a6d5a5209` / tree `b3df4773afc20ee46facd2366f35c5a78ee99e98` | 旧 3983 PASS / 5 SKIP / 0 FAIL，**最后 Git clean FAIL** |
| 旧真实 Electron/Pi | `b95b44f7a06bb1e1ae21a985b5bb4cd9f5581027` | 16/16 场景、77/77 断言仅属于旧 SHA；新版 E03/E04/E05/IO 不借用 |
| 审核开发 PR #21 | `ecea6de83e2a384caad03805a6b2e7b12fb05dea`，Draft/Open | 分叉历史不强行 merge/rebase |
| SourceRef PR #72 | `b1bcaffe5b9aa9ac7e02f71c95e651f24a17297f`，Draft/Open | 只精确复用测试文件 blob `eb9798098877bccb617428a665f1ec7c98fdc6c1` |
| 上游历史 main | `c179f2575d5bb5abdc883268fb885d1a6449325e` | 48/49 原始差异来源 |
| 上游当日 main | `8228d27ec27da21c8b71889d9addfa7f2e2e5658` | 比历史 HEAD 多 15 commits；未纳入本冻结候选，最新版上游再更新是独立兼容待办 |

## 2. U0 CLI 首败与无豁免修复

原始自托管 Runner：[U0 原 main #38867959248](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38867959248)，[artifact #12032580281](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38867959248/artifacts/12032580281)：`bun install --frozen-lockfile` 后 `apps/cli/src/index.ts` **Git mode 从 100644→100755**，内容未更改，直到 `14-clean-gate exit1`；全仓 3983 PASS/5 SKIP/0 FAIL 不能覆盖最终失败。

`apps/cli/package.json` 定义 `bin.profer=./src/index.ts`，入口有 Bun shebang，故安装阶段产生可执行位变更与声明的包语义一致，但没有深入 Bun 安装器内部函数，结论定位到安装阶段与 Git 模式不匹配。

[最小修复 `faa06777`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/commit/faa06777d8bfa1f8064e0c0497386936471f7c19)：仅规范 Git 模式为 100755，**blob 原值 `8c0e1e3ce51c62fee413e643b0bdeca738631133`**，不改源码正文。修后与原 main 是不同 candidate SHA/tree，绝不修改原 main 历史结果。

原 U0 独立验证：
- [candidate `d89ba72` 的自托管 Actions #39066848259](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39066848259)，[artifact #12114155246](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39066848259/artifacts/12114155246)，artifact digest `sha256:a48c39d714a8ca1938560e93c8717914d83c433543a34d2a6156502b14f49ecc`；所有 U0 阶段 exit0，`12-clean-gate=0`。
- [修复审核 SourceRef 代码后的 candidate `4bcf857589eaba55eb372bc95e4299c967341c59` Actions #39067785203](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39067785203)，[artifact #12113878109](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39067785203/artifacts/12113878109)，tree `734b91d02c7c4dd27d5f184a40afe3708554e887`：**3986 PASS / 5 SKIP / 0 FAIL**（3991 tests、457 files、16457 expect），`00-identity`、`03-install`、`04-typecheck`、`05-boundaries`、`06-skin`、`07/08/09 Electron builds`、`10-focused`、`11-full`、`12-clean-gate` 均为真实 exit0；artifact digest `sha256:9ec88fc6be1ce23eac70886872be753388b3d76ce5c3775466bbc6eb58c04576`。

**U0 判定：指定的 `4bcf857` 候选 ENGINEERING PASS。** 后续新增的测试/CI/文档 HEAD 必须独立核对自身 SHA/tree 与 U0 工件，不能偷用 `4bcf857` 的 PASS 作为新 HEAD 的事实；新 job 入口为 [`p06-l02-u0-candidate.yml`](../../../.github/workflows/p06-l02-u0-candidate.yml)，且保持严格 clean gate。

## 3. U1 两条真实首败与最小审核修复

静态读码发现 `review-tools.ts` 的 `ref(documentVersionId,blockId,quote)` 与 `link_evidence` 按版本号查材料时未核查 `active`；`inspect_document_image` 的异步完成后也需复核当前材料是否仍有效。创建独立测试文件 `review-retired-source-ref.l02-u1.test.ts`，包含活跃版正例、失效版 `submit_check` 负例、失效版事实/证据写入负例。

**修前真实首败不可改写**：[candidate `4474291c118193d6645b746df1bfc9112bb80083` / Actions #39067328601](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39067328601)，[artifact #12114101699](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39067328601/artifacts/12114101699)，digest `sha256:84657a59abd481aa2745350bd1c7c89052c2f22fc664c85ad445184cb9369ee7`。当时实际全仓 **3984 PASS / 5 SKIP / 2 FAIL**（3991 tests、457 files、16453 expect），`11-full exit1`，而安装、类型、三端构建和 `12-clean-gate exit0`。两 FAIL 明确为停用材料仍可以（1）生成确定性审核结论，（2）创建事实记录。原始失败文件 `logs/11-full.log` SHA256 `a55b54bcc863d2373fd560f0a75365b05ea93a8c11feb745d4674a5ea0394760`。

[最小生产修复 `4bcf857589eaba55eb372bc95e4299c967341c59`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/commit/4bcf857589eaba55eb372bc95e4299c967341c59)：仅在审核工具引用查找、证据关联和视觉核对后重新定位材料时显式拒绝 `active === false`；不修改普通 Office #71、不放宽白名单/permission、owner/RunStore。修后同一候选全仓 3986 PASS / 5 SKIP / 0 FAIL，如第 2 节。

后续将 PR #72 的 test-only SourceRef 正反例精确复制至本新候选（以归档 blob 对照，不执行旧 PR 重基），并新增 `scripts/qa/p06-l02-office-index-identity-repro.ts`：直接调用生产 `materializeToWorkspace`，通过合成解析完成的数据而非真正解析 DOCX/XLSX/PPTX，重现同 stem 异路径/同或不同 revision 的 fileId、manifest/registry 互绑风险。**这只是实际物化函数的 source-derived 复现，不是合法 Office 文件的引擎/Main/Electron 整体验证。**

[U0→U1 严格串行工作流](../../../.github/workflows/p06-l02-u0-candidate.yml) 已有 `u1-controlled` job，`needs: u0-candidate`；先完整 U0，再在同 SHA 的隔离工作树运行两份 U1 专项和 Office 碰撞实验，记录日志/退出码/源 tree/SHA-256；再大的正反例与真实 Main/IPC/Electron、实际 provider/Office 输入仍须后续独立验收。

## 4. U1 逐项现实门禁

| 类别 | 已完成的有限证据 | 当前 U1 发布判词 |
| --- | --- | --- |
| 严格 SourceRef 停用材料 | 修前确证 2 fail；修后 `4bcf857` 2 fail 转 pass，活跃正例继续 pass | **CONTROLLED PASS for this regression**；新版 Main/IPC 未完成 |
| 同名不同版本的 SourceRef / 普通 `fN` 隔离 | PR #72 曾有独立 test-only 候选，本 PR 已复制精确测试待本候选 CI | **NOT-RUN for newest candidate until CI** |
| Office DOCX/XLSX/PPTX/PDF、同名路径与缓存重启 | #71 原源码真实风险；新 source-derived post-parse 重现脚本待工作流 | **BLOCKED_UPSTREAM for evidence-correctness signoff**，不混进本 PR 修 |
| 严格 Pi 五工具、Main owner/assignment/普通工具拒止 | 静态生产入口及旧局部探针，`isAuthorizedDirectReviewTool` 未放宽 | **NOT-RUN LIVE MAIN/PI** |
| SourceRef 原件视觉 / symlink / revoke / 异步回执 | `review_inspect_original` 现有本案/realpath/await后二次 binding；旧 probe 静态 | **NOT-RUN LIVE ELECTRON** |
| 新 readonly sidebar / 普通 preview / owner 无泄露 / 旧事件不复活 | 新入口需与历史 Preview Tab 区分；不恢复退役 API | **NOT-RUN LIVE ELECTRON / E05** |
| E03/E04/E05、ENOSPC、双持久化与重启 | 旧 46 实机真实 PASS，且本轮改审核 SourceRef 严格查找，不直接更动 Main/owner | **NOT-RUN for latest version** |
| 真实 provider、Office 引擎、跨平台与多窗口 | 本轮 CI 不提供合法 provider/真实 GUI | **NOT-RUN** |

**U1 不能正式 PASS**，但局部 SourceRef 的真实缺陷已经先保存首败，再最小修复并获得完整 CI 正反回归。普通 Office index 即使检索成功，仍不得当作严格审核已读或覆盖账本依据。

## 5. 分类阻断与接手 L02-00～04

- **ENGINE/SECURITY**：失效材料版本写证据的问题已用审核工具最小修复并在 `4bcf857` 完整 U0 正反回归；仍需要真实 Main/IPC 过期与撤权路径。
- **UPSTREAM**：#71 同名 stem / 路径、索引/缓存风险禁止本轮顺手修；先真实验收、后独立上游 Office PR，再必要时我方审核私有 PR。若碰撞导致实际错误材料依据，U1/最终发布必须 `BLOCKED`。
- **HARNESS/ENV**：本机容器没有 Bun/GitHub clone/Electron GUI 及受控 provider；以已运行自托管 Actions 的同 SHA 日志为据。新 HEAD job 结果必须逐个查询；没有真正 Electron/IPC/provider 不自动冒充通过。
- **EXTERNAL**：P05 Relay `BLOCKED`，Pocket `PATCH READY / TARGET NOT-RUN`；P04 永久 ID tombstone/UUID owner journal 不准无证明 TTL/GC。
- **SECURITY**：旧 37/38/44/46 首败、隐藏 Gold、审查五工具及 SourceRef 的强制范围不变。

**P06 交接：** 可开展的准备仅限记录 L02-00 C `execution-failed` 的既有事实并锁定合成输入、设备、版本；在 U1 真实 Main/IPC/Office/权限/preview 关键项达标前，**不能对 L02-00～04 做正式发布签收**。顺序仍为 U0→U1→L02-00（C归因）→L02-01（A/B/C人工闭环）→L02-02（严格视觉/压缩）→L02-03（普通Agent/多窗/平台），L02-04（Relay/Pocket/LIVE最终验收）可提前协调外部条件。

下一会话从 [Draft PR #98](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/98) 的最新 HEAD 开始，优先查当前 Actions 的 U0→U1 job 和工件，再补真实 Electron/IPC/Office/Provider 目标矩阵；仅对**已证实的**缺口做最小修复；保持 #21、#72 Draft、P06-S02 NOT ACCEPTED / P06 PARTIAL / MERGE NO-GO、不进入 P07/P08。
