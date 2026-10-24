---
path: work/reports/assets/2026-10-04-ui-acceptance/scripts/import.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4c98dd64943e7bb15a3bd7108b315eb3bd62bcc6
sha256: 56d3399bc6b51af36f7110a9329a67e1b9bd833c532918cfb7518c9eb0cb6e28
lines: 21
kind: script
package: p01-app-shell
author: docs-r07-author-nb-05-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# work/reports/assets/2026-10-04-ui-acceptance/scripts/import.py

## 1. 结论与边界

**UI 验收原生文件选择框自动化**（21 行）：xdotool 驱动 Xvfb 下的"导入审核材料"原生对话框（Ctrl+L 输入路径）。环境硬编码 `/tmp/cdut-ui-acceptance-20261003`（`:3`）。

## 2. 导出与关键符号

无导出（CLI）：`sys.argv[1]`（断言文案）/`sys.argv[2]`（fixtures 文件名）。内部 `x()`（`:8`，xdotool 封装）。

## 3. 内部逻辑与关键流程

（`:4-21`）：从 ps 找 Xvfb 进程取 display/auth（`:5-6`）→ui.mjs click"导入材料"+contains 断言（`:9-10`）→search 窗口 `^导入审核材料$` 末个（`:12`）→windowactivate+Ctrl+L（`:13-14`）→几何读取后坐标点击路径栏清空（`:16-17`）→type fixtures 路径（`:18`）→右下角坐标点确认（`:19-20`）→打印结果。

## 4. 调用者与调用链

- 入向：ui-acceptance 验收流程（导入链一步）。
- 出向：ui.mjs（本批）、xdotool/Xvfb（Linux 验收环境）。

## 5. 数据 I/O、读写与副作用

GUI 输入注入；无文件写。

## 6. 分支、失败、取消与恢复

check=True 失败即中断；坐标/时序硬编码（sleep 魔法值 `:11,15,20` 照实记录）。

## 7. 权限与权威状态

仅验收环境（Xvfb+xdotool）；断言由 ui.mjs contains 把关。

## 8. 修改影响面

UI 验收导入链的原生对话框一步；环境耦合（/tmp 硬编码+坐标）。

## 9. 测试证据

`NOT_RUN`。无直接测试（验收资产；未运行）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 流程/环境耦合/时序硬编码 | 已证实 | `:1-21` 全文 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 脚本体 | §2/§3 | 3-21 | covered |
