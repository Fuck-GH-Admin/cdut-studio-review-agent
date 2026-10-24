---
path: apps/electron/src/main/lib/agent-skin-tools.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 40996ee466051233658203e9582aecdb51087df0
sha256: ed28ba12915e284c6f7d0ae8e2dad83f54687b4703374349ebdaba7669438fe0
lines: 349
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-skin-tools.ts

## 1. 结论与边界

`create_skin` MCP 工具（Claude in-process 注册、Pi 经 buildPiAgentSkinTools）：从 manifest+完整 skin.css+授权壁纸创建安装用户皮肤。校验/安装/库刷新全在工具内，返回确定性 `installedPath`（:283-285 注释：防模型用 find 递归搜索触 macOS TCC 弹窗）。仅用户明确要求时使用（:306 描述）。

## 2. 导出与关键符号

导出 5 条（`export` :95/:108/:305/:306/:310）：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `PreviewImageSource` | `:95-100` | 缩略图源最小接口（刻意不用 Electron NativeImage，注释 :92-94：单测可注入替身） |
| `derivePreviewImage(image)` | `:108-119` | 等比缩放 ≤1200px 宽（:54）→JPEG 82 质量；>2MB/空/异常→undefined（:114-118） |
| `AGENT_SKIN_TOOL_NAME='create_skin'` | `:305` | |
| `AGENT_SKIN_TOOL_DESCRIPTION` | `:306` | 含「不要事后 find/ls 搜索」约束 |
| `buildPiAgentSkinTools(sdk, context)` | `:310-349` | 工具注册（缺 agentCwd/workspaceSlug 返 [] :314；TypeBox 参数 :320-337） |

内部：常量（ID_RE kebab-case :47、CSS 512KB/assets 4MB/包 5MB/预览 2MB :48-52）、`safeAssetFilename`（:138-157，扩展名与真实媒体一致 :142-144、Windows 保留名拦截 :153-155）、`validateCssInput`（:159-169，:root 必含/512KB/壁纸引用/禁外链 file: data: ../ :166-168）、`broadcastSkinChanged`（:171-175）、`applySkinToAllWindows`（:177-185，themeMode 'special'+标题栏刷新）、`createSkin`（:187-303，见 §3）、`derivePreviewFromWallpaper`（:128-135，失败不阻断安装 :132）。

## 3. 内部逻辑与关键流程

`createSkin`（:187-303）校验链：id kebab+非保留名（:192-195）→名称非空→目标目录 isInside（:200）→壁纸走 `readAuthorizedAgentImage`（授权边界 :206-209）+4MB（:213）→缩略图显式/壁纸派生兜底（:221-235，注释 :216-218：不接受自定义命名防 PREVIEW_RE 错配）→CSS 校验（:238）→manifest 组装（previewScale>0 才写 :255，口径与解析层一致 :253-254）→包 5MB（:260）→**staging 临时目录写入→installSkinFromFolder 唯一安全校验+原子安装**（:262-278，注释：replace 失败不破坏原皮肤）→广播+可选应用（apply!==false :281-282）→tildePath 返回确定性路径（:285）→finally 清理 staging（:300-302）。

## 4. 调用者与调用链

入向（子agent 交叉核）：生产唯一 `lib/adapters/pi-builtin-tools.ts:120` → 调用 `:2080`（`tools.push(...buildPiAgentSkinTools(sdk, ctx))`）；注册链 orchestrator:183→:1665→pi-builtin-tools:2046/:2080。否定：`PreviewImageSource`/`derivePreviewImage`/`AGENT_SKIN_TOOL_NAME/DESCRIPTION` 无外部消费者；无 agent-skin-tools.test.ts（ls 确认）。出向：electron（BrowserWindow/nativeImage :4）、typebox、`./skin-service`（getUserSkinDir :198）、`./skin-manager-service`（installSkinFromFolder :278）、`./skin-name-guards`（:153/:193）、`./settings-service`（updateSettings :178）、`./titlebar-overlay`（:182）、`./agent-image-output-service`（readAuthorizedAgentImage :206/:222）。

## 5. 数据 I/O、读写与副作用

staging 临时目录写+`installSkinFromFolder` 安装；广播 IPC；apply 时改设置+全窗刷新。无网络。

## 6. 分支、失败、取消与恢复

校验链全 throw→jsonError（:344-346）；派生失败降级（:132）；finally 清理（:300-302）。不适用取消/恢复。

## 7. 权限与权威状态

授权边界（readAuthorizedAgentImage）；禁外链 CSS（:166-168）；Windows 保留名拦截；确定性 installedPath 防搜索（:283-285）。

## 8. 修改影响面

pi-builtin-tools 注册面+皮肤库。无直接测试（否定已证；间接 pi-builtin-tools.test 覆盖注册）。

## 9. 测试证据

无直接测试文件（ls 确认）；间接 `adapters/pi-builtin-tools.test.ts:52/:202/:281-610`。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 5 条；校验链+原子安装 | 已证实 | :159-303 |
| 确定性路径防搜索 | 已证实 | :283-285 |
| 无直接测试 | 已证实（否定） | ls+全树检索（§4） |
| installSkinFromFolder 内部 | 未知（批外） | :278 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 导出+createSkin 校验链 | §2/§3 | :47-349 | covered |
| 测试 | §9 | — | unknown |
