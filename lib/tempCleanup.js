// lib/tempCleanup.js
// Delete files older than a threshold in a directory
const fs = require('fs')
const path = require('path')

function cleanupTemp(dir = './temp', olderThanMs = 1000 * 60 * 60) {
  if (!fs.existsSync(dir)) return 0
  const now = Date.now()
  const files = fs.readdirSync(dir)
  let removed = 0
  for (const f of files) {
    try {
      const full = path.join(dir, f)
      const stat = fs.statSync(full)
      if (now - stat.mtimeMs > olderThanMs) {
        fs.unlinkSync(full)
        removed++
      }
    } catch (e) { /* ignore */ }
  }
  return removed
}

module.exports = { cleanupTemp }
