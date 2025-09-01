const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const fetch = require('node-fetch');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Environment variables
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_SECRET = process.env.TELEGRAM_SECRET_TOKEN || 'change_me';
const INTERNAL_TOKEN = process.env.INTERNAL_TOKEN || 'changeme';

// Mock user store
const users = {
  'Lowkeyrich1413': {
    id: 1,
    username: 'Lowkeyrich1413',
    password: '$SlimYellow1', // In production, this would be hashed
    pin: '1234',
    name: 'Rich Johnson',
    balance: 1234.56,
    accountNumber: '****7890',
    transactions: [
      { id: 1, date: '2025-01-01', description: 'Stock earnings credit', amount: 250.00 },
      { id: 2, date: '2024-12-30', description: 'Stock earnings credit', amount: 200.50 },
      { id: 3, date: '2024-12-28', description: 'Stock earnings credit', amount: 150.00 },
      { id: 4, date: '2024-12-25', description: 'Stock earnings credit', amount: 300.25 },
      { id: 5, date: '2024-12-22', description: 'Stock earnings credit', amount: 120.00 },
      { id: 6, date: '2024-12-20', description: 'Stock earnings credit', amount: 180.00 },
      { id: 7, date: '2024-12-18', description: 'Stock earnings credit', amount: 210.75 },
      { id: 8, date: '2024-12-15', description: 'Stock earnings credit', amount: 95.00 }
    ]
  }
};

// Telegram bot functionality
const userToChat = {}; // { link_code: chatId }

function telegramApi(method, body) {
  if (!BOT_TOKEN) return Promise.resolve({ ok: false, error: 'Bot token not configured' });
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  }).then(r => r.json());
}

// Telegram webhook
app.post(`/telegram-webhook/${TELEGRAM_SECRET}`, async (req, res) => {
  try {
    const update = req.body;
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat.id;
      const text = msg.text || '';
      
      if (text.startsWith('/start')) {
        const parts = text.split(' ');
        if (parts.length > 1) {
          const code = parts[1].trim();
          userToChat[code] = chatId;
          await telegramApi('sendMessage', {
            chat_id: chatId,
            text: `Linked with code ${code}. You will receive notifications for account activities.`
          });
          return res.sendStatus(200);
        }
      }
      
      if (text === '/balance') {
        const linked = Object.keys(userToChat).find(k => userToChat[k] === chatId);
        if (linked) {
          // Find user by link code and get their actual balance
          const user = Object.values(users)[0]; // For demo, use first user
          await telegramApi('sendMessage', {
            chat_id: chatId,
            text: `Balance for ${user.name}: $${user.balance.toFixed(2)}`
          });
        } else {
          await telegramApi('sendMessage', {
            chat_id: chatId,
            text: 'No account linked. Use the dashboard "Connect Telegram" button to link.'
          });
        }
        return res.sendStatus(200);
      }
      
      await telegramApi('sendMessage', {
        chat_id: chatId,
        text: 'Use /balance or /start <code> to link your account.'
      });
    }
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

// Helper function to send telegram notifications
async function sendTelegramNotification(linkCode, message) {
  const chatId = userToChat[linkCode];
  if (chatId) {
    await telegramApi('sendMessage', {
      chat_id: chatId,
      text: message,
      parse_mode: 'Markdown'
    });
  }
}

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// API Routes

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password, pin } = req.body;

  // Find user
  const user = users[username];
  if (!user) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  // Check credentials (in production, use bcrypt.compare for hashed passwords)
  if (user.password !== password || user.pin !== pin) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  // Generate link code for Telegram
  const linkCode = 'user-' + Math.random().toString(36).slice(2, 10);

  // Send Telegram notification
  await sendTelegramNotification(linkCode, `🔐 *Login Alert*\nUser ${user.name} logged in successfully`);

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      balance: user.balance,
      accountNumber: user.accountNumber
    },
    linkCode
  });
});

// Get user dashboard data
app.get('/api/dashboard', authenticateToken, (req, res) => {
  const user = users[req.user.username];
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      balance: user.balance,
      accountNumber: user.accountNumber
    },
    transactions: user.transactions
  });
});

// Send money (Zelle simulation)
app.post('/api/send-money', authenticateToken, async (req, res) => {
  const { recipient, amount, memo } = req.body;
  const user = users[req.user.username];

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (amount > user.balance) {
    return res.status(400).json({ error: 'Insufficient funds' });
  }

  // Update user balance and add transaction
  user.balance -= parseFloat(amount);
  user.transactions.unshift({
    id: Date.now(),
    date: new Date().toISOString().split('T')[0],
    description: `Money sent to ${recipient}${memo ? ' - ' + memo : ''}`,
    amount: -parseFloat(amount)
  });

  // Send Telegram notification
  const linkCode = req.headers['x-link-code'];
  await sendTelegramNotification(linkCode, 
    `💸 *Money Sent*\nAmount: $${amount}\nTo: ${recipient}\nNew Balance: $${user.balance.toFixed(2)}`
  );

  res.json({ 
    success: true, 
    newBalance: user.balance,
    message: 'Money sent successfully'
  });
});

// Mobile deposit simulation
app.post('/api/mobile-deposit', authenticateToken, async (req, res) => {
  const { amount, checkImage } = req.body;
  const user = users[req.user.username];

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Update user balance and add transaction
  user.balance += parseFloat(amount);
  user.transactions.unshift({
    id: Date.now(),
    date: new Date().toISOString().split('T')[0],
    description: `Mobile check deposit`,
    amount: parseFloat(amount)
  });

  // Send Telegram notification
  const linkCode = req.headers['x-link-code'];
  await sendTelegramNotification(linkCode, 
    `📱 *Mobile Deposit*\nAmount: $${amount}\nNew Balance: $${user.balance.toFixed(2)}`
  );

  res.json({ 
    success: true, 
    newBalance: user.balance,
    message: 'Check deposited successfully'
  });
});

// Bill pay simulation
app.post('/api/pay-bill', authenticateToken, async (req, res) => {
  const { payee, amount, accountNumber } = req.body;
  const user = users[req.user.username];

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (amount > user.balance) {
    return res.status(400).json({ error: 'Insufficient funds' });
  }

  // Update user balance and add transaction
  user.balance -= parseFloat(amount);
  user.transactions.unshift({
    id: Date.now(),
    date: new Date().toISOString().split('T')[0],
    description: `Bill payment to ${payee}`,
    amount: -parseFloat(amount)
  });

  // Send Telegram notification
  const linkCode = req.headers['x-link-code'];
  await sendTelegramNotification(linkCode, 
    `💳 *Bill Payment*\nPayee: ${payee}\nAmount: $${amount}\nNew Balance: $${user.balance.toFixed(2)}`
  );

  res.json({ 
    success: true, 
    newBalance: user.balance,
    message: 'Bill paid successfully'
  });
});

// Protected notify endpoint for external services
app.post('/api/notify', async (req, res) => {
  const token = req.headers['x-internal-token'];
  if (!token || token !== INTERNAL_TOKEN) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  
  const { chat_id, text } = req.body;
  if (!chat_id || !text) {
    return res.status(400).json({ error: 'chat_id and text required' });
  }
  
  try {
    const result = await telegramApi('sendMessage', {
      chat_id,
      text,
      parse_mode: 'Markdown'
    });
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'send failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});