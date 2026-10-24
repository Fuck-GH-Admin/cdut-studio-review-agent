---
path: apps/electron/scripts/packaging-guards.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9fd182bd239dfa5e4e9aa04632602be3fb422f12
sha256: 0f04bffd99ab739ecd52decafc71b44f9909e2cf7d17d0c07ef207b20c1291b4
lines: 388
kind: test
package: p01-app-shell
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/scripts/packaging-guards.test.ts

## 1. 测试目标

打包/发布链路的**契约门禁测试**（bun:test）：验证①Windows 打包宿主门禁不可绕过、②Windows 随包 CLI 文件名/内容契约、③electron-builder.yml 与 release.yml/发布脚本/版本号的跨文件契约一致、④macOS ad-hoc 签名 DR 契约的构造/解析/查找逻辑、⑤核心打包配置与图标资产完整性、⑥内置技能库（default-skills）完整性与文件数安全水位。

被测对象（真实模块，无 mock）：`apps/electron/scripts/packaging-host.cjs`、`apps/electron/scripts/packaged-cli-contract.cjs`、`apps/electron/scripts/macos-signature.cjs`（`require` 加载，`apps/electron/scripts/packaging-guards.test.ts:25-38`），以及冻结仓内真实配置/资产文件（electron-builder.yml、release.yml、push-mac-release.cjs、package.json、CHANGELOG.json、icons、default-skills）。断言 = 静态阅读所得，本轮 `NOT_RUN`（未执行 bun test/typecheck/build/GUI）。

## 2. 用例清单

实测计数：`test(` 19 个、`it(` 0 个（`grep -nE "^\s*(test|it)\("` 全文件核对），分布于 6 个 `describe`（`apps/electron/scripts/packaging-guards.test.ts:70/93/123/199/265/306`）。依赖顺序：无顺序耦合，每用例独立；`afterEach`（`:64-68`）统一清理 `temporaryRoots`（`:40`）。

| # | 用例（行） | 设置 | 动作 | 断言要点 |
| --- | --- | --- | --- | --- |
| 1 | Windows 宿主门禁·非 Windows 宿主（:71-74） | 无 | `assertPackagingHost('win','darwin'/'linux')` | 抛「Windows 打包必须在 Windows 宿主上运行」 |
| 2 | Windows 宿主门禁·win32 放行（:76-80） | 无 | `assertPackagingHost('win','win32')`、`getRequestedPlatform(['--x64','--win'])`、`assertBuilderPackagingHost(['--win','--x64'],'win32')` | 不抛；平台解析='win' |
| 3 | 组合参数不可绕过（:82-90） | 无 | `getRequestedPlatforms(['--mac','--win'])`；`assertBuilderPackagingHost` 对 `['--mac','--win']`/`['-mw']`/`['--win=nsis']` | `['mac','win']`；三种写法均抛门禁 |
| 4 | CLI 契约·仅 profer.exe（:94-100） | 临时 bin 目录放非空 profer.exe | `verifyPackagedWindowsCli` | 返回该 cli 路径 |
| 5 | CLI 契约·缺失/无扩展名（:102-109） | 空缺目录；只放 `profer` | 同上 | 抛「目录不存在」/「必须且只能包含 profer.exe」 |
| 6 | CLI 契约·双文件/空 exe（:111-120） | profer+profer.exe；空 profer.exe | 同上 | 抛「必须且只能包含 profer.exe」/「不能为空」 |
| 7 | release.yml 文件名契约（:124-138） | 读 electron-builder.yml+release.yml | 由 productName/nsis.artifactName 推导 installer 名 | workflow 含 `out/win-unpacked/${productName}.exe`、`"${installer}"`、`"${installer}.blockmap"`；不含旧品牌 `Profer.exe`；`PRODUCT_APP_NAME`==`${productName}.app` |
| 8 | 分平台 CLI 复制（:140-152） | 读 electron-builder.yml 各顶层段 | `getTopLevelSection` 切段 | common extraResources 不含 `resources/bin`；mac/linux `from: resources/bin/profer → to: bin/profer`；win `profer.exe → bin/profer.exe` |
| 9 | macOS 签名钩子（:154-160） | 读 electron-builder.yml | 文本包含断言 | 含 `afterSign: scripts/after-sign-mac.cjs`、`afterPack: scripts/after-pack.cjs` |
| 10 | 发布脚本用共享签名契约（:162-181） | 读 push-mac-release.cjs+package.json+CHANGELOG.json | 正则/包含断言 | 不匹配 `run(\`spctl`；含 `assertMacSignatureContract(appPath)` 与对 macos-signature.cjs 的 require；含 `zip.blockmap`；`verify:mac-signature` 脚本串精确相等；CHANGELOG `releases[0].version`==package.json version |
| 11 | Windows 脚本门禁前置（:183-196） | 读 package.json scripts | 4 脚本前缀断言 | `dist:win`/`dist:win-github`/`dist:win-commercial`/`release:verify:windows` 均以 `bun run verify:packaging-host:win &&` 开头 |
| 12 | findMacAppBundle 选取（:200-213） | 临时目录放 Profer.app/嵌套/直接 `<PRODUCT_APP_NAME>` | `findMacAppBundle` | 旧品牌目录返回 null；嵌套 `mac-arm64/<产品>.app` 可寻；直接目录可寻；缺失目录 null |
| 13 | DR 构造（:215-220） | 无 | `expectedDesignatedRequirement` | `identifier "com.profer.app"`；空 bundleId 抛「bundle identifier」 |
| 14 | DR 解析（:222-239） | 构造 codesign 输出文本 | `parseDesignatedRequirement` | 显式 `designated =>` 与 `# designated => cdhash H"…"` 两种写法都解析；无匹配返回 null |
| 15 | 未签名产物断言契约（:241-249） | 空 `Profer.app`（仅 Contents）、缺失 .app；**仅 darwin 执行**（`:242`） | `assertMacSignatureContract` | 抛「Info.plist」/「不存在」 |
| 16 | 核心资产完整性（:266-303） | 读仓库真实文件 | 存在性/字节/头解析 | electron-builder.yml 存在 >1000 字符且含 appId/productName/directories/win/nsis；icon.ico >10KB 且合法 ICO 图数>0；icon.png >10KB 且 1024x1024；icon.icns、CDUT_Studio.svg、根 package.json、bun.lock、app package.json、tsconfig.json、vite.config.ts 存在 |
| 17 | 17 技能 SKILL.md 完整（:327-342） | 读 default-skills/ | 逐技能断言 | `EXPECTED_DEFAULT_SKILLS`（:307-325，17 项）每项目录+SKILL.md 存在、trim>50 字符、含 `name:` |
| 18 | 重型技能关键脚本/Schemas（:344-364） | 读 default-skills/ | `criticalPaths` 8 项断言（:349-358） | docx/pptx/xlsx 的 pack.py 与 wml/pml/sml.xsd、skill-creator quick_validate.py、session-cleaner references/cli-usage.md 均存在且 size>0 |
| 19 | 技能库文件数安全水位（:366-386） | 递归统计 default-skills/ | `countFiles`（:370-381） | `totalFiles >= 200`（注释：历史全套 schemas 约 240 个，`:384-385`） |

内部辅助（非用例）：`createTemporaryRoot`（`:42-46`，mkdtempSync 前缀 `profer-packaging-guard-`）、`createBinDir`（`:48-52`）、`getTopLevelSection`（`:54-62`，按 `key:\n` 起、下一个顶层键止切 YAML 段，缺段抛「配置缺少 … 段」）、`readPngSize`（`:253-256`，IHDR 偏移 16/20 读 UInt32BE 宽高）、`readIcoImageCount`（`:259-263`，ICO 头 `00 00 01 00` + 偏移 4 UInt16LE 图数，非法头 -1）、`countFiles`（`:370-381`，用例 19 内部）。类型接口 `PackagingHostModule`（`:6-11`）、`PackagedCliContractModule`（`:13-15`）、`MacSignatureModule`（`:17-23`）仅作 require 返回值的形状声明（纯类型，无运行时）。

## 3. 真实断言

均为 bun:test `expect`，关键断言实录（行号=本测试文件）：

- 门禁抛错文案断言：`apps/electron/scripts/packaging-guards.test.ts:72-73`（toThrow('Windows 打包必须在 Windows 宿主上运行')）、`:84-89`（三种参数写法）。
- 平台解析：`:78`（`getRequestedPlatform(['--x64','--win'])` toBe('win')）、`:83`（toEqual(['mac','win'])）。实测实现 `apps/electron/scripts/packaging-host.cjs:23-34`（`-mlw` 组合简写按字符展开、去重）。
- CLI 契约：`:99`（toBe(cliPath)）、`:104/:108/:115/:119`（toThrow 逐文案，与实现 `apps/electron/scripts/packaged-cli-contract.cjs:10-29` 抛错一一对应）。
- 跨文件文件名契约：`:130-137`（productName/artifactName 定义→workflow 含 `out/win-unpacked/${productName}.exe`、installer/blockmap 串、否定旧品牌 `Profer.exe`、`PRODUCT_APP_NAME` toBe `${productName}.app`）。实测：`apps/electron/electron-builder.yml:5`（productName: CDUT Studio）、`:202-203`（nsis artifactName: CDUT-Studio-Setup-${version}.${ext}）、`.github/workflows/release.yml:105`（`out/win-unpacked/CDUT Studio.exe`）、`:187`（`"CDUT-Studio-Setup-$version.exe.blockmap"`）、`apps/electron/scripts/macos-signature.cjs:44`（PRODUCT_APP_NAME='CDUT Studio.app'）。
- 分平台资源段：`:148-151`。实测 `apps/electron/electron-builder.yml:70`（extraResources 公共段无 resources/bin）、`:135-136`、`:172-173`、`:182-183`（`from: …\n      to: …` 六空格缩进逐字匹配）。
- 钩子：`:158-159` ↔ `apps/electron/electron-builder.yml:27`（afterSign）、`:20`（afterPack）。
- 发布脚本契约：`:171-176`。实测 `scripts/push-mac-release.cjs:76`（`assertMacSignatureContract(appPath)`）、`:22`（require('../apps/electron/scripts/macos-signature.cjs')）、`:67`（注释含 `zip.blockmap`）、`:11`（注释说明 spctl 不作门禁；全文无 `run(\`spctl`）；`apps/electron/package.json:63`（`verify:mac-signature`: `node scripts/verify-macos-signature.cjs`）。
- 版本一致：`:180`（CHANGELOG `releases[0].version` toBe packageJson.version）。实测 `apps/electron/resources/CHANGELOG.json:4`（"version": "0.15.161"）== `apps/electron/package.json:3`（"version": "0.15.161"）。
- 脚本前缀：`:194`（toStartWith('bun run verify:packaging-host:win &&')）。实测 `apps/electron/package.json:39/57/58/59` 四脚本均以前缀开头。
- DR 契约：`:218-219`、`:227/:234-236/:238`、`:246/:247-248`。实测实现 `apps/electron/scripts/macos-signature.cjs:67-72`（`identifier "<bundleId>"`，空抛）、`:103-106`（正则 `^\s*#?\s*designated\s*=>\s*(.+?)\s*$` m 标志，兼容 `#` 前缀）、`:219-221`（不存在抛「macOS App 不存在」）、`:89`（缺 Info.plist 抛）。
- 资产断言：`:274-302`（长度/存在性/ICO 头/PNG 尺寸 1024x1024）。
- 技能库断言：`:333-341`（17 技能循环）、`:360-363`（8 criticalPaths）、`:385`（toBeGreaterThanOrEqual(200)）。

## 4. 未覆盖与脆弱点

未覆盖（实测确认）：
1. `packaging-host.cjs` CLI 入口分支（`:57-71`：缺平台参数 exit 2、抛错 exit 2）与 `getRequestedPlatforms` 对 `-mlw` 中非法组合的分支，均无断言。
2. `packaged-cli-contract.cjs:24-26`（binDir 条目是目录而非普通文件）分支无用例（现有用例只放文件）；CLI 入口（`:36-47`）未测。
3. `macos-signature.cjs` 的 `assertMacSignatureContract` 成功路径（`:227-269` 四步 codesign 校验、嵌套 helper 防线 `:253-261`）、`signMacAppWithPinnedRequirement`/`resolveOsxSign`/`readSignatureInfo`/`readBundleIdentifier`（成功分支）未测——需真实签名产物与 darwin 环境，属运行验证，本轮 `NOT_RUN`。
4. `findMacAppBundle` 多个嵌套候选同在时的选取顺序（`:53-57` 先到先得）无用例。
5. `readIcoImageCount` 非法头返回 -1 分支（`:259-263`）无用例；`getTopLevelSection` 抛错分支仅靠缺段时被动触发。
6. 用例 15（`apps/electron/scripts/packaging-guards.test.ts:242`）`if (process.platform !== 'darwin') return`：非 macOS 宿主上**整用例静默跳过**（不失败也不计入断言），Linux/Windows CI 上该覆盖为 0——审计时勿把「测试文件存在」误读为「DR 失败路径已验证」。
7. `verifyPackagedWindowsCli` 对子目录/符号链接等非常规条目的行为未断言。

脆弱点：
- 用例 7/8/9/10/11 依赖精确字符串/缩进（如 `'from: resources/bin/profer\n      to: bin/profer'`、workflow 引号串、脚本前缀）——配置改名、缩进调整、版本号字段改名会连锁失败（这正是门禁目的，但报错面是文本不匹配）。
- `EXPECTED_DEFAULT_SKILLS`（:307-325）与 `criticalPaths`（:349-358）为硬编码清单：增删技能必须同步改测试；QA 预读线索曾称「237 文件清单」，实测断言为 `>=200` 安全水位（注释约 240，`apps/electron/scripts/packaging-guards.test.ts:384-385`），以实测为准。
- 用例 3 的 `-mw` 简写断言依赖 `packaging-host.cjs:29` 的正则 `/^-[mlw]{2,3}$/`。
- 用例 16 的 PNG 尺寸断言固定 1024x1024：换图标规格需同步改测试。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 19 个 test、6 个 describe、0 个 it | 已证实 | `apps/electron/scripts/packaging-guards.test.ts:70-386`（grep 实测计数 19） |
| 被测模块经 require 真实加载，无 mock/桩 | 已证实 | `apps/electron/scripts/packaging-guards.test.ts:25-38`（require 三个真实 .cjs）；全文无 `mock`/`spy`/`mock.module` |
| 门禁文案与实现抛错一致 | 已证实 | `apps/electron/scripts/packaging-guards.test.ts:72-73` ↔ `apps/electron/scripts/packaging-host.cjs:36-42` |
| CLI 契约三组拒绝分支与实现一致 | 已证实 | `apps/electron/scripts/packaging-guards.test.ts:102-120` ↔ `apps/electron/scripts/packaged-cli-contract.cjs:9-32` |
| release.yml/electron-builder.yml/PRODUCT_APP_NAME 三方文件名契约当前成立 | 已证实 | `apps/electron/scripts/packaging-guards.test.ts:128-137` ↔ `apps/electron/electron-builder.yml:5,202-203`、`.github/workflows/release.yml:105,187`、`apps/electron/scripts/macos-signature.cjs:44` |
| 版本三方一致 0.15.161 | 已证实 | `apps/electron/package.json:3`、`apps/electron/resources/CHANGELOG.json:4` |
| 临时目录清理在 afterEach 执行 | 已证实 | `apps/electron/scripts/packaging-guards.test.ts:64-68` |
| 17 技能/8 criticalPaths/≥200 文件水位为当前断言口径 | 已证实 | `apps/electron/scripts/packaging-guards.test.ts:307-325,349-358,385` |
| 非 darwin 上用例 15 的 DR 失败路径断言不执行 | 已证实（静态逻辑） | `apps/electron/scripts/packaging-guards.test.ts:242` |
| 该门禁在 CI 中的触发方式（bun test / 哪个 workflow） | 未知 | 本文件不声明 runner；仅静态阅读，未读全部 CI 调用面 |
| 各 toThrow 文案在真实打包失败时的用户可见效果 | 推断 | 由 `packaging-host.cjs:36-42` 抛错文本推断，未运行验证 |
| 全部断言在真实执行下是否通过 | 未知（NOT_RUN） | 本轮未执行任何测试，见 §4.6 平台跳过风险 |

## 6. 覆盖表

| 符号/用例组 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| describe 6 组 / test 19 用例 | §2 | 70-386 | covered |
| `createTemporaryRoot`/`createBinDir`/`afterEach` 清理 | §2 | 42-52, 64-68 | covered |
| `getTopLevelSection` | §2 | 54-62 | covered |
| `readPngSize`/`readIcoImageCount` | §2 | 253-263 | covered |
| `countFiles` | §2 | 370-381 | covered |
| 接口 `PackagingHostModule`/`PackagedCliContractModule`/`MacSignatureModule` | §2 | 6-23 | covered（纯类型） |
| Windows 门禁 3 用例 | §2-3 | 70-91 | covered |
| CLI 契约 3 用例 | §2-3 | 93-121 | covered |
| 平台入口配置 5 用例 | §2-3 | 123-197 | covered |
| macOS 签名契约 4 用例（用例 15 仅 darwin） | §2-3 | 199-250 | covered（跨平台执行差异见 §4.6） |
| 资产完整性 1 用例 | §2-3 | 265-304 | covered |
| 技能库 3 用例 | §2-3 | 306-387 | covered |
| 被测模块成功/CLI 入口分支 | §4 | packaging-host.cjs:57-71 等 | unknown（未覆盖） |
| CI 实际运行结果 | §5 | - | unknown（NOT_RUN） |
