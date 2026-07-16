// lib/isAdmin.js
// Small helper to check admin status
module.exports = {
  isAdmin(userId, groupAdmins = []) {
    if (!userId) return false
    return groupAdmins.includes(userId)
  }
}
