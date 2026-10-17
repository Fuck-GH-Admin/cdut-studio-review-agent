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

CI 状态与本次指纹请以后续固定 SHA 的证据确认，不在未运行时编造输出。
