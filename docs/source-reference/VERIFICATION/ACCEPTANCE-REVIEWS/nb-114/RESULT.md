# NB-114 独立复核报告（QA：docs-r07-qa-nb-47-20261023）

- 冻结 `05fb2565e20eb1760233696be1832f68196b37c2`（HEAD 核、clean）；scope 18 文件/1057 行（p08-renderer-ui · p08.atoms-rest）
- 交付：`deliveries/nb-114/`（seal_delivery.py/1 v2，sealId `seal-e77ac71f3ec5197f`）；作者 `docs-r07-author-nb-47-20261023`
- 复核基线：QA 独立预读 `reviews/nb-114/SOURCE-CHECKLIST.md`（18 文件全读）；本轮 18 篇手册比对
- **批次判定：revision_required（14 accepted / 4 revision_required / 0 unknown）**
- 测试/typecheck/build/GUI **NOT_RUN**

## G0 完整性（PASS）

18/18 源绑定 == MANIFEST == SCOPE；18/18 `manualSha256` == stage；DONE 三哈希链自洽；ZIP `R07-nb-114-05fb2565.zip` 21 条目（v2）无穿越/0 mismatch；人工列 18/18。

## G1 结构（PASS）；G2（14 PASS / 4 返修）

**正面确认**：8 条安全/契约红线全回源为真（cslab 门禁验证态绝不客户端持久化、cdut-account 绝不接触明文密码、browser 主进程权威+dismiss 防强开、app-mode chat 兼容读取、tour 指令/ack 防 DOM 模拟、automation agentRuntime 显式保存、presetOf 自定义直配契约、bulletin 每运行复位）；12 用例口径（4/4/1/3）四测试手册一致；15 篇计数正确。

**返修 4 篇（F-01..F-04，计数错，差一/低报型）**：

| id | 对象 | 摘要 |
| --- | --- | --- |
| F-01 | cslab-atoms.ts.md | DrawerMode「17 态」实 **18**（自列 18 名）；「30+ 导出」宜精化 **59** |
| F-02 | conversation-atoms.ts.md | 「导出 15 条」实 **21**（自列 21 名） |
| F-03 | automation-atoms.ts.md | 「导出 6 条」实 **8**（自列 8 位置） |
| F-04 | cslab-vesta-atoms.ts.md | 「导出 9 条」实 **10**（自列 10 位置） |

非阻断：M-01 红线确认+15 篇计数正确；M-02 诚实降级合规。

## 合入绑定

- **acceptedHashes（14）**：active-view/app-mode/browser/bulletin/cdut-account/coach-tour/developer-mode/cslab-origin/cslab-tour/agent-preset + 四测试手册。
- **rejectedHashes（4）**：F-01..F-04；`nb-114-r1` 修订后按新 hash 复验。
