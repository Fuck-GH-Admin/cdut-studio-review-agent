---
path: packages/agent-fabric/tsconfig.json
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

# packages/agent-fabric/tsconfig.json

## 1. 键清单

5 行 JSON（`packages/agent-fabric/tsconfig.json:1-5`）：

| 键 | 值 | 说明 |
| --- | --- | --- |
| `extends` | `"../../tsconfig.json"` | 继承仓库根 tsconfig 的全部编译选项 |
| `compilerOptions` | `{}` | 零覆盖（全部用根配置） |
| `include` | `["src/**/*"]` | 仅编译本包 `src/` 下文件 |

## 2. 默认值来源

全部来自根 `tsconfig.json`（未读，非本批文件——继承行为为 TS 标准语义）。`compilerOptions` 空对象=显式无覆盖。

## 3. 真实消费者

TypeScript 编译器（`tsc --noEmit`，经本包/根目录 typecheck 脚本调用——`packages/agent-fabric/package.json` 不在本批，推断-标准工具链）；编辑器 TS 语言服务。

## 4. 环境覆盖 / 缺失行为

无环境变量交互。缺失时 `tsc` 回退目录查找根配置，`src/**/*` 不受 include 保护（推断-标准语义）。

## 5. 修改影响面

改 `include` 影响 agent-fabric 包的编译/报错文件集；与 `benchmark-multihop/tsconfig.json` **内容完全相同**（同 blob `73a65ef2…`，机器核对），双侧同步。

## 6. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 键取值 | 已证实 | `packages/agent-fabric/tsconfig.json:1-5` |
| 与 benchmark-multihop/tsconfig.json 同 blob | 已证实 | 冻结树 git blob 机器比对 |
| tsc 实际继承结果 | 未知 | 未运行 typecheck（NOT_RUN） |

## 7. 覆盖表

| 键 | 章节 | 状态 |
| --- | --- | --- |
| extends/compilerOptions/include | §1-§2 | covered |
| 运行验证 | §6 | unknown（NOT_RUN） |
