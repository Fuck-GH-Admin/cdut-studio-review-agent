---
path: scripts/release-asset-contract.cjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8df04f55650fdd00cb6a4c446d9ef57f81848d02
sha256: 95636c3697807d3b49687e8f840f6576ccc62335f5365feb8ab6a6fd29433ff6
lines: 41
kind: source
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# scripts/release-asset-contract.cjs

## 1. 结论与边界

**macOS 补充发布资产的前置契约模块**（41 行 CJS）：纯函数，校验「目标 GitHub Release 已存在、非草稿、且含完整 Windows 发布资产」，供 macOS 补资产流程在创建/上传任何 Release 前断言，防止抢先发布（契约注释 `scripts/release-asset-contract.cjs:13-15`：macOS 只负责给已完成的 Windows Release 补充资产，不能抢先创建或发布版本）。边界：不做网络请求、不读磁盘、不写 Release——只消费调用方传入的 release 对象形状；版本 tag 拼接（`v${version}`）与资产命名约定（`CDUT-Studio-Setup-*`）是本模块权威。

## 2. 导出与关键符号

逐条 export 核对（`scripts/release-asset-contract.cjs:38-41`，共 2 个导出，与源码一致）：
- `requiredWindowsReleaseAssetNames(version)`（导出，`scripts/release-asset-contract.cjs:5-11`）：返回 `[...WINDOWS_RELEASE_ASSET_NAMES, 'CDUT-Studio-Setup-${version}.exe', 'CDUT-Studio-Setup-${version}.exe.blockmap']`。
- `assertWindowsReleaseReady(release, version)`（导出，`scripts/release-asset-contract.cjs:16-36`）：通过返回 release 本体，失败抛 Error。

内部符号：
- `WINDOWS_RELEASE_ASSET_NAMES`（内部，`scripts/release-asset-contract.cjs:1-3`）：`Object.freeze(['latest.yml'])`，固定元数据资产名。

## 3. 内部逻辑与关键流程

按执行顺序（`scripts/release-asset-contract.cjs:16-36`）：
1. 计算 `tag = 'v' + version`（`scripts/release-asset-contract.cjs:17`）。
2. `release` 为空 → 抛 `未找到 ${tag}；请先完成 Windows 发布，再补充 macOS 资产。`（`scripts/release-asset-contract.cjs:18-19`），短路返回。
3. `release.isDraft !== false` → 抛 `${tag} 尚未确认已发布；…`（`scripts/release-asset-contract.cjs:21-22`），短路；注意比较是与字面量 `false` 严格不等，`undefined` 视同草稿（测试覆盖 `scripts/release-asset-contract.test.ts:26`）。
4. 构建 `assetsByName` Map：`release.assets` 为数组时按 `asset.name` 建映射并过滤无名项，否则空 Map（`scripts/release-asset-contract.cjs:25-27`）。
5. 计算 `missing`：必需资产名清单（`scripts/release-asset-contract.cjs:28`）中，凡映射缺失、`state !== 'uploaded'`、`size` 非有限数或 `size <= 0` 者（`scripts/release-asset-contract.cjs:29-31`）。
6. `missing.length > 0` → 抛 `${tag} 缺少完整的 Windows 发布资产：${missing.join('、')}`（`scripts/release-asset-contract.cjs:32-33`），短路。
7. 通过 → `return release`（`scripts/release-asset-contract.cjs:35`）。

## 4. 调用者与调用链

- 入向（grep 冻结树 `release-asset-contract`）：
  - `scripts/push-mac-release.cjs:20` `require('./release-asset-contract.cjs')`；调用点 `scripts/push-mac-release.cjs:84`（ensureGitHubAssets 内）、`scripts/push-mac-release.cjs:99`（主流程入口断言）、`scripts/push-mac-release.cjs:110`（远程写入前二次断言）。
  - `scripts/release-asset-contract.test.ts:2` `import contract from './release-asset-contract.cjs'`（bun test 唯一测试消费者）。
- 出向：无 import/require，依据：`scripts/release-asset-contract.cjs:1-41` 全文无模块加载语句；`Object`/`Map`/`Array`/`Number` 为 JS 内建（`scripts/release-asset-contract.cjs:1`、`:25`、`:28`、`:30`）。
- 否定结论检索范围：冻结树全量 grep `release-asset-contract`，仅命中上述 2 个代码消费点 + `work/reports/2026-10-03-collaborator-sync-review.md`（文档叙述，非调用）。

## 5. 数据 I/O、读写与副作用

无任何磁盘/网络/JSON 写入点，依据：`scripts/release-asset-contract.cjs:1-41` 无 `fs`/`fetch`/`execSync` 引用。纯内存计算；唯一「副作用」是抛出 Error（§6）。无原子性/幂等问题；同一输入重复调用结果确定（幂等）。

## 6. 分支、失败、取消与恢复

- 失败分支全部 `throw new Error(...)`，无自定义错误码、无 exit code（模块被 require 时不落进程退出）：
  - release 不存在（`scripts/release-asset-contract.cjs:18-19`）；
  - 草稿/未确认发布（`scripts/release-asset-contract.cjs:21-22`）；
  - 资产缺失/未上传完/空文件（`scripts/release-asset-contract.cjs:32-33`，错误信息列出缺失名，以「、」连接）。
- 失败后状态：无状态残留（纯函数）。调用方恢复路径：`scripts/push-mac-release.cjs:124-127` 捕获后打印 `macOS 发布失败：` 并 `process.exit(1)`；重试策略由调用方决定（本模块不重试）。
- 取消：不适用，依据：无异步/信号处理。

## 7. 权限与权威状态

无权限分支，依据：`scripts/release-asset-contract.cjs:1-41` 无 env、token、凭据读取。权威状态：Windows Release 完整性以本模块的资产三元组（`latest.yml` + Setup exe + blockmap，`scripts/release-asset-contract.cjs:1-11`）为权威；「已发布」的判据是 `isDraft === false` 且资产 `state === 'uploaded'` 且 `size > 0`（`scripts/release-asset-contract.cjs:21`、`:30`）。门禁口径差（照实记录）：`release.yml:183-188` 与 `push-release` 签名模式要求四件套（多 `latest.yml.sig` 更新元数据签名）——Windows Release 缺更新元数据签名时本三元组门禁仍放行，macOS 补发场景存在潜在门禁缺口。

## 8. 修改影响面

- 修改 `WINDOWS_RELEASE_ASSET_NAMES`/资产命名（`scripts/release-asset-contract.cjs:1-11`）→ 直接改变 macOS 补资产门槛，并使 `scripts/release-asset-contract.test.ts:7-11` 的 `expectedNames` 断言失配。
- 修改校验语义（`scripts/release-asset-contract.cjs:16-36`）→ 影响 `scripts/push-mac-release.cjs:84`、`:99`、`:110` 三处发布门禁。
- 错误文案变化 → 影响测试 `toThrow` 子串断言（`scripts/release-asset-contract.test.ts:24-26`、`:35`、`:44`、`:48`）。

## 9. 测试证据

`NOT_RUN`（本轮未运行任何脚本/测试，纯静态阅读）。直接测试：`scripts/release-asset-contract.test.ts`（describe 1 个 + `test(`/`it(` grep 计数 = 4，与源码 `scripts/release-asset-contract.test.ts:13,23,29,39` 一致）。真实断言引用：
- `scripts/release-asset-contract.test.ts:14` `expect(requiredWindowsReleaseAssetNames('0.15.68')).toEqual(expectedNames)`；
- `scripts/release-asset-contract.test.ts:17-20` `expect(assertWindowsReleaseReady({isDraft:false,assets},'0.15.68')).toEqual({isDraft:false,assets})`（返回值透传）；
- `scripts/release-asset-contract.test.ts:24-26` 三条 `toThrow`（`'请先完成 Windows 发布'`/`'尚未确认已发布'`×2）；
- `scripts/release-asset-contract.test.ts:34-35` 缺任一资产 `toThrow(missingName)`；
- `scripts/release-asset-contract.test.ts:41-44`（size 0 → `toThrow('latest.yml')`）、`:45-48`（state 'new' → `toThrow('CDUT-Studio-Setup-0.15.68.exe')`）。

测试断言≠运行；以上为静态引用。间接证据：`scripts/push-mac-release.cjs` 三处调用（§4）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出 + 1 内部常量、校验语义与错误文案 | 已证实 | `scripts/release-asset-contract.cjs:1-41` 全文 |
| 入向调用点 3+1 处 | 已证实 | `scripts/push-mac-release.cjs:20,84,99,110`、`scripts/release-asset-contract.test.ts:2` |
| 4 测试用例与断言存在 | 已证实 | `scripts/release-asset-contract.test.ts:13-49` |
| 测试实际通过 | 未知 | NOT_RUN |
| release 对象字段形状（assets[].digest 等）由 gh CLI 提供 | 推断 | 调用点 `scripts/push-mac-release.cjs:81` 的 `--json assets,isDraft,name` |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `requiredWindowsReleaseAssetNames` | §2/§3/§9 | 5-11 | covered |
| `assertWindowsReleaseReady` 全 4 分支 | §2/§3/§6/§9 | 16-36 | covered |
| `WINDOWS_RELEASE_ASSET_NAMES`（内部） | §2 | 1-3 | covered |
| module.exports 清单 | §2 | 38-41 | covered |
| 测试断言覆盖 | §9 | test 13-49 | covered |
| 运行期实际行为 | §10 | - | unknown（NOT_RUN） |
