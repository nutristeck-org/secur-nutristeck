# NutriSteck — Secure (secur-nutristeck)

This repository contains a comprehensive banking simulation web application demonstrating secure financial services platform features.

## 🌟 Features

- **Secure Login System**: Multi-factor authentication with User ID, Password, and PIN
- **Dashboard**: Real-time account balance and transaction history display
- **Banking Services**: Zelle transfers, mobile deposit, and bill pay interfaces
- **Telegram Integration**: Webhook server for account notifications and linking
- **Responsive Design**: Mobile-first design that works across all devices
- **Accessibility**: ARIA labels and keyboard navigation support

## 📁 Project Structure

### Frontend Pages:
- `index.html` - Main landing page
- `login.html` - Secure authentication page
- `dashboard.html` - User account dashboard
- `zelle.html` - Money transfer interface
- `mobile-deposit.html` - Check deposit simulation
- `bill-pay.html` - Bill payment interface

### Backend Components:
- `telegram-server.js` - Express webhook server for Telegram integration
- `app.js` - Main client-side JavaScript
- `styles.css` - Global styling and responsive design

### Assets & Configuration:
- `assets/logo.svg` - NutriSteck logo
- `package.json` - Dependencies and scripts
- `.eslintrc.json` - Code quality configuration
- `.env.example` - Environment variables template

## 🚀 Quick Start

### Running the Static Site:
```bash
# Serve the static files
npx http-server -p 8080 .
# OR
npm run serve
```

### Running with Telegram Integration:
```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env with your Telegram bot credentials
# TELEGRAM_BOT_TOKEN=your_bot_token_here
# TELEGRAM_SECRET_TOKEN=your_webhook_secret
# INTERNAL_TOKEN=your_api_token

# Start the Telegram webhook server
npm start
```

## 🔐 Demo Credentials

For testing the login functionality, use these sample credentials:

- **User ID:** `Lowkeyrich1413`
- **Password:** `$SlimYellow1`
- **PIN:** `1234`

## 🛠️ Development

### Code Quality:
```bash
# Run ESLint
npm run lint

# Check code syntax
node -c telegram-server.js
```

### Testing:
- All HTML files validated for proper structure
- JavaScript functionality tested across login/dashboard flow
- Mobile responsive design verified
- Accessibility features implemented

## 📱 Mobile Support

The application is fully responsive and tested on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🔗 Telegram Bot Setup

1. Create a bot with @BotFather on Telegram
2. Get your bot token and add it to `.env`
3. Set up webhook URL: `https://yourdomain.com/telegram-webhook/{SECRET_TOKEN}`
4. Users can link accounts via deep links generated in the dashboard

## ⚠️ Security Notes

- This is a **DEMONSTRATION APPLICATION** - not for production use
- Credentials are hardcoded for demo purposes only
- In production, implement proper authentication, encryption, and secure storage
- Never commit real API tokens or secrets to version control

## 🌐 Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📄 License

MIT License - see LICENSE file for details

---

**⚡ Ready for Development:** All components tested and validated for successful deployment!