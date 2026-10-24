---
path: packages/ui/src/lib/platform.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bd177a43792dac51513e3bd45bdeef5a088f3c44
sha256: 203d18fc4d38e1fa52fb219284c52b0735068febe3080dec322729eb8078cba8
lines: 19
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/ui/src/lib/platform.ts

## 1. 结论与边界

浏览器环境平台探测（`packages/ui/src/lib/platform.ts:1-19`）：`detectIsWindows`/`detectIsMac` 两个纯函数，优先 `navigator.userAgentData.platform`，回退 `navigator.platform` 正则。仅探测 OS 家族，不做版本/架构判断。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `detectIsWindows` | function（export） | `:1-9` | `() => boolean` | 'win' 子串（UA-Data）/ `/win/i`（platform） |
| `detectIsMac` | function（export） | `:11-19` | `() => boolean` | 'mac' 子串 / `/mac/i` |

## 3. 内部逻辑与关键流程

两函数结构相同（`detectIsWindows` 为例，`:2-8`）：`typeof navigator !== 'undefined'` 防 SSR/Node（`:3`）→ `userAgentData.platform` 为字符串且小写含目标词 → true（`:5-7`）；否则 `navigator.platform` 正则（`:8`）。分支：UA-Data 命中 / 回退命中 / 均否 false。

## 4. 调用者与调用链

- 入向：`detectIsMac` 6 个外部文件（如 `apps/electron/src/renderer/components/environment/EnvironmentCheckPanel.tsx`、cdut-science 三视图）；`detectIsWindows` 17 个外部文件（如 `cdut-science/CdutScienceView.tsx`、`CsLabPdfViewer.tsx`）；`packages/ui/src/index.ts:16` 再导出。
- 出向：全局 `navigator`（浏览器 API）。

## 5. 数据 I/O、读写与副作用

纯读 `navigator`；无写、无副作用。

## 6. 分支、失败、取消与恢复

无 throw；`navigator` 缺失时返回 false（`:3/:8` 双重 `typeof` 防御）。不适用项依据：无异步/资源。

## 7. 权限与权威状态

无权限分支（纯工具）。

## 8. 修改影响面

改判定逻辑 → 23 处消费者（两函数合计）的平台分支（快捷键、路径分隔、PDF/原生能力适配等）。无直接测试。

## 9. 测试证据

无直接测试（负向：冻结树全部 `*.test.*` 检索本模块符号 → 0 专属命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出、双通道探测、SSR 防御 | 已证实 | 逐行读 `:1-19` |
| UA-Data 覆盖率/回退准确性 | 未知 | 依赖运行环境，NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 两函数三分支 | §3 | `:1-19` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
