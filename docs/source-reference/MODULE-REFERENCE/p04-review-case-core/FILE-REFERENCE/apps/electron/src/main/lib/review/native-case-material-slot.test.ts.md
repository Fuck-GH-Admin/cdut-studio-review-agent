---
path: apps/electron/src/main/lib/review/native-case-material-slot.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 61c225d3adb8ac927553a3d48bac74fa70cbaf25
sha256: bad60bd1d2d0f872bd8b23b28ea8d4ac1fe7a563296ac8df36ca5bcf8ee7548d
lines: 51
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/native-case-material-slot.test.ts

## 1. 测试目标

原生案卷“材料槽透传”回归（文件头 `:1`）：模板带 `materialSlots`（`minCount:1, requiredAt:'submission'`）时，登记材料必须能把 `materialSlotId` 传到 V2 文档上，否则提交永远因“缺少必需材料”被拒。被测链路：`registerNativeWorkspaceMaterialV3` 的 `materialSlotId` 透传（`native-workspace-case-v3.ts:401-434`）+ `submitCaseV2` 的必需槽门（`stage-workflow.ts:382-384` → `application-service.collectMissingSubmissionSlots`）。

夹具：`mkdtempSync` 临时目录 + `PROFER_CONFIG_DIR`（`:7-9`）；`saveDraft`/`publishTemplate` 自建 `slot-template@1`（1 个 `plan` 槽、单阶段 `first`/reviewer）；建案显式绑定该模板。本轮 `NOT_RUN`：未执行测试。

## 2. 用例清单

1 个 describe、**1 个 test**（`:20-50`）：

1. **按槽位登记后，带必需槽的模板可提交**：
   - 建 `slot-template`（`materialSlots:[{id:'plan',name:'实验计划',minCount:1,requiredAt:'submission'}]`、`stages:[{id:'first',…}]`）并发布（`:22-29`）。
   - `createNativeWorkspaceCaseV3`（`reviewTemplate:{templateId:'slot-template',version:1}`）（`:31-35`）。
   - 写临时文件 `plan.txt`（`:37-38`）。
   - **不带槽位**登记（`registerNativeWorkspaceMaterialV3(caseId,file,'evidence',undefined,undefined,undefined)`）→ `submitCaseV2` 断言 `rejects.toThrow('缺少必需材料')`（`:41-42`）。
   - **带槽位**登记（第 6 参 `'plan'`）→ `readAggregate` 过滤 active 文档，断言存在 `materialSlotId==='plan'`（`:45-47`）；`submitCaseV2` 断言 `ok===true`（`:48-49`）。

## 3. 真实断言

- 断言“缺槽被拒”的错误文案子串 `'缺少必需材料'`（`stage-workflow.ts:384` 的文案）。
- 断言聚合中真实文档带 `materialSlotId:'plan'`（`:46-47`）。
- 断言 `submitCaseV2` 返回 `ok===true`。
- 同一物理文件登记两次（两份版本：无槽 + 有槽）；未断言第一份的槽位为 undefined（只经提交失败间接体现）。
- 调用形态实证：`registerNativeWorkspaceMaterialV3` 位置参数为 `(caseId, sourcePath, role, actor, authorizeAtCommit, materialSlotId, options)`——测试传 `undefined, undefined` 占位 actor/authorizeAtCommit，第 6 参为槽位（`:41`、`:45`）。

## 4. 未覆盖与脆弱点

**未覆盖**：`requiredAt:'decision'` 的槽（决策时必需，走补件路径）；`minCount>1`；`options.fileName/replacesVersionIds`；槽位与 `workspace-business-service-v2.openWorkspaceSupplementV2` 的 `material-slot:` 分支联动；无模板槽的普通提交；`submitCaseV2` 的其余门（缺必填输入/无材料）。

**脆弱点**：单测试同时承担“透传修复”与“提交门”两个断言面；若 `collectMissingSubmissionSlots` 的语义变化（例如按角色计数），该测试无法定位回归点。同一文件两次登记产生两份 active 版本，与真实“替换”语义不同。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 describe、1 test | 已证实 | `:19`、`:20` |
| `materialSlotId` 经登记透传到 V2 文档 | 已证实 | 测试 `:45-47`；源 `native-workspace-case-v3.ts:423` |
| 缺槽提交被拒、带槽可提交 | 已证实 | 测试 `:42`、`:48-49` |
| 槽位参数顺序（第 6 参） | 已证实 | 测试 `:41/:45` 与源签名 `:401-413` |
| decision 槽/多数量槽行为 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 源分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `materialSlotId` 透传 | #1 | `:45-47` | covered |
| 提交必需槽门 | #1 | `:42`、`:48-49` | covered |
| 无槽登记 | #1 | `:41-42` | covered |
| decision 槽/补件联动 | — | — | unknown |
