---
path: apps/electron/src/main/lib/review/single-case-workspace.e2e.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 81e398a22bf7f3f9c63b4783d376d5c3b13bb2d1
sha256: 2b4b1858a7235da9efe413f5dd21e4c81e24bfc448af90bb3148b9c1e0f74bfb
lines: 301
kind: test
package: p06-review-batch
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/single-case-workspace.e2e.test.ts

## 1. 测试目标

普通审核工作台**单案完整链路 E2E**（describe `:103`）：V1 建卷→规则导入/抽取/确认→申报表抽取事项→V2 投影与提交门控→补件→人工事实更正→复跑合规→事项认定→**整案通过被 readiness 门控安全拒止**→重启恢复。核心验证「额外模板职责未覆盖时拒绝整案通过」（用例名 `:106`）。

## 2. 用例清单

1 describe、1 test（`:106-300`）。mock 边界：**`mock.module('./review-model-gateway', …)`**（`:42-47`）——保留 `realGateway` 其余导出，仅替换 `resolveReviewGatewayChannel`（固定 `gatewayChannel`，baseUrl `http://127.0.0.1:1/v1` 不可达）与 `chatCompletion`/`chatCompletionWithMeta`（`responseFor` 按 system 提示词分流：`constraint`→2 条规则大纲、识别事项→1 条「青禾竞赛」（含真实 block 锚点，`:32-38`）、否则返回可变 `reply`）。动态 `await import` 14 个被测模块（`:49-62`，确保 mock 生效后加载）。夹具：`PROFER_CONFIG_DIR`+`input` 临时目录（`:9-12`）；`runCurrentCase` 用注入式 client（故意误识别 '省级二等奖'，`:87`）。

## 3. 真实断言

- 规则：大纲 constraint kinds `['level-mapping','required-evidence']`（`:117`）；抽取事项 1 条（`:126`）；V2 subjects 含 V1 事项 id（`:130`）。
- 提交门控：按模板为 submission 槽登记合成占位材料（`:136-153`）、按 MANAGER-INTAKE-GATE 普通命令补齐必填字段/必需分项（`:155-190`）后 `submitCaseV2` ok（`:192-193`）——验证真实门控而非绕开。
- 初跑：`plannedChecks>=2`、`effectiveRuleIds` 含 2 条 `outline-ai-`（`:196-197`）；`outline-ai-1` 初判 `non-compliant`（`:199`）；存在 `awaiting-supplement` 检查（`:200`）。
- 补件闭环：open→importDocumentFromPath(获奖证书.txt)→sync→setEvidenceLink ok（`:202-219`）。
- 事实更正：level→'国家级一等奖'（reason 带原识别值，`:223-232`）、declaredScore→8（`:234-243`）均 ok。
- respond/resolve supplement ok（`:246-256`）；补充说明导入后原文档 `usage==='read'`、证据链接 `confirmed`、更正观察存在（`:262-264`）。
- 复跑：`outline-ai-1` 转 `compliant`；`basis.observationIds` 含两条更正 id、`basis.evidenceLinkIds` 长度 1、`sourceRefs` 含证书文档；全检查 `compliant`（`:267-273`）。
- 认定 accepted ok（`:276-281`）。
- **安全拒止**：`decideWorkspaceCaseV2(result:'pass')` → `decision.ok===false`、`decision.code==='DEPENDENCY_UNRESOLVED'`、message 含 `'阻断最终决定'`（`:290-293`；注释 `:287-289`：合成材料仅证明 2 条 V1 规则，额外通用职责未完成，不得为过测关闭 readiness 门控）。
- 重启恢复：`stage!=='decided'`、认定记录保留、无 `pass` 决定（`:296-299`）。

## 4. 未覆盖与脆弱点

mock 边界：`review-model-gateway` 被 `mock.module` 部分替换（网络永不真实发生）；client 注入再模拟模型输出（双层模拟）。未覆盖：真实网关链路、多事项、模板自定义业务、`pass` 成功路径（被门控拒止）、`recordWorkspaceDispositionV2`（本文件不测）。脆弱点：断言绑定内置综测模板的通用审核责任存在（`:287-289` 注释承认）；`responseFor` 匹配提示词文案；模块动态 import 列表与源码 import 结构耦合。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 用例全流程断言行号 | 已证实 | `:106-300` 逐条核对 |
| DEPENDENCY_UNRESOLVED 拒止断言 | 已证实 | `:290-293` |
| mock.module 替换范围 | 已证实 | `:42-47` |
| 运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 链路环节 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| V1 导入/规则/抽取/投影 | §3 | test:107-130 | covered |
| 提交门控（槽+字段+分项） | §3 | test:132-193 | covered |
| 初跑/补件/更正/复跑 | §3 | test:194-273 | covered |
| 认定+安全拒止+恢复 | §3 | test:275-299 | covered |
| 真实网关/pass 成功路径 | §4 | — | unknown（mock/无断言） |
| 实际运行 | §5 | — | unknown（NOT_RUN） |
