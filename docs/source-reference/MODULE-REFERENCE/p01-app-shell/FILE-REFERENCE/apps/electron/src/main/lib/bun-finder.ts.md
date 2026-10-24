---
path: apps/electron/src/main/lib/bun-finder.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 07a9e3210397db52c93b1cf2cd1721dffc0e2097
sha256: 6effc8a82616705d39f73c924a353f5f1fe2b25b7ab81b43f5f622ef400facd2
lines: 194
kind: source
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/bun-finder.ts

## 1. 结论与边界

**Bun 运行时路径检测**（194 行）：Bun 是**可选组件**（SDK 自带编译好的 claude 二进制，核心不依赖，`:4`/`:145-146`）；仅用于系统状态展示+自定义脚本探测（`:6-7`）。检测顺序：系统 PATH→dev vendor 目录（`:9-11`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `getCurrentPlatformArch` | `:25-45` | 5 种支持组合白名单，不支持 throw（`:40-42`） |
| `getVendorBunPath` | `:64-83` | dev vendor 路径（打包版 null） |
| `getSystemBunPath` | `:90-111` | which/where 5s 超时 |
| `validateBunExecutable` | `:119-140` | spawnSync `--version` 校验 |
| `detectBunRuntime` | `:155-194` | 候选链（system→vendor）→可用则返回 `{available:true, path, version, source, error:null}`；全未命中→`available:false` **但 error:null 不视为错误**（`:151`） |

内部：`getBunBinaryName:52-54`（win32→bun.exe）。

## 3. 内部逻辑与关键流程

候选链逐个 getPath→validate→首个可用即返回；全失败返回不可用但非错误。

## 4. 调用者与调用链

系统状态卡片/脚本可用性提示；出向 `electron` app、child_process。

## 5. 数据 I/O、读写与副作用

execSync/spawnSync 子进程（5s 超时）；existsSync。

## 6. 分支、失败、取消与恢复

平台不支持 throw（getCurrentPlatformArch）；命令失败静默 null；校验失败 warn 后继续下一候选。

## 7. 权限与权威状态

**"不可用≠错误"契约**（`:151`）：可选组件语义；核心功能不依赖。

## 8. 修改影响面

改检测顺序影响 Bun 发现率；平台白名单联动 vendor 分发。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件/可选组件契约 | 已证实 | 194 行全读（主根自读兜底） |
| **照实**：candidates 类型含 `'bundled'` source 但候选列表只有 system/vendor（`:158-164`，类型超集照实） | 已证实 | `:158-164` |
| 子进程实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；实效 unknown。
