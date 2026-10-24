---
path: patches/@earendil-works%2Fpi-ai@0.84.3.patch
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

# patches/@earendil-works%2Fpi-ai@0.84.3.patch

## 1. 目标包与版本

`@earendil-works/pi-ai@0.84.3`（上游产物 `dist/utils/retry.js`）。历史版本补丁：根 `package.json` 现 overrides 钉 0.86.1、`patchedDependencies` 只登记 0.86.1（`package.json:47-56`），本补丁**当前无登记引用**。与 `pi-ai@0.86.1.patch` **字节完全相同**（blob `032b9df…`/sha256 `db8e10b5…` 两文件同值，SCOPE 与 diff 双重核实）。

## 2. 改动点

单 hunk（`patches/@earendil-works%2Fpi-ai@0.84.3.patch:5-28`）：向 `RETRYABLE_PROVIDER_ERROR_PATTERN` 追加 9 类可重试传输错误串（上游→补丁后=多判 transient）：

| 追加模式 | 语义 | 行 |
| --- | --- | --- |
| `stream ended before (?:a )?terminal(?: response)? event` | 网关漏写 "response" 的终态事件错 | 9-10 |
| `unexpected non-whitespace character after JSON` | 响应体损坏/拼接 | 11-13 |
| `peer closed connection`、`incomplete chunked read` | undici/代理断流 | 14-17 |
| `response stream was interrupted` | 上游 OpenAI 兼容代理传输失败（较 0.82.1 新增） | 18-19 |
| `请求量较大`、`服务繁忙`、`暂时无法及时响应` | Profer 代管 OpenAI relay 本地化过载文案（较 0.82.1 新增） | 20-23 |
| `failed to fetch` | 浏览器/undici 措辞 | 24-25 |

上下文行保留原模式（`:8,26-28`）。

## 3. 为何必须保留

同 0.82.1 补丁：不打补丁则代理链路瞬态错误不重试直接终态；另含代管 relay 的中文过载文案（商用代管模式下 `请求量较大` 等需重试退避）。只放宽重试白名单，不改业务逻辑。

## 4. 升级时的处理

与 0.86.1 补丁同体；升级 pi-ai 时在新版本 `dist/utils/retry.js` 重定位上下文移植（上游原生收录则丢弃）。0.84.3/0.86.1 两补丁当前仅 0.86.1 被 `patchedDependencies` 引用，0.84.3 留作历史。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 单 hunk 9 类追加模式 | 已证实 | 补丁 `:5-28` 逐行读 |
| 与 0.86.1 补丁字节相同 | 已证实 | blob/sha256 同值 + `diff` 为空 |
| 当前无 patchedDependencies 引用 | 已证实 | `package.json:53-56` + 全树检索 |
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
