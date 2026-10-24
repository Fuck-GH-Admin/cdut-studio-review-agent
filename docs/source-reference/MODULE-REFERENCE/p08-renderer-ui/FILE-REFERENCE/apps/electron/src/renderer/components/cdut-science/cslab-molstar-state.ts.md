---
path: apps/electron/src/renderer/components/cdut-science/cslab-molstar-state.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e40d23481d24cacd7111b04dfd10bf85b0f466eb
sha256: 6f9738bf7e294a161a8a66de70430837e4a16f3fe3c32be99b2c5afe78c909c6
lines: 307
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/cslab-molstar-state.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

Mol* 自定义状态层（307 行，头注 :1-7）：Miller 晶面切片/配位多面体/等值面三个自定义 StateTransformer；**版本敏感深路径导入收敛本文件**便于升级单点修正；MeshBuilder 无 addPlane 故自构双面三角形。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CSLAB_PLANE_COLOR` | const | 21 | 0x3399ff |
| `DrawMillerPlane` | StateTransformer | 33-111 | 晶面切片（正反双面三角形，:68-71） |
| `DrawCrystalPolyhedra` | StateTransformer | 137-206 | 配位多面体网格 |
| `DrawIsoSurface` | StateTransformer | 211-291 | 等值面（顶点法线优先回退面法线） |
| `buildPluginSpec` | fn | 294-302 | 仅追加 actions 不改默认能力 |
| `MillerPlaneParams` | interface | 304-307 | h/k/l/normal/center/size |

内部：`safeNormal`（:23-27，零范数回退 [0,1,0]）、`emptyShape`（:113-128）、`triangleNormal`（:130-143，退化回退 [0,0,1]）。

## 3. 内部逻辑与关键流程

1. **`DrawMillerPlane`**（:33-111）：`planeBasis(normal)` 构造 u/v→四角→**正反各两三角形**（注释 :67「透明材质下从任意侧都可见」）。
2. **`DrawCrystalPolyhedra`**（:137-206）：faces 三元组→逐三角 `triangleNormal`；顶点/面不足→`emptyShape`。
3. **`DrawIsoSurface`**（:211-291）：positions/indices 网格；法线优先用顶点法线（`pointNormal`，长度/稀疏回退 null）→`triangleNormal`。
4. **`buildPluginSpec`**（:294-302）：`DefaultPluginSpec()` 后仅 append 三个 Action（注释 :293「不改动其它默认能力」）。

## 4. 调用者与调用链

入向：`CsLabMolstarViewer`（plugin spec 构建）。出向：`molstar/lib/*` 深路径（:10-18，版本敏感收敛）、`@profer/shared`（planeBasis，:19）。

## 5. 数据 I/O、读写与副作用

Mol* 状态树操作；无磁盘/网络。

## 6. 分支、失败、取消与恢复

参数不足→空 shape（不抛）；退化法线→固定回退向量。

## 7. 权限与权威状态

- 几何诚实：退化输入回退显式常量不产生 NaN；版本敏感导入单点收口（:5-7）。无 sender/role 检查。

## 8. 修改影响面

晶体 3D 视图渲染：`CsLabMolstarViewer` 的 plugin spec 构建、晶面切片/配位多面体/等值面三层叠加。
- 波及面：三个 StateTransformer 注册进 Mol* 状态树；版本敏感深路径导入升级时单点修正面即本文件。
- 回归关注：退化法线回退常量（不产生 NaN）、`buildPluginSpec` 仅追加 actions 不改默认能力、双面三角形可视性。
- 无专属测试文件（全树检索确认）；回归须靠 Mol* 渲染人工验证。

## 9. 测试证据

直接测试：无。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 导出/内部符号/行号 | 已证实 | 逐行核对 |
| 双面切片/法线回退语义 | 已证实 | :68-71/:23-27/:130-143 |
| Mol* 真实渲染行为 | 未知 | 无测试、NOT_RUN |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 三个 StateTransformer | §3 | 33-291 | covered（未测） |
| `buildPluginSpec` | §3.4 | 294-302 | covered（未测） |
