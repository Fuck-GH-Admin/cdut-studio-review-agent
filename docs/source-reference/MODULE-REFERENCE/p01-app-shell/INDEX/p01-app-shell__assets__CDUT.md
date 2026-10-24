# p01-app-shell__assets__CDUT 索引（演示账户头像源图）

冻结 `05fb2565e20eb1760233696be1832f68196b37c2`，源根 `agent-ops/docs-r07-20261023/baseline/source`。
本篇覆盖 group `p01-app-shell__assets__CDUT`（owner `p01-app-shell`，family `assets/CDUT`）共 1 个文件，七项必填：职责 / 消费 / 来源与 hash / 打包 / 影响 / 验证 / 证实·推断·未知。

## assets--CDUT--ZhangChengYi--ZhangChengYi.jpg

- 职责：CDUT 演示账户头像的源照片（JPG，2507348 字节 ≈2.5MB）：`apps/electron/src/main/lib/cdut/cdut-demo/demo-avatar.ts:4` 注释明示「由 assets/CDUT/ZhangChengYi/ZhangChengYi.jpg 离线缩放（256px）生成，请勿手工编辑」——即 `demo-avatar.ts:5-6` 内嵌 Base64 头像 `DEMO_AVATAR_DATA_URL`（`data:image/jpeg;base64,…`，「完全离线，不走网络」）的**上游源图**。
- 消费：无运行时直接消费者（全树检索 `ZhangChengYi` 仅命中 `demo-avatar.ts:4` 注释，证实）；其唯一消费关系=离线生成步骤（把本图缩放 256px 后嵌入 `demo-avatar.ts` 的 Base64 常量）。
- 来源：人物照片素材（演示账户用）；`change=unchanged_since_093f`。sourceBlob `50b8f572e34b4b436329e131feb6b13cfce7f551`；sourceSha256 `ff7e0ae20df35d43126bb772e68aabb2b7d7812c966d9e56595cb8b00ab7673f`。
- 打包：不进产物——无导入、不在 electron-builder `files:`/`extraResources:`（yml:44-68/:70-122）；仅作为 Base64 源的仓库留档（Base64 本体在 `demo-avatar.ts` 内随代码打包）。
- 影响：删除→仅失去再生成/更换演示头像的源图（现有内嵌 Base64 不受影响）；改动→若重新生成会改变演示账户头像。
- 验证：①核 `demo-avatar.ts:4` 注释与 :5-6 内嵌 data URL 形态；②全树检索确认无其它引用；③JPG 头、hash 一致；NOT_RUN：产品测试/typecheck/构建/GUI/缩放重生成（本轮统一 NOT_RUN）。
- 证实/推断/未知：注释关系/零运行时引用/打包结论=**证实**；「256px 缩放」实际执行记录=**推断**（注释自述，未见生成脚本）；照片授权=**未知**。
