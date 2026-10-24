---
path: apps/cli/src/output.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0fbdb3a0678e9d67f04b516a0ca297852e8ae5ec
sha256: 0f5dedee465bacb0dc4ba6bce668215fc31dd7ac58e2e757920ea5c37eb05cfc
lines: 38
kind: source
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/cli/src/output.ts

## 1. 结论与边界

CLI 统一输出与退出码约定（纯模块）：机器可读结果走 stdout（`--json` 单个 JSON）、人读日志/错误走 stderr 不污染数据；退出码 0 成功 / 1 运行期错误 / 2 用法错误（文件头 `apps/cli/src/output.ts:1-8`）。设计目标=「上下文有限的 Agent」消费者。

边界：不解析参数（args.ts）；不格式化业务数据（各命令）。

## 2. 导出与关键符号

`export` 逐条核对：3 常量 + 4 函数 + 1 类型 + 1 类 = 9 个导出。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `EXIT_OK` | 常量（导出） | 10 | `0` | |
| `EXIT_ERROR` | 常量（导出） | 11 | `1` | 找不到会话等运行错误 |
| `EXIT_USAGE` | 常量（导出） | 12 | `2` | 参数非法 |
| `info` | 函数（导出） | 15-17 | `(msg) => void` | stderr 一行 |
| `errorLine` | 函数（导出） | 20-22 | `(msg) => void` | stderr，`error: ` 前缀 |
| `emitJson` | 函数（导出） | 25-27 | `(data) => void` | stdout，`JSON.stringify(...,2)` |
| `emitText` | 函数（导出） | 30-32 | `(text) => void` | stdout，保尾换行 |
| `CommandExit` | 类型（导出） | 35 | `= number` | 命令返回约定 |
| `UsageError` | 类型（导出） | 38 | `class extends Error` | 抛出→EXIT_USAGE |

无内部符号。

## 3. 内部逻辑与关键流程

单行包装：`info`/`errorLine` 写 `process.stderr`（`:16,:21`）；`emitJson`/`emitText` 写 `process.stdout`（`:26,:31`），`emitText` 对已有尾换行不重复加（`:31`）。

## 4. 调用者与调用链

入向（全树检索，证实）：`index.ts:19`（全部符号）；`registry.ts:6`（`CommandExit`/`UsageError`）；`commands/list.ts:6`、`info.ts:9`、`outline.ts:7`、`search.ts:7`、`export.ts:15`（各输出函数/退出码/UsageError）。测试：无直接测试。

出向：`process.stdout`/`process.stderr`（`:16,21,26,31`）。

## 5. 数据 I/O、读写与副作用

写 stdout/stderr；无盘/网络（依据：全文读）。副作用=终端输出。幂等：纯写出。

## 6. 分支、失败、取消与恢复

`emitText` 尾换行判断（`:31`）唯一分支。写出失败（EPIPE）不处理（推断：直接抛）。无取消/恢复概念，依据：一次性写出。

## 7. 权限与权威状态

无权限分支，依据：本文件无权限逻辑；stdout/stderr 分流约定是 Agent 消费契约（`:5-6`）。

## 8. 修改影响面

- 全部 CLI 文件（§4）：改分流/退出码破坏 Agent 消费契约（`--json` 单 JSON 假设）。
- `UsageError` 语义与 `index.ts:74-77` 捕获分支耦合。
- 需同步的测试：无（0 test）。

## 9. 测试证据

直接测试：**无**（全树 `*.test.*` 检索 `output.ts`/`emitJson`/`UsageError` 0 命中）。间接证据：无。

NOT_RUN：本轮未运行任何测试/typecheck/构建/CLI 执行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 导出 + 分流语义 | 已证实 | `:10-38` 逐行读 |
| 退出码三值 | 已证实 | `:10-12` |
| 9 处消费（index+registry+5 commands） | 已证实 | §4 行号 |
| EPIPE 行为 | 推断 | 未处理 |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 常量+4 函数+类型+类 | §2 | 10-38 | covered |
| 尾换行分支 | §6 | 31 | covered |
| 调用链 | §4 | - | covered |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |
