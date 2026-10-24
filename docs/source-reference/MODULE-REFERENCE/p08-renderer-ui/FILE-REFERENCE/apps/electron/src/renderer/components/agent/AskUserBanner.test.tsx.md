---
path: apps/electron/src/renderer/components/agent/AskUserBanner.test.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: dbbc2ce0fdce482772281431cda7cad23a399f4a
sha256: 902b3c79a07236feb64f184de0b0d6c9d9ba708dabd1ec5be2403d10cb6ef459
lines: 181
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/AskUserBanner.test.tsx

## 1. 测试目标

AskUserBanner 交互语义回归（按历史 BUG 编号组织）：全局键盘作用域（BUG-1）、焦点与选中解耦（BUG-2/6）、提交合并与前置校验（审计①②）、Tab 边界与初始焦点（BUG-3/5）、SSR 渲染（BUG-4/5）。被测：`askUserItemCount/clampTabIndex/moveAskUserFocus/digitKeyToItemIndex/initialFocusIndex/resolveChoiceEnterAction/setAnswerOption/setAnswerCustom/isAnswerValid/serializeQuestionAnswer` + `shouldHandleBannerKey`（banner-key-scope）+ SSR 渲染（`renderToStaticMarkup`+jotai Provider）。本轮 `NOT_RUN`。

## 2. 用例清单

5 describe、**20 test**：

### 2.1 全局键盘作用域 BUG-1（4，`:54-71`）
1. `:55-58` 横幅内始终接管。 2. `:59-62` 外部输入框放行（Enter 不劫持）。 3. `:63-66` 外部会话条目等可交互控件放行。 4. `:67-71` 漫游容器（tabIndex=-1）与 body 继续接管。

### 2.2 焦点与选中解耦 BUG-2/6（6，`:72-117`）
5. `:73-80` 方向键环形移动、无焦点落首尾。 6. `:81-87` 移焦不写答案（纯函数只返回索引）。 7. `:88-95` 多选「其他」保留已勾选。 8. `:96-100` 单选「其他」清空已选。 9. `:101-108` `setAnswerOption` 多选切换/单选替换。 10. `:109-117` 数字键映射+拒绝越界。

### 2.3 提交合并与前置校验（4，`:118-141`）
11. `:119-123` 多选合并已勾选+「其他」文本。 12. `:124-128` 未展开「其他」只回勾选。 13. `:129-133` 单选「其他」优先自定义、填空取纯文本。 14. `:134-140` 未作答判无效（不回传空 answers）。

### 2.4 Tab 边界与初始焦点 BUG-3/5（3，`:142-163`）
15. `:143-149` `clampTabIndex` 永不越界。 16. `:150-155` 单选聚焦首项而非预选。 17. `:156-163` Enter 三态语义（确认聚焦/展开其他/直接前进）。

### 2.5 SSR 渲染 BUG-4/5（3，`:164-181`）
18. `:165-171` 单选打开无预选项。 19. `:172-177` 多问题非末页有「下一题」纯鼠标通道。 20. `:178-181` 多选渲染「其他...」入口。

## 3. 真实断言

- BUG 编号注释锁定历史缺陷回归口径。
- #1-#4 覆盖 `shouldHandleBannerKey` 作用域矩阵（含 tabIndex=-1 边界）。
- #18-#20 用 `renderToStaticMarkup` 真实 SSR 渲染断言（非浅层快照）。

## 4. 未覆盖与脆弱点

**未覆盖**：150ms 自动翻页时序；`SubmitOverride` 同帧提交路径；`handleSubmit` IPC 失败分支；折叠态键盘不接管（`isCollapsed` 分支）。

**脆弱点**：SSR 断言依赖类名/文本；纯函数断言与实现常量（24/150ms 等）无耦合（优点）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 describe、20 test | 已证实 | `:54/:72/:118/:142/:164`；`grep -c test(`=20 |
| 作用域矩阵/焦点解耦 | 已证实 | `:54-117` |
| 合并序列化/校验 | 已证实 | `:118-141` |
| SSR 无预选/鼠标通道 | 已证实 | `:164-181` |
| 时序/IPC 分支 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `shouldHandleBannerKey` | #1-#4 | `:54-71` | covered |
| 焦点/选中纯函数族 | #5-#10 | `:72-117` | covered |
| `serializeQuestionAnswer`/`isAnswerValid` | #11-#14 | `:118-141` | covered |
| Tab/Enter 语义 | #15-#17 | `:142-163` | covered |
| SSR 渲染 | #18-#20 | `:164-181` | covered |
