---
path: apps/electron/src/renderer/components/diff/preview-open-path.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1c8dcb0c8e520c8827c544882f4e44d219c6fde1
sha256: 4605d10fea915c6450fcab88dcaa092c8e59764f7ee38a392d79e816e1c579a2
lines: 23
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/diff/preview-open-path.test.ts

## 1. 测试目标

**测试文件**（bun:test，23 行）：覆盖 `preview-open-path.ts` 的 Windows 路径修复与候选根归一。断言≠运行（NOT_RUN）。

## 2. 用例清单

| 项 | 值 | 核法 |
| --- | --- | --- |
| `test(` 计数 | **2** | `grep -c '^\s*test('` |
| `it(` 计数 | **0** | 同上 |
| describe | 1（'default app preview paths' `:4`） | 全文 |

## 3. 真实断言

1. `:5-14`：`getDefaultAppTargetPath` 修复 Windows file URL 吞掉的配置目录分隔符（`yuan.cdutai-dev`→`yuan/.cdutai-dev`）。
2. `:16-22`：`getPreviewCandidateBasePaths` 归一混合分隔符候选根（默认应用授权检查用）。

## 4. 测试替身与依赖

无替身；直接调纯函数（`./preview-open-path`，本批）。`bun:test` runner。

## 4. 未覆盖

- 断言级：两函数对上述具体输入的输出形状（Windows 隐藏目录修复、候选根去重归一）。
- 未覆盖：`getDefaultAppTargetPath` 的 previewOnly 取序（basePaths/dirPath/sessionPath）、`resolvePreviewDirPath`、`getPreviewFileAccess`。

## 5. 已证实

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 test/0 it 计数与断言内容 | 已证实 | 全文+机械计数 |
| 测试通过 | 未知 | NOT_RUN（断言≠运行） |

## 6. 覆盖表

| 用例 | 节 | 状态 |
| --- | --- | --- |
| 全部用例 | §2/§3 | covered（断言级；NOT_RUN） |
