// lib/myfunc2.js
// More helpers
module.exports = {
  msToTime(duration) {
    const seconds = Math.floor((duration / 1000) % 60)
    const minutes = Math.floor((duration / (1000 * 60)) % 60)
    const hours = Math.floor((duration / (1000 * 60 * 60)) % 24)
    return `${hours}h ${minutes}m ${seconds}s`
  },
  capitalize(s = '') {
    if (!s) return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
  }
}
