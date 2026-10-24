---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-browser-tools.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 90dd5f81197bcdedf56020e14ae2de0f8abc513f
sha256: 5916cffab4db8fcc7ac58f5f41f0b387d2995840e77b09cc354b9590d217f505
lines: 3303
kind: source
package: p03-integrations
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-browser-tools.ts

## 1. 结论与边界

智联万站·专属门禁工具集（文件头 `:1-7`）：「砚小龙」运行时**唯一工具源**（模块自述 14 项浏览器专属能力；静态检索到工具 id 共 16 个词面：read_page/click/click_visual/fill/select/scroll/navigate/reload/go_back/go_forward/inspect_element/eval_script/capture_visual/get_network_logs/get_console_logs/tab_actions——部分为组合动作词面，照实并记）。**严格不对外部通用 Agent 暴露，语义等价“只在上网，不碰本机”**；供应商无关 `ToolDefinition` 契约；`buildYanhuBrowserTools(tabResolver)` 装配投递大模型的工具清单；执行层由 `yanhuExpressManager` 驱动 WebContentsView 与 CDP 总线。运行时模块。

不做的事：不暴露本机能力；不绕过门禁（危险动作硬拦截）。

## 2. 导出与关键符号

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `YanhuToolExecutionResult`/`YanhuBrowserTool` | `:46/:52` | 执行回调结果/工具定义（定义+胶囊标签+执行器） |
| `DEFAULT_READ_PAGE_TOKENS=2500`/`MAX_READ_PAGE_TOKENS=6000` | `:65/:67` | 读页 Token 预算（弹性扩容防深层元素腰斩） |
| `YANHU_ACTION_MIN_INTERVAL_MS=500`/`YANHU_REPEAT_CLICK_WINDOW_MS=60_000` | `:90/:100` | 交互恒定物理间隔/重复点击判定窗 |
| `URL_DECORATORS` | `:298` | 中英文引号对（URL 去装饰） |
| `CUSTOM_OPTION_SELECTORS` | `:1289` | 自定义下拉选项选择器族 |
| `resetYanhuActionThrottle` | `:103` | 节流时钟重置（仅单测隔离） |
| `enforceYanhuHumanInterval` | `:114` | 动静分离节流：纯表单操作 0ms、导航类恒 500ms（防 WAF 判机器注销登录态，`:108-113`） |
| `buildUnchangedNotice` | `:206` | 页面无变化提示：输出**全部**可交互控件紧凑索引（历史缺陷：只回前 8 项致盲猜 12 轮空转，`:201-205`），由调用方按 token 截断 |
| `sanitizeYanhuNetworkLogs` | `:241` | 网络日志脱敏/限长（单条 URL 120、总 1000 硬熔断） |
| `stripDecorators`/`asInt` | `:279/:301` | 去引号装饰/整数解析 |
| `buildForceTriggerScript` | `:474` | 强制触发脚本（含双击变体） |
| `buildJqxSelectScript`/`buildEmapTreeSelectScript`/`buildTreeItemCommitScript` | `:896/:961/:1083` | jqxGrid 下拉、emap 树、树节点提交脚本 |
| `buildOpenDropdownScript`/`buildPickCustomOptionScript` | `:1160/:1450` | 打开下拉/选取自定义选项脚本 |
| `buildHardwareClickTargetScript` | `:1693` | 硬件级点击目标脚本 |
| `relocateBySemantics` | `:2099` | 按语义重定位 BID 节点 |
| `buildPageLandmarks`/`isVisuallySparsePage` | `:2176/:2204` | 视觉地标构建/视觉稀疏页判定 |
| `buildYanhuBrowserTools` | `:2280-3291` | 工具清单装配主函数 |
| `createYanhuToolLabeler` | `:3293` | 工具标签器 |

内部关键常量：`EVAL_SCRIPT_MAX_CHARS=500`/`INSPECT_HTML_MAX_CHARS=300`/`INSPECT_OUTPUT_MAX_CHARS=600`/`NETWORK_URL_MAX_CHARS=120`/`NETWORK_TOTAL_MAX_CHARS=1000`/`YANHU_READ_CACHE_TTL_MS=1500`（防异步自更新页长期命中陈旧缓存被误判“无变化”，`:79-85`）/`YANHU_ACTION_SETTLE_MS=300`/`YANHU_ACTION_SETTLE_MAX_MS=500`/`YANHU_DANGEROUS_ACTION_RE`（注销/退出登录特征——命中硬拦截保会话，`:132-133`）/`YANHU_CIRCUIT_BREAK_NOTICE`（连续重复空读短路熔断）；`buildDomSettleScript`（`:144`，Mutation/样式突变观察 300-500ms、静默 120ms 提前返回）、`waitForDomSettle`（`:176`）、`buildMainFrameReloadScript`（`:185`，仅重载教务主框架内容区护外层导航框架）。

## 3. 内部逻辑与关键流程

### 3.1 人类行为仿真与稳态

- 动静分离节流（`enforceYanhuHumanInterval`）：表单内操作 0ms、导航 500ms 恒定。
- 动作后 DOM 稳态观察窗 300~500ms（MutationObserver 静默 120ms 提前回，杜绝死等）。
- 重复点击拦截：同标签同 BID 且渲染内容指纹自上次点击未变 → 判无意义重复（URL/框架常不变，判定必须基于内容指纹，`:95-100`）。

### 3.2 读页与台账

`yanhu_read_page` 产出 `[BID]` 台账（PageDigest）；缓存 TTL 1500ms；`buildUnchangedNotice` 全量索引防腰斩。`sanitizeYanhuNetworkLogs`/`stripDecorators` 限长脱敏。

### 3.3 复杂控件脚本族（`:474-2098`）

针对青果/emap 系复杂控件（jqxGrid 下拉、emap 树、树节点提交、自定义下拉选项、强制触发/双击、硬件级点击）生成页内脚本；`relocateBySemantics` 在 BID 失效时按语义重定位。

### 3.4 视觉平面

`buildPageLandmarks`/`isVisuallySparsePage` 供 `yanhu_capture_visual`/`yanhu_click_visual`（与 yanhu-visual-anchor 联动）。

### 3.4b 关键分支补录（NB70-SEM-01 六项，源证逐条核对）

- **select 五阶梯降级链**：确定性降级路径（展开自定义下拉→精确点选，`:829`）→ EMAP/JQWidgets 树形/级联专属 API 极速点选（阶梯 2.5，`:952`）→ CDP 硬件级仿真第二阶梯（根视口坐标定位，`:1689`）→ 两阶梯自适应分派宿主（`:1917`）→ 报错建议（不盲降）。
- **`isSelectionApplied`"宁可报错绝不谎报"**（`:1362`）：选中态回读比对；配合曼哈顿中心距离消歧"**绝不盲猜，宁可报错也不点错控件**"（`:2097`）。
- **fill 回读校验 + `allowFormSubmit` 默认 false**（`:731/:811/:2469-2539`）：写入后回读目标控件当前值确认文本真正落地（杜绝静默错填）；校验失败降级回退且**防 CDP 主路径已写入被误判失败而重写致文本重复**（`:731`）；`pressEnter` 只派发合成回车（下拉筛选/联想选定，**绝不提交表单**），仅显式 `allowFormSubmit=true` 才提交。
- **reload 票据净化 + mainFrame 保护**（`:184-190`）：仅重载教务主框架核心内容区（`frame[name="mainFrame"]` 等选择器），保护外层导航框架不丢失；导航/重载链路与 ticket 净化（constants `stripOneTimeTicket`）联动。
- **死锁/乒乓振荡防护（DeadlockGuard）**（`:2065-2073/:2379`）：交互前置拦截 Period-2 交替死锁与动作空间遮罩，命中即熔断回执（"请改用其他控件或先读取页面"），终止模型 20 步空转。
- **CJK token 加权**（`:2247/:2261`）：Token 估算按宽字符加权——CJK/全角 1 token/字、西文与其他 0.25 token/字。

### 3.5 装配（`:2280-3291`）

`buildYanhuBrowserTools(tabResolver)`：逐工具定义 JSON Schema+执行器（执行层 `yanhuExpressManager`）；危险动作名命中 `YANHU_DANGEROUS_ACTION_RE` 硬拦截；`createYanhuToolLabeler` 提供胶囊标签。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）：「砚小龙」Agent 运行时（工具投递）；执行层 `yanhuExpressManager`/`yanhu-devtools-hub`/`yanhu-dom-distillation`（PageDigest/台账来源）；本批直接测试无（dom-distillation.test 覆盖蒸馏侧）。出向：`yanhu-constants`/`yanhu-visual-anchor`/`YanhuDistilledPage`/`YanhuBidNode` 等同目录模块。

## 5. 数据 I/O、读写与副作用

经 `yanhuExpressManager` 驱动页面（点击/填表/导航/执行脚本）；网络日志脱敏后进工具结果。节流/稳态等待引入时延。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 危险动作命中 | `:132-133` | 硬拦截保会话 |
| 重复点击 | `:95-100` | 拦截（内容指纹判定） |
| 死锁/乒乓振荡 | `:2065-2073` | DeadlockGuard 熔断回执 |
| fill 回读校验失败 | `:811/:2539` | 降级回退（防重复写入） |
| 选中消歧失败 | `:2097` | 报错不盲猜 |
| 连续空读 | `:135-137` | 短路熔断提示 |
| 脚本异常 | `:176` 等 | 回退固定观察窗 |
| 取消 | 无 | 无 AbortSignal（300-500ms 硬超时上限） |

## 7. 权限与权威状态

门禁口径：唯一工具源、不对外暴露、只在上网不碰本机（文件头）；危险动作硬拦截；人类行为间隔防 WAF 机器判定；读页台账全量输出是模型可用性不变式；“宁可报错绝不谎报/不盲猜”（isSelectionApplied/消歧）与 allowFormSubmit 默认 false（防误提交表单）为安全口径。

## 8. 修改影响面

改工具语义/脚本 → 直接影响「砚小龙」自动化能力与青果教务适配；与 dom-distillation（台账）/visual-anchor（视觉）/devtools-hub（采集）联动。

## 9. 测试证据

本轮 `NOT_RUN`。本批无直接测试文件（工具执行层依赖 Electron/CDP）；部分纯函数（节流/清洗/脚本生成）具备可测性。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 门禁唯一工具源/不外露 | 已证实 | 文件头 |
| 动静节流+稳态窗+重复拦截 | 已证实 | `:79-137/:144-183` |
| 台账全量（历史缺陷修复） | 已证实 | `:201-206` |
| 复杂控件脚本族 | 已证实 | `:474-2098` |
| 危险动作硬拦截 | 已证实 | `:132-133` |
| 工具数（14 vs 词面 16） | 已证实（两口径并记） | 文件头 vs 静态检索 |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 类型/常量族 | 2 | `:46-137` | covered |
| 稳态/节流/台账 | 3.1-3.2 | `:79-298` | covered |
| 控件脚本族 | 3.3 | `:474-2098` | covered |
| 视觉族 | 3.4 | `:2099-2279` | covered |
| `buildYanhuBrowserTools`/labeler | 3.5 | `:2280-3303` | covered |
