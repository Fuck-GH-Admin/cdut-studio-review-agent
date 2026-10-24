---
path: patches/@earendil-works%2Fpi-ai@0.82.1.patch
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1931ac820454a49ebe1715c1b9958871cd3a94e6
sha256: 1783a4a05d4a52031765ef5a06737072970211ead01e0b28f47b252df16761a5
lines: 22
kind: patch
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# patches/@earendil-works%2Fpi-ai@0.82.1.patch

## 1. 目标包与版本

`@earendil-works/pi-ai@0.82.1`（上游发布产物 `dist/utils/retry.js`）。历史版本补丁：根 `package.json` 现 overrides 钉 0.86.1、`patchedDependencies` 只登记 0.86.1（`package.json:47-56`），本补丁**当前无登记引用**（历史迁移遗留，见 UNVERIFIED §3）。

## 2. 改动点

单 hunk（`patches/@earendil-works%2Fpi-ai@0.82.1.patch:5-22`）：向 `RETRYABLE_PROVIDER_ERROR_PATTERN` 列表追加 5 类可重试传输错误串（上游行为→补丁后行为=多判为 transient 可重试）：

| 追加模式 | 语义 | 行 |
| --- | --- | --- |
| `stream ended before (?:a )?terminal(?: response)? event` | OpenAI 兼容网关漏写 "response" 的终态事件错 | 9-10 |
| `unexpected non-whitespace character after JSON` | 上游响应体损坏/拼接（传输层瞬态） | 11-13 |
| `peer closed connection`、`incomplete chunked read` | undici/兼容代理的 chunked/SSE 提前断开 | 14-17 |
| `failed to fetch` | 浏览器/undici `TypeError: Failed to fetch` 措辞 | 18-19 |

保留原有 `ended without`/`stream ended before message_stop` 等模式不变（`:8,20-22` 上下文行）。

## 3. 为何必须保留

不打补丁时上述传输层瞬态错误不进重试白名单，Pi 模型请求直接终态失败（流中断/代理断开/网关 JSON 截断在代理链路上常见）。补丁只放宽重试判定、不改业务逻辑，属于稳定性必需。

## 4. 升级时的处理

上游 0.84.3/0.86.1 已由各自补丁覆盖（`pi-ai@0.84.3.patch`/`@0.86.1.patch`，两文件字节相同）；升级 pi-ai 时需在新版本 `dist/utils/retry.js` 重新定位 `RETRYABLE_PROVIDER_ERROR_PATTERN` 上下文行并移植同组模式（上游若原生收录则丢弃补丁）。0.82.1 补丁对新版本不适用（上下文行号已变）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 单 hunk 5 类追加模式 | 已证实 | 补丁 `:5-22` 逐行读 |
| 当前无 patchedDependencies 引用 | 已证实 | `package.json:53-56` + 全树检索 |
| 0.84.3/0.86.1 补丁字节相同 | 已证实 | 两文件 blob/sha256 相同（SCOPE）+ diff 为空 |
| 补丁实际生效语义（重试次数变化） | 未知 | 需运行验证（NOT_RUN） |
| 上游 retry.js 全文 | 未知 | 第三方产物不在冻结树 |

NOT_RUN：未执行任何测试/构建/补丁应用验证。

## 6. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 目标包/版本 | §1 | covered |
| hunk 语义 | §2 | covered |
| 保留理由 | §3 | covered |
| 升级处理 | §4 | covered |
| 运行期效果 | §5 | unknown（NOT_RUN） |
