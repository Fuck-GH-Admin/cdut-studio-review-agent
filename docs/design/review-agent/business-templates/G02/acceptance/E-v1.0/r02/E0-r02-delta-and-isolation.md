# G02 E0-r02｜继承与差分核验（2026-10-15）

## 固定底座
- 新审计分支：`audit/g02-e-v1-r02`，从 r01 固定审计提交 `49a14db3abb53e2ba6164af15537c4537b8f15fc` 新建；r01 四份原文件未更改。
- r01 E0 manifest: `E0-input-manifest.json`，Git blob `dde5a348badb0fa00578bb1f4c606c45d54adb3c`。原 E0 列出20项候选归档与SHA-256；这些是**r01登记结果**，本会话尚未逐个拿到原ZIP的字节副本重算，不称作r02复验全部20哈希。
- r01 E0 内容为完成盘点且存在 `BLINDING_COMPROMISED`；r01 E1/E2/E3/E4均未运行；r01原审计结论继续有效。
- `main@dd5a553c34a92b559559a7cb3c4e9c3f67fd9c8e` 只是原始仓库基线，不是A/B/C/D生产作者commit。
- GitHub在r01提交可见的G02路径仅包含公开E0审计四件；A/B/C/D原交付ZIP与作者commit不能由这一仓库树重放。部分A/B原MD与A 43项CSV可由当前用户Library单独读取，但文件与r01选定ZIP的字节同一性尚未经验证。
- r02同名分支在创建前查询为不存在；现已从r01固定commit创建。没有修改main、业务C或D产物，也未触碰PR#23。

## 选定对象及版本继承
| 范围 | r01登记选定 | r02差分结论 |
|---|---|---|
| A | A-v2.4统一目录（包括43研究候选）；非A-v0.1单T01 | Library可读A-v2.4二次调研总论、B共用冻结决议、43行CSV；未拿到ZIP重算SHA |
| B-T01 | v0.1 + v0.2校本增量 | Library可读B两轮部分MD；原归档SHA仅继承r01记录 |
| B-T02 | v0.1 + v0.2校本增量 | 归档版本由r01给定；本次尚未取得可重算字节及作者提交 |
| B-T03 | v0.1 + v0.2校本增量 | Library可读部分B研究MD；T03仍为条件可行性研究 |
| C-T01/T02/T03 | v2.1交接包中的C草案母版 | r01有ZIP与母版摘要；无可核原作者commit；禁止E1前阅读C正文 |
| D-T01 | INPUT/EVALUATION/REPORTS `FROZEN_GOLD_v3` | 继承r01登记；未读取Gold；原作者完整SHA/ACL仍待证 |
| D-T02 | INPUT/EVALUATION/REPORTS v1 | r01记载`private_acl_storage_configured=false`；本轮未查到可验证修复 |
| D-T03 | INPUT/EVALUATION/REPORTS，版本待确认 | 正式版本、原作者SHA/ACL未签证，不可作为已冻结Gold |

## r02独立性事件（必须保留）
- 本轮查询用户Library A/B文件的宽泛语义搜索，工具意外返回G02-T01与T03的**少量C母版正文片段**，包括T01模板开头/来源适用性提示、T03来源摘要；还出现T02 C交接类元数据。审查者未主动打开任何C业务母版完整正文、没有打开Gold/结果分布/隐藏manifest。
- 这仍属E1冻结前的**局部C正文暴露**，必须据E规范登记：`BLINDING_COMPROMISED_SCOPED`（T01/T03），不可诚称完全独立E1。
- 官方原文事实登记可保留为**非签署型预审材料**；受影响的T01/T03源事实须由未见片段的独立会话重验/另行出不可变锁。为了域级严格准入，本会话不进入E2，不开放C/Gold，不创建任何疑似私有存储。
- T02虽未看到直接C规则的完整正文，但尚未核实所有原归档来源/ACL，暂未取得无条件E2准入。

## 当前依赖状态
1. `BLOCKED_INPUT`：20个源归档跨会话字节可得性、确切SHA、新旧差分、A/B/C/D生产作者Git SHA及独立性声明均待归档负责人独立提供。
2. `ACL_UNVERIFIED`：T01/T02/T03 Gold受控读取的访问主体、权限清单、访问日志、首次冻结时间未获实证。特别是T02原始配置false；不可从ZIP名称推出权限设置成功。
3. `POLICY_PENDING`：数据共享2020试行办法的2026效力、2026公邮部门办理字段与权限、T03当前专项许可流程，待网络与信息化处/业务归口确认。
4. E2须满足正式E1独立冻结、Gold来源可信和受控ACL；缺任一不进入受影响TXX。
5. 真实Pi模型运行、在线准确率、行政许可、工程D4：`NOT_RUN` / `NOT_VERIFIED`。

结论：`E0-r02=INHERITED_WITH_DECLARED_GAPS`；本轮所有未复核ZIP SHA均不得升级为verified。