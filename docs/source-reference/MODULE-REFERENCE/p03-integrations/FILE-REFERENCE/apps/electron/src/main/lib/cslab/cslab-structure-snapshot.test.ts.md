---
path: apps/electron/src/main/lib/cslab/cslab-structure-snapshot.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6ab523f3592338122f14bf1201b889fac32c3071
sha256: b33204a7ad31a5a9d66ad189430becca92bca780447666ed01e2304001bac43e
lines: 85
kind: test
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-structure-snapshot.test.ts

## 1. 测试目标

`cslab-structure-snapshot.ts` 的 PNG 校验、落盘与尺寸元数据（`:2` 注释）。真实 `createLab` 建实验室（`:21-22`），afterAll 清文件锁/数据库（`:26-35`）。

## 2. 用例清单

1 个 describe + **3 个 `test()`**：合法 PNG 落盘返回尺寸（`:44-57`）、非 PNG 拒绝（`:59-67`）、渲染失败快速熔断不写盘（`:69-84`）。

## 3. 真实断言

- `:52-56` 1×1 PNG：`width/height` `toBe(1)`、`bytes>0`、`relPath` 以 `vault/figures/` 开头、`path` 以 `.png` 结尾。
- `:61-66` JPEG DataURL → `rejects.toThrow('PNG')`。
- `:75-83` 带 error 提交 → `rejects.toThrow('当前没有可见的 3D 晶体视窗')` 且 figures 目录条目数不变。

## 4. 未覆盖与脆弱点

未覆盖：`requestStructureSnapshot` 超时/广播链、`normalizeSnapshotScale`、`pngDimensions` 尺寸非法。**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例断言如 §3 | 已证实 | 逐行读 `:1-85` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 落盘/校验/熔断 | 3 | covered |
| 请求链/scale | — | unknown |
