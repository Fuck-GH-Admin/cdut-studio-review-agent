# Independent D3-10 Agent B

Code fixed at d16f047af653f7ba259456807c1fc150e9d0f417. Separate branch test/d3-10-agent-b-cross-business, isolated config /home/runner/work/cdut-studio-review-agent/cdut-studio-review-agent/docs/design/review-agent/acceptance/d3-10/agent-b/tests/isolated-config-B. Agent A artifacts were not used. This directory contains actual CLI command traces and D1/D2/D3 assets. Synthetic Pi service test is not live online model review. No public D3 code was edited. No official approval.


## P1/P2 实证补测

在本分支及固定 D3 基线上，直接运行：

```bash
bun install --frozen-lockfile
bun docs/design/review-agent/acceptance/d3-10/agent-b/tests/agent-b-runner.ts
bun docs/design/review-agent/acceptance/d3-10/agent-b/tests/agent-b-p1-p2.ts
```

需要从干净工作树启动；通过 `.github/workflows/d3-10-agent-b.yml` 可自动创建两个隔离配置、提交可复核产物。第二个命令会生成真实**合成技术** Pi 案卷和 Run（**非在线模型**），并在错误的 copy compliant 回执后恢复，给高级关系最小反例执行真正 D2 编译及 `report-gap`。

详细结果请看 `plans/p1-p2-validation.md`，机器证据见 `tests/p1-p2-execution-summary.json`。**原版 A-r3 Run 和仅为绕过「校规待核」提前拒止的合成来源探针 Run 必须区分**，不能把探针的 `synthetic-source/request-scope` 当作成都理工现行校规。
