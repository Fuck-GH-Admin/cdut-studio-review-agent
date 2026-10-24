---
path: apps/electron/src/main/lib/screenshot-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 300c29fd52ef04719041f6bc2d9c6ea96d3c38a8
sha256: 8486955fd691a7d6da8b94ee7cdcb64c5b75eb10de02208cf6a3e72547196be0
lines: 369
kind: source
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/screenshot-service.ts

## 1. 结论与边界

**截图导出服务**（369 行）：隐藏离屏 BrowserWindow（`offscreen`）加载临时 HTML（CSP `script-src 'none'`+片段消毒）→ `capturePage` 截图；长文档分段截取（≤4000px/段，参考屏幕工作区）经 pngjs 纵向拼接；输出到剪贴板或保存对话框。

边界：HTML 内容由渲染端提供（MarkdownEditor 导出）；`SCREENSHOT_LIMITS`（shared）为预算契约；不负责图片落盘位置以外的导出链。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ScreenshotInput` | 导出接口 | 296-305 | `{html, isDark, width?, mode:'clipboard'\|'file', css?, themeClass?}` | |
| `ScreenshotResult` | 导出接口 | 307-311 | `{success, message, filePath?}` | |
| `captureScreenshot` | 导出函数 | 313-369 | `(input) => Promise<ScreenshotResult>` | 唯一入口（串行锁内） |
| `getScreenshotWindow` | 内部函数 | 61-89 | 离屏窗口单例（按 scale） | |
| `withLock` | 内部函数 | 95-102 | Promise 链串行锁 | 防并发截图 |
| `resolveScreenshotScale`/`assertScreenshotBudget` | 内部函数 | 117-132 | 像素预算 | |
| `stitchScreenshotSegments` | 内部函数 | 134-160 | pngjs 纵向拼接 | |
| `sanitizeScreenshotFragment`/`buildScreenshotHtml` | 内部函数 | 164-203 | 消毒+CSP HTML | |
| `loadScreenshotDocument`/`captureLoadedDocument`/`screenshotCapture` | 内部函数 | 207-292 | 加载/分段截取/临时文件 | |
| 常量 | 内部 | 17-34 | scale 候选 `[4,3,2,1.5,1]`、`MAX_SEGMENT=4000`、`SEGMENT_MARGIN=96`、`RESOURCE_TIMEOUT=5000`、`PADDING_X=48`、`PADDING_TOP=24`、`IDLE_TTL=5min` | |

导出计数：`export` 3 条（`:296`、`:307`、`:313`），与源码一致。

## 3. 内部逻辑与关键流程

- **captureScreenshot**（`:313-369`，`withLock` 串行）：入参校验（html/css ≤ `MAX_HTML_BYTES`、width 有限、mode 二值，`:317-328`）；内容宽度 clamp `[MIN_WIDTH, MAX_WIDTH]` + 左右 `PADDING_X*2`（注释 `:329-330`：gutter 叠加不压缩内容）；`buildScreenshotHtml` 后再验总量（`:334`）；`screenshotCapture` → clipboard（`nativeImage.createFromBuffer`+`clipboard.writeImage`）或保存对话框（默认 `~/Desktop/profer-<ts>.png`，取消返回 `已取消保存`，`:345-360`）；catch 返回 `{success:false, message}`；finally `scheduleIdleDestroy()`。
- **安全 HTML**（`:164-203`）：`sanitizeScreenshotFragment` 去 `<script>`/`iframe|object|embed|base|form`/`meta refresh`/`on*` 属性（纵深防御，注释 `:165`：CSP 为主）；`safeCss` 转义 `</style>` 变体（`:178`）；`safeThemeClass` 去引号尖括号（`:179`）；CSP `default-src 'none'; script-src 'none'; img/media/font 放行 self/data/blob/cdut-file:/cdut-skin:/http(s)`（`:184`）。
- **离屏窗口**（`:61-89`）：单例按 `deviceScaleFactor` 复用；`webPreferences` 全锁（contextIsolation/sandbox/webSecurity 等，`:77-86`；注释：Electron ≥40 offscreen 对象类型，39-43 已验证，升级后白屏/崩溃优先查此）；`before-quit` 清理（`ensureAppQuitHook`，`:53-59`）；空闲 5min 自动销毁（`:48-51`）。
- **加载**（`:207-237`）：`loadURL(pathToFileURL)` 后 `executeJavaScript` 等字体/图片（5s 超时兜底 `SCREENSHOT_RESOURCE_TIMEOUT_MS`，`:222-225`）；100ms 沉降后取 `max(scrollHeight…)` 为总高（无效抛「截图内容高度无效」，`:233-235`）。
- **截取**（`:239-269`）：`assertScreenshotBudget`（`width*height*scale² > MAX_PIXELS` 抛「文档过长…」，`:124-132`）；单段（≤`resolveMaxSegmentHeight()`=min(4000, 屏幕工作区高-96)，`:106-115`）一次 `capturePage`；超长分段循环 scrollTo+`capturePage`+`PNG.sync.read`（`:253-266`）→ `stitchScreenshotSegments`（宽度不一致抛错，`:139-149`）。
- **scale**（`:117-122`）：候选 `[4,3,2,1.5,1]` 中首个满足 `w*h*scale² ≤ MAX_PIXELS`；全不满足返回 0 → 「文档过长」（`:279-281`）。scale≠1 时重建窗口重载（`:283-286`）。
- **withLock**（`:95-102`）：Promise 链串行；前锁 rejected 也 `.catch` 吞掉保证推进（注释 `:99-100`）。
- 临时 HTML 写 `tmpdir()/profer-ss-<ts>.html`，finally unlink（`:272-291`）。

## 4. 调用者与调用链

- 入向（全冻结树 `grep screenshot-service|captureScreenshot`，apps+packages 全类型）：
  - `apps/electron/src/main/ipc.ts:1518-1524` `IPC_CHANNELS.SCREENSHOT_CAPTURE` handler 动态 import `captureScreenshot`。
  - 渲染：`MarkdownEditorToolbar.tsx`（导出图片）经 preload（`preload/index.ts`）；`packages/shared/src/types/runtime.ts` 通道类型。
  - 相关但非本函数消费：`pi-builtin-tools`/`browser-controller`/`agent-orchestrator` 等（截图工具链域外，命名交叉）。
- 出向：`electron`（BrowserWindow/clipboard/dialog/nativeImage/screen）、`pngjs`、`node:fs/path/os/url`、`@profer/shared.SCREENSHOT_LIMITS`（`:9-15`）。

## 5. 数据 I/O、读写与副作用

- 磁盘写：临时 HTML（`tmpdir`）；file 模式写用户选择路径（`.png`）。删除：临时文件 finally 清理。
- 副作用：离屏 BrowserWindow 创建/销毁；剪贴板写入（clipboard 模式）；原生保存对话框；console 日志。

## 6. 分支、失败、取消与恢复

- 入参/预算/高度非法：throw → catch 转 `{success:false, message}`（中文文案，`:361-364`）。
- 取消保存：`canceled` → `{success:false, message:'已取消保存'}`（`:355-357`）。
- 并发：`withLock` 串行；窗口按 scale 复用，scale 变更销毁重建（`:68-70`）。
- 恢复：无持久状态；窗口空闲 5min 自动销毁 + before-quit 清理（防残留）。

## 7. 权限与权威状态

- 无 sender/role 检查（IPC handler 直通，`ipc.ts:1518`）；渲染端可提交任意 HTML 片段——**安全边界=CSP `script-src 'none'` + 消毒正则**（`:164-184`），不执行脚本、不联网（`connect-src 'none'`）。
- 权威状态：`SCREENSHOT_LIMITS`（shared）为预算契约；截图内容忠实渲染传入 HTML。

## 8. 修改影响面

- IPC `SCREENSHOT_CAPTURE` + MarkdownEditorToolbar 导出链；`SCREENSHOT_LIMITS` 与 `pngjs` 依赖。
- Electron 升级敏感点：offscreen 对象类型（`:84-85` 注释）。
- 测试：无专属测试（检索范围：冻结树 `*.test.ts(x)` 引用 0 命中）。

## 9. 测试证据

- 直接测试：**无**（全冻结树 `*.test.ts(x)` 引用检索 0 命中）。
- 间接证据：无。
- 未覆盖：分段拼接、scale 选择、消毒正则、预算抛错、剪贴板/保存分支。
- `NOT_RUN`：未运行 bun test/产品测试/typecheck/build/GUI/真实截图；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出与全链流程 | 已证实 | `:296-369` |
| CSP script-src 'none'+片段消毒 | 已证实 | `:164-184` |
| 分段 4000px/工作区-96 与拼接校验 | 已证实 | `:106-160`、`:253-268` |
| 像素预算三处（scale/预算/总量） | 已证实 | `:117-132`、`:334` |
| 串行锁+空闲销毁+before-quit 清理 | 已证实 | `:95-102`、`:48-59` |
| offscreen Electron 版本敏感点 | 已证实 | `:84-85` 注释 |
| 无专属测试 | 已证实 | 全冻结树检索（§9 范围） |
| 真实截图/拼接表现 | 未知 | NOT_RUN |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `captureScreenshot` 校验/输出 | §3 | 313-369 | covered |
| 消毒+CSP HTML | §3/§7 | 164-203 | covered |
| 离屏窗口单例/清理 | §3 | 36-89 | covered |
| 加载/等待/高度 | §3 | 207-237 | covered |
| 分段截取/拼接/scale | §3 | 117-160,239-292 | covered |
| 真实截图行为 | §10 | — | unknown（NOT_RUN） |
