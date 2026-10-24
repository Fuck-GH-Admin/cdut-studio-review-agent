---
path: apps/electron/src/main/lib/review/fixtures/all-templates-fixture.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6922a6b18df4720058b4534f32b261287ddcd712
sha256: b616cf2a564a892072442b5c289e79852bdd36791df70d588b93fa5152d76a39
lines: 68
kind: source
package: p05-review-engine
author: docs-r07-author-nb-47-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/fixtures/all-templates-fixture.ts

## 1. 结论与边界

六内置模板完整政策样例（N4，头注释 :1-8）：每模板配虚构演示政策（负责人声明+确认记录+发布版），模板带精确 `policyRefs`，六模板全部可发布且依赖完整。**虚构演示**：真实使用须负责人确认为本校现行规定，不以虚构样例自动通过真实审批（:7-8）。

## 2. 导出与关键符号

导出 3 条（`export` :29/:52/:62）：

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `buildAllTemplateFixtures` | function | `:29-50` | 幂等纯生成（不落盘）：BUILTIN_TEMPLATES_V2 逐模板生成 `{policy, template}` |
| `seedAllTemplateFixtures` | function | `:52-60` | 幂等落盘：政策草稿+模板草稿（旧无引用草稿升级 :58-59） |
| `publishAllTemplateFixtures` | function | `:62-68` | 一键发布（政策先行 :65，模板随后 :66） |

内部符号：`POLICY_SUMMARIES`（:14-21，六模板政策要点文本）、`fixturePolicyId`（:23-25，`policy-<id 去 -v2>-demo`）。

## 3. 内部逻辑与关键流程

`buildAllTemplateFixtures`（:29-50）：content 含「【虚构演示】…不作为任何真实学校的规定」（:31）；policy 含 `origin.kind:'owner-statement'`、`confirmations` 一条 fixture-owner（:33-41）；template 注入 `policyRefs:[{policyId,version:1,contentHash}]`+`policyVersionIds`（:42-47）。`seed`（:52-60）：`getPolicy` 缺失才 `savePolicyDraft`（:56）；模板存在且 draft 无 policyRefs 才升级保存（:58-59，以 policyRefs 缺失为升级信号 :57 注释）。`publish`（:62-68）：seed 后 `publishPolicy` + `store.publish`（已发布幂等由 store 语义保证）。

## 4. 调用者与调用链

入向：批内 `fixtures/all-templates-fixture.test.ts:7`（4 用例，调用 :20/:22/:31/:32/:39/:40/:41/:46）。**生产消费者检索无命中**（模式=basename+符号名全树，无 import/require/动态 import；`.github/workflows/review-ci-baseline.yml:31` 仅命令行列测试路径，非模块引用）。出向：`../policy-store`（canonicalContentHash :36、getPolicy/savePolicyDraft :54、publishPolicy :65）、`../builtin-templates`（BUILTIN_TEMPLATES_V2 :30）、`../template-store`（导入的 getTemplate/publishTemplate/saveDraft 在本文件无调用点——:55/:57 用的是参数 `store.*`，**导入未使用**，照实记录）、`@profer/shared` 类型（:9）。

## 5. 数据 I/O、读写与副作用

经 policy-store/template-store 落盘（写属被调方）；`build*` 纯生成无副作用。幂等：seed 不覆盖已有用户改动（:58-59 条件）。

## 6. 分支、失败、取消与恢复

seed 二分支（:56/:58-59）；无 throw 捕获。不适用取消/恢复（同步）。

## 7. 权限与权威状态

无权限分支；虚构声明是内容权威边界（:31：不冒充真实校规）。

## 8. 修改影响面

演示发布链与批内 4 用例；`BUILTIN_TEMPLATES_V2` 结构变动需同步 `POLICY_SUMMARIES`（:20 兜底文本）。

## 9. 测试证据

`fixtures/all-templates-fixture.test.ts`（批内，4 用例，NOT_RUN）：发布后 validateTemplate error 清零（:19-30）、六政策六模板 published（:32-38）、重复 seed 幂等（policyRefs 长度 1，:40-45）、政策含「虚构演示」+owner-statement（:47-51）。mock 边界：真实 policy/template-store + PROFER_CONFIG_DIR 隔离（:11-13）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 3 条；虚构声明+精确 policyRefs | 已证实 | :29-50 |
| seed 幂等/升级信号 | 已证实 | :52-60 |
| 生产消费者检索无命中（仅自身测试消费） | 已证实（否定） | 全树 basename+符号检索（§4） |
| template-store 导入未使用（实际用参数 store.*） | 已证实（现存观察） | :12 vs :55/:57 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 函数 + POLICY_SUMMARIES | §2/§3 | :14-68 | covered |
| 测试断言 | §9 | — | covered（NOT_RUN） |
