---
path: apps/electron/src/main/lib/review/review-v3-f04-intake-identity.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9ca6a754e14c88f8152b0f3190bbc6fe89c1eea5
sha256: 16114905025d86bee2183215de95b27daa106e7affad7acae97c42b803c02a47
lines: 40
kind: test
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-f04-intake-identity.test.ts

## 1. 测试目标

F04 物理选择身份（describe `:8`）：同名同长度来自不同物理选择的 entry token 必须不同；相同文件仍有独立选择与案卷登记身份；拒绝大小写等价重复路径与不安全相对路径。被测：`identifyF04PhysicalSelection`/`assertF04OriginalUnchanged`/`f04CaseRegistrationKey`。纯内存。本轮 `NOT_RUN`。

## 2. 用例清单

1 describe、**3 test**：

1. `:9-18` 同名 `申请/证明.txt` 同长度异字节（nonce a/b）：entryId 不同、fingerprint 不同、byteLength 相同；`assertF04OriginalUnchanged` 对异字节抛 `F04_ORIGINAL_CHANGED_AFTER_PREVIEW`、对原字节不抛。
2. `:20-29` 相同文件两次选择（nonce one/two）：entryId 不同（选择级）、**fingerprint 相同**（内容级）；`f04CaseRegistrationKey` 对 case-A/case-B 不同。
3. `:31-39` `A.txt`+`a.txt` → `F04_DUPLICATE_RELATIVE_PATH`；`../other.txt` → `F04_UNSAFE_RELATIVE_PATH`。

## 3. 真实断言

- #1 的 fingerprint 不同（字节不同）vs #2 的 fingerprint 相同（字节相同）——两级身份分离的成对断言。
- #3 断言规范化大小写查重与路径穿越拒绝。

## 4. 未覆盖与脆弱点

**未覆盖**：`F04_ENTRY_BYTES_INVALID`/`F04_SOURCE_KIND_INVALID`/`F04_EMPTY_SELECTION`/`F04_EMPTY_ENTRY`/`F04_REGISTRATION_SCOPE_INVALID`；`identifyF04PhysicalSelectionFromDigests` 直接调用；控制字符/尾点尾空格路径。

**脆弱点**：nonce 显式传入使断言确定（默认 randomUUID 未测）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 describe、3 test、纯内存 | 已证实 | `:8`；`grep -c test(`=3 |
| 选择级唯一+字节绑定 | 已证实 | `:9-18` |
| 内容级指纹相同/案卷键独立 | 已证实 | `:20-29` |
| 重复/不安全路径拒绝 | 已证实 | `:31-39` |
| 其余 throw | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| entry token 唯一/unchanged | #1 | `:9-18` | covered |
| fingerprint/registration key | #2 | `:20-29` | covered |
| 路径校验 | #3 | `:31-39` | covered |
| 其余 throw | — | — | unknown |
