// lib/reactions.js
// Auto reaction helper
module.exports = {
  autoReact(message, reactions = {}) {
    // reactions: { keyword: emoji }
    if (!message || !message.text) return null
    const lower = message.text.toLowerCase()
    for (const [k, v] of Object.entries(reactions)) {
      if (lower.includes(k.toLowerCase())) return v
    }
    return null
  }
}
