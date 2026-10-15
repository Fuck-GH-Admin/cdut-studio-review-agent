# G05 E r02｜E0 差分证据核查（2026-10-15）

## 1. 固定审计输入与不变量

- r01审计HEAD `0d5a1f493b2aeadcc6d65503a433e19a052ae539`，Draft PR #25；原作者Git SHA不能用该E提交代替。
- `main` 与原r01主仓基线 `dd5a553c34a92b559559a7cb3c4e9c3f67fd9c8e` 比较为 `identical`。
- r02直接从r01冻结HEAD建立新审计分支，保留旧文件不覆盖。
- r01实际完成：E0部分、E1/E2/E3/E4均未执行；故本次不继承不存在的事实判决或Gold语义成绩。
- 逐字节重算：A 2个可访问MD主体、B 6个可访问MD主体及C 6份原v0.1母版。它们是Library版本1的**单文件哈希**，不是原A/B ZIP哈希或原作者Git commit。细目见 `E0-delta-input-manifest.json`。
- 6份C与r01清单完全一致，**未发现新版C业务母版**。不为通过E1而读取其业务正文。

## 2. 六份新增D生产侧补证

| TXX | 新元数据分支冻结HEAD | Draft PR | D原包旧SHA与新包差异 | 新证据实际解决了什么 | 仍缺什么 |
|---|---|---:|---|---|---|
| T01 | `d1924b40e782051c9e158428e99fce77fc158efc` | #53 | 原包SHA见JSON；未见改版 | 28 Gold；旧字节作者自核；独立性仅自述；私有 object/ACL/第三方读取均无 | 受控Gold真实对象/ACL、E本人读回与否定权限试验 |
| T02 | `ce26784a654276ead0523444972b3095b2800fdc` | #52 | 原包SHA见JSON；未见改版 | 18案42项，旧D先接触C规则；原作者明确限定旧Gold独立性；新D/ACL未提供 | 受控Gold真实对象/ACL、E本人读回与否定权限试验 |
| T03 | `8fa04da417c8e646f583e756d00eac78d3b0cde3` | #55 | 原包SHA见JSON；未见改版 | 28 Gold，C先于D在同会话制作，非严格独立；原ZIP作者自核，ACL未配置 | 受控Gold真实对象/ACL、E本人读回与否定权限试验 |
| T04 | `4be7e095f0a5c8f1bc84f1426b3c3bd05db4f3d8` | 未发现 | 原包SHA见JSON；未见改版 | 新无答案 E0_SAFE_MANIFEST 与泄漏自审；旧结果统计仍曾被E r01看到，ACL未配置 | 受控Gold真实对象/ACL、E本人读回与否定权限试验 |
| T05 | `3dd1ed4ddb0b319c5bd326f7eedce3cf5b612e2e` | #54 | 原包SHA见JSON；未见改版 | 24 Gold，作者自核旧包，承认搜索偶见C摘要；ACL无 | 受控Gold真实对象/ACL、E本人读回与否定权限试验 |
| T06 | `bae767d162672f54d7b769c74ae39f00621b0b0d` | 未发现 | 原包SHA见JSON；未见改版 | 22 Gold，作者自核旧包；ACL无，原D独立性仅作者声明 | 受控Gold真实对象/ACL、E本人读回与否定权限试验 |

以上 SHA 均由原D作者新增公开文件**声明并称在各自原会话原包复算**。本E通过GitHub核实公开说明、分支HEAD/文件blob，但没有拿到受控原D ZIP字节，不能冒充由E完成独立原包SHA验证。所有D作者原始生产 Git commit 均未能取得。

## 3. T04 r01污染专项差分

- 新安全清单 `T04/D/E0-003-r02/E0_SAFE_MANIFEST.json`：7个对象条目仅含`version/path/sha256/accessibility`，未见`status_counts`、逐案标签分布、Gold判定结果映射。
- 旧 `frozen_manifest.json` 和旧报告曾含聚合标签/频数；此次新元数据清单**没有修改/撤回既有暴露**。新的安全入口是有效**预防性减泄漏改进**，不是历史盲审独立性恢复。
- T04 INPUT 39案、扫描PDF85份/125页的无文本层、CRC等断言仍是D作者自测记录；未经E对原始ZIP复算，不记E验证完成。
- `E-G05-E0-003`必须由未见旧汇总的独立E1人员先冻结来源事实；受影响审查不由此会话伪装盲态。

## 4. 补证前后真正变化

- **变化**：六个TXX均出现仅公开不含Gold的D作者元数据，新增原ZIP声称SHA、历史独立性披露与ACL请求；T04新增不泄漏汇总的E0清单；T03首次明确原D与C同会话先后制作。
- **未变化**：六份C旧MD字节摘要；被作者描述为旧版的D原资产、Gold冻结标识；私有ACL仍均`UNVERIFIED`；没有真正具名E2成功只读及无权限账号被拒的客观回执。
- **无法判定**：完整A/B/C辅件的全套作者生产链版本；最新A v2.4统一模板工作树；作者自称的D原包SHA是否等于私有受控对象字节；任何D Gold的业务真值。
- **E0裁定**：`BLOCKED_INPUT`，对已取得的部分元数据给出`PARTIAL_EVIDENCE_RECORDED`，不强推至E2。
