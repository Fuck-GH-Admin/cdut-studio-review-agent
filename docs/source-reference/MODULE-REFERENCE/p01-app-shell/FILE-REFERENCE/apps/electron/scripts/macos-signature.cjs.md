---
path: apps/electron/scripts/macos-signature.cjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3150a89065bd4ea726cd1d68090e372262d57d08
sha256: b9e134077ba518d7acd28dc14041f6d1463abcbb711aeb243d2777379a12411c
lines: 283
kind: source
package: p01-app-shell
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/scripts/macos-signature.cjs

## 1. 结论与边界

macOS 签名**契约模块**（Node 脚本库，无 GUI）：打包后对 `CDUT Studio.app` 补做完整 ad-hoc 签名，并把顶层 App 的 designated requirement（DR）钉死为 `identifier "<bundleId>"`，同时提供发布/校验共用的断言 `assertMacSignatureContract`，保证 Squirrel.Mac 自更新校验（`SecStaticCodeCheckValidity(新包, kSecCSDefaultFlags, 旧包 DR)`，文件头注释 `apps/electron/scripts/macos-signature.cjs:13-17`）能跨版本通过。

边界（`apps/electron/scripts/macos-signature.cjs:26-38` 注释自述并经代码核实）：不做 notarization/Gatekeeper（spctl）校验（ad-hoc 必然 rejected，见 `apps/electron/scripts/verify-macos-signature.cjs:6-8`）；不修改 Info.plist（`preAutoEntitlements:false`/`preEmbedProvisioningProfile:false`，`apps/electron/scripts/macos-signature.cjs:192-195`）；不做 DMG/ZIP 打包与发布上传；不提供 hardened runtime/entitlements（`:167-168`、`:197`）。真实 Developer ID 签名存在时调用方直接跳过补签（`apps/electron/scripts/after-sign-mac.cjs:41-48`）。

## 2. 导出与关键符号

导出 10 项（`module.exports`，`apps/electron/scripts/macos-signature.cjs:272-283`，1 常量 + 9 函数）：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `PRODUCT_APP_NAME` | 常量（导出） | 44 | `'CDUT Studio.app'` | 当前产品解包目录名 |
| `findMacAppBundle` | 函数（导出） | 49-59 | `(outputDir) => string \| null` | 查找 App bundle；先直查 `outputDir/<名>`，再扫一层子目录 |
| `expectedDesignatedRequirement` | 函数（导出） | 67-72 | `(bundleId) => string` | 返回 `identifier "<bundleId>"`；空 id 抛错（`:68-70`） |
| `parseDesignatedRequirement` | 函数（导出） | 103-106 | `(codesignOutput) => string \| null` | 解析 `designated =>`（兼容行首 `#` 派生写法） |
| `readBundleIdentifier` | 函数（导出） | 87-97 | `(appPath) => string` | PlistBuddy 读 `CFBundleIdentifier` |
| `readDesignatedRequirement` | 函数（导出） | 109-112 | `(target) => string \| null` | 读目标 DR 表达式 |
| `readSignatureInfo` | 函数（导出） | 115-130 | `(target) => {identifier, teamIdentifier, cdhash, signature, isAdhoc}` | 读签名摘要（`-dvvv`） |
| `resolveOsxSign` | 函数（导出） | 138-161 | `() => Module` | 从 Bun 虚拟仓库解析 `@electron/osx-sign`（唯一命中才返回） |
| `signMacAppWithPinnedRequirement` | 函数（导出，async） | 170-208 | `async (appPath) => {bundleId, requirement}` | ad-hoc 补签 + 钉死顶层 DR |
| `assertMacSignatureContract` | 函数（导出） | 219-270 | `(appPath) => {ok, appBundle, bundleId, designatedRequirement, nestedAppCount}` | 四项签名契约断言，失败抛错 |

内部符号：`runCodesign`（内部，`:74-84`，execFileSync 包装，失败返回 `{ok:false}` 不抛）；`pick`（内部，`:118-121`，`readSignatureInfo` 内的 `key=value` 提取器）。内部常量：`ADHOC_TEAM_IDENTIFIER='not set'`（`:45`）、`REQUIREMENTS_FILE_PREFIX`（`:46`）。

## 3. 内部逻辑与关键流程

1. `findMacAppBundle`（`:49-59`）：优先 `outputDir/CDUT Studio.app`（`:50-51`），否则遍历一层子目录找 `<sub>/CDUT Studio.app`（`:53-57`），都不存在返回 `null`（`:58`）。只认当前产品名，避免误用旧品牌残留（`:48` 注释）。
2. `expectedDesignatedRequirement`（`:67-72`）：非字符串/空 bundleId 抛 `无法为空的 bundle identifier 构造 designated requirement`（`:68-70`）；否则返回 `identifier "<bundleId>"`（`:71`）。ad-hoc 无证书链可锚，这是唯一跨版本稳定形式（`:64-65`）。
3. `runCodesign`（`:74-84`）：`execFileSync('codesign', …, stdio:['ignore','pipe','pipe'])`；`--display` 系列输出走 stderr 故合并两路（`:75-82`）；异常转 `{ok:false, output: stdout+stderr}`（`:79-83`）。
4. `readBundleIdentifier`（`:87-97`）：缺 `Contents/Info.plist` 抛错（`:89`）；`/usr/libexec/PlistBuddy -c 'Print :CFBundleIdentifier'`（`:90-94`）；空值抛错（`:95`）。
5. `parseDesignatedRequirement`（`:103-106`）：正则 `/^\s*#?\s*designated\s*=>\s*(.+?)\s*$/m`，显式 `-r` 写入（无 `#`）与缺省派生（带 `#`）两种输出都解析（`:100-102`）；无匹配返回 `null`。
6. `readSignatureInfo`（`:115-130`）：`codesign -d -vvv` 失败抛错（`:117`）；提取 `Identifier/TeamIdentifier/CDHash/Signature`（`:118-127`）；`isAdhoc = teamIdentifier==='not set' \|\| Signature==='adhoc'`（`:128`）。
7. `resolveOsxSign`（`:138-161`）：`repoRoot=…/../../..`（`:139`）；先在 `node_modules/.bun` 找 `@electron+osx-sign@*` 隔离副本（`:140-146`），否则回退 hoisted 两个候选路径（`:147-152`）；候选数 `!==1` 抛错并提示 `bun install --frozen-lockfile`（`:154-159`），只接受仓库内已锁定版本、不触发网络下载（`:135-136`）。
8. `signMacAppWithPinnedRequirement`（`:170-208`）：App 不存在抛错（`:172`）→ 读 bundleId（`:174`）→ 在 `os.tmpdir()` mkdtemp 写 `requirement.txt`，内容 `designated => identifier "<id>"\n`（走文件路径支，`:180-182`）→ `signAsync({app, identity:'-', identityValidation:false, platform:'darwin', preAutoEntitlements:false, preEmbedProvisioningProfile:false, optionsForFile})`（`:186-202`）；`optionsForFile` 每目标返回 `hardenedRuntime:false, timestamp:'none'`，且 `requirements` 文件仅施加于顶层 App（`path.resolve(filePath)===resolvedApp`，`:196-201`）→ `finally` 删除临时目录（`:203-205`）→ 返回 `{bundleId, requirement}`（`:207`）。
9. `assertMacSignatureContract`（`:219-270`）：四项校验：① `codesign --verify --deep --strict`（`:227-228`）；② 普通 `--verify`（`:230-231`）；③ DR 等于 `identifier "<bundleId>"`（`:233-239`，缺失/不等抛错并指出 Squirrel 后果）；④ 复现 Squirrel 路径 `--verify -R=identifier "<id>"`（`:241-245`）。随后检查 `Contents/Frameworks` 下嵌套 `.app`（`:247-252`），任一嵌套 App 的 identifier 等于顶层 bundleId 即抛错（`:253-261`，防误用 `codesign --deep --identifier`）。返回 `{ok:true, appBundle, bundleId, designatedRequirement, nestedAppCount}`（`:263-269`）。

## 4. 调用者与调用链

入向（grep 全冻结树 `macos-signature` + 各导出符号名）：

- electron-builder afterSign 钩子：`apps/electron/electron-builder.yml:27` `afterSign: scripts/after-sign-mac.cjs` → `apps/electron/scripts/after-sign-mac.cjs:19` `require('./macos-signature.cjs')`，消费 `readSignatureInfo`（`:40`）、`assertMacSignatureContract`（`:46`、`:52`）、`signMacAppWithPinnedRequirement`（`:51`）。**QA 预读线索②回源核实成立**：macos-signature.cjs 经 after-sign-mac.cjs 被 afterSign 钩子调用；钩子挂载由 `apps/electron/scripts/packaging-guards.test.ts:158` 断言。
- `apps/electron/scripts/verify-macos-signature.cjs:15`（`PRODUCT_APP_NAME`/`findMacAppBundle`/`assertMacSignatureContract`，使用点 `:23-28`），入口 `apps/electron/package.json:63` `verify:mac-signature`。
- `apps/electron/scripts/verify-macos-package.cjs:12`（`PRODUCT_APP_NAME`/`findMacAppBundle`）。
- 根发布脚本 `scripts/push-mac-release.cjs:22`（三个符号），使用点 `:74-76`。
- 测试 `apps/electron/scripts/packaging-guards.test.ts:33-38`（require 5 个符号）。

出向：`node:child_process.execFileSync`（codesign `:77`、`:110`、`:116`，PlistBuddy `:90-94`）；`node:fs`/`node:os`/`node:path`；`@electron/osx-sign` 的 `signAsync`（动态 `require` `:160`，调用 `:186`）。

零外部消费者（否定检索：全冻结树（含 .cjs/.js/.ts/.mjs/.yml/.json/.nsh）grep 导出符号名，排除本文件）：`readBundleIdentifier`（仅内部 `:174`、`:223`）、`readDesignatedRequirement`（仅内部 `:233`）、`resolveOsxSign`（仅内部 `:184`）三个导出无外部调用者；`parseDesignatedRequirement`/`expectedDesignatedRequirement`/`findMacAppBundle`/`PRODUCT_APP_NAME` 仅被上列验证/发布脚本与测试消费。

## 5. 数据 I/O、读写与副作用

- 读：`Contents/Info.plist`（经 PlistBuddy，`:88-94`）；codesign 签名状态输出（`:110`、`:116`）；`node_modules` 目录扫描（`:140-152`）。
- 写：临时 requirement 文件 `os.tmpdir()/cdut-studio-mac-designated-requirement-*/requirement.txt`（`:176-182`），`finally` 删除（`:204`）；经 `signAsync` 改写 App bundle 内各目标的签名字节（`:186-202`）。
- 副作用：子进程（codesign/PlistBuddy）；不写 JSON/缓存/遥测；无网络调用（`resolveOsxSign` 明确不触发网络下载，`:135-136`）。

## 6. 分支、失败、取消与恢复

- `expectedDesignatedRequirement`：空/非字符串 bundleId → throw（`:68-70`）。
- `readBundleIdentifier`：缺 Info.plist → throw（`:89`）；空 CFBundleIdentifier → throw（`:95`）。
- `runCodesign`：失败不抛，返回 `ok:false`（`:79-83`）；`readSignatureInfo` 对 `ok:false` throw（`:117`）。
- `resolveOsxSign`：候选数 `!==1` → throw（`:154-159`）。
- `signMacAppWithPinnedRequirement`：App 不存在 → throw（`:172`）；`signAsync` 异常向上抛，临时目录仍被清理（`:203-205`）。
- `assertMacSignatureContract`：五处 throw——strict 校验失败（`:228`）、普通校验失败（`:231`）、DR 不符（`:235-238`）、不满足自身 DR（`:243-244`）、嵌套 App 被签成顶层 id（`:256-259`）。
- 无取消/超时/重试机制；失败后磁盘状态=部分重签的 bundle（重跑可再签，幂等性推断：相同参数重签不改变 DR 语义，未实测）。不可恢复点：DR 一旦以某版本发布不得变更（`:32-33` 约束，变更=强制用户手动重装）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role/actor 检查。权威状态来源：macOS 签名系统（codesign 输出）与 Info.plist 的 `CFBundleIdentifier`（`:86-97`）；DR 契约由本文件单一定义，`assertMacSignatureContract` 供 dist/发布脚本共用避免门禁漂移（`:210-218` 注释）。存在真实 Developer ID 签名时“不覆盖”的判定在调用方 `apps/electron/scripts/after-sign-mac.cjs:41-48`（`teamIdentifier` 非 `not set` 即跳过补签）。

## 8. 修改影响面

- 直接调用方：`apps/electron/scripts/after-sign-mac.cjs`（构建签名钩子）、`apps/electron/scripts/verify-macos-signature.cjs`、`apps/electron/scripts/verify-macos-package.cjs`、`scripts/push-mac-release.cjs`；测试 `apps/electron/scripts/packaging-guards.test.ts`（导出形状、`PRODUCT_APP_NAME` 值、DR 格式、解析器行为均有断言，见 §9）。
- DR 语义变更（如改回 cdhash/`--deep`）会使已发布版本的 Squirrel.Mac 自更新全部安装失败（`:28-33` 约束）；嵌套 App identifier 检查是防回归门禁（`:253-261`）。
- `PRODUCT_APP_NAME` 与 electron-builder `productName` 的一致性由 `apps/electron/scripts/packaging-guards.test.ts:137` 断言（`${productName}.app`）。

## 9. 测试证据

直接测试：`apps/electron/scripts/packaging-guards.test.ts`（describe `macOS 签名契约` `:199`）：

- `:200-212`（findMacAppBundle）：旧品牌 `Profer.app` 残留拒绝（`expect(findMacAppBundle(root)).toBeNull()` `:203`）、嵌套目录命中（`:207`）、直查优先（`:211`）、缺失目录 `null`（`:212`）。
- `:215-219`（expectedDesignatedRequirement）：`'identifier "com.profer.app"'`（`:218`）、空串抛 `'bundle identifier'`（`:219`）。
- `:222-238`（parseDesignatedRequirement）：显式 `designated =>`（`:227`）、`#` 派生 cdhash（`:234-236`）、无匹配 `null`（`:238`）。
- `:241-249`（assertMacSignatureContract 失败路径）：空 App 抛 `'Info.plist'`（`:246`）、缺失 App 抛 `'不存在'`（`:247-248`）；`if (process.platform !== 'darwin') return` 守卫（`:242`）——非 macOS 平台跳过。
- 契约字符串断言：`afterSign: scripts/after-sign-mac.cjs`（`:158`）、push 脚本用 `assertMacSignatureContract(appPath)` 且禁 `run(\`spctl`（`:168-173`）、`verify:mac-signature` 值（`:176`）。

未覆盖：`signMacAppWithPinnedRequirement`、`readSignatureInfo`、`readBundleIdentifier`、`resolveOsxSign`、`runCodesign` 无任何直接测试（检索：全冻结树 `*.test.*` grep 符号名，仅本测试文件命中上列符号）；真实签名跳过分支（`after-sign-mac.cjs:41-48`）无测试。`NOT_RUN`：本轮未执行任何测试（bun test/typecheck/build/Electron GUI/真实 codesign 均未运行），断言均为静态阅读所得。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 导出清单与行号 | 已证实 | `apps/electron/scripts/macos-signature.cjs:272-283` |
| DR 钉死为 `identifier "<bundleId>"`、仅施加顶层 App | 已证实 | `:71`、`:196-201` |
| afterSign 钩子消费 4 个导出 | 已证实 | `apps/electron/scripts/after-sign-mac.cjs:19`、`:40`、`:51`、`:52` |
| 嵌套 App identifier 不得等于顶层 id | 已证实 | `:253-261` |
| `readBundleIdentifier`/`readDesignatedRequirement`/`resolveOsxSign` 无外部消费者 | 已证实 | 全冻结树符号名检索（.cjs/.js/.ts/.mjs/.yml/.json/.nsh）仅本文件命中 |
| 重签幂等（同参数重跑不改变 DR 语义） | 推断 | 代码语义推断，未实测 |
| Squirrel.Mac 校验行为描述（SQRLCodeSignature.m） | 推断 | 文件头注释 `:13-17` 转述，Squirrel 源不在冻结树 |
| `@electron/osx-sign` 内部按深度倒序逐目标签名 | 推断 | `:166-168` 注释 + 调用方式，未读其实现 |
| notarization/Gatekeeper 状态 | 未知 | 本文件与验证脚本均不检查（`:36-37`、verify 脚本 `:6-8`），未读系统状态 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `PRODUCT_APP_NAME` | §2/§4/§8 | 44 | covered |
| `findMacAppBundle` | §2/§3.1/§9 | 49-59 | covered |
| `expectedDesignatedRequirement` | §2/§3.2/§6/§9 | 67-72 | covered |
| `runCodesign`（内部） | §2/§3.3/§6 | 74-84 | covered |
| `readBundleIdentifier` | §2/§3.4/§6 | 87-97 | covered |
| `parseDesignatedRequirement` | §2/§3.5/§9 | 103-106 | covered |
| `readDesignatedRequirement` | §2/§3.5/§4 | 109-112 | covered |
| `readSignatureInfo` | §2/§3.6/§4 | 115-130 | covered |
| `resolveOsxSign` | §2/§3.7/§6 | 138-161 | covered |
| `signMacAppWithPinnedRequirement` | §2/§3.8/§5/§6 | 170-208 | covered（无直接测试） |
| `assertMacSignatureContract` | §2/§3.9/§6/§9 | 219-270 | covered |
| 嵌套 App 校验分支 | §3.9/§8 | 253-261 | covered |
| 真实签名跳过（调用方） | §1/§7 | after-sign-mac.cjs:41-48 | covered（外部） |
