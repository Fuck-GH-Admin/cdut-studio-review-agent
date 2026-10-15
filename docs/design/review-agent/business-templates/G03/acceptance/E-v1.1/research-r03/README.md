# G03｜E v1.1 独立事实研究 r03（非正式E准入）

本目录只含**公开安全研究记录**。研究源锁在先、C规则静态复核在后；未读取 D 隐藏Gold；E1全量门禁未达到，不能称 E2或全领域PASS。原审计r01/r02保持不变。

## 不可变前置证据
- 事前来源索引所在分支 `research/g03-e-v1p1-r03-source`，commit `ebc98c9e62860e35315e1259ac2d35bb42fa2d52`（2026-10-15T14:26:57Z）。
- `independent-source-register.md` SHA256 `aada81048c795b47de2f045e4f43d1853522254b2b243e6cd3722aafc8ad2327`。
- `adversarial-cases.md` SHA256 `f35b174e8e90ac303fee52cb528826049066a5a0f691ecfe4e1c868d73bb6884`。
- `source-lock.json` SHA256 `b1c2efe7f04bd23f6937c9063ad3f5b50219cb6587093809a5487e3a4bead094`。
- r01 `audit/g03-e-v1-r01@1be43d8bacc015e1fd21949796defcdd3ecb96fc` PR #24；r02 `audit/g03-e-v1-r02@ad74aa70fa284af71973d3344e6ff8caeb089156` PR #69。**这两个是E审计commit，不是A/B/C/D作者commit。**

## 本轮信息增量
核实新增官方事实 **3**（2023-40第35条替代2016-25；设备设置修改权限按仪器负责人/院级管理员分域；送样附件与默认自动批准是独立可配开关）。定义高区分度研究反例 **5**；新复现C/D业务缺陷 **0**；证据排除/静态未观察到假设 **4**（注意不是模型实测）；有明确资料依赖的未知问题簇 **5**。原冻结8项S曾指跨校参照，不符合本轮S仅限封闭模拟的新定义，后续不再拿旧S当模拟真值。

**研究方法纠正**：前轮S=SCOPED_REFERENCE，今轮S=explicitly CLOSED_SIMULATION。此前跨校参照应拆为适用学校/年份内的F，及成都理工现行权限U，绝不能合并为校本硬规则。

## 发布红线
- `RESEARCH_CROSSCHECK`，非正式 E2；T06旧Gold受污染P0仍沿用r02，必须由没见过C的独立D重新制作，不能靠重算SHA洗白；T10旧QA v1指针与声明Gold v2冲突仍待有权核。
- 十套Gold ACL 未实证；成理校发〔2023〕13号全文、真实OA、仪器配置、屏位权限仍待核。
- D4、Pi、在线模型：`NOT_RUN`；学校行政批准：`NOT_VERIFIED`。
- 本仓库此目录是**完整本地报告的公开摘要，而非字节相同的原文镜像**。原本地全文三件SHA如下：
  - `independent-source-delta.md`: `1c20104fee99c1521d2b0978ccd9fee650a47b1276a73ebfad3c8c1d95146331`
  - `discriminating-cases.md`: `6896449ca79f142eab0198ba24146e8e745eb853954f9d23be5015eba832872e`
  - `research-evidence-lock.json`: `6ae861c0070986ca56aad00a68f3ba95faf27770b76b68091de7c240856b7f13`

不得将此公开摘要改称以上三个原文件已完整上传；本研究分支不自动合并main。
