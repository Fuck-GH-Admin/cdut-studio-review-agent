# D3携包导出/干净配置导入状态：NOT-RUN

真实fingerprint依赖D3 `export`计算并在独立`PROFER_CONFIG_DIR`重新导入验证。不可将工作区JSON副本冒称携包。

`tests/replay.sh`包含导出与隔离重导入命令；成功后应存储完整bundle、import后的workspace、validate的来源锁以及fingerprint对照。当前无这些产物。
