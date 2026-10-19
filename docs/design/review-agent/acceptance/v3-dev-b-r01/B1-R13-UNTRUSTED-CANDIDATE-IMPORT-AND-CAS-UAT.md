# Dev-B B1 R13｜真实候选 JSON 导入预览与作者并发安全

工程分支 #142 @ 新 R13 检查点；严格仅 B-owned Renderer 组件/工具，不修改 C shared/Main IPC/Preload/业务 writer。

本批把 R08/R11 的“导出候选”补为对称但**不能直接写入业务真值**的导入交互：

1. 使用真实 file-input 从作者 UI 选择 `.json`；原始大小 2 MiB 上限，解析深度/节点数/条目数严格封顶。
2. 只接受现有 `review-b1-candidate-export/1`、`trustTier=unverified-user-authoring`、`publicationAllowed=false` 与 `review-b1/1` 的完整允许字段集合。拒绝 `published`、未知 ACL/签名属性、原型键、非法 Check DSL、重复 ID、畸形对象；不执行模板中的文本作为代码。
3. 导入后先显示业务名称/ID/修订声明、字段/来源/对象/Check 数量，用户点击“确认替换”才修改本地作者草稿；清除旧样例/预览，将本地 revision 设为 0 / 未保存状态。导入不是 Main Save、不是 InstallPlan，既有相同模板 ID 的 CAS 冲突不能绕过。
4. 本地 `recordedBy` 一律重新标记 `imported-local-unverified`；真正 Main 的 `ReviewB1AuthorMainPort` 才可用可信 Principal 改写与授权。源文献、声明版号依旧是未验证的候选文字。
5. 文件异步读取/原有保存、冻结共用一个本地操作互斥闸；文件读取期间源草稿被更改则导入失效，确认前产生新编辑同样不得使用旧预览覆盖。新增 Bun 正反例；真实 Electron 文件选择、IME/焦点仍属于 Gate E。

**补充说明**：此解析器允许业务作者保存未编译完成的草稿，真正的字段来源、Plan DAG、正式来源身份和对象规则仍在显式 Main save/preview/freeze 重新校验。本批不实现正式学校 Policy Publisher、Gold、ReadReceipt 或 Material application。

Gate O 必须以新 SHA PR CI/D2/Baseline 同源通过再签；Gate E NOT_RUN，Gate L BLOCKED_NO_AUTH，Gate P 第51套五人×30分钟 NOT_RUN。
