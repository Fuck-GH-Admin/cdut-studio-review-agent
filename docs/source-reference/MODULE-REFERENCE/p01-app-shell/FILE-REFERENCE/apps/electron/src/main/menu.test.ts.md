---
path: apps/electron/src/main/menu.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b6f59359e7c44401869c1b90188bdae691603fbb
sha256: c820bb6e520c11e30bc8b76b79e3ee194889078ca458f7cdf5c1a9e82c95345f
lines: 130
kind: test
package: p01-app-shell
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/main/menu.test.ts

## 1. 测试目标

`menu.ts` 的两个纯函数：①`createTextContextMenuTemplate` 右键模板分支矩阵（编辑能力/选区/平台/动作注入）；②`sanitizeClipboardTextForInsertion` 防误发送安全化（换行折叠/控制字符剔除/空白）。Bun test，纯参数调用（无 Electron 运行时/mock 库）。

## 2. 用例清单

2 个 describe、10 个 `test(`（与源码 `test(` 出现次数一致：`:23,39,52,56,71,93,105` + `:116,121,126`）。

| # | 用例 | 行 | 设置 | 动作 | 断言（见 §3） |
| --- | --- | --- | --- | --- | --- |
| 1 | 可编辑输入框+可粘贴→显示且启用粘贴菜单 | 23-37 | isEditable, canPaste/canSelectAll, 'win32' | 找 `role==='paste'` | 1 toMatchObject |
| 2 | 普通页面有选区→只提供复制 | 39-50 | selectionText, canCopy, 'win32' | 全模板 toEqual | 1 toEqual |
| 3 | 非编辑无选区→不创建菜单 | 52-54 | 默认 params, 'win32' | toEqual([]) | 1 toEqual |
| 4 | macOS 可编辑→提供粘贴并匹配样式 | 56-69 | isEditable, canPaste, 'darwin' | 找 pasteAndMatchStyle | 1 toMatchObject |
| 5 | 可编辑+注入动作→两个自定义粘贴项 | 71-91 | isEditable, canPaste, 'win32', actions | 找两 label | 2 toMatchObject |
| 6 | 可编辑但不可粘贴→两个自定义粘贴项禁用 | 93-103 | isEditable（canPaste=false）, actions | 读两 enabled | 2 toBe(false) |
| 7 | 未注入动作→不追加自定义粘贴项 | 105-112 | isEditable, 'win32' 无 actions | 找两 label | 2 toBeUndefined |
| 8 | 含换行文本→折叠为单空格 | 116-119 | 3 行文本/代码两行 | sanitize | 2 toBe |
| 9 | 含 C0 控制字符→剔除且保留制表符 | 121-124 | `\u0000/\u0007` 与 `\t` | sanitize | 2 toBe |
| 10 | 纯空白→空串 | 126-129 | `'  \n\r\n  '`/`''` | sanitize | 2 toBe |

用例间无依赖顺序；`makeParams` 工厂（`:4-20`）提供 editFlags 全 false 基线再覆写。

## 3. 真实断言

共 16 条 `expect(`：

- `apps/electron/src/main/menu.test.ts:33-36`：`expect(template.find((item) => item.role === 'paste')).toMatchObject({ label: '粘贴', enabled: true })`
- `:49`：`expect(template).toEqual([{ role: 'copy', label: '复制', enabled: true }])`
- `:53`：`expect(createTextContextMenuTemplate(makeParams(), 'win32')).toEqual([])`
- `:65-68`：`expect(...find((item) => item.role === 'pasteAndMatchStyle')).toMatchObject({ label: '粘贴并匹配样式', enabled: true })`
- `:83-86`：`expect(...find((item) => item.label === '粘贴为纯文本')).toMatchObject({ label: '粘贴为纯文本', enabled: true })`
- `:87-90`：`expect(...find((item) => item.label === '像输入一样粘贴')).toMatchObject({ label: '像输入一样粘贴', enabled: true })`
- `:101`：`expect(template.find((item) => item.label === '粘贴为纯文本')?.enabled).toBe(false)`
- `:102`：`expect(template.find((item) => item.label === '像输入一样粘贴')?.enabled).toBe(false)`
- `:110`：`expect(template.find((item) => item.label === '粘贴为纯文本')).toBeUndefined()`
- `:111`：`expect(template.find((item) => item.label === '像输入一样粘贴')).toBeUndefined()`
- `:117`：`expect(sanitizeClipboardTextForInsertion('第一行\n第二行\r\n第三行')).toBe('第一行 第二行 第三行')`
- `:118`：`expect(sanitizeClipboardTextForInsertion('code();\n\nnext()')).toBe('code(); next()')`
- `:122`：`expect(sanitizeClipboardTextForInsertion('a\u0000b\u0007c')).toBe('abc')`
- `:123`：`expect(sanitizeClipboardTextForInsertion('列1\t列2')).toBe('列1\t列2')`
- `:127`：`expect(sanitizeClipboardTextForInsertion('  \n\r\n  ')).toBe('')`
- `:128`：`expect(sanitizeClipboardTextForInsertion('')).toBe('')`

`NOT_RUN`：本轮未执行 Bun 测试；上述只是静态读到的断言行，不代表测试已通过。

## 4. 未覆盖与脆弱点

- 未覆盖：`createApplicationMenu`、`installTextContextMenus`、`pasteLikeHuman`（含任务号打断/18ms 节奏）；编辑矩阵中 undo/redo/cut/delete/selectAll 的 enabled 传递；`editFlags.canEditRichly`（fixture 里有但断言未用，`:16`）。
- mock 边界：无 Electron 依赖注入（模板函数纯参数化），`platform` 显式传 'win32'/'darwin' 而非真实 `process.platform`；`TextContextMenuParams` 用结构 fake（`:4-20`）。
- 脆弱点：`:49/:53` 的 `toEqual` 锁定**整组模板形状**——菜单项增删会破坏该断言（有意为之的契约锁定）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 describe/10 test/16 expect | 已证实 | 声明行 `:22,115`；`test(` 10 处；expect 逐行 §3 |
| 断言与实现分支一一对应 | 已证实 | `menu.ts:30-61,80-85` |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 用例/断言 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 编辑粘贴矩阵（4 用例） | §2,§3 | 23-69 | covered |
| actions 注入/禁用/缺省（3 用例） | §2,§3 | 71-112 | covered |
| sanitize 三步（3 用例） | §2,§3 | 116-129 | covered |
| createApplicationMenu/install/pasteLikeHuman | §4 | — | unknown（未覆盖） |
| 运行结果 | §5 | — | unknown（NOT_RUN） |
