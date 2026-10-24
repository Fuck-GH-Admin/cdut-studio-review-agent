---
path: apps/electron/src/renderer/lib/session-status-visual.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b217a9189f194a600e270150497802f9cba4fb0e
sha256: 20478f76386694bc65e5debf57b4361c091c9c08109119038a89f78864aab296
lines: 23
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/session-status-visual.ts

## 1. 结论与边界

会话状态视觉的**唯一来源**（`session-status-visual.ts:2-7` 文件头自述）：`SessionIndicatorStatus` 四态 → 状态点 Tailwind 类名 + 中文文案两张常量表，供组合 tab 顶栏条目与组内栏头共用，避免两套色值。纯常量/纯类型文件，无逻辑无 I/O。

边界：不计算状态（状态由 `agent-atoms.ts:652-696` 的指示点映射产生）；不含布局组件（渲染在 `TabGroupItem.tsx`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `SESSION_STATUS_DOT_CLASS` | 常量 | 11-16 | `Record<SessionIndicatorStatus, string>` | 状态点类名表 |
| `SESSION_STATUS_LABEL` | 常量 | 18-23 | `Record<SessionIndicatorStatus, string>` | 状态文案表 |

导出计数 2（`export const` 逐条核）。无内部函数。键集 4 态 = `idle`/`running`/`blocked`/`completed`（类型来自 `agent-atoms.ts:652` `SessionIndicatorStatus`，本文件 `:9` 类型 import，两表键与之完全一致）。

## 3. 内部逻辑与关键流程

本文件不适用（无控制流），依据：仅两张静态常量表（`session-status-visual.ts:11-23`），无分支、无计算。取值：`idle → ''/''`（无点无文案）、`running → 'bg-blue-500 animate-pulse'/'运行中'`（`:13,20`）、`blocked → 'bg-orange-500'/'等待确认'`（`:14,21`）、`completed → 'bg-emerald-500'/'已完成'`（`:15,22`）。色值约定沿用左栏会话列表（running 蓝/blocked 橙/completed 绿，注释 `:6`）。

## 4. 调用者与调用链

入向（grep 全冻结树）：
- `TabGroupItem.tsx:24` import 两表；`:75` `SESSION_STATUS_DOT_CLASS[status]` 拼入 `cn('size-1.5 shrink-0 rounded-full', …)`；`:76` `title={SESSION_STATUS_LABEL[status]}`。组件 props `leftStatus`/`rightStatus`/`status`（`TabGroupItem.tsx:33-34,60`）。
- 其余命中仅为本文件自述（检索范围：冻结树全 `.ts/.tsx/.js/.jsx/.mjs/.cjs`，pattern `session-status-visual|SESSION_STATUS_DOT_CLASS|SESSION_STATUS_LABEL`）。

出向：仅类型 import `@/atoms/agent-atoms`（`:9`），无运行时调用。

## 5. 数据 I/O、读写与副作用

本文件不适用，依据：纯常量定义（`session-status-visual.ts:11-23`），无磁盘/网络/缓存/状态读写，无副作用。

## 6. 分支、失败、取消与恢复

本文件不适用，依据：无 if/early-return/throw（`session-status-visual.ts:1-23` 全文无控制流）。表外键（若有）取值为 `undefined`——消费点 `TabGroupItem.tsx:75-76` 无兜底，属调用方行为（推断）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。状态值本身是权威投影的展示层：`SessionIndicatorStatus` 来自 `agent-atoms.ts:683-696` `agentSessionIndicatorMapAtom` 的稳定化映射，本文件只做视觉映射不产生权威。

## 8. 修改影响面

- 直接影响 `TabGroupItem.tsx` 顶栏状态点与 hover 文案（`:75-76`）。
- 改键集需同步 `agent-atoms.ts:652` 的 `SessionIndicatorStatus` 类型，否则 `Record` 类型不完整（编译期报错）。
- 与左栏状态条类名（`session-items.tsx:586` `DELEGATION_STATUS_ICON_CLASS`）是**两套**视觉映射，改动其一会造成两处色值不一致（该表与本表并存，非本文件引用）。
- 需同步修改的测试：无（§9）。

## 9. 测试证据

- 直接测试文件：**无**。检索范围：冻结树全文件类型搜 `SESSION_STATUS_DOT_CLASS|SESSION_STATUS_LABEL`，仅命中本文件与 `TabGroupItem.tsx:24,75,76`，0 测试文件。
- 间接证据：无。
- 本轮未执行任何测试：`NOT_RUN`（静态阅读所得）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出、4 态键值如 §2/§3 | 已证实 | `session-status-visual.ts:11-23` |
| 类型键集与 agent-atoms 一致（4 态） | 已证实 | `session-status-visual.ts:9` + `agent-atoms.ts:652` |
| 唯一消费点 TabGroupItem | 已证实 | `TabGroupItem.tsx:24,75,76` |
| 表外键无兜底 | 推断 | `TabGroupItem.tsx:75-76` 直接索引 |
| 无直接测试 | 已证实（否定，范围见 §9） | 全树 grep 0 测试命中 |
| QA 预读线索「executionLabel 7 态映射」 | 已证实不在本文件 | 实际落点 `pi-harness-view-model.ts:14-25`（starting/running/compacting/retrying/settled/interrupted/failed 7 态），与本文件无关 |
| QA 预读线索「id 可见性 default+archived 不对称」 | 未知（未找到落点） | 已检索本文件、`pi-harness-view-model.ts`、`agent-tab-access.ts:20,31`、`sidebar-atoms.ts:12`、`use-left-sidebar.ts:578,611`，均无此不对称 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `SESSION_STATUS_DOT_CLASS` | §2/§3 | 11-16 | covered |
| `SESSION_STATUS_LABEL` | §2/§3 | 18-23 | covered |
| 类型键集一致性 | §2/§10 | 9 | covered |
| 消费链 | §4 | - | covered |
| 测试覆盖 | §9 | - | unknown（无测试） |
