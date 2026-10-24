---
path: packages/benchmark-multihop/package.json
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8e637f118bb3f4e4e4c2d718b537b9513f6b1937
sha256: 19dc9b37435c2101354a89993f2592b123e18336c750579de121ed3a2ca3db67
lines: 16
kind: config
package: p07-shared-libs
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# packages/benchmark-multihop/package.json

## 1. 键清单

| 键 | 值 | 行 | 说明 |
| --- | --- | --- | --- |
| `name` | `@profer/benchmark-multihop` | 2 | 包名 |
| `version` | `0.1.0` | 3 | |
| `license` | `AGPL-3.0-only` | 4 | |
| `description` | MultiHop-RAG 自动化评测与可视化看板（独立于主程序的轻量测试程序） | 5 | |
| `private` | `true` | 6 | 禁止发布 |
| `type` | `module` | 7 | ESM |
| `bin` | `{ "benchmark-multihop": "./src/server.ts" }` | 8-10 | 可执行入口指向 TS 源（bun 直跑） |
| `scripts.start` | `bun run src/server.ts` | 12 | 启动看板服务 |
| `scripts.typecheck` | `tsc --noEmit` | 13 | |
| `scripts.test` | `bun test` | 14 | |

## 2. 默认值来源 / 依赖

**零 dependencies/devDependencies**——只用 Node 内置模块 + Bun API（`Bun.serve`）+ 同包源码（依据 `server.ts` import 清单，无第三方包）。`bin` 直指 `.ts` 表明运行时为 Bun（标准 node 不可直跑——推断-工具链约定）。

## 3. 真实消费者

- `bun run start`（本包）/根目录 `benchmark:ui` script（根 package.json 未读，名称来自 `server.ts:4` 注释）。
- `bin.benchmark-multihop`：`bunx`/安装后命令入口。
- `typecheck`/`test` 脚本被 CI/人工调用（推断）。

## 4. 环境覆盖

无环境变量在本文件；运行期端口由 `server.ts:24` 读 `CDUT_BENCH_UI_PORT`（消费方不在本文件）。

## 5. 缺失/非法值行为

缺失 `scripts.start` 则 `bun run start` 失败；`bin` 指向不存在文件仅在安装/执行时报错（推断-标准语义）。

## 6. 修改影响面

改 `bin`/scripts 影响启动方式与 `server.ts:4` 注释一致性；改 name 影响 workspace 引用（本包无私有依赖者，冻结树检索 `@profer/benchmark-multihop` 零 import 命中——独立程序，声明范围：`apps/**`+`packages/**`）。

## 7. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全键取值与零依赖 | 已证实 | `packages/benchmark-multihop/package.json:1-16` |
| 无包引用 `@profer/benchmark-multihop` | 已证实（静态） | 冻结树字符串检索 |
| bun 直跑 TS 约定 | 推断 | `bin`/scripts 指向 .ts |
| 脚本运行结果 | 未知 | NOT_RUN |

## 8. 覆盖表

| 键组 | 章节 | 状态 |
| --- | --- | --- |
| 标识/许可/bin/scripts | §1 | covered |
| 依赖面/消费者 | §2-§3 | covered |
| 运行验证 | §7 | unknown（NOT_RUN） |
