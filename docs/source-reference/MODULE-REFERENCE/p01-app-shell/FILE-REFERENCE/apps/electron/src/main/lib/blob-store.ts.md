---
path: apps/electron/src/main/lib/blob-store.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: aa8050f102c1af3fd1905d20aadf92b75c074255
sha256: 48f034f12bcdae615f091f135687ac73df78cfc291cceca69a0917c81b864ff6
lines: 113
kind: source
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/blob-store.ts

## 1. 结论与边界

**会话大载荷内容寻址 blob 存储**（113 行）：背景（`:4-7`）：真机出现 24.4MB 单行（整页 HTML/PDF base64/截图），用户否掉"截断丢弃"路线，改为**把载荷搬出 JSONL 行**——原文完整落盘、行内只放片段与引用。**内容寻址自动去重**（`message.content` 与 `tool_use_result` 互为副本是巨型行主因，`:9-11`）——"不只不丢数据，还比截断更省磁盘"。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `BlobRef` | `:29-32` | `{hash: 'sha256:<hex>', bytes}` |
| `blobRootDir` | `:35-37` | `<configDir>/blobs` |
| `blobPathFor` | `:43-46` | 哈希前四位两级分片（`ab/cd/<hex>`）防单目录堆积 |
| `hashOfBlobContent` | `:52-54` | **哈希算字符串值非 JSON 转义形式**（`:49-51`）——任何转义形式命中同一 blob |
| `writeBlobSync` | `:61-74` | 同步写（写入路径用）：已存在即返回（幂等）；tmp+rename 原子落盘（`:69`） |
| `writeBlob` | `:77-91` | 异步写（存量迁移用，全量约 7 秒不阻塞事件循环 `:15`） |
| `readBlobSync`/`readBlob` | `:97-104`/`:106-113` | 读取+**重哈希校验**：不一致按读不到处理（"宁可降级显示片段，也不返回可能被损坏的内容" `:95`） |

内部：`HASH_PREFIX='sha256:':27`、`tempPathFor:56-58`（pid+时间戳+随机防冲突）。

## 3. 内部逻辑与关键流程

内容寻址闭环：hash→分片路径→幂等写（tmp→rename 原子）→读时重哈希校验。

## 4. 调用者与调用链

会话 JSONL 写入/读取层（载荷搬出）；出向 `./config-paths`、node:crypto/fs。

## 5. 数据 I/O、读写与副作用

文件系统写（blob 分片目录）；同步/异步双原语。

## 6. 分支、失败、取消与恢复

写中断→rename 原子性保证无半 blob（`:69`）；读失败/校验失败→null 降级。

## 7. 权限与权威状态

- **数据完整性红线**（`:93-95`）：校验不通过绝不返回内容。
- **不丢数据契约**（`:6-7`）：用户明确否掉截断路线（设计前提照实记录）。

## 8. 修改影响面

改哈希/分片影响存量 blob 寻址（`sha256:` 前缀留换算法余地 `:26`）；迁移路径联动会话落盘。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件/内容寻址/校验红线 | 已证实 | 113 行全读 |
| 会话层调用实现 | 未知 | 不在本批 |
| 实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；调用方/实效 unknown。
