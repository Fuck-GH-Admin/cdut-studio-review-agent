---
path: apps/electron/src/main/lib/review/tesseract-ocr-adapter.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d25d5ed931bb7503423465f5696a697ae685dd35
sha256: e00bbeb902f9e70247d75243b8a1b4e0e3dee56a579df7a88adeaa4eda2cffb6
lines: 123
kind: source
package: p05-review-engine
author: docs-r07-author-nb-47-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/tesseract-ocr-adapter.ts

## 1. 结论与边界

Tesseract.js OCR 适配（G02，头注释 :1-11）：诚实降级——依赖动态 import 探测、资源探测（vendor/tesseract），任一缺失即 `available=false`+原因（业务走 unread 不冒充已读）；输出 words→OcrBlock（bbox 归一+confidence 0-1）。识别质量需真实图文实测（注释 :10-11：结构正确性由单测保证）。

## 2. 导出与关键符号

导出 3 条（`export` :38/:57/:78）：

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `TesseractAdapterStatus` | interface | `:38-45` | `{available, reason?, dependencyLoaded, languageResourcesFound, workerResourcesFound}` |
| `probeTesseractResources` | function | `:57-63` | 探测 `chi_sim.traineddata` 与 `tesseract.wasm|worker.min.js`（三 root：:49-54 vendorRoots——config/vendor、work/vendor、resources/vendor） |
| `TesseractOcrPort` | class | `:78-123` | `implements OcrPort`；私有构造（:83-89）+ 静态 `create()`（:92-105）+ `recognize`（:107-123） |

内部符号：`TesseractWord/Page/RecognizeResult/Module`（:17-35，最小结构避免类型依赖）、`vendorRoots`（:47-54）、`probeDependency`（:65-76，动态 `import('tesseract.js')` :70，缺 `recognize` 接口→不可用）。

## 3. 内部逻辑与关键流程

`create()`（:92-105）：依赖探测+资源探测；依赖失败→`available:false`+原因（:96-97）；缺语言包→不可用+原因（:98-100）；全齐→可用（:101-103）。`recognize`（:107-123）：不可用抛 `OCR 不可用: …`（:108）；相对路径按 `getConfigDir()/review-cases/<documentVersionId>/` 拼接（:109-111）；`mod.recognize(absolute, language||'chi_sim')`（:12）；words 取 `data.data ?? data` 兼容（:113-114）；空词过滤（:116）、confidence 除 100 并夹取 [0,1]（:120）；imageWidth/Height 由块边界推得（:121-122）。

## 4. 调用者与调用链

入向：批内 `tesseract-ocr-adapter.test.ts:7`（new/create :15/:23、probe :30）。**生产消费者检索无命中**（模式=basename+符号名全树；`system-tesseract-ocr-adapter.ts:5` 与 `packages/core/src/pdf-engine/ocr-bridge.ts:27` 仅注释提及）——生产 OCR 注入链实际使用的是姊妹实现 `SystemTesseractOcrPort`（`run-async-service.ts:49/:77/:113/:184`），本类（WASM 线）当前无生产注入点。出向：`node:fs` existsSync、`node:path` join、`../config-paths` getConfigDir（:50/:108）、`./ocr-port` 类型（:78/:104/:112）、动态 `import('tesseract.js')`（:69-70）。

## 5. 数据 I/O、读写与副作用

只读：vendor 资源探测（existsSync）、图像文件（recognize 传路径给 tesseract）。副作用：动态 import 依赖（未装则捕获降级 :74-75）。

## 6. 分支、失败、取消与恢复

- 失败：依赖/语言包缺失→不可用（:96-100）；recognize 不可用→抛（:108）。
- 取消：注释 :12-13 声明 AbortSignal 轮询检查设计；但 `recognize` 签名含 `request.signal`（ocr-port :20）而实现未消费 signal（现存实现观察，见 §10）。
- 恢复：无自动恢复（状态由 create 一次性探测）。

## 7. 权限与权威状态

无权限分支；`available`/`unavailableReason` 为可用性权威（与 ocr-port 契约一致）。

## 8. 修改影响面

ocrPort 注入链（v2-executor-factory `recognizeDocumentImages` :209-283）；批内 3 用例。资源路径改动影响 electron-builder extraResources 布局。

## 9. 测试证据

`tesseract-ocr-adapter.test.ts`（批内，3 用例，NOT_RUN）：未安装时 available=false+原因+status 两标志至少一 false（:14-20）；不可用 recognize 抛 `OCR 不可用`（:22-28，条件执行 `if (!port.available)`）；资源探测两布尔（:30-34）。mock 边界：真实探测（本环境无 tesseract.js 为前提）。未覆盖：可用路径（真实识别）、recognize 输出映射、signal 轮询。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 3 条；诚实降级双探测 | 已证实 | :38-105 |
| words→OcrBlock 映射/置信度夹取 | 已证实 | :112-122 |
| `recognize` 未消费 `request.signal`（与头注释「AbortSignal 轮询检查」不一致，照实记录） | 已证实 | :107-123 无 signal 引用 |
| 生产消费者检索无命中（生产链用 SystemTesseractOcrPort） | 已证实（否定） | 全树 basename+符号检索（§4） |
| 可用路径真实识别行为 | 未知（NOT_RUN，需真实材料） | :10-11 注释 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `create()` 降级分支 | §3/§9 | :92-105 | covered |
| `recognize` 映射 | §3 | :107-123 | covered（无断言） |
| `probeTesseractResources` | §2/§9 | :57-63 | covered |
| signal 取消 | §6/§10 | :107-123 | covered（缺失，照实记录） |
| 可用路径 | §9/§10 | — | unknown |
