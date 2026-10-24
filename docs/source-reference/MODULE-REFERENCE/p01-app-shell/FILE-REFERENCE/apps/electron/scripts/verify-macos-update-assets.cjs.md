---
path: apps/electron/scripts/verify-macos-update-assets.cjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3a4c405afea34554f355ed88ba6079bba0e22dd6
sha256: ea00a48df290014bcfa2c4977741fbb6a6a5ae7da1eed17e815c480ebe866ee5
lines: 66
kind: source
package: p01-app-shell
author: docs-r07-author-nb-05-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/scripts/verify-macos-update-assets.cjs

## 1. 结论与边界

**macOS electron-updater 发布资产校验**（66 行，头注释 `:2-7`）：macOS 更新用 **latest-mac.yml+ZIP**（DMG 仅首次安装不参与 Squirrel.Mac 后台更新）；只读检查 out/、不联网不写。

## 2. 导出与关键符号

无导出（CLI）。内部 `assertFile`（`:17`，存在+非空）。

## 3. 内部逻辑与关键流程

（`:22-64`）：latest-mac.yml 存在→`path: *.zip` 元数据（`:25-27`）→version 与 package.json 一致（引号剥离 `:28-31`）→`url/sha512/size` 三元组解析并选 ZIP 条目（URL basename 判定，`:33-41`）→ZIP 存在/size 一致（`:47-51`）→sha512 合法 base64+内容 hash 一致（`:53-58`）。

## 4. 调用者与调用链

- 入向：macOS 发布流程（域外）。
- 出向：node fs/crypto。

## 5. 数据 I/O、读写与副作用

只读 out/；无写。

## 6. 分支、失败、取消与恢复

任一断言失败→throw；无回滚。

## 7. 权限与权威状态

更新完整性权威=latest-mac.yml 的 sha512/size 与 ZIP 实际内容对账。

## 8. 修改影响面

macOS 更新发布门禁；electron-updater 客户端下载校验契约。

## 9. 测试证据

`NOT_RUN`。无直接测试（未运行脚本）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 五段对账流程/引号剥离/URL 判定 | 已证实 | `:1-66` 全文 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 脚本体 | §2/§3 | 12-64 | covered |
