# NB-106 独立复核报告（G0/G1/G2）— p08-renderer-ui · p08.components-agent-skills

- `nb-106`（sealId `seal-37377d40fcb344b5`，sealedAtUtc 2026-10-23T20:20:20Z）；frozenSha `05fb2565…37c2`。17 文件/4127 行（agent-skills 8 + yanhu 9；测试 2 件 32 声明）。
- **batchVerdict：accepted（17/17；1 minor→errata）**。

## G0 PASS
17 源绑定==SCOPE==MANIFEST；17 手册 hash 磁盘=MANIFEST=READY；链一致；ZIP 20 条目安全逐字节一致；changes.diff 空树重放 **17/17**。

## G2 PASS_WITH_NOTES（对照预读基线逐条吻合）
- **A** adapter 契约红线（renderer 不重算/不绕过；presetItem 拒 workspace scope）✓
- **B** 双副本启用 confirm + 写后 bump + isBuiltin 禁删 + 并发闸 ✓
- **C** 提升两步语义（默认保留=关闭原能力；删除不可恢复+引用保护）✓
- **D** SKILL.md 保守重写（BOM/无 frontmatter 原样/换行折叠）✓
- **E** isTrustedHost 仅 UI 三态绿锁 ✓
- **F** YANHU_DEV_COMMAND 纯前端拦截**零 Token**（submit 不调 onSend；IME Enter 防误提交）✓
- **G** pet-geometry 三算法逐式吻合（minYp 钳制/强制翻转/底对齐/PET_UNION_WIDTH=592）✓
- **H** 同步预检 detectConflict+forceSlugs ✓
- 测试计数 3+29=32 声明一致（pet-geometry.test 断言数学 392/592 抽核吻合）。

## Findings
| id | 级别 | 摘要 |
| --- | --- | --- |
| NB106-N-01 | minor | 各篇 §2 行号 ±1~10 漂移 +「行号经逐行核对」校订注过强（并入行号类 errata） |

## QA 自查留痕
预读清单「13 方法」笔误自校为 12（源 interface 实测 12 方法）。

## 边界
产品测试/typecheck/build/GUI/真实模型/真桌宠窗口全 **NOT_RUN**（32 声明仅静态读）；sealed 字节未改写；哈希脚本生成。

## 下一步
lead 按 17 exact manualSha256 机械合入；NB106-N-01 并 errata；QA 等 nb-80-r2/nb-94-r1 复验。
