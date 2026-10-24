---
path: apps/electron/src/main/lib/cslab/cslab-hash.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: aa55dc8812bf9cf16d0169dbba3d68b46ee491eb
sha256: acc2716881a187fe581133db5db56ff126ba00949f665a74e8ed6ed11884bf17
lines: 111
kind: source
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/cslab/cslab-hash.ts

## 1. 结论与边界

CSLab **文件完整性工具**（`apps/electron/src/main/lib/cslab/cslab-hash.ts:1-6`）：流式 SHA-256、渐进复制落盘（fsync）、跨平台只读锁。**平台口径**（`:4-5`）：Windows 下 `fs.chmod` 无法可靠阻止覆写/删除，必须叠加 `attrib +r`。

边界：`copyFileWithHash` 目标目录须已存在（`:31`）；`unlockFile` **仅用于测试与用户显式删除资产**（`:89`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `FileDigest` | interface | 13-16 | `{sha256; bytes}` | |
| `hashFileStream` | function | 19-28 | 流式 SHA-256 | |
| `copyFileWithHash` | function | 33-67 | 边复制边哈希+fsync | 失败删半截文件 |
| `lockFileReadOnly` | function | 73-88 | chmod 0o444 + win32 `attrib +r` | 返回 bool，失败只告警**不伪造成功** |
| `unlockFile` | function | 91-96 | chmod 0o666 + win32 `attrib -r` | |
| `isFileReadOnly` | function | 99-106 | mode 位 `& 0o200` 判定（跨平台近似） | |

## 3. 内部逻辑与关键流程

- `copyFileWithHash`（`:33-67`）：背压（`once('drain')`）；end 回调收口；**fsync 防网络瞬断/崩溃留半截文件**（`:50-52` 注释）；catch 中 destroy+rm 半截文件后重抛。
- `lockFileReadOnly`（`:73-88`）：chmod 失败→warn+ok=false；win32 追加 attrib（失败同样 warn）；返回综合结果。
- `isFileReadOnly`（`:99-106`）：stat 失败→false。

## 4. 调用者与调用链

出向：`node:crypto/fs/events/child_process/util`（`:8-12`）。入向（rg 全冻结树）：`cslab-mol.ts:36`、`cslab-iron-cage.ts:31`、`cslab-demo.ts:30`（copyFileWithHash/lockFileReadOnly/unlockFile）+ **8 个测试文件动态 import**（unlockFile/isFileReadOnly：structure-snapshot/literature/science/runs/capsule/iron-cage/manuscript 等测试）。

## 5. 数据 I/O、读写与副作用

文件读/写/fsync/rm；win32 子进程 attrib；console.warn 失败告警。

## 6. 分支、失败、取消与恢复

复制失败→删半截文件重抛（受控恢复）；锁失败→warn+false（**不伪造成功**，`:71`）；无异步取消。

## 7. 权限与权威状态

本文件不适用（无权限代码）；Windows 口径（`:4-5`）与「不伪造成功」（`:71`）是完整性权威声明。

## 8. 修改影响面

- fsync/锁语义影响资产不可变保证（iron-cage 链）。
- unlockFile 的「仅测试/显式删除」限定是使用契约。

## 9. 测试证据

无同名测试；8 个批外测试动态 import 消费（unlockFile/isFileReadOnly 夹具用）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| Windows attrib 叠加口径 | 已证实 | `:4-5,81-87` |
| fsync 防半截文件+失败清理 | 已证实 | `:50-52,60-63` |
| 锁失败不伪造成功 | 已证实 | `:71-87` |
| unlockFile 使用限定 | 已证实 | `:89` |
| 真实跨平台锁效力 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 6 导出 | §2 | 13-106 | covered |
| 复制/锁链 | §3 | 33-106 | covered |
