---
path: packages/core/src/pdf-engine/onnx-adapter.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7be5f58033787f87293710e4843dfc1b9e1d6813
sha256: 1acc0f0a71d496b30dcf4742127a082123fd338380fff6fcc928af4233fccf0e
lines: 118
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/core/src/pdf-engine/onnx-adapter.ts

## 1. 结论与边界

ONNX Runtime 紧凑版面模型加载器（CPU/DirectML 优雅保底）：模型/运行时缺失时 **100% 平滑保底**——返回不可用实例，不抛错、不阻塞、不伪造预测（`onnx-adapter.ts:1-9`）。**预留未接线**：`createOnnxLayoutAdapter` 全树无生产调用者（grep 全冻结树，见 §10）。

## 2. 导出与关键符号

`export` 逐条核：3 个导出（2 接口 + 1 函数）+ 2 个私有类 + 3 个内部接口。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `LayoutModelPort` | 导出接口 | `:12` | `available`/`unavailableReason?`/`predictLayout(image,size): Promise<Record<string,unknown>\|null>` | 推理端口；不可用返 null 由调用方回落（`:17-18`） |
| `OnnxAdapterOptions` | 导出接口 | `:26` | `modelPath?`/`executionProviders?` | 模型路径缺省=未就绪（`:27`） |
| `createOnnxLayoutAdapter` | 导出函数 | `:93` | `(options?): Promise<LayoutModelPort>` | 三段探测工厂 |
| `UnavailableLayoutModel`（私有类） | 类 | `:49` | `available=false` + reason | `predictLayout` 恒返 null（`:57-59`） |
| `OnnxLayoutModel`（私有类） | 类 | `:63` | 已加载会话 | 见 §3 |
| `OrtTensor`/`OrtSession`/`OrtModule`（内部） | 接口 | `:33,:38,:42` | onnxruntime 最小结构 | |

## 3. 内部逻辑与关键流程

- `OnnxLayoutModel.predictLayout`（`:71-85`）：feeds 用通用名 `'input'`（`:77-80`）；**实例属性注入 hack**：`(this as …).ort` 读取 ort 引用（`:78`，由工厂在 `:111` 注入），有 `ort.Tensor` 时构造 `new Tensor('uint8', image, [1,3,h,w])`（`:80`），否则裸传 image（`:82`）；形状不符由运行时抛错、调用方捕获回落（注释 `:75-76`）。
- `createOnnxLayoutAdapter`（`:93-118`）三段探测，任一失败返回 `UnavailableLayoutModel`（**不抛**）：
  1. 无 `modelPath` → '未配置 ONNX 版面模型路径（引擎使用纯 TS 几何分段）'（`:94-96`）；
  2. `import('onnxruntime-node')` 失败（非字面量 specifier，`:100-101`）→ 'onnxruntime-node 未安装…'（`:102-104`）；
  3. `InferenceSession.create(modelPath,{executionProviders ?? ['cpu']})` 失败（`:106-109`）→ 带错误消息 reason（`:113-116`）。

## 4. 调用者与调用链

- 入向：**无生产调用者**（否定结论，检索=全冻结树 `*.ts` grep `createOnnxLayoutAdapter`，仅 `pdf-engine/index.ts:16` 再导出命中）。预留端口。
- 出向：运行时动态 import `onnxruntime-node`（`:100-101`，可缺）。
- 测试：无（检索=全树 `*.test.ts`，0 命中）。

## 5. 数据 I/O、读写与副作用

读模型文件（`InferenceSession.create`，仅在显式配置 modelPath 时）；无其它 I/O；无全局状态（ort 引用挂在实例上，`:111`）。

## 6. 分支、失败、取消与恢复

三段探测全走"返不可用实例"降级（§3）；无抛错路径、无取消。

## 7. 权限与权威状态

无权限分支，依据：预留端口，无 sender/路径检查（modelPath 由调用方给定）。

## 8. 修改影响面

当前无消费方（预留态）；接入后影响版面切分路径（替代/辅助 native-segmenter）。`executionProviders` 透传 onnxruntime（DirectML 等）。

## 9. 测试证据

`NOT_RUN`。直接/间接测试均无（检索范围如 §4）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三段探测降级语义、不抛错 | 已证实 | `:93-118` |
| ort 属性注入 hack、feeds 'input'、`uint8 [1,3,h,w]` 与裸字节形状约定 | 已证实 | `:75-83,111` |
| 全树无生产调用者（预留） | 已证实（否定结论） | grep 全冻结树 `*.ts` |
| 真实模型加载/推理行为 | 未知 | NOT_RUN，未接线 |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 导出 + 2 类 + 3 接口 | §2 | 12-69 | covered |
| 探测/推理流程 | §3 | 71-118 | covered |
| 预留未接线 | §4/§10 | — | covered |
