---
path: scripts/release-asset-contract.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1e5b49179f46fe4602136bb2b6459d9a4790a92c
sha256: 4476fbb2becbe2ba6e4767a371b19f89a2dc219bd4325fb518340a4002e017b4
lines: 50
kind: test
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# scripts/release-asset-contract.test.ts

## 1. 测试目标

验证 `scripts/release-asset-contract.cjs` 的两个导出（`requiredWindowsReleaseAssetNames`、`assertWindowsReleaseReady`）实现「macOS 补充发布资产前置条件」契约（describe 标题，`scripts/release-asset-contract.test.ts:6`）：目标 GitHub Release 必须已存在、非草稿、且含完整且已上传的 Windows 发布资产，macOS 流程不得抢先创建或发布版本。运行器为 bun test（`import { describe, expect, test } from 'bun:test'`，`scripts/release-asset-contract.test.ts:1`）；被测对象经 CJS 默认导入取得（`scripts/release-asset-contract.test.ts:2-4`）。

## 2. 用例清单

grep `it(`/`test(` 计数 = 4（`scripts/release-asset-contract.test.ts:13,23,29,39`），describe 1 个（`scripts/release-asset-contract.test.ts:6`）：
1. `要求已发布版本包含完整 Windows 资产`（`scripts/release-asset-contract.test.ts:13-21`）：正路径——完整资产 + `isDraft:false` 时返回 release 本体。
2. `拒绝在 Windows Release 不存在或仍为草稿时抢先发布`（`scripts/release-asset-contract.test.ts:23-27`）：null release、`isDraft:true`、`isDraft` 缺失三种抢先场景。
3. `拒绝缺少任一 Windows 发布资产的版本`（`scripts/release-asset-contract.test.ts:29-37`）：循环 3 个 `expectedNames` 逐一缺失（`scripts/release-asset-contract.test.ts:30-33`）。
4. `拒绝空文件或尚未完成上传的 Windows 资产`（`scripts/release-asset-contract.test.ts:39-49`）：`latest.yml` size=0 与 `.exe` state='new' 两类坏资产。

共享夹具：`expectedNames = ['latest.yml','CDUT-Studio-Setup-0.15.68.exe','CDUT-Studio-Setup-0.15.68.exe.blockmap']`（`scripts/release-asset-contract.test.ts:7-11`）。

## 3. 真实断言

- `scripts/release-asset-contract.test.ts:14` `expect(requiredWindowsReleaseAssetNames('0.15.68')).toEqual(expectedNames)` —— 资产名契约（顺序含 `latest.yml` 首位）。
- `scripts/release-asset-contract.test.ts:17-20` `expect(assertWindowsReleaseReady({ isDraft: false, assets }, '0.15.68')).toEqual({ isDraft: false, assets })` —— 通过时返回 release 本体。
- `scripts/release-asset-contract.test.ts:24` `expect(() => assertWindowsReleaseReady(null, '0.15.68')).toThrow('请先完成 Windows 发布')`。
- `scripts/release-asset-contract.test.ts:25` `...toThrow('尚未确认已发布')`（`isDraft:true`）；`scripts/release-asset-contract.test.ts:26` 同断言（`isDraft` 字段缺失）。
- `scripts/release-asset-contract.test.ts:34-35` `expect(() => assertWindowsReleaseReady({ isDraft: false, assets }, '0.15.68')).toThrow(missingName)`（3 次循环）。
- `scripts/release-asset-contract.test.ts:41-44` size 0 的 `latest.yml` → `.toThrow('latest.yml')`；`scripts/release-asset-contract.test.ts:45-48` state 'new' 的 `.exe` → `.toThrow('CDUT-Studio-Setup-0.15.68.exe')`。

## 4. 未覆盖与脆弱点

未覆盖分支（对照被测源码）：
- `release.assets` 非数组/资产无 `name` 的过滤路径（`scripts/release-asset-contract.cjs:25-27`）无专门用例（用例 3/4 的 assets 均为规整数组）。
- `asset.size` 为 NaN/Infinity 的 `Number.isFinite` 分支（`scripts/release-asset-contract.cjs:30`）仅以 size=0 间接触及，`!Number.isFinite` 单独分支未测。
- 多个资产同时缺失时错误文案的聚合顺序（`scripts/release-asset-contract.cjs:33` 的 `join('、')`）未断言全串。

脆弱点：版本号 `0.15.68` 硬编码并与资产名模板耦合（`scripts/release-asset-contract.test.ts:7-11`、`:14`）；`toThrow` 为子串匹配，依赖中文错误文案稳定（`scripts/release-asset-contract.test.ts:24-26`）；`import contract from './release-asset-contract.cjs'`（`scripts/release-asset-contract.test.ts:2`）依赖 bun 的 CJS 默认互操作形状。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例/1 describe 的清单与真实断言文本 | 已证实 | `scripts/release-asset-contract.test.ts:1-50` 全文 + grep 计数 4 |
| 被测契约语义与用例一一对应 | 已证实 | `scripts/release-asset-contract.cjs:16-36` 对照 §2/§3 |
| 测试实际通过 | 未知 | NOT_RUN（本轮未运行任何脚本/测试，纯静态阅读） |
| CI 中本文件被执行 | 推断 | `package.json:27` `"test": "bun test --isolate"` 全量发现 `*.test.ts`，无单独点名 |

## 6. 覆盖表

| 对象（被测分支） | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 资产名契约 `requiredWindowsReleaseAssetNames` | §3 | test:14 | covered |
| 通过路径（返回 release） | §2/§3 | test:17-20 | covered |
| release 不存在分支 | §2/§3 | test:24 | covered |
| 草稿/未确认分支 | §2/§3 | test:25-26 | covered |
| 资产缺失分支 | §2/§3 | test:30-35 | covered |
| 空文件/未上传完分支 | §2/§3 | test:41-48 | covered |
| assets 非数组/无名过滤 | §4 | - | unknown |
| NaN/Infinity size 分支 | §4 | - | partial |
| 运行结果 | §5 | - | unknown（NOT_RUN） |
