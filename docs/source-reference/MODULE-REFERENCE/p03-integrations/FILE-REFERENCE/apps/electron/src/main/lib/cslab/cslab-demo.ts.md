---
path: apps/electron/src/main/lib/cslab/cslab-demo.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f5968e1d2842ffe41c5c64c98509b778f7615aff
sha256: ba03162088ca0360fb4c1e4fb7fae29e0306f099e7e6ca794fcd0ae24e4dd8d5
lines: 194
kind: source
package: p03-integrations
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-demo.ts

## 1. 结论与边界

CSLab **演示实验室工厂**（`apps/electron/src/main/lib/cslab/cslab-demo.ts:135` 注释）：创建或复用「演示实验室 · Origin × VESTA」（`:34`），导入演示数据文件并预生成 4 套出版图；演示 PNG 按标题**幂等**登记为 `fig` 资产。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `createDemoLab` | 函数 | `:136-188` | `(options:{demoDir?}) => Promise<CsLabDemoLabResult>` |
| `findDemoLab` | 函数 | `:189-193` | `() => CsLabLab \| undefined` |
| `CSLAB_DEMO_FILES` | const | `:194` | 演示文件清单（`DEMO_FILES`） |

内部：`DEMO_LAB_NAME`（`:34`）、`DEMO_DATA_FILES`（`:36-50`）、`DEMO_FIGURE_FILES=['demo-digitizer-spectrum.png']`（`:52`）、`resolveDemoDir`（`:58-65`：override→`CSLAB_DEMO_DIR` env→打包 `resources/cslab/demo`→`appPath/resources/cslab/demo`）、`assertDemoFiles`（`:67-83`，缺失即抛「演示数据缺失：…」）、`ensureDemoFigure`（`:91-133`）。

## 3. 内部逻辑与关键流程

- **`ensureDemoFigure`**（`:91-133`）：按 `(layerType='fig', title=fileName)` 幂等查 `listAssets`（`:96-99`）；新建则 `vault/figures/<ts>-<uuid6>-<sanitized>` 复制+哈希（`copyFileWithHash`）+ `lockFileReadOnly`（`:101-106`），`withTransaction` 内 `upsertEntity`（`format:'png'`、`revision=nextLabRevision`，`:108-130`）。
- **图像绕过仪器解析的原因**（`:86-90` 注释）：`sniffFormat` 对 `.png` 返回 unknown，直接 `ingestFiles` 会标 unsupported 中断创建。
- `createDemoLab`（`:136-188`）：`resolveDemoDir`→`assertDemoFiles`（缺失抛）→ 创建/复用 lab→导入 `DEMO_DATA_FILES`→逐个 `ensureDemoFigure`→预生成 4 套出版图（`cslab-demo-plates.ts`）。

## 4. 调用者与调用链

- 消费方：CSLab 演示入口（IPC/设置页）。
- 出向：cslab-db 系（`getCsLabDatabase/withTransaction/upsertEntity/nextLabRevision`）、资产工具（`listAssets/copyFileWithHash/lockFileReadOnly`）、`cslab-demo-plates`（本批同组）。

## 5. 数据 I/O、读写与副作用

- **文件**：读 `resources/cslab/demo/*`；写 lab `vault/figures/`（含只读锁）。
- **DB**：`central_meta.sqlite` upsert。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 演示文件缺失 | `:79-81` | 抛（含期望目录） |
| fig 已登记 | `:98-99` | 幂等复用 |
| demo 目录解析 | `:58-65` | 四级回落 |

## 7. 权限与权威状态

无身份语义；演示 lab 为固定名（`:34`）的普通 lab。

## 8. 修改影响面

- `DEMO_FILES` 清单与资源目录耦合；`sniffFormat` 绕过逻辑（`:86-90`）与 ingest 链耦合。
- 幂等键（title=fileName）改动会重复登记。

## 9. 测试证据

`cslab-demo.test.ts`（174 行）直接覆盖（见该测试手册）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 个导出、幂等登记 | 已证实 | `:91-194` |
| PNG 绕过 sniffFormat 原因 | 已证实（注释） | `:86-90` |
| 4 套出版图预生成 | 已证实 | `:135` 注释 |
| 实际创建效果 | 未知 | 未运行 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 3 个导出 | `:136-194` | covered |
| `ensureDemoFigure` | `:91-133` | covered |
| 目录解析/缺失检查 | `:58-83` | covered |
