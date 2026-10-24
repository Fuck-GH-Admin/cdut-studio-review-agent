---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-visual-anchor.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1e64d354f7da762b79c31bc9164aa12d181845a9
sha256: 67113257f336479bfd24dfd3fecb25e260ab6b506e43bf9804672e3a1f4eb3db
lines: 308
kind: source
package: p03-integrations
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-visual-anchor.ts

## 1. 结论与边界

智联万站·双平面平行坐标锚定引擎（文件头 `:1-14`）：视觉图像平面（模型像素/归一化坐标 [u,v]∈[0,1000]²）与真实 DOM 物理平面（DIP）映射——截屏时选 4~8 个最离散可见叶子控件作地标（Landmark Grounding）、最小二乘求单应性 H₃ₓ₃ 消除高分屏形变、视觉坐标经 H 映射回 DIP 后由页内 `elementFromPoint` 半径 ε 磁吸对齐精确落地。纯函数（除按标签缓存快照的模块级 Map）。

不做的事：不执行点击（生成脚本由调用方注入页面）；不截屏。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `VisualLandmark` | interface | `:17-26` | `{u,v（视觉归一化）; x,y（DOM DIP）; label?}` |
| `Homography` | type | `:29` | 长度 9 行优先 `[h0..h7, h8=1]` |
| `VisualAnchorSnapshot` | interface | `:32-44` | 视口 DIP/物理像素尺寸+地标+`homography: Homography\|null`（<4 地标退回纯缩放） |
| `VISUAL_COORD_MAX`/`VISUAL_SNAP_RADIUS_PX`/`MAX_VISUAL_LANDMARKS` | consts | `:47-51` | 1000/12/8 |
| `solveLinearSystem` | function | `:57-94` | 高斯消元（部分主元）；奇异/病态（主元<1e-12）→ null |
| `solveHomography` | function | `:102-134` | 最小二乘正规方程 `(AᵀA)h=Aᵀb` 求 h0..h7；<4 地标/病态 → null |
| `applyHomography` | function | `:137-144` | 透视映射（分母<1e-9 → null） |
| `selectSpreadLandmarks` | function | `:147-157` | 按 y/x 排序后索引步长均匀挑 ≤max 个 |
| `buildVisualSnapshot` | function | `:160-181` | 构建快照（尺寸 max(1,round)） |
| `visualToDip` | function | `:196-211` | H 优先、退纯缩放；结果 `clampToViewport` |
| `visualToPixel` | function | `:214-223` | 像素对照（非点击用） |
| `setVisualSnapshot`/`getVisualSnapshot`/`releaseVisualSnapshot` | functions | `:230-242` | 按标签缓存 Map |
| `buildVisualSnapScript` | function | `:255-308` | 页内磁吸对齐脚本生成 |

内部：`clampToViewport`（`:184-189`）；`snapshots` Map（`:227`）。

## 3. 内部逻辑与关键流程

### 3.1 数值核心（`:57-157`）

`solveLinearSystem` 增广矩阵深拷贝、部分主元、消元；`solveHomography` 每点两方程（8 未知量）、正规方程 8×8 求解、h8=1 归一；`selectSpreadLandmarks` 排序后均匀取样保证空间分布。

### 3.2 映射（`:196-223`）

`visualToDip`：H 可用且有限 → 透视映射+clamp；否则线性缩放+clamp（**始终有可用坐标**）。`visualToPixel`：纯比例（供模型像素对照）。

### 3.3 磁吸脚本 `buildVisualSnapScript`（`:255-308`）

生成自执行 JS：`elementFromPoint` 探测→上溯（≤8 代）找“可交互且**控件尺度**（≤480×140）”目标→吸附几何中心；命中元素本身够小也可吸附，否则**不吸附**按原坐标落地（`:290-291`）。半径 R 十字方向补漏（`:294-298`）。返回 `{ok, x, y, snapped, hit:{tag,name}}`（name 截 40 字）。**历史缺陷约束**（`:250-253`）：祖先上溯必须设控件尺度上限，否则普通文本上溯到面板级大容器被吸附中心、“磁吸后反而越点越偏”。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）：智联万站视觉点击链（capture_visual 标定→视觉点击映射）；直接测试 `yanhu-visual-anchor.test.ts`。出向：无 import（纯模块）。

## 5. 数据 I/O、读写与副作用

模块级 `snapshots` Map（按标签缓存）；其余纯函数。无 I/O。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 奇异/病态/<4 地标 | `:78/:107/:131-132` | null（退回纯缩放） |
| 映射分母近零/非有限 | `:139/:203` | 退缩放/clamp |
| 磁吸找不到控件尺度目标 | `:290-299` | 不吸附、原坐标落地 |
| 取消/恢复 | 无 | 纯函数 |

## 7. 权限与权威状态

诚实口径：`visualToPixel` 明示“非点击用”（`:213`）；磁吸“找不到宁可不吸附”（`:253`）；坐标 clamp 防视口外点击。

## 8. 修改影响面

改映射/磁吸 → 影响视觉点击精度与模型坐标对照；快照 Map 生命周期由调用方（标签关闭 release）管理。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `yanhu-visual-anchor.test.ts`（详见其手册）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 最小二乘单应性+退化回退 | 已证实 | `:57-157/:196-211` |
| 控件尺度上限（历史缺陷修复） | 已证实 | `:250-253/:260-267` |
| 十字补漏+不吸附保底 | 已证实 | `:290-299` |
| 快照缓存三 API | 已证实 | `:227-242` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 类型/常量 | 2 | `:17-51` | covered |
| 数值核心 | 3.1 | `:57-157` | covered |
| 映射族 | 3.2 | `:160-223` | covered |
| 快照缓存 | 2 | `:225-242` | covered |
| 磁吸脚本 | 3.3 | `:255-308` | covered |
