---
path: apps/electron/src/renderer/lib/banner-key-scope.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2c15a07bbdcab80da56f7a34118a6a0acc290787
sha256: 9d20fa90ddc75acd5d44d71ac49e22f094ab57cbbc11241e393f43f1faa453e8
lines: 65
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/banner-key-scope.ts

## 1. 结论与边界

**交互横幅全局键盘作用域判定**（65 行）：AskUser / ExitPlanMode / Permission 三横幅共用的排除式规则——横幅内接管、外部可编辑/可交互控件放行、其余接管（`banner-key-scope.ts:3-10`）。边界：只判定不执行按键动作。

## 2. 导出与关键符号

导出 3 条（1 接口 + 2 函数）、0 常量：`interface BannerKeyScope`（`banner-key-scope.ts:39`，字段 insideBanner/editable/interactiveControl）、`shouldHandleBannerKey`（`:49`）、`resolveBannerKeyScope`（`:56`）。内部符号 1 个：`EXTERNAL_INTERACTIVE_SELECTOR`（`:15`，内部，21 个选择器 join 的逗号串，含 button/a[href]/select/summary/contenteditable/.ProseMirror/15 个 ARIA role）。

## 3. 内部逻辑与关键流程

- `shouldHandleBannerKey`（`banner-key-scope.ts:49-53`）：`:50` insideBanner → true（优先级最高，即使 editable）；`:51` editable 或 interactiveControl → false；否则 true（`:52`）。
- `resolveBannerKeyScope`（`:56-65`）：取 `event.target`，`:58` 非 Element 归 null；`:59` insideBanner = container 非空且 container.contains(element)；`:62` editable 委托 `isEditableTarget(target)`（来自 `./navigation-controller`，`:12`）；`:63` interactiveControl = element.closest(EXTERNAL_INTERACTIVE_SELECTOR) != null。

## 4. 调用者与调用链

- 入向：`apps/electron/src/renderer/components/agent/AskUserBanner.tsx:26` import、`:283` 调用；`PermissionBanner.tsx:16`、`:55`；`ExitPlanModeBanner.tsx:26`、`:142`（均 `shouldHandleBannerKey(resolveBannerKeyScope(e, bannerRef.current))`）；测试 `AskUserBanner.test.tsx:8` import `shouldHandleBannerKey`（`:56-68` 四组 expect）。
- 出向：`./navigation-controller` 的 `isEditableTarget`（`banner-key-scope.ts:12`）。
- 动态调用：未知；检索方式——冻结树 grep `banner-key-scope|shouldHandleBannerKey|resolveBannerKeyScope|BannerKeyScope`（*.ts/*.tsx），无 import()/require()，preload 桥无引用。

## 5. 数据 I/O、读写与副作用

模块级只读常量 + 纯函数；无状态写入；无 DOM 修改（仅读 DOM 树做 contains/closest 判定）、无 toast/窗口/事件订阅副作用。

## 6. 分支、失败、取消与恢复

insideBanner → true（`:50`）；外部 editable/interactiveControl → false（`:51`）；body/聊天漫游容器（tabIndex=-1）/普通容器 → true（`:8-9` 注释场景）。边界：target 非 Element（如 document）→ element=null，insideBanner=false、interactiveControl=false，仅剩 editable 判定（`:58-63`）；container 为 null → insideBanner=false（`:59`）。无 throw、无异步。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。键盘接管权按 DOM 作用域裁决（横幅内 > 外部控件原生语义 > 全局接管，`banner-key-scope.ts:5-9`）。

## 8. 修改影响面

三个横幅组件的 document keydown 处理（AskUserBanner.tsx:283、PermissionBanner.tsx:55、ExitPlanModeBanner.tsx:142）；放宽会误劫持侧边栏/设置/输入框的 Enter 与方向键（`:4-5` 注释）。

## 9. 测试证据

`NOT_RUN`（本轮未运行测试，纯静态阅读）。直接测试文件：无（本批无 banner-key-scope.test）。间接证据：`AskUserBanner.test.tsx` grep `expect(shouldHandleBannerKey` 4 处（`:56` 全 true→true、`:60`/`:64` 外部控件→false、`:68` 全 false→true）。断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三态判定与目标解析 | 已证实 | `banner-key-scope.ts:49-65` |
| isEditableTarget 行为 | 推断 | 委托 navigation-controller.ts:20，实现在域外 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| BannerKeyScope | §2 | 39-46 | covered |
| shouldHandleBannerKey | §3/§6 | 49-53 | covered |
| resolveBannerKeyScope | §3/§6 | 56-65 | covered |
| EXTERNAL_INTERACTIVE_SELECTOR | §2 | 15-37 | covered |
