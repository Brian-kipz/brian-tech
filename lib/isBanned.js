// lib/isBanned.js
// Check if a user is banned in a lightweight store or list
module.exports = {
  isBanned(userId, bannedList = []) {
    if (!userId) return false
    return bannedList.includes(userId)
  }
}
