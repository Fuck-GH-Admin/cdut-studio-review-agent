const fs = require('node:fs')
try {
  if (process.argv[1] && fs.realpathSync(process.argv[1]).endsWith('/electron/cli.js')) {
    process.argv.push('--remote-debugging-port=9237', '--remote-debugging-address=127.0.0.1', '--no-sandbox', '--disable-gpu')
  }
} catch {}
