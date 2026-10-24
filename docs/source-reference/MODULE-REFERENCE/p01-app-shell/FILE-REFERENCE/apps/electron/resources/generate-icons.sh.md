---
path: apps/electron/resources/generate-icons.sh
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5976d949f55cf0ce599f20fe0c0dad3787fc2824
sha256: 7dc32a4c2536515401c10290c3b6186517c27ff2c2b378e7d05d5a816c74534c
lines: 137
kind: script
package: p01-app-shell
author: docs-r07-author-nb-05-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/resources/generate-icons.sh

## 1. 结论与边界

**图标生成脚本**（137 行）：从 `CDUT_Studio.svg` 生成 icon.png(1024)/icns/ico+托盘图标族。依赖 ImageMagick(magick) 必需、rsvg-convert 可选（缺回退 magick 渲染）、iconutil/sips 仅 macOS（`:5`）。

## 2. 导出与关键符号

无导出（bash）。函数：`render_svg`（`:30`，rsvg-convert 优先保比例——注释 `:52-54` 只给 -w 免 2.46+ 依赖）、`render_tray`（`:40`，等比缩放居中补透明边；单色模式 RGB colorize 保留 alpha 供 macOS Template `:43-44`）。

## 3. 内部逻辑与关键流程

五段（`:51-127`）：①icon.png 1024（`render_svg`+extent 补方）②托盘 6 尺寸（22/44/66——macOS 22pt/@2x/@3x 规范 `:62-66`；iconTemplate 单色族+iconTray 彩色族）③icns（iconutil+sips 10 尺寸 iconset，`:80-105`）④ico（`icon:auto-resize=256…16`，`:112`）⑤**产物自检**（icon.png 尺寸必须 1024x1024+产物非空，任一异常 exit 1，`:115-127`）。

## 4. 调用者与调用链

- 入向：资源构建流程（手动/npm script，域外）。
- 出向：magick/rsvg-convert/iconutil/sips（系统工具）。

## 5. 数据 I/O、读写与副作用

读 SVG；写 icon.png/icns/ico+tray-icons/ 6 文件；中间产物 icon.iconset 清理（`:103`）。

## 6. 分支、失败、取消与恢复

工具缺失分支（magick 缺 exit 1；iconutil 缺跳过 icns `:24-26`）；`set -e`+自检门禁。

## 7. 权限与权威状态

产物正确性权威=自检段（`:115-127`"避免把坏图当作成功交付"）。

## 8. 修改影响面

三平台图标产物；托盘 Template 语义（macOS 自动适配深浅菜单栏）。

## 9. 测试证据

`NOT_RUN`。无直接测试（未运行脚本）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 五段流程/托盘规范/自检门禁 | 已证实 | `:1-137` 全文 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 脚本体 | §2/§3 | 30-137 | covered |
