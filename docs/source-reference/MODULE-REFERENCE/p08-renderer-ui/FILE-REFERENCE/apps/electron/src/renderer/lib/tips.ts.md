---
path: apps/electron/src/renderer/lib/tips.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a0451fe9a32ca02df97eeb2f648573f16583b105
sha256: 6ec35befe31d72a456d3a653392089aeba1cb0fe53d6a73a9330294a2f22b4d2
lines: 68
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/tips.ts

## 1. 结论与边界

平台感知的使用技巧模块（68 行）：内置 29 条 Tips（mac 12 / windows 12 / all 5，tips.ts:28-60），按平台过滤并随机取一条（tips.ts:64-68）。仅静态文案与随机选择，无持久化、无网络。

## 2. 导出与关键符号

类型 2 个：`Platform = 'mac' | 'windows'`（tips.ts:8）、`Tip`（:10-15，`id/text/platform`，`platform: Platform | 'all'`）；常量 1 个：`TIPS: Tip[]`（:26-61，29 项）；函数 2 个：`getPlatform(): Platform`（:18-23）、`getRandomTip(platform: Platform): Tip`（:64-68）。无内部函数。

## 3. 内部逻辑与关键流程

- `getPlatform`（tips.ts:19-22）：`typeof navigator !== 'undefined' && navigator.userAgent.includes('Mac')` → `'mac'`，否则 `'windows'`（无 navigator 环境回退 windows）。
- `getRandomTip`（:65-67）：`filtered = TIPS.filter(t => t.platform === 'all' || t.platform === platform)`（:65）；`index = Math.floor(Math.random() * filtered.length)`（:66）；返回 `filtered[index] ?? filtered[0]!`（:67）。

## 4. 调用者与调用链

- 入向（冻结树 grep）：`apps/electron/src/renderer/components/welcome/WelcomeEmptyState.tsx:31` import `getRandomTip, getPlatform, type Tip`、`:83` 调用 `getRandomTip(getPlatform())`（欢迎页贴士）。`TIPS` 常量无模块外引用（检索范围：baseline 全树 grep `getRandomTip|getPlatform|TIPS|from '[^']*tips'`，preload/main 的 `getPlatformInfo`/`getPlatform` 为同名异构函数，非本模块）。
- 出向：无 import；`Math.random` 为唯一外部调用。

## 5. 数据 I/O、读写与副作用

纯数据 + 纯函数，无 I/O、无副作用；`TIPS` 为模块级只读数据（未冻结，引用可变，tips.ts:26）；`getRandomTip` 输出非确定（Math.random）。

## 6. 分支、失败、取消与恢复

`getPlatform` 的 navigator 缺失分支（:19）回退 `'windows'`；`getRandomTip` 对空过滤结果的防御 `filtered[0]!`（:67，按当前 29 条数据过滤结果恒非空，静态可证）；无 throw、无取消语义。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。

## 8. 修改影响面

文案/条目增删只影响 `WelcomeEmptyState.tsx:83` 展示内容，无逻辑耦合；`Tip`/`Platform` 类型签名变更需同步 `WelcomeEmptyState.tsx:31` 的类型 import 与 tips 对应手册；本批次无对应测试文件。

## 9. 测试证据

`NOT_RUN`（本轮未运行测试，纯静态阅读）。本批次 scope 内无 tips 测试文件（间接证据：无；检索范围：scope 18 文件清单）。不声称运行成功。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 29 条数据与平台分布、过滤/随机逻辑 | 已证实 | tips.ts:26-68 全文 |
| 非空过滤结果（当前数据） | 已证实 | tips.ts:28-60 全量数据静态清点 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| Platform / Tip | §2 | tips.ts:8-15 | covered |
| getPlatform | §3/§6 | tips.ts:18-23 | covered |
| TIPS 数据 | §1/§2 | tips.ts:26-61 | covered |
| getRandomTip | §3/§6 | tips.ts:64-68 | covered |
