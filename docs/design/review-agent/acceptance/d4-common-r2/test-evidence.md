# 固定技术测试证据索引
本轮只接受**GitHub Actions 检出当前 Draft PR HEAD**后日志与 artefact 所记录的退出码为真实 PASS。基线历史 PR #83 的 3618 PASS / 6 SKIP 是历史兼容参照，绝非本分支的自动通过。

必要命令：
```bash
bun install --frozen-lockfile
bun run typecheck
bun run check:boundaries
node apps/electron/scripts/review-d3-r0-verify.cjs
bun test --isolate --timeout 60000 apps/electron/src/main/lib/review/review-d4-common.test.ts
bun test --isolate --timeout 60000 apps/electron/src/main/lib/review/review-d3-r1-student.test.ts
bun test --isolate --timeout 60000 apps/electron/src/main/lib/review/review-d2-runtime.test.ts
bun test --isolate --timeout 30000
```
专项 CI [D4 COMMON-01-02 runtime evidence](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/workflows/review-d4-common.yml)；全仓 [PR CI](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/workflows/ci.yml)。红灯/阻断必须标明，不得记 PASS。

真实 D1→D3→D2 CLI 命令（仓库根目录、空输出路径）：
```bash
export PROFER_CONFIG_DIR="$(mktemp -d)"
EX=docs/design/review-agent/acceptance/d4-common-r2/examples
bun apps/electron/scripts/review-authoring-v1.ts validate "$EX/g03-workspace.json"
bun apps/electron/scripts/review-authoring-v1.ts save "$EX/g03-workspace.json" 0 d4-reviewer
bun apps/electron/scripts/review-authoring-v1.ts read d4-g03-example
bun apps/electron/scripts/review-d3-library.ts export "$EX/g03-workspace.json" "$PROFER_CONFIG_DIR/bundle.json"
bun apps/electron/scripts/review-d3-library.ts import "$PROFER_CONFIG_DIR/bundle.json" "$PROFER_CONFIG_DIR/imported.json"
bun apps/electron/scripts/review-d2-plan.ts preview "$PROFER_CONFIG_DIR/imported.json" "$EX/g03-selection.json" "$EX/g03-case.json"
bun apps/electron/scripts/review-d2-plan.ts register "$PROFER_CONFIG_DIR/imported.json" "$EX/g03-selection.json"
bun apps/electron/scripts/review-d2-plan.ts create "$PROFER_CONFIG_DIR/imported.json" "$EX/g03-selection.json" d4-example-case "合成技术预审" d4-reviewer
```
CLI 演示的 `save` 只写隔离目录。Pi 的服务端 prepare/submit/verify 路径由专项单测调用，**在线 LLM 真实审核不在本轮范围**。

## 实际测得的证据与复现版本（2026-10-17）
验证提交：`f13f7dd4860e37509dd8bf457f8c15e4672af484`，专项运行 [#39047830003](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39047830003)，退出码全为 0。
- D1 save/read/diff → D3 export/import → D2 preview/register/create：2 Subject / 6 Check。
- D2 `planFingerprint`：`6d8c18799b6bfa46c7c76acc401af87d4cb9ba8899a74488c70ef624e9daf095`。
- D3 `transferFingerprint`：`086a6111c8be44e3d11610f39cb1ee99228386f515a00c3337a25d815952f22e`。
- **实际入库示例** 的独立 D2 `fingerprint`：`c7a6bafb2f9c818309b69f03018b1405f03f96823371a322858028ce7bdf9405`，确认为 2 Subject / 6 Check，`publicationAllowed=false`。
- G08 Pi 服务端合成回执 `planFingerprint`：`ae6c51f728da6b728fbde9138507afd831dc4cf42f4ce8b1312f2074f9dfb3cc`，六条逐 Subject 检查，`technicalComplete=true`，`publicationAllowed=false`。
- **18 PASS / 0 FAIL** 新测试与 R1，**46 PASS / 0 FAIL** 相关旧回归；全仓 PR CI [#39047829966](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39047829966) **3623 PASS / 6 SKIP / 0 FAIL**。
- 原始 JSON 证据 [Artifact #12106815095](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39047830003/artifacts/12106815095)：包含原始 `cli-plan.json`、`cli-authoring.json`、`cli-selection.json`、`checked-in-example-plan.json`、`actual-pi-plan.json`、`actual-pi-run.json`、`actual-pi-receipt.json`。原始运行日志同时保存在该工作流 Job 页面中。

**后续新增真实材料 / EvidenceLink 逐对象测试**：实现 SHA `3a54052dcb39306fc3a8bfc05be858e1ef35492e`，[CI #39048123453](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39048123453)；读取该运行的实际结论和 Artifact 后才能把新增用例标记 PASS。这里列出的既有绿灯只对应 `f13f7dd4…`，不冒充后续提交结果。

