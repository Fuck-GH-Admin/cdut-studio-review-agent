---
path: apps/electron/src/main/lib/adapters/pi-skill-resources.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 55f397f0e07efdbba87e979402f706f70178bf46
sha256: caa7f067c6517d585aa484a154a19e7e8046d8f14beedac7323ca954b99f41b2
lines: 187
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-skill-resources.ts

## 1. 结论与边界

**Pi 受管 Skill 目录身份、恢复加载与显式引用**（`pi-skill-resources.ts:1`）：`createPromaSkillsOverride` 以受管目录白名单+规范 slug 收敛 SDK Skill 加载（防 symlink 逃逸/防碰撞泄露/防歧义误选）；`preparePromptWithPromaSkills` 把 `/skill:` 引用展开为内联 `<skill>` 块（fail closed，诊断不含路径）。红线：诊断**不携带原始 SDK message/路径/collision winner**（`:40`）；`[]` 显式不引用，仅 `undefined` 保留旧扫描（`:155`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/说明 |
| --- | --- | --- | --- |
| `createPromaSkillsOverride` | function（export） | `:49-131` | `(additionalSkillPaths?, skillSlugs?, loadDirectory?) => (base) => SkillLoadResult`；slug 语义：undefined 保留全部/[] 禁全部/非空白名单（`:44-45`） |
| `preparePromptForPiSkillQueue` | function（export） | `:151-153` | `/skill:` 开头前置 `\n` 避开 SDK startsWith 命令分支（`:150`） |
| `preparePromptWithPromaSkills` | function（export） | `:156-187` | `(loader, prompt, explicitSkillNames?) => Promise<string>` |

内部：`ManagedSkill`+`labelAlias` Symbol（SDK spread 保留但不进 JSON，`:9-11`）、`SKILL_COMMAND_PATTERN`（标点结束，保留冒号/斜杠完整拒绝 qualified/路径误引用 `:12-13`）、`guardedRealPath`（symlink 守卫 `:15-28`）、`isWithin`（`:30-33`）、`canonicalSlug`（`:35-37`）、`diagnostic`（脱敏 `:39-42`）、`resolveReference`（`:133-144`）、`escapeXml`（`:146-148`）。

## 3. 内部逻辑与关键流程

1. **`createPromaSkillsOverride`**：roots 去重 guardedRealPath（`:54`）；`allowed?.size===0` → 空结果（`:59`）；base 诊断过滤 collision 与 roots 外路径后**重写为脱敏消息**（`:60-62`）；`add` 双 within 守卫+slug 白名单+labelAlias 保留（`:66-72`）；`visit` 递归目录（跳过 dot/node_modules `:104`，symlink 也走 `:105`）——`SKILL.md` 存在即经 `loadDirectory` 解析（`:81-101`，盘上 parser 覆盖 synthetic fixture `:73/:95`）；异常→脱敏诊断（`:107-109`）。**slug 冲突 fail closed**：同 slug 只取规范目录（basename==slug），否则"多个匹配项"跳过（`:112-125`）；白名单缺项也给诊断（`:126-128`）。
2. **`resolveReference`**（`:133-144`）：规范 slug 优先，label alias 次之；0 或 >1 匹配 → 脱敏拒绝消息。
3. **`preparePromptWithPromaSkills`**（`:156-187`）：names=显式 ?? 正则扫描（`:157`）；`[]` 短路不 reload（`:158`）；reload 失败→诊断前缀保留任务（`:160-163`）；逐引用展开 front-matter 剥除（`:178`）+ XML 转义（`:179`）+ 文件去重（`:174-175`）；不可读→脱敏诊断（`:181-183`）。

## 4. 调用者与调用链

- 入向：Pi adapter 的 skillsOverride 注入与 direct/queue prompt 准备（adapters 链，跨文件）；测试 `pi-skill-resources.test.ts`（11 用例）。
- 出向：`node:fs`/`node:path`、`@earendil-works/pi-coding-agent`（类型+运行时 loader）、`../default-skill-slugs`（`:5`）。

## 5. 数据 I/O、读写与副作用

读：Skill 目录/`SKILL.md`（`readFileSync` `:177`）；无写。副作用=fs 遍历、`resourceLoader.reload()`（`:160`）。确定性（同输入同输出）。

## 6. 分支、失败、取消与恢复

fail closed 族：symlink 越界跳过（`:85-88`）、碰撞跳过（`:124`）、歧义引用拒绝（`:141-143`）、reload/读文件失败→诊断保留任务（`:162/:182`）、循环 symlink 不挂起（guardedRealPath 走到存在祖先 `:18-27`）。不抛错到调用方。

## 7. 权限与权威状态

安全边界为本文件核心：受管目录白名单（withinRoots）、诊断脱敏（`:40`）、显式引用语义（`:155`）。无 OS 权限分支（文件读取失败走诊断）。

## 8. 修改影响面

改加载/引用语义 → Pi Skill 供给（direct/queue 两路）、prompt 展开内容；11 用例测试锁定安全边界。

## 9. 测试证据

**直接测试 `pi-skill-resources.test.ts`（11 用例，bun:test，NOT_RUN）**：白名单外损坏文件不读+不泄露 collision 路径（`:34-44`）、symlink 逃逸/循环（`:46-59`）、缺失根诊断无路径（`:61-67`）、chmod 不可读不保留 stale（`:69-85`，win 跳过）、label alias 歧义 fail closed+canonical 优先（`:87-100`）、旧 slug 兼容（`:102-108`）、跨根冲突不选赢家（`:110-120`）、SDK 原生展开被抑制且禁模型请求（`:122-154`）、中英标点结束（`:156-165`）、qualified 引用不截断（`:167-174`）、`[]` 不扫描+reload 失败脱敏（`:176-189`）。逐条见测试手册。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出+7 内部+fail-closed 族 | 已证实 | 逐行读 `:1-187` |
| 测试 11 用例断言 | 已证实（静态） | 测试 `:1-190`；NOT_RUN |
| SDK loadSkillsFromDir 行为 | 未知 | 外部 SDK |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| createPromaSkillsOverride | §3.1 | `:49-131` | covered |
| preparePromptWithPromaSkills/Queue | §3.3 | `:151-187` | covered |
| 内部 7 符号 | §2 | `:7-148` | covered |
| 测试 | §9 | 测试文件 | covered（NOT_RUN） |
