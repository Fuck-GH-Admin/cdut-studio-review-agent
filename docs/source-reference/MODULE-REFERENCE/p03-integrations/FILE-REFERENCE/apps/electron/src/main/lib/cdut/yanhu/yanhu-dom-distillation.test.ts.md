---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-dom-distillation.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 241bdb1eb598021a5c8244018b15c948cdcc2f0c
sha256: 9dfc28acd10e09ba3707bf53ae62c554929ed15e7949e3f9a1dfcd563a708000
lines: 1901
kind: test
package: p03-integrations
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-dom-distillation.test.ts

## 1. 测试目标

无视感知 DOM 蒸馏与 BID 双射单测（文件头 `:2-6`）：四级剪枝（0 面积/不可视/aria-hidden 100% 裁剪）、交互候选过滤、BID 连续标定单射满射、Region 分块序列化、AXTree 语义增强。被测：`yanhu-dom-distillation` 的 `filterActionableElements`/`assignBids`/`serializePageDigest`/`enrichRolesFromAx`/`computePageFingerprint`/`buildYanhuCollectorScript`/`YanhuDomDistillationEngine`（**该模块本身不在本批 18 文件清单**，测试为本批覆盖证据）+ `yanhu-browser-tools.buildHardwareClickTargetScript`。夹具：`YanhuRawElement` 手工构造树。本轮 `NOT_RUN`。

## 2. 用例清单

**24 describe、79 test**（describe 行号与主题）：

| describe（行） | test 数 | 断言主题 |
| --- | --- | --- |
| filterActionableElements 二剪（`:40`） | 3 | 无名/aria-hidden 剔除；未渲染不进台账（渲染红线）；仅留交互元素 |
| assignBids 双射（`:78`） | 2 | 前序 1..n 单射满射；空集空映射 |
| serializePageDigest（`:98`） | 5 | 分区内联 BID/选项；遮挡标注；未渲染仅汇总；无噪音；空页提示 |
| data-caption 两端一致（`:164`） | 4 | 祖先 data-caption 推导；placeholder 优先；按钮自文不覆盖；定位端同源 |
| 语义区域归属（`:223`） | 7 | 含输入/EMAP→表单区；纯文本→数据表格；hidden/listBox/gridCell 不误判 |
| 显示文本口径与浮层纳管（`:352`） | 10 | 容器名只取自身短文本；浮层选项纳管（实测 10） |
| enrichRolesFromAx（`:541`） | 2 | AXTree 语义增强（实测 2） |
| 多层框架/超长页穿透（`:561`） | 3 | frameset/iframe 穿透 |
| cursor:pointer 启发式召回（`:705`） | 2 | 软交互元素进候选 |
| Region4Web 语义分块（`:765`） | 3 | 类名/ID 线索 |
| 匿名 frameset 三级穿透（`:816`） | 1 | 鲁棒穿透 |
| 未渲染不分配 BID（`:867`） | 7 | 渲染红线全链 |
| 静态导航树紧凑编码（`:1087`） | 3 | 全量保留 BID 防盲视 |
| 深层 iframe 课表直提（`:1137`） | 2 | 结构化 Markdown |
| 业务数据表格直提（`:1188`） | 3 | 成绩/考务 |
| 可点击容器子项拆分（`:1283`） | 2 | 根除菜单漏采/聚合名称误导 |
| 渲染内容指纹（`:1402`） | 3 | 仅内容变可检出 |
| computePageFingerprint（`:1454`） | 4 | 结构指纹 |
| Engine 增量投递/BID 回退（`:1497`） | 5 | 增量+历史回退 |
| 日历弹窗隔离 BUG-48（`:1570`） | 1 | 弹窗节点隔离 |
| Shadow DOM 穿透（`:1639`） | 2 | Web Components |
| 结构化空间命名（`:1707`） | 1 | 杜绝跨列串扰 |
| DOM Clobbering 防御（`:1793`） | 2 | 原型隔离 |
| 闭合 Shadow DOM 宿主探测（`:1853`） | 2 | CDP 深度补漏标记 |
（test 总数 79 为 `grep -c '^\\s*test('` 真值；**逐 describe 计数已按源精确核对**（NB70-COUNT-01 修正：显示文本口径实 10、enrichRolesFromAx 实 2）。）

## 3. 真实断言

- 多个 describe 头注释**锁死历史故障**（data-caption 名称不匹配致“未能定位”、表格误判列表筛选器、容器名拼接子孙致模型误判、菜单漏采等）——回归断言口径。
- BID 双射（单射+满射）与“未渲染不占 BID”是台账正确性核心。
- `buildHardwareClickTargetScript` 跨模块断言（定位端与采集端同源）。

## 4. 未覆盖与脆弱点

**未覆盖**：`yanhu-dom-distillation` 模块不在本批，其实现与测试差异未核；部分 describe 的精确断言细节（行 541-1901 各段）在本手册按主题归纳，逐条断言以源为准。

**脆弱点**：手工 `YanhuRawElement` 夹具与实现结构耦合；79 断言规模大，头部注释自述为多轮历史缺陷锁死合集。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 24 describe、79 test | 已证实 | `grep` 真值（`:40`…`:1853`） |
| 渲染红线/BID 双射 | 已证实 | `:53/:79/:867` |
| 名称两端一致（data-caption） | 已证实 | `:164-215` |
| 区域归属/显示文本口径 | 已证实 | `:223-540` |
| 指纹/穿透/防御族 | 已证实（主题级） | `:561-1901` |
| 各 describe 逐条断言 | 推断 | 按主题归纳 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 剪枝/双射/序列化 | 3 describe | `:40-155` | covered |
| 名称/区域/文本口径 | 3 describe | `:164-540` | covered |
| 穿透/召回/分块/红线 | 6 describe | `:561-1136` | covered |
| 直提/拆分/指纹/引擎 | 5 describe | `:1137-1569` | covered |
| 隔离/Shadow/命名/防御 | 5 describe | `:1570-1901` | covered |
