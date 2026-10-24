---
path: apps/electron/src/main/lib/review/review-v3-b4-original-byte-verifier.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 02565186990a7e67e5e1e37fb83931384be9fffd
sha256: f4f775df49d00e9826e82f3d5bbf3d8fc4d5be521761c82a26566e919873e46d
lines: 57
kind: source
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-v3-b4-original-byte-verifier.ts

## 1. 结论与边界

B4 历史原件的**原始字节证明**，刻意与发布分离（`apps/electron/src/main/lib/review/review-v3-b4-original-byte-verifier.ts:1-6`）。输入必须是 Git blob 的**真实字节负载**，绝不是 manifest 里抄来的 SHA 值（`:4-5`）；只证明历史字节身份（`:6`）。最薄源文件（57 行）：2 interface + 1 函数。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `B4OriginalBytePin` | interface | 9-16 | `{templateId; observedGitBlob:string; expectedGitBlob?:string\|null; declaredSourceSha256:string}` | 注释：observedGitBlob 是从历史仓库数据请求并收到的 Git 对象（`:11-12`） |
| `B4OriginalByteResult` | interface | 17-27 | `{templateId;gitBlob;sha256;expectedGitBlobPinned;byteCount;status:'HISTORICAL_ORIGINAL_BYTES_MATCH_CANDIDATE_ONLY';publicationAllowed:false;policyApproval:'NOT_VERIFIED';independentGold:'NOT_AUTHORIZED_OR_NOT_RUN'}` | |
| `verifyB4OriginalGitBytes` | function | 33-57 | `(bytes:Uint8Array, pin:B4OriginalBytePin) => B4OriginalByteResult` | |

内部：`sha40/sha64`（`:28-29`）、`deny`（`:30`，`Error('B4_ORIGINAL_BYTES_'+reason)`）。

## 3. 内部逻辑与关键流程

`verifyB4OriginalGitBytes`（`:33-57`）：

1. `:37-41` 输入闸（`INVALID_INPUT`）：bytes 为 Uint8Array 且非空、templateId `^[a-z0-9-]{1,128}$`、observedGitBlob 40hex、可选 expectedGitBlob 40hex、declaredSourceSha256 64hex。
2. `:42-45` 计算 `byteSha=sha256(bytes)` 与 `gitSha=sha1('blob '+byteLength+'\0'+bytes)`（注释 `:32`：Git blob 身份公式）。
3. `:46-48` 三重不符 → `CONTENT_MISMATCH`：`gitSha!==observedGitBlob`、pin.expectedGitBlob 非空且不等、`byteSha!==declaredSourceSha256`。
4. `:49-56` 返回（`expectedGitBlobPinned=expectedGitBlob!=null`；三否定字面量）。

## 4. 调用者与调用链

出向：`node:crypto`。

入向（否定结论）：**零引用**——检索式=B4OriginalBytePin|B4OriginalByteResult|verifyB4OriginalGitBytes|模块名 `review-v3-b4-original-byte-verifier`，全冻结树零命中（连模块名字符串都未被引用）。无测试、无产品入口。死模块/预留接口。

## 5. 数据 I/O、读写与副作用

无。纯哈希计算；抛普通 `Error`。

## 6. 分支、失败、取消与恢复

失败=throw（`INVALID_INPUT`/`CONTENT_MISMATCH`）。无异步/取消。一次性校验。

## 7. 权限与权威状态

无权限分支。返回三否定字面量（`publicationAllowed:false`/`policyApproval:'NOT_VERIFIED'`/`independentGold:'NOT_AUTHORIZED_OR_NOT_RUN'`）+ `status` 字面量明示「仅候选级历史字节匹配」。

## 8. 修改影响面

零调用方（§4），改动无静态可见影响。Git blob 公式与 `review-v3-b4-conflict-and-instance-guard.ts:72-74` 重复实现（两处平行口径，改动需同步）。

## 9. 测试证据

无直接/间接测试（全树零引用）。**NOT_RUN**。缺口：2 个 deny 与 `expectedGitBlobPinned` 两态无断言。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| Git blob sha1 公式（`'blob '+len+'\0'+bytes`） | 已证实 | `:42-45` |
| 与 B4R24 平行实现同一公式 | 已证实 | 对照 `review-v3-b4-conflict-and-instance-guard.ts:72-74` |
| 零调用零测试（死模块） | 已证实（否定结论，检索式见 §4，全冻结树） | grep |
| 三否定字面量 | 已证实 | `:49-56` |
| 未来接入方式 | 未知 | 无调用点 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 interface + 1 function | §2 | 9-33 | covered |
| 校验流程/2 deny | §3, §6 | 33-57 | covered（无测试） |
| 接入面 | §10 | — | unknown |
