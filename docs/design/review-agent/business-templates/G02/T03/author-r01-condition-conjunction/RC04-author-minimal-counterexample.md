# RC04 类型最小反例｜C作者自行合成（非 E/D 隐藏答案）

这是依据公开缺陷描述自行构造的封闭合成政策，**并非读取 E 的 RC04 原案**。设 I=外协身份/校内担保证据，A=具体受控资源属主准入证据，P=该分项正式权限批准，T=可信VPN后台精确映射。四者作用不同；SC-06 仅当 I∧A 证成并获得对应有效 P 才能核技术实施 T。

| I | A | P | T | 正确分项解释 |
|---|---|---|---|---|
| TRUE | UNKNOWN | 待审批 | 未知 | `PENDING_RESOURCE_OWNER` + `PENDING_APPROVAL`，不可宣称开通 |
| UNKNOWN | TRUE | 待审批 | 未知 | `PENDING_ROLE_CONFIRMATION` + `PENDING_APPROVAL` |
| UNKNOWN | UNKNOWN | 待审批 | 未知 | 两项门槛待核并列 |
| TRUE | TRUE | 待审批 | 未知 | `PENDING_APPROVAL`，不是已批准待配置 |
| TRUE | TRUE | 许可链完整 | 明确没有 | `APPROVED_NOT_PROVISIONED` |
| TRUE | TRUE | 许可链完整 | 精确映射有效 | 只可报告当前资源/动作/期限的**网络层** `PROVISIONED` |
| TRUE | 正式拒批 | 已终拒 | 无 | `FORMALLY_DENIED` 优先，不替换成普通待核 |

源强度：`S`＝合成逻辑；`F`＝旧C母版已存在BR-03可叠加/SC-06双分支语义；`U`＝2026 CDUT现行专项审批制度与真实运行结果。

**执行声明**：仅作者侧静态表格复算；未运行审核Agent、未访问私有Gold、未作正式E审计、没有E PASS。
