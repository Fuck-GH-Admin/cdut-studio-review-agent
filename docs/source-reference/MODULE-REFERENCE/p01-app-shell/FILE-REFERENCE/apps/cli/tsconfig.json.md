---
path: apps/cli/tsconfig.json
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 73a65ef2ef6e5658643310ffc67e5391df2cbbc1
sha256: 1de5fbec4888f903fd7d0695642e6c2cb46ae9f5e944df0d93a4fd1aaa2325d6
lines: 5
kind: config
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/cli/tsconfig.json

## 1. 结论与边界

CLI 包的 TypeScript 工程配置（静态配置，5 行薄文件）：继承仓库根 `tsconfig.json`、零编译器覆盖、只含 `src/**/*`。服务 `tsc --noEmit` 类型检查。

边界：不配置构建（`bun build --compile` 自带转译，推断）；编译选项全部来自根配置（非本批）。

## 2. 键清单与导出符号

| 键 | 值 | 行 | 说明 |
| --- | --- | --- | --- |
| `extends` | `../../tsconfig.json` | 2 | 继承根 TS 配置 |
| `compilerOptions` | `{}` | 3 | 无覆盖 |
| `include` | `["src/**/*"]` | 4 | 仅编译 src |

3 键。

## 3. 内部逻辑与默认值来源

无逻辑；默认值全部继承根 `tsconfig.json`（非本批）。

## 4. 调用者与调用链

- `package.json:11`（`typecheck: tsc --noEmit`）、`:12`（`bun build --compile`——Bun 不读 tsconfig，推断）。
- 无其它代码引用。

## 5. 数据 I/O 与环境覆盖

无数据读写；无环境覆盖。

## 6. 分支、缺失与非法值行为

`extends` 目标缺失 → `tsc` 报错（仅影响 typecheck）。无其它分支。

## 7. 权限与权威状态

无权限分支，依据：本文件无权限逻辑。

## 8. 修改影响面

改 include/extends 影响 `tsc --noEmit` 范围；不影响 bun 运行/打包（推断）。

## 9. 测试证据

直接测试：**无**（全树 `*.test.*` 检索 0 命中）。间接证据：无。

NOT_RUN：本轮未运行任何测试/typecheck/构建。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 键值 | 已证实 | `:1-5` 逐行读 |
| 消费者 scripts | 已证实 | `package.json:11-12` |
| bun build 不读 tsconfig | 推断 | Bun 工具链惯例 |
| 根 tsconfig 内容 | 未知 | 非本批 |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 键 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| extends/compilerOptions/include | §2 | 2-4 | covered |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |
