---
path: apps/electron/default-skills/pptx/scripts/office/pptx2png.ps1
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 267931bee68c16261df15367ebd966d34d2bde25
sha256: ccb27161138cb9a4cc8e577533b4c5b7de707fbaff8d2bb2fb4537aff0a3d437
lines: 61
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/default-skills/pptx/scripts/office/pptx2png.ps1

## 1. 结论与边界

**PPTX→PNG 视觉 QA 渲染器**（PowerShell，61 行）：Windows 优先本机 PowerPoint COM，每页导出 1280x720 PNG（`pptx2png.ps1:1-3`）。副作用=写 PNG 文件+启停 PowerPoint COM 进程。

## 2. 导出与关键符号

脚本参数（`:4-7`）：`-InputPath`（必填）、`-OutDir`（缺省=输入同级 `render/`）。无函数导出（脚本体）。

## 3. 内部逻辑与关键流程

（`:13-46`）：输入存在性检查（`:14-16`）→ Resolve-Path 归一（`:18`）→ OutDir 缺省/建目录（`:19-23`）→ `New-Object -ComObject PowerPoint.Application`（`:25`）→ `Visible=0`（**MsoTriState msoFalse=0 不能传布尔**，注释 `:26-27`）→ `DisplayAlerts=1`（PpAlertLevel ppAlertsNone=1；0 非法，`:28-29`）→ `Presentations.Open(path, ReadOnly=true, Untitled=false, WithWindow=false)`（`:31`）→ 逐页 `Export(out, "PNG", 1280, 720)` 并回检输出存在（`:33-43`）→ DONE 汇总（`:45`）。catch 统一抛 "PPTX Visual QA 渲染失败"（`:47-49`）；finally 释放 COM（Close/Quit/ReleaseComObject+GC，`:50-61`）。

## 4. 调用者与调用链

- 入向：pptx 技能流程（技能文档/Agent 命令行，域外——用法行 `:3`）。
- 出向：PowerPoint COM（Windows 本机应用）。

## 5. 数据 I/O、读写与副作用

读 .pptx；写 `<OutDir>/slide-NN.png`（覆盖前先删旧文件 `:35-37`）；启停 PowerPoint COM 对象。

## 6. 分支、失败、取消与恢复

失败=统一 catch 抛错（含逐页导出失败抛（`:39-41`））；finally 保证 COM 释放；无取消路径。

## 7. 权限与权威状态

无权限分支，依据：本地文件+COM 操作；视觉 QA 产物权威=1280x720 PNG 逐页。

## 8. 修改影响面

视觉 QA 环节（Windows 渲染）；COM 枚举值语义被注释锁定（msoFalse/ppAlertsNone）。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无 test 文件）；依赖 Windows+PowerPoint 环境（静态不可运行验证）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 流程/COM 枚举注释/清理 | 已证实 | `:1-61` 全文 |
| COM 行为（Export 像素精度等） | 边界 | Windows/Office 域外 |
| 运行验证 | 未知 | NOT_RUN（无 Windows/PowerPoint 环境） |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 全脚本 | §2/§3 | 4-61 | covered |
