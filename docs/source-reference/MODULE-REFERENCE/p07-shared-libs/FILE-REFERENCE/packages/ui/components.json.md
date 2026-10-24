---
path: packages/ui/components.json
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5cd43a3281c8ad689be7145c6c8b5a5334c66fc1
sha256: b7759b321260b01d2a30a63c7f3d65e2bc5c44460216a46eaeea4ec693c66d2d
lines: 20
kind: config
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/ui/components.json

## 1. 结论与边界

**shadcn CLI 配置**（`packages/ui/components.json:1-20`）：声明 UI 生成器（`ui.shadcn.com` schema `:2`）的样式/路径别名——生成组件时落到 `@profer/ui/primitives`、utils 落 `@profer/ui/lib/cn`。仅开发期工具配置，**不进运行时**。

## 2. 键清单与默认值来源

| 键 | 值 | 行 | 说明 |
| --- | --- | --- | --- |
| `$schema` | `https://ui.shadcn.com/schema.json` | `:2` | shadcn 官方 schema |
| `style` | `new-york` | `:3` | shadcn 风格变体 |
| `rsc`/`tsx` | `false`/`true` | `:4-5` | 非 RSC、生成 TSX |
| `tailwind.config` | `../../apps/electron/tailwind.config.js` | `:7` | 指向应用 Tailwind 配置 |
| `tailwind.css` | `../../apps/electron/src/renderer/styles/globals.css` | `:8` | 全局样式注入点 |
| `tailwind.baseColor` | `neutral` | `:9` | — |
| `tailwind.cssVariables` | `true` | `:10` | 用 CSS 变量主题 |
| `tailwind.prefix` | `""` | `:11` | 无类名前缀 |
| `aliases.*` | `components/ui→@profer/ui/primitives`、`utils→@profer/ui/lib/cn`、`lib→@profer/ui/lib`、`hooks→@profer/ui/hooks` | `:13-18` | 生成代码的 import 别名 |

## 3. 内部逻辑与关键流程

无逻辑；静态 JSON。`utils` 别名指向 `@profer/ui/lib/cn`（即本批 nb-37 的 `cn.ts`）——生成组件的类名合并 import 由此决定。

## 4. 真实消费者

shadcn CLI（`npx shadcn add …`，开发期人工/脚本）；生成产物落点 = `packages/ui/src/primitives/*.tsx`（如 `alert-dialog.tsx`）。`tailwind.*` 两路径指向 `apps/electron`（生成时校验/注入，未运行核实）。

## 5. 环境覆盖

无环境变量。

## 6. 缺失/非法值行为

文件缺失 → shadcn CLI 无法在该目录生成（交互式初始化重建）；别名错 → 生成组件 import 路径错误（编译期暴露）。

## 7. 权限与权威状态

不适用，依据：开发工具配置。

## 8. 修改影响面

改别名/路径 → 后续生成组件的 import 与落点；已有组件不受影响（生成后无回读）。

## 9. 测试证据

无测试。**NOT_RUN**（未运行 shadcn CLI）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全部键值与行号 | 已证实 | 逐行读 `:1-20` |
| tailwind 路径在生成时的消费方式 | 未知 | CLI 行为未运行 |
| 实际生成历史（哪些组件由此产生） | 未知 | 未读 changelog |

## 11. 覆盖表

| 键组 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 全键 | §2 | `:2-18` | covered |
| 消费/影响 | §4/§8 | — | covered |
