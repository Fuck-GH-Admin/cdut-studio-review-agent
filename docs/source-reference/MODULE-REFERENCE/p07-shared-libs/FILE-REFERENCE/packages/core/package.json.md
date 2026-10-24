---
path: packages/core/package.json
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 34491f33fe75fcc79cf2039953f44a824a90156d
sha256: caa860714ad3f9fcfd997baf75d22804de93a6eb4e178c314b531817e5e727cd
lines: 32
kind: config
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/core/package.json

## 1. 结论与边界

`@profer/core` 的**包清单**（`packages/core/package.json:1-32`）：5 个导出入口（`.`, `./providers`, `./highlight`, `./pdf-engine`, `./office-engine`）、真实运行依赖（highlight.js/pdfjs-dist/shiki）、两个 peer（Anthropic SDK / MCP SDK）、typecheck 脚本。核心能力包：providers 适配、语法高亮、PDF/Office 引擎。

## 2. 键清单与默认值来源

| 键 | 值 | 行 | 说明 |
| --- | --- | --- | --- |
| `name`/`version` | `@profer/core` / `0.2.14` | `:2-3` | — |
| `license` | `AGPL-3.0-only` | `:4` | — |
| `type`/`main`/`types` | `module` / `./src/index.ts` | `:6-8` | 源码直出 |
| `exports` | 5 入口 | `:9-15` | 全部指 `src/**/index.ts` |
| `dependencies` | `@profer/shared`（workspace:*）、`highlight.js ^11.11.1`、`pdfjs-dist ^4.10.38`、`shiki ^3.22.0` | `:16-21` | 运行依赖 |
| `peerDependencies` | `@anthropic-ai/sdk >=0.70.0`、`@modelcontextprotocol/sdk >=1.0.0` | `:22-25` | 由宿主提供 |
| `scripts.typecheck` | `tsc --noEmit` | `:26-28` | — |
| `devDependencies` | `typescript ^5.0.0` | `:29-31` | — |

## 3. 内部逻辑与关键流程

无逻辑；静态 JSON。`shiki ^3.22.0` 与 `@profer/ui`（`ui/package.json:53` 同为 `^3.22.0`）版本对齐——两包共享高亮器版本面。

## 4. 真实消费者

- `./highlight` 入口：`packages/ui/src/code-block/CodeBlock.tsx:23`（`getDisplayName/highlightToTokens/onHighlighterReady`）。
- `./providers`：适配器（p04 批 `review`/providers 消费，如 `packages/core/src/providers/*` 再导出）。
- `@profer/core` workspace 被 `ui/package.json:31` 依赖；apps 侧导入（如 graph-focus 等经 `@profer/core/...`）。
- peer 两项由 `apps/electron` 的依赖树提供（electron package 不在本批）。

## 5. 环境覆盖

无环境变量；peer 缺失时由宿主安装面决定（npm/bun 安装警告或运行时 import 失败）。

## 6. 缺失/非法值行为

`exports` 缺入口 → 深路径导入解析失败；`dependencies` 版本下限不符 → 特性缺失/类型不匹配（如 shiki API 变化）。

## 7. 权限与权威状态

不适用，依据：包清单。

## 8. 修改影响面

改 `exports` → `CodeBlock.tsx` 等深路径导入方；改依赖版本 → highlight/PDF/Office 行为与 `@profer/ui` 的 shiki 对齐关系；peer 变更 → 宿主安装面。

## 9. 测试证据

无测试（清单）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全部键值与行号 | 已证实 | 逐行读 `:1-32` |
| shiki 与 ui 同版本对齐 | 已证实 | `:20` vs `ui/package.json:53` |
| peer 实际由谁提供 | 未知 | apps/electron 依赖面不在本批 |

## 11. 覆盖表

| 键组 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 身份/exports/deps/peers/scripts | §2 | `:2-31` | covered |
| 消费/影响 | §4/§8 | — | covered |
