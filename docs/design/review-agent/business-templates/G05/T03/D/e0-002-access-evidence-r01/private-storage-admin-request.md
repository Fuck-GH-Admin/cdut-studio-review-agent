# G05-T03｜私有存储管理员需求单（ACL未配置／未验证）

> 审计追踪：`E-G05-E0-002`；当前状态：`BLOCKED_INPUT / ACL_UNVERIFIED`。
> 这是开通需求，**不是已经完成的ACL配置**。公开仓库只存此无答案需求单，不上传评价包。

## 请管理员建立受控对象位置

1. 创建非公共存储对象，**示例占位** `<PRIVATE-TENANT>/G05/T03/D-v2.1/FROZEN_GOLD_v1/G05-T03_EVALUATION_ONLY.zip`。不得使用公开Git、普通共享Library、无需身份的“拥有链接者可见”或公共CDN。请回填真实服务商、对象URI、对象versionID、大小和SHA；若涉及机密访问链接，应**仅私发E2**，公开处保留脱敏别名。
2. 仅管理员有写权限；按有权E协调批准单给指定D保管人及**具名E2独立验收者**只读权；E1盲审者、普通开发者、公开受测方、匿名访问者默认不得访问隐藏Gold。真实user/group ID必须由管理员按组织身份填写，不能由D作者猜测。
3. 对整个Evaluation ZIP实施同等控制，含`gold/`、`trusted_fixtures/`、`coverage/`、`scoring/`、`frozen_manifest.json`；独立公开INPUT只能另存公开目录，不能同ACL。
4. 启用版本固定、访问日志、撤权机制、必要的静态加密和防篡改/保留策略；重传只能逐字节复制原版，不得重写Gold或覆盖无法验证的旧版本。

## 验收须提交的客观证明

| 证明项目 | 负责人 | 本轮状态 |
|---|---|---|
| 私有对象URI（私发E）及不可变版本ID/大小 | 存储管理员 | `PENDING_ADMIN` |
| 对象SHA-256＝`5f7fbdc3411d258f157a72c1345e5e50bbf3d06d929cf92b46b00671f09677b7` | 存储管理员 | `PENDING_ADMIN` |
| 具名成员/组、角色、有效期及ACL快照 | 存储管理员 | `PENDING_ADMIN` |
| 独立E2真实登录成功并完整只读读取、比对SHA的回执 | E2验收者 | `PENDING_E2` |
| 匿名与未授权测试账号无法读取的负面试验 | 存储管理员/E协调 | `PENDING_ADMIN` |
| 访问日志、存储对象版控、可撤权验证 | 存储管理员 | `PENDING_ADMIN` |
| E r02 独立裁定解除E0访问阻断的签认 | E协调方 | `PENDING_E` |

## 安全交付与处理失败方式

只能通过经管理员确认的受控私有通道转交原始`EVALUATION_ONLY.zip`。源原版大小43677 bytes，SHA如上；旧`FROZEN_GOLD_v1`索引SHA为`be4daef8e7d1c95aac89e9a3a27560f710967e15ef4c59466e510e3f6eef8442`。二次比对失败时保留失败对象及日志，不要以新压缩包静默冒充旧Gold。

**无管理员ACL回执或E2独立读权与未授权拒止证据时，D作者只可报告“已提交管理员需求”，不可写“受控Gold已归档”。**
