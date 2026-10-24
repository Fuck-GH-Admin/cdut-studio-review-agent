---
path: apps/electron/src/main/lib/agent-image-output-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bfca1acd7dee886731d5b075ea93471fa864cd2a
sha256: 606d86832d6c6eca95f0094a93f98ade57a0de9fcb3155dfce79591a6444a6fc
lines: 131
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-image-output-service.ts

## 1. 结论与边界

Agent 图片输出服务：**共享路径安全边界**（:70 注释）——授权目录内读图（realpath+isWithinRoot+20MiB 上限+魔数校验）、落盘到会话 `.context/agent-output-images/`（UUID 文件名、`wx` 独占写）、安全复制本地图片。

## 2. 导出与关键符号

导出 9 条（`export` :6/:8/:15/:17/:30/:55/:71/:96/:125）：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `MAX_AGENT_IMAGE_OUTPUT_SIZE` | `:6` | 20MiB |
| `AgentImageOutputContext` | `:8-13` | `{agentCwd, allowedRoots}` |
| `AgentImageMediaType` | `:15` | png/jpeg/gif/webp |
| `AgentImageOutputResult`/`AuthorizedAgentImage` | `:17-35` | 结果形状 |
| `detectAgentImage(buffer)` | `:55-63` | 四格式魔数识别（PNG 8 字节/JPEG FF D8 FF/GIF87a-89a/RIFF..WEBP） |
| `readAuthorizedAgentImage(path, context)` | `:71-93` | 授权读（见 §3） |
| `writeAgentImageOutput(data, mediaType, context, filename?)` | `:96-122` | 落盘（见 §3） |
| `sendAgentLocalImage(input, context)` | `:125-131` | 读授权图→复制落盘 |

内部：`isWithinRoot`（:42-46，`relative` 防 `..`）、`realDirectory`（:48-53）、`displayFilename`（:65-68，剥控制字符）。

## 3. 内部逻辑与关键流程

`readAuthorizedAgentImage`（:71-93）校验链：路径非空（:73）→agentCwd 非空（:74）→realpath 解析（:77）→必须普通文件（:79）→agentCwd+allowedRoots 全 realpath（:81-84）→源必须在授权根内（:85，`isWithinRoot`）→大小 20MiB 双检（:86/:89）→魔数校验（:90-91）。`writeAgentImageOutput`（:96-122）：内容-声明类型一致（:105）→输出目录 realpath 防逃逸（:110-111）→UUID+`wx` 独占写（:112-113）→relativePath 统一 `/`（:116）。

## 4. 调用者与调用链

入向（子agent 交叉核）：`agent-image-output-tools.ts:1`、`agent-gpt-image-service.ts:3-8`（readAuthorizedAgentImage :113/writeAgentImageOutput :124）、`agent-image-generation-records.ts:6`（type）、`agent-skin-tools.ts:14`、`image-url-resolver.ts:17`（detectAgentImage）、`adapters/pi-builtin-tools.ts:101`（sendAgentLocalImage）；测试 `agent-image-output-service.test.ts:5`。出向：`node:crypto`/`node:fs/promises`/`node:path`（无内部模块）。

## 5. 数据 I/O、读写与副作用

读授权图片文件；写 `.context/agent-output-images/<uuid>`；mkdir 输出目录。无网络。

## 6. 分支、失败、取消与恢复

各校验失败即 throw 明确消息（§3）；不适用取消/恢复（async 无 AbortSignal 参数）。

## 7. 权限与权威状态

路径安全权威：realpath+isWithinRoot 防符号链接逃逸（测试 :97-112 断言）；媒体类型以魔数为准（:90-91/:103-105）。

## 8. 修改影响面

图片工具链（output-tools/gpt-image-service/skin-tools/image-url-resolver/pi-builtin-tools）；需同步测试 `agent-image-output-service.test.ts`（7 用例）。

## 9. 测试证据

`agent-image-output-service.test.ts`（批内，1 describe/7 用例，NOT_RUN）：授权 PNG 复制+结构化返回（无 marker :42）、会话 cwd 免授权（:50-58）、相对路径按 cwd 解析（:60-70）、越权拒绝且不落盘（:72-79）、伪 PNG 拒（:81-87）、超 20MiB 拒（:89-95）、symlink 逃逸拒（:97-112，EPERM 平台跳过 :105-107）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 9 条；路径安全边界 | 已证实 | :42-93 |
| symlink 逃逸防护 | 已证实 | :77/:85；测试 :97-112 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| readAuthorizedAgentImage/writeAgentImageOutput/sendAgentLocalImage | §2/§3 | :71-131 | covered |
| detectAgentImage 四格式 | §2 | :55-63 | covered |
| 测试 | §9 | — | covered（NOT_RUN） |
