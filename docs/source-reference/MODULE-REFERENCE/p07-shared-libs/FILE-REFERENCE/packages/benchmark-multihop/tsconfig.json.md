---
path: packages/benchmark-multihop/tsconfig.json
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 73a65ef2ef6e5658643310ffc67e5391df2cbbc1
sha256: 1de5fbec4888f903fd7d0695642e6c2cb46ae9f5e944df0d93a4fd1aaa2325d6
lines: 5
kind: config
package: p07-shared-libs
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# packages/benchmark-multihop/tsconfig.json

## 1. 键清单

与 `packages/agent-fabric/tsconfig.json` **字节完全相同**（同 blob `73a65ef2…`，机器核对）：`extends: "../../tsconfig.json"`、`compilerOptions: {}`、`include: ["src/**/*"]`（`packages/benchmark-multihop/tsconfig.json:1-5`）。

## 2. 默认值来源

根 `tsconfig.json`（未读，非本批）；零本地覆盖。

## 3. 真实消费者

`tsc --noEmit`（本包 `typecheck` script，见 `packages/benchmark-multihop/package.json:13`）；编辑器 TS 语言服务。注意 `public/index.html` 内联脚本不受 TS 编译（非 TS）。

## 4. 环境覆盖 / 缺失行为

无环境交互；缺失时 include 不生效（推断-标准语义）。

## 5. 修改影响面

改 `include` 影响 benchmark-multihop 的 typecheck 文件集；与 agent-fabric 的同名文件为复制关系（无共享引用，双侧手工同步——推断-同 blob）。

## 6. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 键取值 | 已证实 | `:1-5` |
| 与 agent-fabric/tsconfig.json 同 blob | 已证实 | git blob 机器比对 |
| typecheck 实际结果 | 未知 | NOT_RUN |

## 7. 覆盖表

| 键 | 章节 | 状态 |
| --- | --- | --- |
| 全部 3 键 | §1-§2 | covered |
| 运行验证 | §6 | unknown（NOT_RUN） |
