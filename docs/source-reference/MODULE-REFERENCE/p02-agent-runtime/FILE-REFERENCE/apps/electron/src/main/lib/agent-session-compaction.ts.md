---
path: apps/electron/src/main/lib/agent-session-compaction.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 923f44095d527577fe55b7282abcc36eb83d0be9
sha256: 94a79479aa33e8a44725b45f784e60e44d162d2518dd921de2ca92b904dadd5a
lines: 244
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-session-compaction.ts

## 1. 结论与边界

历史会话存储**「整理」**——把已落盘的过大载荷**搬出 JSONL 行而非删掉**（`agent-session-compaction.ts:1-30` 长注释）。与截断迁移的本质区别：旧版截断丢弃（数据永久丢失），现在搬 blob 可完整还原（用户 2026-09-17 否掉截断路线，`:8-9`）。不自己实现外部化——共用 `agent-session-manager.externalizeSerializedSessionLine` 单一入口（历史上"规则散在多处"造成过 4 个覆盖缺口事故，`:11-14`）。五条安全约束（`:16-22`）+ 内容自闸（不用版本标记，`:24-25`）+ 异步防卡 UI（`:27-29`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SessionCompactionResult` | 接口 | `:41` | 11 统计字段（scanned/rewrittenFiles/rewrittenLines/skippedFiles/failedFiles/charsBefore/charsAfter/blobRefs/blobCount/blobBytes/backupDir?/errors≤20） |
| `previewAgentSessionCompaction` | 函数 | `:137` | **仅统计不写入**（先给用户看能省多少） |
| `compactAgentSessionStorage` | 函数 | `:171` | 就地整理；幂等（无超限行零写入） |

内部：`TMP_SUFFIX='.compact-tmp'`/`MAX_RECORDED_ERRORS=20`（`:68-69`）、`listSessionFiles`（`:87`）、`ensureBackupDir`（`:96`，`migrations/backup-<ISO时间戳>`）、`externalizeLineIntoStats`（`:115`，同内容 hash 去重计数）、`yieldToEventLoop`（`:112`）。

## 3. 内部逻辑与关键流程

`compactAgentSessionStorage`（`:171-244`）：遍历 `*.jsonl`→文件字节 ≤ 上限跳过（UTF-8 字节数 ≥ 字符数，`:181-184`）→ 逐行：未超限原样、超限行 `yieldToEventLoop` 后 externalize（`:193-211`）→ 有改动才继续：**读取前后 size 对比，期间被追加→skip**（`:215-219`）→ 备份原文件（`:221-222`）→ 写 `.compact-tmp` 再 `rename` 原子替换（`:224-226`）→ 统计。失败：recordError + 清 tmp（`:232-239`），单文件出错不中断整轮（`:22`）。`previewAgentSessionCompaction`（`:137-166`）：同扫描逻辑但零写入。

## 4. 调用者与调用链

- 入向：ipc.ts 设置页触发（域外，grep）；测试 `agent-session-compaction.test.ts` 11 用例。
- 出向：`./agent-session-manager`（MAX_SDK_MESSAGE_LENGTH/externalizeSerializedSessionLine/readSerializedBlobRefs，`:36-39`）、`./config-paths`。

## 5. 数据 I/O、读写与副作用

- 读：`agent-sessions/*.jsonl`；写：改写文件（原子 rename）+ `migrations/backup-<ts>/` 备份 + blob 写入（经 externalize）。
- 五条安全约束（`:16-22`）：只动超限行（`\n` 切分拼回保换行风格）、改写前整份备份、tmp+rename、前后 size 并发检测、单文件错误继续。

## 6. 分支、失败、取消与恢复

并发追加→skip（skippedFiles）；失败→errors 记录+tmp 清理；备份使改写可回退；无取消（一轮跑完）。

## 7. 权限与权威状态

数据完整权威=“搬出不删除”（blob 可还原）；闸门=内容自闸（扫到超限行才动手，`:24-25`）。

## 8. 修改影响面

存储整理链（设置页）；与 manager 外部化入口连动（单一规则来源）。

## 9. 测试证据

`NOT_RUN`。直接测试 `agent-session-compaction.test.ts`（220 行/**11 个 `test(`**，机械核；真实临时目录+electron mock）：只动超限行其余逐字节不变（`:69-87`）；全小行零写入零备份（`:89-99`）；多超限行统计正确（`:101-110`）；**还原逐字节一致**（`resolveMessageBlobs` 往返 `JSON.stringify` 相等，`:114-129`）；内容寻址计数（blobRefs≥2/blobCount=1，`:131-148`）；预览零写入（`:150-159,199-210`）；幂等二跑零改动（`:163-175`）；备份=改写前原文（`:177-187`）；无 `.compact-tmp` 残留（`:189-195`）；预览/执行统计一致（`:212-219`）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 搬出不删/五约束/幂等/备份/预览语义 | 已证实 | `:1-244` 逐行 + 11 测试互证 |
| blob-store 写入语义 | 边界 | 域外 |
| 真机全量耗时 | 未知 | NOT_RUN（注释称数秒，`:27`） |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 导出+内部 | §2/§3 | 41-244 | covered |
| 测试 11 用例 | §9 | test 文件 | covered（NOT_RUN） |
