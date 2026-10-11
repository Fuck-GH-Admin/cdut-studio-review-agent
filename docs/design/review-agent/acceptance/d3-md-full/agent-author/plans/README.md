# 实测D2编译证据

此前仅有输入文件，现在CI `#38098657888` 真实生成 `actual-d2-plan.json` 与 `imported-d2-plan.json`，均在 [Actions Artifact](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/38098657888) 的 `d3-md-agent-a-technical-38098657888-1`；技术核验确认二者全JSON相同，77条Check、8个目标、来源及Authority均可对照。

`ci-technical-summary.json` 是从成功运行job日志中读取的真实技术摘要，含指纹和逐R编译Check ID，供离线比对。详情请以Artifacts内原始stdout及D2 plan为准。未上传私有原始MD；未执行档案Pi运行或独立gold。
