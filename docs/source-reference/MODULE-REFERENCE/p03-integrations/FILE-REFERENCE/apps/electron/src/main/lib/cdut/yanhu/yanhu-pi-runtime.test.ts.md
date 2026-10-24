---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-pi-runtime.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d5032decdacd6a60d9b74dde8d7b022679abc448
sha256: f8070ad89f3cdbfbb58aca1122c6895f4d838c7139d64b80441e008754d3989a
lines: 229
kind: test
package: p03-integrations
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-pi-runtime.test.ts

## 1. 测试目标

名义上测 `yanhu-pi-runtime.ts`，**实际大部分用例测 `yanhu-pet-memory.ts` 导出**（照实记录，见 §10）：`padAbortedToolResults`（2 用例）+ `resolveInjectedHistory`/`normalizeYanhuPetConfig`/`toChatMessages`/`YanhuPetMemoryStore`/`healYanhuMessages`（6 用例）。17 个 `test(`，6 个 describe（`:31`/`:55`/`:79`/`:88`/`:162`/`:200`）。全内存/伪时钟。

## 2. 用例清单（17 个，按 describe）

| # | 行 | describe/被测 | 真实断言 |
| --- | --- | --- | --- |
| 1-4 | `:32`/`:37`/`:45`/`:49` | resolveInjectedHistory 滑动窗口 | memoryLimit=0 不注入；=50 取最近 50；不足窗口全量成对返回；上限硬约束 1000 |
| 5-7 | `:56`/`:61`/`:70` | normalizeYanhuPetConfig | memoryLimit 越界夹取；缺省/非法回退默认；**enableVision 仅显式开启**（缺省关闭红线） |
| 8 | `:80` | toChatMessages 父链 | 首条 parentId null、其余指向前一条 |
| 9-12 | `:89`/`:109`/`:125`/`:149` | YanhuPetMemoryStore | 写入读回+clear 空；v1 升级强制常驻模式；v2 散落坐标复位占位；超硬上限自动截断 |
| 13-15 | `:163`/`:175`/`:189` | healYanhuMessages+resolveInjectedHistory | 连续 user 垫虚拟 assistant（阻 HTTP 400）；连续 assistant 合并内容；注入历史末尾非孤儿 user |
| 16-17 | `:201`/`:217` | padAbortedToolResults | 中止补齐占位保持 1:1；结果已齐原样返回（toBe 同引用） |

## 3. 真实断言

`toBe`/`toEqual`/`toHaveLength`/`toContain`/`toBeString`——精确断言，无快照测试，无 mock 框架。

## 4. 未覆盖

- `YanhuPiRuntime` 类主体（sendToModel/工具循环/并发闸/自愈清单）**零直接断言**。
- `estimateYanhuTokens`。
- 落盘 IO（store 的 open/rewrite 经 safe-file 未在断言面）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 17 个 `test(`、断言如 §2 | 已证实 | 文件全读 |
| **归属矛盾**：文件名 pi-runtime 但主测 pet-memory（pi-runtime 仅 padAbortedToolResults 2 用例） | 已证实 | `:10-228` 全文 |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| padAbortedToolResults | §2 用例 16/17 | `:201-228` | covered |
| pet-memory 族 | §2 用例 1-15 | `:32-189` | covered |
| PiRuntime 类主体 | — | — | unknown（未覆盖） |
| §4 边缘 | — | — | unknown |
