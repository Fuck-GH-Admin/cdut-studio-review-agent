---
path: apps/electron/src/main/lib/cslab/cslab-uri.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3a90d4aae74f3749e30f331d01b99dafe99a1f14
sha256: 537ede67c441f024d075781e26b08268e212207206ba564f9b34c0585eed605e
lines: 45
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-uri.ts

## 1. 结论与边界

CSLab **全局 URI 工具**（纯函数）：格式 `cdut://{labId}/{layerType}/{entityUuid}[#anchor]`（`apps/electron/src/main/lib/cslab/cslab-uri.ts:1-5`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/说明 |
| --- | --- | --- | --- |
| `CsLabParsedUri` | 接口 | 9-14 | `{labId, layerType, entityUuid, anchor?}` |
| `buildCsLabUri` | 函数 | 16-24 | 拼 URI（anchor 可选 `#` 拼接） |
| `parseCsLabUri` | 函数 | 26-40 | 解析；非 cdut:// 或 <3 段或空段→null；`layerType` 经 `as CsLabLayerType` 断言（`:36`，不校验取值） |
| `buildCapsulePlaceholder` | 函数 | 43-45 | 胶囊占位符 `{{capsule:{tableUri}#{column}:{rowIndex}}}`（拖到外部编辑器可辨认，`:42` 注释） |

出向：`@profer/shared` 类型。

## 3. 内部逻辑

`parseCsLabUri`：scheme 校验→`#` 切 anchor（`split('#',2)`）→`/` 切段（filter(Boolean)）→3 段解构+空段校验（`:27-39`）。

## 4. 调用者与调用链

入向：CSLab 胶囊/手稿模块（cslab-capsule 等非本批，经 index re-export）。出向：shared 类型。

## 5-7. I/O/分支/权限

无 I/O；分支=解析失败四路径返 null。

## 8. 修改影响面

URI 格式变更影响胶囊/链接双侧。

## 9. 测试证据

无专属测试（glob `**/cslab-uri*test*` 零命中）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出+解析分支 | 已证实 | `:1-45` |
| 消费方 | 推断 | index re-export 面 |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出 | §2 | covered |
| 测试/运行 | §9/§10 | unknown（NOT_RUN） |
