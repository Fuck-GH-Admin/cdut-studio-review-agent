---
path: apps/electron/src/main/lib/security/executable-open-guard.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6458ac87c0f3f557b2154361a9414085bcb8f5a2
sha256: 8868d09435824f37ad90fb9c7854fad7ffbed21c5db0d444facddd7592c27452
lines: 73
kind: source
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/security/executable-open-guard.ts

## 1. 结论与边界

**Windows 可执行文件打开确认守卫**（73 行，CVE-2026-96951 Windows Shell MotW 绕过防御）：`shell.openPath` 拉起 `.exe`/`.bat`/`.ps1` 等会被静默执行，故在「用系统默认应用打开」入口放行前，命中潜在可执行后缀且未勾选「不再提醒」时弹绑定主窗口的模态确认；选择持久化到 `executableOpenWarningDismissed`。

边界：**仅 Windows 生效**（macOS/Linux 直通，决策注释 `:12`）；后缀判定在 `@profer/shared.isPotentiallyExecutableFile`（域外）；只做确认不拦 `openPath` 之外的执行面。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `shouldConfirmExecutableOpen` | 导出函数 | 26-36 | `(absPath, platform=process.platform, underTest=Boolean(process.env.BUN_TEST), dismissedGetter=() => getSettings().executableOpenWarningDismissed): boolean` | 纯判定（便于测试） |
| `confirmExecutableFileOpen` | 导出函数 | 42-73 | `(absPath) => Promise<boolean>` | 弹窗确认；true=放行 |

导出计数：`export` 2 条（`:26`、`:42`），与源码一致。

## 3. 内部逻辑与关键流程

- **shouldConfirmExecutableOpen**（`:26-36`）：四短路——非 win32 → false（`:32`）；`underTest`（BUN_TEST）→ false（`:33`，防自动化挂起）；非潜在可执行后缀 → false（`:34`）；`dismissedGetter() === true` → false（`:35`）；否则 true。
- **confirmExecutableFileOpen**（`:42-73`）：
  1. `shouldConfirmExecutableOpen` false → 直接 true（`:43`）。
  2. MessageBoxOptions（`:45-56`）：warning 类型、「打开可执行文件确认」、detail 含绝对路径与风险提示、按钮 `['取消','仍要运行']`（defaultId/cancelId=0）、`checkboxLabel:'不再提醒（对可执行/脚本文件直接放行）'`、`noLink:true`。
  3. 绑定主窗口模态（`getMainWindow()` 存活时 `showMessageBox(mainWindow, options)`，否则无 parent 兜底，`:58-62`；注释：防弹到屏幕角落被遮挡卡等）。
  4. `checkboxChecked` → `updateSettings({executableOpenWarningDismissed: true})`，失败仅 console.warn 不阻塞放行决策（`:64-71`）。
  5. `return response === 1`（「仍要运行」放行）（`:72`）。

## 4. 调用者与调用链

- 入向（全冻结树 `grep executable-open-guard|两导出名`，apps+packages 全类型）：
  - `apps/electron/src/main/index.ts:13` import、`:807`、`:819`（外链/文件打开入口，`confirmExecutableFileOpen(sysPath).then(allowed => …)`）。
  - `apps/electron/src/main/ipc.ts:342` import、`:1573`、`:4868`（两处 IPC 打开入口放行前确认）。
  - `apps/electron/src/main/lib/detached-preview-window.ts:14,166,180`（独立预览窗口打开面）。
  - `apps/electron/src/main/lib/browser-controller.ts:16,546`（内置浏览器下载文件打开面）。
  - `packages/shared/src/constants/permission-rules.ts:181` 注释引用（前置确认防线说明）。
  - **直接测试**：`security/executable-open-guard.test.ts`（30 行，**5 test**，同批）。
- 出向：`electron.dialog`（`:15`）、`@profer/shared.isPotentiallyExecutableFile`（`:17`）、`../main-window-state.getMainWindow`（`:19`）、`../settings-service`（`:20`）。

## 5. 数据 I/O、读写与副作用

- 磁盘写：settings.json（`executableOpenWarningDismissed`，经 `updateSettings`）。
- 副作用：模态对话框（阻塞用户操作）；console.warn。
- 无网络。

## 6. 分支、失败、取消与恢复

- 四短路（§3）；用户「取消」→ false，调用方放弃打开（`index.ts:807` 等 `allowed` 分支）。
- `updateSettings` 失败：catch 后仅留痕（`:67-70`），本次决策不受影响（`checkboxChecked` 只影响下次）。
- 「不再提醒」持久化后**永久跳过**（无撤销入口于本文件；设置侧撤销域外）。
- 取消/恢复：`dialog.showMessageBox` 的响应即取消语义；无异步残留。

## 7. 权限与权威状态

- 安全边界语义：Windows Shell MotW 绕过（CVE-2026-96951）的人工确认防线；`permission-rules.ts:181` 注释将其定位为「前置确认防线」。
- 权威状态：`executableOpenWarningDismissed`（settings，用户显式勾选）；`BUN_TEST` 环境无头拒止防自动化挂起（`:33`）。

## 8. 修改影响面

- 四个打开入口（index/ipc/detached-preview/browser-controller）；改判定语义影响全部「系统默认应用打开」面。
- `isPotentiallyExecutableFile`（shared）后缀集合为判定依据；settings 字段 `executableOpenWarningDismissed`。
- 测试：`executable-open-guard.test.ts`（5 用例）覆盖四短路，改动需同步。

## 9. 测试证据

- 直接测试：`security/executable-open-guard.test.ts`（30 行，bun:test，**5 test**，NOT_RUN）。mock 边界：纯函数测试——`dismissedGetter` 以闭包注入（无 fs/无 electron dialog）。断言摘要：①win32+可执行后缀+未忽略 → true（`.exe`/`.bat`/`.ps1` 三例，`:7-9`）；②已勾选「不再提醒」→ false（`:13`）；③darwin/linux 直通（`.sh` 及 darwin 下 `.exe` 均 false，`:17-19`）；④BUN_TEST 无头拒止（`:23`）；⑤普通文档 `.pdf`/`.txt` 不弹（`:27-28`）。
- 未覆盖：`confirmExecutableFileOpen` 弹窗/持久化路径（需 Electron dialog）、主窗口不可用回退、checkbox 写失败。
- `NOT_RUN`：未运行 bun test/产品测试/typecheck/build/GUI/真实弹窗；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出与四短路 | 已证实 | `:26-36` |
| 绑定主窗口模态+无 parent 兜底 | 已证实 | `:58-62` |
| checkbox 持久化失败不阻塞 | 已证实 | `:64-71` |
| 仅 Windows 生效决策 | 已证实 | `:12` 注释、`:32` |
| 5 用例断言 | 已证实 | `executable-open-guard.test.ts:6-29` |
| CVE-2026-96951 防御定位 | 已证实 | `:2-12` 注释、`permission-rules.ts:181` |
| 真实弹窗/持久化行为 | 未知 | NOT_RUN |
| 测试通过与否/运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `shouldConfirmExecutableOpen` 四短路 | §3/§9 | 26-36 | covered |
| `confirmExecutableFileOpen` 弹窗链 | §3/§5 | 42-73 | covered |
| 「不再提醒」持久化 | §3/§6 | 64-71 | covered |
| 弹窗/持久化运行行为 | §9/§10 | — | unknown（NOT_RUN） |
| 运行验证 | §10 | — | unknown（NOT_RUN） |
