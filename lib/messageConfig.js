// lib/messageConfig.js
// Default bot settings, messages and replies
module.exports = {
  owners: [],
  admins: [],
  banned: [],
  antiLink: {
    enabled: true,
    ignoreAdmins: true
  },
  badWords: ["badword"],
  messages: {
    welcome: (name) => `Welcome, ${name}!` ,
    goodbye: (name) => `Goodbye, ${name}!`,
    linkDeleted: 'Links are not allowed here.',
    badwordDetected: 'Please avoid using bad words.'
  }
}
