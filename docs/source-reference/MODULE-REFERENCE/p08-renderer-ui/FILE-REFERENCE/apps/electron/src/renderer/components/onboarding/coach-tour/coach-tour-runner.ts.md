---
path: apps/electron/src/renderer/components/onboarding/coach-tour/coach-tour-runner.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6ed9d91cda41dcb2e6c3b3b047f5c93d345c697f
sha256: 6d0e03e737cdc50414feabb46bbe445787b5b7c9611fe5bdf0a1531ddaa058c4
lines: 333
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-01-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/onboarding/coach-tour/coach-tour-runner.ts

## 1. 结论与边界

**引导步骤准备动作执行器**（333 行）：把「建会话/演示登录/建课堂/开实验室/打开资产」等副作用从 Overlay 剥离，统一 `preparing → ready / error` 三段状态；失败只上报（状态+toast）不抛到 React 边界（注释 `:4-5`）。

边界：步骤触发定义在 `coach-tour-steps.ts`（`CoachTourTrigger`）；CSLab 指令经 `cslabTourCommandAtom` 由工作台消费（域外）；本 hook 不做业务等待（`coach-tour-wait.ts` 负责）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `CoachTourRunPhase` | 导出类型 | 32 | `'idle'\|'preparing'\|'ready'\|'error'` | 阶段枚举 |
| `useCoachTourRunner` | 导出函数 | 67-333 | `(open, step) => {phase, message}` | 唯一 hook |
| `waitForSelector` | 内部函数 | 47-55 | `(selector, timeoutMs) => Promise<void>` | 200ms 轮询可见性 |
| `setNativeInputValue` | 内部函数 | 58-65 | 原型 value setter + input 事件 | React 受控输入注入 |
| `sleep` | 内部函数 | 43-45 | setTimeout Promise | |
| `sendCsLabCommand` | 内部回调 | 92-119 | CSLab 指令下发+ack 确认（3 次/3s） | |
| `fillComposer` | 内部回调 | 121-130 | 经 `agentComposerInjectionAtom` 注入问题 | |
| `runTrigger` | 内部回调 | 132-286 | 16 种 trigger 分发 | |
| `waitForAck` | 内部回调 | 79-90 | 轮询 `cslabTourAckAtom`（120ms） | |
| 常量 | 内部 | 41 | `READY_SELECTOR_TIMEOUT = 10_000` | |

导出计数：`export` 2 条（`:32`、`:67`），与源码一致。

## 3. 内部逻辑与关键流程

- **状态机**（`:292-326`）：effect 依赖 `[open, step?.key]`——切步即 `phase='preparing'`（`RunnerState.key` 记录步骤防旧 ready 污染，`:37-39`）；串行执行 `prepare.triggers`（每步间查 `cancelled`）→ `prepare.readySelector` 等待（`prepare.timeoutMs ?? 60s`，`:307-313`）→ `ready`；catch → `error` + `toast.error`（`:315-320`）。切步首帧 `state.key !== step.key` 时按 preparing 处理（`:329-331`）。
- **runTrigger 16 种**（`:132-286`）：
  - `ensure-draft-session`：无当前会话则 `createAgent({draft:true})`（`:135-139`）。
  - `fill-calculus`/`fill-honglou-q1`/`fill-honglou-q2`：`fillComposer` 注入演示提问 + toast「问题已填入输入框，请点击发送」（`:140-142`、`:164-168`）。
  - `login-demo`：已 `active` 跳过；`setNativeInputValue` 填**硬编码演示账号**（`DEMO_CDUT_ACCOUNT`，`coach-tour-steps.ts:22-25`）→ `cdutZone.login({username, password, rememberPassword:false})` **真实登录副作用**；失败 throw（`:143-155`）。
  - `ensure-demo-ai-class`：`cdutAiClass.ensureDemoSession()`；`documentIngested=false` 时 toast.warning「演示资料未找到…回答可能缺少原文依据」仍进入课堂（`:156-163`）。
  - `prepare-pet-demo`：`petSyncViewport`（舞台 DOM 矩形，注释 `:172`：蒙层隐藏原生网页视图需给桌宠有效视口）→ `petTourPresent` → 12s 内轮询 `petGetChatStatus().ready`，未就绪 throw（`:170-199`）→ `petTourFill(PROMPT_YANHU)`。
  - `apply-demo-cslab-password`：`cslab.getAuthStatus()` 已验证/已初始化则跳过；填 `DEMO_CSLAB_PASSWORD`（`'123456'`）+ 确认框，等按钮解 disabled（≤2s）后 click（`:201-215`）。
  - `open-demo-lab`：`cslab.createDemoLab()` + `openLab` + 记 `demoLabIdRef` + `refresh-assets` 指令（注释 `:221`：同名实验室补新资产需强制刷新）（`:216-224`）。
  - `open-table-1/2`、`open-digitizer-figure`（`demo-digitizer-spectrum.png`）、`open-mol-gold/srtio3/garnet`（固定文件名，`DEMO_GARNET_FILE_NAME`）、`open-publication-plot`（`demo-nature-publication`）：均 `sendCsLabCommand(..., demoLabIdRef.current)`（资产指令锁定同一实验室防旧回调竞态，`:76-77`）。
- **sendCsLabCommand**（`:92-119`）：先 `waitForSelector` 工作台（带 `data-cslab-lab-id` 时按 id 匹配，注释 `:103`：指令须等工作台挂载否则 atom 漏掉）；最多 3 次下发 `{...payload, id: ++commandSeqRef}`，`waitForAck(id, 3s)`；ack.ok → return；ack 失败 → throw `ack.error`；超时 → throw「科研工作台未响应引导指令」。
- **fillComposer**（`:121-130`）：无 `currentAgentSessionIdAtom` throw「未找到可用的 Agent 会话」；`agentComposerInjectionAtom` 注入 `{sessionId, text, nonce: Date.now()}`。

## 4. 调用者与调用链

- 入向（全冻结树 `grep coach-tour-runner|useCoachTourRunner`，apps+packages 全类型）：
  - `CoachTourOverlay.tsx:39` import、`:137` `const runner = useCoachTourRunner(open, step)`（`runner.phase` 驱动 preparing/ready/error UI 与 wait 启用条件 `:139`）。
- 出向：jotai atoms（`agentComposerInjectionAtom`/`currentAgentSessionIdAtom`/`cdutAccountAtom`/`cslabActiveLabIdAtom`/`cslabTourCommandAtom`/`cslabTourAckAtom`）；`@/hooks/useCreateSession`、`@/hooks/useEnterCdutAiClass`；`window.electronAPI`（`cdutZone.login`/`cdutAiClass.ensureDemoSession`/`yanhuExpress.pet*`/`cslab.getAuthStatus`/`cslab.createDemoLab`/`cslab.openLab`）；`coach-tour-steps` 常量；`sonner` toast。

## 5. 数据 I/O、读写与副作用

- **真实业务副作用**（引导演示链）：创建草稿会话、**演示账号真实登录 CDUT 特区**（`login-demo`，凭据硬编码）、创建/进入演示课堂、创建/打开演示实验室、下发 CSLab 资产指令、桌宠视口同步与指令填入、CSLab 演示密码初始化（`'123456'`，`apply-demo-cslab-password` 仅未初始化设备）。
- 副作用输出：toast 4 处；atom 写入（composer 注入/活跃实验室 id/CSLab 指令）。
- 无直接磁盘/网络（经 electronAPI 由主进程执行）。

## 6. 分支、失败、取消与恢复

- 失败：任何 trigger/selector 超时 throw → catch → `phase='error'` + `toast.error(message)`（`:315-320`），**只上报不重试、不自动跳步**（Overlay 显示错误文案继续显示）。
- 取消：effect cleanup 置 `cancelled`（`:297`、`:323-325`）；trigger 循环每步查 cancelled（`:303-305`）。
- 重试：仅 `sendCsLabCommand` 内部 3 次下发（ack 失败立即 throw 不重试，`:113-114`）。
- 恢复：无自动恢复；用户可「跳过本步/下一步」手动推进（Overlay 侧）。
- 竞态防御：`demoLabIdRef` 锁定实验室 id（`:76-77`）；`runTriggerRef`（`:288-290`）保证每步只执行一次（触发函数引用随侧栏状态变化）。

## 7. 权限与权威状态

- 无 sender/role 检查；演示登录用**硬编码演示凭据**（`DEMO_CDUT_ACCOUNT = {username:'202520260101', password:'Nya315'}`，`coach-tour-steps.ts:21-25` 注释「仅供新手引导气泡一键填入，不写入任何真实业务逻辑」——但 `login-demo` 实际调用 `cdutZone.login` 提交，照实记录）；`DEMO_CSLAB_PASSWORD='123456'`（`coach-tour-steps.ts:51-52`）。
- 权威状态：CDUT 登录态（`cdutAccountAtom`）/CSLab 验密态（`cslab.getAuthStatus()`）由主进程产生；runner 只读判定。

## 8. 修改影响面

- 唯一消费者 `CoachTourOverlay`（phase 契约）。
- 触发常量/演示资产文件名（`coach-tour-steps.ts`）与主进程演示会话/实验室实现耦合（`ensureDemoSession`/`createDemoLab` 域外）。
- CSLab 命令协议 `{kind, id}`/ack（`cslabTourCommandAtom`/`cslabTourAckAtom`）双向契约。
- 测试：**无专属测试**（检索范围：冻结树 `*.test.ts(x)` 引用 0 命中）。

## 9. 测试证据

- 直接测试：**无**（全冻结树 `*.test.ts(x)` 引用检索 0 命中）。
- 间接证据：无（`coach-tour-steps.test.ts` 只测步骤数据合法性，不测执行器）。
- 未覆盖：16 trigger、ack 协议、超时/失败路径、演示登录。
- `NOT_RUN`：未运行 bun test/产品测试/typecheck/build/GUI/真实登录/CSLab；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出、三段状态机 | 已证实 | `:32`、`:67`、`:292-331` |
| 失败只上报（error+toast）不抛 | 已证实 | `:315-320` |
| login-demo 真实登录+硬编码凭据 | 已证实 | `:143-155`、`coach-tour-steps.ts:22-25` |
| CSLab 指令 3 试/3s ack/锁定 labId | 已证实 | `:92-119`、`:76-77` |
| 演示密码自动填入仅未初始化设备 | 已证实 | `:201-215` |
| prepare.readySelector 默认 60s | 已证实 | `:307-313` |
| 无专属测试 | 已证实 | 全冻结树检索（§9 范围） |
| 主进程演示会话/实验室行为 | 未知 | 域外实现 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 状态机 effect | §3/§6 | 292-331 | covered |
| `runTrigger` 16 种 | §3 | 132-286 | covered |
| `sendCsLabCommand`/`waitForAck` | §3 | 79-119 | covered |
| `fillComposer`/`setNativeInputValue` | §3 | 58-65,121-130 | covered |
| 失败/取消/竞态防御 | §6 | 76-77,288-331 | covered |
| 演示凭据/登录副作用 | §7 | 143-155,201-215 | covered |
| 运行行为 | §10 | — | unknown（NOT_RUN） |
