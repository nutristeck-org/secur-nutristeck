# Telegram integration

This repository includes a minimal Express webhook server (telegram-server.js) that receives updates from your Telegram bot and provides an authenticated `/api/notify` endpoint for sending messages from the backend.

Setup (do not commit secrets):
1. Copy `.env.example` to `.env` and fill in `TELEGRAM_BOT_TOKEN`, `TELEGRAM_SECRET_TOKEN`, and `INTERNAL_TOKEN`.
2. Install dependencies: `npm install express body-parser node-fetch@2`.
3. Run locally: `node telegram-server.js`.
4. Use ngrok for local webhook testing: `ngrok http 3000` and set webhook:
   `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://<ngrok-id>.ngrok.io/telegram-webhook/<TELEGRAM_SECRET_TOKEN>`

Linking flow:
- Generate a unique `link_code` for the logged-in user on the dashboard and show a deep link: `https://t.me/my_bot_Trenchp1413bot?start=<link_code>`.
- When user opens that link Telegram sends `/start <link_code>` to the bot; the webhook maps the `link_code` to `chat_id`.
- Backend can then call `/api/notify` with `X-Internal-Token` set to `INTERNAL_TOKEN` and body `{chat_id, text}` to send notifications.

Security notes:
- Never paste bot tokens in public chat.
- Store secrets in environment variables or GitHub Actions secrets.
- Persist chat mappings in a database in production.
