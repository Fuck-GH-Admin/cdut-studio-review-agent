---
path: apps/electron/src/main/lib/agent-image-output-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d98e407b53aaa5c1eea1ad3300ecd4292a5eb30d
sha256: ede243367494d43cbd210cff4cd4dff6c125cecc9333f852e99e13ebb3b03519
lines: 113
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-image-output-service.test.ts

## 1. 测试目标

`sendAgentLocalImage` 路径安全边界：授权复制、cwd/相对路径、越权/伪图/超限/symlink 逃逸拒绝。不运行（`NOT_RUN`）。

## 2. 用例清单

7 用例（:35/:50/:60/:72/:81/:89/:97），1 describe（:34）；fixture 三目录（:13-23）+`writePng` 魔数（:25-27）。
1. 授权 PNG 复制（:35-48）：无 marker（:42）、localPath 含 agent-output-images、relativePath `.context/agent-output-images/`、filename/mediaType、绝对路径存在。
2. 会话 cwd 免重复授权（:50-58）：GIF 通过。
3. 相对路径按 cwd 解析（:60-70）：webp 通过。
4. 越权拒且不落盘（:72-79）：`rejects.toThrow(/授权目录/)`、输出目录不存在（:78）。
5. 伪 PNG 拒（:81-87）：`/不支持.*图片/`。
6. 超 20MiB 拒（:89-95）：`/20MB/`。
7. symlink 逃逸拒（:97-112）：`/授权目录/`；EPERM 平台跳过（:105-107 注释：Windows 开发者模式可能拒建符号链接）。

## 3. 真实断言

如 §2 各行（toMatch/toBe/rejects.toThrow 正则/existsSync）。

## 4. 未覆盖与脆弱点

未覆盖：mediaType 与内容不一致分支、writeAgentImageOutput 独立。脆弱点：#7 Windows EPERM 静默跳过。mock 边界：真实文件系统。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 用例/断言如 §2-3 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| 授权/cwd/相对/越权/伪图/超限/symlink | #1-#7 | covered |
| 内容-类型不一致 | — | unknown |
