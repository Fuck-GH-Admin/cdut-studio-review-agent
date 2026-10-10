# 29｜D3-10 两名陌生 Agent 独立试用手册（**待执行，不是完成报告**）

> 版本：2026-10-11。依赖 [23 D3 准入契约](23-d3-shared-module-library-and-d4-handoff-contract.md)、[24 D4 工作流](24-d4-five-template-authoring-and-feedback-loop.md)、[28 当前会话迁移快照](28-d3-session-handoff-and-resume-checklist.md)。  
> 运行对象：**两个没有参与 D3 源码实现、上下文相互独立的制作 Agent**。角色 A / B 可以由用户在不同新会话分别分配。当前状态：**D3-10 = not-run**。  
> 基线快照：`d3522a1fb6644a02fddf0130049cb2202f5c7efd` 的五组 CI 已通过；使用时必须先核验 PR #9 的最新 SHA。本手册后续变更不继承旧 CI 结果。

## 0. 共同要求：不得向两个 Agent 泄漏内部解题步骤

验收者给两个 Agent 相同的仓库 URL、PR #9 固定代码 SHA、23/24/26/27 号契约和对应任务，不向他们提供实现者的失败修复历史或预先改好的“完成包”。Agent 自行理解、执行、遇错恢复。

**只允许**：
- 读取 Git 仓库内实际类型/CLI 帮助/设计、使用 GitHub、修改自己的作者态 JSON 及测试文件；
- 使用独立的 Git 工作树、`PROFER_CONFIG_DIR`、输出目录、案卷 ID 和来源文件；
- 使用仓库提供的 D1/D2/D3 命令；必要时读取源码定位问题，但应记录何时必须这样做；
- 从 D4 原业务会话取回对应原始 MD 验证来源，拿不到则标 `source-missing`，**不能按横向摘要自造政策**。

**不允许**：
- 直接改公共模块库源代码“修到能过”再声称 D3 对陌生人好用；缺陷提交主 D3 分支修；
- 模型本人虚构命令运行成功、附件内容、政策来源或 Pi 真实线上审读结果；
- 使用生产 `PROFER_CONFIG_DIR`、学校真实个人数据；替代人工校方审批；
- 把两个独立 CLI 子进程、同一个 Agent 内两轮测试冒充两名陌生 Agent。

验收结论按 `pass / fail / not-run / blocked-by-source` 记录，未实际交付日志及产物不能标通过。

### 预检：两人分别独立操作

在**各自的**工作树中固定统一版本（示例使用分支；验收时应替换为统一已核验 SHA，不允许自动追新）：

```bash
git status --short
git rev-parse HEAD
bun --version
bun install --frozen-lockfile
export PROFER_CONFIG_DIR="$(mktemp -d)"
export D3_OUTPUT_DIR="$(mktemp -d)"
printf 'config=%s\noutput=%s\n' "$PROFER_CONFIG_DIR" "$D3_OUTPUT_DIR"
```

先记下 `git rev-parse HEAD`。必须确保该 SHA 与验收者公布的 Release 候选一致；否则先停下核对，不要混用测试。

## 1. Agent A｜第一次使用：零共享模块的简单文本

**目标**：不用复杂 Claim/Evidence 图，独立完成“制作工作区→保存一个修订→预览完整责任→技术候选建案→携包导出与干净导入”，并判断该流程是否存在隐藏步骤。

仓库里有三份可运行**合成输入**：
- `docs/design/review-agent/fixtures/d3-minimal-workspace.json`
- `docs/design/review-agent/fixtures/d3-minimal-selection.json`
- `docs/design/review-agent/fixtures/d3-minimal-case.json`

建议命令（在仓库根目录）：

```bash
WS=docs/design/review-agent/fixtures/d3-minimal-workspace.json
SEL=docs/design/review-agent/fixtures/d3-minimal-selection.json
CASE=docs/design/review-agent/fixtures/d3-minimal-case.json

bun apps/electron/scripts/review-d3-library.ts validate "$WS"
bun apps/electron/scripts/review-d2-plan.ts preview "$WS" "$SEL" "$CASE"

# 第一个真实作者态修订：输入 revision=1，expectedRevision=0。
bun apps/electron/scripts/review-authoring-v1.ts save "$WS" 0 independent-agent-A
bun apps/electron/scripts/review-authoring-v1.ts read d3-plain-text-starter

# 正式发布禁止；这两个命令只创建技术候选与技术审核案卷
bun apps/electron/scripts/review-d2-plan.ts register "$WS" "$SEL"
bun apps/electron/scripts/review-d2-plan.ts create "$WS" "$SEL" d3-agent-a-case "Agent A 合成文本预审" agent-a

# 导出携包，并在全新配置目录再次导入
bun apps/electron/scripts/review-d3-library.ts export "$WS" "$D3_OUTPUT_DIR/plain-bundle.json"
export A_ORIGINAL_CONFIG_DIR="$PROFER_CONFIG_DIR"
export PROFER_CONFIG_DIR="$(mktemp -d)"
bun apps/electron/scripts/review-d3-library.ts import "$D3_OUTPUT_DIR/plain-bundle.json" "$D3_OUTPUT_DIR/plain-reimported.json"
bun apps/electron/scripts/review-d2-plan.ts preview "$D3_OUTPUT_DIR/plain-reimported.json" "$SEL" "$CASE"
```

**在复制样例以外再做一件真实制作工作**：在自己的输出目录创建一份修改后的完整 workspace JSON，合理变更一条 `localTasks` 自然语言审核要求，保留 sourceBinding 并将 `revision` 增加为 2。对新 JSON 执行 D1 `validate/diff/save <new.json> 1 independent-agent-A`，读取新修订；重编译 D2 计划，解释哪些检查改变、哪些不变。如果必须手工猜测隐藏 ID 或绕过历史存储，记录并报告。

**通过证据**：最简任务的完整 check/rule/source 清单、前后 revision/digest、输入与预览摘要、候选不具备发布资格、导入后指纹一致、实际命令及退出码、错误恢复/使用成本。**仅照抄命令运行成功不等于从零制作通过**。

## 2. Agent B｜A/C 双业务与显式升级

**目标**：不知道内部实现也能共享同一模块的局部责任，避免把授权适用范围串用到另一业务；在新旧共享版本间**显式升级**并看到对消费者的影响；遇到不支持的合法替代证据应输出问题票而非删掉义务。

命令起点：

```bash
bun apps/electron/scripts/review-d3-handoff-demo.ts "$D3_OUTPUT_DIR"

cat "$D3_OUTPUT_DIR/frozen-index.json"
cat "$D3_OUTPUT_DIR/campus-family-plan.json"
cat "$D3_OUTPUT_DIR/campus-temporary-plan.json"
cat "$D3_OUTPUT_DIR/archive-operations-plan.json"
cat "$D3_OUTPUT_DIR/handoff-report.json"

bun apps/electron/scripts/review-d3-library.ts discover authorization
bun apps/electron/scripts/review-d3-library.ts inspect agent-authorization 1
bun apps/electron/scripts/review-d3-library.ts validate "$D3_OUTPUT_DIR/archive-workspace.json"

# 预设的非法证据替代结构必须提供来源定位与受影响责任，不可伪装为成功
bun apps/electron/scripts/review-d3-library.ts report-gap docs/design/review-agent/fixtures/d3-gap-evidence-alternatives.json
```

随后**由 B 自己制作**：
1. 读取 B01 `fixtures/d3-b01-delegation-scope.json`，在自己的输出目录复制为新模块并将 `version` 提升到 2；只做明确的局部语义变更，保持“代理≠校方审批”的限制。用实际 `freeze <new-module.json> <examples.json>` 冻结新版，再以 `inspect` 核对旧/新摘要。
2. 尝试 `impact agent-authorization 1 2`，比较受影响的**已保存 D1 工作区**。**注意**：W2 生成器输出的 `archive-workspace.json` 不自动登记完整 D1 revision 历史；`impact` 仅扫描已经通过 D1 save 持久化的消费者，若扫描返回空不得宣称系统漏掉未保存草稿。记录如何将工作区合法登记到 D1 追加修订链的步骤与摩擦，不可通过篡改 revision 数字跳过校验。
3. 使用 `upgrade <workspace.json> <upgrade-request.json>` 执行一个模板实例的显式引用迁移，先故意提交缺失 `acknowledgeRemovedCheckIds` 的请求，验证删除审核责任时是否拒止；再填写真正删除的检查 ID，生成新工作区并通过 D1 保存/预览。不能为了得到成功而编造原 MD 缺失的义务。
4. 对比旧版/新版 RuleSpec 分母、实例路径、来源绑定以及冻结 SHA；旧案卷和未迁移的模板应保持旧版。
5. 主动尝试用档案 read 的证据推出 copy 的合格结论：该结果必须被 D2 Pi 服务拒绝或只能待确认，不得只通过更改提示词来修。

**特别提醒 B**：代码审计发现 `review-d3-library.ts` 的 `impact` 数字参数正则疑似多重转义；现有合成测试覆盖底层 `inspectD3UpgradeImpact`，但还缺直通 CLI 的版本参数测试。应**先实际执行、记录失败日志**；若确认失败，出具 D3 工具缺陷，不要自己改公共脚本后当作工具验收通过。第 28 号交接要求先将此问题在主 D3 分支修正并重新验收，然后由 B 使用冻结新 SHA 复试。

**通过证据**：共享 B01/B02 的两组 `ModuleUse`、授权与证据边界、A/C 的独立 sourceBinding、旧新版锁、差异/消费者列表、删除责任签收、D2 运行计划、跨操作反例及 `report-gap` 票据；必要时提交 `tooling-blocked`，不能凭“升级接口存在”标为通过。

## 3. 两人的统一输出结构（路径自由，但字段必须齐全）

```text
acceptance/
  agent-A-or-B/
    README.md                 # 独立身份、用途、初始 SHA、环境、结论
    run-log.md                # 每条命令、输入路径、退出码、完整 stderr 定位
    source-map.md             # 业务来源、限制、共享/不共享理由
    workspaces/              # D1 作者态 JSON、revision 变化
    module-locks.json         # 实际固定模块 ID + version + digest
    bundles/                  # 导出 JSON、干净目录导入验证
    plans/                    # D2 展开责任、Rule/Check/Source/对象
    tests/                    # 样本与独立预期，反例/未知/材料版本
    gaps/                     # 机器可读 report-gap JSON、错误复现
    verdict.md                # PASS/FAIL/NOT-RUN/SOURCE-BLOCKED + 证据
```

最低验收记录字段：
- `codeSha`、`branch`、`bunVersion`、`configIsolation`、`sourceMdOrSyntheticFixture`；
- `commands[]`：准确命令、退出码、输出 JSON/日志定位，不能只写“运行成功”；
- `frozenLocks[]`、`workspaceRevisions[]`、`templateAndScenario`、`effectiveTaskCount`；
- `errorsAndRecoveries[]`：卡在哪里、如何排障、是否需要查看维护者私有知识；
- `unmappedObligations[]`：不可支持/未知制度等的原始责任位置与失败原因；
- `verdict`：`pass/fail/not-run/blocked-by-source` 和原因、验收者签署；
- 如涉及 Pi：`syntheticToolReceipt` 与 `onlineModelRun` 明确分开，`onlineModelRun` 若未执行写 `not-run`。

## 4. 统一验收者如何裁定 D3-10 以及是否能交 D4

两名 Agent 完成后，统一验收者**在第三个隔离环境**：
1. 检查他们是否确实互相独立、没有偷用开发者的本地配置或口头补丁；
2. 按其日志复跑产物并检查 D1 revision 链、模块锁和两个 D2 任务范围；
3. 查明所有 failure 是 CLI UX、D3 数据契约、Pi 运行边界还是制度来源不明，生成受影响责任与复现票；
4. 核对修复后**同一个代码 SHA**的完整 PR CI、D1/D2/D3/旧回归及两人的新测试，不将旧结果拼接为通过；
5. 如果 Agent 需要多次隐藏修补、公共命令不能独立完成、原必核义务被省略，D3-10 应 `fail`，退回 D3 修复并重测；
6. 两人均可独立完成、错误可自诊断且没有未接受的功能阻断项，才能将 D3-10 标记 `pass`；仍需逐条验证 [23 号 D3-01～12](23-d3-shared-module-library-and-d4-handoff-contract.md#7-d3-自验收门槛先交给两个陌生-agent再交给五个业务会话)。

**只有最终冻结 D3 Release SHA、模块锁及所有 12 项验收记录完整，才能按 24 号将工具交给五个原业务会话 I/A/C/S/P 制作 D4 完整模板。** 在此之前不要创建五套“看似完成”的模板或开始 D5。
