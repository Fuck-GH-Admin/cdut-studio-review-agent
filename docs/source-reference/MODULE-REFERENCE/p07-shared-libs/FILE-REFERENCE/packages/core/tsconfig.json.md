---
path: packages/core/tsconfig.json
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 13ee9ecadee7451dc2a4aecd0014e1fca783ab42
sha256: 9237ac72c4fe2f5c1f2c3d095ab476ca1f4655b0ea5d75569d262b60af903421
lines: 7
kind: config
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/core/tsconfig.json

## 1. 结论与边界

`@profer/core` 包的 TypeScript 编译配置（`packages/core/tsconfig.json:1-7`，7 行）：继承仓根，仅覆盖 `lib` 为 `["ESNext","DOM","DOM.Iterable"]`——因为 core 含 highlight/pdf-engine/office-engine 等**浏览器面 API**（如 `document`/Canvas）与 Node 面混合，需同时具备 DOM 类型。

## 2. 键清单与默认值来源

| 键 | 值 | 行 | 来源 |
| --- | --- | --- | --- |
| `extends` | `../../tsconfig.json` | `:2` | 仓根 tsconfig（其余选项默认来源） |
| `compilerOptions.lib` | `["ESNext","DOM","DOM.Iterable"]` | `:3-5` | 本包覆盖 |
| `include` | `["src/**/*"]` | `:6` | 包源码面 |

## 3. 内部逻辑与关键流程

无逻辑；静态 JSON。

## 4. 真实消费者

`tsc`（`packages/core/package.json:26-28` `typecheck: tsc --noEmit`）；生效面 `packages/core/src/**`（providers/highlight/pdf-engine/office-engine 等）。core 被 `@profer/ui`（`ui/package.json:31` workspace 依赖）与 apps 消费。

## 5. 环境覆盖

无。

## 6. 缺失/非法值行为

`lib` 缺失则用仓根默认——DOM API 引用将报类型错误；非法数组值 → tsc 启动报错。

## 7. 权限与权威状态

不适用，依据：构建配置。

## 8. 修改影响面

改 `lib` → core 包全部类型检查（含 DOM 依赖代码）；删 DOM 项会破坏 highlight/pdf-engine 等使用浏览器 API 的文件。

## 9. 测试证据

无测试。**NOT_RUN**（未执行 tsc）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 键取值 | 已证实 | 逐行读 `:1-7` |
| DOM lib 的动机 | 推断 | 包内容（highlight/pdf-engine）与 `lib` 覆盖方向一致，未逐文件核 API |
| 仓根 extends 选项 | 未知 | 不在本批 |

## 11. 覆盖表

| 键 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| extends/lib/include | §2 | `:2-6` | covered |
| 影响面 | §8 | — | covered |
