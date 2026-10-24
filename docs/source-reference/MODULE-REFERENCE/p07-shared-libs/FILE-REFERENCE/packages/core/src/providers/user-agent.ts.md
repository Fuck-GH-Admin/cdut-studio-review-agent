---
path: packages/core/src/providers/user-agent.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 89c09e5081f7ea3b4421416e8a78e9d92ca09422
sha256: 0a9d7ee182a5a94780a037cfa9e2d2c4d4a06a981707679cc6ebf5de3800bfc9
lines: 25
kind: source
package: p07-shared-libs
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/core/src/providers/user-agent.ts

## 1. 结论与边界

User-Agent 构造与版本持有（`packages/core/src/providers/user-agent.ts:20-25`）：`Proma/{version} (+repo)`。文件内警告（`:22-23`）：**产品名必须保持 `Proma`**（kimi-coding/zhipu-coding/xiaomi-token-plan 渠道有 UA 白名单），不可改为 Profer。

## 2. 导出与关键符号

`export` 共 **3 个**（全为函数）。

| 符号 | 行 | 签名 | 说明 |
| --- | --- | --- | --- |
| `setProferVersion` | `:8-14` | `(version: string) => void` | semver 校验后写版本 |
| `getProferVersion` | `:16-18` | `() => string` | 读版本 |
| `getProferUserAgent` | `:20-25` | `(version?: string) => string` | 构造 UA |

内部：`PROMA_REPO_URL`（`:1`）、`SEMVER_RE = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/`（`:4`）、模块级 `_proferVersion='0.0.0'`（`:6`）。

## 3. 内部逻辑与关键流程

- `setProferVersion`：semver 不匹配 → `console.warn` 并**忽略**（保持旧版本，`:9-12`）；匹配则写入（`:13`）。
- `getProferUserAgent(version?)`：`version ?? _proferVersion` → `Proma/{v} (+https://github.com/Nya-Angle/CDUT-Studio)`（`:21-24`）。

## 4. 调用者与调用链

- 消费方：provider 适配器/网络层构造请求头；`setProferVersion` 由启动注入应用版本。
- 出向：无模块依赖。

## 5. 数据 I/O、读写与副作用

模块级可变状态 `_proferVersion`；`console.warn`（仅非法输入）。无 I/O。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 非 semver 版本 | `:9-12` | warn + 忽略（幂等保护） |
| 缺省 `version` 参数 | `:21` | 用 `_proferVersion` |

## 7. 权限与权威状态

无身份语义；UA 字符串是渠道白名单契约（`:22-23`）。

## 8. 修改影响面

- **改 `Proma` 产品名会让 kimi-coding/zhipu-coding/xiaomi-token-plan 不可用**（`:22-23` 明示）。
- semver 正则放宽会接受异常版本串。

## 9. 测试证据

- 本批 3 个 test 文件不含本模块断言；无专属测试（全树检索）。
- **NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 个导出、semver 拒绝即忽略 | 已证实 | `:8-14` |
| UA 恒 `Proma/…` 且渠道白名单依赖 | 已证实 | `:22-24` |
| 渠道白名单实际行为 | 未知 | 未连渠道验证 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 个导出 | 2、3 | — | covered |
| semver 拒绝分支 | 6 | `:9-12` | covered |
| 测试证据 | 9 | — | covered |
