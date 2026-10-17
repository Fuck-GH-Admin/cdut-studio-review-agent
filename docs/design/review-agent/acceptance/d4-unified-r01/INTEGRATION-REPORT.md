# D4 G01–G08｜统一工程集成 R01 报告

日期：2026-10-18（北京时间）。本报告记录实际源码集成、GitHub Actions 运行记录和剩余边界；不是校方制度认证、D/E Gold 或在线模型准确率结论。

## 1. 固定输入及版本来源

技术父版本：PR #88 / a7a6a11d4840ad64cfc858c17b35f35180adf063。

| 领域 | PR | 不可浮动的输入 HEAD | 模板数 | 以 COMMON 为基准的唯一文件路径 |
|---|---|---|---:|---:|
| G01 | #95 | 258ffdc8b8b68015a65783d798d9f422986d2c3b | 5 | 71 |
| G02 | #89 | 5edb9bdfad77dd850e82fdcf162a382a203946e5 | 3 | 29 |
| G03 | #96 | c2f49f937b9768057e6e6b6975a832f9a11dfa03 | 10 | 96 |
| G04 | #93 | 9349cfe666d7f3be6dcaf92c163c0890469b7f3b | 8 | 94 |
| G05 | #91 | b7618958169120a5cec2f0ccaea512b13b7bd079 | 6 | 73 |
| G06 | #92 | 1b19a03c7ec70a687280bf0f9ff497ef8be0158e | 9 | 96 |
| G07 | #90 | 891f4a2d5945b4c53422e83b27213691e15594ca | 7 | 83 |
| G08 | #94 | fa3f561284e2395d0527790d725acb7587f6e7d8 | 2 | 19 |
| 合计 | 八份 Draft PR | 不使用 main | 50 | 561 |

集成代码 Git 对象提交 e03539cb395a99d8922c4667b382d4382cdd33b2，父版本直接指向 COMMON。561 项路径没有覆盖冲突、不丢弃领域文件、也不读取或改动隐藏 Gold。领域 README/manifest/issues/已有专项测试均保留在原路径。最后源头版本不同于集成工作流 HEAD，分别记录，避免因跨域合并替换旧回执来源。

## 2. 统一目录、发现、执行

统一 catalog.json 含精确 50 个 templateId@version、领域源 PR HEAD、原始业务 SHA-256、workspace 路径及原文件 Git blob SHA、manifest、版本、发布限制、原领域状态和集成测试预留状态；八份 catalog/GXX.json 为同来源分片。

公共系统依旧仅含一个 D1、D3、D2、Pi 运行能力。由 apps/electron/scripts/review-d4-unified.ts 提供 list / verify / install / installed / preview 入口：

- D1 工作区经源 Git blob 校验、validateReviewAuthoringV1；D3 原生 exportD3Bundle/importD3Bundle 并对比。
- 安装通过 makeD2CandidateShell + saveAuthoringCandidateDraft，进入原 TemplateStore.listTemplates；服务端 control 为 candidate-held，不能通过普通发布操作解锁。
- 真实 Check 和三值适用性、逐对象 Subject/EvidenceLink、动态条件不从候选壳静态推出；必须通过同一 workspace + selection + case 使用原有 review-d2-plan.ts 与 D2 create/attach 展开。
- **客户端可发现 50 个 candidate-held 壳，但目前仍缺客户端 GUI 从 catalog 选业务工作区、配置情景、固定 D2 Plan 的完整互动路径。** 本轮未开发 D5/第二套 Schema/第二套审核引擎，因此普通 UI 选择壳不能被误称为完整业务审核已跑通。

## 3. 统一实测和红灯修复

第一次 GitHub Actions 工作流 #39059329288 在 pull_request 合成合并提交 6e1349c2504b6473999fd3ee0788a939304ff79f 上运行：全仓 3713 PASS / 6 SKIP / 2 FAIL。原因是新集成校验错误地要求全案级 Check 必须有 objectKey，23 份包含合法全案 Check 的样本被误报；同时 shell 未启用 pipefail，让 CI 错显绿色。以上原始失败记录保留，绝不作为通过证据。

第二次经修正的统一 GitHub Actions #39059757923：
- 被测试的分支源提交：c8e87418f55d0b76c3020eb6afbcaa58f1cd7712
- GitHub pull_request 合成合并提交：d4480a45ef0175cb712818a57a6d6fc17173441b，父提交分别为 COMMON 固定 SHA 和以上分支源提交
- Bun 1.4.0、Ubuntu 24.04、frozen install：PASS
- bun run typecheck：PASS
- bun run check:boundaries：PASS
- bun test --isolate --timeout 120000：**3715 PASS / 6 SKIP / 0 FAIL**；3721 tests across 423 files
- 50/50 D1 valid；50/50 D3 roundtrip；49/50 使用通用 selection/case D2 Plan 直接编译成功；0 integration validator errors
- 50/50 candidate-held 在原 TemplateStore 注册、listTemplates 可发现；expected 50 / candidateHeld 50 / visible 50 / missing []
- 原始日志、CLI 输出、安装记录 Artifact #12111171393：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39059757923/artifacts/12111171393
- 统一 CI 工作流使用 set -euo pipefail；以 GitHub Actions 正式结论而非 artifact 存在性判断通过。

其余八域的逐项 D1/D3/D2/Pi 专项测试包含在本次 full bun test 内。历史固定领域 PR 的 Pi 收据不自动转化为集成 SHA 的回执；各个 Pi 验证仍由领域专项测试和对应 runtime Plan/Run fingerprint 约束，完成的仅是合成 pending-only 运行，不是合法签署、实付或审批。

## 4. G01-I 单独技术边界

G01-I 学籍身份更正 v1.7 是特殊学籍对象：I/fixtures/selections.json 包含 name 和 two 两套独立学生字段模拟选择，另有受控 registry，原 A′ runtime/actual-runtime-index.json 的双对象 Plan schemaVersion 2 与当前绝大多数领域通用 schemaVersion 3 不可混作一种输入。统一 verify 不会伪造 I 的普通 selection.json/case.json，因此 49 套直接编译加 1 套单独夹具待本地进一步固定验证；其既有 D3-R1 记录与原已通过的单领域测试只作为历史来源参考，不宣称 50/50 新统一 Plan 已跑通。

## 5. 持续保留的非技术/产品限制

- 原始业务母版及各领域 issues.json 已记录 POLICY_HOLD/SOURCE/HUMAN_ONLY/EXTERNAL，2026 当期校方制度、审批主体和接口不可得；不将其解释为技术引擎测试失败，不伪造权威来源。
- G03 的其它互斥维度、G07 的语义条件轴数量限制、G01-I 的跨 Claim/部门流程、跨对象合法替代证据与行政时效仍可能包含语义规则未完全机读；不为满足绿灯硬编码不存在的校规。
- 未执行在线模型真实漏检率、独立 D/E 隐藏 Gold 或真实 OA、学籍、财务及签章接口；Pi synthetic all-awaiting-confirmation ≠ 正式审核结果。
- 没有直接覆盖使用者现有模版；本地 Agent 必须隔离 PROFER_CONFIG_DIR，校验同 HEAD 的完整客户端加载与交互。
- 来源固定 Git 树集成由 GitHub 对象 API 操作完成；真实统一 Linux checkout + Bun CI 已执行。未在提问者本机运行 Electron 图形界面，不声称本地 GUI 已验收。

## 6. 放行口径及交接

D4_UNIFIED_INTEGRATION = PARTIAL。

已通过的子门槛：八域同提交文件级集成、50 套来源唯一性、50 D1、50 D3、49 通用 D2、50 candidate-held 模板库安装、跨领域 object/check/unknown/条件防串扰及全仓回归（以同源 CI 记录为准）。

待本地 Agent 确认：实际 Electron 客户端可选候选壳并通过 D2 create/attach 形成真实测试案卷；G01-I 用其独立学籍夹具固定新集成代码生成 D2/Pi；业务授权与模型有效性属于后续单独阶段。

本地执行命令、配置目录、数据入口、检查指纹与故障定位详见 D4-本地运行交接.md。所有 Draft PR 保持不合并 main。
