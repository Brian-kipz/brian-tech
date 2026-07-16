const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    delay
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const readline = require("readline");

// Setup readline interface for pairing code input in terminal
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startBot() {
    // 1. Manage session authentication (saves session credentials in './session' folder)
    const { state, saveCreds } = await useMultiFileAuthState("./session");
    const { version } = await fetchLatestBaileysVersion();

    // 2. Initialize the WhatsApp Socket connection
    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: false, // Set to false since we are using pairing code
        logger: pino({ level: "silent" }), // Keeps the console clean from spammy logs
        browser: ["Ubuntu", "Chrome", "20.0.04"] // Required for pairing code reliability
    });

    // 3. Handle Pairing Code Authentication (If not already logged in)
    if (!sock.authState.creds.registered) {
        console.clear();
        console.log("\x1b[1;32m=== BRIAN-TECH WHATSAPP BOT PORTAL ===\x1b[0m\n");
        const phoneNumber = await question("\x1b[1;36mEnter your phone number with Country Code (e.g., 254XXXXXXXXX):\x1b[0m ");
        
        // Clean the input (remove spaces, +, hyphens)
        const formattedNumber = phoneNumber.replace(/[^0-9]/g, "");

        if (formattedNumber.length < 10) {
            console.log("\x1b[1;31mInvalid phone number format. Restarting...\x1b[0m");
            process.exit(1);
        }

        console.log("\x1b[1;33m\nRequesting pairing code from WhatsApp servers...\x1b[0m");
        await delay(3000); // Small delay to sync states securely
        
        try {
            const code = await sock.requestPairingCode(formattedNumber);
            console.log("\n-----------------------------------------");
            console.log(`\x1b[1;32mYOUR PAIRING CODE IS:\x1b[0m \x1b[1;37;42m  ${code}  \x1b[0m`);
            console.log("-----------------------------------------");
            console.log("\x1b[5;33mOpen WhatsApp -> Linked Devices -> Link with Phone Number\x1b[0m\n");
        } catch (error) {
            console.error("Failed to fetch pairing code: ", error);
            process.exit(1);
        }
    }

    // 4. Track Connection Updates (Connect, Disconnect, Reconnect)
    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "close") {
            const shouldReconnect = (lastDisconnect.error instanceof Boom) 
                ? lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut 
                : true;

            console.log(`\x1b[1;31mConnection closed due to: ${lastDisconnect.error}. Reconnecting: ${shouldReconnect}\x1b[0m`);
            
            if (shouldReconnect) {
                startBot(); // Auto-restart if not logged out intentionally
            } else {
                console.log("\x1b[1;31mLogged out. Please delete the './session' folder and restart.\x1b[0m");
                process.exit(1);
            }
        } else if (connection === "open") {
            console.log("\x1b[1;32m\n=========================================");
            console.log("   BRIAN-TECH CONNECTED SUCCESSFULLY!    ");
            console.log("=========================================\x1b[0m\n");
        }
    });

    // Save session credentials whenever updated
    sock.ev.on("creds.update", saveCreds);

    // 5. Message Handler (The Command Core)
    sock.ev.on("messages.upsert", async ({ messages, type }) => {
        try {
            if (type !== "notify") return;
            const msg = messages[0];
            if (!msg.message) return; // Ignore empty/system messages
            
            const from = msg.key.remoteJid;
            const isGroup = from.endsWith("@g.us");
            
            // Extract the message text from various possible formats
            const body = (msg.message.conversation || 
                          msg.message.extendedTextMessage?.text || 
                          msg.message.imageMessage?.caption || 
                          msg.message.videoMessage?.caption || "")
                         .trim();

            const prefix = "!"; // Change your prefix here if desired
            const isCmd = body.startsWith(prefix);
            const command = isCmd ? body.slice(prefix.length).trim().split(/ +/).shift().toLowerCase() : "";
            const args = isCmd ? body.trim().split(/ +/).slice(1) : [];
            const text = args.join(" ");

            // Check if the sender is you (owner status)
            const sender = msg.key.participant || msg.key.remoteJid;
            const isMe = msg.key.fromMe;

            if (!isCmd) return;

            // Simple reply function helper
            const reply = async (txt) => {
                await sock.sendMessage(from, { text: txt }, { quoted: msg });
            };

            // === COMMANDS SYSTEM ===
            switch (command) {
                case "ping":
                    const start = Date.now();
                    await reply("🚀 Calculating latency...");
                    const latency = Date.now() - start;
                    await sock.sendMessage(from, { text: `*Pong!* ⚡ \`${latency}ms\`` }, { quoted: msg });
                    break;

                case "menu":
                    const menuText = `
*╭━━━〔 𝗕𝗥𝗜𝗔𝗡-𝗧𝗘𝗖𝗛 〕━━━┈*
┃ 
┃ *⚡ Prefix:* \`${prefix}\`
┃ *👤 Developer:* Brian Kimutai
┃
┣━━━〔 𝗨𝘁𝗶𝗹𝗶𝘁𝗶𝗲𝘀 〕━━━┈
┃ 💻 *${prefix}ping* - Check speed latency
┃ 📋 *${prefix}menu* - View command list
┃ 👤 *${prefix}owner* - Contact developer
┃
┗━━━━━━━━━━━━━━━━━━━━┈
`;
                    await reply(menuText.trim());
                    break;

                case "owner":
                    await reply("This bot is developed by *Brian Kimutai*. For inquiries, please reach out to: https://github.com/Spiffydewizard");
                    break;

                default:
                    // Unknown command - can be left silent or replied to
                    break;
            }

        } catch (err) {
            console.error("Error processing message: ", err);
        }
    });
}

// Start the bot
startBot().catch((err) => console.error("Critical Startup Error:", err));
