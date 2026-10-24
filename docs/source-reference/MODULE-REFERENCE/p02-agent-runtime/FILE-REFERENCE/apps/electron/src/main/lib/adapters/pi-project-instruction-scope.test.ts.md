---
path: apps/electron/src/main/lib/adapters/pi-project-instruction-scope.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8e15574a8a53ac0340c3ad3eb6a2b27b8e166c71
sha256: cae1e3f8c65bee2a121df5eaa90400a6128a17790042251ba35be490c397045b
lines: 58
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-project-instruction-scope.test.ts

## 1. 测试目标

`ProjectInstructionScopeController` 的项目指令激活文案与无指令时的普通工具调用不受影响。mock 边界：临时目录夹具（projectRoot），无 mock 模块。

## 2. 用例清单

1 describe、2 test（`apps/electron/src/main/lib/adapters/pi-project-instruction-scope.test.ts:1-58`）：

1. `:25-44` 激活文案与普通 write 通过。
2. `:46-57` 项目没有指令文件时不改变普通工具调用。

## 3. 真实断言

- `:32-33` `activation.reason` **不含**「创建同目录」「迁移」。
- `:36-37` `appendPendingInstructions` 含 `# 用户项目规则` 与 `CLAUDE.md / AGENTS.md in user projects are read as context only`。
- `:43/:53-56` `beforeToolCall` 返回 `undefined`（不拦截）。

## 4. 未覆盖与脆弱点

未覆盖：`isWithinScope` 越界拒绝/block 决策分支、`delivered` 去重、`resolveTargetDirectory` 的 realpath 容错、多来源组合排序。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 用例行号与断言文本 | 已证实 | `:25-57` |
| 运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 文案/无指令通过 | §3 | covered |
| block/去重/范围拒绝 | §4 | unknown |
| 实际运行 | §5 | unknown（NOT_RUN） |
