---
path: apps/electron/components.json
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0aa7288c61b6649c26f1955e6c9cdbd18a99ca18
sha256: e9617ad79472387edd6dcecde5f92a2f96e3bf9f9efe8910ad21a9b92b4195ec
lines: 20
kind: config
package: p01-app-shell
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/components.json

## 1. 结论与边界
shadcn/ui CLI 配置（纯配置，20 行）：声明 UI 风格变体、Tailwind 接线与 5 条代码别名，供 shadcn 生成组件时定位样式文件与别名路径（`apps/electron/components.json:1-20`）。边界：不含组件本体；不参与运行时（无运行时 import）；与 `packages/ui/components.json` 成对，契约由测试断言（见 §9）。

## 2. 导出与关键符号
不适用，依据：JSON 配置，无 export/符号。键清单：`$schema`（`:2`）；`style: "new-york"`（`:3`）；`rsc: false`（`:4`）；`tsx: true`（`:5`）；`tailwind` 块——`config: "tailwind.config.js"`（`:7`）、`css: "src/renderer/styles/globals.css"`（`:8`）、`baseColor: "neutral"`（`:9`）、`cssVariables: true`（`:10`）、`prefix: ""`（`:11`）；`aliases` 5 条——`components: "@/components"`（`:14`）、`utils: "@profer/ui/lib/cn"`（`:15`）、`ui: "@profer/ui/primitives"`（`:16`）、`lib: "@/lib"`（`:17`）、`hooks: "@/hooks"`（`:18`）。

## 3. 内部逻辑与关键流程
不适用，依据：无执行逻辑。语义（推断自 shadcn CLI 约定）：生成组件时按 `style` 选模板、按 `tailwind.css`/`config` 注册样式、按 `aliases` 写 import 路径。

## 4. 调用者与调用链
入向：shadcn CLI（工具约定，推断）；**代码级消费者**：`apps/electron/scripts/ui-workspace-contract.test.ts:27` 读取本文件（`json(resolve(appRoot, 'components.json'))`）。出向：`tailwind.config.js`（`:7` 指向，220 行，同批手册）、`src/renderer/styles/globals.css`（`:8` 指向）、`@profer/ui` 包路径（`:15-16`）。别名的下游解析经 `apps/electron/tsconfig.json:7-11` 与 `vite.config.ts:63-66`（`@/`→`src/renderer`）。

## 5. 数据 I/O、读写与副作用
不适用，依据：本文件无 I/O 代码。测试读取副作用：`ui-workspace-contract.test.ts:27` 仅读（`readFileSync`，`ui-workspace-contract.test.ts:12`）。

## 6. 分支、失败、取消与恢复
不适用，依据：无分支与错误路径。失败模式（推断）：别名指向不可解析时 shadcn 生成的 import 报 TS2307；本文件无校验逻辑。

## 7. 权限与权威状态
无权限分支，依据：本文件无 sender/role 检查。契约权威：与 `packages/ui/components.json` 的一致性由 `ui-workspace-contract.test.ts:35-40` 断言（style/baseColor/aliases/tailwind.config/css 双侧相等）。

## 8. 修改影响面
改 `aliases.ui`/`aliases.utils`（`:15-16`）会打破 `ui-workspace-contract.test.ts:30-33` 的断言（`@profer/ui/primitives/button`→`packages/ui/src/primitives/button.tsx`、`@profer/ui/lib/cn`→`packages/ui/src/lib/cn.ts` 的 resolve 期望）；改 `tailwind.config`/`css`（`:7-8`）会打破 `:39-40` 与 `packages/ui/components.json` 的一致性断言。需同步修改：`packages/ui/components.json`、`ui-workspace-contract.test.ts`。

## 9. 测试证据
直接测试：`apps/electron/scripts/ui-workspace-contract.test.ts`（42 行，2 用例）——用例 2「shadcn 的 UI 与工具别名指向共享包，子路径可实际解析」（`:26-41`）真实断言：`appConfig.aliases.ui==='@profer/ui/primitives'`（`:30`）、`appConfig.aliases.utils==='@profer/ui/lib/cn'`（`:31`）、`createRequire(...).resolve` 实际解析到 `packages/ui/src/primitives/button.tsx`/`src/lib/cn.ts`（`:32-33`）、双配置 `style`/`baseColor`/`tailwind.config`/`css` 相等（`:35-40`）。mock 边界：无 mock，读真实文件+真实 require.resolve。未覆盖：shadcn CLI 实际生成行为。NOT_RUN：本轮未执行该测试（静态阅读，断言为读到的代码）。

## 10. 已证实 / 推断 / 未知
| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 键清单与取值如 §2 | 已证实 | `apps/electron/components.json:2-19` 逐行 |
| 测试读取并断言别名/一致性 | 已证实 | `ui-workspace-contract.test.ts:27-40` |
| 指向的 tailwind.config.js/globals.css 存在 | 已证实 | 冻结树路径核实（220 行/globals.css 1-3 含 @tailwind 指令） |
| shadcn CLI 为设计消费者 | 推断 | `$schema`（`:2`）+ 工具约定 |
| CLI 生成组件的实际行为 | 未知 | 未运行 shadcn；无其它代码读取点（全树 `components.json` 检索仅命中上述测试 :27-28） |

## 11. 覆盖表
| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| style/rsc/tsx | §2/§9 | `:3-5` | covered |
| tailwind 块 5 键 | §2/§4/§8 | `:6-12` | covered |
| aliases 5 条 | §2/§4/§8 | `:13-19` | covered |
| 测试断言链 | §9 | `ui-workspace-contract.test.ts:26-41` | covered |
