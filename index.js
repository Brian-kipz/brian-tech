const fs = require('fs');
const zlib = require('zlib');
const path = require("path");
const { exec } = require("child_process");
const util = require("util");
const express = require("express");
const axios = require("axios");
const pino = require("pino");
const chalk = require("chalk");
const speed = require("performance-now");
const { DateTime } = require("luxon");
const { Boom } = require("@hapi/boom");
const FileType = require("file-type");
const googleTTS = require('google-tts-api');

const { session } = require("./settings");

//========================================================================================================================//
// Session Authentication Layer
//========================================================================================================================//
async function authenticationn() {
  try {
    const credsPath = "./session/creds.json";

    if (!fs.existsSync(credsPath) || session !== "zokk") {
      console.log(fs.existsSync(credsPath) ? "Updating existing session..." : "Connecting...");

      const [header, b64data] = session.split(';;;');

      if (header === "BRIAN" && b64data) {
        let compressedData = Buffer.from(b64data.replace('...', ''), 'base64');
        let decompressedData = zlib.gunzipSync(compressedData);
        fs.writeFileSync(credsPath, decompressedData, "utf8");
      } else {
        throw new Error("Invalid session format");
      }
    }
  } catch (error) {
    console.log("Session is invalid: " + error.message);
    return;
  }
}

authenticationn();

//========================================================================================================================//
// Core Dependencies
//========================================================================================================================//
const {
  default: BrianConnect, BufferJSON, WA_DEFAULT_EPHEMERAL, generateWAMessageFromContent, proto, generateWAMessageContent,
  generateWAMessage, prepareWAMessageMedia, areJidsSameUser, getContentType, useMultiFileAuthState,
  DisconnectReason, makeInMemoryStore, downloadContentFromMessage, jidDecode
} = require("@whiskeysockets/baileys");

const { smsg } = require('./lib/smsg');
const fetchLogoUrl = require('./lib/ephoto');
const {
  smsgsmsg, formatp, tanggal, formatDate, getTime, sleep, clockString,
  fetchJson, getBuffer, jsonformat, antispam, generateProfilePicture, parseMention,
  getRandom, fetchBuffer,
} = require("./lib/botFunctions.js");

const { TelegraPh, UploadFileUgu } = require("./lib/toUrl");
const uploadtoimgur = require("./lib/Imgur");
const { sendReply, sendMediaMessage } = require("./lib/context");
const { downloadYouTube, downloadSoundCloud, downloadSpotify, searchYouTube, searchSoundCloud, searchSpotify } = require("./lib/dl");
const ytmp3 = require("./lib/ytmp3");
const { commands, totalCommands } = require("./commandHandler");
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require("./lib/exif");
const groupEvents = require("./groupEvents.js");

const {
  autoview, autostatusreply, autostatusmsg, permit, autoread, botname, chatbot, timezone, autobio, mode, anticallmsg, reactemoji, prefix, presence,
  mycode, author, antibad, antimention, autodownloadstatus, packname, url, voicechatbot2, gurl, herokuAppname, greet, greetmsg, herokuapikey, anticall, dev, antilink, gcpresence, antibot, antitag, antidelete, autolike, voicechatbot
} = require("./settings");

const store = makeInMemoryStore({ logger: pino().child({ level: "silent", stream: "store" }) });
const app = express();
const port = process.env.PORT || 10000;

//========================================================================================================================//
// Enhanced Anti-delete functionality
//========================================================================================================================//
const baseDir = 'message_data';
if (!fs.existsSync(baseDir)) {
  fs.mkdirSync(baseDir);
}

function loadChatData(remoteJid, messageId) {
  const chatFilePath = path.join(baseDir, remoteJid, `${messageId}.json`);
  try {
    const data = fs.readFileSync(chatFilePath, 'utf8');
    return JSON.parse(data) || [];
  } catch (error) {
    return [];
  }
}

function saveChatData(remoteJid, messageId, chatData) {
  const chatDir = path.join(baseDir, remoteJid);
  if (!fs.existsSync(chatDir)) {
    fs.mkdirSync(chatDir, { recursive: true });
  }
  const chatFilePath = path.join(chatDir, `${messageId}.json`);
  try {
    fs.writeFileSync(chatFilePath, JSON.stringify(chatData, null, 2));
  } catch (error) {
    console.error('Error saving chat data:', error);
  }
}

function handleIncomingMessage(message) {
  const remoteJid = message.key.remoteJid;
  const messageId = message.key.id;
  const chatData = loadChatData(remoteJid, messageId);
  chatData.push(message);
  saveChatData(remoteJid, messageId, chatData);
}

async function handleDeletedMessage(client, revocationMessage) {
  if (antidelete !== "true") return;
  
  const remoteJid = revocationMessage.key.remoteJid;
  const messageId = revocationMessage.message.protocolMessage.key.id;
  const chatData = loadChatData(remoteJid, messageId);
  const originalMessage = chatData[0];

  if (!originalMessage) return;

  const deletedBy = revocationMessage.participant || revocationMessage.key.participant || revocationMessage.key.remoteJid;
  const sentBy = originalMessage.key.participant || originalMessage.key.remoteJid;
  const botNumber = await client.decodeJid(client.user.id);

  if (deletedBy.includes(botNumber) || sentBy.includes(botNumber)) return;

  const deletedByFormatted = `@${deletedBy.split('@')[0]}`;
  const sentByFormatted = `@${sentBy.split('@')[0]}`;

  let notificationText = `*😈 BRIAN-TECH Anti-Delete 😈*\n\n` +
    `   *Deleted by:* ${deletedByFormatted}\n` +
    `   *Sent by:* ${sentByFormatted}\n\n`;

  try {
    if (originalMessage.message?.conversation) {
      const messageText = originalMessage.message.conversation;
      notificationText += `   *Message Text:* \`\`\`${messageText}\`\`\``;
      await client.sendMessage(botNumber, { text: notificationText, mentions: [deletedBy, sentBy] });
      
    } else if (originalMessage.message?.extendedTextMessage) {
      const messageText = originalMessage.message.extendedTextMessage.text;
      notificationText += `   *Message Text:* \`\`\`${messageText}\`\`\``;
      await client.sendMessage(botNumber, { text: notificationText, mentions: [deletedBy, sentBy] });
      
    } else if (originalMessage.message?.imageMessage) {
      const buffer = await client.downloadMediaMessage(originalMessage);
      const caption = originalMessage.message.imageMessage.caption || '';
      notificationText += `   *Caption:* ${caption}`;
      await client.sendMessage(botNumber, { image: buffer, caption: notificationText, mentions: [deletedBy, sentBy] });
      
    } else if (originalMessage.message?.videoMessage) {
      const buffer = await client.downloadMediaMessage(originalMessage);
      const caption = originalMessage.message.videoMessage.caption || '';
      notificationText += `   *Caption:* ${caption}`;
      await client.sendMessage(botNumber, { video: buffer, caption: notificationText, mentions: [deletedBy, sentBy] });
      
    } else if (originalMessage.message?.stickerMessage) {
      const buffer = await client.downloadMediaMessage(originalMessage);
      await client.sendMessage(botNumber, { sticker: buffer, mentions: [deletedBy, sentBy] });
      await client.sendMessage(botNumber, { text: notificationText, mentions: [deletedBy, sentBy] });
      
    } else if (originalMessage.message?.documentMessage) {
      const fileName = originalMessage.message.documentMessage.fileName || 'file';
      const buffer = await client.downloadMediaMessage(originalMessage);
      const caption = originalMessage.message.documentMessage.caption || '';
      notificationText += `   *File Name:* ${fileName}\n   *Caption:* ${caption}`;
      await client.sendMessage(botNumber, { document: buffer, fileName: fileName, caption: notificationText, mentions: [deletedBy, sentBy] });
      
    } else if (originalMessage.message?.audioMessage) {
      const buffer = await client.downloadMediaMessage(originalMessage);
      const isPTT = originalMessage.message.audioMessage.ptt === true;
      await client.sendMessage(botNumber, { audio: buffer, ptt: isPTT, mimetype: 'audio/mpeg', fileName: `${messageId}.mp3`, mentions: [deletedBy, sentBy] });
      await client.sendMessage(botNumber, { text: notificationText, mentions: [deletedBy, sentBy] });
      
    } else {
      notificationText += `   *Message type:* Unsupported (could not retrieve)`;
      await client.sendMessage(botNumber, { text: notificationText, mentions: [deletedBy, sentBy] });
    }
  } catch (error) {
    console.error('Error handling deleted message:', error);
    await client.sendMessage(botNumber, { text: `*Anti-Delete Error:* Failed to retrieve message\n\n${notificationText}`, mentions: [deletedBy, sentBy] });
  }
}

//========================================================================================================================//
// Main Engine Initialize
//========================================================================================================================//
let repliedContacts = new Set();

async function startBrianTech() {
  const { saveCreds, state } = await useMultiFileAuthState("session");
  const client = BrianConnect({
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    version: [2, 3000, 1015901307],
    browser: ["BRIAN-TECH", "Safari", "3.0"],
    fireInitQueries: false,
    shouldSyncHistoryMessage: true,
    downloadHistory: true,
    syncFullHistory: true,
    generateHighQualityLinkPreview: true,
    markOnlineOnConnect: true,
    keepAliveIntervalMs: 30000,
    auth: state,
    getMessage: async (key) => {
      if (store) {
        const msg = await store.loadMessage(key.remoteJid, key.id);
        return msg.message || undefined;
      }
      return { conversation: "HERE" };
    },
  });

  store.bind(client.ev);

  if (autobio === "true") {
    setInterval(() => {
      const date = new Date();
      client.updateProfileStatus(
        `${botname || "BRIAN-TECH"} is active 24/7\n\n${date.toLocaleString("en-US", { timeZone: "Africa/Nairobi" })} It's a ${date.toLocaleString("en-US", { weekday: "long", timeZone: "Africa/Nairobi" })}.`
      );
    }, 10000);
  }

  let lastTextTime = 0;
  const messageDelay = 5000;

  client.ev.on('call', async (callData) => {
    if (anticall === 'true') {
      const callId = callData[0].id;
      const callerId = callData[0].from;
      await client.rejectCall(callId, callerId);

      const currentTime = Date.now();
      if (currentTime - lastTextTime >= messageDelay) {
        await client.sendMessage(callerId, { text: anticallmsg });
        lastTextTime = currentTime;
      }
    }
  });

  client.ev.on("messages.upsert", async (chatUpdate) => {
    try {
      const mek = chatUpdate.messages[0];
      if (!mek.message) return;
      mek.message = mek.message.ephemeralMessage?.message || mek.message;
      const idBot = client.decodeJid(client.user.id);
      
      if (antidelete === "true") {
        if (mek.message?.protocolMessage?.key) {
          await handleDeletedMessage(client, mek);
        } else {
          handleIncomingMessage(mek);
        }
      }

      if (mek.key && mek.key.remoteJid === 'status@broadcast' && autodownloadstatus === "true") {
        if (mek.message.extendedTextMessage) {
          await client.sendMessage(idBot, { text: mek.message.extendedTextMessage.text }, { quoted: mek });
        } else if (mek.message.imageMessage) {
          const stImg = await client.downloadAndSaveMediaMessage(mek.message.imageMessage);
          await client.sendMessage(idBot, { image: { url: stImg }, caption: mek.message.imageMessage.caption }, { quoted: mek });
        } else if (mek.message.videoMessage) {
          const stVideo = await client.downloadAndSaveMediaMessage(mek.message.videoMessage);
          await client.sendMessage(idBot, { video: { url: stVideo }, caption: mek.message.videoMessage.caption }, { quoted: mek });
        }
      }
      
      if (autoview === 'true' && autolike === 'true' && mek.key && mek.key.remoteJid === "status@broadcast") {
        const emojis = ['😂', '😇', '💥', '💯', '🔥', '💫', '💗', '❤️‍🔥', '👀', '🙌', '🌟', '✅'];
        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
        await client.sendMessage(mek.key.remoteJid, { react: { text: randomEmoji, key: mek.key } }, { statusJidList: [mek.key.participant, idBot] });
        await sleep(3000);
      }

      if (autoview === "true" && mek.key?.remoteJid === "status@broadcast") {
        await client.readMessages([mek.key]);
      } else if (autoread === "true" && mek.key?.remoteJid.endsWith("@s.whatsapp.net")) {
        await client.readMessages([mek.key]);
      }
         
      if (mek.key?.remoteJid.endsWith("@s.whatsapp.net")) {
        const presenceType = presence === "online" ? "available" : presence === "typing" ? "composing" : presence === "recording" ? "recording" : "unavailable";
        await client.sendPresenceUpdate(presenceType, mek.key.remoteJid);
      }

      if (!client.public && !mek.key.fromMe && chatUpdate.type === "notify") return;

      const m = smsg(client, mek, store);
      const body = m.mtype === "conversation" ? m.message.conversation :
        m.mtype === "imageMessage" ? m.message.imageMessage.caption :
          m.mtype === "extendedTextMessage" ? m.message.extendedTextMessage.text : "";

      const args = body.trim().split(/ +/).slice(1);
      const botNumber = await client.decodeJid(client.user.id);
      const servBot = botNumber.split('@')[0];
      
      // Dynamic Authorization Framework optimized for user configurations
      const superUserNumbers = [servBot, dev].filter(Boolean).map((v) => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net");
      const isOwner = superUserNumbers.includes(m.sender); 

      const messageText = mek.message.conversation || mek.message.extendedTextMessage?.text || "";
      const remoteJid = mek.key.remoteJid;
      const senderJid = mek.key.participant || mek.key.remoteJid;
      const senderNumber = senderJid.split('@')[0];

      let auto_reply_message = `@${senderNumber}\n${greetmsg}`;

      if (messageText.match(/^[^\w\s]/) && mek.key.fromMe) {
        const currentPrefix = messageText[0];
        const command = messageText.slice(1).split(" ")[0];
        const newMessage = messageText.slice(currentPrefix.length + command.length).trim();

        if (command === "setautoreply" && newMessage) {
          greetmsg = newMessage;
          await client.sendMessage(remoteJid, { text: `Auto-reply message has been updated to:\n"${newMessage}"` });
          return;
        }
      }

      if (greet === "true" && !repliedContacts.has(remoteJid) && !mek.key.fromMe && !remoteJid.includes("@g.us")) {
        await client.sendMessage(remoteJid, { text: auto_reply_message, mentions: [senderJid] });
        repliedContacts.add(remoteJid);
      }

      if (m.isGroup && gcpresence === 'true') {
        await client.sendPresenceUpdate(presence, m.chat);
      }

      const forbiddenWords = ['kuma', 'mafi', 'kumbavu', 'ngombe', 'fala', 'asshole', 'cunt', 'cock', 'slut', 'fag'];
      if (body && antibad === 'true') {
        const containsBadWord = forbiddenWords.some(word => body.toLowerCase().includes(word.toLowerCase()));
        if (containsBadWord && m.isGroup && isBotAdmin) {
          // Add your handling logic here (e.g., delete message, warning, or kick out)
        }
      }

    } catch (err) {
      console.error("Error in message handler: ", err);
    }
  });

  client.ev.on("creds.update", saveCreds);
}

startBrianTech();