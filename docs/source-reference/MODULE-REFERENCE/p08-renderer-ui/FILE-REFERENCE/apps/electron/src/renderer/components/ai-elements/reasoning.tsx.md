---
path: apps/electron/src/renderer/components/ai-elements/reasoning.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 43781bd6a1d984f52c654990945f34986ccf0089
sha256: 6143ac1ffa0ea5e0206c2cdfd6ff103818107a22be3edfeaecda3735bed99a24
lines: 250
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/ai-elements/reasoning.tsx

## 1. 结论与边界

**推理/思考折叠组件**（250 行）：Collapsible 包装、streaming 自动展开、流式结束 1s 自动折叠、duration 计时、Brain 图标（`:2-12`）。简化迁移自 profer-frontend。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `Reasoning` | `:75-145` | React.memo 根组件：受控/非受控 open、duration 追踪（startTime→ceil 秒 `:103-112`）、**流式结束 1s 自动折叠一次**（`AUTO_CLOSE_DELAY=1000:56`，hasAutoClosed 防重） |
| `ReasoningTrigger` | `:165-195` | 折叠触发（默认 Brain+"思考中.../思考了 N 秒"+Chevron 旋转） |
| `ReasoningContent` | `:204-250` | Markdown 内容区（remark-gfm/math+rehype-katex、`normalizeLatexDelimiters`、**链接双分派** `:223-240`：http→openExternal、盘符/斜杠路径→systemOpenFile）；memo 比较 children |

内部：`ReasoningContext:42`+`useReasoning:45-51`（脱离容器 throw `:48`）、`defaultGetThinkingMessage:155-163`。

## 3. 内部逻辑与关键流程

状态机（根）：isStreaming→记录 startTime→结束→算 duration；defaultOpen&&!isStreaming&&!hasAutoClosed→1s 定时折叠。内容区 KaTeX 渲染+链接拦截。

## 4. 调用者与调用链

消息渲染（message.tsx 推理块）；出向 `@profer/ui`（Collapsible 族）、react-markdown 族、`@/lib/normalize-latex`、`window.electronAPI`（openExternal/systemOpenFile）。

## 5. 数据 I/O、读写与副作用

链接点击→外部打开/系统打开文件；无持久化。

## 6. 分支、失败、取消与恢复

受控/非受控双模；定时器清理；duration 外部同步（`:127-131`）。

## 7. 权限与权威状态

链接分派语义（` :229-234`）：仅 http(s) 外开、本机路径 systemOpenFile、其余不动作；`useReasoning` 契约（子组件必须在容器内）。

## 8. 修改影响面

改自动折叠/计时影响思考块交互；链接分派影响外链安全面。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件三导出/状态机/链接分派 | 已证实 | 250 行全读 |
| **边界**：systemOpenFile 接受任意绝对/相对路径（`.`/`/`/盘符）——分派面在渲染层声明，校验在主进程（不在本批） | 已证实 | `:232-234` |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；主进程校验/实效 unknown。
