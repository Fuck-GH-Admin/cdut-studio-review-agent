---
path: apps/electron/src/main/lib/agent-session-manager.oversized-sanitize.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 05567eba08772c1f67dc779c8c6f1c4cf7f0a5ed
sha256: e0dcd4332f1effe857713e332b4c02faafddbbdae62b44bf2536d143ff597076
lines: 377
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-session-manager.oversized-sanitize.test.ts

## 1. 测试目标

超限消息落盘**外部化主路径**（写入现在的行为：搬 blob 不删）+ 截断兜底仍可用 + 第二级阈值收敛。bun:test；electron mock+临时目录+动态 import（`:36-44`）；`expectExternalized` 断言辅助（片段=2000+引用表+blob 逐字节可取回，`:87-98`）。

## 2. 用例清单

共 **13 个 `test(`**（机械核），四 describe：外部化主路径 6（`:101,119,136,163,182,201`）；转义膨胀与累加 2（`:225,246`）；截断兜底 2（`:279,303`）；第二级阈值 3（`:313,337,361`）。

## 3. 真实断言

- `:113-116` tool_use_result 整页 HTML 外部化+非载荷字段保留（isError=false）。
- `:131-133` PDF base64 外部化+`filePath` 保留（渲染侧定位用）。
- `:156-160` Pi 扁平 `data` 图片外部化（此前约 95MB 漏处理）+image 块/媒体类型保留。
- `:179` Anthropic `source.data` 同样外部化。
- `:198` 嵌套数组 text block 外部化（此前不受限）。
- `:217-220` 未超限消息零改动零 blob。
- `:229-243` 控制字符转义膨胀（100K→>600K JSON）按序列化结果判定外部化。
- `:266-272` 多字段累加逐个搬走至限内、每 ref blob 长度=chars。
- `:299-300` 兜底收敛+含“内容已截断”标记；`:305` 未超限原样。
- `:329-334` 第二级 200 条 1500 字符收敛、片段=**200**（第二级标志）。
- `:350` 200 条同内容共用 1 blob；`:356-357` 逐条还原原文。
- `:375` 两级抽不动（300×400 字符）**原样保留不丢数据**。

## 4. 未覆盖与脆弱点

阈值逐级收紧（128K→…→4K）多轮路径仅经兜底用例间接；`sanitizeToolResultPayload` 深度上限无断言。断言≠已运行：**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 13 用例/断言/四类膨胀源 | 已证实 | 全 377 行 |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 13 用例 | §2/§3 | 101-376 | covered |
