---
path: apps/electron/src/main/menu.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 816bbb9288e561b90a2872119fc5ef7a4ab85347
sha256: cba6e5338a6950cb6de503862dd6b6d246ae8e3efa324b7cffdebb12b552350e
lines: 282
kind: source
package: p01-app-shell
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/main/menu.ts

## 1. 结论与边界

Electron 主进程菜单模块：①文本右键菜单模板生成 + 全 WebContents 安装（复制/粘贴/「粘贴为纯文本」/「像输入一样粘贴」）；②剪贴板文本安全化（防粘贴误发送）；③应用主菜单（文件/编辑/视图/窗口/帮助）（`apps/electron/src/main/menu.ts:1-2`）。

边界：不管理菜单栏本地化；不做剪贴板持久化；「像输入一样粘贴」的防检测节流是纯节奏模拟，不含反检测对抗逻辑。

## 2. 导出与关键符号

`export` 逐条核对：6 个（类型 2 + 函数 4；类/常量导出 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `TextContextMenuParams` | 类型（导出） | 4-7 | `Pick<Electron.ContextMenuParams, 'isEditable'\|'selectionText'\|'editFlags'>` | 右键参数子集 |
| `TextContextMenuActions` | 接口（导出） | 10-15 | `{pastePlainText: ()=>void; pasteLikeHuman: ()=>void}` | 动作注入（模板纯函数化） |
| `createTextContextMenuTemplate` | 函数（导出） | 23-63 | `(params, platform=process.platform, actions?) => MenuItemConstructorOptions[]` | 右键菜单模板 |
| `sanitizeClipboardTextForInsertion` | 函数（导出） | 80-85 | `(text: string) => string` | 换行折叠/控制字符剔除/trim |
| `installTextContextMenus` | 函数（导出） | 114-150 | `() => void` | 全 WebContents 安装右键菜单 |
| `createApplicationMenu` | 函数（导出） | 152-282 | `() => Menu` | 应用主菜单 |

内部：`PASTE_LIKE_HUMAN_STEP_MS=18`（`:66`）、`humanPasteTaskIds`（`WeakMap<WebContents, number>`，`:69`）、`pasteLikeHuman`（`:93-109`）、`textContextMenusInstalled`（幂等旗标，`:111`）。

## 3. 内部逻辑与关键流程

### 3.1 `createTextContextMenuTemplate`（`apps/electron/src/main/menu.ts:23-63`）分支矩阵

| 条件 | 返回 |
| --- | --- |
| `!isEditable && selectionText.length===0` | `[]`（不盖住渲染层业务右键，`:30-31`） |
| `!isEditable && 有选区` | 仅 `[{role:'copy', label:'复制', enabled: editFlags.canCopy}]`（`:32`） |
| `isEditable` | undo/redo/分隔/cut/copy/paste +（actions 存在时）「粘贴为纯文本」「像输入一样粘贴」（均 `enabled: editFlags.canPaste`，`:42-55`）+（`platform==='darwin'` 时）`pasteAndMatchStyle`「粘贴并匹配样式」（`:56-58`）+ delete/分隔/selectAll（`:59-61`） |

### 3.2 `sanitizeClipboardTextForInsertion`（`:80-85`）三步语义

1. 换行折叠：`/\s*[\r\n]+\s*/g → ' '`（`:82`）；
2. 剔除 C0 控制字符 `[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]`（`:83`，**保留 `\t`**（`\u0009` 不在类内），`\n/\r` 已被第 1 步折叠）；
3. `trim()`（`:84`）。

红线依据（`:71-79` 注释）：`insertText` 原样写 `\n/\r`，TipTap 等输入框把换行当回车，会在粘贴中/后**误发送消息**——故插入前必须安全化。

### 3.3 `pasteLikeHuman`（`:93-109`）

每 WebContents 任务号 +1（WeakMap，`:94-95`）；`step()` 每 18ms `insertText(text.charAt(index))` 逐字敲入（触发标准 input 事件，`:104-106`）；中断条件：webContents 已销毁或任务号被更新（新粘贴打断旧的，`:99`）；完成即删任务号（`:100-102`）。入参**必须**先经 sanitize（`:91` 注释），否则中途换行触发误发送。

### 3.4 `installTextContextMenus`（`:114-150`）

幂等（`:115-116`）；`app.on('web-contents-created')` → `context-menu` 事件 → 组模板（两个动作都 `setTimeout(0)` 等焦点回输入框 + `sanitizeClipboardTextForInsertion(clipboard.readText())`，空文本跳过插入，`:123-136`）→ 模板空则不弹（`:138`）→ `Menu.buildFromTemplate(template).popup({sourceType, window: BrowserWindow.fromWebContents(webContents) ?? getFocusedWindow(), frame})`（`:140-147`）。

### 3.5 `createApplicationMenu`（`:152-282`）

- macOS 应用菜单（about/services/hide/hideOthers/unhide/quit，`:165-182`）。
- 文件：`CmdOrCtrl+W`→向焦点窗口 `send('menu:close-tab')`（注释 `menu.ts:156-161`：拦截 macOS 默认关窗，改关标签页；preload `preload/index.ts:3758-3759` 监听）；非 mac 追加退出（`menu.ts:199`）。
- 编辑：undo/redo/cut/copy/paste + mac 专属 pasteAndMatchStyle/delete/selectAll，非 mac delete/分隔/selectAll（`:203-221`）。
- 视图：reload/forceReload/toggleDevTools；「重置缩放」`CmdOrCtrl+0`——darwin `resetWindowZoom(win)`，其余 `setZoomFactor(DEFAULT_MAIN_WINDOW_ZOOM_FACTOR)`（注释 `:237`：默认缩放 110%，不沿用 Chromium 100%）；zoomIn/Out、togglefullscreen（`:223-247`）。
- 窗口：minimize/zoom + mac（front/window）或非 mac（close）（`:249-264`）。
- 帮助：`shell.openExternal('https://github.com/Nya-Angle/CDUT-Studio')`（`:272-275`）。

## 4. 调用者与调用链

入向（冻结树 grep）：`apps/electron/src/main/index.ts:188`（import）、`main/index.ts:913`（`installTextContextMenus()`）、`main/index.ts:934`（`createApplicationMenu()`）；`menu:close-tab` 消费：`apps/electron/src/preload/index.ts:3758-3759`（转渲染层标签页关闭）。测试：`menu.test.ts`（模板与 sanitize，见 §9）。

出向：`electron`（app/clipboard/Menu/shell/BrowserWindow）、`./lib/mac-traffic-light`（`DEFAULT_MAIN_WINDOW_ZOOM_FACTOR`/`resetWindowZoom`，`:2`）。

## 5. 数据 I/O、读写与副作用

- 读：`clipboard.readText()`（`:126,133`）。
- 写：无磁盘；副作用 = 原生菜单弹出、`webContents.insertText`（受控输入框内容变更）、`webContents.send('menu:close-tab')`、`shell.openExternal`（外部浏览器）、`setZoomFactor/resetWindowZoom`。
- 并发：`humanPasteTaskIds` 任务号保证同 WebContents 粘贴串行、新任务打断旧任务；`textContextMenusInstalled` 防重复安装。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 行为 |
| --- | --- | --- |
| 非编辑无选区 | 30-31 | 返回 []（保留业务右键） |
| 非编辑有选区 | 32 | 仅复制项 |
| 无 actions | 42-55 | 不追加两个自定义粘贴项 |
| 非 darwin | 56-58 | 无「粘贴并匹配样式」 |
| 粘贴文本安全化后为空 | 127,134 | 跳过插入 |
| webContents 销毁/任务被抢 | 99 | 终止逐字插入 |
| 无焦点窗口 | 193-194,235-236 | 不动作 |

- 失败后状态：`clipboard.readText`/`insertText` 无 try/catch（同步 API，异常上抛 Electron 层）；粘贴任务可重复发起（幂等）。
- 恢复：不适用（无持久状态）。

## 7. 权限与权威状态

无 sender/role 权限分支，依据：菜单对所有 Profer WebContents 一致生效（`web-contents-created` 全量挂载）。能力开关来自 `editFlags`（Electron 提供的 canUndo/canPaste 等，`:36-61`）；`pasteLikeHuman` 语义上规避前端粘贴检测（`:65` 注释），属产品行为设定而非权限逻辑。

## 8. 修改影响面

- 改模板影响全部 WebContents 的右键体验；改 `menu:close-tab` 通道需同步 `preload/index.ts:3758-3759` 与渲染层关闭逻辑。
- 改 sanitize 影响粘贴误发送防护（`menu.test.ts` 16 断言锁定行为）。
- 改 `DEFAULT_MAIN_WINDOW_ZOOM_FACTOR` 语义影响视图菜单重置（与 mac-traffic-light 共享常量）。

## 9. 测试证据

直接测试：`apps/electron/src/main/menu.test.ts` —— 2 describe/10 test/16 expect（详见该测试手册）：模板分支矩阵（可编辑粘贴/非编辑单复制/非编辑空选区 `[]`/darwin pasteAndMatchStyle/actions 注入/不可粘贴禁用/无 actions 不追加）+ sanitize 三步（换行折叠/控制字符剔除保 tab/纯空白空串）。**未测**：`createApplicationMenu`、`installTextContextMenus`、`pasteLikeHuman`（检索 `menu.test.ts` 全文 0 引用）。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI。测试断言仅指静态读到的 expect 行。

缺口（静态判断）：应用菜单结构、popup 归属窗口、逐字节节奏无自动化断言。维护者验证：右键三场景 + 粘贴两项 + Cmd/Ctrl+W + CmdOrCtrl+0。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 个导出 | 已证实 | `grep -c '^export'`=6，`:4,10,23,80,114,152` |
| 模板分支矩阵（非编辑 [] /单复制/darwin 项） | 已证实 | `:30-61` + 测试 `:39-69` |
| sanitize 三步（保 tab） | 已证实 | `:80-85` + 测试 `:116-128` |
| 逐字插入任务号打断机制 | 已证实 | `:94-99` |
| `menu:close-tab` 链（菜单→preload） | 已证实 | `menu.ts:195`、`preload/index.ts:3758-3759` |
| createApplicationMenu/installTextContextMenus/pasteLikeHuman 无测试 | 已证实（检索 menu.test.ts 全文） | 0 引用 |
| 真实菜单/焦点表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `createTextContextMenuTemplate` 矩阵 | §3.1 | 23-63 | covered |
| `sanitizeClipboardTextForInsertion` | §3.2 | 80-85 | covered |
| `pasteLikeHuman` | §3.3 | 93-109 | covered |
| `installTextContextMenus` | §3.4 | 114-150 | covered |
| `createApplicationMenu` | §3.5 | 152-282 | covered |
| 测试 | §9 | — | partial（3 函数未测） |
