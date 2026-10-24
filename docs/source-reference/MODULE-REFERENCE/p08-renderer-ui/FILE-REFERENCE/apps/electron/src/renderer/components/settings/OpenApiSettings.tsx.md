---
path: apps/electron/src/renderer/components/settings/OpenApiSettings.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d17c71c3ff49ce0561055cad60523f1a42ef3858
sha256: 988c6f9f8f5a21e7d2fb9a0a203057001e052dd0f2b26b4ae73e8f1ef08bb820
lines: 327
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/settings/OpenApiSettings.tsx

## 1. 结论与边界

**开放 API 页**（`:1-8`）：用户自建 `pk_` API Key（OpenAI/Anthropic 兼容 HTTP 访问）。铁律：**明文 key 只在创建时展示一次，列表只显示脱敏前缀**；curl 示例域名从 auth.baseUrl 动态取不写死。写路径=团队账号 HTTP API（`/v1/account/api-keys`）。

## 2. 导出与关键符号

1 导出：`OpenApiSettings`（`:40`）+内部接口 `ApiKey`（`:20`，9 字段全脱敏形状）与 `QUOTA_PER_UNIT=500000`/`quotaToPoints`（`:33-38`，积分=quota/500000/10×1000 保留 3 位小数最小 0.001）。

## 3. 内部逻辑与关键流程

- `api` 封装（`:56-67`）：`getTeamAuth` 缓存 baseUrl+Bearer token；未登录抛"未登录团队工作区"。
- `load`（`:68-82`）：GET keys；静默 catch。
- 创建/编辑弹窗（`:86-92,94-`）：`submit` 把积分反算 quota（积分/10=美元 ×QPU，`:95-97`）→POST/PATCH；新建成功→`setCreatedKey` **只此一次展示**（`:52` 注释）。
- 渲染：列表（脱敏前缀+用量+状态开关+删除确认）、文档折叠（docOpen）、curl 示例（baseUrl 动态）、明文展示态（复制+完成按钮，`:311-319`）。

## 4. 调用者与调用链

- 入向：`SettingsPanel.tsx`（renderTabContent open-api **渲染分支、无导航入口**——兼容既有内部跳转与后续恢复，源注释 `:133`；并非条件标签显示，照实）。
- 出向：`window.electronAPI.auth.getTeamAuth`、fetch（团队 API）。

## 5. 数据 I/O、读写与副作用

HTTP CRUD `/v1/account/api-keys`；Bearer token 经 auth API 获取（不在组件内持久化，ref 缓存 `:54`）。

## 6. 分支、失败、取消与恢复

未登录→空列表；加载静默失败（`:80`）；删除弹窗确认；明文态完成即清（`:313`）。

## 7. 权限与权威状态

key 明文暴露面=仅创建响应时刻（铁律 `:6`）；额度换算权威=`QUOTA_PER_UNIT`（`:33`）。

## 8. 修改影响面

开放 API 账号管理（团队后端耦合）。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无 test 文件）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 一次性明文/脱敏列表/积分换算/动态域名 | 已证实 | `:1-327` 全文 |
| 团队 API 服务端行为 | 边界 | 远端域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+内部 | §2/§3 | 20-325 | covered |
