---
path: apps/electron/src/renderer/atoms/intro-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0096a5ddbc5759fdbae3689885a9e09df46c8691
sha256: b7022b50ff89b338ffc52b7ef358d6aac8112837c9c1028a13142dc244e5b024
lines: 19
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/intro-atoms.ts

## 1. 结论与边界

开屏动画（Intro Overlay）重播状态（19 行，头注释 `:1-9`）：两个开关 atom，用于从主界面手动触发开屏水波纹重播与欢迎导览重放。**不影响 `onboardingCompleted` 等持久化状态**（`:8`），纯重播/测试用途。

**边界**：动画/导览组件本体在 App/OnboardingView（跨批）；不持久化。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `replayIntroOpenAtom` | atom（导出） | 13 | `boolean` 初值 false | 全屏开屏动画重播遮罩开关 |
| `replayWelcomeTourAtom` | atom（导出） | 19 | `boolean` 初值 false | 重播结束后进入首次欢迎导览开关 |

导出合计 2。`replayWelcomeTourAtom` 注释（`:16-18`）：走 OnboardingView 的 `persistCompletion=false` 分支，不写 `onboardingCompleted`，可反复重放。

## 3. 内部逻辑与关键流程

无（不适用，依据：两个纯开关 atom）。

## 4. 调用者与调用链

入向（全冻结树检索 `intro-atoms`，3 文件）：
- `renderer/App.tsx:11`（import 两者：渲染 IntroOverlay 顶层遮罩，头注释 `:5-6` 语义）。
- `hooks/useBulletinStartupTrigger.ts:16`（`replayWelcomeTourAtom`）。
- `components/settings/GeneralSettings.tsx:27`（`replayIntroOpenAtom`，手动重播入口）。
出向：`jotai`。

## 5. 数据 I/O、读写与副作用

无（不适用，依据：纯内存 atom）。

## 6. 分支、失败、取消与恢复

无（不适用，依据：无逻辑代码）。

## 7. 权限与权威状态

无（不适用，依据：纯状态）。

## 8. 修改影响面

3 个消费方（App 顶层遮罩/公告启动触发/通用设置重播按钮）；与 `onboardingCompleted` 持久状态解耦（改持久化语义需去 OnboardingView，跨批）。

## 9. 测试证据

直接测试：**无**（全冻结树检索 `intro-atoms` 无测试命中；检索范围=baseline/source 全树）。

`NOT_RUN`：本轮未运行任何测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出/不写持久状态语义 | 已证实 | `:1-19` 全文逐行 |
| 3 个调用方 | 已证实 | 全树检索（§4） |
| OnboardingView persistCompletion 分支实际行为 | 边界（跨批） | `:17` 注释 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 个导出 | §2/§4 | 13-19 | covered |
