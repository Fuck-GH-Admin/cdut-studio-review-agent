---
path: apps/electron/src/renderer/components/cdut-zone/CdutZoneView.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ca069b82a29e788095c695108e8d972ad7b3d90a
sha256: 56634b68fb6f4506bd9efd391e1a2cd4973560dc677c11a9a9bf8aef12768f57
lines: 627
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/CdutZoneView.tsx

## 1. 结论与边界

CDUT 专区主界面（文件头 `apps/electron/src/renderer/components/cdut-zone/CdutZoneView.tsx:1-12`）：顶栏（学士帽+「特区账户」徽章+拖拽区）+主视图+左下角校宠水印。未登录=左右分栏（品牌愿景/能力矩阵+一体化登录卡，**后台静默提交 CAS**）；已登录=70 周年横幅+用户信息字段群+校标 Bento 三板块+高频场景胶囊。如实标注（`:10-11`）：`active`=最近一次认证成功且后台静默保活心跳正常；**本客户端不嗅探内网 Cookie，密码仅在勾选时经 OS 级加密落盘**。

## 2. 导出与关键符号

`export` 逐条核对：1 个组件 = 1 个导出。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CdutZoneView` | 组件（导出） | 81-627 | 主界面 |
| `SUB_VIEW_TITLES`/`CAPABILITY_CARDS` | 内部常量 | 56-79 | 子页标题/能力矩阵三卡 |

## 3. 内部逻辑与关键流程

- **子页面路由**（`:134-160`）：ai-class 先弹会话选择（`AiClassSessionPickerModal`），其余直进；进入时**记忆并折叠主边栏**，关闭/卸载恢复（`:124-131` ref 防闭包旧值）；**登出/登录态失效强制退回首页恢复边栏**（材料审核除外，`:163-169`）。
- **状态订阅**（`:172-190`）：`getAccount`+`onStatusChanged`；失败保持未连接。
- 登录（`:209-240`）：`performLogin` 统一内核（手动/一键共用）；错误文案回显；`handleOneClickLogin`（`:243-262`）未保存密码仅填学工号提示补充；`handleSwitchAccount` 回纯输入。
- **一键填充名片**（`:440-489`）：已保存账户（`getSavedAccount`，`:193-206`）+`CdutPrivatePhoto` 头像。
- 登录卡（`:491-576`）：显隐密码/记住密码（OS 级加密文案）；`data-tour` 导游锚点。
- 已登录（`:581-597`）：横幅/`CdutProfileFields`/`CdutHeroSection`（Bento onSelect）/`CdutQuickBar`。
- **本地材料审核入口不依赖校园账户**（`:237-245` 注释：正式校园能力仍受独立登录保护）。
- 窗口布局：拖拽区在 Windows 窗口按钮前结束防高 DPI 误判（`:292-298`）；`WindowControlsHost` priority 20 高于 MainArea 兜底（`:299-301`）。
- 子页面内容包 `CdutZoneErrorBoundary`（`:323`）。

## 4. 调用者与调用链

入向：应用主路由 CDUT 专区入口；测试：本批**无专属测试**（scope 无 `.test.ts`）。出向：jotai（cdut-account/tab-atoms）、`@/hooks/useEnterCdutAiClass`、同目录子组件族、`window.electronAPI.cdutZone`（getAccount/onStatusChanged/getSavedAccount/login/logout）。

## 5. 数据 I/O、读写与副作用

IPC 五调用+状态订阅；边栏折叠/恢复副作用；本地表单状态。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 状态拉取失败 | 保持未连接 | 179-181 |
| 登录失败 | 错误卡回显 | 222-228 |
| 未保存密码 | 填学工号+提示 | 255-259 |
| 登录态失效 | 子页退回+边栏恢复 | 163-169 |
| 离开子页/卸载 | 边栏恢复 | 124-131,155-160 |
| 登出 | ConfirmDialog 确认（清加密凭据+停保活，`:618`） | 604-623 |

## 7. 权限与权威状态

认证权威=CAS（主进程静默提交）；凭据安全=OS safeStorage 本地加密**绝不上云**（`:249-251`）；不嗅探 Cookie 契约（`:11`）；本地材料审核独立于校园登录。

## 8. 修改影响面

改登录流影响特区接入；改子页路由影响三板块。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型/真实 CAS。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 不嗅探 Cookie/加密落盘契约 | 已证实 | `:10-11,249-251` |
| 边栏记忆/失效回退 | 已证实 | `:124-169` |
| 一键填充/登出确认 | 已证实 | `:243-262,604-623` |
| 本地审核免登录边界 | 已证实 | `:237-245` |
| 真实 CAS 流 | 未知 | 未运行 |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 主组件+常量 | §2,§3 | 56-627 | covered |
| 断言 | §9,§10 | — | unknown |
