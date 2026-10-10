# D3 W2｜B01/B02 跨业务复用与可移交制作演示（技术预审）

> 阶段报告（2026-10-11）；以 GitHub PR #9 的**最新 HEAD**及当轮 CI 结果为准。合成样例只检验 D3 模块/作者态/D2 作用范围，不是本校生效制度、在线大模型准确率或正式审批。

## 1. 已落地的可复跑资料

| 路径 | 含义 |
| --- | --- |
| `docs/design/review-agent/fixtures/d3-b01-delegation-scope.json` | B01 局部代办授权：代理人×当事人×指定事项/操作×时效；同源自 D2 合成代理权限模块 |
| `docs/design/review-agent/fixtures/d3-b02-evidence-coverage.json` | B02 待证事实与真实材料出处、版本、待核范围，不给出资格/批准 |
| `docs/design/review-agent/fixtures/d3-b01-b02-example-ids.json` | 合成样例 ID 索引：**只作为复现定位，不是已通过金标证明** |
| `docs/design/review-agent/fixtures/d3-gap-evidence-alternatives.json` | 无法执行合法替代证据 Claim 关系时的 `tooling-blocked` 输入 |
| `apps/electron/src/main/lib/review/review-d3-handoff.test.ts` | 两独立 A/C 工作区、两种冻结模块、多分支、逐操作、来源差异、干净导入再编译 |
| `apps/electron/scripts/review-d3-handoff-demo.ts` | **真实可运行**的一键隔离样例生成器；出 workspace、bundle、D2 任务包、冻结索引及摘要报告 |
| `apps/electron/src/main/lib/review/review-d3-handoff-cli.test.ts` | 真实子进程运行生成器，然后调用已有 D2 Agent CLI 校验生成物指纹 |

业务判断仍由原五份完整 MD 和校本来源规定决定。B01/B02 当前只为局部能力试验，**不等于 A/C 业务模板本身已经制作或验收通过**。

## 2. 从干净环境运行（复制即用）

在已安装依赖的项目根目录，使用仅用于测试的新路径：

```bash
# 不传 PROFER_CONFIG_DIR 将拒绝执行。不要选择个人真实配置目录。
export PROFER_CONFIG_DIR=/tmp/d3-w2-review-lab
bun apps/electron/scripts/review-d3-handoff-demo.ts /tmp/d3-w2-output

# 重现两个独立工作区的 source/ModuleUse 与本轮所有展开责任
cat /tmp/d3-w2-output/frozen-index.json
cat /tmp/d3-w2-output/campus-family-plan.json
cat /tmp/d3-w2-output/campus-temporary-plan.json
cat /tmp/d3-w2-output/archive-operations-plan.json
cat /tmp/d3-w2-output/handoff-report.json

# 人工或另一个 Agent 可重新调用旧 D3 CLI 对冻结资产逐项 inspect
bun apps/electron/scripts/review-d3-library.ts discover authorization
bun apps/electron/scripts/review-d3-library.ts inspect agent-authorization 1

# 专项 + 全库门禁（本次 PR 的实际 CI 运行记录才能算验收）
bun test --isolate --timeout 30000 apps/electron/src/main/lib/review/review-d3-handoff.test.ts
bun test --isolate --timeout 30000 apps/electron/src/main/lib/review/review-d3-handoff-cli.test.ts
bun run typecheck
```

输出的 `campus-workspace.json` / `archive-workspace.json` 是带明确共享锁、每项来源绑定的 D1 作者态；`*-bundle.json` 是携带完整冻结内容/依赖及整体摘要的非发布包；`*-plan.json` 是实际 D2 编译器产物，不是模型模拟写出来的结果。导入使用输出目录中的 `isolated-campus` 和 `isolated-archive` 两个全新隔离注册表。

**注意：** 生成器只编译技术预审任务，不调用线上模型，也不操作学校权限。想复核 Pi 真正的回执、SourceRef、逐操作证据时，应继续执行已有 `review-d2-runtime.test.ts`，并在实际模型可用的环境中另外开展模型金标盲测。

## 3. 复用与明确拒用结论

- **B01 可以局部复用**：C 仅针对当前选定 family/temporary-service 申请主体核对代办授权；A 必须把 `item-1/read` 和 `item-1/copy` 分成独立主体。不能因为查阅被授权，假定复制也被授权。
- **B02 可以复用材料定位/待核说明**：C family 的家属关系凭证与 A 的档案查阅事实可以使用同一局部核对说明，必须绑定不同 `matter` 和 `sourceBinding`。它本身**不具备**判断法定材料替代关系和学校资格的权限。
- **不共享**：家属卡/临时服务人员资格、档案开放与馆藏限制、可否复制、档案保管期限、用印/政审有权签批等。这些由相应完整业务模板的本地责任与未核制度处理。
- **制度适用不能传递**：C 的代理材料合成请求可以对应 `request-scope`；A 相同 B01 引用在本试验中故意绑定 `policy-candidate / unknown`，其运行义务只能得到 `unverified-policy`，不得借共享 B01 变成校方强制合规结论。
- **不能表达时阻断**：把带权威条件的替代证据图写到 `advanced.evidenceRelations`，编译器按 `D2_UNMAPPED_ADVANCED` 拒止；`report-gap` 返回原文定位、责任、受阻操作、归因和复现方法。不删掉约束假称完成。

## 4. 按第 23 号验收契约的真实进度口径

| 验收编号 | 当前可用的证据 / 尚未完成 |
| --- | --- |
| D3-01 | 有简单文本工作区与 D1/D2 简单规则合成测试；另一个陌生 Agent 从零制作尚未独立录屏/记录 |
| D3-02 / 03 / 04 | 冻结、不可覆写、摘要/依赖锁、跨工作区来源及 B01/B02 C/A 组合有自动化测试；还需完整金标对照 |
| D3-05 | 受控升级、影响分析、历史不漂移有测试；当前 W2 使用新制工作区，不自动迁移已有业务 |
| D3-06 | D2 原有真实 Pi 结构化回执回归覆盖 C/A；W2 额外覆盖“同一冻结模块”下的 D2 规则编译，**未声称新组合已经在线模型审过材料** |
| D3-07 | 有不能映射高级约束的拒止与 `tooling-blocked`；复杂合法替代不应被当作已实现 |
| D3-08 | 不可信业务原文当作数据的模型层对抗测试尚未独立执行，记为 not-run |
| D3-09 | 两个隔离配置目录离线导入后 D2 指纹必须保持一致，CLI 子进程再编译 |
| D3-10 | 两个不参与开发的陌生 Agent 完整跟做：**not-run**；仅 CLI 子进程不可冒充独立 Agent |
| D3-11 | 以**当次同一 SHA**的 PR 全量 CI、D0.5/D1/D2/D3 专项记录为准；见 PR #9 Actions |
| D3-12 | 缺口票包括原 MD、locator、requirement、operation、owner、reproduce；还需要五会话真实工具反馈检查字段充分性 |

**D3 → D4 尚未签发 Release。** D3-08、D3-10 等缺口未闭合时，不能用“CI 绿色”冒充全部 12 项通过。五个 D4 业务会话暂不应采用未冻结的 W2 HEAD 作为统一制作起点。
