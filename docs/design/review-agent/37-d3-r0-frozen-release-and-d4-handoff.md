# 37｜D3-R0 固定技术交付包、五业务 D4 统一入口与准入签署规程

> 日期：2026-10-11。依据 [23 号 D3→D4 准入契约](23-d3-shared-module-library-and-d4-handoff-contract.md)、[24 号 D4 全量交付与验收](24-d4-five-template-authoring-and-feedback-loop.md)、[30 号独立 Agent 复验](30-d3-10-independent-agent-acceptance-result.md)、[31 号 D3 证据矩阵](31-d3-release-evidence-and-md-quality-gate.md)、[36 号 PR #18 集成边界复核](36-d3-pr18-closeout-and-release-evidence-review.md)。
>
> **范围：只冻结“Agent-first 技术模板制作、技术预审、来源追溯”的 D3 工具能力。** 不认证五份完整 MD 的业务语义正确，不授权成都理工大学官方模板发布，不宣称线上模型准确率或人工审批可自动完成。D4 五个原业务会话由用户单独启动；本包本身不创建任何业务模板。
>
> **Release 识别方法**：机器锁表为 [`fixtures/d3-r0-handoff-manifest.json`](fixtures/d3-r0-handoff-manifest.json)，不变的冻结分支名为 `release/d3-r0-20261011`。**冻结分支只是发现入口，D4 必须使用统一验收者在 [PR #9](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/9) 评论中签发的完整 40 位代码 SHA；不允许根据分支名自动追随 HEAD。** 这样避免把代码 SHA 写在自身被哈希的提交里产生循环引用。签署前，本文件只是候选交接说明。

## 1. 八项实际交付信息

| 23 号要求 | D3-R0 交付资产 / 验收方式 |
| --- | --- |
| ① 固定代码与环境 | Git `release/d3-r0-20261011` 最终不可变提交（40 位 SHA 由验收评论签署）；Node.js 22、Bun 1.4.0；`bun install --frozen-lockfile` |
| ② 冻结模块索引和内容 | `fixtures/d3-r0-handoff-manifest.json` 的 B01 `agent-authorization@1`、B02 `evidence-source-boundary@1`、精确 digest、fixture 路径、范围和非政策权威等级；`review-d3-library.ts inspect` 从隔离冻结库读取 |
| ③ 可执行制作说明 | 本文 §2 + [26 号一键隔离样例](26-d3-w2-b01-b02-cross-business-handoff.md) + [29 号陌生 Agent 真实命令](29-d3-independent-agent-acceptance-playbook.md)；如旧手册写“待执行”，以 [30](30-d3-10-independent-agent-acceptance-result.md) 的后续独立验收结果为准 |
| ④ 作者态与模板交付规范 | 既有 `ReviewAuthoringWorkspaceV1`、`ReviewD3TransferBundle`、`D2ScenarioSelection`、`RuleSpec/TemplateVersion`；不得引入第二套作者 Schema。作者态 revision 与模板发布版本分离 |
| ⑤ 技术运行与回执 | `review-d2-plan.ts preview/register/create`、`preparePiReviewRunV2/submitPiReviewResultV2/verifyD2PiRun`，审阅 `Rule/Check/SourceRef/subject/planFingerprint/Run ID`；不得将合成工具回执当作正式决定 |
| ⑥ 测试与样例 | `fixtures/d3-minimal-*.json`、`review-d3-handoff-demo.ts`、D1/D2/D3 单元回归、真实 Pi 服务端负例，固定 A/B 独立技术专项；原始业务金标与模型盲测独立记录 |
| ⑦ 限制与缺口 | [36 号](36-d3-pr18-closeout-and-release-evidence-review.md) §4；`review-d3-library.ts report-gap` 要求原 MD、责任、受阻操作、实例、Check/Run 及可复现步骤 |
| ⑧ 版本与来源清单 | 本文、`fixtures/d3-r0-handoff-manifest.json`、正式评论中的 SHA 与六组同 SHA CI、各 D4 会话独立输出的模块锁/模板版本/测试资产摘要 |

**B01/B02 是 D3 共享复用机制的合成测试资产，不是要求五套业务强制引用的正式、已核校规模块。** 可以不复用、不支持跨业务资格推理，不以引用数量评分。

## 2. 五会话共用的实际工作入口

在各自独立 Git 工作树/分支且已读取统一签署 SHA 后：

```bash
# 固定 SHA 从 PR #9 上最新有效的 D3-R0 签署记录复制，不能采用浮动分支 HEAD。
export D3_R0_SHA='<40位完整固定提交，必须来自Release签署>'
git fetch origin
git checkout --detach "$D3_R0_SHA"
test "$(git rev-parse HEAD)" = "$D3_R0_SHA"

# 不使用个人/生产配置或真实学生材料。独立会话使用独立目录。
bun --version               # 固定 CI 使用 Bun 1.4.0
bun install --frozen-lockfile
export PROFER_CONFIG_DIR="$(mktemp -d)"
export D3_OUTPUT_DIR="$(mktemp -d)"
node apps/electron/scripts/review-d3-r0-verify.cjs --expect-sha "$D3_R0_SHA"

# 验证无需复杂关系图的最小文本（无任何真实校规声明）
WS=docs/design/review-agent/fixtures/d3-minimal-workspace.json
SEL=docs/design/review-agent/fixtures/d3-minimal-selection.json
CASE=docs/design/review-agent/fixtures/d3-minimal-case.json
bun apps/electron/scripts/review-d3-library.ts validate "$WS"
bun apps/electron/scripts/review-d2-plan.ts preview "$WS" "$SEL" "$CASE"

# 真实 D3 冻结复用/携包导入与三个场景技术编译示例
bun apps/electron/scripts/review-d3-handoff-demo.ts "$D3_OUTPUT_DIR"
cat "$D3_OUTPUT_DIR/handoff-report.json"
```

业务作者必须先取得**自己业务的完整原 Markdown 文件**，它们暂在用户的 ChatGPT Library / 原业务会话，**没有**复制进仓库。各自通过下面的精确文件检查，在报错时停止制作，不允许从概要或搜索碎片凭空恢复全文：

```bash
# 示例 I：其余 A/C/S/P 换成对应业务字母和原始文件路径
node apps/electron/scripts/review-d3-r0-verify.cjs \
  --expect-sha "$D3_R0_SHA" \
  --business-file I '/path/to/g01_student_identity_complete_template_v1.7.md'
```

`--business-file` 只验一个业务的来源哈希；不提供文件时报告 `NOT-RUN`，**不会冒充五份源 MD 已验证**。具体 SHA 列在 `fixtures/d3-r0-handoff-manifest.json`；当前五份原文文件已经在交接审查的独立隔离文件环境中读取并计算指纹。

Agent 使用的实际接口：`review-authoring-v1.ts`（`validate/diff/save/read/candidate`）；`review-d3-library.ts`（`discover/inspect/freeze/reuse/validate/diff/impact/upgrade/export/import/report-gap`）；`review-d2-plan.ts`（`preview/register/create/attach`）。**三个工具是既有 CLI；没有新的 YAML 作者规范。** 从业务 MD 生成可执行模板是制作 Agent 的阅读与分析工作，不是这些 CLI 当前承诺自动完成的功能。

D4 业务模板制作应按 [32 号 MD 原文追溯质量协议](32-md-to-modular-template-agent-quality-protocol.md)：先从原文建立逐条责任/例外及来源定位，再设计本地模块与可复用局部模块；重要的对象、条件、证据和权限关系必须具有可执行门禁或明确记录 `tooling-blocked`。不得只验证编译或只做片段，便声称原 MD 全量转换合格。

## 3. 五份原业务的固定输入和隔离边界

| D4 负责人 | 一份完整业务 MD / 输入识别 | 关键测试重点 |
| --- | --- | --- |
| I 学籍身份更正 | `g01_student_identity_complete_template_v1.7.md` | 多字段更正、旧证件合法替代、事实来源与有效身份核实 |
| A 档案利用 | `g01_archive_utilization_template_editor_spec_v1_5.md` | 多档案件×多操作、read/copy 独立授权、特别出具/签章权威 |
| C 特殊校园卡 | `special_campus_card_template_v1.4.md` | family/temporary-service、资格主体、代办不等于发卡许可 |
| S 专项证明与用印 | `G01_special_proof_seal_review_template_v1.4.md` | 证明/译文/用印组合、批准稿与送印稿版本、责任阶段 |
| P 政审材料程序 | `G01_political_review_template_v0.3.md` | 出具/收件阶段、组织签章权、敏感事实最小化与正式决定禁用 |

每个业务独立 Git 分支/工作目录、`PROFER_CONFIG_DIR`、`workspaceId`、案卷 ID、测试输入与金标；公共版本锁完全一致。业务作者不能在自己的模板分支绕过 D3 内核，不能直接提交正式学校模板，也不得把未核成都理工政策提升为学校既定强制条件。

**注意技术边界：** 档案 `instantiateD3ArchiveCaseV1` 是档案专用适配器，不能推广为 I/C/S/P 强制 Schema。三态条件、材料 `applicant/authority`、有限证据替代和现有技术 `CaseStage` 不是任意证据关系图或正式行政审批。档案同类多操作目前不支持依 `operationId` 精确区分赋值不同的 gate，`certified_copy` 不能当普通 `copy`。复杂关系、校本阶段/签章或未知事实无法忠实表达时，保留原责任并报缺口。

## 4. D4 八项交付与验收守则

每个会话按 [24 号契约](24-d4-five-template-authoring-and-feedback-loop.md) 提交同一逻辑目录：
```text
d4-{I|A|C|S|P}/
  source/            # 原 MD 的文件名、hash、章节→责任、来源等级
  workspace/         # D1 作者态、revision 历史、模块本地与共享锁
  runtime/           # D2 技术 plan、Check/Rule/Source、subject、真实 Pi Run
  tests/             # 正例、反例、替代、未知、阶段、修订的独立样本
  gold/              # 独立金标；严禁注入审核 Agent 作为材料
  coverage/          # 所有原始责任的 implemented/tested/policy-awaiting/tooling-blocked
  reuse/             # B01/B02 复用或明确拒绝的理由与升级影响
  issues/            # D3/D4/Pi/来源归因、严重度、可复现命令
  manifest.json      # 固定 D3-R0 SHA、模块 digest、业务 MD hash、结果
```
以上目录结构是**交付逻辑范例**，不是需要向 D3 核心新增的 Schema。

一套完整模板内允许多个条件分支，但五种不同审核目的仍是五套独立模板。单个业务发现 `Blocker` / 未接受 `Major` 时不能签该模板的技术完成；若根因是 D3 公共能力，统一返工 D3 并生成新的 Release，受影响业务作者显式迁移后复验。**五套统一金标验收未完成，不进入 D5。**

## 5. 准入签署与尚未交付的权限

D3-01～12 工具层证据来源：独立 Agent A [PR #11](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/11)、B [PR #12](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/12)、第三方复验 [PR #13](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/13) / [#38093886953](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38093886953)，D3 既有六项同 SHA [#38142993546](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38142993546) 等，详细在 [36 号](36-d3-pr18-closeout-and-release-evidence-review.md)。

**只有同时满足以下条件，PR #9 的统一验收者才在 GitHub 留下 `D3-R0 TECHNICAL RELEASE ACCEPTED → D4 AUTHORING ALLOWED` 签署**：

1. 具有冻结源码 40 位 SHA，Release 锁表中的 B01/B02 digest 与实际仓库文件一致，五业务文件名/摘要已记录。
2. 新增 Release 校验器在该代码 SHA 的全库 CI 与 D1/D2/D3/旧回归、MD 动态 A/B 专项下全部成功；需要外部独立材料的测试仅由专项 CI 跑，跳过项逐条交代。
3. 工具操作说明为真实 CLI，最小文本及 A/C 合成场景可复现，独立陌生 Agent 的技术交接试验已通过，问题票包含精确来源和受阻位置。
4. 未支持表达能力、外部政策来源、在线模型金标均明确标记，D4 对应完整 MD 可按 hash 找回；不把这些尚未完成的业务/权限验收冒充 D3 技术准入完成。
5. PR #9 保持 Draft、main 解决冲突与正式合并另行处理；D4 工作仅从正式签署 SHA 派生，不从 main 或浮动分支起步。

本交接包不包含 D4 工作产物，不构成 D4 Accepted 或 D5 Allowed。Release 签署时同时建立只向同一经验证 SHA 指向的 `release/d3-r0-20261011` 分支，之后禁止在该分支添加提交；若需要技术修补，发行 `D3-R1` 并让受影响 D4 会话显式迁移。
