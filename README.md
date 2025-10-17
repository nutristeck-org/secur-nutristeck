# NutriSteck — Secure (secur-nutristeck)

This repository contains a comprehensive banking simulation web application demonstrating secure financial services platform features.

## 🌟 Features

- **Secure Login System**: Multi-factor authentication with User ID, Password, and PIN
- **Dashboard**: Real-time account balance and transaction history display
- **Banking Services**: Zelle transfers, mobile deposit, and bill pay interfaces
- **Cryptocurrency Deposits**: Multi-coin deposit system with admin management
  - Support for BTC, BNB, ETH, TRX, SOL, USDT (multiple networks), USDC (multiple networks)
  - QR code generation for wallet addresses
  - Admin approval workflow with status tracking
  - Network-specific warnings and instructions
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
- `crypto-deposit.html` - Cryptocurrency deposit interface
- `admin-crypto.html` - Admin crypto wallet management

### Backend Components:
- `telegram-server.js` - Express webhook server for Telegram integration and crypto deposit APIs
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

## 🔐 Getting Started

### Admin Access
The system creates an admin account on first startup. Admin credentials must be set via environment variables:

1. Copy `.env.production` to `.env` and set your secure admin password:
```bash
cp .env.production .env
# Edit .env and set ADMIN_PASSWORD to a secure value
```

2. Start the server:
```bash
npm start
```

3. Login as admin with username `admin` and your configured password.

### User Registration
Real users can register through the system. New users require admin approval before they can access their accounts.

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

## 💎 Cryptocurrency Deposits

### User Features:
- Multi-coin support: Bitcoin (BTC), Binance Coin (BNB), Ethereum (ERC20), TRON (TRC20), Solana (SOL)
- Multi-network USDT: BEP20, ERC20, TRC20, SOL-USDT
- Multi-network USDC: BEP20, ERC20, SOL-USDC
- QR code generation for easy mobile wallet scanning
- Real-time deposit status tracking (Pending → Approved/Rejected)
- Network-specific warnings to prevent user errors

### Admin Features:
- Wallet address management for all supported coins/networks
- Deposit approval/rejection workflow
- Comprehensive audit logging
- Demo wallet quick-loading for testing
- Real-time pending deposit monitoring

### API Endpoints:
- `POST /api/crypto/wallet` - Get wallet address for coin/network
- `POST /api/crypto/deposit` - Submit crypto deposit  
- `GET /api/crypto/deposits` - Get user's deposit history
- `POST /api/admin/wallet` - Admin: Create/update wallet
- `GET /api/admin/wallets` - Admin: List all wallets
- `POST /api/admin/deposit/status` - Admin: Approve/reject deposit

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