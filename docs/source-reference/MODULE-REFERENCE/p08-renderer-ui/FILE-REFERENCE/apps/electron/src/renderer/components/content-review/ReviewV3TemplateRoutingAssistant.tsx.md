---
path: apps/electron/src/renderer/components/content-review/ReviewV3TemplateRoutingAssistant.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 566ffe94f67e62b729e7bfe5b593ec6b4cc6506b
sha256: f66a30ae6365c9ae872539b084518835f56ec6b274b29cbd23eed4ac7aa94781
lines: 279
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewV3TemplateRoutingAssistant.tsx

## 1. 结论与边界

「匹配审核模板」助手：在同一原生案卷上完成三条互斥路径之一——**内置 50 套 D4 方案**（`attachD4TechnicalPlanV3`）、**本机已发布模板**（`chooseLocalNativeProductTemplateV3`）、**公共兜底 B1 草稿**（preview→save→freeze→`attachB1TechnicalPlanV3`）（`apps/electron/src/renderer/components/content-review/ReviewV3TemplateRoutingAssistant.tsx:89-146`、`:237-246`）。

运行时 UI 组件，**直接调用 `window.reviewAPI`**（与本批其它组件不同）：共 **10 个方法、13 个调用点**，见第 4 节表。

明确不做的事：

- **不自行判定「已安装」**：`installed` 优先来自聚合的 `d2RuntimePlan`（`:53-58`），否则来自 attach 回执（`:94`、`:144`）。
- **不把模型输出当规则**：模型只用于「业务识别建议」（`:151-176`）与「草稿」（`:104-109`），注释写明「模型结果只能作人工可见推荐」（`:173`）。
- **不使用 UI 自报的来源**：兜底路径把 `intent` 交给 Main，由 B29 依据真实原件重算来源（`:122-130`），再由 `executableFallbackAuthor` 用原件 SHA 对齐案卷版本（`review-v3-fallback-executable-plan.ts:24-73`）。

## 2. 导出与关键符号

`export` 共 **3 个**（2 interface + 1 function）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ReviewV3InstalledPlan` | 导出 interface | `:12-14` | `{caseId; templateId; templateVersion:number; checks:number; fingerprint}` | 与 `attachD4/attachB1` 回执形状一致 |
| `ReviewV3TemplateRoutingAssistantProps` | 导出 interface | `:15-21` | `{caseId: string; onPlanInstalled?: (plan)=>void; onTemplateBound?: (choice)=>void}` | 两个可选回调 |
| `ReviewV3TemplateRoutingAssistant` | 导出 function | `:26-279` | `(props) => React.ReactElement` | 唯一组件 |

内部：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `Step` | `:22` | `'catalog'\|'fallback'` |
| `action` / `secondary` | `:23-24` | 类名常量 |
| `refresh` | `:49-65` | 读聚合→读产品路由，写 `installed`/`read`/`preferred` |
| `run` | `:83-88` | `busy` 互斥 + `humanizeReviewError` 统一错误 |
| `attachD4` | `:89-96` | 安装 D4 技术计划 |
| `extract` | `:97-117` | 生成 T01 草稿（本机或模型） |
| `attachFallback` | `:118-146` | 兜底四步链 |
| `chooseManual` | `:147-150` | 选中内置模板并清空 `selection` |
| `identifyWithModel` | `:151-176` | 模型辅助业务识别 |
| `isD4` | `:180` | `/^(?:g0[1-8]-\|d4-g04-)/` |

## 3. 内部逻辑与关键流程

### 3.1 `refresh`（`:49-65`）

1. 无 `caseId` 直接返回（`:50`）。
2. `getAggregateV2(caseId)`；`currentCase.current !== caseId` 则丢弃（`:51-52`）。
3. 聚合有 `d2RuntimePlan` → 用 `mapping.length` 作 `checks`、`fingerprint` 原样写 `installed`，**并 `setRead(null)` 提前返回**（`:53-59`）。
4. 否则 `readLocalNativeProductV3(caseId)` → `setRead`、`setInstalled(null)`；若路由 `default-selected` 则把 `chosen.templateId` 写入 `preferred`（`:60-64`）。

### 3.2 两个加载 effect

- **主 effect**（`:66-74`）：依赖 `[caseId, epoch, refresh]`。进入时清 10 项状态（含 `proposal`/`prepared`/`confirmed`/`modelRouteNote`），无 `caseId` 直接返回；否则 `refresh()`，错误写 `error`（`:72`）。
- **倒计时 effect**（`:76-82`）：仅 `read.read.route.status==='countdown'` 时设 `setTimeout`，延时 `Math.min(Math.max(remainingMs,1000),20000)+100`（`:80`）——下限 1000ms（与 `ReviewV3CaseTaskView` 的 800ms 不同），到点再 `refresh()`；卸载/依赖变化时 `clearTimeout`。

`epoch` 只在「已发布模板」分支自增（`:245`），用于强制重读。

### 3.3 `attachD4`（`:89-96`）

`run()` 包裹；`!selection` → 抛「请先核对具体对象、场景和适用条件」；`currentCase` 已变 → 抛「案卷已切换，请重新选择模板」；`attachD4TechnicalPlanV3({caseId,d4:selection})` → `setInstalled(receipt)`、写提示、`onInstall.current?.(receipt)`。

`selection` 由 `D4CaseSetup` 的 `onChange` 提供（`:231`）。

### 3.4 `extract(model)`（`:97-117`）

- `brief` 为空 → 抛「先写明审核目的和需要检查的事项」（`:98`）。
- `templateId = 'fallback-' + Date.now().toString(36)`，`createdAt = new Date().toISOString()`（`:99-100`）。
- `model=false` → `draftT01FromBrief(brief, templateId, createdAt)`；`model=true` → `draftT01ViaAuthorizedModel(brief, templateId, createdAt, invoke)`，其中 `invoke` 调 `requestT01ModelDraft(prompt)` 并记录回传的 `channelName/modelId`（`:104-109`）。
- 成功后 `setProposal(result)`、`setPrepared(null)`、`setConfirmed(false)`、`requirements = proposedFallbackChecks(result, brief).join('\n')`（`:114-115`）。

### 3.5 `attachFallback`（`:118-146`）——四步链

1. 守卫：`!proposal || !confirmed` → 抛「请先逐条核对检查要求并确认」（`:119`）。
2. `checks = requirements` 按行拆分、trim、去空（`:120`）；空 → 抛「不能创建零检查计划」（`:121`）。
3. 生成 `templateId = 'fallback-' + caseId 去非字母数字前 36 位 + '-' + Date.now().toString(36)`（`:123`）。
4. `intent`：`templateId`、`name=proposal.template.name||'本地公共审核'`、`purpose=brief`、`scenario='当前本地申请材料'`、`objectKey='当前申请事项'`、`humanRequirement=checks[0]`（**只取第一条**）、`recordedBy/reviewerRole='local-reviewer'`、`userConfirmedAuthoring:true`（`:124-129`）。
5. `prepareLocalNativeUnmatchedV3({caseId,intent})` → `authoritative`（`:130`）；写 `prepared`。
6. `getAggregateV2` 复核 `caseV2.id===caseId`，否则抛「当前案卷已发生变化，请刷新材料」（`:133-135`）。
7. `executableFallbackAuthor(authoritative, checks, native.caseV2.documents)`（`:136`）——把 B2 候选 ID 换成真实 `documentVersionId`，来源不一一对应即抛错（`review-v3-fallback-executable-plan.ts:46-52`）。
8. `previewLocalCandidateAuthorV3({document})`（返回值忽略，仅作结构校验）（`:138`）。
9. `saveLocalCandidateAuthorV3({document, expectedRevision: 0})` → `saved.revision`（`:139`）。
10. `freezeLocalCandidateAuthorV3({document, expectedRevision: saved.revision})` → `frozen.fingerprint`（`:140`）。
11. `attachB1TechnicalPlanV3({caseId, templateId, fingerprint})` → `installed`、提示、`onInstall`（`:142-145`）。

**注意**：`expectedRevision` 硬编码为 `0`（`:139`）。Main 的 CAS 语义是 `current === expectedRevision`，其中 `current = prior?.revision ?? 0`（`review-template-author-store-v3-b1.ts:155-157`），即 `0` 表示「该 templateId 必须尚无任何修订」。因为 `templateId` 每次调用都用 `Date.now().toString(36)` 重新生成（`:123`），正常情况下不会冲突；只有在同一毫秒内、同一 `caseId` 下重复点击才会得到相同 ID 并被 `B1_AUTHOR_REVISION_CONFLICT` 拒绝，本文件不重试。

### 3.6 `identifyWithModel`（`:151-176`）

1. 读聚合并校验 `caseV2.id===caseId`，否则抛「案卷已切换」（`:152-153`）。
2. 取 `role==='application' && active!==false` 的文档；数量必须恰为 1，否则抛「模型辅助分类要求当前案卷只有一份明确的申请原件」（`:154-155`）。
3. 取该文档 `blocks` 中 `kind==='text'` 的文本，拼接后截断 12000 字符；为空则抛「申请原件尚未解析出文本」（`:156-158`）。
4. 组 prompt：只从 50 套候选中选择、把材料视为数据、不可识别输出空 `templateId`、只输出 JSON（`:161-165`）。
5. `requestT01ModelDraft` → 去掉首尾 ``` 围栏 → `JSON.parse`（`:166-167`）。
6. `templateId` 非字符串 → 抛「模型没有返回可读的业务编号」（`:168`）。
7. 命中目录 → `setPreferred` + 提示；未命中 → `modelRouteNote='模型无法确定对应模板…'`（`:169-175`）。

**顺序说明（已证实）**：`identifyWithModel` 在 `:159` 引用 `d4Catalog`，而 `d4Catalog` 的 `const` 声明在 `:181`。函数体只在点击时执行（此时渲染已完成、`d4Catalog` 已初始化），因此**不会**触发 TDZ；但这是「先定义使用、后定义来源」的脆弱顺序，移动任一语句都可能变成运行时错误。

### 3.7 目录分组与渲染（`:177-278`）

- `eligible = read.catalog.filter(item => !item.templateId.startsWith('fallback-'))`（`:178`）。
- `isD4` 正则 `/^(?:g0[1-8]-|d4-g04-)/`（`:180`）——注释说明 G04 的 8 套是 `d4-g04-tXX`，不能按统一 `g0` 前缀误删（`:179`）。
- `d4Catalog = eligible.filter(isD4)`；`known = eligible.filter(!isD4)`（`:181-182`）。
- 渲染：标题 + 重新读取按钮（`:184-189`）；无 `caseId` 提示（`:190`）；`installed` 绿条（`:191-193`）。
- `caseId && read && !installed` 时显示三个计数徽标（真实材料/内置方案+我的模板/路由状态中文）（`:194-199`）、countdown 剩余秒（`:200`）、unmatched 提示（`:201`）、`needs-user-confirmation`/`awaiting-evidence` 提示（`:202-203`）。
- 模式切换两按钮（`:204-207`）。
- `catalog` 模式：`routeCandidates` 按钮组（`:209-217`）、「用当前模型辅助识别业务」（`:218-222`）、`modelRouteNote`（`:223`）、内置方案下拉（`:224-230`）、`<D4CaseSetup key={preferred||'manual'} .../>`（`:231`）、应用按钮（`:232-234`）、`known` 折叠组（`:235-247`）。
- `fallback` 模式：brief 文本域（`:251-253`）、两个草稿按钮（`:254-257`）、草稿卡（`:258-273`）含逐项要求文本域、待核事项折叠、确认勾选、提交按钮、`prepared` 来源数提示（`:272`）。
- 全局 `message`/`error`（`:276-277`）。

## 4. 调用者与调用链

**入向**

- `apps/electron/src/renderer/components/content-review/ReviewV3LocalCandidateWorkbench.tsx:329-336`：`localCaseId && !activePlan` 时挂载，传 `caseId`、`onPlanInstalled`（写 `activePlan` + `materialsEpoch+1`）、`onTemplateBound`（`materialsEpoch+1`）。
- 全树唯一引用（`grep -rn` 仅此一处）。

**出向（8 个 reviewAPI 方法）**

| 方法 | 本文件行 | preload | 用途 |
| --- | --- | --- | --- |
| `getAggregateV2` | `:51`、`:133`、`:152` | `preload/index.ts:4874` | 读聚合/复核案卷 |
| `readLocalNativeProductV3` | `:60` | `:4838` | 产品路由 |
| `attachD4TechnicalPlanV3` | `:92` | `:4829` | 安装 D4 技术计划 |
| `requestT01ModelDraft` | `:105`、`:160` | `:4947` | 模型草稿/识别 |
| `prepareLocalNativeUnmatchedV3` | `:130` | `:4844` | B29 兜底初稿 |
| `previewLocalCandidateAuthorV3` | `:138` | `:4821` | 结构校验 |
| `saveLocalCandidateAuthorV3` | `:139` | `:4818` | 保存修订 |
| `freezeLocalCandidateAuthorV3` | `:140` | `:4824` | 冻结指纹 |
| `attachB1TechnicalPlanV3` | `:142` | `:4833` | 安装 B1 计划 |
| `chooseLocalNativeProductTemplateV3` | `:239` | `:4842` | 绑定本机已发布模板 |

（共 13 个调用点、10 个不同方法；其中 `getAggregateV2` 3 处（`:51`、`:133`、`:152`）、`requestT01ModelDraft` 2 处（`:105`、`:160`），其余各 1 处。）

**纯函数依赖**

`draftT01FromBrief`（`review-v3-t01-brief-authoring.ts:113`）、`draftT01ViaAuthorizedModel`（`review-v3-t01-model-draft-port.ts:50-54`）、`proposedFallbackChecks` / `executableFallbackAuthor`（`review-v3-fallback-executable-plan.ts:8-22`、`:24-73`）、`humanizeReviewError`（`review-error-text.ts:40`）。

## 5. 数据 I/O、读写与副作用

- **读**：聚合、产品路由、模型草稿。
- **写（Main 持久化）**：`attachD4TechnicalPlanV3`、`prepareLocalNativeUnmatchedV3`、`saveLocalCandidateAuthorV3`、`freezeLocalCandidateAuthorV3`、`attachB1TechnicalPlanV3`、`chooseLocalNativeProductTemplateV3`。
- **网络副作用**：`requestT01ModelDraft` 会发出真实模型请求（`identifyWithModel` 把申请件解析文本发给已配置模型，`:160-165`）；界面在 `:221` 明示这一点。
- **无** localStorage / atom / 剪贴板 / 定时器（除倒计时 `setTimeout`）。
- **并发**：`run()` 的 `busy` 互斥（`:84`）；`currentCase` ref 在每次 await 后复核（`:91`、`:93`、`:131`、`:134`、`:141`、`:143`、`:170`）。
- **幂等**：`refresh` 幂等；`attachD4`/`attachB1`/`choose` 非幂等（重复调用由 Main 拒绝或产生新回执）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 未选 D4 选择 | `:90` | 「请先核对具体对象、场景和适用条件」 |
| 案卷已切换 | `:91`、`:153` | 「案卷已切换…」/「案卷已切换」 |
| brief 为空 | `:98` | 「先写明审核目的和需要检查的事项」 |
| 模型输出非 JSON | `:167` | `JSON.parse` 抛错 → `run()` catch → `humanizeReviewError` |
| 模型无 templateId | `:168` | 「模型没有返回可读的业务编号」 |
| 申请原件不唯一 | `:155` | 「模型辅助分类要求当前案卷只有一份明确的申请原件」 |
| 无解析文本 | `:158` | 「申请原件尚未解析出文本，无法准确识别类型；请手动选择」 |
| 未确认草稿 | `:119` | 「请先逐条核对检查要求并确认」 |
| 零检查 | `:121` | 「不能创建零检查计划」 |
| 案卷读回不一致 | `:135` | 「当前案卷已发生变化，请刷新材料」 |
| 来源无法一一对应 | `:136` → `review-v3-fallback-executable-plan.ts:51` | 「兜底来源未能与当前案卷真实原件一一对应…」 |
| 绑定未记录 | `:241` | 「模板未成功绑定案卷」 |
| 绑定本机模板成功后提示被主 effect 清空 | `:242`、`:245`、`:68` | 成功路径先 `setMessage('已绑定本机发布模板 …')`（`:242`），再 `setEpoch(x=>x+1)`（`:245`）；主 effect 依赖 `[caseId, epoch, refresh]`（`:74`）随之重跑并在 `:68` 清空 `setMessage('')`，故提示最终不保留。**实际是否曾短暂可见（帧数/时长）未运行验证，未知**——源码只能确认 effect 的清空路径（`useEffect` 在 paint 后执行） |
| `attachFallback` 途中切案卷 → 静默中止且无回滚 | `:131`、`:134`、`:141`、`:143` | 四次 `currentCase.current!==caseId` 都直接 `return`，不设 error/message：`:131` 在 `prepareLocalNativeUnmatchedV3`（`:130`）之后——B29 草稿已留 Main、UI 未 `setPrepared`（`:132`）；`:134` 在 `getAggregateV2` 之后；`:141` 在 `save`/`freeze`（`:139-140`）之后——已保存修订与冻结指纹留 Main；`:143` 在 `attachB1TechnicalPlanV3`（`:142`）之后——计划已装到旧案卷但 UI 不再显示回执。全部**无回滚、无用户提示** |
| 倒计时中离开 | `:81` | `clearTimeout` |

**恢复**：`installed` 可从聚合 `d2RuntimePlan` 恢复（`:53-58`）；`proposal`/`prepared`/`brief` 为易失 state，重进需重做草稿。**不可恢复**：未保存的 brief 与逐项要求。

## 7. 权限与权威状态

- 本文件无 sender/role/actor 检查；写操作全部经 preload → Main，Main 侧对每条通道另有守卫（例如 `REGISTER_MATERIAL_PATH_V2` 用 `assertC0ReviewMainSender`，见 `review-ipc.ts:1285-1286`；本文件调用的 attach/save/freeze 通道的守卫未在本批逐行读，见第 10 节未知）。
- 权威状态：`installed` 的 `checks/fingerprint` 只来自 Main 回执或聚合（`:55-56`、`:94`、`:144`）；`prepared` 只来自 B29 回执（`:132`）。
- 前端门禁：`selection` 非空、`brief` 非空、`confirmed`、`checks` 非空、`currentCase` 一致（`:90`、`:98`、`:119-121`、`:91`）。均为可用性约束。
- 模型输出被明确定位为建议：`setModelRouteNote` 文案含「请在下方确认真实对象和条件」（`:174-175`）。

## 8. 修改影响面

- **唯一调用方** `ReviewV3LocalCandidateWorkbench.tsx:329-336`：改 props 需同步；`onPlanInstalled` 的 plan 形状必须保持 `ReviewV3InstalledPlan`。
- **`D4CaseSetup` 契约**：本文件以 `key={preferred||'manual'}` 强制重挂载（`:231`），依赖 `onChange` 返回 `D4ClientSelection|undefined`。
- **`executableFallbackAuthor`**：兜底链的第 7 步依赖它把 `b2-candidate:` locator 换成真实 `documentVersionId`；改其签名会同时影响本文件与 `ReviewV3ProductWorkspace` 的 fallback 路径。
- **`expectedRevision:0`**（`:139`）：若 Main 改为「必须带当前修订」，此链会直接失败；修改需同步三处调用（save/freeze/attach）。
- **`isD4` 正则**（`:180`）：新增模板命名空间（如 `d4-g05-`）若不匹配，会被归到「我的模板」组，走 `chooseLocalNativeProductTemplateV3` 而非 D4 attach。
- 无存储格式/迁移。

## 9. 测试证据

**直接测试**：无。全树 `--include=*.test.ts/tsx/mjs` 检索 `ReviewV3TemplateRoutingAssistant`、`ReviewV3InstalledPlan`、`draftT01ViaAuthorizedModel`、`executableFallbackAuthor` 命中均为 0。

**间接证据**：`review-error-text.test.ts` 覆盖本文件使用的 `humanizeReviewError`（`:6-44`），但与本组件行为无关。

**未覆盖**：三条安装路径、模型识别分支、`expectedRevision:0` 冲突、倒计时 1000ms 下限、`isD4` 分组、`prepared` 展示。

**NOT_RUN**：本轮未执行测试/构建/GUI，也未发起任何模型请求。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 个导出（2 interface + 1 function） | 已证实 | `:12`、`:15`、`:26` |
| 直接调用 10 个不同 reviewAPI 方法、13 个调用点 | 已证实 | 见 4 节表；`grep -o 'window.reviewAPI\.[A-Za-z0-9]*'` 去重计数 |
| `installed` 优先来自 `d2RuntimePlan` | 已证实 | `:53-58` |
| 兜底链为 preview→save(0)→freeze(saved.revision)→attach | 已证实 | `:138-142` |
| `intent.humanRequirement` 只取第一条检查 | 已证实 | `:127` 的 `checks[0]!` |
| 倒计时下限 1000ms、上限 20000ms、+100ms | 已证实 | `:80` |
| `identifyWithModel` 引用后声明的 `d4Catalog`，但调用时已初始化 | 已证实（静态） | `:159` vs `:181`；函数在点击时执行 |
| 模型识别要求恰好 1 份申请原件 | 已证实 | `:154-155` |
| 绑定本机模板成功提示会被 `setEpoch` 触发的主 effect 清空（最终不保留；可见帧数/时长未知） | 已证实（清空路径）/未实测（可见性） | `:242`、`:245`、`:74`、`:68` |
| `attachFallback` 切案卷时四处静默中止，已 prepare/保存/冻结/attach 的产物留 Main 无回滚 | 已证实 | `:131`、`:134`、`:141`、`:143` |
| save/preview/freeze 三个作者通道要求主窗口 sender 且 sender 必须是主窗口 webContents | 已证实 | `review-v3-main-local-author-workbench.ts:61-90` 每个 handler 先调 `currentLocal(event)`；`currentLocal` = `assertC0ReviewMainSender` + `main.webContents.id===event.sender.id`（`:21-26`；`:27-32` 是 `localDocument`） |
| D4 attach 要求主窗口 sender + 原生草稿 + 未绑定模板 | 已证实 | `review-v3-main-d4-local-plan.ts:81-95`（`assertC0ReviewMainSender`、`LOCAL_D4_CASE_AND_SCENARIO_REQUIRED`、`LOCAL_D4_NATIVE_DRAFT_CASE_REQUIRED`、pending-template 检查） |
| B1 attach 要求主窗口 sender + 合法 templateId/fingerprint + 未绑定草稿 | 已证实 | `review-v3-main-b1-local-plan.ts:18-30`（`assertC0ReviewMainSender`、`B1_AUTHOR_OR_CASE_REQUIRED`、`B1_UNBOUND_NATIVE_DRAFT_REQUIRED`） |
| `expectedRevision:0` 表示该 templateId 尚无修订；同毫秒同案重复点击会被拒 | 已证实（CAS 语义）/未实测碰撞 | `:123` 每次生成新 ID；`review-template-author-store-v3-b1.ts:155-157` |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 个导出 | 2 | `:12`、`:15`、`:26` | covered |
| `refresh` | 3.1 | `:49-65` | covered |
| 两个加载 effect | 3.2 | `:66-82` | covered |
| `attachD4` | 3.3 | `:89-96` | covered |
| `extract` | 3.4 | `:97-117` | covered |
| `attachFallback` | 3.5 | `:118-146` | covered |
| `identifyWithModel` | 3.6 | `:151-176` | covered |
| 目录分组与渲染 | 3.7 | `:177-278` | covered |
| 调用者/出向 | 4 | — | covered |
| 权限与权威 | 7 | — | covered |
| 测试证据 | 9 | — | covered（无直接测试） |
| Main 侧守卫细节 | 10 | — | unknown |
