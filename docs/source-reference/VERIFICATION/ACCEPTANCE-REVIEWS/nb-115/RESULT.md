# nb-115 独立复核报告（QA：docs-r07-qa-extra-06-20261024）

- 批：nb-115（p08-renderer-ui · p08.atoms-rest，18 文件/1301 行）；sealId `seal-0ed34e82325daaa3`；复核时间 2026-10-23T20:34:17Z
- **batchVerdict：accepted（18/18）**；1 minor 转 ERRATA（无阻断）

## G0 — PASS
机械链自洽（sealId 复算 `seal-0ed34e82325daaa3` 一致、18 manual 三方字节一致、源绑定 18/18、ZIP 21 条目无 READY/DONE/reviews）；格式 18/18（front matter 11 项、source 11 章/test 6 章、status=authored）。

## G1 — PASS
UNVERIFIED 5 节披露与 QA 预读独立发现吻合；17 test 计数（goal-atoms 15=7+4+4、overlay 2）与独立计数一致。

## G2 — 逐文件事实（18 accepted）
- 重点语义回源全对：goal-atoms 归并规则（revision 单调/tombstone/异 id 抢占/cleared 删除留 snapshot）、getGoalActions 矩阵、替换守卫顺序；graph-atoms null-fallback 链与 dependsOn 只增不删（aggregateTaskItems 第二参标未知不杜撰）；notifications planningReminder 悬挂（:190 vs :59-64）、同步版不播自定义、单槽回调、焦点矩阵；markdown-font-size 非原子；identity localStorage 明文（profer-auth-status）；environment null=OK；index.ts 桶零消费者（5 模式检索）。
- 回源抽查：goal-atoms 4 处 throw（:95/:98/:102/:103）；overlay 10 hook+1 派生消费点、draft-session 7 调用方、panel-layout 4 调用方等行号全对。

### Minor（转 ERRATA）
- **NB115-N-01**（goal-atoms §6）："3 种文案"与自列 2 种矛盾（4 处 throw 实为"已变化"×2+"正在停止"×2）。

## 边界
NOT_RUN=产品测试/typecheck/build/GUI/真实通知音频；未改源码/测试/依赖/作者正文/candidate/全局总账；未 commit/push。
