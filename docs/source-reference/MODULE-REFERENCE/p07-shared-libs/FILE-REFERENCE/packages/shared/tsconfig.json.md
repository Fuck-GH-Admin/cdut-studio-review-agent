---
path: packages/shared/tsconfig.json
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

# packages/shared/tsconfig.json

## 1. 结论与边界

`@profer/shared` 包的 TypeScript 编译配置（`packages/shared/tsconfig.json:1-5`，5 行）：继承仓根、零覆盖、`include: ["src/**/*"]`。与 `packages/session-core/tsconfig.json` **字节同构**（同 blob `73a65ef2…`）。无运行时语义。

## 2. 键清单与默认值来源

| 键 | 值 | 行 | 来源 |
| --- | --- | --- | --- |
| `extends` | `../../tsconfig.json` | `:2` | 仓根 tsconfig |
| `compilerOptions` | `{}` | `:3` | 零覆盖 |
| `include` | `["src/**/*"]` | `:4` | 包源码面 |

## 3. 内部逻辑与关键流程

无逻辑；静态 JSON。

## 4. 真实消费者

`tsc`（`packages/shared/package.json:15-17` 的 `typecheck: tsc --noEmit` 脚本消费）；IDE；打包链（`apps/electron/scripts/build-cli.ts`）。生效面 `packages/shared/src/**`（含 `types/longterm-memory.ts` 等）。

## 5. 环境覆盖

无。

## 6. 缺失/非法值行为

键缺失回退 extends；JSON 损坏 → tsc 启动失败。

## 7. 权限与权威状态

不适用，依据：构建配置无权限分支。

## 8. 修改影响面

改配置 → @profer/shared 全包编译（全仓 1143 处导入依赖其类型面）；破坏与 session-core 的同构约定。

## 9. 测试证据

无测试。**NOT_RUN**（未执行 tsc）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 键取值 | 已证实 | 逐行读 `:1-5` |
| 与 session-core/tsconfig.json 同构 | 已证实 | 同 blob |
| 仓根 extends 选项 | 未知 | 不在本批 |

## 11. 覆盖表

| 键 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| extends/compilerOptions/include | §2 | `:2-4` | covered |
| 消费者/影响面 | §4/§8 | — | covered |
