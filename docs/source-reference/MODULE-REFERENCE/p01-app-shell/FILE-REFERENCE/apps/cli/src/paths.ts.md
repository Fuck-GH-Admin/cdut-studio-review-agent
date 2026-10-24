---
path: apps/cli/src/paths.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e3329e0eefd6152686881ba4f2df86f527b8f362
sha256: e6e1372a1d8db3a560324630339f1780e03c3aacaa04129af5c28e7950eb9caa
lines: 41
kind: source
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/cli/src/paths.ts

## 1. 结论与边界

CLI 会话存储路径解析（electron-free 纯函数）：默认 `~/.profer`，`PROFER_DEV=1`（兼容 `PROMA_DEV=1`）→ `~/.profer-dev`，`--config-dir` 最高优先（文件头 `apps/cli/src/paths.ts:1-14`）。头注释声明「与 config-paths.ts 的目录布局保持一致」（`:11`）。

边界：不创建目录；不做 electron `isPackaged` 判断（CLI 无 electron，`:4-6`）。

## 2. 导出与关键符号

`export` 逐条核对：1 接口 + 4 函数 = 5 个导出。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `PathOptions` | 接口（导出） | 18-23 | `{configDir?, dev?}` | |
| `resolveConfigDir` | 函数（导出） | 25-29 | `(opts?) => string` | 配置根目录 |
| `getSessionsIndexPath` | 函数（导出） | 31-33 | `(opts?) => string` | `<configDir>/agent-sessions.json` |
| `getSessionsDir` | 函数（导出） | 35-37 | `(opts?) => string` | `<configDir>/agent-sessions` |
| `getSessionMessagesPath` | 函数（导出） | 39-41 | `(id, opts?) => string` | `<configDir>/agent-sessions/<id>.jsonl` |

无内部函数。

## 3. 内部逻辑与关键流程

`resolveConfigDir`（`:25-29`）：`opts.configDir` 直接返回（`:26`）；否则 `opts.dev || PROFER_DEV==='1' || PROMA_DEV==='1'` 决定 `.profer-dev`/`.profer`（`:27-28`）。其余三个函数为 join 组合（`:31-41`）。

## 4. 调用者与调用链

入向（全树检索，证实）：`sessions.ts:10`（三路径函数）、`registry.ts:5`（`PathOptions` 类型）、`index.ts:20,65-68`（类型+构造）。测试：`paths.test.ts`（本批 3 用例）。

出向：`node:os` `homedir`（`:15`）、`node:path` `join`（`:16`）。

## 5. 数据 I/O、读写与副作用

纯路径拼接：无 I/O、无副作用（依据：全文读）。读 `process.env`（`:27`）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 |
| --- | --- | --- |
| 显式目录 | opts.configDir | 26 |
| dev 目录 | opts.dev/PROFER_DEV/PROMA_DEV | 27-28 |
| 默认 | 其余 | 28 |

无异常路径；无取消/恢复概念，依据：纯函数。

## 7. 权限与权威状态

无权限分支，依据：本文件无权限检查；路径权威=用户 home/显式 config-dir（`resolveConfigDir`）。

## 8. 修改影响面（含跨文件矛盾，照实记录）

- 消费面：`sessions.ts` 全部路径函数 + index/registry 类型。
- **跨文件矛盾（已证实，两侧源码均读）**：头注释称「与 config-paths.ts 目录布局一致」（`:11`），但冻结树 `apps/electron/src/main/lib/config-paths.ts:23-45,57-60` 的 `resolveConfigDir` 实际返回 **`~/.cdutai`/`~/.cdutai-dev`**（`PROFER_DEV=1`→`.cdutai-dev`，Electron isPackaged 兜底，`PROFER_CONFIG_DIR` 可覆盖），且 `:71` 明确「不读取也不迁移 ~/.proma 或 ~/.profer 数据」；会话索引/消息文件名（`agent-sessions.json`/`agent-sessions/<id>.jsonl`）两侧一致（`config-paths.ts:332-368`）。结论：CLI 默认读 `~/.profer`，主应用写 `~/.cdutai`——**默认配置下 CLI 读不到主应用会话**，除非显式 `--config-dir ~/.cdutai` 或设 PROFER_CONFIG_DIR（后者 CLI 不识别，见下）。
- 另两处差异（已证实）：CLI 兼容 `PROMA_DEV`（`:27`），config-paths 只认 `PROFER_DEV`（`:35`）；CLI 不识别 `PROFER_CONFIG_DIR`（config-paths `:58` 支持），仅 `--config-dir`。
- 需同步的测试：`paths.test.ts`（3 用例，本批——其断言以 `~/.profer` 为基准，正是矛盾所在口径）。

## 9. 测试证据

直接测试：`apps/cli/src/paths.test.ts`（本批，3 用例，逐条见该手册）。真实断言：默认 `join(homedir(), '.profer')`（测试 `:20`）；`{dev:true}`/PROFER_DEV/PROMA_DEV 三途径 `.profer-dev`（`:24-29`）；`configDir` 优先（`:34`）。

未覆盖：与主应用 config-paths 的一致性（无此类断言——矛盾无测试拦截）。

NOT_RUN：本轮未运行任何测试/typecheck/构建/CLI 执行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出 + 优先级三分支 | 已证实 | `:18-41` 逐行读 |
| 与 config-paths 目录名不一致（.profer vs .cdutai） | 已证实 | 本文件 `:27-28` vs `config-paths.ts:23-45,57-60,71` |
| 文件名布局一致（agent-sessions*） | 已证实 | `:31-41` vs `config-paths.ts:332-368` |
| PROMA_DEV/PROFER_CONFIG_DIR 支持差异 | 已证实 | `:27` vs `config-paths.ts:35,58` |
| 不一致的产品意图（遗留/迁移断层） | 推断 | 无注释说明 |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 导出 | §2-3 | 18-41 | covered |
| 优先级分支 | §3, §6 | 25-29 | covered |
| 跨文件矛盾 | §8, §10 | - | covered |
| 调用链 | §4 | - | covered |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |
