---
path: apps/electron/src/renderer/components/content-review/review-v3-t09-offline-form.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 960c863370c27174b277acc7f7a69c52def03837
sha256: ef904a10a198201cc024e34a02ebb3b5d8ef31e973e4a4b4cad7d2923f7fd23d
lines: 133
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-t09-offline-form.ts

## 1. 结论与边界

**单文件离线填写页**（`:1-4` 注释）：可随 U 盘交接；**数据完全留在本机浏览器不发网络请求**；签发包仍由 Main 生成，表单只把真实任务转成 **T09 协议规定的哈希回件**。页面明示「**回件内哈希仅用于文件完整性检查，不代表签名或身份认证**」（`:31`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `buildT09OfflineFormHtml` | function（export） | `:5-133` | `(taskJson) => HTML`（单文件表单） |

内部：任务校验（type/format 双关 `:7-10`）、`embedded` JSON 转义（**`<`→`\u003c` 阻止 `</script>` 跳出数据标签** `:12-13`）、内联脚本（canonical JSON/SHA-256/附件编码/回件构建）。

## 3. 内部逻辑与关键流程

1. 校验（`:7-11`）：type='task'+format='cdut-review-offline/1' 才通过。
2. 表单（`:33-89`）：按 task.kind 分两型——**student-reply**（补件说明+多附件 `:56-62`）/**judge-rating-reply**（逐维度评分+**N/A 仅 allowNA 维度** `:64-73`、公开反馈+内部备注 `:74-75`）。
3. 保存（`:90-130`）：crypto.subtle 门槛（无则提示换新版浏览器 `:93`）；附件限单 16MB/合计 40MB（`:98-99`）、base64+逐件 SHA-256（`:101-106`）；评分区间校验（**:113-114，未填/超区间拒或选不适用**）；回件体（`:122-125`，含 requestHash/lock/respondent）；**canonical 排序 JSON + SHA-256 hash**（`:126`）→下载 `.cdutreply`。

## 4. 调用者与调用链

入向：`ReviewV3T09OfflineSection`（nb-86 手册，签发侧）。出向：无（纯字符串生成；运行时用浏览器 crypto）。

## 5. 数据 I/O、读写与副作用

生成 HTML 字符串；运行时零网络（浏览器侧下载）。

## 6. 分支、失败、取消与恢复

校验/超限/缺 crypto 均抛→页面 message（`:129`）。不适用。

## 7. 权限与权威状态

红线：零网络（`:2`）；哈希≠签名/身份（`:31`）；N/A 受 allowNA 约束（`:69`）；评分区间硬校验（`:113`）。

## 8. 修改影响面

- 改 JSON 转义（`:12-13`）→ script 注入面（测试锁定 `</script>` 场景）。
- 改回件体/哈希口径（`:122-126`）→ T09 协议兼容性与 Main 导入校验。
- 改附件限制/编码（`:98-106`）→ 回件体积与完整性。
- 改评分校验/两型表单 → 离线填写约束。
- 测试锁定（同批 23 行测试）：见测试手册。

## 9. 测试证据

**直接测试 `review-v3-t09-offline-form.test.ts`（1 用例，NOT_RUN）**：`</script>` 标题注入被转义（断言不出现原文）、`.cdutreply` 存在、内联脚本可被 `node:vm` 编译、**`<script>` 总数恰 2**。judge 型无测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+注入防护+回件链 | 已证实 | 逐行读 `:1-133` |
| 测试 1 用例断言 | 已证实 | 测试文件；NOT_RUN |
| 浏览器侧实跑 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 全链 | §2/§3 | `:5-133` | covered |
| 测试 | §9 | 测试文件 | covered（NOT_RUN） |
