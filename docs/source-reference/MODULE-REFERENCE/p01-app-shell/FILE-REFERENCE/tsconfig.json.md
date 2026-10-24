---
path: tsconfig.json
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bfa0fead54e8070848b4572df2e14b62a86d570f
sha256: 11a68339a9c6a0c04a67b95dff9eefd9a92c42fa35161411048405272ab192c8
lines: 29
kind: config
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# tsconfig.json

## 1. 结论与边界

**仓库根 TypeScript 编译基线配置**（29 行 JSONC）：单一 `compilerOptions` 对象，被 9 个子包 tsconfig 以 `"extends": "../../tsconfig.json"` 继承，是全仓 TS 类型门禁的根继承源。`noEmit: true`（`tsconfig.json:15`）声明本配置只做类型检查、不产出 JS；`module: "Preserve"` + `moduleResolution: "bundler"`（`tsconfig.json:6`、`tsconfig.json:12`）绑定 bun/esbuild 打包语义。边界：不含 `include`/`files`/`exclude`/`paths`，编译范围由各子配置各自界定；不参与运行时，无任何脚本逻辑。

## 2. 导出与关键符号

无导出（config）：仅 `compilerOptions` 一个顶层键（`tsconfig.json:2`），共 18 个选项键，逐条核对如下：
- 环境组：`lib: ["ESNext"]`（`tsconfig.json:4`）、`target: "ESNext"`（`tsconfig.json:5`）、`module: "Preserve"`（`tsconfig.json:6`）、`moduleDetection: "force"`（`tsconfig.json:7`）、`jsx: "react-jsx"`（`tsconfig.json:8`）、`allowJs: true`（`tsconfig.json:9`）。
- Bundler 组：`moduleResolution: "bundler"`（`tsconfig.json:12`）、`allowImportingTsExtensions: true`（`tsconfig.json:13`）、`verbatimModuleSyntax: true`（`tsconfig.json:14`）、`noEmit: true`（`tsconfig.json:15`）。
- 严格组：`strict: true`（`tsconfig.json:18`）、`skipLibCheck: true`（`tsconfig.json:19`）、`noFallthroughCasesInSwitch: true`（`tsconfig.json:20`）、`noUncheckedIndexedAccess: true`（`tsconfig.json:21`）、`noImplicitOverride: true`（`tsconfig.json:22`）。
- 显式关闭组：`noUnusedLocals: false`（`tsconfig.json:25`）、`noUnusedParameters: false`（`tsconfig.json:26`）、`noPropertyAccessFromIndexSignature: false`（`tsconfig.json:27`）。

## 3. 内部逻辑与关键流程

本文件不适用，依据：`tsconfig.json:1-29` 全文为 JSONC 配置声明，无函数、无控制流、无返回值与短路条件；编译执行流由 tsc 按 `extends` 链加载本文件后逐键生效（间接，消费点见 §4）。

## 4. 调用者与调用链

- 入向（grep 冻结树 `"extends".*tsconfig`，命中行均在各文件第 2 行）：`apps/cli/tsconfig.json:2`、`apps/electron/tsconfig.json:2`、`packages/ui/tsconfig.json:2`、`packages/core/tsconfig.json:2`、`packages/benchmark-multihop/tsconfig.json:2`、`packages/session-core/tsconfig.json:2`、`packages/shared/tsconfig.json:2`、`packages/project-core/tsconfig.json:2`、`packages/agent-fabric/tsconfig.json:2`，共 9 处。
- 入向（间接消费链）：`package.json:24` `"typecheck": "bun run --filter='*' typecheck"` → 各包 `tsc --noEmit`（如 `apps/electron/package.json:45`、`apps/cli/package.json:11`、`packages/core/package.json:27`），tsc 经子配置 extends 读到本文件。
- 出向：无 import/require，依据：`tsconfig.json:1-29` 无模块引用语句；引用关系仅由 tsc 的 extends 解析建立（间接）。
- 否定结论检索范围：冻结树全量 grep `tsconfig`（--include 限定 json/toml/ts/cjs/mjs）与 `extends`，未发现第 10 处引用根 `tsconfig.json` 的消费点。

## 5. 数据 I/O、读写与副作用

本文件无磁盘/网络读写点，依据：`tsconfig.json:1-29` 无 IO 语句。tsc/bun 读取本文件属工具链行为（间接）；本文件不写任何文件（`noEmit: true`，`tsconfig.json:15` 明示不产出）。无原子性/幂等问题。

## 6. 分支、失败、取消与恢复

本文件不适用（执行分支），依据：`tsconfig.json:1-29` 无条件语句与退出码。配置键/值非法时的失败表现为 tsc 报 `TS5xxxx` 配置错误并退出非零（间接，推断自 tsc 语义）；恢复方式为修正配置键值，无状态残留。本轮 NOT_RUN，未实际触发。

## 7. 权限与权威状态

无权限分支，依据：`tsconfig.json:1-29` 无 env、token、凭据或路径读写引用。权威状态：本文件是全仓 TS 严格性（`strict` 等，`tsconfig.json:18-22`）的根权威，子配置可覆盖但默认继承；`bun run typecheck` 的通过标准以本文件为基线（间接）。

## 8. 修改影响面

- 放宽/收紧 `strict` 组（`tsconfig.json:18-22`）→ 9 个继承子包（apps/cli、apps/electron、packages/{ui,core,benchmark-multihop,session-core,shared,project-core,agent-fabric}）的全部 TS/TSX 编译结果与 `bun run typecheck`（`package.json:24`）门禁随之变化。
- 修改 `module`/`moduleResolution`/`allowImportingTsExtensions`（`tsconfig.json:6`、`tsconfig.json:12-13`）→ 影响 bun/esbuild 打包语义与 `.ts` 后缀导入合法性。
- 删除 `noEmit: true`（`tsconfig.json:15`）→ tsc 恢复产出构建产物，改变子配置编译输出行为。
- 影响面具体路径：`apps/cli/tsconfig.json`、`apps/electron/tsconfig.json`、`packages/*/tsconfig.json`（7 个）及其覆盖的全部源码。

## 9. 测试证据

`NOT_RUN`（本轮未运行任何脚本/测试，纯静态阅读）。针对根 `tsconfig.json` 的直接测试：无（grep `it(`/`test(` 于本文件计 0；冻结树无以根配置为断言对象的测试）。间接证据：`apps/electron/scripts/packaging-guards.test.ts:301` `expect(existsSync(join(appDir, 'tsconfig.json'))).toBe(true)` 仅断言 `apps/electron/tsconfig.json` 存在（间接，非根配置断言）。测试断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 18 个 compilerOptions 键值与分组注释 | 已证实 | `tsconfig.json:1-29` 全文 |
| 9 处 extends 继承关系 | 已证实 | grep `"extends"` 命中 9 文件 `:2` |
| tsc 消费链（typecheck → tsc --noEmit） | 已证实 | `package.json:24`、`apps/electron/package.json:45` |
| 修改后实际编译影响 | 推断 | TS extends/strict 语义，未运行 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 环境组选项 | §2 | 4-9 | covered |
| Bundler 组选项 | §2 | 12-15 | covered |
| 严格组选项 | §2 | 18-22 | covered |
| 显式关闭组选项 | §2 | 25-27 | covered |
| extends 消费链 | §4/§8 | 2 | covered |
| 编译执行语义 | §3/§6 | - | unknown（NOT_RUN） |
