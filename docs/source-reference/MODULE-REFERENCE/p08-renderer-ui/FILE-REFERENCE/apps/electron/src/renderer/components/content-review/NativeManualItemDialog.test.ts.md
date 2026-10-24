---
path: apps/electron/src/renderer/components/content-review/NativeManualItemDialog.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3cde1b19cae93f8ade62873416456173d2de942c
sha256: e8ebafcf723348d319f93ee0b537cd9e64ea0b000e15797c147ee10a29544f99
lines: 60
kind: test
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/NativeManualItemDialog.test.ts

## 1. 测试目标

**C1-R09 native human Item 可见源选择器**（`apps/electron/src/renderer/components/content-review/NativeManualItemDialog.test.ts:26`）：只暴露当前 application 角色物理版本（保留 parser block 标识）；迁移 legacy/跨案/归档/冻结 Plan 全拒；损坏列表不成合法选择。

## 2. 用例清单

1 describe / 3 test。夹具 `base()`（`:5-24`）：3 文档（current application/retired/evidence）+ `receiptLog[0]='CreateNativeWorkspaceCaseV3'`。

| # | 名称 | 断言 | 行 |
| --- | --- | --- | --- |
| 1 | 只暴露当前 application 版本、保留 parser block 标识 | `reason===null`、`sources.length===1`、`{documentId:'doc-1', versionId:'version-current-1', fileName:'application.txt', blocks:[{blockId:'parser-block-1', text:'Original paragraph'}]}` | `:27-35` |
| 2 | 不暴露迁移 legacy/跨案/归档/冻结 Plan | `receiptLog` 改 `EnsureReviewWorkspaceAggregate`→`[]`；跨案→`[]`；`stage='archived'`→`[]`；`canonicalPlan`→`[]`；仅 evidence→`reason` 含「系统文件选择器」 | `:37-52` |
| 3 | 损坏列表不成合法选择 | `documents=null`→`sources==[]`、`reason` 含「不可读」 | `:54-59` |

## 3. 真实断言

- `expect(result.sources[0]).toMatchObject({… blocks: [{ blockId: 'parser-block-1', text: 'Original paragraph' }]})`（`:31-34`）。
- `expect(nativeManualSourcesFromAggregate(corrupt, 'case-native-ui').reason).toContain('不可读')`（`:58`）。

## 4. 未覆盖与脆弱点

- 未覆盖：对话框组件交互（只测选择器纯函数）。
- 脆弱点：`receiptLog[0].type`/aggregate 形状断言绑定共享类型。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例覆盖安全漏斗全分支 | 已证实 | `:27-59` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 正常暴露 | 1 | `:27-35` | covered |
| 四类拒绝 | 2 | `:37-52` | covered |
| 损坏防御 | 3 | `:54-59` | covered |
