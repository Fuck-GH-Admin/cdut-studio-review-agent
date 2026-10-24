---
path: apps/electron/scripts/ui-workspace-contract.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 94d7cb472393516bac946c08a04dabd78f0b413a
sha256: 3a3d3f82ac171dcb0ce559a090d0903fdfc27f6fe4671f6da98d295feed4c567
lines: 42
kind: test
package: p01-app-shell
author: docs-r07-author-nb-05-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/scripts/ui-workspace-contract.test.ts

## 1. 测试目标

共享 UI 迁移后的工具链接线契约：**实际编译 CSS**（不只断言配置字符串，注释 `:14`）验证 tooltip 层级/主题/关闭动画仍生成；shadcn 别名指向共享包且子路径可解析。bun:test。

## 2. 用例清单

| 项 | 值 | 核法 |
| --- | --- | --- |
| `test(` 计数 | **2** | `grep -c '^\s*test('` |
| `it(` 计数 | **0** | 同上 |
| describe | 1（'共享 UI 迁移后的工具链接线' `:15`） | 全文 |

## 3. 真实断言

1. `:16-24`（async）：postcss+tailwind 实编译 `@tailwind utilities`→选择器集含 `.z-\[10050\]`/`.bg-tooltip\/90`/`.data-\[state\=closed\]\:zoom-out-95[data-state="closed"]`。
2. `:26-41`：components.json 双端一致——app 与 ui 的 aliases.ui/utils/style/baseColor 相同；`createRequire.resolve` 实解析（button→ui/src/primitives/button.tsx、cn→ui/src/lib/cn.ts、use-smooth-zoom→ui/src/hooks/…）；ui tailwind.config/css 路径对齐 app。

## 4. 未覆盖

tailwind 产物的视觉正确性；其它 aliases 子路径；版本兼容。

## 5. 已证实

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 test/0 it 计数与断言内容（含实编译口径） | 已证实 | 全文+机械计数 |
| 测试通过 | 未知 | NOT_RUN（断言≠运行） |

## 6. 覆盖表

| 用例 | 节 | 状态 |
| --- | --- | --- |
| 2 用例 | §2/§3 | covered（断言级；NOT_RUN） |
