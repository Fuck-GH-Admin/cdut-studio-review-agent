---
path: apps/electron/src/main/lib/cslab/cslab-tiff.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4d4bb83e996a70bcf5f3dff3ce8793924307b439
sha256: 9362527befa23423834d613811f8abfd3a12044bc9d6f72ab04773d0be9c5c64
lines: 142
kind: source
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-tiff.ts

## 1. 结论与边界

**CSLab 基线 TIFF 编码器（未压缩 RGB）**（`cslab-tiff.ts:1-6` 注释）：**仅依赖 Node Buffer，不引第三方图像库**；用于期刊级 300/600/1200 DPI 位图导出；输入为 Electron `NativeImage.toBitmap()` 的 BGRA 像素。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/说明 |
| --- | --- | --- | --- |
| `encodeTiffRgb` | function（export） | `:48-142` | `(width, height, bgra, dpi=300, transparentBackground=false) => Buffer` |

内部：`uint16`/`uint32`（LE 写入 `:8-18`）、`entry`（12 字节 IFD 条目；**SHORT count=1 左对齐写 value 字段** `:20-33`）、`rational`（`:35-37`）。

## 3. 内部逻辑与关键流程

1. 校验：尺寸非正整数→抛（`:55-57`）；像素数据不足→抛（`:59-61`）。
2. BGRA→RGB 逐像素（`:63-80`）：`transparentBackground && alpha<255` 时**alpha 合成到白底**（`:70-74`），否则直取 RGB。
3. IFD 12 条目（`:82-104`）：宽/高(LONG)、每样本位数(SHORT×3 外置)、无压缩、RGB、单 strip 偏移、样本数 3、strip 行数/字节数、X/Y 分辨率(RATIONAL 外置)、单位英寸。
4. 布局回填（`:106-118`）：IFD 偏移 8；extra 区（bitsPerSample 6B + 两个 rational 8B）后接 strip；回填 4 个偏移（`:115-118`）。
5. 拼接 header（II 小端+42+IFD 偏移 `:120-124`）+IFD+extra（8,8,8+dpi rational `:132-138`）+rgb（`:140`）。

## 4. 调用者与调用链

入向：CSLab 位图导出链（跨文件，NativeImage.toBitmap 后）；测试 `cslab-tiff.test.ts`（同批 1 用例）。出向：Node Buffer。

## 5. 数据 I/O、读写与副作用

纯函数（Buffer 构造）；确定性。

## 6. 分支、失败、取消与恢复

两校验抛错（`:55-61`）；透明合成双分支（`:70-79`）。不适用取消/恢复。

## 7. 权限与权威状态

不适用（编码工具）；无第三方库=供应链边界（`:4`）。

## 8. 修改影响面

改编码 → 期刊位图导出兼容性；1 用例锁 2x2 元数据与像素序。

## 9. 测试证据

**直接测试 `cslab-tiff.test.ts`（1 用例，NOT_RUN）**：2x2 头部/IFD 12 条目/strip 位置/首像素 RGB 序。未覆盖：透明合成、dpi 参数、异常尺寸。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+3 内部+编码全链 | 已证实 | 逐行读 `:1-142` |
| 测试 1 用例断言 | 已证实 | 测试 `:5-39`；NOT_RUN |
| TIFF 读取方兼容性 | 未知 | 外部查看器 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| encodeTiffRgb | §2/§3 | `:48-142` | covered |
| 测试 | §9 | 测试文件 | covered（NOT_RUN） |
