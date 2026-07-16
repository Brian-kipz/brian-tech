// lib/antilinkHelper.js
// Helpers for detecting links
const LINK_REGEX = /(https?:\\/\\/)?([\w-]+\\.)+[\w-]{2,}(\/[\w\-._~:\/?#\[\]@!$&'()*+,;=%]*)?/i

module.exports = {
  hasLink(text = '') {
    return LINK_REGEX.test(text)
  },
  extractLinks(text = '') {
    if (!text) return []
    const matches = text.match(new RegExp(LINK_REGEX, 'gi'))
    return matches || []
  }
}
