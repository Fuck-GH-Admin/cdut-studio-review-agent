# NB-109 独立验收报告（G0/G1/G2）

- 批：nb-109（18 文件/4571 行，p08-renderer-ui：browser 8 + file-browser 10）；冻结 `05fb2565e20eb1760233696be1832f68196b37c2`。
- 审验对象：`deliveries/nb-109/`（sealId `seal-c9a05632bfce1644`）；reviewer `docs-r07-qa-nb-07-20261023`。
- **批次结论：accepted** —— **18 accepted / 0 revision_required / 0 unknown（零 findings 零 notes）**。
- 测试/构建/GUI/原生视图/网盘 IPC/Silurus：本轮 **NOT_RUN**。

## G0 完整性：PASS
哈希链/ZIP/源绑定 18/18（==SCOPE==MANIFEST）/manualSha256 无 drift/changes.diff 重放 18/18/人工列 18/18/元数据 18/18。

## G1 格式：PASS（带名引用 25/25 在范围）

## G2 源码真实性：FULL（18/18，无偏差）
18 源文件 4571 行逐行深读（事实库 `reviews/nb-109/SOURCE-CHECKLIST.md` §1-12）+ 18 手册逐篇对照。

### 机械核验全对
- **导出计数 15 文件一致**（含 FileBrowser 3/MentionList 3/index 5/MentionSuggestion 1 等）。
- **测试用例计数精确**：nav 6（192.168 回归双断言+7 种本机地址全列）、layout 3（CSS 隐藏/revision 忽略/任一变化发布）。

### 内容亮点（全部实测核对为真）
1. **缺陷注释与红线如实转写**：reveal flash 末关键帧「不要改 globals.css transparent」红线（revealSelect 跳过 flash 解决选中色冲突）、OFV imagePlugin 弃用缘由（Ctrl+档位缩放体验差）、mousedown 防异步重渲染漏选、空目录 800ms 重试防 Agent 写入时序、mx-2 留白清选就近处理、「本地文件预览不弹风险告知」。
2. **竞态治理注释成体系**：mention 四重校验（序列/路径/快照键/缓存代际）、SearchBar 三 ref（dismissed/pendingShow/prevQuery）+早退显式复位防 Loader 永久旋转、BrowserViewport 双序号+五观察者+cleanup 零矩形让位、PPTX revision 双检+聚光灯「挂载后才消费（提前消费会闪没）」、URL 脏标记防 Agent 导航顶掉输入、默认首页防反向创建会话。
3. **安全语义**：HTML 预览 DOMPurify FORBID 清单+CSP `default-src 'none'`+sandbox、大文件「不复制仅附加」保留原路径、100MB 分流双路径语义、team 模式候选目录授权 `candidateBasePaths`。
4. **诚实登记**：tree-row-layout/mention-query-utils/silurus-bridge 等非本批归属、「移动失败仅 console.error（如实登记）」、无专属测试文件如实声明。

### 处置
**18 篇全量合入**（`reviews/nb-109/REVIEWED-HASHES.json` exact manualSha256）。证据：`reviews/nb-109/{RESULT.json,REVIEWED-HASHES.json,DONE.json,SOURCE-CHECKLIST.md}`。未改作者正文/源码/candidate/全局 FILES/MANIFEST/总账；NOT_RUN。
