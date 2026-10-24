---
path: apps/electron/src/main/lib/cslab/cslab-atomic.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6f546e4e3e95943f72390c561d0182e5dbcc0b8d
sha256: 29a100950608a1055acfbc0677e85ac7a62bec71ff61dbdae805b493c902b162
lines: 132
kind: source
package: p03-integrations
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-atomic.ts

## 1. 结论与边界

CSLab **原子写工具（Windows 加固）**（`apps/electron/src/main/lib/cslab/cslab-atomic.ts:1-11`）：针对 Obsidian/Defender 持句柄导致 `rename` EPERM/EBUSY/EACCES 的三级降级——`.tmp→rename`（50/100/150ms 退避×3）→ 原地写（调用方允许时）→ 抛 `CsLabFileBusyError`（业务层写冲突副本）。**红线：任何路径不得吞异常伪造成功**（`:10`）。

## 2. 导出与关键符号

`export` 共 **7 个**。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CsLabWriteDurability` | type | `:15` | `'atomic' \| 'in-place'` |
| `CsLabAtomicWriteResult` | interface | `:17-20` | `{path, durability}` |
| `CsLabFileBusyError` | class | `:22-30` | `Error` 子类（`code` 默认 `'EBUSY'`） |
| `CsLabAtomicWriteOptions` | interface | `:32-37` | `allowInPlaceFallback?=true`（画布场景）、`retryDelaysMs?` |
| `writeTextAtomic` | 函数 | `:111-118` | `(targetPath, content: string, options?, deps?) => Promise<…>` |
| `writeBufferAtomic` | 函数 | `:120-127` | `content: Uint8Array` 版 |
| `__createAtomicWriteDeps` | 函数 | `:130-132` | 单测注入 EPERM 等故障 |

内部：`AtomicWriteDeps`（`:39-44`，rename/writeFile/rm/delay 可注入）、`defaultDeps`（`:46-51`，fs.promises）、`DEFAULT_RETRY_DELAYS=[50,100,150]`（`:53`）、`isBusyError`（`:55-58`，EPERM/EBUSY/EACCES）、`writeWithFallback`（`:60-109`）。

## 3. 内部逻辑与关键流程

`writeWithFallback`（`:60-109`）：

1. 写 `<target>.tmp`；busy → `CsLabFileBusyError('无法写入临时文件…')`（`:70-77`）。
2. rename 尝试 1+N 次（`:81-90`）：成功→`{durability:'atomic'}`；非 busy 错误或重试耗尽→break（`lastError` 保留）。
3. `allowInPlace && isBusyError(lastError)`（`:92-102`）：原地 `writeFile(target)` → 清 tmp → `{durability:'in-place'}`；原地也失败 → 清 tmp + 抛 `CsLabFileBusyError(…, code)`。
4. 其余：清 tmp；busy → `CsLabFileBusyError`；非 busy 原样抛（`:104-108`）。

**任何出口都不返回伪成功**——`durability` 如实标注。

## 4. 调用者与调用链

- 消费方：cslab 画布/数据集持久化（`cslab-canvas-sync`/`cslab-db` 系）。
- 出向：`node:fs.promises`（经 deps 抽象）。

## 5. 数据 I/O、读写与副作用

文件写（tmp+rename 或原地）；无网络。`rm(tmp, {force:true})` 清理（失败吞掉，`:95`、`:98`、`:104`）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| tmp 写入 busy | `:73-75` | `CsLabFileBusyError` |
| rename busy | `:81-90` | 退避重试 ≤3 次 |
| 重试耗尽且允许原地 | `:92-102` | 原地写（`in-place`） |
| 原地也 busy | `:97-101` | 清 tmp + `CsLabFileBusyError(code)` |
| 非 busy 错误 | `:104-108` | 清 tmp + 原样抛 |

## 7. 权限与权威状态

`durability` 字段如实报告写入强度（`atomic`/`in-place`）——不伪造原子性。

## 8. 修改影响面

- `DEFAULT_RETRY_DELAYS`/`maxWait` 语义与 Windows 句柄占用场景耦合。
- `AtomicWriteDeps` 注入面是单测接口（`__createAtomicWriteDeps`）。
- 「不吞异常伪造成功」红线（`:10`）是全 cslab 持久化可靠性基线。

## 9. 测试证据

`cslab-cv-cas-wrappers.test.ts`/`cslab-db.test.ts` 等经 deps 注入间接（本批测试面）；专属断言见测试手册。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5+ 导出、三级降级 | 已证实 | `:60-132` |
| `durability` 如实标注 | 已证实 | `:84`、`:96` |
| busy 错误三码（EPERM/EBUSY/EACCES） | 已证实 | `:55-58` |
| Windows 实际效果 | 未知 | 未运行 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 7 个导出 | `:15-132` | covered |
| 三级降级 | `:60-109` | covered |
| deps 注入 | `:39-51`、`:130-132` | covered |
