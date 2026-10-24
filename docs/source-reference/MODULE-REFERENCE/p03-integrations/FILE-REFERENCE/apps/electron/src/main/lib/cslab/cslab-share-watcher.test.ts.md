---
path: apps/electron/src/main/lib/cslab/cslab-share-watcher.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: dae9ced2d347451c9ad2302bf9d57f05546858d7
sha256: 9f8e6b5ff9c2f19995d36d4215be4f96a8bd413435e089a104f21017218f425a
lines: 341
kind: test
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-share-watcher.test.ts

## 1. 测试目标

`cslab-share-watcher.ts`（`:2-9` 注释五覆盖）：路径规范化（UNC/smb/长 UNC/WebDAV/本地）、静默期捕获、**证据等级如实标注**、SHA-256 幂等；另含安全边界（WebDAV/UNC 云元数据拦截、WPAD/ISATAP、PowerShell 控制字符）与监听生命周期。`CSLAB_SHARE_FORCE_NODE_STREAM=1` 走 Node 流（`:37`）。

## 2. 用例清单

6 个 describe + **14 个 `test()`**：

| describe | 用例 | 行 |
| --- | --- | --- |
| 共享路径规范化（3） | 五形态归一、非法 UNC 抛、IPv6 字面量拦截 | `:69-104` |
| WebDAV 源安全边界（4） | 云元数据/回环拒绝、局域网/公网通过、UNC 同拦、WPAD/ISATAP 拦截 | `:108-151` |
| 内联 PowerShell 参数安全（2） | 普通/反引号放行、控制字符拒绝 | `:155-166` |
| 共享盘静默期与捕获（3） | 静默未满不捕获+流式校验标注、持续追加重置静默、同内容幂等 | `:170-282` |
| 监听生命周期（2） | 启停状态、租约链路受限自动降级不抛 | `:286-340` |

## 3. 真实断言（代表性）

- `:73-91` UNC host/share 提取、smb→`\\lab-pc\XRD\data`、长 UNC 归一、WebDAV 去尾斜杠、本地去尾分隔。
- `:96-103/:110-119/:131-150` 各拦截清单 `toThrow('安全拦截')`（169.254.169.254/metadata.google.internal/100.100.100.200/127.0.0.1/[::1]/localhost、UNC 同拦、wpad/isatap）；局域网/公网放行（`:124-126/:142-143`）。
- `:157-164` 反引号路径放行；`\n/\u0000/\u007F` → `toThrow('控制字符')`。
- `:189-211` 首扫 discovered 1/captured 0、state 'debouncing'；1.15s 后 captured 1、state 'published'、sha256=实算、**leaseType 'node-stream-stability'、evidence 'quiet-interval'**、assetUri 含 '/table/'、`listAssets` 含该 sha。
- `:232-249` 追加重置：fingerprint 变化仍 debouncing，稳定后 published 且 sha=最终内容。
- `:277-281` 重复内容：published ≥1 且 assetUri 集合 size 1（复用 SHA）。
- `:299-305` start/stop `watching` true→false、`isShareWatching` 同步。
- `:316-336` 删 FORCE_NODE 走真实租约链路：仍 published、leaseType ∈ {protected-lease, inline-command-lease, node-stream-stability}（降级不中断）。

## 4. 未覆盖与脆弱点

未覆盖：WebDAV 真实网络、UNC 真实 SMB、`__setShareTuningForTest` 调参面。时间依赖（sleep 1150ms，总 30s 超时用例 `:340`）。**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 14 用例断言如 §3 | 已证实 | 逐行读 `:1-341` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 路径规范化/安全拦截 | 9 | covered |
| 静默期/幂等/证据标注 | 3 | covered |
| 生命周期/降级 | 2 | covered |
