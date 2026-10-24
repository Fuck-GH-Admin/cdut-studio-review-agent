---
path: apps/electron/tsconfig.json
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 442a782e55bb5492afefe90f70b9aaf54e7c0253
sha256: 5f5f8111bf4b6562b9a18ac2e28f8806c8c0e46ef88add5ae4274cd0eccd13cb
lines: 14
kind: config
package: p01-app-shell
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/tsconfig.json

## 1. 结论与边界
TypeScript 编译配置（Electron 包，纯配置）：继承根 `tsconfig.json`，补 JSX/lib 设定并定义 3 条路径别名，把编译范围圈定为 `src/**/*`（`apps/electron/tsconfig.json:1-14`）。边界：只管类型检查/模块解析约定，不做打包（打包归 vite/electron-builder）；不含 emit（根配置 `noEmit`，`tsconfig.json:15`）。

## 2. 导出与关键符号
不适用，依据：JSON 配置，无 export/符号。键清单：`extends: "../../tsconfig.json"`（`apps/electron/tsconfig.json:2`，根配置 29 行）；`compilerOptions.jsx: "react-jsx"`（`:4`）；`lib: ["ESNext","DOM","DOM.Iterable"]`（`:5`）；`baseUrl: "."`（`:6`）；`paths` 3 条——`@/*`→`./src/renderer/*`（`:8`）、`@/types/*`→`./src/types/*`（`:9`）、`@assets/*`→`../../assets/*`（`:10`）；`include: ["src/**/*"]`（`:13`）。默认值来源：未出现的键继承根 `tsconfig.json`（`compilerOptions` 块 `tsconfig.json:2-28`，含 `strict` `:18`、`moduleResolution: "bundler"` `:12`、`noEmit` `:15`、`noUncheckedIndexedAccess` `:21`）。

## 3. 内部逻辑与关键流程
不适用，依据：无执行逻辑。解析语义（推断自 TS 工具行为）：`extends` 与本文件键合并，本文件优先；`paths` 以 `baseUrl`（`:6`）为基准解析 `@/*` 等别名。

## 4. 调用者与调用链
入向：tsc（typecheck 脚本链：`package.json:24` `"typecheck": "bun run --filter='*' typecheck"`，子包 typecheck 执行 tsc——脚本体未逐行读，推断）与 IDE/语言服务（工具约定）。别名真实消费者（grep 证据）：`@/` 前缀导入在 `apps/electron/src` 共 1139 处（全子树计数）；`@/types/settings` 例 `apps/electron/src/renderer/hooks/useGlobalAgentListeners.ts:71`、`apps/electron/src/renderer/atoms/notifications.ts:12`；`@assets/*` 例 `apps/electron/src/renderer/components/cdut-zone/CdutWatermarkBackground.tsx:13-14`、`apps/electron/src/renderer/components/cdut-zone/yanhu/pet/YanhuPetAvatar.tsx:11`。出向：`tsconfig.json`（根，29 行）经 `extends`（`:2`）。

## 5. 数据 I/O、读写与副作用
不适用，依据：本文件无 I/O 代码。副作用（工具层）：别名解析把 `@/` 绑定到 `src/renderer/`（`:8`），移动 renderer 目录需同步改此键（影响面见 §8）。

## 6. 分支、失败、取消与恢复
不适用，依据：无分支与错误路径。失败模式（推断自 TS 语义）：`extends` 目标缺失或 paths 目标不存在时报 TS2307/配置错误；`include` 不含的文件不参与类型检查（`:13`）。无恢复逻辑。

## 7. 权限与权威状态
无权限分支，依据：本文件无 sender/role 检查。类型权威由根配置 `strict: true`（`tsconfig.json:18`）继承确立。

## 8. 修改影响面
改 `paths`（`:7-11`）会波及 1139 处 `@/` 导入及 `@assets/` 资源导入（例见 §4）；改 `include`（`:13`）改变受检范围；改 `jsx`/`lib`（`:4-5`）影响全 renderer 编译。需同步修改：调用别名的 TS/TSX 全量、vite 侧别名配置（`apps/electron/vite.config.ts`——运行时解析独立于此文件，见该文件手册）。

## 9. 测试证据
无直接测试：全树 `*.test.*` 检索 `tsconfig` 命中为其它测试的环境说明，无断言本文件内容（范围：全部 .ts/.tsx/.js/.mjs 测试文件）。间接证据：1139 处 `@/` 导入在 typecheck 时经 paths 解析（推断）。NOT_RUN：本轮未运行 typecheck/测试（静态阅读）。

## 10. 已证实 / 推断 / 未知
| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 键清单与行段如 §2 | 已证实 | `apps/electron/tsconfig.json:2-13` 逐行 |
| 继承根配置 strict/bundler/noEmit | 已证实 | `tsconfig.json:12/15/18` |
| `@/` 别名消费 1139 处 | 已证实 | 全 `apps/electron/src` grep 计数 |
| `@/types/`、`@assets/` 真实导入例 | 已证实 | `useGlobalAgentListeners.ts:71`、`CdutWatermarkBackground.tsx:13-14` 等 |
| tsc/typecheck 链消费本文件 | 推断 | `package.json:24` 脚本 + TS 工具语义 |
| vite 是否另行解析 paths 别名 | 未知 | `vite.config.ts` 无 tsconfig/alias 相关键（grep 0 命中），运行时解析方式未读到 |

## 11. 覆盖表
| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| extends | §2/§4 | `apps/electron/tsconfig.json:2` | covered |
| compilerOptions（jsx/lib/baseUrl） | §2/§8 | `:4-6` | covered |
| paths 3 条 | §2/§4/§8 | `:7-11` | covered |
| include | §2/§6/§8 | `:13` | covered |
| 别名消费面 | §4 | grep 证据 | covered |
