---
path: apps/electron/src/main/lib/skin-manager-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8c3bb923a1e0a0813da60ba706604c9464434cf3
sha256: 5251c53087048e601869446a6f641a94ae1913bc9631c067a0d0baa589e67cf8
lines: 209
kind: source
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/skin-manager-service.ts

## 1. 结论与边界

**皮肤包安装/删除/选取服务**：多层限额与安全校验（§2 常量+§3 校验链），导入侧与运行时共用规则（防双写漂移 `:89/:99`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `installSkinFromFolder` | function（export） | `:165` | 文件夹安装 |
| `installSkinFromZip` | function（export） | `:166-189` | ZIP 安装（两预检+路径安全 `:178-185`） |
| `deleteUserSkin` | function（export） | `:190-197` | 删除（id 正则+禁删内置 `:191-192`） |
| `selectSkinZip`/`selectSkinFolder` | function（export） | `:198-206` | 系统对话框 |
| `openUserSkinsFolder`/`openSkinTemplateFolder` | function（export） | `:208-209` | shell 打开目录 |

内部限额：包 5MB/单图 4MB（**1536×1024 PNG 常超 2MiB，4MiB 免静默拒** `:11-12`）/预览 2MB（**base64 ×1.33 常驻内存，单独收紧** `:14-20`）/ZIP 20MB/解压 20MB（防 zip 轰炸 `:23`）；正则 `ASSET_RE`（**大小写敏感**，`Assets/` 会在运行时 403 图片静默丢失 `:25-27`）/`ID_RE` kebab-case/`PREVIEW_RE`；`dirSize`（symlink 不递归+深度 12 防 junction 环 `:33-45`）、`assertNoSymlinks`（**包内禁符号链接防本地文件读取** `:46-61`）、`validateAssets`（`:62-75`）、`resolvePackageRoot`（`:76-80`）、`validatePackage`（`:81-146`）、`installDirectory`（`:147-164`）。

## 3. 内部逻辑与关键流程

**校验链**（`validatePackage`）：manifest 位置→skin.css 存在→**禁符号链接**→体积→`auditSkinCss`（与运行时同套规则 `:89-91`）→CSS ≤512KB→**引用图片必须存在**（`:93-96`）→assets 校验（扩展名小写白名单/Windows 保留名（词干 `:69`）/单图限额）→manifest 解析（**单一入口 parseSkinManifestText** `:99`）→id kebab+**Windows 保留名拒**（`:111`）→name 非空→预览图校验（`:113-119`）。contractVersion **仅能力声明不作安装门槛**（v1 恒兼容 `:127-130`）。
**安装**（`:147-164`）：禁覆盖内置（`:151`）；冲突 status 'conflict' 可 replace；临时目录 copy→rename（原子换）→`invalidateSkinCache`。
**ZIP**（`:166-189`）：ZIP 本体 20MB 预检→逐条目**路径安全**（禁 `/` 开头/`..`/绝对路径 `:181`）→解压前累计 uncompressed 20MB 预检（`:182-184`）→解压→安装。

## 4. 调用者与调用链

入向：皮肤 IPC/设置 UI/Agent 皮肤工具。出向：`./skin-service`（7 符号 `:7`）、`./skin-name-guards`（同批）、electron（app/dialog/shell/BrowserWindow）、adm-zip、`node:fs`。

## 5. 数据 I/O、读写与副作用

读写用户皮肤目录（临时目录+rename）；解压 ZIP 到 tmpdir；dialog/shell；console 无。

## 6. 分支、失败、取消与恢复

全失败路径 `fail()` 结构化（ok:false+message）；安装异常清 temp（`:163/:188`）。不适用取消/恢复。

## 7. 权限与权威状态

安全红线：禁符号链接（`:46`）、ZIP 路径穿越拒（`:181`）、Windows 保留名统一拒（跨平台 `:15-16` 语义在守卫模块）、大小写敏感防运行时 403（`:25-26`）、内置皮肤不可覆盖/删除。

## 8. 修改影响面

改校验/限额 → 皮肤安装 UX 与安全面；改 manifest 解析牵动扫描注册表（共用入口）。

## 9. 测试证据

**直接测试 `skin-manager-service.test.ts`（8 用例，NOT_RUN）**：Windows 保留名 6+2、预览限额 2——断言见测试手册。未覆盖：ZIP 路径穿越/符号链接/审计失败。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 导出+7 内部+校验全链 | 已证实 | 逐行读 `:1-209` |
| 测试 8 用例断言 | 已证实 | 测试文件；NOT_RUN |
| skin-service 共用规则 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 7 导出+校验链 | §2/§3 | `:81-209` | covered |
| 测试 | §9 | 测试文件 | covered（NOT_RUN） |
