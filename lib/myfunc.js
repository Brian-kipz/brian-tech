// lib/myfunc.js
// Misc helper functions
module.exports = {
  formatBytes(bytes = 0) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },
  randomChoice(arr = []) {
    if (!Array.isArray(arr) || arr.length === 0) return null
    return arr[Math.floor(Math.random() * arr.length)]
  }
}
