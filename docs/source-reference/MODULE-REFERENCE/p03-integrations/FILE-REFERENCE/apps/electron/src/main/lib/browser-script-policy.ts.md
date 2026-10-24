---
path: apps/electron/src/main/lib/browser-script-policy.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: af2552ed6568fa2ba9589434eb707d0aa9a9d87e
sha256: a506c23fb73f6844a4b89b1658c5e203f7c04077775a74c5f4e5ce354d4f8631
lines: 137
kind: source
package: p03-integrations
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/browser-script-policy.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

页面脚本/DOM 操作的安全边界（137 行）：脚本长度上限；DOM 操作「固定函数体+参数 JSON 序列化」（注释 :92-93「避免 selector/text 被解释成代码」）；fill 回读用固定函数（不把页面文本拼为代码，:34 注释）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `MAX_BROWSER_SCRIPT_CHARS`/`MAX_BROWSER_DOM_SELECTOR_CHARS`/`MAX_BROWSER_DOM_TEXT_CHARS` | const | 1-3 | 20000/1000/10000 |
| `BROWSER_DOM_ACTIONS`/`BrowserDomAction` | const/type | 5-6 | focus/fill/click/inspect |
| `BrowserDomActionInput` | interface | 8-12 | action/selector/text? |
| `assertBrowserScript` | fn | 14-17 | 非空+长度 |
| `assertBrowserDomAction` | fn | 19-27 | 动作白名单+selector/text 校验 |
| `BUILD_READ_ELEMENT_VALUE_FUNCTION` | const | 31-37 | 固定读值函数体 |
| `BUILD_WRITE_ELEMENT_VALUE_FUNCTION` | const | 45-65 | 固定写值函数体（原型 setter+input/change 派发） |
| `normalizeFilledText` | fn | 70-72 | 空白归一比较 |
| `buildBrowserDomActionExpression` | fn | 78-137 | 生成固定 DOM 操作表达式 |

## 3. 内部逻辑与关键流程

`buildBrowserDomActionExpression`（:78-137）：`assertBrowserDomAction` 前置→`JSON.stringify(input)`（转义 \u2028/\u2029）内嵌为数据→shadow DOM 递归查找→`scrollIntoView`→inspect/focus/click 固定分支→fill 仅限 input/textarea/contenteditable、原型 setter 写值+`InputEvent('input')`/`change` 派发（rich-text 注释 :90-91）。写值函数体（:45-65）text 作为 arg 序列化传入非代码。

## 4. 调用者与调用链

入向（生产）：`browser-controller.ts:22`（domAction/evaluate/readElementValue/writeElementValue）。出向：纯函数。

## 5. 数据 I/O、读写与副作用

无（表达式生成；执行在 controller/CDP 侧）。

## 6. 分支、失败、取消与恢复

四类 throw（空脚本/超长/非法动作/缺 text）；表达式内失败返回 `{ok:false,error}` 不抛。

## 7. 权限与权威状态

- 代码注入边界：selector/text **只作数据**传入（:92-93）；固定函数体不拼页面文本（:34）。
- 动作白名单：仅 focus/fill/click/inspect（:5）。
- 无 sender/role 检查。

## 8. 修改影响面

Agent DOM 操作/fill 回读降级。无专属测试文件。

## 9. 测试证据

直接测试：无独立文件；经 controller domAction/fill 路径间接。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 导出/内部符号/行号 | 已证实 | 逐行核对 |
| 参数数据化/固定函数体语义 | 已证实 | :34/:45-65/:78-137 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `assertBrowserScript`/`assertBrowserDomAction` | §3 | 14-27 | covered（未测） |
| 两个固定函数体 | §2 | 31-65 | covered（未测） |
| `buildBrowserDomActionExpression` | §3 | 78-137 | covered（未测） |
