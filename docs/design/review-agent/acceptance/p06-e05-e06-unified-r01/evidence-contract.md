# E05 + E06 集中验收｜结构化证据与判定合同

> 本文件是**如何验收和如何写事实**，不是已执行验收数据。无现场证据不能出现 PASS。禁止写入密钥、真实校方账号、学生隐私、私有 Gold 或完整模型原始 transcript 到公共仓。

## 1. 结论词汇与证据等级

- `PASS`：本候选本机真实执行且**该行全部正反断言均满足**；记录实际 exit 0/预期拒止/截图或可信持久账本链接。
- `FAIL`：真实执行发现行为不符、安全门禁被绕开、真实测试 runner 失败、异常导致不一致；附首败证据与准确 exit。
- `NOT-RUN`：没有执行，不许转 PASS，也不能视作 FAIL。
- `BLOCKED_ENV`：设备/磁盘/CDP/测试模型环境不足；`BLOCKED_AUTH`：合法权限/凭据缺失；`BLOCKED_PRODUCT`：必需产品 GUI/API 能力未提供；`BLOCKED_EXTERNAL`：生产中心/Pocket 等外部服务未满足。均不得宣称通过。
- `CORRECT_DENIAL`、`EXECUTION_FAILURE`、`BUSINESS_INCOMPLETE`、`HARNESS_INVALID`、`UNDETERMINED` 是分析分类，**不替代结果状态**。
- 证据级别 `CODE`（静态）→ `CI`（受控测试）→ `ELECTRON`（真 Main/Renderer）→ `PROVIDER`（真模型与工具）→ `BUSINESS`（真实授权动作）→ `EXTERNAL`（外部/跨平台）。高等级不能由低等级自动升级。

## 2. candidate-lock.json（只放脱敏事实）

~~~json
{
  "schemaVersion": 1,
  "campaign": "P06-E05-E06-UNIFIED-r01",
  "source": {
    "repository": "Fuck-GH-Admin/cdut-studio-review-agent",
    "pr": 127,
    "commitSha": "FILL_FROM_ACTUAL_GIT",
    "treeSha": "FILL_FROM_ACTUAL_GIT",
    "basePr": 121,
    "baseSha": "4f8a68e26e5276e61883fa53c21447a703bbf94d",
    "dirty": null
  },
  "ci": [{"workflow": "PR CI", "runUrl": "FILL_WITH_REAL_ACTION_URL", "conclusion": "NOT_VERIFIED"}],
  "build": {"mainSha256": null, "preloadSha256": null, "rendererSha256": null},
  "host": {"os": null, "node": null, "bun": null, "profileAlias": "isolated-01"},
  "runtime": {"mainPid": null, "rendererPid": null, "cdpTargetAlias": null},
  "lockedAt": null
}
~~~

此 JSON **仅示例模板**，字段 `null`/`FILL_*` 禁止直接作为运行结果提交。输出实际 schema 和 sources，尤其 `commitSha` ≠ 现场 App 原生构建 hash 的情况要标 `BLOCKED_ENV`。

## 3. scenario-matrix.json 行模式

~~~json
{
  "schemaVersion": 1,
  "sourceSha": "FILL_FROM_ACTUAL_GIT",
  "rows": [
    {
      "id": "E05-03",
      "scope": "L02-01-E05",
      "status": "NOT-RUN",
      "classification": "UNDETERMINED",
      "assertions": [
        {"id": "final-stale-run-denied", "expected": "reject+zero-write", "actual": null, "pass": null}
      ],
      "evidenceIds": [],
      "actualCommandExitCode": null,
      "firstFailureId": null,
      "blocker": "尚未执行，模板数据不是证据"
    }
  ]
}
~~~

要求所有矩阵 ID 逐条覆盖；无设备不省略 row，写阻断。`PASS` 行任何 `assertions[].pass != true` 或空断言、无证据 ID、无 exit/可信操作回执均视为**无效 PASS**。同一场景不因修复覆盖原 FAIL，保留时间和候选 SHA，补 `retestOf` 新行。

## 4. 附件/命令/业务映射最低约束

**命令**：`commandId`、`argv`（遮掉 token/路径私密段）、`startedAt/endedAt`、真实 `exitCode`、`stdoutPrivateId`、`stderrPrivateId`、公开摘要 `redactedLogPath`、`sha256Raw` 与 `sha256Public`。

**材料与业务**：`caseAlias`、`templateId/version`、`policyLock`、`materialVersionAlias/contentHash`、`runAlias`、`assignmentAlias`、`inputManifestHash`、`sourceRefAlias`、`stageTask`、`actorRole`、`decisionAction`、`batchAlias`、`supplementIdAlias`、`outboxActionAlias`、`before/after revision`；不得上传实际学生身份证号、源文件真实绝对路径、原始 Provider 对话或学校真实签名。

**关键证据图**：真 Electron 截图需同时包含可核对的界面内容和页面状态/测试标记，必须注明源 SHA/PID、拍摄时间、预览材料版本；不能只用截图替代底层 Run/SDK/tool receipt。

**校方权限**：本地应用 `reviewer` 是桌面作用域角色，不等价经过 SchoolPort 验证的教师/校方签名；在不具备校方许可时最终业务审批必须标 `BLOCKED_AUTH`，不能通过伪造 `actorSource=school` 绕过。

## 5. 私有与公开隔离

`raw/private`：完整原始 stdout/stderr、provider 凭据/原始 transcript、独立 Gold、真实文件、授权窗口、原始 profile 快照等，保存在访问受限本机，不上传公开 PR；存每份 SHA-256 和本地保留策略。

`public/redacted`：仅放脱敏场景清单、hash、失败摘要、截断但足够定位的证据索引、无真实个人信息的截图。**不要直接把全部 raw 文件交给自动脱敏脚本就信任它安全；人工/独立 Agent 二次检查**，常见泄漏还包括 channelId、IP/绝对路径、嵌入文档元数据、API 报错含账号。

## 6. 三份必须分开的 verdict

- **E05 verdict**：逐条真实合成业务行为、真 Provider 与授权、A/B/C、原件、故障恢复；不完整则 `PARTIAL/BLOCKED`。
- **E06 verdict**：普通 Pi 四项、Claude/fork/跨窗/平台等；四项成功仍 `PARTIAL`。
- **LIVE delta**：29 号 LIVE-01～08 的证据增量、缺口、阻断建议，**不可改写 29 权威结论**。

收尾至少按 `P06 PARTIAL / E05 LIVE NOT-ADMITTED / E06 LIVE PARTIAL / MERGE NO-GO` 执行保守口径，除非已有完整经过授权签收、且符合 29 的新证据。
