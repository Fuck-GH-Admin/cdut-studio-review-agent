---
path: apps/electron/default-skills/skill-creator/eval-viewer/viewer.html
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6d8e96348a02e66c3363d2ff3b3ae58ac11e6382
sha256: a53213426ee1100441d701a3a0d49cda7a842f992d2c36463f4d3cc0258575fa
lines: 1325
kind: template
package: p02-agent-runtime
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/default-skills/skill-creator/eval-viewer/viewer.html

## 1. 入口与加载方式

eval 评审页**前端模板**：由同目录 `generate_review.py:257-281` 读取并把 `/*__EMBEDDED_DATA__*/`（`:649`）替换为 `const EMBEDDED_DATA = {...}` 后经 `GET /` 返回（每请求重生成）。外链：Google Fonts（`:7-9`）、**SheetJS CDN**（`cdn.sheetjs.com xlsx-0.20.3`，带 SRI integrity，`:10`）——xlsx 渲染依赖该 CDN（离线时降级见 §4）。

## 2. 脚本块与事件流

唯一内联 `<script>`（`:647-1323`）：

- 状态：`feedbackMap/currentIndex/visitedRuns`（`:652-654`）。
- `init()`（`:657-685`）：有 previous_* 时**不**预填旧 feedback（防上轮数据污染，`:658-672`）；`showRun(0)`；feedback 输入 800ms 防抖自动保存（`:680-684`）。
- 导航：`navigate/updateNavButtons`（`:688-700`）；`showRun`（`:703-761`：进度/prompt/config-badge 按 run.id 正则识别 with_skill|without_skill|new_skill|old_skill 分 primary/baseline `:716-725`/输出/上轮输出/评分/上轮反馈/全部浏览后 done 按钮加 ready `:753-757`）。
- `renderOutputs`（`:764-827`）：6 类文件渲染（text pre/image img/pdf iframe/xlsx→SheetJS/binary 下载链/error 红字）+ 全量下载按钮。
- `renderXlsx`（`:830-855`）：base64→`XLSX.read`→逐 sheet `sheet_to_html`；异常显示错误文本（`:852-854`）。
- `renderGrades`（`:858-905`）：grading.summary 徽章（≥0.8 绿/≥0.5 黄/否则红，`:882`）+ expectations ✓/✗ 列表+evidence。
- `renderPrevOutputs`（`:915-984`）：上轮输出折叠区（无则隐藏）。
- `saveCurrentFeedback`（`:994-1023`）：POST `/api/feedback` `{reviews,status:"in_progress"}`；失败文案「Will download on submit」（`:1019-1021`，静态模式降级）。
- `showDoneDialog`（`:1026-1061`）：**全 runs 都入 reviews**（空 feedback=looks good 区分未审，`:1036-1042`）POST `{status:"complete"}`；失败→Blob 下载 `feedback.json`（`:1051-1058`）。
- 键盘（`:1078-1089`）：方向键翻页（textarea 内不拦截）；`switchView/renderBenchmark`（`:1106-1318`，Benchmark tab：summary 表+Per-Eval 明细+均值行+断言矩阵+Notes）。
- 启动：`init(); renderBenchmark()`（`:1321-1322`）。

## 3. DOM 契约

id：`app/skill-name/progress/view-tabs/panel-outputs/panel-benchmark/prompt-text/config-badge/outputs-body/prev-outputs-{section,arrow,content}/grades-{section,arrow,content}/feedback/feedback-status/prev-feedback{,-text}/outputs-nav/{prev,done,next}-btn/benchmark-content/done-overlay/toast`（`:544-645`）。fetch 端点：GET `/api/feedback`（`:666`）、POST `/api/feedback`（`:1012/:1044`）。数据键：`EMBEDDED_DATA.{skill_name,runs[{id,prompt,eval_id,outputs,grading}],previous_feedback,previous_outputs,benchmark}`（`:270-277` generate_review.py 注入）。

## 4. 失败与降级

feedback fetch 失败静默（`:671`）；自动保存失败降级为提交时下载（`:1019-1021`）；提交失败→feedback.json 本地下载（`:1051-1058`）；xlsx 渲染异常→错误文本（`:852-854`）；无输出→`No output files`（`:770`）；grading/prev 无则隐藏区段（`:862-864/:920-923`）。SheetJS CDN 不可达时 `XLSX` 未定义→renderXlsx catch 显示错误（推断-静态）。

## 5. 修改影响面

与 `generate_review.py` 嵌入契约、`/api/feedback` 路由双侧同步（§3）；benchmark 结构与 `aggregate_benchmark.py` 输出契约联动。

## 6. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全脚本/事件流/DOM 契约/降级 | 已证实 | `:1-1325` 逐行（CSS 区 :11-542 按分区核对） |
| CDN 行为/浏览器渲染 | 未知 | NOT_RUN（GUI/网络） |

## 7. 覆盖表

| 区段 | 章节 | 状态 |
| --- | --- | --- |
| 脚本/事件/数据流 | §2 | covered |
| DOM/端点契约 | §3 | covered |
| 失败降级 | §4 | covered |
| 运行验证 | §6 | unknown（NOT_RUN） |
