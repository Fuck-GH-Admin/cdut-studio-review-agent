---
path: apps/electron/scripts/crop-cdut-white-logo.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2a66a8adbf028d8eb25101519cc4d75e8aedb326
sha256: f044714770e62e6df60e78f74d2a2fa18b36e9a038e0e685ea35e27cca14cd52
lines: 64
kind: source
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/scripts/crop-cdut-white-logo.ts

## 1. 结论与边界

一次性资产脚本（64 行，bun 执行）：裁切校徽反白版并校验几何重合。背景（`apps/electron/scripts/crop-cdut-white-logo.ts:1-10`）：反白版与 `assets/CDUT/CDUT-CE.png` 有效内容完全一致，仅因 A4 画幅垂直居中多出上下留白，裁掉 Y=300 起的 1681 行即得同尺寸产物；裁后必须命中同一 BBox，否则说明偏移量不是 300。边界：只做这一次资产处理，不参与构建/打包链（无调用点，见 §4）。

## 2. 导出与关键符号

无导出（CLI）。参数：`argv[2]` = 反白版源图 PNG 路径（必填，`:14`）；`argv[3]` = 输出路径（缺省 `../../assets/CDUT/CDUT-CE-white.png`，`:15`）。

内部符号：常量 `CROP`（内部，`:18`，`{x:0, y:300, width:3509, height:1681}`，与 CDUT-CE.png 一致的裁切窗口）、`EXPECTED_BBOX`（内部，`:20`，`{minX:956, minY:271, maxX:2496, maxY:1460}`，原版有效内容包围盒）。
- 内部函数 `measureBBox(png)`（内部，`:28-43`）：全像素扫描 alpha>0 像素求 `{minX,minY,maxX,maxY}` 包围盒。

## 3. 内部逻辑与关键流程

1. 参数校验（`:22-25`）：无 SRC → `console.error('缺少源图路径。用法：bun run scripts/crop-cdut-white-logo.ts <源图.png> [输出.png]')` → `process.exit(1)`。
2. 读图与尺寸校验（`:45-48`）：`PNG.sync.read(readFileSync(SRC))`；宽/高不足 `CROP.x+width`/`CROP.y+height` → `throw new Error('源图尺寸不足：…')`（未捕获，进程非 0）。
3. 裁切写盘（`:50-52`）：`new PNG({width:CROP.width, height:CROP.height})` → `PNG.bitblt(src, out, CROP.x, CROP.y, …, 0, 0)` → `writeFileSync(OUT, PNG.sync.write(out))`。
4. 几何校验（`:54-63`）：`measureBBox(out)` 打印「[裁切校验] 输出 … (WxH) <box>」；逐键比对 EXPECTED_BBOX，不一致键收集后 `throw new Error('裁切后 BBox 与原版不一致（<keys>），请检查垂直偏移（应为 300）')`。
5. 通过日志（`:64`）：`[裁切校验] 通过：与原版 BBox 完全重合`。返回值：进程退出码（成功 0）。

## 4. 调用者与调用链

- 入向：无。全树 grep（工具：ripgrep，pattern `crop-cdut-white-logo`）仅命中本文件注释 `:5` 与错误文案 `:23` 自身；无 package.json script（`apps/electron/package.json` grep 零命中）、无 CI、无测试引用。手动执行方式见 `:4-5`（`bun run scripts/crop-cdut-white-logo.ts "<源图.png>" [输出路径]`）。
- 出向：`node:fs`（readFileSync/writeFileSync）、`pngjs`（PNG.sync.read/write、PNG.bitblt）。

## 5. 数据 I/O、读写与副作用

- 读：argv[2] 指定 PNG（全量解码）。
- 写：argv[3] 或缺省 `../../assets/CDUT/CDUT-CE-white.png`（`writeFileSync` 直写，无 tmp+rename；重跑覆盖，幂等）。
- 无网络/缓存/全局状态；副作用：console 日志 ×2、磁盘产出一张 PNG。

## 6. 分支、失败、取消与恢复

- early-exit：缺 SRC（exit 1，文案见 §3.1）。
- throw（未捕获 → 进程非 0）：源图尺寸不足（`:46-48`）、BBox 不一致（`:59-62`，列出不一致键名）。
- 失败后状态：BBox 不一致时输出文件**已写盘**（写在校验之前，`:52` 先于 `:54`），需人工删除或覆盖；无回滚。恢复：修正偏移/源图后重跑覆盖。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。权威状态：几何一致性权威 = `EXPECTED_BBOX`（`:20`，取自原版 CDUT-CE.png 有效内容包围盒）；裁切窗口权威 = `CROP`（`:18`）。

## 8. 修改影响面

- 一次性资产产物 `assets/CDUT/CDUT-CE-white.png`（品牌素材，产品 UI 引用，域外）。
- `CROP`/`EXPECTED_BBOX` 常量是与 `assets/CDUT/CDUT-CE.png` 的几何契约；原版素材尺寸变更会使本脚本失效。
- 无构建/CI 接线（§4 否定结论），改动不影响打包流程。

## 9. 测试证据

`NOT_RUN`（本轮未运行任何脚本/测试，纯静态阅读）。无测试（全树 grep `crop-cdut-white-logo` 于 *.test.ts 零命中）。间接证据：无。测试断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 参数语义、裁切窗口、BBox 校验与失败文案 | 已证实 | `apps/electron/scripts/crop-cdut-white-logo.ts:1-64` 全文 |
| 无任何调用点（手动一次性脚本） | 已证实 | 全树 grep `crop-cdut-white-logo` 命中仅自身 |
| 校验失败时输出已写盘（无回滚） | 已证实 | `:52` 写盘先于 `:54-63` 校验（静态顺序核对） |
| 常量数值与当前资产实况一致 | 未知 | 需读 PNG 像素取证，NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 参数校验 exit 1 | §2/§3/§6 | 14-15, 22-25 | covered |
| measureBBox | §2/§3 | 28-43 | covered |
| 尺寸不足 throw | §3/§6 | 45-48 | covered |
| 裁切 + 写盘 | §3/§5 | 50-52 | covered |
| BBox 校验 throw / 通过 | §3/§6 | 54-64 | covered |
| CROP/EXPECTED_BBOX 契约 | §2/§7/§8 | 17-20 | covered |
