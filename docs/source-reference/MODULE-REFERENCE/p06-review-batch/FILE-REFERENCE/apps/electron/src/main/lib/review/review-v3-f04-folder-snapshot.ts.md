---
path: apps/electron/src/main/lib/review/review-v3-f04-folder-snapshot.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 43889df1b3ffeca593d5ef977462232312b6b655
sha256: 97ccc372f54b2411c175caa9a74d3318d9cae95710b5558fb13bf4e115ce16be
lines: 101
kind: source
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-f04-folder-snapshot.ts

## 1. 结论与边界

F04 可信目录适配器（文件头 `:1-7`）：枚举 OS 选择的目录（**不跟随符号链接**）并对每个可读原件采集 SHA-256；Main 可用于构建不可变预览清单。刻意不创建 Case/DocumentVersion、不调 IPC。异步纯读 + 抗替换校验。

不做的事：不建案卷/材料版本；不做 IPC；不深读文件内容（只 hash）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `F04FolderOriginal` | interface | `:14-17` | `F04PhysicalEntryDigest + absolutePath`（**Main 专用，绝不进渲染层预览**，`:15` 注释） |
| `F04FolderSnapshot` | interface | `:19-23` | `{originals[]; identity; warnings[]}` |
| `snapshotF04Folder` | function | `:26-101` | `(trustedRoot, {maxEntries=2000, maxEntryBytes=512MB}) => Promise<F04FolderSnapshot>`（上限与物理选择器一致，`:25`） |

## 3. 内部逻辑与关键流程

1. 上限校验（安全整数 ≥1，否则 `F04_LIMIT_INVALID`）；根 `lstat` 须为真目录且非符号链接（`F04_FOLDER_INVALID`）（`:32-35`）。
2. 递归 `visit`（子项按 `localeCompare('en')` 排序保证确定性，`:41`）逐条：
   - 隐藏项跳过（`:43`）；跨平台不安全名（控制字符/`<>:"|?*`/尾点尾空格）→ warning“未导入”（`:46-48`）。
   - `lstat` 失败/符号链接/非普通文件/空或超限 → warning 留痕（`:51-63`）。
   - 超 maxEntries → `overLimit` 标记（`:65`）。
   - **抗替换读取**（`:66-88`）：`open` 带 `O_NOFOLLOW`（防 POSIX 符号链接调包，`:68-69`）；`stat.dev/ino` 与 lstat 一致否则“文件在预览期间被替换”；流式 hash（中途超限拒）；读后再 `stat+lstat` 交叉核对 size/mtime/inode 全一致，否则“文件在预览期间发生变化”。
3. 汇总：超限 warning；零可读原件 → `F04_NO_READABLE_ORIGINALS: {warnings}`；否则 `identity = identifyF04PhysicalSelectionFromDigests('folder', originals)`（`:98-100`）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）：F04 物理预览/入库链路调用；直接测试 `review-v3-f04-folder-snapshot.test.ts`。出向：`node:fs/promises`/`node:crypto`、`review-v3-f04-intake-identity.identifyF04PhysicalSelectionFromDigests`。

## 5. 数据 I/O、读写与副作用

只读目录树与文件字节（hash）；无写/网络/日志。确定性输出（排序遍历）。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 上限非法/根非法 | `:32-35` | throw `F04_LIMIT_INVALID`/`F04_FOLDER_INVALID` |
| 各类不可导入 | `:46-65` | warning 留痕 |
| 预览期间替换/变化 | `:72-87` | warning（该文件不入 originals） |
| 零可读原件 | `:99` | throw `F04_NO_READABLE_ORIGINALS` |
| 取消 | 无 | 无 AbortSignal |

## 7. 权限与权威状态

- `absolutePath` 是 Main-only 信息（`:15`）。
- 抗替换（dev/ino/mtime 交叉核对）保证“预览清单即当时字节”；identity 由摘要派生（联动 `f04-intake-identity`）。

## 8. 修改影响面

改枚举/校验 → 影响 F04 预览身份（`identifyF04PhysicalSelectionFromDigests`）与入库一致性；上限口径与物理选择器联动（`:25`）。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `review-v3-f04-folder-snapshot.test.ts`（详见其手册）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 不跟随符号链接、确定性排序 | 已证实 | `:41/:55-57` |
| 抗替换读取（O_NOFOLLOW+dev/ino/mtime） | 已证实 | `:66-88` |
| 上限/零原件 fail-closed | 已证实 | `:32-35/:99` |
| absolutePath Main-only | 已证实 | `:15` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `F04FolderOriginal/Snapshot` | 2 | `:14-23` | covered |
| 枚举/过滤/上限 | 3 | `:40-65` | covered |
| 抗替换读取 | 3 | `:66-88` | covered |
| 汇总/identity | 3 | `:98-100` | covered |
