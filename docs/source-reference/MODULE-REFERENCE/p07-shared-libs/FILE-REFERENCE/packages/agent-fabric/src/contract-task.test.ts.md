---
path: packages/agent-fabric/src/contract-task.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a43406571fcd3d5a1b82425034e1f6a5b8d277ef
sha256: 4f9fd94225b2a1d54fb29bbd23b5c70e14e3dc5f8504371f9d36d3d8d9b81803
lines: 116
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/agent-fabric/src/contract-task.test.ts

## 1. 测试目标

`validateTaskRequest`（**实现在 `task.ts`，域外不在本批 scope**）的请求结构/policy 自洽/敏感内容只走受控引用（`contract-task.test.ts:3`）。bun:test。断言逐条已读；被测源码未在本批回源（如实标注）。

## 2. 用例清单

共 **9 个 `it(`**（计数核对）。夹具 `basePolicy`（`:18-29`）/`baseRequest`（`:31-46`）。

| 行 | 用例 | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| `:49` | 接受合法只读任务 | baseRequest | validate 不抛 | 独立 |
| `:53` | 拒绝空 objective | objective=' ' | validate | 独立 |
| `:57` | 拒绝缺失 workspaceId | workspaceId='' | validate | 独立 |
| `:61` | 拒绝 allowDelegation=false 但深度非零的自相矛盾 policy | maxDelegationDepth=2 | validate | 独立 |
| `:71` | 拒绝 read-shared 声明写意图 | writeIntent | validate | 独立 |
| `:81` | 拒绝写模式缺 writeIntent.paths | SINGLE_WRITER 无 writeIntent | validate | 独立 |
| `:86` | 拒绝疑似敏感字段（apiKey） | context.extra.apiKey | validate | 独立 |
| `:98` | 拒绝嵌套环境变量字段 | context.nested[].env | validate | 独立 |
| `:110` | 合法文件/产物引用上下文通过 | files+artifactIds+notes | validate 不抛 | 独立 |

## 3. 真实断言

- `:50` 不抛；`:54,:58,:83` `toThrow(ProtocolError)`。
- `:67` `code` `toBe(POLICY_VIOLATION)`（自相矛盾 policy）。
- `:77` `code` `toBe(POLICY_VIOLATION)`（read-shared+写意图）。
- `:94,:106` `code` `toBe(SENSITIVE_INLINE_CONTENT)`（apiKey/嵌套 env）。
- `:114` 合法上下文不抛。

## 4. 未覆盖与脆弱点

- 未覆盖：各错误的 message、`SENSITIVE_INLINE_CONTENT` 的判定正则边界（哪些键名算敏感——在 task.ts 域外）。
- mock 边界：无 mock；被测实现域外。
- 断言≠已运行：**本轮 NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 用例、断言行、夹具形状 | 已证实 | 全 116 行逐行读 |
| validateTaskRequest 实现行为 | 未知（域外未回源） | task.ts 不在本批 scope |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 9 用例 | §2/§3 | 49-115 | covered |
| 域外边界 | §1/§5 | — | covered（如实标注） |
