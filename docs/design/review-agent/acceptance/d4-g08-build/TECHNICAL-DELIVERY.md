# D4｜G08 两套业务完整作者态与技术执行交付记录

> **结果：READY_FOR_INTEGRATION（仅 D1/D3/D2/Pi 有界技术候选）；真实学校制度、可信后台、最终办理、Gold/在线模型准确率 NOT_VERIFIED。** 此状态不修改 G08 历史 E r01/r02 NEEDS_REWORK。

## 1. 输入、版本与零改义原则

固定公共工程父版本 `a7a6a11d4840ad64cfc858c17b35f35180adf063`（PR #88）。G08-T02 完整C母版v0.1 SHA256 `7bd277cc24889805102e16d9f2de079434dd8f6ffe90ad00fc5872f169cd2418`；G08-T03 原v0.1 SHA256 `53ee6a8dd1931ba9fe193289ce1a41b07bb35489325ad19d07dcfb02cccf00af`，此轮**明确选择R31作者修订新候选** `f8acf03994262e621d4afac6e608d34d90b114b7103372bef25fc7a4b50f88ec`（作者commit `1df64a1a9b7f994deaa596e0f05cb877770235a4`）；旧新版不可混用。仅保留 T02/T03，历史T01归G01。

原始规则51+52＝103条、非编号不变量6+7＝13条均通过D1 workspace的独立 sourceBinding 对应；源字段、材料、等价证据、适用条件及问题码保留于`business-contract.json`、`source-catalog.json`及任务要求。没有用 B01/B02 合成冻结样例冒充学校当前代理或投诉权限；36个版本1局部模块，`sharedModuleLocks:[]` 明确表示本轮不进行不正确的共享复用。

## 2. 实际 CI 同 SHA 技术结果

**受检代码** `fd42de23b4814a4c4e8fd30527f816e14550988f`，不是固定COMMON父提交的旧测试，不是随PR移动 HEAD 猜测：
- [G08专项 #39051306961](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39051306961)：**12 PASS / 0 FAIL**，完整 typecheck、boundaries、G08代码测试；JSON Plans、Runs及材料关联存于 [同次产物](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39051306961)（artifact ID `12107009207`）。
- 两套均真实执行 D1 `validate/save/read/diff` → D3 `export/import` → D2 `preview/register/create` → Pi `prepare/submit/verify`；与源码一致的schema3 generic-object，技术结果均保持 pending 且不开放正式发布。
- T02：**2 Subject / 107 Check**，Plan指纹 `f2b7dabd3a4e0088e14b5a031c1308559a448bf00e359b56c9f0b25c5bc8a6b9`。同案失物A的 reviewer-confirmed Material/EvidenceLink不能成为B的证据，旧文件版本也不能复用。
- T03：初次＋反馈双议题 **2 Subject / 82 Check**，Plan指纹 `fec3b9b611e90e2700864c9ba18caccdeffee560ddf2fd6b6cbf733dec87f317`；另外实际独立 Pi 技术案卷 **查询42 Check、再次办理44 Check、撤回39 Check**，五种主动作均有真实 pending-only Run。所有52条原始规则和7项叙述责任至少在一个可运行条件分支中得到覆盖。
- 正/反例：多目标Check/证据隔离、互斥主动作、条件缺项、来源版本陈旧、对象重复均 fail-closed；unknown 条件不得写 compliant/not-applicable；有来源的证据仅覆盖精确 Subject+支持事实+当前文档版本。

## 3. 按问题类型分层（不要误记为引擎失败）

| 类别 | 实测/保留结论 | 是否阻止有界技术集成 |
|---|---|---|
| ENGINE | COMMON-01/02 generic-object 与条件编译及 Pi 工具回执工作；**没有在 G08 用例中确认新增引擎缺陷**；任意复杂Claim图仍不在已支持范围 | 否 |
| AUTHORING | T02 57、T03 59项包含非编号不变量均有完整 sourceBinding、模块版本与来源；更复杂的跨文书真值仍按SEMANTIC/HUMAN_ONLY | 否 |
| SOURCE / POLICY | 成理非卡普通失物领回、代理及保管部门具体规则，校领导/学院信箱自动二次流转授权仍待现行官方证实；山东R31不得迁入本校默认硬门槛 | **POLICY_HOLD**，阻止正式制度执行 |
| EXTERNAL / AUTHORITY | 无真实校方库存、原工单、OA、具名批复和签收系统授权；不得自动放货、创建二次工单、撤回或声称已经回复/办结 | 阻止正式行政动作 |
| TEST | 实际 D1/D3/D2/Pi 合成技术全主动作已测；在线模型理解准确率、隐藏Gold复核、生产账号与实地授权未运行。旧正式 E `NEEDS_REWORK` 仍有效 | 不阻止候选集成，不授权发布 |

## 4. 操作与独立重跑

```bash
export PROFER_CONFIG_DIR="$(mktemp -d)"
bun install --frozen-lockfile
bun run typecheck
bun run check:boundaries
bun test --isolate --timeout 60000 apps/electron/src/main/lib/review/review-d4-g08-templates.test.ts
```

各模板含完整作者态`workspace.json`、`source-catalog.json`、`conversion-ledger.json`、`business-contract.json`、`synthetic-selection.json`、`synthetic-case.json`、`manifest.json`。实际Pi与Plan机器JSON在固定HEAD的Actions artifact中；`runtime-evidence-index.json`锁定指纹与运行入口。

**本轮没有签独立E/Gold、没有合法公章/官方制度授权、没有在线模型的业务正确率，也没有对其他领域作变更。**
