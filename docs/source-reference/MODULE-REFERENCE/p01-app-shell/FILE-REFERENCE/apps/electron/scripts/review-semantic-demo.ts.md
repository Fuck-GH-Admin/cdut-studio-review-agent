---
path: apps/electron/scripts/review-semantic-demo.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a0e479f1d06e5f433d1a93501b13d9bbe9b21d2c
sha256: 3cd05442f74b2743a9685c9fe87cb8ca7781c90be45241fb53e458199764defb
lines: 100
kind: source
package: p01-app-shell
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/scripts/review-semantic-demo.ts

## 1. 结论与边界

D0.5 Agent 可调用的结构化编辑 CLI（独立技术 Demo）：`<state.json> <command.json>` 两参数，命令 `kind` 为 `apply | preview | project | project-draft | list`（`scripts/review-semantic-demo.ts:1-6`、`:15-20`）。文件内容被当作数据处理，不作为任何 Pi 系统指令执行（`scripts/review-semantic-demo.ts:5`）。

边界：不做 GUI、不认证正式校规、不发布模板；`project` 仅产出 `[D0.5 DEMO / 非校规]` 草稿（`src/main/lib/review/semantic-module-demo.ts:427-428`），`project-draft` 写入的也只是模板草稿（`status: 'draft'`，`:444`）。

## 2. 导出与关键符号

导出 0：CLI 脚本无 `export` 声明（逐条核对全文 `scripts/review-semantic-demo.ts:7-100`）。关键内部符号：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `DemoCommand` | 类型（内部） | 15-20 | `apply`（`& DemoTransaction`）/`preview`/`project`/`project-draft`/`list` 联合 | `project-draft` 强制 `confirmDemoWrite: true` 字段 |
| `readState` | 函数（内部） | 22-29 | `(path: string): DemoState` | 不存在→`emptyDemoState()`；结构/校验失败抛错 |
| `atomicWrite` | 函数（内部） | 31-40 | `(path: string, value: DemoState): void` | tmp+rename 原子写 |
| `main` | 函数（内部） | 42-93 | `(): void` | 参数解析与命令分派 |

## 3. 内部逻辑与关键流程

1. 参数校验：`process.argv[2]`/`[3]` 缺失抛用法错误（`scripts/review-semantic-demo.ts:43-45`）；`path = resolve(argv[2])`、`cmd = JSON.parse(readFileSync(resolve(argv[3])))`（`:46-47`）。
2. `apply`（`:48-62`）：先 `mkdirSync(dirname(path), {recursive:true})`（`:49`）；建锁 `path + '.lock'`，`openSync(lock, 'wx')` 抢占（`:51-52`，注释 `:50`：仅防本地 CLI 多进程同时写入丢失更新，不作正式事务服务）；锁内 `readState(path)` → `applyDemoTransaction(state, cmd)`（`:54`）→ `atomicWrite(path, next)`（`:55`）；输出 `{ok: true, revision, modules: <数>, templates: <数>}`（`:56`）；`finally` 关闭并删除锁（`:57-59`）。
3. 非 apply 先 `readState(path)`（`:63`）再进 `switch`：
   - `list`（`:65-71`）：输出 `revision` 与 modules/templates 的 `{id, version, name}` 摘要。
   - `preview`（`:72-74`）：`previewDemo(state, cmd.templateId, cmd.version, cmd.scenario)` 输出预览（含 `blocked`/`tasks`/`fingerprint`）。
   - `project`（`:75-77`）：`projectSimpleDemoDraft(state, cmd.templateId, cmd.version)` 输出投影草稿。
   - `project-draft`（`:78-89`）：双重门 `cmd.confirmDemoWrite !== true || !process.env.PROFER_CONFIG_DIR` 即抛错（`:79-81`）；`projectSimpleDemoDraft` 取草稿（`:82`）；`validateTemplate(draft)` 过滤 `level === 'error'`，有则抛「投影未通过原模板校验：…」（`:83-84`）；`getTemplate(draft.templateId, draft.version)` 已存在抛「目标模板版本已存在，拒绝覆盖」（`:85`）；`saveDraft(draft)`（`:86`）；输出 `{ok: true, templateId, version, status}`（`:87`）。
   - `default`（`:90-91`）：抛「不支持的命令类型」。

## 4. 调用者与调用链

入向（全冻结树检索 `scripts/review-semantic-demo`，命中仅测试 spawn 与自身头注释/用法）：
- `src/main/lib/review/semantic-module-demo.test.ts:240-249`：`Bun.spawnSync([process.execPath, cliPath, statePath, commandPath])`，隔离 `PROFER_CONFIG_DIR`（`:246`）。

出向（`scripts/review-semantic-demo.ts:7-13` 导入）：
- `node:fs`/`node:path`：`closeSync/existsSync/mkdirSync/openSync/readFileSync/renameSync/unlinkSync/writeFileSync`、`dirname/resolve`（`:7-8`）。
- `src/main/lib/review/template-store.ts:253`（`getTemplate`）、`:365-367`（`saveDraft`）、`:386`（`validateTemplate`）。
- `src/main/lib/review/semantic-module-demo.ts:110-112`（`emptyDemoState`）、`:213`（`validateDemoState`）、`:285-345`（`applyDemoTransaction`）、`:358`（`previewDemo`）、`:419-446`（`projectSimpleDemoDraft`）；类型 `DemoState`/`DemoTransaction`（`:11-13`）。

## 5. 数据 I/O、读写与副作用

- 输入：`state.json`（DemoState，缺省视为 `{revision: 0, modules: [], templates: []}`，`src/main/lib/review/semantic-module-demo.ts:110-112`）与 `command.json`。
- 输出：stdout 纯 JSON（`scripts/review-semantic-demo.ts:56`、`:66-87`）；错误经 `console.error`（`:98`）。
- 磁盘写两条路径：①`apply` 写 state 文件——`atomicWrite` 用 `path + '.tmp-' + process.pid` + `writeFileSync(…, flag: 'wx')` + `renameSync` 原子替换，`finally` 清理残留 tmp（`:31-40`）；写前持 `<state>.lock` 文件锁（`:51-59`）。②`project-draft` 经 `saveDraft` 写模板草稿库（`src/main/lib/review/template-store.ts:365-367`，`saveDraftControlled(template, false)`）。
- 无网络、无遥测；写入根由 `PROFER_CONFIG_DIR` 决定（`project-draft` 分支 `:79`）。

## 6. 分支、失败、取消与恢复

- 顶层 `try { main() } catch`（`:95-99`）：打印 `[D0.5 Demo] <message>` 并 `process.exitCode = 1`。
- 抛错分支：`:44`（缺参）、`:25`（「状态文件结构无效」）、`:27`（「状态文件校验失败：…」）、`:80`（缺 `confirmDemoWrite`/`PROFER_CONFIG_DIR`）、`:84`（投影校验不通过）、`:85`（目标版本已存在）、`:91`（未知 `kind`）。
- 下游 fail-closed（经顶层捕获）：`applyDemoTransaction` 的乐观锁 `VERSION_CONFLICT`（`src/main/lib/review/semantic-module-demo.ts:286`）、空事务拒绝（`:287`）、操作级错误（如「模板不存在」「固定模块版本已存在」，`:291`、`:298`、`:311`）、终态 `VALIDATION_FAILED`（`:341-343`）；`projectSimpleDemoDraft` 的「复杂业务情景只能预览」/「审核责任未通过预览校验」（`:209`、`:424`）。
- 失败后状态：`applyDemoTransaction` 全量作用于 `structuredClone` 副本，任何操作或终态校验失败原对象不变（`:284-288`、`:341-343`）；`atomicWrite` 失败在 `finally` 删 tmp（`:37-39`）；锁在 `finally` 释放（`:57-59`）。锁被其它进程占用时 `openSync(…, 'wx')` 抛 EEXIST（外部错误，走顶层捕获；无自动重试）。

## 7. 权限与权威状态

- 无身份认证：CLI 无 actor/角色参数。
- `project-draft` 双重显式门：`confirmDemoWrite === true` 且 `PROFER_CONFIG_DIR` 显式设置（`scripts/review-semantic-demo.ts:79-81`）——防止误写正式模板草稿库，属沙箱/确认边界而非权限校验。
- 权威边界：D0.5 无权认证正式校规——来源类型 `official-policy` 在 Demo 校验中直接报「不支持在 D0.5 中认证正式校规」（`src/main/lib/review/semantic-module-demo.ts:105-130`）；`project-draft` 走 `saveDraft` 而非候选资格入口，`saveDraft` 无权把 `candidate-held` 转为可发布（`src/main/lib/review/template-store.ts:364-367`）。

## 8. 修改影响面

- 调用方测试：`src/main/lib/review/semantic-module-demo.test.ts:238-268`（fixture 驱动的 preview/apply/project 全链，断言 `blocked`/`tasks` 长度/`revision`/投影内容）；命令 JSON 形状（`kind` 联合，`:15-20`）与输出 JSON 字段是对外契约，改动需同步该测试。
- 依赖 `src/main/lib/review/semantic-module-demo.ts` 的事务操作集（8 种 `op`，`:295-339`）与 `TemplateVersion` 投影形状（`src/main/lib/review/semantic-module-demo.ts:425-445`）；state 文件格式（`DemoState`：`revision/modules/templates`）变化会破坏已有 `state.json` 与 fixture（如 `d05-synthetic-state.json`）。

## 9. 测试证据

针对本 CLI 的直接测试（`src/main/lib/review/semantic-module-demo.test.ts:238-268`，`Bun.spawnSync` 真实起进程、`PROFER_CONFIG_DIR` 隔离到临时目录 `:241-246`）：
- `preview`（`d05-preview-card-family.json`）：断言 `family.blocked === false`（`:254`）、`family.tasks` 长 3（`:255`）。
- `preview`（`d05-preview-archive.json`）：断言 `objectKey` 含 `'item-1/copy'`（`:256-257`）。
- `apply`（`d05-agent-edit.json`）：断言 `edited.revision === 2`（`:258-259`）。
- `project`（自写命令文件）：断言 `projected.sections[0].criteria[0].requirement` 含「标题、摘要、正文及结论」（`:263`）、`projected.status === 'draft'`（`:264`）。

未覆盖：`project-draft`/`list` 无 CLI 级断言；错误路径（锁冲突、损坏 state、`VERSION_CONFLICT`、缺 `confirmDemoWrite`）无 CLI 断言（检索范围：全冻结树 `scripts/review-semantic-demo` 命中仅 `src/main/lib/review/semantic-module-demo.test.ts:240` 与本文件头注释）。间接证据：同测试文件大量用例直接调库函数（如 `:225-236` 断言 `upsert-local-task` 后 preview 任务 3 项）。`NOT_RUN`：本轮未执行任何测试/typecheck/运行，全部为静态阅读所得。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 五命令分派、`apply` 锁+原子写、`project-draft` 双重门 | 已证实 | `scripts/review-semantic-demo.ts:42-93` |
| `applyDemoTransaction` 乐观锁与原子失败不变 | 已证实 | `src/main/lib/review/semantic-module-demo.ts:284-288`、`:341-343` |
| 投影产物标注 DEMO/非校规、`status: 'draft'` | 已证实 | `src/main/lib/review/semantic-module-demo.ts:427-428`、`:444` |
| CLI spawn 断言（preview×2/apply/project） | 已证实 | `src/main/lib/review/semantic-module-demo.test.ts:253-264` |
| `list` 输出形状为消费端稳定契约 | 推断 | `scripts/review-semantic-demo.ts:65-71`（无测试断言） |
| 锁文件 EEXIST 时用户可见文案 | 未知 | 外部错误未经本文件格式化（`:95-99` 仅前缀） |
| `project-draft`/`list` 的实际 CLI 行为 | 未知 | 无 CLI 级测试，见 §9 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `DemoCommand` 类型 | §2、§8 | 15-20 | covered |
| `readState`（缺省/结构/校验） | §3、§6 | 22-29 | covered |
| `atomicWrite`（tmp+rename+清理） | §5、§6 | 31-40 | covered |
| `apply`（锁内读改写） | §3.2、§5、§6 | 48-62 | covered |
| `list` | §3.3 | 65-71 | covered（无测试） |
| `preview` | §3.3 | 72-74 | covered |
| `project` | §3.3 | 75-77 | covered |
| `project-draft`（双重门/校验/拒覆盖） | §3.3、§7 | 78-89 | covered（无 CLI 测试） |
| 未知 kind/顶层 catch | §3.3、§6 | 90-91、95-99 | covered |
| `project-draft`/`list`/错误路径运行时行为 | §9、§10 | — | unknown（NOT_RUN） |
