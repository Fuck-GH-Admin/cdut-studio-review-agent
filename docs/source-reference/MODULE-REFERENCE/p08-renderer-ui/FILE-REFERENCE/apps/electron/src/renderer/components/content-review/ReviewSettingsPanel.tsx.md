---
path: apps/electron/src/renderer/components/content-review/ReviewSettingsPanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4f99087cf684428626b97f225412d1749066455f
sha256: 14c4c78507220085bbe6b1f58c588d1fa74f8c1c79ed2f402e5caed1f7b59f8d
lines: 12
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewSettingsPanel.tsx

## 1. 结论与边界

「审核设置」页的**薄包装组件**：一个标题区 + 复用 `ReviewFirstUseReadiness`，并把 `onSaved` 原样透传（`apps/electron/src/renderer/components/content-review/ReviewSettingsPanel.tsx:4-11`）。它是运行时 UI 组件，本身没有状态、没有 effect、没有 IPC 调用。

明确不做的事：

- **不创建第二套渠道配置**。注释与正文都写明「渠道和密钥仍在应用模型设置中管理」（`:1`、`:8`）。
- **不保存任何设置**。保存动作在子组件里（`ReviewFirstUseReadiness.tsx:52-67`，调用 `window.reviewAPI.saveModuleSettingsV2`）。
- **不做权限判断**。无 sender/role/actor 逻辑。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ReviewSettingsPanel` | 导出函数组件 | `:4` | `({ onSaved }: { onSaved: () => void }): JSX.Element` | 唯一导出；`onSaved` 为必填 |

内部无其它顶层声明（无常量、无内部组件）。`export` 行仅 `:4`，与源码一致。

## 3. 内部逻辑与关键流程

单次渲染，无分支（除 JSX 结构外无 `if`）：

1. 外层 `div` 限宽 `max-w-3xl` 并居中（`:5`）。
2. 标题「审核设置」+ 说明「默认沿用应用已配置的模型渠道……」（`:6-9`）。
3. 渲染 `<ReviewFirstUseReadiness onSaved={onSaved} />`（`:10`）。

`onSaved` 在子组件保存成功后调用（`ReviewFirstUseReadiness.tsx:63`），本文件不包装、不改写参数。

## 4. 调用者与调用链

**入向**

- `apps/electron/src/renderer/components/content-review/ContentReviewView.tsx:442`：`section === 'settings'` 时挂载，传入 `onSaved={() => void actions.initialize()}`。
- `ContentReviewView.tsx:277`：出口徽标不可用时点击「设置」把 section 切到 `settings`，从而间接触发本组件挂载。

**出向**

- `ReviewFirstUseReadiness`（`apps/electron/src/renderer/components/onboarding/ReviewFirstUseReadiness.tsx:17`）。
- 经子组件间接调用 `window.electronAPI.listChannels`、`window.reviewAPI.getModuleSettingsV2`、`getModelGatewayStatus`、`saveModuleSettingsV2`、`requestT01ModelDraft`（子组件 `:34-36`、`:59`、`:62`、`:77`）。

## 5. 数据 I/O、读写与副作用

- 输入：`onSaved` 回调。
- 输出：DOM。
- 无磁盘/网络/缓存/全局状态读写；无定时器、无监听器、无副作用。
- 幂等性不适用（纯展示）。

## 6. 分支、失败、取消与恢复

- 本文件无分支与错误处理；保存失败由子组件写入自身 `error` 状态并渲染 `role="alert"`（`ReviewFirstUseReadiness.tsx:64-66`、`:152`），不会向上抛。
- 取消/恢复：不适用，无持久化状态。

## 7. 权限与权威状态

- 无权限分支，依据：本文件无 sender/role 检查、无 IPC 调用。
- 权威状态：审核模型选择由 Main 的 `module-settings-store.ts` 持久化，保存时 Main 还会二次校验渠道/模型可用性（`review-ipc.ts:1504-1523`）。本组件只是入口。

## 8. 修改影响面

- 唯一调用方 `ContentReviewView.tsx:442`；改 props 需同步该处。
- 子组件 `ReviewFirstUseReadiness` 的 props 变化会直接影响本文件。
- 无存储格式、无 IPC 名称、无类型导出，改动影响面局限在设置页外观与 `onSaved` 时序。

## 9. 测试证据

- 直接测试：无（`grep -rln "ReviewSettingsPanel" apps/electron/src --include=*.test.*` 无命中）。
- 间接：`ContentReviewView` 也无直接测试；设置页保存链路的真实断言在 `review-actions-controller.test.ts` 之外的 Main 测试（如 `module-settings-store` 相关，本批未读）。
- **NOT_RUN**：本轮未执行测试/构建/GUI。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一导出为 `ReviewSettingsPanel`，`onSaved` 必填 | 已证实 | `:4` |
| 无状态、无 effect、无 IPC | 已证实 | `:1-12` 全文 |
| 保存由子组件完成并回调 `onSaved` | 已证实 | `ReviewFirstUseReadiness.tsx:59-63` |
| 设置页只由 `ContentReviewView` 在 `settings` section 挂载 | 已证实 | `ContentReviewView.tsx:441-443` |
| 设置页是否在窄屏下也可用 | 未知 | 未读父容器样式；本文件无宽度分支 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `ReviewSettingsPanel` 导出与 props | 2 | `:4` | covered |
| 标题与说明文案 | 3 | `:6-9` | covered |
| 子组件挂载与 `onSaved` 透传 | 3、4 | `:10` | covered |
| 权限/权威 | 7 | — | covered（无逻辑） |
| 测试 | 9 | — | unknown（无直接测试） |
