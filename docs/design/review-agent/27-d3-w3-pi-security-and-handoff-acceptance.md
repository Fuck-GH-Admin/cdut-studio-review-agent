# 27｜D3 W3：真实 Pi 结构化回执、安全门禁与独立 Agent 交接准备

> 状态：**W3 合成集成测试 / 待全量 CI 最终确认**。文中「技术审核完成」只指按固定责任收到合法回执，不是学校批准、真实政策生效或线上大模型阅读质量。D3 Release 和 D3→D4 准入**尚未签署**。以 PR #9 最新提交和 GitHub Actions 为唯一运行证据。

## 1. 完整制作与运行路径

已合并的 D2 提供正式 Pi 审核事务，不另建 Harness。W3 以 **W2 生成的 C/A B01/B02 作者态携包** 为输入，真实执行：

1. CLI `review-d3-handoff-demo.ts`：在独立配置目录冻结 B01/B02，生成特殊校园卡（family/temporary-service）和档案利用（read/copy/open）两套**合成局部片段**，导出带锁定快照的携包，再在另两个干净目录导入核对 D2 指纹。
2. `importD3Bundle` → `makeD2CandidateShell` → `saveAuthoringCandidateDraft` → `createD2TechnicalCase`：后端独立登记技术候选、校验锁、创建案卷，不开放正式模板发布。
3. `registerMaterial` / `setEvidenceLink`：读入合成材料的有效版本；档案 read 只登记对应主体的一条人工确认事实，**不会产生 copy/open 的独立证据**。
4. `preparePiReviewRunV2` / `submitPiReviewResultV2` / `verifyD2PiRun`：使用**生产的普通 Pi 接口**验证来源、回执、缺项、各操作对象、最终技术账本。故意提交「未确认校规=符合」与「查阅授权=复制授权」并要求拒绝，随后对未核规则按 `awaiting-confirmation` 正确收尾。
5. `decideWorkspaceCaseV2`：即使技术回执已完成也不能构成正式批准，必须返回 `AGENT_DECISION_DISABLED`。

这些都是**合成数据与模拟的 Pi 工具提交**；未调用在线模型生成检查结果。正例的含义是服务端/类型/边界逻辑验证，不是模型准确率评估。

实际测试（仓库根目录；使用 CI 或隔离的测试配置目录）：

```bash
bun test --isolate --timeout 30000 apps/electron/src/main/lib/review/review-d3-pi-integration.test.ts
bun test --isolate --timeout 30000 apps/electron/src/main/lib/review/review-d3-handoff.test.ts
bun test --isolate --timeout 30000 apps/electron/src/main/lib/review/review-d3-handoff-cli.test.ts
bun test --isolate --timeout 30000 apps/electron/src/main/lib/review/review-d3-minimal-cli.test.ts
```

前置：`bun install --frozen-lockfile`。如果是独立阅读的 D4 作者，请先执行 [26 号可复制命令](26-d3-w2-b01-b02-cross-business-handoff.md) 生成携包，而不要依赖本机已经存在的隐式配置目录。

## 2. D3-08 不可信来源和外部指令对抗

`review-d3-adversarial.test.ts` 将合成的「SYSTEM OVERRIDE / 忽略限制 / 我有校方批准」放进共享模块条文及假外校来源，走同一条候选建案、Pi 准备与提交链路。期望：

- 模块中的字符串作为**数据**保留，不被转换为正式校方 `policyVersion` 权威；未经证实的条文仍标 `unverified-policy`。
- Pi 上下文明确声明用户/外校来源/模板条款只是待审数据，不能升格为 system/developer/tool 指令。此为模型引导层**防御措施而非不可攻破的保证**。
- 真正的发布、缺真实材料来源的符合回执和正式决定，由服务端独立拒绝，不能被上述字符串绕过。
- 冻结模块 ID 不接受 `../` 等路径逃逸；携包的冻结测试资产引用同版本不能静默换掉。

**未测试的部分**：真实联网模型面对提示注入的语义服从率、对抗样本盲测及不同模型版本比较。此项不得因结构化代码回归成功就写成模型对抗已合格。

## 3. 修正的资产完整性和错误恢复边界

- `shared-frozen` 按 `moduleId + version + digest` 固定模块语义；其 `dependencies[]` **及 `exampleIds[]`** 也属于冻结记录的不可改资产。相同 ID/版本却替换回归 ID，即便模块本身 SHA-256 不变，也必须拒绝原地覆写或导入。
- `review-d3-library.ts import` 先以独占写入方式保留输出路径，保证**输出已存在时不会先安装共享模块再报失败**。验证或安装失败将删除本次占位文件。极端崩溃和文件系统级原子跨多文件提交尚未实现；异常中断如留下合法模块前缀，须按 SHA 校验重试，不能当成原包已完整导入。
- Digest 是局部一致性校验，不是校方可信签名；本地配置目录拥有写入权限的行为者不应被视为正式发布主体。

## 4. 交给两名「首次接触此工具」Agent 的独立交接试验（待执行）

**严格状态：D3-10 = not-run**。CLI 子进程测试、同一开发 Agent 的编写/自测都不能充当两个陌生 Agent 的独立验收，也不假装调用了别的 Agent。

### Agent A：最小文本制作（仅凭本文件和 23 号文档）

任务：在自己的 Git 工作树与**全新** `PROFER_CONFIG_DIR`，使用 `d3-minimal-*.json` 独立执行 `review-d3-library.ts validate/export/import` 及 `review-d2-plan.ts preview/register/create`。修改一条合理的自然语言检查要求并形成新 D1 工作区 revision；不加多余 Claim 图；不调用 D2 内部数据库/模板文件写入接口。记录每条命令、退出码、输出路径、修改前后义务清单与缺陷票。

验收者重跑受控 D1 保存和 D2 预览、对照完整任务分母；必须确认候选依旧不能正式发布。

### Agent B：档案逐操作与模块升级（与 A 完全隔离）

任务：独立运行 `review-d3-handoff-demo.ts` 产生 C/A 作者态，检查 B01 的 read/copy 事实绑定及 B02 的证据定位；查询冻结模块、修改一项**新版本**并使用 `impact/upgrade` 生成显式迁移工作区；刻意尝试在未签收删除检查的条件下升级并记录拒止。对一个高级不可表达的证据替代关系输出 `report-gap`，而不是删除该审核责任。记录所有命令和真正的失败原因。

验收者对照冻结锁和 D1 历史修订、D2 指纹及既有 Pi W3 回执，确认旧版本不漂移、未知规则待核及档案操作不串权。

两人分别交付：可携 JSON 产物、模块锁、日志/失败重试、运行 SHA、修订差异、问题票；由另一个会话或用户独立检查。两人完成并接受之前 **不能签 D3-10 pass**。

## 5. 第 23 号 D3-01～12 实证矩阵（截至本文件创建）

| 门禁 | 状态 | 本轮确实具备的证据或缺项 |
| --- | --- | --- |
| D3-01 | 自动化部分通过，人工 not-run | 无 Claim 的文本技术审核 CLI + 创建案卷回归；Agent A 从零独立试用尚未发生 |
| D3-02 | 自动化通过 | 查找/冻结/两个独立 C/A 工作区使用相同共享模块与 digest |
| D3-03 | 自动化通过 | 冻结覆写/缺依赖/坏摘要/非法 ID 拒止，及回归资产引用不能原地替换 |
| D3-04 | 自动化通过 | B01 在校园卡和档案中的参数、主体和来源适用独立；校本政策不继承 |
| D3-05 | 自动化通过 | 显式升级/受影响模板引用与老修订不漂移回归；尚无五份生产模板 |
| D3-06 | 合成接口通过 | 真实 Pi **服务接口**提交 C/A 回执；在线 Pi 模型实际审读 not-run |
| D3-07 | 自动化通过 | 高级 Claim 不支持时拒止，`report-gap` 保留受阻责任 |
| D3-08 | 服务端对抗自动化，模型盲测 not-run | 伪 system / 假校规文本不能越过服务器发布、证据/决定门禁 |
| D3-09 | 自动化通过 | 两个干净隔离目录导入携包并比较固定任务指纹 |
| D3-10 | **not-run** | 两名陌生 Agent 的独立操作和主观使用摩擦尚未评估 |
| D3-11 | 须核对最新 SHA | GitHub PR #9 同提交全量 CI + 基线 + D1/D2/D3 门禁，历史绿色不替代最新 |
| D3-12 | 部分通过 | 缺口票已有源 MD、位置、任务、归因和复现信息；五业务真实反馈/关联运行仍待确认 |

**结论：D3 尚未可交付 D4**。至少 D3-10 未运行和真实未知业务源文验证等仍须独立推进。W3 的正确性改进并未授权立即制作或发布五套正式审核模板。
