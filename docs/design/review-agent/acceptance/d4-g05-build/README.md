# D4｜G05 六套模块化业务模板技术制作包

> **领域工程成果，不是适配报告。** 固定 COMMON-01/02 技术父提交 `a7a6a11d4840ad64cfc858c17b35f35180adf063`，对应 Draft PR #88。本包所属 Draft PR #91，未合并，不允许直接声明成都理工大学正式政策/审批授权。
>
> 业务基础：六份 `G05-T01..T06_正式业务模板_MD_v0.1.md`，从 ChatGPT Library 读取原始字节并独立校验 SHA-256，与 G05 E r02 记录六份单文件 SHA 相同；原件只读归档在本包 `source/`。未接触隐藏 Gold，未修改 A/B/C/D/E 冻结产物。

## 实物目录

```text
d4-g05-build/
  source/G05-T01..T06_正式业务模板_MD_v0.1.md
  templates/g05-t01..t06/
    workspace.json            # 可供 D1/D3 作者态处理的真实 V1 Workspace
    synthetic-selection.json # COMMON generic-object / primary + BR 条件 / 三值
    synthetic-case.json      # 受控合成案卷，无个人数据
    coverage.json            # 逐 R + BR + F/M/EV/ST 等合同/编号目录
    manifest.json            # 单模板来源 SHA、模块、锁定版本、运行状态
  runtime/
    templates/g05-t01..t06/
      d2-plan.json, synthetic-pi-run.json, synthetic-pi-receipt.json
      d1-d3-cli-record.json, d3-transfer-record.json
    test-log.txt, checkout-sha.txt, common-base-sha.txt
```

实际测试代码：`apps/electron/src/main/lib/review/review-d4-g05-build.test.ts`；专项工作流 `.github/workflows/d4-g05-modular.yml`。**没有修改 D2/D3/Pi 公共源码，也没有新增第二个审核引擎。**

## 模板、证据、工作量与最终状态

| 模板 | C 原文 SHA256 | R 义务 | BR 逐对象条件轴 | D1 模块 | 来源绑定 | 合成 D2 Check | 状态 |
|---|---|---:|---:|---:|---:|---:|---|
| G05-T01 专项会议资助 | `e96890784840f542b72e907885945a9488ce18fda4c5058585994dc0a12446bb` | 48 | 11 | 25 | 67 | 78 | PARTIAL |
| G05-T02 集体外出安全 | `502e40a96c247d3d80df791534a416c070c5a5a2f54d6538b7b2864863ebd802` | 46 | 13（BR-01/02由主对象类型与合同覆盖） | 27 | 67 | 80 | PARTIAL |
| G05-T03 校际交流/公派 | `ef7f6e8e60fe032c39ea5d6e228977b33cf1c871b2d8a8669a43bb168274452f` | 44 | 13 | 27 | 65 | 78 | PARTIAL |
| G05-T04 因公出国境 | `7af449ccd825a514c9e5454c2ce481481323821324bd4765ea462c46811eb54d` | 48 | 10 | 24 | 66 | 76 | PARTIAL |
| G05-T05 境外专家来访 | `4459b4a3c34dae26545c12546368156e1c6b5864a155bb0f36987992e36f18e3` | 38 | 11（BR-01为主访客结构） | 24 | 57 | 68 | PARTIAL |
| G05-T06 主办国际学术会议 | `0775e73d1ce248b735fc963e93583e765d89eb4e810d27b48c1d803f784b7bcb` | 49 | 12 | 27 | 69 | 81 | PARTIAL |
| **合计** | | **273** | **70** | **154** | **391** | **461** | **6 PARTIAL** |

注意：70 个 BR 逐对象适用性门禁不意味着把原文的复杂枚举/AND/OR/行政审批自动转换成完整 DSL；这些内部义务原文照录到语义模块并列待核。总计 273 项编号 R 均有源文行号、模块任务、来源绑定与运行实例。字段 F、材料 M/MS、证据 EV/AF、阶段 ST 和部分非编号义务以六类合同模块、来源文件和 `coverage.json.nonRuleIds` 联合保留，不把所有字典项机械判为必交材料。

## 真实通过的技术测试（非业务裁决）

固定 COMMON 工程候选上的 [专项 CI #39051560191](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39051560191)：**18 pass、0 fail、501 断言**。逐模板验证：

1. 冻结业务 MD 的真实原始字节 SHA；完整 R ID 映射及 SourceBinding。
2. D1 `validate/save/read/diff` CLI、原位不可变作者修订；D3 模块 export→import、版本及校验。
3. D2 `preview` CLI 和服务层编译，每案两个 `generic-object`、独立 Subject/RuleSpec/Check、校验有效来源与计划指纹。
4. 反例：重复 subjectId、伪造条件来源版本、条件 UNKNOWN 不能当通过；材料 A 的 EvidenceLink 不得作为对象 B 证据，旧 documentVersionId 不得直接复用。
5. 六个独立合成技术案卷，经真实 `registerMaterial`、`setEvidenceLink`、`preparePiReviewRunV2`、`submitPiReviewResultV2`、`verifyD2PiRun`；所有 461 个检查均以**尚待确认**回执完成，不能说明业务事实合格或行政许可获得批准。

`runtime/**` 是 CI 在真实服务运行后写回的机器产物；本地可重跑 `bun install --frozen-lockfile` 和 `bun test apps/electron/src/main/lib/review/review-d4-g05-build.test.ts`，使用独立临时 `PROFER_CONFIG_DIR`。所有证据均为合成数据，没有真实校务 API、在线模型盲测或独立 Gold。

## 为什么 6 套仍标为 PARTIAL

作者态及对象/三值 COMMON 技术路径已经真实可执行，但**不能声称完整业务裁决等价**：

- 有效校规、主管部门、资金/出访/来访/办会有权事件需要独立可信来源。申请人的材料、C 草稿和合成 reviewer 选择不能替代正式机关决定。
- C 原文某些多环节过程（批准、上级复核、变更撤销及校本 ST 顺序）还没有独立的可信业务阶段事件接口；现有 `CaseStage` 不等于校务流程本身。
- 跨对象复杂 Claim、带特定法律效力的替代证据、动态支出计算不是 COMMON 通用三值的承诺范围；不得把一项材料或前序审批直接推广到其他对象、阶段或权利。
- 本轮所有 Pi 回执均为 `awaiting-confirmation`；没有在线模型对复杂真实文书的语义核验，也没有访问/重建隐藏 Gold。虽然保证检查**不静默消失**，并未证明模型能正确判出全部原业务错误。
- F/M/MS/EV/阶段的非 R 合同采取语义保留加追踪矩阵，未独立证明每项涉及的条件/材料/时间/数据源已经获得完整程序化执行；技术样本只覆盖每模板两个对象。

具体归因与最小修复：`issues.json`。在未补充实际校方权威来源、业务反例和独立集成验收之前，**不能把六套模板都改标 READY_FOR_INTEGRATION，也不允许把源政策待核误报成 COMMON-01/02 的旧缺陷**。

## 后续统一集成使用

以 PR #91 的**固定完整 HEAD SHA**读取六套 `workspace.json` 和 `manifest.json`，逐套复验源码摘要、BR 动态条件来源和 D2 Plan/回执；比较独立业务反例并复查 T01 多费用、T02 每成员保险、T03 推荐与外方录取、T04 团组逐人/多国、T05 访客专项活动、T06 主办资格/国别统计。现有技术预审模块可以继续使用，但任何正式批准、资助拨付、录取、办证、发函、举办许可仍必须有权人在合法系统中决定。
