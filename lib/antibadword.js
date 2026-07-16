// lib/antibadword.js
// Simple bad-word checker
module.exports = {
  containsBadWord(text = '', badWords = []) {
    if (!text) return false
    const normalized = text.toLowerCase()
    return badWords.some(w => {
      const pattern = new RegExp(`\\b${w.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i')
      return pattern.test(normalized)
    })
  }
}
