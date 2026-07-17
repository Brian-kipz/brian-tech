/*I wrote a script to automate my job. Now I just sit back and watch Netflix while it runs.*/

const session = process.env.SESSION || '';

const prefix = process.env.PREFIX || '.';
const mycode = process.env.CODE || "254";
const author = process.env.OWNER_NAME || 'Brian';
const packname = process.env.PACKNAME || 'brian';
const dev = process.env.OWNER_NUMBER || '254793684491';
const DevKeith = dev.split(",");
const botname = process.env.BOTNAME || 'K';
const mode = process.env.MODE || 'public';
const gcpresence = process.env.GC_PRESENCE || 'tru';
const antionce = process.env.ANTIVIEWONCE || 'true';
const sessionName = "session";
const presence = process.env.WA_PRESENCE || 'recording';
const reactemoji = process.env.EMOJI || '🔗';
const antitag = process.env.ANTITAG || 'true';
const groupControl = process.env.GROUP_CONTROL || 'true';
const anticall = process.env.ANTICALL || 'true';
const antidelete = process.env.ANTIDELETE || 'true';
const antimention = process.env.ANTIMENTION || 'true';
const antibot = process.env.ANTIBOT || 'true';
const antilink = process.env.ANTILINK || 'true';
const antibad = process.env.ANTIBAD || 'true';
const autoview = process.env.AUTOVIEW_STATUS || 'true';
const autolike = process.env.AUTOLIKE_STATUS || 'true';
const chatbot = process.env.CHATBOT || 'false';
const greet = process.env.GREET || 'true';
const autodownloadstatus = process.env.AUTODOWNLOAD_STATUS || 'false';
const autostatusreply = process.env.AUTOREPLY_STATUS || 'true';
const autostatusmsg = process.env.AUTOSTATUS_MSG || 'viewed';
const greetmsg = process.env.GREET_MSG || 'my owner is unavailable text back later';
const timezone = process.env.TIMEZONE || 'Africa/Nairobi';
const autoread = process.env.AUTOREAD || 'true';
const permit = process.env.PM_PERMIT || 'true';
const voicechatbot = process.env.VOICECHATBOT || 'trul';
const voicechatbot2 = process.env.VOICECHATBOT2 || 't';
const anticallmsg = process.env.ANTICALL_MSG || 'Brian declined your 🤙 call';
const autobio = process.env.AUTOBIO || 'true';



module.exports = {
  sessionName,
  presence,
  autoview,
  autoread,
  autodownloadstatus,
  botname,
  voicechatbot,
  voicechatbot2,
  reactemoji,
  autobio,
  antilink: groupControl, // Use groupControl for antilink
  antibad: groupControl, // Use groupControl for antibad
  mode,
  prefix,
  anticall,
  autostatusreply,
  autostatusmsg,
  autolike,
  anticallmsg,
  mycode,
  chatbot,
  author,
  herokuAppname,
  herokuapikey,
  url,
  gurl,
  packname,
  dev,
  greet,
  greetmsg,
  DevKeith,
  gcpresence,
  permit,
  antionce,
  session,
  antitag,
  antidelete,
};