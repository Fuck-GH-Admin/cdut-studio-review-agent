# 侧边栏会话栏移除与设置页精简计划

> 范围：只读探查已完成，本文件仅描述改动方案。执行阶段严格按本计划进行，不做计划外改动。
> 语言：全文中文，代码注释/日志遵循项目规范。

---

## 0. 背景与关键确认

### 0.1 关于「Claude / Pi 圆角矩形」的身份确认（回答用户疑问）

用户提问：「这个标签指的确定是 Claude/Pi 运行时的标签吗？」

**确认：是。** 这两个圆角小胶囊就是 **Agent 运行内核（runtime）兼容性标签**，不是模型能力/供应商标签：

- **Claude 标签**：由 `isAgentCompatibleProvider(provider)` 判定（`@profer/shared`），蓝色胶囊，表示该渠道可跑 Claude（Anthropic 协议）内核。
- **Pi 标签**：由 `resolvePiCoreState(channel)`（[channel-model-groups.ts](file:///c:/Users/Belie/Desktop/CDUT-Studio/apps/electron/src/renderer/lib/channel-model-groups.ts#L58)）判定，有三种形态：
  - `active` → 绿色 `Pi`（正常启用）
  - `experimental-active` → 琥珀色 `Pi 实验`
  - `experimental-inactive` → 琥珀色 `Pi 实验未启用`

两处渲染位置（均位于 [ChannelSettings.tsx](file:///c:/Users/Belie/Desktop/CDUT-Studio/apps/electron/src/renderer/components/settings/ChannelSettings.tsx)）：
- 官方渠道分组行 `OfficialChannelGroupRow`（L383-L387 内联胶囊）
- 自配置渠道行 `ChannelRow` 的 `AgentCoreChips` 组件（L430 调用，L508-L527 定义）

用户已确认：**「两类行都移除」**，即上述两处均删除。

### 0.2 三项任务范围确认

| # | 任务 | 用户确认结论 |
|---|------|-------------|
| 1 | 移除主侧边栏「当前会话」栏 | **「两者都移除」**：展开态（ExpandedSidebar）的「当前会话」块 **和** 折叠态（SidebarRail）的「最近/关键会话入口」列表都移除 |
| 2 | 移除设置「账户与资料」栏目，把「个人资料」移到「通用」顶部 | **「账户资料的实际设置都保留，只是从『账户与资料』移动到『通用』，你只能移除对功能无破坏的部分」**：个人资料功能 100% 保留（原样搬移），仅移除已空置的导航入口 |
| 3 | 移除「模型配置-已添加模型」每行的 Claude/Pi 胶囊 | **「两类行都移除」**（官方分组行 + 自配置渠道行） |

### 0.3 相关事实（探查结论）

- 全仓库**没有任何代码**会跳转到 `'account'` 设置标签（grep 仅命中：类型定义、导航标签定义、switch case）。移除该入口无破坏功能。
- 根 `tsconfig.json`：`noUnusedLocals: false`、`noUnusedParameters: false`、`strict: true`、`verbatimModuleSyntax: true`。因此遗留未使用导入**不会**导致 typecheck 失败，但为可读性仍应清理。
- `SidebarRail` 与 `ExpandedSidebar` 共享同一 `SidebarModel`（来自 [use-left-sidebar.ts](file:///c:/Users/Belie/Desktop/CDUT-Studio/apps/electron/src/renderer/components/app-shell/left-sidebar/use-left-sidebar.ts)）。
- `isAgentEnabledForChannel` 同时被非标签逻辑使用（ChannelSettings L130、L221），**必须保留**；仅 `isAgentCompatibleProvider` / `resolvePiCoreState` 与标签绑定。

---

## 1. 任务 1：移除主侧边栏「当前会话」栏

### 1.1 目标
侧边栏不再显示「当前会话」区块（展开态），也不再显示折叠态 rail 的「最近会话」图标列表。

### 1.2 改动点

#### A. [expanded-sidebar.tsx](file:///c:/Users/Belie/Desktop/CDUT-Studio/apps/electron/src/renderer/components/app-shell/left-sidebar/expanded-sidebar.tsx) — 展开态
- **删除**「当前会话」整块 JSX（L265-L319，含注释、标题行、计数徽标、`openSessionTabs.map(...)` 列表容器）。
- **删除** 随之失效的派生数据 `openSessionTabs` useMemo（L115-L120）。
- **删除** 随之失效的 `useCloseTab` 导入（L21）与 `const { requestClose: requestCloseTab } = useCloseTab()`（L114）。经 grep 确认 `requestCloseTab` 仅在本块 L291/L313 使用，删除块后无其他引用。
- **保留**（勿动）：`tabs`（仍在 useEffect 依赖中）、`ConversationItem`/`AgentSessionItem`（下方置顶/历史/归档区仍用）、`activeSessionId`、`streamingIds`、`conversationDraftMap`、`agentDraftIds`、`agentIndicatorMap`、`workspaceNameMap`、`getSessionLeftAccent` 等。

#### B. [rail.tsx](file:///c:/Users/Belie/Desktop/CDUT-Studio/apps/electron/src/renderer/components/app-shell/left-sidebar/rail.tsx) — 折叠态
- **删除**「最近/关键会话入口」整块 JSX（L206-L223，含注释、滚动容器与 `railRecentItems.map(...)`）。
- **删除** 随之失效的导入 `import { RailRecentButton } from './session-items'`（L14）。
- **删除** 解构中随之失效的字段 `railRecentItems`、`handleSelectAgentSession`、`handleSelectConversation`（L32-L34）。
- **保留**：`userProfile`（底部头像仍用）及上方所有入口。

#### C. [use-left-sidebar.ts](file:///c:/Users/Belie/Desktop/CDUT-Studio/apps/electron/src/renderer/components/app-shell/left-sidebar/use-left-sidebar.ts) — 清理死代码
- **删除** `railRecentItems` useMemo（L1741-L1812）。
- **删除** return 对象中的 `railRecentItems` 字段（L1943）。
- **删除** `SidebarModel` 接口中的 `railRecentItems` 字段声明。
- **删除** 若因此失效的 `getRailInitial` 导入（L110）（grep 确认仅 L1759/L1794 使用，均在被删代码内）。
- **保留**：`unviewedCompletedSessionIds`、`draftSessionIds`、`agentIndicatorMap`、`streamingIds` 等（均有其他使用方）。

#### D.（可选清理）[session-items.tsx](file:///c:/Users/Belie/Desktop/CDUT-Studio/apps/electron/src/renderer/components/app-shell/left-sidebar/session-items.tsx)
- `RailRecentButton`（L104-L166）在移除后已无任何引用；其唯一使用的 `RailRecentItem` 接口（L92-L102）也随之无引用。
- 若执行清理：删除 `RailRecentButton` 与 `RailRecentItem`，并清理仅被其使用的符号。**注意** `SessionMiniMapPopover` / `useSessionMiniMapHover` / `Clock` / `RAIL_STATUS_CLASS` 可能被文件内其他组件复用，删除前需再次确认引用。
- 该项为**可选**：不删也不会报错，仅属可读性优化。默认执行；若发现连带引用过多则保留。

### 1.3 风险
低。纯 UI 移除，不涉及 IPC/持久化/状态结构（`tabsAtom` 不变，仅不再有该展示位）。

---

## 2. 任务 2：移除「账户与资料」栏目，把「个人资料」移到「通用」顶部

### 2.1 目标
- 「个人资料」设置项（头像更换 + 显示名编辑）**原样保留功能**，位置改到「通用」栏目**最顶部**。
- 删除已空置的「账户与资料」导航入口，不破坏任何功能。

### 2.2 改动点

#### A. 搬移内容来源：[AccountSettings.tsx](file:///c:/Users/Belie/Desktop/CDUT-Studio/apps/electron/src/renderer/components/settings/AccountSettings.tsx)
- 该组件**整体就是一个**「个人资料」Section（L83-L160），需原样搬移。
- 需要一并搬移的**逻辑与依赖**：
  - 状态：`userProfile`(`userProfileAtom`)、`isEditingName`、`nameInput`、`showEmojiPicker`、`fileInputRef`
  - 处理函数：`handleAvatarChange`、`handleImageUpload`、`handleSaveName`、`handleNameKeyDown`
  - 接口类型：`EmojiMartEmoji`
  - 导入：`useAtom`(jotai)、`Camera, ImagePlus`(lucide-react)、`Picker`(@emoji-mart/react)、`data`(@emoji-mart/data)、`Popover/PopoverTrigger/PopoverContent`、`UserAvatar`、`userProfileAtom`、`cn`；`SettingsSection, SettingsCard` 目标文件已有。
- 搬移后 **原 `AccountSettings.tsx` 文件整体删除**（内容已无残余；其标题注释「账户与个人资料」也随之作废）。

#### B. 目的地：[GeneralSettings.tsx](file:///c:/Users/Belie/Desktop/CDUT-Studio/apps/electron/src/renderer/components/settings/GeneralSettings.tsx)
- 在 `<div className="space-y-6">` 内、**「工作流与引导」Section 之前**插入搬移来的「个人资料」Section（保持 `title="个人资料"`、`description="设置头像和显示名称，这些信息只保存在本机"` 原文不变）。
- 在文件顶部补充上表所需导入；在组件函数内补充上述状态与处理函数。
- **更新文件头注释**（L6）：「账户与个人资料由 AccountSettings 独立管理。」已不成立，改为说明个人资料已并入通用页（或删除该行）。

#### C. 移除空置入口：[SettingsPanel.tsx](file:///c:/Users/Belie/Desktop/CDUT-Studio/apps/electron/src/renderer/components/settings/SettingsPanel.tsx)
- 删除 `ACCOUNT_GROUP_ITEMS` 定义（L76-L79，含注释）。
- 删除分组数组中的 `{ title: "账户", items: ACCOUNT_GROUP_ITEMS },`（L226）。
- 删除 `renderTabContent` 中的 `case "account": return <AccountSettings />;`（L125-L126）。
- 删除 `import { AccountSettings } from "./AccountSettings";`（L51）。
- 删除 `UserRound` 图标导入（L25）（grep 确认仅此处用于账户图标）。
- **保留**：`authStatus` 及其过滤逻辑（注释提到「账户页始终保留，用于登录入口」——该注释与过滤需评估：见下）与 `default` 分支回退到 `<GeneralSettings />`（即使残留 `'account'` 状态也会安全回退）。

> ⚠️ 待定项（执行前需向用户确认或按现状处理）：[SettingsPanel.tsx L209-L238](file:///c:/Users/Belie/Desktop/CDUT-Studio/apps/electron/src/renderer/components/settings/SettingsPanel.tsx#L209-L238) 的注释写着「未登录时过滤掉需要团队账号的 Tab；账户页始终保留，用于登录入口」。当前 `ACCOUNT_GROUP_ITEMS` 只有「账户与资料」一项且过滤逻辑并未实际按登录态删除它（`filter((g) => g.items.length > 0)` 不会删除非空组）。移除该组后登录入口是否会缺失，需要确认。**默认处理**：直接删除该组（探查显示无代码指向 `'account'`），并**不改动**登录/鉴权相关逻辑；仅更新过时注释。

#### D. 导出清理：[settings/index.ts](file:///c:/Users/Belie/Desktop/CDUT-Studio/apps/electron/src/renderer/components/settings/index.ts)
- 删除 `export * from './AccountSettings'`（L11）。
- grep 确认无其他文件从该 barrel 导入 `AccountSettings`（唯一使用方是 SettingsPanel，且为直接路径导入）。

#### E. 类型（可选）
- `settings-tab.ts` 的 `SettingsTab` 联合类型仍含 `'account'`（L26）。**默认保留**（删除 `case` 后由 `default` 回退，风险最低，且避免牵连其他判定）。如追求彻底，可一并移除该字面量并检查编译。

### 2.3 风险
低-中。核心是「搬移 + 删入口」，个人资料功能逻辑原样迁移。主要风险在漏搬导入/状态导致编译错误，通过 `bun run typecheck` 兜底。

---

## 3. 任务 3：移除「已添加模型」行的 Claude/Pi 胶囊

### 3.1 目标
「模型配置」右侧「已添加模型」列表里，每个模型行右侧不再出现 Claude/Pi 圆角胶囊。

### 3.2 改动点（均在 [ChannelSettings.tsx](file:///c:/Users/Belie/Desktop/CDUT-Studio/apps/electron/src/renderer/components/settings/ChannelSettings.tsx)）

#### A. 自配置渠道行 `ChannelRow` → `AgentCoreChips`
- 删除控件区 `<AgentCoreChips channel={channel} />`（L430 及注释「Agent Core 兼容性标签」，L429）。
- 删除 `AgentCoreChips` 组件定义（L508-L527，含分隔注释 L508）。
- **保留** 控件区其余内容：编辑/删除按钮、`Switch`、展开按钮。

#### B. 官方渠道分组行 `OfficialChannelGroupRow` 内联胶囊
- 删除 `const supportsClaude = isAgentCompatibleProvider(representative.provider)`（L373）。
- 删除内联胶囊 `{supportsClaude && <span ...>Claude</span>}` 与 `<span ...>Pi</span>`（L384-L385）。
- **保留** 外层 `<span className="flex items-center gap-1 shrink-0">` 包裹与其中的 `ChevronDown` 展开箭头（L383、L386），确保展开功能不变。

#### C. 导入清理
- 删除 `resolvePiCoreState` 导入（L16，仅 `AgentCoreChips` 使用）。
- 从 `@profer/shared` 导入中删除 `isAgentCompatibleProvider`（L13），**保留** `PROVIDER_LABELS` 与 `isAgentEnabledForChannel`（后者用于 L130/L221 的非标签逻辑）。

#### D. 文案修正
- 「模型配置」Section 描述（L263）末句「支持 Agent 的渠道会显示对应标签」已不准确。**默认处理**：改为「管理 AI 供应商连接，配置 API Key 和可用模型」。仅改此一句，不改商业模式分支文案（L262）。

### 3.3 风险
低。仅删除展示标签与其局部变量/导入。`resolvePiCoreState` 的定义与单测保留（其他潜在调用方不受影响）。

---

## 4. 假设与决策汇总

1. 三项任务均为**纯 UI/展示层精简**，不涉及 IPC 通道、主进程服务、持久化结构或 Jotai atom 数据模型（除可选删除 `railRecentItems` 派生字段）。
2. 任务 1 采用「先删 UI 块，再删随之失效的局部变量/导入」；`use-left-sidebar` 的 `railRecentItems` 一并移除；`session-items` 的 `RailRecentButton` 列为可选清理。
3. 任务 2 严格遵循用户约束：个人资料功能 100% 保留并搬移，只移除空置导航入口；不改登录/鉴权逻辑（仅更新过时注释）。
4. 任务 3 两处标签均移除；Section 描述末句相应改写。
5. 不修改 `settings-tab.ts` 的类型字面量（可选，默认不动）。
6. 文档（README.md / AGENTS.md / CLAUDE.md）如需同步「设置栏目变化」，**须先经用户允许**后再改；本计划默认不改文档，执行完成后主动向用户请示。

---

## 5. 验证步骤

1. **类型检查（必跑）**：
   ```bash
   bun run typecheck
   # 或精准到应用包
   bun run --filter='@profer/electron' typecheck
   ```
   确保无 TypeScript 编译错误、无缺失 import。
2. **单元测试（回归）**：
   ```bash
   bun test
   ```
   重点关注 `channel-model-groups.test.ts`（本改动未触碰其定义，应保持通过）。
3. **手动验收（`bun run dev`）**：
   - 展开侧边栏：确认已无「当前会话」区块；会话列表/置顶/归档等原有区域正常。
   - 收起侧边栏：确认 rail 中已无「最近会话」图标列表，其余入口与底部头像正常。
   - 设置 → 通用：顶部出现「个人资料」，头像更换（emoji/上传）与名称编辑功能正常。
   - 设置左侧导航：确认「账户与资料」入口消失；无空白分组残留。
   - 设置 → 模型配置：确认每个模型行右侧无 Claude/Pi 胶囊；展开箭头、开关、编辑/删除按钮正常。
4. **无回归确认**：切换 `Cdut`/`Agent` 视图、打开设置再关闭、后台流式会话不中断。

---

## 6. 执行顺序建议

1. 任务 1（A→B→C，可选 D）
2. 任务 2（A→B→C→D，可选 E）
3. 任务 3（A→B→C→D）
4. 统一跑 `bun run typecheck` + `bun test`
5. 手动验收
6. 向用户请示是否同步文档
