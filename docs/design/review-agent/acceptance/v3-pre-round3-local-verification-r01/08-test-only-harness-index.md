# Test-only Harness 索引

这些文件是一次性合成验证脚本，未加入产品源码或本报告分支。SHA256 用于确认本机副本；完整原始日志位于私有证据目录。每个测试都应在其对应固定 SHA 的隔离 worktree、独立 PROFER_CONFIG_DIR 下运行。

| 用途 | 固定 SHA | 本机隔离 worktree 文件 | SHA256 |
|---|---|---|---|
| L1-01 D4 归档与正式决定 | c2f965d29022a42b3c32d6a4cb73aa8fd542329b | v3-verify-d4/apps/electron/src/main/lib/review/v3-local-verification-r01.test.ts | 1bee2b1774a101e94c4612b821d38f87ab9e6491155d328bcdfefa7f1ec69188 |
| L1-01 P06 归档与正式决定 | db0284879f75ce123b5d83cb6577a3cc7ad057da | v3-verify-p06/apps/electron/src/main/lib/review/v3-local-verification-r01.test.ts | 1bee2b1774a101e94c4612b821d38f87ab9e6491155d328bcdfefa7f1ec69188 |
| L1-02 P06 Actor / appeal Main handler | db0284879f75ce123b5d83cb6577a3cc7ad057da | v3-verify-p06/apps/electron/src/main/lib/review/v3-local-actor-ipc-r01.test.ts | a3ac7a2af5507f101380adeb21f31538ecf6a6580d7280cbe43b39818113faa6 |
| L1-03 P06 batch finalization | db0284879f75ce123b5d83cb6577a3cc7ad057da | v3-verify-p06/apps/electron/src/main/lib/review/v3-local-batch-finalize-r01.test.ts | e779cd5196f78958754069d430f3125ebf6e0a8081e3a03825f14e1b438b9f7a |
| L1-04 P06 real synthetic OOXML parse | db0284879f75ce123b5d83cb6577a3cc7ad057da | v3-verify-p06/apps/electron/src/main/lib/review/v3-local-office-parse-r01.test.ts | d7db5a204c7b2ea25a4d2abab7d6a1217cdb5367a1002f1dc86518fd5d59cf5b |
| L1-05 D4 prompt contract | c2f965d29022a42b3c32d6a4cb73aa8fd542329b | v3-verify-d4/apps/electron/src/main/lib/review/v3-local-d2-prompt-contract-r01.test.ts | f4c3e8c0d897c96c7f867efdf00afc9aec82d8c31cf2d013fc7872afa6b9dd34 |
| L1-05 P06 prompt/schema | db0284879f75ce123b5d83cb6577a3cc7ad057da | v3-verify-p06/apps/electron/src/main/lib/review/v3-local-d2-prompt-contract-r01.test.ts | cc4f29bc86d514cbeeda32ee944ee5bd48108b189d0bdffe39d70dded7912121 |

From the relevant worktree, commands were bun test apps/electron/src/main/lib/review/<listed-file>; the test itself creates/removes a unique config directory under its isolated worktree (the D4 prompt harness uses a unique system temp directory). L1-01 and L1-02/L1-03 tests with intentionally violated protective expectations return exit 1; see matrix and preserved logs.
