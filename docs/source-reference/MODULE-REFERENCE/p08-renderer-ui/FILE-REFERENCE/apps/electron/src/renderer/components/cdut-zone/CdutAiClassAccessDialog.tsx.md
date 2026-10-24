---
path: apps/electron/src/renderer/components/cdut-zone/CdutAiClassAccessDialog.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a129cbf85bd7c2195cd2ebcb807e3b652dfaaf16
sha256: 69543c792c0d39e791f3399595c84acfd83abb29bbc8d5c1cbfbdcb6c7d83258
lines: 87
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/CdutAiClassAccessDialog.tsx

## 1. 结论与边界

「AI速课堂」**访问受限登录引导弹窗**（87 行）：未登录特区账户点被锁定的课堂项目/会话即触发；视觉对齐 GatekeeperNoticeModal（校徽+说明+操作+版权微标，`:3-5`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `CdutAiClassAccessDialog` | `:18-87` | 无 props：`cdutAiClassLockPromptAtom` 控开合（`:19`）；`useGlobalOverlay(open)`（`:22-23` 登录弹窗让智联万站原生视口让位）；`goToCdutZone:27-30`（activeViewAtom→'cdut-zone'+关弹窗）；open=false→null |

## 3. 内部逻辑与关键流程

atom 驱动弹窗：校徽区（CdutLogo+标题）→说明卡（防外泄文案+"凭据仅经操作系统安全加密保存在本地，绝不上云" `:52`）→双按钮（稍后再说/前往 CDUT 专区）→版权微标（"Powered by 雫窝中央实验室 · 2026" `:81`）。

## 4. 调用者与调用链

全局弹窗层（App 级挂载）；出向 `@/atoms/cdut-account-atoms`（lockPromptAtom）、`@/atoms/active-view`、`@/atoms/overlay-atoms`（useGlobalOverlay）、`@profer/ui`（Button/Z_LAYER）。

## 5. 数据 I/O、读写与副作用

atom 读写+全局 overlay 登记；无网络。

## 6. 分支、失败、取消与恢复

open 闸（null 短路）；按钮双出口。

## 7. 权限与权威状态

- **凭据安全声明**（`:52`）："绝不上云"——UI 宣言，实现方在认证层。
- `useGlobalOverlay` 全局模态叠加契约（原生视口避让）。

## 8. 修改影响面

改弹窗影响未登录引导链路；Z_LAYER 层级影响叠放。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件/atom 链/overlay 契约 | 已证实 | 87 行全读 |
| 凭据加密实现（"绝不上云"） | 未知 | 认证层不在本批（UI 宣言） |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；实现/实效 unknown。
