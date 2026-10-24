---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-event-log.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1a14d26dc4bfd5e0a8eef55235f583f7207fa825
sha256: 407dba6229655e3b4d2a8c54f735124cec597c7d7419f928a4e362af5a43fb3e
lines: 98
kind: source
package: p03-integrations
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-event-log.ts

## 1. 结论与边界

智联万站**关键事件审计日志**（`:1-11`）：把改变页面状态的事件追加落盘 `~/.cdutai/yanhu-express/events.log`（单行一条：本地时间戳+类型+标签+URL+来源原因），背景是"页面白屏/意外跳转事故完全无痕，只能靠 155MB NetLog 反推"（`:4-5`）。边界红线（`:10`）："纯旁路日志，任何异常一律静默吞掉，绝不干扰主链路；超限自动滚动"。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `YanhuEventKind` | `:18-33` | 14 值事件类型（load-url/will-navigate/did-navigate/did-navigate-in-page/reload/ticket-sanitize/self-heal-400/tab-create/tab-close/blocked/restore-fallback/cert-blocked/cert-allow/cert-back） |
| `YanhuEventDetail` | `:35` | `Record<string, string\|number\|boolean\|null\|undefined>`（值转字符串） |
| `formatYanhuEventTime` | `:38-48` | 本地时间戳含时区偏移（`2026-10-09T16:03:38.123+08:00` 格式） |
| `formatYanhuEventLine` | `:53-65` | 纯函数单行格式：`时间戳 [类型] k=v k=v`（空/null/undefined 字段过滤 `:60`、值内空白折叠 `:61`） |
| `logYanhuEvent` | `:85-98` | 追加落盘（`filePath` 可注入供单测 `:83`；默认 `getYanhuEventsLogPath()`）；全 try/catch 静默 |

内部：`rotateIfNeeded:68-76`（超 `YANHU_EVENTS_LOG_MAX_BYTES` 滚动为 `events.log.1` 覆盖旧备份；滚动失败忽略 `:73-75`）。

## 3. 内部逻辑与关键流程

`logYanhuEvent`：mkdir 递归 → 滚动检查 → `appendFileSync` 一行 → 异常静默。格式化纯函数独立可测（`:51` 注释）。

## 4. 调用者与调用链

智联万站各事件源（导航/票据清洗/400 自愈/标签/证书裁决——14 类事件名对应）；出向 `./yanhu-constants`（路径+上限）、`node:fs`。

## 5. 数据 I/O、读写与副作用

**本地追加写**（appendFileSync）+ 重命名滚动；无网络。副作用被"静默吞掉"约束兜底。

## 6. 分支、失败、取消与恢复

滚动条件（size>上限）→rename `.1`；一切失败静默（`:73-75`/`:95-97`）——**宁可丢日志不阻断主链路**。

## 7. 权限与权威状态

旁路定位（`:10`）；`filePath` 注入仅限单测（`:83`）。

## 8. 修改影响面

改格式影响事故复盘工具；改事件类型影响审计覆盖；删除会回到"无痕事故"状态。

## 9. 测试证据

`yanhu-event-log.test.ts`（同批，4 个 `test(`）：时间戳毫秒+时区正则、单行格式+空值过滤、换行折叠、追加读回。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件（98 行）5 导出+滚动 | 已证实 | 文件全读 |
| 14 类事件的实际埋点覆盖 | 未知 | 调用方不在本批 |

## 11. 覆盖表

全文件 covered；埋点覆盖 §10 unknown。
