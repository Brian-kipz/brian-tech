# 🤖 BRIAN-TECH

A powerful and flexible WhatsApp bot that can be deployed anywhere.

---

## 🚀 Deployment Platforms

Choose your preferred deployment platform:

### 🚂 Railway
**Fast deployment with modern features**

1. Fork this repository
2. Go to [Railway.app](https://railway.app)
3. Create a new project and select "Deploy from GitHub"
4. Connect your forked repository
5. Add environment variables in the Railway dashboard
6. Deploy with one click!

[Railway Deploy Guide →](https://docs.railway.app)

---

### 🎨 Render
**Easy hosting with free tier available**

1. Sign up at [Render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Set build command: `npm install`
5. Set start command: `npm start`
6. Add environment variables
7. Deploy!

[Render Deploy Guide →](https://render.com/docs)

---

### 🦸 Heroku
**Classic platform with extensive documentation**

1. Install [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
2. Create a new app:
   ```bash
   heroku create your-app-name
   ```
3. Set environment variables:
   ```bash
   heroku config:set KEY=value
   ```
4. Deploy:
   ```bash
   git push heroku main
   ```
5. View logs:
   ```bash
   heroku logs --tail
   ```

[Heroku Deploy Guide →](https://devcenter.heroku.com/articles/getting-started-with-nodejs)

---

### 📱 Termux
**Deploy on your Android device**

1. Install [Termux](https://termux.com) from F-Droid or Play Store
2. Update packages:
   ```bash
   pkg update && pkg upgrade
   ```
3. Install Node.js:
   ```bash
   pkg install nodejs
   ```
4. Clone the repository:
   ```bash
   git clone https://github.com/Brian-kipz/BRIAN-TECH.git
   cd BRIAN-TECH
   ```
5. Install dependencies:
   ```bash
   npm install
   ```
6. Start the bot:
   ```bash
   npm start
   ```

[Termux Setup Guide →](https://termux.com)

---

## 🔐 Generate Your Code

### Get Your WhatsApp QR Code

The bot will generate a QR code when you first run it:

1. Run the bot on your chosen platform
2. A QR code will appear in the console/logs
3. Scan the QR code with WhatsApp (Settings → Linked Devices → Link a Device)
4. Your bot is now connected!

### Environment Variables Setup

Create a `.env` file or set environment variables in your deployment platform:

```env
BOT_NAME=BRIAN-TECH
PREFIX=!
LOG_LEVEL=info
```

---

## 📋 Quick Comparison

| Platform | Ease | Free Tier | Speed | Best For |
|----------|------|-----------|-------|----------|
| **Railway** | ⭐⭐⭐⭐ | Limited | ⚡⚡⚡⚡⚡ | Modern Apps |
| **Render** | ⭐⭐⭐⭐ | Yes | ⚡⚡⚡⚡ | Beginners |
| **Heroku** | ⭐⭐⭐ | No* | ⚡⚡⚡ | Established Projects |
| **Termux** | ⭐⭐ | Yes | ⚡⚡⚡ | Learning |

---

## 🎯 Recommended Setup Order

1. **First Time?** → Start with **Render** (easiest)
2. **Want Better Performance?** → Use **Railway**
3. **On Mobile?** → Try **Termux**
4. **Enterprise?** → Consider **Heroku**

---

## 🆘 Troubleshooting

### QR Code Not Appearing?
- Check your deployment logs
- Ensure bot is running properly
- Try restarting the bot

### Connection Issues?
- Verify environment variables are set
- Check internet connection
- Review bot logs for errors

### Bot Not Responding?
- Restart the bot
- Re-scan QR code
- Check prefix is correct

---

## 📚 Resources

- [Node.js Docs](https://nodejs.org/docs/)
- [WhatsApp Bot Best Practices](https://www.whatsapp.com/en/business/)
- [GitHub Actions](https://github.com/features/actions)

---

## 📝 License

MIT License - Feel free to use for personal and commercial projects

---

<div align="center">

**Deploy BRIAN-TECH Anywhere, Anytime 🚀**

[GitHub](https://github.com/Brian-kipz/BRIAN-TECH) | [Issues](https://github.com/Brian-kipz/BRIAN-TECH/issues) | [Discussions](https://github.com/Brian-kipz/BRIAN-TECH/discussions)

</div>
