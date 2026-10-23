# 03 提交血缘及继承（固定快照）
基线：[`main 8989941b6fb5651564e32d11c4215b6a6d5a5209`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/commit/8989941b6fb5651564e32d11c4215b6a6d5a5209)。证据类型为 GitHub Compare REST；`ahead` 表示 head 独有提交，`behind` 表示 base 独有提交。按固定 SHA 可复核；路径比较可能不等于最终应用到现有 main 的内容。

## 验证的主干结构（仅表示提交祖先）
```text
main 8989941b6fb5 (2026-10-15)
├─ 历史合入：batch PR#1、D0.5 PR#2、D1 PR#3、D2 PR#8（相应 head 均是 main 祖先）
└─ P06 后续：#98 → #99/#101 → #103/#105/#106 → #108/#110 → #113/#114/#115/#116/#118
                  → #121 → #127/#130 → #131；#132 与 #131 HEAD 分叉（不是严格继承）
D3 独立线：release/d3-r0 4b191c729f3 → D3-R1 94d5ec32b6 → D4 COMMON a7a6a11d48
           ├─ G01…G08 模板分支（八支互相独立）
           └─ D4 集成 #97 b68443b232 → D4 产品 #100 b5a1bde69b → P1/P2 修复链 → #129 c2f965d290
```
注意：P06 上述 PR 顺序来自 PR base 引用链，不表示 #132 包含 #131 的全部提交；PR#21 旧后台特性相对 main / P06 R03 均为 diverged，不可按编号自动推断继承。

## 实测的分叉
| 基础 | 对象 | status | ahead | behind | merge-base | 结论 |
|---|---|---|---:|---:|---|---|
| main | D4 W1 #129 | diverged | 333 | 170 | `98708f965f09` | D4 主干未进入 main |
| main | P06 R03 #132 | ahead | 113 | 0 | `8989941b6fb5` | P06 从 main 派生，但也未合入 |
| D4 W1 | P06 R03 | diverged | 283 | 333 | `98708f965f09` | 不可直接认为兼容、互相包含 |
| COMMON #88 | 八领域集成 #97 | ahead | 15 | 0 | `a7a6a11d484` | 集成继承 COMMON |
| 八领域任一单独分支 | 集成 #97 | diverged | 15 | 5–61 | `a7a6a11d484` | 集成**不是**原各领域分支的提交级全继承；可能有挑拣/重做，需文件级对照 |
| P06 R02 #131 | P06 R03 #132 | diverged | 5 | 4 | `85fdc1038751` | R03 从 R02 共同中间节点分叉，非严格后继 |
| D4 P2-C #120 | D4 W1 #129 | ahead | 145 | 0 | `026cfe0f490` | 此处为真实提交继承 |
| Office #71 #110 | P06 R03 #132 | ahead | 70 | 0 | `6c8ee997da1` | 修复在 P06 R03 祖先链 |
| P06 P02 #106 | P06 R03 #132 | ahead | 76 | 0 | `6b96dbda825` | 修复在 P06 R03 祖先链 |
| 旧后台 PR#21 | P06 R03 #132 | diverged | 115 | 198 | `dd5a553c34a` | 旧后台 PR 不能仅凭新版本名认定全继承 |

八领域 #95/#89/#96/#93/#91/#92/#90/#94 与 #97 分别有 61/10/30/10/26/10/18/5 个仅属于原领域侧的提交；**提交未继承 ≠ 功能一定未移植**，需要 tree/blob、实现和真实测试三重对照。

## 已按 tree/blob 复核的典型内容
- `apps/electron/src/main/lib/review/review-d4-client.ts`、`review-d4-case-batch.ts`、`review-d4-routing.ts`：在 #129 HEAD 存在，main 与 P06 #132 不存在。
- `review-d4-common.ts`：#88 与 #129 blob 完全相同（`ebecfa76df7c`），main/P06 #132 不存在。
- `case-store-v2.ts`：main 与 P06 #132 blob 同为 `57094c3b0e8b`，D4 W1 是 `b96cae14ed72`。
- `review-ipc.ts`：main `a0f53fef91c6`，D4 W1 `18a5fe737362`，P06 R03 `593774d09098`；这是独立变更热点。
- `batch-run-provenance.ts` 在 P06 #131 HEAD 存在，而 #132 HEAD tree 不存在；R03 服务已有内联 Run/Batch 校验，是否行为等价需后续验证。

全量**已实际取证**的 compare 见 [07-verified-relations.csv](07-verified-relations.csv)。本轮未批量执行本地 `git cherry`、patch-id；此项明确保留为 UNKNOWN。
