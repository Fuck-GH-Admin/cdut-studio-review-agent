---
path: patches/@earendil-works%2Fpi-ai@0.86.1.patch
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 032b9df1514ecde1a8be08df72867e522bb6087c
sha256: db8e10b5f5a2a87406536bdc9ffbdcc726d2ce3ad78c8854608f4492d73b45d0
lines: 28
kind: patch
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# patches/@earendil-works%2Fpi-ai@0.86.1.patch

## 1. 目标包与版本

`@earendil-works/pi-ai@0.86.1`（上游产物 `dist/utils/retry.js`）。**当前生效补丁**：根 `package.json:49` overrides 钉 0.86.1、`package.json:54` `patchedDependencies` 映射本文件。与 `pi-ai@0.84.3.patch` **字节完全相同**（blob `032b9df…`/sha256 `db8e10b5…` 同值，SCOPE 与 diff 双重核实）——同一份补丁文本覆盖两个版本。

## 2. 改动点

单 hunk（`patches/@earendil-works%2Fpi-ai@0.86.1.patch:5-28`）：向 `RETRYABLE_PROVIDER_ERROR_PATTERN` 追加 9 类可重试传输错误串（上游→补丁后=多判 transient）：

| 追加模式 | 语义 | 行 |
| --- | --- | --- |
| `stream ended before (?:a )?terminal(?: response)? event` | 网关漏写 "response" 的终态事件错 | 9-10 |
| `unexpected non-whitespace character after JSON` | 响应体损坏/拼接 | 11-13 |
| `peer closed connection`、`incomplete chunked read` | undici/代理断流 | 14-17 |
| `response stream was interrupted` | 上游 OpenAI 兼容代理传输失败 | 18-19 |
| `请求量较大`、`服务繁忙`、`暂时无法及时响应` | Profer 代管 OpenAI relay 本地化过载文案 | 20-23 |
| `failed to fetch` | 浏览器/undici 措辞 | 24-25 |

上下文行保留原模式（`:8,26-28`）。

## 3. 为何必须保留

Pi 运行时（pi-coding-agent/pi-agent-core 亦钉 0.86.1，`package.json:47-52`）经代理/代管 relay 出网时，上述传输层瞬态错误不补则不重试直接终态。补丁只放宽重试白名单（`buildProviderErrorPattern` 输入列表），不改退避/预算逻辑（后者在 pi-coding-agent 补丁，见该手册）。

## 4. 升级时的处理

升级 pi-ai 时在新版本 `dist/utils/retry.js` 重定位 `RETRYABLE_PROVIDER_ERROR_PATTERN` 上下文行移植同组 9 模式；上游若原生收录则丢弃补丁并从 `patchedDependencies` 移除。注意与 pi-coding-agent 的 retry 预算补丁（jitter/maxTotal*）配套保留，二者共同构成重试策略。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 单 hunk 9 类追加模式 | 已证实 | 补丁 `:5-28` 逐行读 |
| 与 0.84.3 补丁字节相同 | 已证实 | blob/sha256 同值 + `diff` 为空 |
| 当前生效（patchedDependencies 映射） | 已证实 | `package.json:54` |
| 重试行为实际变化 | 未知 | 需运行验证（NOT_RUN） |
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
