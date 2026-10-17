# G01-I A′ 迁移与技术运行接口（R1 候选）

## 1. 从旧 A #81 迁移，不修改原件
旧 A 49 条检查仍然全部在旧只读工件，原先 `0 targets / 0 subjects` 的输出不可当作业务已运行。A′ 在**自己的修订**里复制原 D1 workspace，逐项审查 49 个 sourceBinding 的作用范围、field、intent、policy、stage；本 R1 不自动为每条责任猜测字段适用性，不重写 frozen A。未映射部分会 fail-closed。

D1 模板仍用 `ReviewAuthoringWorkspaceV1`（schemaVersion=1），各模板 `sourceBindings` 中对准确 `checkId` 加受控字段元数据。例如：

```json
{
  "checkId": "g01-student-identity-correction@1:module/legal-name-change/verify-identity",
  "sourceIds": ["synthetic-test-source"],
  "studentScope": {
    "fieldKeys": ["full-name"],
    "intents": ["correction"],
    "enrollmentStatuses": ["enrolled"]
  },
  "gate": {
    "when": {"kind":"trusted-registry-field","fieldKey":"enrollment-status","equals":"enrolled"},
    "material": {
      "provider": "applicant",
      "dueStages": ["reviewing"],
      "alternatives": ["d2:student:full-name:legal-document"]
    }
  }
}
```

这只是一段**示意性合成配置**，不是对 A #81 中存在该 checkId/sourceId 的声明，不能直接复制到 A 后不校验。真实字段名、责任编号、13 条分支组合须 A′ 依据原 MD 和冻结 source catalog 独立映射。真正整案级责任必须在同一个 sourceBinding 显式 `caseScopeJustification`，例如“校规有效性待核、全案不可直接批准”，且不能与 `studentScope` 同时填写。缺少二者时 typed 模式报 `D2_STUDENT_UNSCOPED_CHECK`。

## 2. 一次模拟学籍更正的对象选择
单案两个字段、同一个学生，但分别独立 Subject：

```json
{
  "templateId":"g01-student-identity-correction",
  "version":1,
  "scenarios":["legal-name-change","credential-correction"],
  "targets":[
    {"kind":"student-field","objectKey":"synthetic-student/full-name","subjectId":"student-name-check","title":"姓名字段更正","studentId":"synthetic-student","fieldKey":"full-name","intent":"correction"},
    {"kind":"student-field","objectKey":"synthetic-student/credential-id","subjectId":"student-credential-check","title":"证件号字段更正","studentId":"synthetic-student","fieldKey":"credential-id","intent":"correction"}
  ]
}
```

`scenarios` 中的每个 ID **必须已经由该模板作者态的 `template.scenarios` 定义**；仅声明数组绝不自动创造分支。与旧校园卡只选 `scenario` 且必须具有 `scenarioObjectKey` 严格区分。合成字段使用文字标识，禁止填真实证件号。

## 3. 单独受控的合成事实源
```json
{
  "schemaVersion":1,
  "sourceKind":"controlled-synthetic",
  "studentId":"synthetic-student",
  "sourceId":"fixture-registry",
  "snapshotVersionId":"registry-v1",
  "status":"current",
  "enrollmentStatus":"enrolled",
  "fields":{"enrollment-status":"enrolled","full-name":"SYNTHETIC_OLD"}
}
```

该 JSON 在 CLI 中**不读入 `caseFields`**，须由测试者用不同于上传申请的本地受控文件显式注入；只供此轮合成预审，不能因 `sourceKind` 字符串就视为经过学校 API 认证。真实校方来源需要后续另加经鉴权、可撤销、可审计的可信接口。

## 4. 可重算 CLI（从仓库根目录执行）
所有命令使用相同锁定代码 SHA，且所有写操作使用独立 `PROFER_CONFIG_DIR`。示例路径属于实验者新建的工作目录，不指向旧 A/B/C：

```bash
export PROFER_CONFIG_DIR="$(mktemp -d)"
export D2_ALLOW_SYNTHETIC_REGISTRY=1
export D2_SYNTHETIC_TRUSTED_FIXTURE_PATH="$PWD/synthetic-registry.json"

bun install --frozen-lockfile
bun apps/electron/scripts/review-authoring-v1.ts validate work.json
bun apps/electron/scripts/review-authoring-v1.ts save work.json 0 r1-agent
bun apps/electron/scripts/review-authoring-v1.ts read my-workspace
bun apps/electron/scripts/review-authoring-v1.ts diff work.json revised-work.json
bun apps/electron/scripts/review-d3-library.ts export work.json bundle.json
bun apps/electron/scripts/review-d3-library.ts import bundle.json imported.json
bun apps/electron/scripts/review-d2-plan.ts preview imported.json selection.json synthetic-case.json
bun apps/electron/scripts/review-d2-plan.ts register imported.json selection.json
bun apps/electron/scripts/review-d2-plan.ts create imported.json selection.json r1-synthetic-case "合成技术预审" reviewer
```

必须以真正存在于 work.json 的 `workspaceId` 替换 `my-workspace`；`save` 的预期修订号为首次保存 0，而导入工作区的 `revision` 通常为 1。导出/导入文件必须尚不存在（禁止覆盖）。R1 自己的 `review-d3-r1-student.test.ts` 实际用不同临时目录构造这些输入并依次运行 CLI，CI 日志有 `[R1_CLI_EVIDENCE]` 的摘要。命令不执行在线模型。

不允许通过设置 `D2_SYNTHETIC_TRUSTED_FIXTURE_PATH` 而省略 `D2_ALLOW_SYNTHETIC_REGISTRY=1`；报 `D2_TRUSTED_SOURCE_DISABLED`。旧 `caseFields` 自述仅属申请输入，即使与可信快照文字相同也不会升格。

## 5. 多事实证据链（受限合同）
用现有案卷接口 `registerMaterial` 登记真实文档版本，之后通过 `setEvidenceLink` 对每个目标单独记录 `(documentVersionId, subjectId, supportsFact, linkedBy='user')`：
- 同一个 `doc-v1` 可产生两条确认关联：`student-name-check ↔ d2:student:full-name:legal-document` 和 `student-credential-check ↔ d2:student:credential-id:legal-document`。
- 第三件事实、不同 Subject、不同 documentVersionId 都不会继承任一已确认关联。换版后必须重新验证对应链。
- `confirmed` 仅指审核员确认事实关联的技术操作，**不是签发机关真伪认证、法定效力或有权学籍部门决定**。

## 6. 向后兼容与携包失败
旧 D3-R0 纯文字/校园卡/档案对象保持 schemaVersion=1；student-field 技术计划使用 schemaVersion=2 和新的完整 fingerprint。已有旧版无学生对象的工作区可以按原 CLI 操作，但旧 A 的 49 项 case 计划**绝不自动迁移/标为成功**。针对学生申请，必须由 A′ 正式配置 studentScope 和字段目标，再重新 D2 建案。未知高级 `advanced.*` 原样 `D2_UNMAPPED_ADVANCED`，不可静默丢弃。D3 携包仍使用既有 `ReviewD3TransferBundle.schemaVersion=1`，内容摘要会覆盖新增的作者态 sourceBinding 元数据。
