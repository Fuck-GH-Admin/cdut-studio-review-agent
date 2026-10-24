---
path: apps/electron/src/main/lib/review/review-strict-pi-tools.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 83d6ddf165d3547c81804708253c68e528ecdd9c
sha256: 86fe8a0c9ab9a1cb172ff2ce3ac0ab3fb06c04bc1eb992736e637f51f11d0adc
lines: 147
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-strict-pi-tools.ts

## 1. 结论与边界

已指派直接 Pi 案卷复核的**最小工具准入边界**（头注 :1-5）：复用既有直接审核工具与本地文件预览渲染器；不暴露任意 MCP/文件路径/通用聊天。含 `review_inspect_original` 案卷级原件视觉核验（只收 documentVersionId 不收路径）。

边界：指派/绑定语义在 `pi-case-review-service`；渲染在 `agent-preview-tools`。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `isAuthorizedDirectReviewTool` | fn | 55-62 | host 权限门（白名单+绑定核验） |
| `selectDirectReviewStrictTools` | fn | 86-146 | 选 3 直接操作 + 注入 `review_inspect_original` |

内部：`DIRECT_OPS`（:17-21，3 个直接操作）、`errorResult`（:24-30）、`verifyCurrentBinding`（:32-39）、`STRICT_RUNTIME_TOOL_NAMES`（:41-45，5 名单）、`caseRoot`（:64-67）、`originalForCurrentBinding`（:69-82）。

## 3. 内部逻辑与关键流程

1. **`verifyCurrentBinding`**（:32-39）：会话绑定（caseId/runId/assignmentId）变化 → throw `审核指派已经变化，本次原件读取已取消`。
2. **`isAuthorizedDirectReviewTool`**（:55-62）：仅 5 名单（3 直接操作+`review_inspect_original`+`CompactContext`）且绑定核验过 → true。
3. **`originalForCurrentBinding`**（:69-82）：绑定核验→聚合找 active 文档（无 assetPath → `材料版本不存在、未激活或原件路径缺失`）→ `realpathSync`+`relative` 越界拒（`原件不在当前案卷授权目录内`）→ 必须普通文件。
4. **`selectDirectReviewStrictTools`**（:86-146）：3 直接操作必须**恰好各 1 个**否则 `审核工具清单异常：{name} ({n})`（:88-92，注释 :84-85 拒绝缺失/重复）；构造 `review_inspect_original`（参数 documentVersionId+scope/page，:94-110）：参数校验（scope 合法/页码≥1 且仅 scope=page，:102-107）→ 解析真实路径 → 注入 `inspectOriginal`（默认 `executeAgentPreviewTool`，测试可替）→ **await 后重查绑定**（注释 :120-121 防过期回合写回执到后续 run）→ 有视觉图才 `recordPiReviewPreviewByPath` 记回执（:126-131）；异常 → `errorResult`（不抛）。

## 4. 调用者与调用链

入向（生产）：`agent-orchestrator.ts:184`（isAuthorizedDirectReviewTool/selectDirectReviewStrictTools，host 权限门）。测试：`review-strict-profile.p02.probe.test.ts:16`。出向：`../agent-preview-tools`（:8）、`../config-paths`（:9）、`./case-store-v2`（:10）、`./pi-case-review-service`（:11-14）、`./review-storage-id`（:15）、`typebox`（:6）。

## 5. 数据 I/O、读写与副作用

读原件（经 preview 渲染器）；`recordPiReviewPreviewByPath` 写 V2 阅读回执；无网络。

## 6. 分支、失败、取消与恢复

参数/路径/绑定错误均 `errorResult`（isError）；绑定在 await 后重查（:120）；无重试/取消（外部 signal 未接）。

## 7. 权限与权威状态

- 工具权威：白名单 5 名单（:41-45）；3 直接操作恰好一份（:88-92）；其他 builtin/MCP 全丢（注释 :82-83）。
- 案卷域权威：只收 documentVersionId（description :100「不接收文件系统路径」）；realpath 越界拒（:75-77）；绑定变化即拒（:32-39/:120）。
- 回执权威：仅真实视觉渲染后记回执（:126-131）；「视觉预览不自动生成可引用的文字出处」（:100）。
- 无 sender/role 检查（host 门在 agent-orchestrator）。

## 8. 修改影响面

`agent-orchestrator` 权限门与 Pi 直接复核工具面；`review_inspect_original` 参数契约被 Pi profile 消费。同测：`review-strict-profile.p02.probe.test.ts`（14 用例，多断言本文件）。

## 9. 测试证据

直接测试 `review-strict-profile.p02.probe.test.ts`（14 用例 / 3 describe；真聚合/真 `registerMaterial`/真 artifact 回执；渲染器可注入 stub；NOT_RUN）要点（与本文件相关）：
- `:120-133` host 权限 5 名单 true、8 种禁止 false、绑定更新后旧 binding false/新 true。
- `:135-152` `selectDirectReviewStrictTools` 只留 3+1；重复/缺失 → `审核工具清单异常`。
- `:154-180` inspect_original：忽略入参 `filePath:'/tmp/evil'`（真实路径含 caseId、不含 /tmp/evil）、roots 限案卷目录、回执记录 `fullyPreviewedDocumentVersionIds`；跨案/缺失 id/页码 0 全 isError 且渲染不二次触发。
- `:182-215` await 中换指派 → isError 且新 run 无回执（stale turn 防御）。
- `:217-235` `inspectPreview` 授权：案卷资产可渲染、案卷外拒。

未覆盖：`isAuthorizedDirectReviewTool` 绑定 throw 分支的独立断言（经用例 1）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出/内部符号行号如 §2 | 已证实 | 逐条 |
| 白名单/恰好一份/越界拒/stale 防御 | 已证实 | :32-92/:75-77/:120 + 测试 |
| 回执只记真实视觉渲染 | 已证实 | :126-131 + 测试 :154-180 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `isAuthorizedDirectReviewTool` | §3.2/§9 | 55-62 | covered |
| `selectDirectReviewStrictTools` 构造/守卫 | §3.3-3.4/§9 | 86-146 | covered |
| `originalForCurrentBinding` 越界拒 | §3.3 | 69-82 | covered |
