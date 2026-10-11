# 合成待审输入与隔离金标

`cases/archive-cases.json`：28 个虚构申请、档案件、操作、附件和有限的模拟馆方事实。输入只包含业务材料，不包含 gold、应激活规则、错误清单或预期结果。用户名、部门名及所有凭据都是虚构，不具有校方业务效力。

`expected/archive-expectations.json`：独立的原文责任 ID、逐操作预期、禁止误判、原 MD 定位以及适用/不适用责任；不得导入模型或放入材料目录。

### 隔离复跑

1. 在测试环境固定接收学校与**模拟**校规，不要冒充成都理工现行规则；从 cases 中逐案产生 D2 目标。
2. 每件 `archiveItems[*].operations[*]` 创建独立 subject/operation key，保留 `caseId/itemId/operationId` 与范围。
3. 仅把单个 case 的 `application`、`archiveItems`、`evidence`、`officialFacts` 作为虚拟申请/证明输入。外部模拟权威事实须可追到其伪造测试回执，不能当生产系统授权。
4. 对运行中的模板执行真实 D1/D3/D2/Pi 接口，保存实际 Rule/Check/Subject/SourceRef/Run 和错误日志；无法映射的材料/复杂关系单列 TOOLING-BLOCKED。
5. **运行全部结束后**在独立评分阶段读取 expected，对每项激活、状态、对象范围、证据及禁止误判给判定。任何被执行 Check 的 `SourceRef` 不应指向别的档案件/操作或旧材料。
6. 所有案例初始 `runStatus=NOT-RUN`，没有实际模型运行不能把 JSON 中的预期当作 PASS。

Q01–Q28 重点包括本人/代理/单位双授权、查阅与复制/摘录/证明/外借、页码份数与时间、电子委托、人员历史更名、目录公布与开放限制、第三人隐私、外校校规污染、阶段责任、OCR失败、旧证据版本、公开信息最小化和新旧快照。覆盖 R01–R42 **每条至少有一条独立案例关联**；关联不等于实测。
