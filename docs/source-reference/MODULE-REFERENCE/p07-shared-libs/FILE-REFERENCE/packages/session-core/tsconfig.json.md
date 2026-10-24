---
path: packages/session-core/tsconfig.json
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 73a65ef2ef6e5658643310ffc67e5391df2cbbc1
sha256: 1de5fbec4888f903fd7d0695642e6c2cb46ae9f5e944df0d93a4fd1aaa2325d6
lines: 5
kind: config
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/session-core/tsconfig.json

## 1. 结论与边界

`@profer/session-core` 包的 TypeScript 编译配置（`packages/session-core/tsconfig.json:1-5`，5 行）：继承仓根 `../../tsconfig.json`，本包**零覆盖**（`compilerOptions: {}`），仅限定 `src/**/*` 为编译面。无运行时语义。

## 2. 键清单与默认值来源

| 键 | 值 | 行 | 来源 |
| --- | --- | --- | --- |
| `extends` | `../../tsconfig.json` | `:2` | 仓根 tsconfig 为全部选项的默认来源 |
| `compilerOptions` | `{}` | `:3` | 空对象=不覆盖任何继承选项 |
| `include` | `["src/**/*"]` | `:4` | 本包源码面 |

## 3. 内部逻辑与关键流程

无逻辑；JSON 静态配置。与 `packages/shared/tsconfig.json` **blob 完全相同**（同 sha256 `1de5fbec…`）——两包同构配置。

## 4. 真实消费者

- `tsc`（经 `packages/session-core` 的 typecheck 流程/IDE）；仓根构建链（`apps/electron/scripts/build-cli.ts` 打包 CLI 时经 ts 工具链）。`extends` 目标 = 仓根 `tsconfig.json`（不在本批）。
- 生效面：`packages/session-core/src/**`（13 个源文件，含本批 5 源 + 测试）。

## 5. 环境覆盖

无环境变量/条件覆盖（静态 JSON）。

## 6. 缺失/非法值行为

键缺失则回退 extends；`include` 缺失将扩大到包根。JSON 语法错误 → tsc 启动失败（非运行时）。

## 7. 权限与权威状态

不适用，依据：构建配置无权限分支。

## 8. 修改影响面

改 `include`/`compilerOptions` → session-core 全包编译行为（CLI 与主进程消费者随之）；与 `packages/shared/tsconfig.json` 的同构关系会被打破。

## 9. 测试证据

无测试（配置不被测试断言）。**NOT_RUN**（未执行 tsc）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 键取值与行号 | 已证实 | 逐行读 `:1-5` |
| 与 shared/tsconfig.json 字节同构 | 已证实 | 同 blob `73a65ef2…` |
| 仓根 extends 的具体选项 | 未知 | 仓根 tsconfig 不在本批 |

## 11. 覆盖表

| 键 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| extends/compilerOptions/include | §2 | `:2-4` | covered |
| 缺失行为 | §6 | — | covered |
