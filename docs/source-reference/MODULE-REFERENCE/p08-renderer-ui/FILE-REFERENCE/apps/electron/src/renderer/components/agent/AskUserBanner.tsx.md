---
path: apps/electron/src/renderer/components/agent/AskUserBanner.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: cf4433d55d7adb246c417c9b8a05dc30b5f71184
sha256: 584cbb30cf68c1d8ff8835ff06ca866a40c379bfdb9334a2a1a532b2e2ff6116
lines: 769
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/AskUserBanner.tsx

## 1. 结论与边界

Agent AskUserQuestion 交互式问答横幅（文件头 `:1-10`）：单选/多选/填空三题型（胶囊 Chips、单选一键自动翻页、多选勾选确认、填空 Enter 提交/Shift+Enter 换行）；可折叠为悬浮胶囊（**折叠不取消 Agent 等待**）；多问题顶部 Tab；键盘方向键仅移焦点、空格切换、数字 1..9 直选、Enter 确认（单选先确认聚焦项，末题提交否则翻页）。**全局监听仅在横幅内或页面无控件焦点时生效，外部输入框/可交互控件一律放行**。状态存 jotai（`allPendingAskUserRequestsAtom`/`askUserAnswersAtom`/`askUserCollapsedAtom`）。

## 2. 导出与关键符号

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `askUserItemCount` | `:59-61` | 条目数=选项+「其他...」 |
| `clampTabIndex` | `:64-67` | Tab 索引安全钳制（0 问题返回 0） |
| `moveAskUserFocus` | `:70-75` | 方向键环形移动焦点（不改答案） |
| `digitKeyToItemIndex` | `:78-82` | 数字 1..9→条目索引（越界 null） |
| `initialFocusIndex` | `:85-87` | 新题初始焦点（有选项聚焦首项/填空不聚焦——聚焦≠预选） |
| `ChoiceEnterAction`/`resolveChoiceEnterAction` | `:90-101` | Enter 语义三态（select-focused/open-custom/advance；非单选恒 advance） |
| `setAnswerOption` | `:104-114` | 单选替换/多选切换（清 custom） |
| `setAnswerCustom` | `:117-127` | 开关「其他」（多选保留勾选、单选清空已选） |
| `isAnswerValid` | `:130-134` | 提交前置校验（填空须文本；选择须已选或「其他」有内容） |
| `serializeQuestionAnswer` | `:137-151` | 序列化：多选**合并已勾选+其他文本**（防选项被吞）；单选「其他」有内容优先自定义；填空取纯文本 |
| `AskUserBanner` | `:159-769` | 主组件 |

内部：`EMPTY_ANSWER`/`PREVIEW_REMARK_PLUGINS`（remarkGfm）/`safeUrlTransform`（`:29-36`）/`resolveQuestionType`（显式 type 优先；选择题缺 options 降级填空防畸形题，`:38-45`）/`questionOptions/questionTypeLabel`；`SubmitOverride`（`:153-156`，同帧提交覆盖——防异步 setState 读旧值）；`QuestionCard` 子组件（渲染区）。

## 3. 内部逻辑与关键流程

### 3.1 状态与草稿

`request=requests[0]`（只处理队首）；`safeTab=clampTabIndex`（渲染层安全索引——越界不整卡消失，`:180-181`）；答案草稿按 requestId 存 atom（`answersByRequest`）；`setAnswers` 函数式更新；`setCollapsed` 只收起卡片不发取消（`:207-215`）。**Ref 镜像**（activeTab/questions/focusedOptIdx/answers/submit，`:218-227`）消 keydown 闭包过期。

### 3.2 自动翻页

`scheduleAutoAdvance`：单选点击/数字键后 150ms 切页；**末尾钳制防越界（BUG-3）**；卸载/换请求清定时器（`:240-257`）。

### 3.3 键盘（`:281-380`）

折叠态不接管键盘（否则输入框 Enter 被误判提交，`:282`）；作用域守卫（`banner-key-scope`）；可编辑目标仅 Enter/Escape（箭头留光标）；方向键纯移焦、空格切换选中/开关「其他」、数字直达+单选自动切页、Enter 按 `resolveChoiceEnterAction` 三态执行；前进末页携带 `SubmitOverride` 同帧提交。

### 3.4 提交/渲染（`:430-769`）

`handleSubmit`（提交成功清该请求草稿+折叠态）；无题 null；折叠态=悬浮胶囊“导师提出了 N 个问题 · 点击作答”（不占输入区）；展开=头部（“CDUT Studio Agent 需要你的输入”/多请求计数(+n)/“稍后回答”折叠/关闭=**放弃并终止 Agent**）+ Tab 栏（已答题高亮 `ask-user-question-tab-answered`）+ `QuestionCard` + 底部（键位提示+“确认”（末页，`disabled={submitting || !hasValidAnswers}`）/“下一题”纯鼠标通道）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：Agent 会话视图（AskUser 请求到达时）。出向：`@/atoms`（三 atom）、`@/lib/banner-key-scope`、`@profer/shared`（`AskUserQuestion/Request`）、`window.electronAPI`（响应）、`react-markdown`/remark-gfm（预览）。

## 5. 数据 I/O、读写与副作用

atom 读写（请求队列/答案草稿/折叠集）；IPC 提交；定时器。无持久化。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 折叠 | `:282/:447-460` | 悬浮胶囊；不接管键盘、不取消等待 |
| 提交失败 | `:436-437` | console.error（可重试） |
| Tab 越界 | `:180/:255` | clamp 防整卡消失 |
| 异步 setState 竞态 | `:153-156/:347` | SubmitOverride 同帧覆盖 |
| 关闭 | `:499` | 放弃并终止 Agent（title 明示） |

## 7. 权限与权威状态

- 答案“无静默预选”（`:259` 注释：草稿由用户显式作答产生）。
- 折叠≠取消（语义明示）；关闭=终止（明示）。
- 序列化防“其他文本吞掉选项”（`:136`）。

## 8. 修改影响面

改题型/键盘/序列化 → 影响导师提问链路；atom/IPC 契约联动。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `AskUserBanner.test.tsx`（20 test，详见其手册）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三题型+键盘全键位+作用域守卫 | 已证实 | `:1-10/:281-380` |
| 无静默预选/焦点选中解耦 | 已证实 | `:259`、纯函数族 |
| 合并序列化/前置校验 | 已证实 | `:130-151` |
| 折叠不取消/关闭即终止 | 已证实 | `:207/:499` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 纯函数族（10 导出） | 2 | `:59-151` | covered |
| 状态/草稿/折叠 | 3.1 | `:159-227` | covered |
| 自动翻页/键盘 | 3.2-3.3 | `:240-380` | covered |
| 提交/渲染 | 3.4 | `:430-769` | covered |
