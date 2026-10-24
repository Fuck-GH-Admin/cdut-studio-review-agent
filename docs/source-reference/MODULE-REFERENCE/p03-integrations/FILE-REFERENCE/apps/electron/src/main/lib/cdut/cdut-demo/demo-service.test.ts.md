---
path: apps/electron/src/main/lib/cdut/cdut-demo/demo-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: aea309de42f4a4a42b5bbbcb38531b12970287cb
sha256: 5d76a5bedd19bbd8b000356ba99c99d16f685b2ca9ed854ffa51c93d4d7a89ca
lines: 112
kind: test
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/cdut-demo/demo-service.test.ts

## 1. 测试目标

演示服务单元测试（文件头 `apps/electron/src/main/lib/cdut/cdut-demo/demo-service.test.ts:1-9`）：登录判定/演示态生命周期/8 域演示数据/写操作仅模拟。mock 边界：无 mock——直接调 `cdutDemoService` 单例，`afterEach` 复位防状态串扰（`:21-24`）。

## 2. 用例清单

2 describe、6 test：

1. `:27` 演示凭据登录→演示态+完整画像。
2. `:48` 错误密码→null 且不入演示态。
3. `:58` reset 后立即回落未登录。
4. `:82` 8 大域（cases 表 `:71-80`）均返回非空 Markdown+JSON。
5. `:91` 课表域命中演示条目（学期代号+线性代数）。
6. `:97` 成绩域双轨加权绩点+records；`:106` 写操作仅模拟（mutated:true+「模拟执行」）。

## 3. 真实断言

- `:33-45` 画像 8 字段断言（张澄一/202520260101/环境与土木工程/地下水科学与工程/2025202601/学生/active）、avatar `data:image/jpeg;base64,` 前缀（`:42`）、`rememberPassword` 为 false（`:44`）。
- `:54-55` result null + isActive false；`:63-66` reset 前后 isActive。
- `:85-87` 8 域 success/markdown 非空/json defined。
- `:93-94` 含 `2026-2027-1`、`线性代数`；`:99-103` 含「加权绩点」「碳中和技术概论」、records 数组、latest.weightedGpa 为 number。
- `:108-110` success/mutated true/含「模拟执行」。

## 4. 未覆盖与脆弱点

未覆盖：classrooms 不编造红线（在 domain-tools.test）、exams/curriculum/notices 具体内容断言、tryLogin 用户名非演示号分支。单例状态依赖 afterEach 复位（顺序敏感性已缓解）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例行号与断言文本 | 已证实 | `:27-111` |
| 运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 登录/生命周期/8 域/模拟写 | §3 | covered |
| 内容断言细节 | §4 | partial |
| 实际运行 | §5 | unknown（NOT_RUN） |
