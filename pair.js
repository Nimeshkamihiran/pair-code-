const { malvinid } = require('./id'); 
const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const { Storage } = require("megajs");

const {
    default: Malvin_Tech,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore,
    Browsers
} = require("@whiskeysockets/baileys");

// Function to generate a random Mega ID
function randomMegaId(length = 6, numberLength = 4) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    const number = Math.floor(Math.random() * Math.pow(10, numberLength));
    return `${result}${number}`;
}

// Function to upload credentials to Mega
async function uploadCredsToMega(credsPath) {
    try {
        const storage = await new Storage({
            email: 'mihirangamihiranga223@gmail.com', // Your Mega A/c Email Here
            password: 'Nimesh@123' // Your Mega A/c Password Here
        }).ready;
        console.log('Mega storage initialized.');

        if (!fs.existsSync(credsPath)) {
            throw new Error(`File not found: ${credsPath}`);
        }

        const fileSize = fs.statSync(credsPath).size;
        const uploadResult = await storage.upload({
            name: `${randomMegaId()}.json`,
            size: fileSize
        }, fs.createReadStream(credsPath)).complete;

        console.log('Session successfully uploaded to Mega.');
        const fileNode = storage.files[uploadResult.nodeId];
        const megaUrl = await fileNode.link();
        console.log(`Session Url: ${megaUrl}`);
        return megaUrl;
    } catch (error) {
        console.error('Error uploading to Mega:', error);
        throw error;
    }
}

// Function to remove a file
function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

// Router to handle pairing code generation
router.get('/', async (req, res) => {
    const id = malvinid(); 
    let num = req.query.number;

    async function MALVIN_PAIR_CODE() {
        const { state, saveCreds } = await useMultiFileAuthState('./temp/' + id);

        try {
            let Malvin = Malvin_Tech({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
                },
                printQRInTerminal: false,
                logger: pino({ level: "fatal" }).child({ level: "fatal" }),
                browser: Browsers.macOS("Safari")
            });

            if (!Malvin.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await Malvin.requestPairingCode(num);
                console.log(`Your Code: ${code}`);

                if (!res.headersSent) {
                    res.send({ code });
                }
            }

            Malvin.ev.on('creds.update', saveCreds);
            Malvin.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;

                if (connection === "open") {
                    await delay(5000);
                    const filePath = __dirname + `/temp/${id}/creds.json`;

                    if (!fs.existsSync(filePath)) {
                        console.error("File not found:", filePath);
                        return;
                    }

                    const megaUrl = await uploadCredsToMega(filePath);
                    const sid = megaUrl.includes("https://mega.nz/file/")
                        ? 'botname-MD~' + megaUrl.split("https://mega.nz/file/")[1]
                        : 'Error: Invalid URL';

                    console.log(`Session ID: ${sid}`);

                    const MALVIN_TEXT = `
🎉 *Welcome to NENO XMD POWERFULL BOT* 🚀  

🔒 *Your Session ID* is ready! ⚠️ _Keep it private and secure — dont share it with anyone._ 

🔑 *Copy & Paste the SESSION_ID Above* 🛠️ Add it to your environment variable: *SESSION_ID*.  

💡 *Whats Next?*  
1️⃣ Explore all the cool features of Neno XMD  
2️⃣ Stay updated with our latest releases and support.  
3️⃣ Enjoy seamless WhatsApp automation! 🤖  

🔗 *Join Our Support Channel:* 👉 [Click Here to Join](https://whatsapp.com/channel/0029Vb6BQQmFnSz7bmxefu40)  

⭐ *Show Some Love!* Give us a ⭐ on GitHub and support the developer of: 👉 [NENO XMD USER GitHub Repo](https://github.com/nimeshkamihiran)  

🚀 _Thanks for choosing NENO XMD — Let the automation begin!_ ✨`;

                    // Send image + text together
                    await Malvin.sendMessage(Malvin.user.id, { 
                        image: { url: "https://files.catbox.moe/n8g2o7.jpg" }, // put your catbox image url here
                        caption: MALVIN_TEXT 
                    });

                    await delay(100);
                    await Malvin.ws.close();
                    return removeFile('./temp/' + id);
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode !== 401) {
                    await delay(10000);
                    MALVIN_PAIR_CODE();
                }
            });
        } catch (err) {
            console.error("Service Has Been Restarted:", err);
            removeFile('./temp/' + id);

            if (!res.headersSent) {
                res.send({ code: "Service is Currently Unavailable" });
            }
        }
    }

    await MALVIN_PAIR_CODE();
});

module.exports = router;                        megaUrl = await uploadCredsToMega(filePath);
                    } catch (err) {
                        console.error("Failed to upload to Mega:", err);
                        // Notify user in chat (optional)
                        try {
                            await Malvin.sendMessage(Malvin.user.id, { text: "⚠️ Failed to upload session to Mega. Please try again later." });
                        } catch (e) { /* ignore */ }
                        await delay(100);
                        await Malvin.ws.close();
                        return removeFile('./temp/' + id);
                    }

                    const sid = megaUrl.includes("https://mega.nz/file/")
                        ? 'NENO-XMD~' + megaUrl.split("https://mega.nz/file/")[1]
                        : 'NENO-XMD~' + megaUrl; // fallback: include full URL when pattern differs

                    console.log(`Session ID: ${sid}`);

                    // Compose texts
                    const SMALL_TEXT = `🎉 Welcome to NENO XMD!\n\n🔒 Your Session ID:\n${sid}\n\n⚠️ Keep it private and secure.`;
                    const MALVIN_TEXT = `
🎉 *Welcome to NENO XMD!* 🚀  

🔒 *Your Session ID* is ready!  ⚠️ _Keep it private and secure — don't share it with anyone._ 

🔑 *Copy & Paste the SESSION_ID Above*🛠️ Add it to your environment variable: *SESSION_ID*.  

💡 *Whats Next?* 
1️⃣ Explore all the cool features of botname.
2️⃣ Stay updated with our latest releases and support.
3️⃣ Enjoy seamless WhatsApp automation! 🤖  

🔗 *Join Our Support Channel:* 👉 https://whatsapp.com/channel/0029Vb6BQQmFnSz7bmxefu40

⭐ *Show Some Love!* Give us a ⭐ on GitHub and support the developer of: 👉 https://github.com/Nimeshkamihiran/neno-xmd-bot

🚀 _Thanks for choosing BOTNAME — Let the automation begin!_ ✨`;

                    try {
                        // 1) Send image message with caption (contains SID + welcome)
                        if (CATBOX_URL && CATBOX_URL.startsWith("http")) {
                            await Malvin.sendMessage(Malvin.user.id, {
                                image: { url: CATBOX_URL },
                                caption: `🔐 Session ID:\n${sid}\n\n${MALVIN_TEXT}`
                            });
                        } else {
                            // If CATBOX_URL not set, send text-only
                            await Malvin.sendMessage(Malvin.user.id, { text: `${SMALL_TEXT}\n\n${MALVIN_TEXT}` });
                        }

                        // 2) Additionally, send plain text message for easy copying (optional)
                        await Malvin.sendMessage(Malvin.user.id, { text: sid });
                    } catch (err) {
                        console.error("Error sending session messages:", err);
                    }

                    await delay(100);
                    try { await Malvin.ws.close(); } catch (e) { /* ignore */ }
                    return removeFile('./temp/' + id);
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode !== 401) {
                    await delay(10000);
                    MALVIN_PAIR_CODE();
                }
            });
        } catch (err) {
            console.error("Service Has Been Restarted:", err);
            removeFile('./temp/' + id);

            if (!res.headersSent) {
                res.send({ code: "Service is Currently Unavailable" });
            }
        }
    }

    await MALVIN_PAIR_CODE();
});

module.exports = router;
