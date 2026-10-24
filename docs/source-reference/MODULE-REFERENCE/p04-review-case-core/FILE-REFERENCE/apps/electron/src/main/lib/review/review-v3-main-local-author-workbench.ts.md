---
path: apps/electron/src/main/lib/review/review-v3-main-local-author-workbench.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b71ef75f3eda6c411cb151256fcd608371ae0b00
sha256: 7bb00ad5ccd4026cc78bc64a1c375dc0f8e8dcb08e1d99087d1c70c84c59e085
lines: 90
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-local-author-workbench.ts

## 1. 结论与边界

C11 本地候选作者工作台的 Electron Main 安装器（薄文件）：安装 B1 作者**读取授权**（进程内本地 grant），并注册作者保存/预览/冻结三个 IPC handler。B1 自身的原子 CAS/append-only 库负责修订与候选冻结（文件头 `apps/electron/src/main/lib/review/review-v3-main-local-author-workbench.ts:1-5`）。

边界：

- “本地用户”= 活主窗口主框架；无渲染层 actor、教师、发布者（`:2-3`）。
- 不写案卷、不发布模板；冻结只产生 B1 descriptor 指纹。
- 不做 plan 编译业务逻辑；`compileReviewB1Plan` 是注入的 B1 适配器。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数（类/接口/常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `installC11LocalAuthorWorkbench` | 函数（导出） | 45-90 | `()=>void` | 安装读源 + 注册 3 handler |
| `templatePattern` | 内部 | 19 | `/^[A-Za-z][A-Za-z0-9._-]{0,79}$/` | 模板 ID |
| `deny` | 内部 | 20 | 抛 `C11_LOCAL_AUTHOR_<reason>` | |
| `currentLocal` | 内部 | 21-26 | sender + 主窗口存活 + 同 webContents | 否则 `MAIN_SESSION_UNAVAILABLE` |
| `localDocument` | 内部 | 27-37 | 校验 `document` 形状（`review-b1/1`/`candidate-held`/模板 ID） | 否则 `DOCUMENT_MISSING`/`CANDIDATE_DOCUMENT_INVALID`；返回克隆 |
| `revision` | 内部 | 38-43 | `expectedRevision` ≥0 安全整数 | 否则 `EXPECTED_REVISION_INVALID` |

## 3. 内部逻辑与关键流程

`installC11LocalAuthorWorkbench()`（`:45-90`）：

1. 生成进程内 `epoch=randomUUID()`；`localGrant={ownerId:'local-reviewer',generation:0,authorityEpoch:epoch}`（`:48-49`）。
2. `installCMainV3AuthorReadAuthorities`（`:50-60`）：
   - `getAuthorGrant(templateId)`：模板 ID 合法才给 `localGrant`；
   - `canReadAuthor(principalId,templateId,grant)`：`principalId==='local-reviewer'` + 模板 ID 合法 + grant 三字段与 `localGrant`/epoch 一致 + 主窗口存活（`:53-58`）；
   - `readLatestB1AuthorRevision: templateId => readB1AuthorRevision(templateId)`（`:59`）。
3. `AUTHOR_SAVE_LOCAL_V3`（`:61-69`）：`currentLocal` → `localDocument` → `revision` → `saveB1AuthorRevision(doc,n,'local-reviewer')` → 再 `currentLocal` → 返回 `{revision:saved.revision}`。
4. `AUTHOR_PREVIEW_LOCAL_V3`（`:70-76`）：`currentLocal` → `compileReviewB1Plan(localDocument(input))` → 再 `currentLocal` → 返回结果（预览不落盘）。
5. `AUTHOR_FREEZE_LOCAL_V3`（`:77-89`）：`currentLocal` → `localDocument` → `revision` → `readB1AuthorRevision(doc.templateId)` 必须存在、`revision===n`、`JSON(document)===JSON(doc)`，否则 `UNSAVED_OR_STALE_AUTHOR_REVISION`（`:82-85`）→ `freezeB1Candidate(templateId,n)` → 再 `currentLocal` → 返回 `{fingerprint: frozen.descriptor.canonicalPlan.fingerprint}`（`:86-88`）。

三个 handler 都是“开头+收尾”两次 `currentLocal`（`:63,67`、`:72,74`、`:79,87`），即操作前后都验 sender/窗口。

## 4. 调用者与调用链

入向（冻结树 grep）：`apps/electron/src/main/index.ts:190` 导入、`:948` 调用（启动）。preload：`apps/electron/src/preload/index.ts:4818-4825`（save/preview/freeze 三通道）。渲染层：`ReviewV3LocalCandidateWorkbench.tsx:407,408,457,458`（save/preview）、`:188`（freeze）、`ReviewV3TemplateRoutingAssistant.tsx:138-140`。测试：**无**（见 §9）。

出向：`../main-window-state.ts:5`（`getMainWindow`）、`review-c0-authority.ts:21`、`review-v3-main-author-plan-ipc.ts:143`（`installCMainV3AuthorReadAuthorities`）、`review-template-author-store-v3-b1.ts:120,145,177`（读/存/冻结）、`review-template-plan-adapter-v3-b1.ts:144`（`compileReviewB1Plan`）。

## 5. 数据 I/O、读写与副作用

- 写：`saveB1AuthorRevision`（B1 库 append）与 `freezeB1Candidate`（冻结记录）——磁盘写由 B1 库实现；`AUTHOR_PREVIEW_LOCAL_V3` 不写盘。
- 副作用：安装读源槽（进程内）；注册 3 通道（`packages/shared/src/types/review.ts:514-516`）；无网络/通知。
- 幂等/原子性：保存/冻结原子性由 B1 CAS 保证（注释 `:4`）；`expectedRevision` 是 B1 修订 CAS 参数（`:38-43`）。
- 并发：`epoch` 为进程内 grant；冷进程不继承旧帧身份（`:46-47`）。

## 6. 分支、失败、取消与恢复

| 错误（前缀 `C11_LOCAL_AUTHOR_`） | 触发 | 行 |
| --- | --- | --- |
| `MAIN_SESSION_UNAVAILABLE` | 主窗口销毁/异 webContents | 25 |
| `DOCUMENT_MISSING`/`CANDIDATE_DOCUMENT_INVALID` | 文档形状非法 | 29,35 |
| `EXPECTED_REVISION_INVALID` | 非安全非负整数 | 41 |
| `UNSAVED_OR_STALE_AUTHOR_REVISION` | 冻结前修订/文档不一致 | 85 |

- 失败后状态：保存失败无写入（B1 CAS）；冻结失败不产生冻结记录。
- 取消/恢复：无取消；`expectedRevision` 冲突由调用方重读重试。

## 7. 权限与权威状态

- 3 个 handler 均 `assertC0ReviewMainSender`（经 `currentLocal`，`:22`）；收尾再验一次（`:67,74,87`）。
- 读源 grant：`local-reviewer`/generation 0/进程内 epoch（`:48-58`）——这是**本地设备**权威，不是学校/教师身份。
- 冻结要求“保存后的内容与请求逐字节一致”（`:82-85`），防止未保存草稿被冻结。
- 返回的 `fingerprint` 只是 B1 descriptor 指纹，不是发布授权（`:88`）。

## 8. 修改影响面

- 改三通道契约影响 preload（`:4818-4825`）与渲染层两组件。
- 改读源安装会影响 `review-v3-main-author-plan-ipc.ts` 的 `AUTHOR_READ_LATEST_V3` 生产可用性（本文件是生产唯一读源安装点）。
- 改 `localDocument`/`revision` 校验影响保存/冻结入口的拒绝行为。

## 9. 测试证据

**无直接测试**：冻结树检索 `apps/`+`packages/` 全部 `*.test.ts`/`*.test.tsx`，对 `review-v3-main-local-author-workbench`/`installC11LocalAuthorWorkbench`/`AUTHOR_SAVE_LOCAL_V3`/`AUTHOR_PREVIEW_LOCAL_V3`/`AUTHOR_FREEZE_LOCAL_V3` 的 import/invoke 均 0 命中（范围不含 `docs/`）。

间接：`review-v3-main-author-plan-ipc.test.ts` 覆盖经本文件安装的读源在 IPC 层的拒绝/放行（用测试自装读源，不是本文件的安装函数）。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

缺口（静态判断）：全部 handler 分支、冻结陈旧分支、主窗口销毁分支均无自动化断言。维护者验证：启动后经 preload 调三通道，检查保存→冻结链与 `AUTHOR_READ_LATEST_V3` 可读。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 生产唯一读源安装点 | 已证实（检索） | `main/index.ts:190,948`；`review-v3-main-author-plan-ipc.ts` 全树 grep |
| 三 handler 前后双重 sender 校验 | 已证实 | `:63,67,72,74,79,87` |
| 冻结需逐字节一致 | 已证实 | `:82-85` |
| 预览不落盘 | 已证实 | `:70-76` 无写调用 |
| 无直接测试 | 已证实（检索范围：冻结树 `apps`/`packages` 测试文件） | 符号/通道 0 命中 |
| B1 CAS/append-only 细节 | 未知（文件外） | `review-template-author-store-v3-b1.ts` 未逐行读 |
| 真实 Electron 重复注册行为 | 未知 | 未运行 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 读源安装 | §3 | 48-60 | covered |
| save handler | §3 | 61-69 | covered |
| preview handler | §3 | 70-76 | covered |
| freeze handler | §3 | 77-89 | covered |
| 入参校验 | §2,§3 | 27-43 | covered |
| 权限 | §7 | 21-26,48-58 | covered |
| 测试 | §9 | — | unknown |
