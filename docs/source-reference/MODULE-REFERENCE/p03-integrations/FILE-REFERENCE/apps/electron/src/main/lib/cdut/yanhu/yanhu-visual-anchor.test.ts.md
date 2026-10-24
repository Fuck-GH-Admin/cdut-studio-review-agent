---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-visual-anchor.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4ce4951fcaf50647fae85d32f69703b7ea82fcbf
sha256: df8beefd64be1edf4195c066a433f4022eff3a240a0fa7c7c4679a34b9e339a7
lines: 189
kind: test
package: p03-integrations
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-visual-anchor.test.ts

## 1. 测试目标

双平面锚定引擎单测（文件头 `:1-6`）：单应性最小二乘精度（BDD-VISION-01 要求 Δ<2px）、视觉→DIP 映射、无地标纯缩放回退、快照缓存读写、页内磁吸脚本可编译。被测：`yanhu-visual-anchor` 全部导出。夹具：真实单应性生成对应点、DOM 桩（`new Function('document', script)` 执行生成脚本）。本轮 `NOT_RUN`。

## 2. 用例清单

5 describe、**11 test**：

### 2.1 `solveHomography`（2，`:23-52`）
1. `:24-47` 由真实 H（`[1.2,0.1,5,…]`）生成 7 点→求解→检查点 (620,430) 误差 **Δ<2px**（x/y 各断言）。
2. `:49-51` 3 地标 → `toBeNull`。

### 2.2 `visualToDip`（3，`:54-89`）
3. `:57-73` 5 地标标定后 (500,500)→(500,400) 误差 ≤3px。
4. `:75-83` 无地标：`homography` null、(500,500)→(500,400)、(0,0)→(0,0)、(1000,1000)→(1000,800)、**越界 (-50,2000)→(0,800) 收敛进视口**。
5. `:85-88` `visualToPixel` 按物理像素换算（(500,500)→(500,400)）。

### 2.3 `selectSpreadLandmarks`（1，`:91-99`）
6. `:92-98` 3 候选原样返回、20 候选裁剪至 8。

### 2.4 快照缓存（1，`:101-109`）
7. `:102-108` set→get 同引用（`toBe`）→release→null。

### 2.5 磁吸脚本（4，`:111-189`）
8. `:112-119` 脚本可 `new Function` 解析；内联 `cx=120/cy=340/R=12`、含 `elementFromPoint`。
9. `:134-148` 小控件（30×16 span“因私请假”）→ `snapped:true`、吸附几何中心 (105,100)、hit.name 保留。
10. `:150-163` 面板级大容器（1200×600）→ **`snapped:false`、原坐标 (320,274) 落地**（绝不拖到容器中心）。
11. `:165-188` 文本节点祖先是大容器 → 吸附**文本自身中心 (335,279)** 而非容器中心 (600,300)。

## 3. 真实断言

- #1 用真实单应性生成数据验证最小二乘还原精度（Δ<2px，BDD-VISION-01）。
- #10/#11 是“控件尺度上限”历史缺陷的回归断言（数字精确到像素）。
- #4 断言 clamp 边界四角。
- DOM 桩执行真实生成脚本（非字符串匹配，#8 除外）。

## 4. 未覆盖与脆弱点

**未覆盖**：`applyHomography` 分母近零；`solveLinearSystem` 奇异路径；十字补漏分支（probe 多点）；isInteractive 各 tag/role；`visualToDip` 非有限回退。

**脆弱点**：`new Function` 依赖生成脚本语法；DOM 桩最小化（parentElement 单层）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 describe、11 test、真实数值+脚本执行 | 已证实 | `:23/:54/:91/:101/:111`；`grep -c test(`=11 |
| 最小二乘 Δ<2px | 已证实 | `:24-47` |
| 回退/收敛/像素换算 | 已证实 | `:75-88` |
| 磁吸三语义（吸附/不吸附/不上溯拖走） | 已证实 | `:134-188` |
| 奇异/补漏分支 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `solveHomography` | #1/#2 | `:24-51` | covered |
| `visualToDip`/`visualToPixel` | #3-#5 | `:57-88` | covered |
| `selectSpreadLandmarks` | #6 | `:92-98` | covered |
| 快照缓存 | #7 | `:102-108` | covered |
| 磁吸脚本 | #8-#11 | `:112-188` | covered |
