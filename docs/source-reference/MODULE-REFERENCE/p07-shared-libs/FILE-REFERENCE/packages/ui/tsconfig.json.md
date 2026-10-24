---
path: packages/ui/tsconfig.json
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6cbc3f58d30bab51b979dbacf4c346f4fd30c4eb
sha256: 307083ff88a3ef85f62385ddc2fd62b49c8dd1457904c1d4b15da6ba97335c1a
lines: 20
kind: config
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/ui/tsconfig.json

## 1. 结论与边界

`@profer/ui` 包的 TypeScript 编译配置（`packages/ui/tsconfig.json:1-20`，20 行）：继承仓根，覆盖 JSX/库面与**包内别名** `@profer/ui/* → ./src/*`（供深路径导入如 `@profer/ui/primitives/alert-dialog` 在类型层解析）。

## 2. 键清单与默认值来源

| 键 | 值 | 行 | 来源 |
| --- | --- | --- | --- |
| `extends` | `../../tsconfig.json` | `:2` | 仓根 |
| `compilerOptions.jsx` | `"react-jsx"` | `:4` | 本包覆盖（TSX） |
| `compilerOptions.lib` | `["ESNext","DOM","DOM.Iterable"]` | `:5-9` | DOM 面 |
| `compilerOptions.baseUrl` | `"."` | `:10` | 相对包根 |
| `compilerOptions.paths` | `{"@profer/ui/*": ["./src/*"]}` | `:11-15` | 深路径别名 |
| `include` | `["src/**/*"]` | `:17-19` | 源码面 |

## 3. 内部逻辑与关键流程

无逻辑；静态 JSON。`paths` 与 `packages/ui/package.json` 的 `exports`（`./primitives/*` 等）共同支撑深路径导入的两个解析面（TS 类型 vs 运行时/bundler）。

## 4. 真实消费者

`tsc`（`ui/package.json:16` `typecheck`）；IDE 类型解析 `@profer/ui/*` 导入（如 `packages/ui/src/primitives/alert-dialog.tsx` 的 22 个外部消费者经 `@profer/ui/primitives/alert-dialog`）；`apps/electron` 的 tsconfig（不在本批）可能另有 paths 镜像（未知）。

## 5. 环境覆盖

无。

## 6. 缺失/非法值行为

`jsx` 缺失 → TSX 无法编译；`paths` 缺失 → 深路径导入类型解析失败（须回退 package.json exports 解析，取决于解析器）。

## 7. 权限与权威状态

不适用，依据：构建配置。

## 8. 修改影响面

改 `paths`/`jsx`/`lib` → @profer/ui 全包及深路径消费者的类型检查；与 `package.json exports` 不一致会造成"类型解析 ≠ 运行解析"分叉。

## 9. 测试证据

无测试。**NOT_RUN**（未执行 tsc）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 键取值 | 已证实 | 逐行读 `:1-20` |
| paths/exports 双解析面联动 | 已证实（结构） | 本文件 + `ui/package.json:9-14` |
| apps 侧 paths 镜像 | 未知 | 不在本批 |

## 11. 覆盖表

| 键 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 6 键 | §2 | `:2-19` | covered |
| 消费/影响 | §4/§8 | — | covered |
