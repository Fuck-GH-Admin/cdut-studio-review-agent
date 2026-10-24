---
path: apps/electron/src/renderer/lib/navigation-controller.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2a77d1f8510d6ef6ddbaf365bd7354633af10543
sha256: 363fca3502f71f09b5e271c1804fc53251a5708de009455e27f63604098b10fd
lines: 54
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/navigation-controller.ts

## 1. 结论与边界

键盘导航动作的**优先级分发控制器**（54 行）：消费者注册（优先级+注册序），dispatch 按优先级降序投递、首个消费即停；另有 `isEditableTarget` 判定原生/富文本编辑上下文（导航输入不得抢其原生语义，`:16-19` 注释）。纯内存事件分发，无 DOM 依赖（`isEditableTarget` 鸭子类型可在无 DOM 环境判定）。

**边界**：不解析按键（`NavigationInputProvider` 跨批）；不持久化；`navigationController` 单例为进程内共享。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `NavigationConsumer` | 类型（导出） | 3 | `(action: NavigationAction) => boolean` | 消费者（返回是否消费） |
| `NavigationController` | 接口（导出） | 11-14 | `{register(consumer, priority?) => 注销函数; dispatch(action) => boolean}` | 控制器契约 |
| `isEditableTarget` | 函数（导出） | 20-32 | `(target: EventTarget \| null) => boolean` | 编辑上下文判定 |
| `createNavigationController` | 函数（导出） | 34-52 | `() => NavigationController` | 工厂 |
| `navigationController` | 常量（导出） | 54 | `createNavigationController()` | 模块单例 |

内部：`ConsumerEntry`（`:5-9`，`{consumer, priority, sequence}`）。导出合计 5。

## 3. 内部逻辑与关键流程

1. **isEditableTarget**（`:20-32`）：非对象 target → false（`:21`）；鸭子类型取 `tagName/isContentEditable/closest`（`:22-26`）；判定 = `tagName==='INPUT' || 'TEXTAREA' || isContentEditable===true || closest('[contenteditable="true"], .ProseMirror')` 命中（`:27-31`）。
2. **createNavigationController**（`:34-52`）：闭包 `Set<ConsumerEntry>` + 递增 `sequence`（`:35-36`）。`register`（`:39-43`）：priority 默认 0、记录注册序、返回 `() => consumers.delete(entry)` 注销函数。`dispatch`（`:44-50`）：`[...consumers].sort((a,b) => b.priority - a.priority || b.sequence - a.sequence)`（`:45`）——**优先级降序；同优先级注册序倒序（后注册者先得）**；依次调用，首个返回 true 即 return true（`:46-48`）；无人消费返回 false（`:49`）。

## 4. 调用者与调用链

入向（全冻结树检索 `navigation-controller`/`isEditableTarget`/`navigationController`，8 个消费文件）：
- `lib/banner-key-scope.ts:12`（`isEditableTarget`，`banner-key-scope.ts:62`）。
- `components/app-shell/SearchDialog.tsx:23`（`navigationController`）。
- `components/app-shell/left-sidebar/use-left-sidebar.ts:98`（`navigationController`）。
- `components/navigation/NavigationInputProvider.tsx:3`（两者，`use-left-sidebar.ts:120`/`use-left-sidebar.ts:306`）。
- `components/agent/ExitPlanModeBanner.tsx:25`（`isEditableTarget`，`use-left-sidebar.ts:148`）。
- `components/agent/AskUserBanner.tsx:25`（`isEditableTarget`，`use-left-sidebar.ts:299`）。
- `components/content-review/ContentReviewView.tsx:35`（`isEditableTarget`，`use-left-sidebar.ts:155`）。
- `components/shared/ModelSelector.tsx:33`（`navigationController`）。
- 注意：`components/diff/InteractivePreviewViewport.tsx:261` 定义**同名局部函数** `isEditableTarget`（非本模块调用者，检索排除）。
- 出向：类型 `NavigationAction`（`./navigation-actions` `:1`）。

## 5. 数据 I/O、读写与副作用

无磁盘/网络（不适用，依据：全文仅 Set/排序/函数调用）。状态=闭包内 Set+sequence 计数（内存）；副作用=分发调用消费者回调。无锁（单线程事件循环）。

## 6. 分支、失败、取消与恢复

- 分支：isEditableTarget 四条件（`:27-31`）+ 非对象短路（`:21`）；dispatch 排序+首个消费短路（`:46-48`）。
- 无 throw（不适用，依据：全文无 throw）。
- 恢复：注销函数可移除消费者（`:42`）；无持久状态，页面刷新即重置。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。权威状态=Set 中当前注册的消费者集合；分发顺序（priority/sequence）是唯一裁决语义。

## 8. 修改影响面

- 分发顺序语义（同优先级**倒序**）被 8 个消费方依赖；改动会翻转同优先级消费者的覆盖关系（如 SearchDialog 与 sidebar 的抢占）。
- `isEditableTarget` 的选择器面（`[contenteditable="true"], .ProseMirror`）与编辑器实现耦合（TipTap ProseMirror）；新增编辑器需同步。
- 需同步修改的测试：`navigation-controller.test.ts`（批内 3 用例）。

## 9. 测试证据

直接测试：`lib/navigation-controller.test.ts`（批内，3 test，详见其手册）：优先级降序消费（`dispatch('next')` 调用序断言）、消费即停+注销、isEditableTarget 鸭子类型 5 断言。未覆盖：同优先级注册序倒序无专门断言（`:45` 的 `b.sequence - a.sequence` 分支）。

`NOT_RUN`：本轮未运行 bun test，断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 排序语义/短路/注销/鸭子判定 | 已证实 | `:1-54` 全文逐行 |
| 8 个消费方与同名局部函数排除 | 已证实 | 全树检索（§4） |
| 同优先级倒序的实际交互影响 | 推断 | `:45` 语义+消费方注册（跨批） |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `NavigationConsumer`/`NavigationController`/`ConsumerEntry` | §2 | 3-14 | covered |
| `isEditableTarget` | §3.1/§9 | 20-32 | covered |
| `createNavigationController`（register/dispatch/排序） | §3.2 | 34-52 | covered |
| `navigationController` 单例 | §2 | 54 | covered |
| 同优先级倒序 | §3.2/§9 | 45 | covered（无断言） |
