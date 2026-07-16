// lib/isOwner.js
// Check if a user is bot owner
module.exports = {
  isOwner(userId, ownerList = []) {
    if (!userId) return false
    return ownerList.includes(userId)
  }
}
