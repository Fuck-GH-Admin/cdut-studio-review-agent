---
path: work/reports/assets/2026-10-04-ui-acceptance/scripts/ui.mjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 10dd78c8244381ccbe561fc5491579b0d2e7a635
sha256: dfbffc17a53c7dc6ba1d62f491581a30b46758be078cfcdf9413a9cbe22b085e
lines: 35
kind: source
package: p01-app-shell
author: docs-r07-author-nb-05-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# work/reports/assets/2026-10-04-ui-acceptance/scripts/ui.mjs

## 1. 结论与边界

**UI 验收 CDP 驱动器**（35 行）：连 `http://127.0.0.1:9237` CDP（配套 electron-flags 注入），定位 `http://localhost:5188` 页面目标执行快照/点击/输入/截图/按键/缩放。所有操作记 `actions.jsonl` 审计（`:34`，eval 调用记"只读或标注过的探查"）。

## 2. 导出与关键符号

无导出（CLI）。动作集（`:19-33`）：`snapshot`（正文+可见按钮/输入快照）/`eval`/`screenshot`/`click|contains|input|editable`/`key`/`resize`。`ev`（`:14`，Runtime.evaluate 禁异常静默）。

## 3. 内部逻辑与关键流程

（`:6-35`）：json/list 找 page 目标（缺→throw）→WebSocket CDP（id-pending Map 请求桥 `:11-13`）→定位表达式（可见性过滤 `:17`+aria/title/文本三匹配 `:24`）→命中点计算（elementFromPoint 反验三候选 x，`:25`）→mousePressed/Released 实点击→input/editable 走选中三击+Backspace+insertText（`:28`）→mouseMoved 收尾+400ms 等待。finally ws.close。

## 4. 调用者与调用链

- 入向：ui-acceptance 验收脚本（如 import.py `subprocess node ui.mjs …`，本批）。
- 出向：ws（require 自固定路径 `:3`——绝对路径依赖照实记录）、CDP 9237。

## 5. 数据 I/O、读写与副作用

CDP 输入注入（鼠标/键盘/视口）；截图写 screenshots/；actions.jsonl 追加审计。

## 6. 分支、失败、取消与恢复

目标缺失/未找到控件/禁用控件→throw（`:8,26`）；未知动作 throw；finally 关连接。

## 7. 权限与权威状态

验收审计权威=actions.jsonl 全操作留痕；eval 调用仅记录摘要（`:34`）。

## 8. 修改影响面

UI 验收驱动能力面；被测界面控件定位语义（可见性+三匹配）。

## 9. 测试证据

`NOT_RUN`。无直接测试（验收资产；未运行）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 动作集/定位/审计落盘 | 已证实 | `:1-35` 全文 |
| **createRequire 绝对路径**（/home/miku/Bot/CDUTStudio/CDUT-Studio/…）——环境耦合 | 已证实（照实记录） | `:3` |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 驱动体 | §2/§3 | 6-35 | covered |
