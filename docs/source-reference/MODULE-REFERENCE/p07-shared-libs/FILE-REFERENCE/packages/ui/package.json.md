---
path: packages/ui/package.json
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f4d1fac6edaac23a3330166bc945c115cdd7b8ef
sha256: cfaa38c9681bcf94ba62ab4b74db9b035004b337580b1ac927083b5ffa3a2bcb
lines: 61
kind: config
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/ui/package.json

## 1. 结论与边界

`@profer/ui` 的**包清单**（`packages/ui/package.json:1-61`）：4 组导出（`.`, `./primitives/*`, `./lib/*`, `./hooks/*`，全部源码直出）、完整 UI 依赖面（Radix ×15、mermaid 全家、react-markdown 管线、shiki、sonner 等 31 项）、React peer。共享 UI 组件包（nb-37 手册为其实现文件）。

## 2. 键清单与默认值来源

| 键 | 值 | 行 | 说明 |
| --- | --- | --- | --- |
| `name`/`version` | `@profer/ui` / `0.2.0` | `:2-3` | — |
| `type`/`main`/`types` | `module` / `./src/index.ts` | `:6-8` | 源码直出 |
| `exports` | `.`、`./primitives/*→./src/primitives/*.tsx`、`./lib/*→./src/lib/*.ts`、`./hooks/*→./src/hooks/*.ts` | `:9-14` | 深路径通配 |
| `scripts` | `typecheck: tsc --noEmit`、`test: bun test` | `:15-18` | `test` 消费本包 3 测试文件（nb-37） |
| `peerDependencies` | `react ^18.3.0`、`react-dom ^18.3.0` | `:19-22` | 宿主提供 |
| `devDependencies` | `@types/react(-dom) ^18.3.0`、`typescript ^5.0.0` | `:23-27` | — |
| `dependencies` | 31 项 | `:28-60` | 见 §3 |

## 3. 内部逻辑与关键流程

无逻辑；静态 JSON。依赖要点：

- **mermaid 全家**：`beautiful-mermaid 1.1.3`、`mermaid 11.16.1`、`@mermaid-js/layout-elk 0.2.2`、`@mermaid-js/mermaid-zenuml 0.2.3`（`:29-30/:47/:52`）——与 `MermaidBlock.tsx` 双路渲染的动态 import 一一对应（固定版本，无 `^`）。
- **markdown 管线**：`react-markdown ^10.1.0`、`remark-gfm ^4.0.1`、`remark-math ^6`、`rehype-katex ^7`（`:56-59`）——`markdown-preview.tsx` 消费。
- **Radix ×15**（`:32-46`）：alert-dialog/dialog/tooltip/select…——`primitives/*` 的底层。
- **样式/工具**：`class-variance-authority 0.7.1`、`clsx ^2.1.1`、`tailwind-merge ^2.5.5`（`:48-49/:55`）、`shiki ^3.22.0`（`:53`，与 `@profer/core:20` 对齐）、`sonner ^2.0.7`（`:54`）、`lucide-react ^0.460.0`（`:51`）、`cmdk ^1.1.1`（`:50`）。
- `@profer/core: workspace:*`（`:31`）。

## 4. 真实消费者

- `exports` 深路径：`@profer/ui/primitives/*` 消费者（如 `alert-dialog` 22 文件，见 nb-37 手册）、`@profer/ui` 根 44 文件。
- `scripts.test`：`bun test` 跑 `lib/wheel-zoom.test.ts`/`markdown-preview.test.tsx`/`mermaid-detection.test.ts`（nb-37）。
- 依赖反向：`apps/electron` 等经 workspace 引用（electron package 不在本批）。

## 5. 环境覆盖

无环境变量；peer React 版本由宿主决定。

## 6. 缺失/非法值行为

`exports` 通配缺失 → 深路径导入失败；mermaid 系固定版本缺失 → `MermaidBlock` 动态 import 失败走兜底（`MermaidBlock.tsx:203-207` 行为，见 nb-37 手册）。

## 7. 权限与权威状态

不适用，依据：包清单。

## 8. 修改影响面

改 `exports` → 全部深路径消费者；改 mermaid/markdown/Radix 版本 → 对应组件行为（nb-37 各手册）；peer React 升级 → 全包。

## 9. 测试证据

无测试（清单本身）。`scripts.test` 指向的 3 个测试文件断言见 nb-37 手册（NOT_RUN）。本轮 **NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全部键值/31 依赖与行号 | 已证实 | 逐行读 `:1-61` |
| mermaid 系固定版本 ↔ MermaidBlock 动态 import 对应 | 已证实 | `:29-30/:47/:52` vs `MermaidBlock.tsx:79-84/:170/:200` |
| shiki 与 core 对齐 | 已证实 | `:53` vs `core/package.json:20` |
| 实际安装版本解析 | 未知 | 未读 lockfile |

## 11. 覆盖表

| 键组 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 身份/exports/scripts/peers/devDeps | §2 | `:2-27` | covered |
| dependencies 31 项分组 | §3 | `:28-60` | covered |
| 消费/影响 | §4/§8 | — | covered |
