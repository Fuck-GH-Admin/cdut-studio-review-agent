---
path: apps/electron/src/renderer/components/cdut-zone/CdutProfileFields.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 263e175dd90621df7fea459594053c0063dcc418
sha256: 08f44af9fe4b2740412bce87b2de53c7526faf76ee8b55d71f4a4a2b93a15fd7
lines: 158
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/CdutProfileFields.tsx

## 1. 结论与边界

已登录态**「校园实名智能卡」**（158 行）：玻璃拟态徽章——红金渐变+毛玻璃、认证印章条、真实头像（CdutPrivatePhoto 蒙版）+在线信标、姓名+学工号复制胶囊、学院/专业/身份徽章、退出按钮（`:2-11`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `CdutProfileFields` | `:32-158` | `({account: CdutAccountProfile, onLogout})`：`copied` state+1.5s 复位（`:38-42`）；`handleCopyStudentId:44-52`（clipboard.writeText，**失败静默** `:49-51`）；结构=流光饰带+认证条（"成理统一身份认证 · 官方实名认证"+保活心跳）+头像区（`CdutPrivatePhoto`/缺省 User 图标+emerald ping 信标）+姓名/学工号徽章（Tooltip 复制钮 `:111-128`）+`metaPills`（学院/专业/身份）+退出按钮 |

内部：`META_PILL_CLASS:29-30`（徽章统一类）。

## 3. 内部逻辑与关键流程

复制交互（剪贴板+1.5s 反馈）；metaPills map 渲染（title 兜底 '—'）；退出回调透传。

## 4. 调用者与调用链

CDUT 专区已登录面板；出向 `@profer/shared`（CdutAccountProfile）、`@profer/ui`（Tooltip 族）、`./CdutPrivatePhoto`、`lucide-react`。

## 5. 数据 I/O、读写与副作用

剪贴板写入（navigator.clipboard）；无网络。

## 6. 分支、失败、取消与恢复

剪贴板失败静默（`:49-51` 注释）；字段缺省 '—'/'未命名用户'；timer 清理防泄漏。

## 7. 权限与权威状态

认证印章/保活心跳为**展示性声明**（真实校验在认证层）；头像默认隐私蒙版（CdutPrivatePhoto）。

## 8. 修改影响面

改卡片影响个人信息展示；复制/退出交互影响账户操作。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件交互/兜底文案 | 已证实 | 158 行全读 |
| 认证印章/心跳的真实性 | 未知 | 展示层声明，认证层不在本批 |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；认证层/实效 unknown。
