---
path: apps/electron/src/main/lib/review/system-tesseract-ocr-adapter.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 030530bf18d535081f8633da97b9a6ab9570774f
sha256: 1771db682aee436c45f373f6a0f74ecc0a35e294ace4ca750d276cef58b1e8ad
lines: 133
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/system-tesseract-ocr-adapter.ts

## 1. 结论与边界

系统级 Tesseract OCR 端口（真实引擎、零新依赖，头注 :1-10）：用系统 `tesseract` CLI（`child_process.spawn`）跑 TSV 输出解析为块级 `OcrResult`；与 tesseract.js WASM 线实现同一 `OcrPort` 契约：`available` 探测不抛错、失败显式降级（材料记 unread，不冒充已读）。

边界：不随包引擎（选型说明 :8-9，打包时再评估）；不做业务判定；块级语义在消费方。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `isAbsolutePagePath` | fn | 18-23 | 跨平台绝对路径判定（POSIX/盘符/UNC，MHI-07） |
| `probeSystemTesseract` | fn | 25-27 | 探测 CLI + chi_sim 语言包（进程内缓存一次） |
| `SystemTesseractOcrPort` | class | 79-110 | `OcrPort` 实现（`create()` 工厂 + `recognize()`） |
| `parseTsv` | fn | 113-133 | TSV → 词级 OcrBlock（过滤低置信） |

内部：`cached`（:15）、`runTesseract`（:29-64）、`probeAsync`（:66-77）。

## 3. 内部逻辑与关键流程

1. **`isAbsolutePagePath`**（:18-23）：`/` 开头、`^[A-Za-z]:[\\/]` 盘符、`\\\\` UNC 三者之一为真。
2. **`runTesseract`**（:29-64）：入口先查 `signal.aborted`（`OCR 已取消` AbortError，:31-36）；`spawn('tesseract', args)`；`abort` 事件 → `SIGTERM` + AbortError（:48-53）；超时（默认识别 60s、探测 5s）→ `SIGTERM` + `OCR 超时（…ms）`（:54-57）；启动失败 → `tesseract CLI 启动失败: …`（:60）；`close` 解析 `{code,out,err}`（:61）；`finish` 保证单次 settle 并清理监听/定时器（:41-47）。
3. **探测** `probeSystemTesseract`（:25-27）缓存 `probeAsync` Promise；`probeAsync`（:66-77）：`--version` 须 exit 0 且输出含 `tesseract`（:68-69）；`--list-langs` 须 exit 0（:70-71）；须含 `chi_sim` 行（正则 `(^|\n)chi_sim(\n|$)`，:72）；任一失败返回 `{available:false, reason}`（**不抛**，:74-76）。
4. **`SystemTesseractOcrPort.create()`**（:89-91）：构造时固化探测结果（`available`/`unavailableReason`，:83-86）。
5. **`recognize`**（:93-108）：不可用 → throw `OCR 不可用: …`（:94）；输入非绝对路径 → throw `OCR 输入必须是绝对路径: …`（:95-96）；语言默认 `chi_sim`（:97）；跑 TSV（:100）；退出码非 0/空输出 → throw `tesseract 退出码 …`（:101）；`parseTsv` 无块 → throw `OCR 未识别出文本（图片可能为空或纯图形）`（:104）；`imageWidth/Height` 由块 bbox 最大右/下界推得（:105-106）。
6. **`parseTsv`**（:113-133）：首行表头定位列（:117-119）；逐词行：空文本或 `conf<30` 丢弃（:125）；`confidence` 归一到 [0,1]（:130）。

## 4. 调用者与调用链

入向（生产）：`run-async-service.ts:49`（动态 require）+ `:77` `SystemTesseractOcrPort.create()`——组装 `assembleReviewClient` 的 `ocrPort`（:33 类型消费）。测试：`system-tesseract-ocr-adapter.test.ts:5`（`probeSystemTesseract`）；`model-identity-runtime.test.ts:5`（`isAbsolutePagePath`，:52-61）。`parseTsv` 仅模块内部（:103）+ 无独立测试。出向：`node:child_process spawn`（:11）、`./ocr-port` 类型（:12）。

## 5. 数据 I/O、读写与副作用

- 子进程：`tesseract` CLI（`--version`/`--list-langs`/识别 TSV）；`SIGTERM` 杀进程（:49/:55）。
- 无磁盘写；读图片仅经 CLI 参数（绝对路径）。
- 副作用：`process.env.PATH` 由测试临时改写（非本模块行为）；探测结果进程内缓存（:15-26）。

## 6. 分支、失败、取消与恢复

- 探测失败永不抛错（`{available:false, reason}`，:66-77）；`create()` 据此固化。
- `recognize` 四类 throw（§3.5）；超时/取消 → AbortError/超时错误（:48-57），消费方降级记 unread（头注 :6）。
- 取消语义：`signal` 双检查（入口 :31 + abort 监听 :48-62），`{once:true}` 且 `finish` 清理。
- 无自动重试/恢复；探测缓存进程级单次。

## 7. 权限与权威状态

无 sender/role 分支。真实性边界：只信系统引擎输出（词级 bbox/conf）；`conf<30` 词丢弃（:125）；「OCR 未识别」不冒充已读（:104 throw 而非返回空）。

## 8. 修改影响面

- 改动影响 `run-async-service` 的 OCR 能力组装与 OCR 节点产物；`isAbsolutePagePath` 被 `recognize` 与 `model-identity-runtime.test.ts` 消费。
- `OcrPort` 契约变更需同步 `ocr-port.ts` 与 tesseract.js WASM 线。
- 同步测试：`system-tesseract-ocr-adapter.test.ts`。

## 9. 测试证据

直接测试 `system-tesseract-ocr-adapter.test.ts`（1 用例 / 1 describe；**fake CLI**：临时目录写 `#!/bin/sh` 脚本冒充 tesseract（`--version` 输出 `tesseract 5.5.0`，`--list-langs` 输出 `eng` 并 `sleep 0.05`），`PATH` 前插后调 `probeSystemTesseract`，finally 还原；NOT_RUN）：
1. `:11-23` 断言 `status` `toEqual({ available:false, reason:'系统 tesseract 缺少 chi_sim 中文语言包' })`——即探测**等待语言清单进程结束**后准确报告缺包。

间接：`model-identity-runtime.test.ts:52-61`（`isAbsolutePagePath` 7 断言：`/tmp/page.png`/`C:\`/`D:/`/UNC true；`page.png`/`./page.png`/`''` false）。
未覆盖：`recognize` 全分支（真实/fake CLI 识别）、超时/取消、`parseTsv` 独立断言、探测成功路径、`available:false` 的 `unavailableReason` 透传；NOT_RUN（不跑真实 tesseract）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出/内部符号行号如 §2 | 已证实 | 逐条 |
| 探测不抛错、缓存单次 | 已证实 | :25-27/:66-77 |
| 超时/取消杀进程 | 已证实 | :48-57 |
| 低置信词过滤、未识别 throw | 已证实 | :125/:104 |
| 生产唯一接线 run-async-service:49/:77 | 已证实 | grep |
| 真实 tesseract 识别链 | 未知 | NOT_RUN/无真实引擎测试 |
| `parseTsv` 各列容错 | 推断 | :126-129 `?? 0` 缺省 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `isAbsolutePagePath` | §3.1/§9 | 18-23 | covered（indirect 测试） |
| `probeSystemTesseract`/`probeAsync` | §3.2-3.3/§9 | 25-27/66-77 | covered（缺包路径） |
| `runTesseract`（超时/取消/启动失败） | §3.2/§6 | 29-64 | partial（未测） |
| `recognize` | §3.5 | 93-108 | unknown（未测） |
| `parseTsv` | §3.6 | 113-133 | partial（未独立测） |
