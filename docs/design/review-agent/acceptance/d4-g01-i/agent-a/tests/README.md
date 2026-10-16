# G01-I 作者侧技术自测入口

以下命令从仓库根目录执行，所有写入只应落在独立配置目录。不得连接真实校务系统或使用学生真实材料。

```bash
bun install --frozen-lockfile
bun test --isolate --timeout 30000 docs/design/review-agent/acceptance/d4-g01-i/agent-a/tests/g01-i-technical.test.ts
bun run typecheck
```

手动复现 D1/D3/D2 CLI（建议先执行完整测试，再走这些只读命令）：

```bash
export PROFER_CONFIG_DIR="$(mktemp -d)"
BASE=docs/design/review-agent/acceptance/d4-g01-i/agent-a
bun apps/electron/scripts/review-authoring-v1.ts validate "$BASE/workspace/workspace.json"
bun apps/electron/scripts/review-d3-library.ts validate "$BASE/workspace/workspace.json"
bun apps/electron/scripts/review-d2-plan.ts preview "$BASE/workspace/workspace.json" "$BASE/workspace/selection.json" "$BASE/runtime/synthetic-draft-case.json" > /tmp/g01i-actual-d2-plan.json
```

真实命令运行的日志、计划指纹和输出必须独立保存；不能用“本目录含有测试代码”代替 PASS。该合成回归验证 D1 修订链、D3 作者态携包、D2 49 项 RuleSpec/Check 映射与 P7 有权回执的 fail-closed 检查；证据正例/反例限于 D2 通用 gate，尚未建立 G01-I 的合规主体类型。

本轮不读取材料 Agent 的隐藏案卷、提示词或 Gold。
