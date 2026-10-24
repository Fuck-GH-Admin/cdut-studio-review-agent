---
path: apps/electron/src/main/lib/cslab/cslab-tiff.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9711045f6038f100a2cf46c31a783ca5ef3b0378
sha256: fd5696e1bfd7bf62ec270949aaef155779d2737b7c3d264d590f2bd624593e9d
lines: 40
kind: test
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-tiff.test.ts

## 1. 测试目标

`cslab-tiff.ts` 的 `encodeTiffRgb`：2x2 BGRA → TIFF 头部/IFD/strip 元数据与像素序正确性（describe `基线 TIFF 编码` `:4`）。

## 2. 用例清单

**1 个 `test()`**（`:5-39`）：2x2 BGRA 编码后头部与 strip 元数据正确。

## 3. 真实断言

- `:13-18` 头两字节 `toBe('II')`（little-endian）、魔数 `readUInt16LE(2)` `toBe(42)`、IFD 偏移 `toBe(8)`、条目数 `toBe(12)`。
- `:30-36` tag256(宽)=2、257(高)=2、277(每像素样本)=3、279(strip 字节数)=12；stripOffset > IFD 且 `buffer.length` `toBe(stripOffset+12)`。
- `:38` 首像素 `[255,0,0]`（BGRA 红→RGB 红，**通道序转换正确**）。

## 4. 未覆盖与脆弱点

未覆盖：非 2x2、翻转参数 true、奇数尺寸、纯白/透明边界。**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 用例断言如 §3 | 已证实 | 逐行读 `:1-40` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 编码头/IFD/像素序 | 1 | covered |
| 其余尺寸/参数 | — | unknown |
