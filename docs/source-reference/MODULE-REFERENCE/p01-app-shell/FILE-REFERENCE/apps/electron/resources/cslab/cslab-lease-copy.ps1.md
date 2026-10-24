---
path: apps/electron/resources/cslab/cslab-lease-copy.ps1
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4b8808cd6a870c884892f3608cfd9b113ae4725a
sha256: 0a35045de76dc988571269c4694bd8d088139667fe2604d1cbd841506c85d74a
lines: 66
kind: script
package: p01-app-shell
author: docs-r07-author-nb-05-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/resources/cslab/cslab-lease-copy.ps1

## 1. 结论与边界

**CSLab 独占读租约流式拷贝**（Windows，66 行，`:1-10`）：.NET FileStream 以 `FileShare.Read` 打开源（等价 `CreateFileW(GENERIC_READ, FILE_SHARE_READ)`——**显式排除写入/删除共享位**）；边读边写暂存+实时 SHA-256。**红线：目标必须本地路径（非 UNC）**（`:10`）。

## 2. 导出与关键符号

无导出（PowerShell）：`-Source/-Destination`（必填，`:12-15`）。输出单行 JSON `{"ok":true,"sha256","bytes"}` 或 `{"ok":false,"error"}`+exit 1（`:7-8`）。

## 3. 内部逻辑与关键流程

（`:23-65`）：UNC 目标拒绝（`destination-not-local`，`:24-27`）→源 Open(Read/FileShare.Read)（`:29-34`）→目标 Create+CryptoStream(SHA256)（`:36-42`）→1MB 缓冲循环拷贝计数（`:44-49`）→FlushFinalBlock 落盘+逐句柄释放（`:51-55`）→hex 输出（`:57-61`）。catch→错误 JSON+exit 1。

## 4. 调用者与调用链

- 入向：CSLab 材料导入链（Windows 租约拷贝，域外）。
- 出向：.NET IO/Crypto（PowerShell 内建）。

## 5. 数据 I/O、读写与副作用

读源（共享读租约）；写本地暂存文件；无网络。

## 6. 分支、失败、取消与恢复

UNC 拒绝/异常→ok:false+exit 1；句柄 finally 式释放（catch 内不显式释放照实——依赖 GC/进程退出）。

## 7. 权限与权威状态

完整性权威=SHA-256 全量流式计算；租约语义=排除写删共享位（防拷贝中被改）。

## 8. 修改影响面

CSLab Windows 材料导入的拷贝完整性与租约行为。

## 9. 测试证据

`NOT_RUN`。无直接测试（未运行脚本；win-only）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 租约语义/UNC 红线/流式 SHA | 已证实 | `:1-66` 全文 |
| 运行验证 | 未知 | NOT_RUN（无 Windows） |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 脚本体 | §2/§3 | 12-65 | covered |
