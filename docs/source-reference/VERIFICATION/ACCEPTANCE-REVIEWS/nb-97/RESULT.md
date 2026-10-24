# NB-97 独立 QA 验收报告（D0）——author-nb-06 清单末批

- 批次 `nb-97`（p08-renderer-ui · p08.settings-ui，18 文件 / 3384 行），冻结 `05fb2565e20eb1760233696be1832f68196b37c2`
- 作者 seal `seal-8e1d1524f3ea34e5`（19:28:42Z）；QA `docs-r07-qa-nb-06-20261023`（21:30:00Z）
- **batchVerdict：`accepted`（18/18）**；G0/G1 pass、G2 pass_with_findings（3 minor，每文件恰 1 条）
- **NOT_RUN**（批内无测试文件）

## G0 — PASS

seal 链三层独立重算全相等；ZIP 21 条目；18/18 manualHash；源绑定 18/18 = nb-97-SCOPE。

## G2 — 逐文件（18 文件 3384 行全文 + 18 篇手册全文）

| 文件 | verdict | findings |
| --- | --- | --- |
| SkillFilesPanel | accepted | NB97-N1（"4 内部" vs 自列 5） |
| StorageSettings | accepted | NB97-N2（"3 内部" vs 自列 4） |
| UsageSettings | accepted | NB97-N3（"3 内部" vs 自列 4） |
| 其余 15 篇 | accepted | — |

**红线逐条对源命中**：SkinManager 制作指南安全规则（禁外链/file:/data:/@import/@font-face/../、包 5MB/css 512KB/单图 4MB/预览 2MB、官方磁盘模板唯一真源、cdut-skin:// 受限协议）与 nb-75 主进程侧手册口径互证一致；ShortcutSettings 录制器（仅 F1-F24 可单键、冲突检测阻断保存、全局键注册失败如实 warning 不假装成功、禁用返回 false 不误报）；SkillFilesPanel 名称拒 `/`与`\`（防路径注入）+删除确认；UsageSettings 音效扩展名白名单+Audio 解码 ≤10s、紧凑档失焦归一化（0=关闭合法）；YanhuPet 渠道/模型停用自动回落继承全局默认；WeChat 凭证加密存储声明+iLink 官方接口；StorageSettings `@deprecated` 如实标注。

## findings（3 minor，"N 内部" vs 自家 §2 清单）

每文件恰 1 条。无行为/红线/测试存在性错误。

## 合入（lead）与组收口

全 18 篇 acceptedHashes 可合；3 findings 记 ACCEPTED-ERRATA。**至此 author-nb-06 清单（14 批/217 文件）全部审毕**：13 批 accepted 全量 + nb-46 经 r1 收口，累计 **217/217 篇 acceptedHashes 可合**，无待返修、无未审草稿。
