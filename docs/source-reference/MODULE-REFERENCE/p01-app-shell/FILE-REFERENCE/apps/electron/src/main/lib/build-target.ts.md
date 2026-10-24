---
path: apps/electron/src/main/lib/build-target.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8001e4decb85ef167f415a1c45d2386618113728
sha256: a4dd9d2b9a0259c4cf70bbea097725dcbc0bd05d0827dc0ca9377d176c525f30
lines: 20
kind: source
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/build-target.ts

## 1. 结论与边界

**构建目标读取**（20 行）：`oss`（开源）/`commercial`（商业）；esbuild 构建时注入 `__PROFER_BUILD_TARGET__`（`:4-5`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `BuildTarget` | `:2` | 'oss'\|'commercial' |
| `getBuildTarget` | `:13-16` | **typeof 安全读取**（未注入时源码测试环境防 ReferenceError `:10-12`）；非 commercial 一律归 oss |
| `isCommercialBuild` | `:18-20` | 商业版判定 |

## 3. 内部逻辑与关键流程

typeof 守卫+归一化。

## 4. 调用者与调用链

功能开关（商业版特性门控）；纯函数无出向。

## 5. 数据 I/O、读写与副作用

读构建期注入常量。

## 6. 分支、失败、取消与恢复

未注入→'oss' 兜底（默认开源版）。

## 7. 权限与权威状态

构建目标单一裁决点（oss 为安全默认）。

## 8. 修改影响面

改归一化影响商业特性门控；oss 安全默认是构建注入缺失时的行为契约，商业版功能开关均经 isCommercialBuild 单点裁决。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件 | 已证实 | 20 行全读 |
| 实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；实效 unknown。
