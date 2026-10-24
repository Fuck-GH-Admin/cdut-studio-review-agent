---
path: bun.lock
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8f2ca834ce27669140c6b443476ea9702e159561
sha256: ab44e38b5b381250f468f2a11e404946aecef01b03098d0a8ff5462fe3b335b8
lines: 3260
kind: config
package: p01-app-shell
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# bun.lock

## 1. 结论与边界

Bun 文本格式锁文件（JSONC 风格、允许多余逗号，如 `bun.lock:10`），把整个 monorepo（10 个 workspace）的完整依赖图——直接依赖、传递依赖、冲突嵌套副本——锁定到精确版本、registry tarball URL 与 sha512 完整性串（条目形如 `bun.lock:286`）。纯数据配置文件，无任何可执行代码（3260 行逐行读毕，全部为 JSON 结构文本）。

边界：不声明依赖意图（版本范围声明在各 `package.json`，如 `apps/electron/package.json:76-189`）；不含安装逻辑与 node_modules 布局规则；不参与运行时打包产物；不存储凭据。

## 2. 导出与关键符号

本文件为配置数据，无 export；下表为顶层键清单（行号实测）：

| 键 | 类型 | 行 | 形状 | 说明 |
| --- | --- | --- | --- | --- |
| `lockfileVersion` | number | `bun.lock:2` | `2` | Bun 文本锁格式版本 |
| `configVersion` | number | `bun.lock:3` | `1` | 锁配置版本 |
| `workspaces` | object | `bun.lock:4-271` | 10 条 | 根 `""`（`name: "proma"` `bun.lock:6`）+ `apps/cli` `bun.lock:26` + `apps/electron` `bun.lock:40` + 6 个 `packages/*` `bun.lock:167-270` |
| `trustedDependencies` | array | `bun.lock:272-274` | `["electron"]` | 仅 electron 被允许运行安装脚本（`bun.lock:273`） |
| `patchedDependencies` | object | `bun.lock:275-278` | 2 条 | `@earendil-works/pi-ai@0.86.1`、`@earendil-works/pi-coding-agent@0.86.1` → `patches/*.patch`（`bun.lock:276-277`，`%2F` 为 URL 编码斜杠） |
| `overrides` | object | `bun.lock:279-284` | 4 条 | `@earendil-works/pi-agent-core`/`pi-ai`/`pi-coding-agent`/`pi-tui` 全钉 `0.86.1`（`bun.lock:280-283`） |
| `packages` | object | `bun.lock:285-3259` | 1487 条 | 1196 条顶层 + 291 条嵌套冲突条目（python 实测计数） |

条目元组：registry 包为 4 元 `["name@version", "url", {deps/peer/optional…}, "sha512-…"]`（`bun.lock:286`）；workspace 包为 1 元 `["@profer/<name>@workspace:<path>"]`（9 条，`bun.lock:572-588`）。URL 统计（python 实测）：`registry.npmmirror.com` 1419 条、空 URL 59 条（如 `@scarf/scarf` `bun.lock:760`、`cheerio` `bun.lock:1212`）、sha512 完整性串 1478 条 = 1487 − 9 条 workspace 别名，账目闭合。

## 3. 内部逻辑与关键流程

结构按行段分区：头部 `bun.lock:1-3` → `workspaces` `bun.lock:4-271` → `trustedDependencies` `bun.lock:272-274` → `patchedDependencies` `bun.lock:275-278` → `overrides` `bun.lock:279-284` → `packages` `bun.lock:285-3259` → 收尾 `bun.lock:3259-3260`。

- workspace 段每条记录 `name`/`version`/`dependencies`/`devDependencies`/`peerDependencies`/`bin`：根 `proma`（`bun.lock:5-25`，deps 2 条 `bun.lock:8-9`、devDeps 9 条 `bun.lock:12-20`、peer `typescript ^5` `bun.lock:23`）；`apps/electron` = `@profer/electron@0.15.161`（`bun.lock:41-42`，与 `apps/electron/package.json:2-3` 双侧一致），deps 16 条（`bun.lock:44-59`）、devDeps 102 条（`bun.lock:63-164`，python 实测计数）；`packages/ui` deps 31 条（`bun.lock:229-259`）。
- `packages` 段顶层按字节序排序（首条 `"7zip-bin"` `bun.lock:286` 先于 `"@aiden0z/…"` `bun.lock:288`，ASCII 序实测；末条 `bun.lock:3258`）。嵌套冲突条目 key 为 `父包/子依赖`，集中于 `bun.lock:2678-3258`（首条 `@aws-sdk/credential-provider-sso/@aws-sdk/token-providers` `bun.lock:2678`），例如 `@profer/electron/jszip` 锁 `3.10.2`（`bun.lock:2748`）与顶层 `jszip@3.10.1`（`bun.lock:1824`）并存；`@profer/electron/@anthropic-ai/sdk` 锁 `0.93.0`（`bun.lock:2746`）与顶层 `0.124.0`（`bun.lock:294`）并存。
- 关键锁定版本（声明→锁定，双侧行号）：`electron ^43.2.0`（`apps/electron/package.json:156`、`bun.lock:130`）→ `43.7.7`（`bun.lock:1468`，bin 含 `install.js`）；`vite ^6.0.3`（`apps/electron/package.json:186`、`bun.lock:161`）→ `6.4.3`（`bun.lock:2612`）；`tailwindcss ^3.4.17`（`apps/electron/package.json:179`、`bun.lock:154`）→ `3.4.19`（`bun.lock:2490`）；`react ^18.3.1`（`apps/electron/package.json:169`、`bun.lock:144`）→ `18.3.1`（`bun.lock:2276`）；`typescript ^5.0.0`（`apps/electron/package.json:183`、`bun.lock:158`）→ `5.9.3`（`bun.lock:2546`）；`zod ^4.0.0`（`apps/electron/package.json:189`、`bun.lock:164`）→ `4.6.5`（`bun.lock:2670`）；`xlsx npm:@stackline/xlsx@^1.0.6` 别名（`apps/electron/package.json:83`、`bun.lock:59`）→ `@stackline/xlsx@1.0.9`（`bun.lock:2646`）。
- shadcn/ui 组件族：`@radix-ui/react-*` 17 条声明（`bun.lock:74-89`）锁定于 `bun.lock:612-690`；`class-variance-authority 0.7.1`（`bun.lock:124`→`bun.lock:1224`）、`clsx`（`bun.lock:125`→`bun.lock:1240`）、`tailwind-merge`（`bun.lock:153`→`bun.lock:2488`）、`lucide-react`（`bun.lock:137`→`bun.lock:1894`）、`cmdk`（`bun.lock:126`→`bun.lock:1242`）。
- TipTap 版本分裂（实测）：`@tiptap/core ^3.19.0`（`bun.lock:94`）锁定 `3.31.4`（`bun.lock:814`），而 table/task 扩展声明精确 `3.19.0`（`bun.lock:99-104`）锁定 `3.19.0`（`bun.lock:864-874`），两族并存。
- 测试框架：根 devDeps 仅 `@types/bun latest`（`bun.lock:12`→`@types/bun@1.4.2` `bun.lock:908`）；`apps/electron` devDeps 无 jest/vitest 声明（`bun.lock:63-164` 全量读毕，仅 `@types/*` 与构建/编辑器类依赖），Bun 测试运行器（`bun test`）不占独立包条目（实测 `bun.lock:285-3259` 无 `bun-test`/`jest`/`vitest`/`mocha` 条目）。
- `patchedDependencies`（`bun.lock:276-277`）指向 `patches/@earendil-works%2Fpi-ai@0.86.1.patch` 与 `…pi-coding-agent@0.86.1.patch`；`patches/` 目录实存 6 个补丁（含 0.82.1/0.84.3 旧版，ls 实测），锁仅引用 2 个 0.86.1 条目。

## 4. 调用者与调用链

入向（谁消费本文件）：

- Bun 包管理器在安装时读取（推断：Bun 官方行为，本轮未读 bun 二进制实现）。仓库内直接消费者全部走 `bun install --frozen-lockfile`：`.github/workflows/ci.yml:42`、`release.yml:44`、`review-ci-baseline.yml:25`、`review-d05-tests.yml:31`、`review-d1-tests.yml:30`、`review-d2-tests.yml:28`、`review-batch-tests.yml:48`、`macos-package.yml:47`。
- `apps/electron/scripts/packaging-guards.test.ts:299` 断言根目录 `bun.lock` 存在（`expect(existsSync(join(repoRoot, 'bun.lock'))).toBe(true)`）。
- 间接指引：`apps/electron/scripts/run-electron-builder.cjs:39`、`apps/electron/scripts/macos-signature.cjs:157` 的错误文案要求用户先运行 `bun install --frozen-lockfile`。
- 否定结论（检索范围：冻结树 05fb 全量、排除 node_modules，grep `bun.lock`，共 6 处命中）：无任何脚本解析锁内容，其余 3 处命中均为历史文档/报告（`work/reports/assets/2026-10-04-ui-acceptance/manifest.json:155` 的历史 hash 记录、`work/decision-log/2026-10-02-decision-log.md:49`、`docs/plans/2026-08-24-student-pptx-implementation.md:668` 等），非代码消费。

出向（本文件引用谁）：各 workspace 的 `package.json` 声明（`bun.lock:7-269` ↔ `apps/electron/package.json:76-189` 等）、`patches/` 补丁文件（`bun.lock:276-277`）、registry tarball URL（`bun.lock:286` 起 1419 条 npmmirror 地址）。

## 5. 数据 I/O、读写与副作用

- 输入：各 `package.json` 的版本范围 + registry 元数据（推断）；输出：精确版本、URL、sha512、依赖闭包与嵌套冲突副本。
- 读路径：`bun install --frozen-lockfile` 以锁为准校验/物化 node_modules（语义为推断，NOT_RUN 未实际执行）；`packaging-guards.test.ts:299` 读存在性。
- 写路径：`bun install`/`bun add` 更新锁（推断）；`macos-package.yml:50-51` 在降级安装后 `git diff bun.lock` 打印差异（workflow 文本证实，本轮未运行）。
- 副作用：本文件自身无进程/窗口/网络/日志副作用（纯数据，无代码）；其内容决定安装时的网络下载集合（`bun.lock:286` 起 URL）。
- 原子性/幂等/并发：bun 写锁的原子性与并发交错未读到实现，未知。

## 6. 分支、失败、取消与恢复

本文件无代码分支（依据：3260 行全为 JSON 数据，无 if/throw/return）。失败与恢复行为体现在消费方：

- frozen 校验失败：`macos-package.yml:43-45` 注释自述「darwin 宿主解析出的依赖图与 Windows 生成的 bun.lock 存在平台级物化差异，frozen 校验会直接失败」；`:47-52` 实现降级——`if ! bun install --frozen-lockfile; then` 打 warning、改跑非冻结 `bun install`（`:49`）、打印 `git diff bun.lock`（`:50-51`）。
- 缺失行为：根 `bun.lock` 缺失会使 `packaging-guards.test.ts:299` 断言失败；`bun install` 在无锁时会重新生成锁文件（推断，NOT_RUN 未验证）。
- 恢复/重入：删除或降级后重跑 `bun install` 重建锁（推断）；历史案例 `work/decision-log/2026-10-02-decision-log.md:49` 记录过「bun.lock 重新生成」（历史文档，仅线索不作 R07 verified 证据）。

## 7. 权限与权威状态

无权限分支，依据：本文件为纯数据锁文件（3260 行逐行读毕，无 sender/role/鉴权检查）。权威状态：依赖版本的唯一锁定权威即本文件（`--frozen-lockfile` 语义下以锁为准，推断）；`overrides`（`bun.lock:279-284`）对 pi 族版本有最高裁决力，强制全树 `0.86.1`。

## 8. 修改影响面

- 改动任意条目影响全部 workspace 的安装结果与 8 个 CI workflow 的 frozen 安装（`ci.yml:42` 等，见 §4）；锁与 `package.json` 不一致时 frozen 校验失败（`macos-package.yml:47-52` 的降级路径即为此设）。
- 必须同步的文件：各 `package.json`（例：`jszip 3.10.2` 声明 `apps/electron/package.json:80` ↔ 锁 `bun.lock:55` + 嵌套 `bun.lock:2748`）；`patches/` 补丁文件 ↔ `bun.lock:276-277`。已知漂移：`patches/` 内 0.82.1/0.84.3 四个旧补丁未被锁引用（`bun.lock:275-278` 仅 2 条；`apps/electron/src/main/lib/adapters/pi-retry-control.ts:13` 注释提及 `pi-coding-agent@0.82.1.patch` 为历史扩展依据，属线索）。
- 打包门禁依赖存在性：`packaging-guards.test.ts:298-302` 同段断言根 `package.json`/`bun.lock`/app `package.json`/`tsconfig.json`/`vite.config.ts`。
- 更新触发点（推断）：依赖升级或 `bun install` 解析结果变化时重写；上游合并需重新生成（历史线索 `work/decision-log/2026-10-02-decision-log.md:49`）。

## 9. 测试证据

- 直接测试：`apps/electron/scripts/packaging-guards.test.ts:299`，设置=仓库根目录、动作=`existsSync(join(repoRoot, 'bun.lock'))`、真实断言=`.toBe(true)`——仅断言文件存在。
- 未覆盖：条目 sha512 与实际 tarball 一致性、锁与 `package.json` 一致性、嵌套冲突条目正确性、frozen 校验行为（无测试断言，检索范围：冻结树 grep `bun.lock` 仅 6 处命中，其中测试仅此 1 处）。
- `NOT_RUN`：本轮未运行任何产品测试/typecheck/build/GUI/安装命令（静态只读取证）；测试断言存在 ≠ 已运行通过。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 格式为 Bun 文本锁 v2（`lockfileVersion: 2`/`configVersion: 1`） | 已证实 | `bun.lock:2-3` |
| 10 个 workspace，根名 `proma`，`apps/electron` = `@profer/electron@0.15.161` | 已证实 | `bun.lock:6`、`bun.lock:41-42`、`bun.lock:4-271` |
| `packages` 1487 条（1196 顶层 + 291 嵌套），9 条 workspace 别名，sha512 1478 条闭合 | 已证实 | `bun.lock:285-3259`（python 实测计数，可复算） |
| npmmirror URL 1419 条、空 URL 59 条 | 已证实 | `bun.lock:286` 起（python 实测计数） |
| `trustedDependencies` 仅 electron；`patchedDependencies` 2 条指向 0.86.1 补丁；`overrides` 钉 pi 族 0.86.1 | 已证实 | `bun.lock:272-284` |
| electron 锁 43.7.7、vite 6.4.3、typescript 5.9.3、react 18.3.1、tailwindcss 3.4.19、zod 4.6.5 | 已证实 | `bun.lock:1468`、`:2612`、`:2546`、`:2276`、`:2490`、`:2670` |
| jszip 3.10.1/3.10.2 与 @anthropic-ai/sdk 0.93.0/0.124.0 双版本经嵌套条目并存 | 已证实 | `bun.lock:1824`+`:2748`、`bun.lock:294`+`:2746` |
| 8 个 CI workflow 用 `bun install --frozen-lockfile` 消费；macos-package 有降级路径 | 已证实 | `.github/workflows/ci.yml:42` 等、`macos-package.yml:47-52` |
| 打包门禁断言锁文件存在 | 已证实 | `apps/electron/scripts/packaging-guards.test.ts:299` |
| 无脚本解析锁内容、无测试断言锁内容 | 已证实（限定范围） | 冻结树 grep `bun.lock` 全量 6 处命中逐条核对（§4） |
| bun 在无锁时自动生成锁、frozen 校验严格拒绝不一致、写锁原子性 | 推断 | Bun 包管理器通用行为，未读其实现、NOT_RUN 未运行验证 |
| 空 URL 条目（如 `cheerio` `bun.lock:1212`）的来源机制（离线缓存/别名记录） | 未知 | 仅观察到字段为空，未读 bun 生成逻辑 |
| bun 写锁的并发交错与中断残留行为 | 未知 | 未读实现、未做运行验证 |

## 11. 覆盖表

| 符号/分区 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 头部 `lockfileVersion`/`configVersion` | §2、§3 | `bun.lock:2-3` | covered |
| `workspaces` 10 条（含 root/apps/cli/apps/electron/packages/*） | §2、§3 | `bun.lock:4-271` | covered |
| `trustedDependencies` | §2、§7 | `bun.lock:272-274` | covered |
| `patchedDependencies` | §2、§8 | `bun.lock:275-278` | covered |
| `overrides` | §2、§7 | `bun.lock:279-284` | covered |
| `packages` 顶层 1196 条（排序、元组格式、URL/完整性统计） | §2、§3 | `bun.lock:285-2677` | covered（统计口径+关键条目，非逐条罗列） |
| `packages` 嵌套 291 条（冲突副本） | §3 | `bun.lock:2678-3258` | covered（机制+代表条目） |
| workspace 别名 9 条 | §2 | `bun.lock:572-588` | covered |
| 关键锁定版本（electron/vite/ts/react/tailwind/zod/xlsx/tiptap/shadcn） | §3 | 见 §3 各行号 | covered |
| 消费者（CI/测试/脚本文案） | §4 | 见 §4 各行号 | covered |
| 写路径与失败/恢复 | §5、§6 | `macos-package.yml:47-52` 等 | partial（bun 内部写行为为推断） |
| 空 URL 条目来源机制 | §10 | `bun.lock:760`、`:1212` | unknown |
