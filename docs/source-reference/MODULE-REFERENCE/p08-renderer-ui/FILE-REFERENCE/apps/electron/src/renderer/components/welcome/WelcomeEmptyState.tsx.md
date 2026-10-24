---
path: apps/electron/src/renderer/components/welcome/WelcomeEmptyState.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9a5545e0ec6e9427d7852836732256fb491f5362
sha256: d1b84c1202aa657b0188b3f00c4d339828633a83632e07d6f3392da62c689e60
lines: 190
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/welcome/WelcomeEmptyState.tsx

## 1. 结论与边界

**Agent 空状态引导**（190 行，`:1-9`）：四段式——①北京时间钟表+问候 ②4 场景卡 ③灵感气泡（点击填入输入框）④活跃热力图（agent 且非 team 才显示，`:82`）。

## 2. 导出与关键符号

1 导出：`WelcomeEmptyState`（`:68`）。常量：`SCENARIO_CARDS` 4 项（`:47-57`，**study/cdut 只落 cdut-zone 主页不下沉子视图**——注释 `:48-50,54-55` 记录两历史 Bug：直跳 ai-class 绕过课堂会话选择前置、直跳 yanhu-express 唤起桌宠）、`PROMPT_PILLS` 5 条（`:60-66`）。内部接口 `ScenarioCard`（`:37`）。

## 3. 内部逻辑与关键流程

- 时钟（`:87-97`）：自校正递归定时器对齐秒边界（`1000-(Date.now()%1000)+20`，不漂移不漏秒，注释 `:92`）；卸载清理。
- `handleScenarioClick`（`:102-105`）：进 cdut-zone 前**强制子视图置空**（落专区主页）。
- `handlePromptClick`（`:108-112`）：经 `agentComposerInjectionAtom` 注入（nonce=时间戳）；**无会话不注入防幽灵草稿**（`:109`）。
- 渲染（`:114-188`）：时钟徽章（在线呼吸灯）/4 卡（高度断点隐藏 `:136`）/气泡+随机 tip/热力图（640px 下隐藏）。

## 4. 调用者与调用链

- 入向：AgentView 空态（域外）。
- 出向：BeijingAnalogClock/UsageHeatmap（本批）、`@/lib/tips`/`beijing-greeting`、user-profile/app-mode/active-view/cdut/agent atoms。

## 5. 数据 I/O、读写与副作用

写 `activeViewAtom`/`cdutSubViewAtom`/`agentComposerInjectionAtom`；无 IPC。

## 6. 分支、失败、取消与恢复

热力图条件/高度断点/无会话不注入；无抛错。

## 7. 权限与权威状态

无权限分支，依据：引导 UI。

## 8. 修改影响面

空状态启动路径（两历史 Bug 约束锁定于注释）。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无该文件测试）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 卡目标/注入防幽灵/秒边界定时器 | 已证实 | `:1-190` 全文 |
| 两历史 Bug 描述 | 推断（注释记录） | `:48-55` |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+2 处理函数+常量组 | §2/§3 | 37-188 | covered |
