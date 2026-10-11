# 35｜D3-MD-Q1 动态作者态与结构化执行门禁实现记录（2026-10-11）

> 当前工作分支：[Draft PR #18](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/18)，基于 D3 开发 SHA `6747de44b1d8b6dcf673750ced96ce2edb1cbfdd`。**实施结果仅允许受控技术预审，永不自动产生校规权威/行政决定。** A/B 两个独立原始验收分支不变；原始私有 MD 未纳入 Git 仓库。

## 1. 本轮落实的核心公共能力

**动态作者实例化**：`apps/electron/src/main/lib/review/review-d3-dynamic-case.ts` 暴露 `instantiateD3ArchiveCaseV1(base, request)`。

- 输入一个已有 D1/D3 工作区的**模块定义**及明确的档案件/操作业务树，生成独立 `workspace.json`、`selection.json`。替换固定模板的 item/operation uses，保留案卷级身份、关系、材料和流程的 uses。每个新 uses 都有可追溯 SourceBinding，保留来源集合/校规权威等级和原始模块定义/冻结锁。
- 相同档案件内的同类操作以额外 `operationId` 区分（`item/operation/operationId`），D2 target、subject、RuleSpec 与计划指纹全部绑定到精确对象，不共享本不属于自己的证据链。
- `view`→`read`、`borrow_original`→`borrow` 显式规范化且生成记录；`certified_copy` 未有同语义执行支持，明确抛出 `D3_UNSUPPORTED_OPERATION`，**不得当作普通 copy**。重复 key、来源变体集合不一致、悬空模块、未声明 gate、冻结资产冲突一律报错。
- 作者可用 `gateAssignments` 精确指定某模块某原子任务在 item/operation 上的结构化约束，无须复制粘贴每个 Check；若指定的条件没有任何匹配 Check、存在重复绑定或与原来源 gate 冲突，直接 fail-closed。
- `apps/electron/scripts/review-d3-dynamic-case.ts` 的 `build` 命令直接为 Agent 生成可用五份产物；并不直接注册正式模板，只有原 `review-d2-plan.ts create` 的隔离技术预审能产生案卷。

**三态条件与合法替代执行**：`apps/electron/src/main/lib/review/review-d2-execution-gates.ts`、D1/D2 数据类型和 Pi 工具提交/核验边界。

- `when` 可声明 `confirmed-observation`、`evidence-any`、`case-stage` 及有限递归 `all/any/not`。求值只产生 `true|false|unknown`。缺失、识别失败、材料未核或冲突都是 `unknown`，不得折叠成 `false` 或 `not-applicable`；未经核实的外校规定仍是 `unverified-policy`。
- `material` 的 `provider` 明确区分 `applicant` 与 `authority`；`dueStages` 是当前系统 `CaseStage` 的精确集合，**不是猜测学校审批时间顺序**。申请人到期前不能判缺件；待馆方盖章不得成为申请人缺件。对于 `provider: authority` 的义务，即使存在审核员确认的文档关联，Pi 仍会拒绝直接输出 `compliant`：当前系统缺少有权部门具名签署的可信审批接口，不能将文档审核误报为正式批准。
- `alternatives` 是明确的 OR 关系，可容纳纸质/电子委托、纸质/电子替代证明。**只有当前运行引用的有效文档版本，已由审核员为当前 D2 具体 Subject 确认对应 `EvidenceLink.supportsFact`，才认为该替代已被证实。** 证据缺失不是合法性不存在。已证实替代时，Pi 拒绝把“没有纸质件”误报为缺件。
- 结构化门禁在 D2 编译时同时进入不可变 `D2RuleBinding.gate` 和 Pi Agent 能读取的 `RuleSpec.requirement` 精确说明；Pi 的 `submitPiReviewResultV2` 在接收语义检查前执行 gate，`verifyD2PiRun` 在已存回执上再次验证 gate。Run input hash/计划指纹包含来源和结构；改写 gate、材料版本、证据绑定都不能直接复用先前判断。
- 原 D1 无条件发布投影若包含结构化 gate 会明确 `D1_UNMAPPABLE_EXECUTION_GATE`，不能把条件丢掉只留一句文本；复杂历史 `advanced.evidenceRelations` 仍执行旧的 `D2_UNMAPPED_ADVANCED` 拒止，**不能用此有限 OR 伪装任意关系图已实现**。

## 2. Agent 使用入口

CLI（Node/Bun 环境）：

```sh
bun apps/electron/scripts/review-d3-dynamic-case.ts build \
  path/to/base-workspace.json \
  path/to/case-request.json \
  /tmp/d3-md-archive-case
```

请求示例（使用已有 `archive-items` / `archive-operations` / `archive-copy` 模块定义；示例名称不是新建真实成都理工校规）：

```json
{
  "caseKey": "synthetic-001",
  "templateId": "g01-archive-utilization",
  "version": 1,
  "items": [
    {
      "itemId": "item-one",
      "title": "合成档案件",
      "operations": [
        {"operationId": "op-one", "operation": "view", "title": "查阅"},
        {"operationId": "op-two", "operation": "copy", "title": "复制两页"}
      ]
    }
  ],
  "modules": {
    "item": "archive-items",
    "operation": "archive-operations",
    "byOperation": {
      "read": ["archive-read"], "copy": ["archive-copy"],
      "excerpt": ["archive-excerpt"], "borrow": ["archive-borrow"]
    }
  },
  "gateAssignments": [
    {
      "moduleId": "archive-operations",
      "taskId": "r09",
      "operation": "copy",
      "gate": {
        "when": {"kind": "case-stage", "stages": ["draft", "submitted", "reviewing"]},
        "material": {
          "provider": "applicant",
          "dueStages": ["submitted", "reviewing"],
          "alternatives": ["d2:delegation:paper", "d2:delegation:electronic"]
        }
      }
    },
    {
      "moduleId": "archive-operations",
      "taskId": "r12",
      "operation": "copy",
      "gate": {
        "when": {"kind": "case-stage", "stages": ["draft", "submitted", "reviewing"]},
        "material": {
          "provider": "applicant",
          "dueStages": ["submitted", "reviewing"],
          "alternatives": ["d2:proof:paper", "d2:proof:electronic"]
        }
      }
    }
  ]
}
```

这些 `gateAssignments` 演示如何在结构上保留 **E03 合法电子委托和 E13 电子证明合理替代**，但仍是**需要真实独立校规核实的作者配置**，不能让 Agent 因收到某份电子文件就自行判定其正式法律效力。正式 Pi 合格回执仍受原 D2 来源权威保护；没有受理学校权威批准时仅能保持待核。

生成 `workspace.json`、`selection.json`、`synthetic-case.json`、`plan.json`、`origin-map.json`。必须保留 `origin-map.json` 并核验变体，不能只搬运 plan 而丢来源或 Business Check ID。

## 3. 已经放入 CI 的验收

`.github/workflows/review-d3-md-dynamic.yml` 在新 runner 中固定读取：

- 独立作者 A：`f8d95c4f7fe995ee55cbdfe15f16e95f514c0333`
- 独立金标 B：`fbf0ee1e072f790e1d7957cfef80d869d6b5aa91`

业务输入仅使用 B 的 `tests/cases/archive-cases.json`，**绝不向模型/运行材料注入 `tests/expected`**。全部 30 案均须明确处理：其中 28 个已知 D2 可支持的操作类型，真实 D1 校验、D2 编译、技术建案、合成文件注册与 Pi `awaiting-confirmation` 检查回执；2 个 `certified_copy` 明确 `TOOLING-BLOCKED`。每个真实技术 Run、plan fingerprint、业务目标、Run ID 和拒止原因均写入 CI artifact。

另有规则库、证据替代、阶段门禁、来源防串用、D3 携包重导入、包指纹篡改、CLI 一键生成及原 D1/D2/D3 回归。针对 B Q05/Q30，还额外用一套第三方显式提供的专有 R24 模块完成独立操作目标编译与人工权威门禁验证；**它不是 A 已交付的原始模板，也不意味着已取得签章权限**。电子替代采用独立标记的合成演示源，不声明已获得学校有权部门签批。

**注意评价维度：28 次 pending-only 的 Pi 技术运行不是 28/30 个业务金标 PASS。** B 的独立预期还需在真实模型/审核过程做盲测，实际语义成绩仍 `NOT-RUN`。不能把此次技术通过作为上线或签收依据。

## 4. 当前尚存缺口及不能冒充已完成的事项

- **`certified_copy` 及正式档案证明出具**涉及专门行政权威，不是 `copy` 同义词。本轮显式拒止和记录，正式授权/签章流程仍需业务所有者确认和独立设计。
- **通用角色关系图、双委托、权威批准时点、案件多路分流、全部素材的实际语义真实性**，不是有限 `D2ExecutionGateV1` 可全部证明的能力。多主体仅做到精确对象与证据绑定；通用角色冲突仍需专门图结构。
- `CaseStage` 与原 MD 里的 `submission/decision/post_decision` 不是天然一一对应。**正式校本规则没有核实前不可推断二者的转换**；当前 `dueStages` 用现有技术阶段精确匹配。
- 本轮不新增校本“已核准”状态；原 A 来源权威 56 个 `unverified-policy` Check 在运行中继续只能 `awaiting-confirmation`。
- B 的 103 项责任追溯及电子替代覆盖可能通过执行约束补强，但**103 条真实业务完成率/30 案模型准确率仍需统一交叉盲测**。
- 不修改 A/B/审计原始快照，不合并 Draft #9/#15/#16/#17/#18，不进入正式 D5 发布。

## 5. 下一处工程收口要求

先按 CI 结果关闭 D3/D2/Pi 中能被实证复现的错误；将本次作者侧组合入口纳入 D4 五套真实模板的制作协议，让每个模板自带声明式 `modules` 和可核的 gateAssignments；其余通用角色关系、官方审批和真实模型语义验收仍按独立门禁阻断。只有真正的 B 独立业务金标及学校权威来源核验到位，才能谈正式验收。
