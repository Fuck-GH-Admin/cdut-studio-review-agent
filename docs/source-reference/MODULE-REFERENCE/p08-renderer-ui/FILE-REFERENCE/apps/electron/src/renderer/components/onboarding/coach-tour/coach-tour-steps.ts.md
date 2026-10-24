---
path: apps/electron/src/renderer/components/onboarding/coach-tour/coach-tour-steps.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ffbda0e82999ea8cc702bbf3fc4bba92417d8b39
sha256: ade0e8da940df2e19236c0cbaf5f15d72fdc51e9b780fa9594210644ea3cf59c
lines: 418
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-01-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/onboarding/coach-tour/coach-tour-steps.ts

## 1. 结论与边界

**新用户操作指引步骤定义**（418 行，纯数据+类型）：`COACH_TOUR_STEPS` 共 23 个条目（22 导览步 + `outro` 收尾）端到端沉浸式演示（Agent→CDUT 特区→AI 速课堂→砚小龙→材料审核→CDUT Science→出版图版→收尾），含演示凭据/提问/资产文件名常量、触发与等待类型、步骤字段契约、版本号 `CURRENT_COACH_TOUR_VERSION = 8`。

边界：不含执行逻辑（`coach-tour-runner.ts` 执行 prepare、`coach-tour-wait.ts` 等待、`CoachTourOverlay` 播放）；`prepare/advanceOn/waitFor` 语义由执行器解释。

## 2. 导出与关键符号

导出计数：`export` **16 条**（`:22`、`:28`、`:31`、`:35`、`:39`、`:42`、`:45`、`:48`、`:52`、`:54`、`:72`、`:79`、`:88`、`:90`、`:128`、`:418`），与源码逐条一致。

| 符号 | 类型 | 行 | 形状/值 | 说明 |
| --- | --- | --- | --- | --- |
| `DEMO_CDUT_ACCOUNT` | 常量 | 22-25 | `{username:'202520260101', password:'Nya315'}` | **硬编码演示特区凭据** |
| `PROMPT_CALCULUS` | 常量 | 28 | 微积分图示提问 | |
| `PROMPT_HONGLOU_Q1` | 常量 | 31-32 | 宝玉挨打多跳抽取 | |
| `PROMPT_HONGLOU_Q2` | 常量 | 35-36 | 反虚构陷阱题 | |
| `PROMPT_YANHU` | 常量 | 39 | 访问百度进成理官网 | |
| `DEMO_AI_CLASS_NAME` | 常量 | 42 | `'演示课堂 · 红楼梦精读'` | 主进程按标题幂等复用 |
| `DEMO_NOVEL_FILE_NAME` | 常量 | 45 | `'hongloumeng-quan-shu.txt'` | |
| `DEMO_GARNET_FILE_NAME` | 常量 | 48-49 | 石榴石 cif 长文件名 | |
| `DEMO_CSLAB_PASSWORD` | 常量 | 52 | `'123456'` | 演示实验室密码 |
| `CoachTourTrigger` | 类型 | 54-70 | 16 种 trigger 字面量 | |
| `CoachTourWait` | 类型 | 72-77 | 5 种等待（agent-idle/cdut-active/pet-idle/cslab-verified/selector） | |
| `CoachTourPrepare` | 接口 | 79-85 | `{triggers?, readySelector?, timeoutMs?}` | 默认超时 60s |
| `CoachTourAction` | 类型 | 88 | `'demo-digitize'` | 气泡专属按钮 |
| `CoachTourStep` | 接口 | 90-121 | 步骤字段（见 §3） | |
| `COACH_TOUR_STEPS` | 常量 | 128-415 | 22 步 | |
| `CURRENT_COACH_TOUR_VERSION` | 常量 | 418 | `8` | 增删步骤/大改文案 +1 |

## 3. 内部逻辑与关键流程

- **步骤字段契约**（`:90-121`）：`key/title/body`；`selectors[]`（优先级锚点链，引擎取首个可见）；`unionSelectors`（多容器外接矩形）；`pulseSelectors`（呼吸光圈不参与定位）；`placement`（偏好方位，空间不足自动回退）；`view`/`cdutSubView`（进入前切换，`cdutSubView:null`=退出子页面）；`prepare`（自动准备动作）；`advanceOn`（manual/click-anchor/wait）；`waitFor`（仅 wait 生效）；`autoAdvanceMs`（轮播停留）；`settleMs`（click-anchor 沉降延时，默认 350ms）；`restoreViewOnExit`（默认 true，收尾步 false）；`passthrough`（不铺捕获层）；`action`（气泡按钮）。
- **22 步序列**（`:128-415`）：
  1. `welcome-agent`（manual，view=conversations）
  2. `calculus`（prepare: ensure-draft-session+fill-calculus；wait agent-idle 240s；pulse=发送按钮）
  3. `cdut-enter`（click-anchor，cdutSubView:null）
  4. `cdut-login`（prepare: **login-demo**；wait cdut-active 60s）
  5. `ai-class-enter`（prepare: ensure-demo-ai-class，readySelector=资料树红楼梦条目，120s）
  6. `ai-class-q1`/7. `ai-class-q2`（fill-honglou-q1/2；wait agent-idle 300s）
  8. `yanhu`（prepare: prepare-pet-demo 30s；wait pet-idle 180s）
  9. `material-review`（manual）
  10. `science-enter`（prepare 仅 readySelector）
  11. `science-gate`（prepare: apply-demo-cslab-password；wait cslab-verified 180s）
  12. `demo-lab`（open-demo-lab 120s）
  13. `table-1`/14. `table-2`（open-table-1/2；autoAdvanceMs 3000）
  15. `digitize-open`（open-digitizer-figure；click-anchor）
  16. `digitize-extract`（action: demo-digitize；wait selector `data-series-count` 非 0，180s）
  17. `digitize-save`（click-anchor，settleMs 1200）
  18-20. `mol-gold/srtio3/garnet`（open-mol-*；autoAdvanceMs 4000）
  21. `publication-plot`（open-publication-plot）
  22. `new-session`（click-anchor，restoreViewOnExit:false）+ `outro`（selectors 空，manual，restoreViewOnExit:false）
  （共 23 个数组条目=22 导览步+outro 收尾，逐条见 `:128-415`；`SEND_BUTTON_PULSE` 双选择器常量 `:123-126`。）
- **版本语义**（`:417-418` 注释）：增删步骤或大改文案时 +1，已看过用户升级后自动重播一次（`App.tsx:43-44` 版本比较触发）。

## 4. 调用者与调用链

- 入向（全冻结树 `grep coach-tour-steps|COACH_TOUR_STEPS|CURRENT_COACH_TOUR_VERSION|DEMO_|PROMPT_`，apps+packages 全类型）：
  - `CoachTourOverlay.tsx:32-36`（步骤数据/版本写入）。
  - `coach-tour-runner.ts:20-30`（演示常量+trigger 类型）。
  - `coach-tour-wait.ts:13`（`CoachTourWait` 类型）。
  - `coach-tour-position.ts:19`（`CoachTourPlacement` 类型）。
  - `useBulletinStartupTrigger.ts:14`（`CURRENT_COACH_TOUR_VERSION` 版本比较）。
  - `coach-tour-steps.test.ts:2`（同批专属测试，6 用例）。
- 出向：类型依赖 `@/atoms/active-view`（`ActiveView`）、`@profer/shared`（`CdutSubViewId`）、`./coach-tour-position`。

## 5. 数据 I/O、读写与副作用

- 纯数据/类型模块，无 I/O、无副作用（常量仅内存）。
- 注意：`DEMO_CDUT_ACCOUNT`/`DEMO_CSLAB_PASSWORD` 是**硬编码演示凭据**（runner 实际提交登录/初始化密码，见 runner 手册 §7）。

## 6. 分支、失败、取消与恢复

- 不适用（静态数据，依据：本文件无控制流、无 throw、无异步）。

## 7. 权限与权威状态

- 无权限分支（纯数据）；演示凭据仅用于引导演示（注释 `:21` 声明不写入真实业务逻辑——凭据本身硬编码在包内，照实记录于 §10）。

## 8. 修改影响面

- 引擎全家（Overlay/runner/wait/position）与 `useBulletinStartupTrigger`（版本号）。
- 演示资产文件名与主进程 `ensureDemoSession`/`createDemoLab` 内置资产耦合（域外）。
- `coach-tour-steps.test.ts` 6 用例断言数据合法性（key 唯一/锚点/waitFor 声明/cdutSubView 归属/版本≥8），改动需同步。
- 增删步骤/大改文案必须 +1 `CURRENT_COACH_TOUR_VERSION`（`:417` 注释）。

## 9. 测试证据

- 直接测试：`coach-tour-steps.test.ts`（39 行，`bun:test`，**6 test**，NOT_RUN）——①key 唯一（`:5-8`）；②除最后一步都有锚点（`:10-14`）；③`advanceOn==='wait'` 必有 `waitFor`（`:16-20`）；④selector 等待必有非空 selector（`:22-28`）；⑤`cdutSubView` 步骤 `view==='cdut-zone'`（`:30-34`）；⑥`CURRENT_COACH_TOUR_VERSION >= 8`（`:36-38`）。断言逐条引用见同批测试手册。
- 未覆盖：22 步文案/选择器与真实 UI 匹配（需运行验证）、trigger 集合完备性。
- `NOT_RUN`：未运行 bun test/产品测试/typecheck/build/GUI；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 16 导出与步骤契约 | 已证实 | `:22-418` 逐条 |
| 22 步+outro 序列与等待/触发配置 | 已证实 | `:128-415` |
| 版本 8 与 +1 语义 | 已证实 | `:417-418` |
| 演示凭据硬编码（账号/密码 123456） | 已证实 | `:21-25`、`:51-52` |
| 6 用例断言 | 已证实 | `coach-tour-steps.test.ts:4-38` |
| 选择器与真实 DOM 匹配 | 未知 | NOT_RUN |
| 测试通过与否 | 未知 | NOT_RUN |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 演示常量 9 个 | §2/§5 | 22-52 | covered |
| 类型 5 个（Trigger/Wait/Prepare/Action/Step） | §2/§3 | 54-121 | covered |
| `COACH_TOUR_STEPS` 23 条目 | §3 | 128-415 | covered |
| `CURRENT_COACH_TOUR_VERSION` | §3/§8 | 417-418 | covered |
| 数据合法性测试 | §9 | — | covered |
| 选择器实际命中 | §10 | — | unknown（NOT_RUN） |
