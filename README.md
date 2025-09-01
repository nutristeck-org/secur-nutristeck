# NutriSteck — Secure (Modern React Web App)

This repository contains a modern React web application with Express.js backend for secure banking operations, converted from the original static HTML demo.

## Features

- **React Frontend**: Single Page Application with React Router
- **Authentication**: JWT-based login with session management
- **Banking Operations**: Zelle transfers, mobile deposits, bill payments
- **Telegram Integration**: Bot notifications for key account activities
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Live balance and transaction updates

## Tech Stack

- **Frontend**: React 18, React Router DOM, CSS3
- **Backend**: Node.js, Express.js, JWT, CORS
- **Authentication**: JSON Web Tokens with localStorage
- **Telegram**: Webhook integration for notifications

## Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Install all dependencies**:
```bash
npm run install:all
```

2. **Set up environment variables** (optional for demo):
```bash
cp .env.example .env
# Edit .env file with your Telegram bot credentials
```

3. **Start development servers**:
```bash
npm run dev
```
This runs both the backend (port 5000) and frontend (port 3000) concurrently.

### Alternative: Start servers separately

**Backend only**:
```bash
npm run server:dev
```

**Frontend only**:
```bash
npm run client:dev
```

## Demo Credentials

Use these credentials to test the application:
- **User ID**: `Lowkeyrich1413`
- **Password**: `$SlimYellow1`
- **PIN**: `1234`

## API Endpoints

- `POST /api/login` - User authentication
- `GET /api/dashboard` - User dashboard data
- `POST /api/send-money` - Zelle money transfer
- `POST /api/mobile-deposit` - Mobile check deposit
- `POST /api/pay-bill` - Bill payment
- `POST /telegram-webhook/{secret}` - Telegram bot webhook
- `POST /api/notify` - Send Telegram notifications

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # Auth context
│   │   └── App.js         # Main app component
├── server/                 # Express backend
│   └── index.js           # Main server file
├── static-backup/          # Original static files
└── package.json           # Root package configuration
```

## Development

- Frontend runs on `http://localhost:3000`
- Backend runs on `http://localhost:5000`
- API requests are proxied from frontend to backend

## Production Build

```bash
npm run build
npm start
```

## Telegram Bot Setup

1. Create a bot with @BotFather on Telegram
2. Set environment variables:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_SECRET_TOKEN`
   - `INTERNAL_TOKEN`
3. Set up webhook URL pointing to your server

## Security Features

- JWT token-based authentication
- Protected routes requiring valid tokens
- CORS enabled for cross-origin requests
- Input validation on all forms
- Session management with localStorage

---

**Previous Version**: Original static HTML files are preserved in `static-backup/` directory.

**Note**: This is a demo application. Do not use in production without proper security hardening.