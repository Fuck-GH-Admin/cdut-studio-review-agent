# NB-80 独立复核报告（对 nb-80-r1 封版字节）— p03.browser-bridges

- 验收对象 `nb-80-r1`（revisionOf nb-80，sealId `seal-224d7c837b5825df`）——r1 为**作者 G0 自查修正**（3 篇章节补厚，非 QA finding；流程教训已在 RESPONSE 记录）。18 文件/3656 行。
- **batchVerdict：revision_required（17 accepted / 1 revision_required；1 blocking + 1 minor）**。

## G0 PASS
r1 链自洽（before/ 3 篇==nb-80 stage、changes.diff 重放 3/3、RESPONSE after-hash 3/3、ZIP 21 条目逐字节）；18 源绑定=SCOPE=MANIFEST；补厚未改事实（抽核删除行均为"无专属测试"类薄句替换）。

## G1 PARTIAL — Findings
| id | 级别 | 文件 | 摘要 |
| --- | --- | --- | --- |
| NB80R1-F-01 | blocking | browser-controller.ts.md | §2 尾部 4 处行号**越界**（:2152-2180/:2168-2175/:2188-2221/:2227-…均 >2154 EOF；实际 screenshot :2041、hide :2073、hideAll :2092、disposeSession :2118）；与文首"行号经逐行核对"校订注矛盾。内容结论属实——**限引用返修** |
| NB80R1-N-01 | minor | 3 篇 | §2 行号 ±1~12 手估漂移（同 nb-17-N-01 类） |

## G2 PASS_WITH_NOTES
行为/安全语义与源全对：全局单 profile、UA 不伪装、导航键 13、CDP 超时一次性闸门、观察预算 240/400/20+2/3 交互优先、URL 策略（CVE-2026-105482 NUL 前置、IPv4-mapped 一律拒、DNS 3s 防公网→私网）、DOM 固定函数体+JSON 序列化、preview 双边界、起始页 favicon 64KB/5s、controller 安全链/证书插页 allow=back 防循环/**空图显式失败**（kimi-k3 105s 死循环根因）/fill 回读闭环。测试计数 36 声明逐文件一致。

## 边界
产品测试/typecheck/build/GUI/真实模型/真浏览器全 **NOT_RUN**（36 测试声明仅静态读）；sealed 字节未改写；哈希脚本生成。

## 下一步
作者开 `deliveries/nb-80-r2/` 限引用修 F-01（顺带 N-01）；lead 合 17 篇（以 r2 最终字节为准）；QA 续 nb-94，r2 复验优先。
