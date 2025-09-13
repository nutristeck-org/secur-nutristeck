const express = require('express');
const fetch = require('node-fetch'); // npm i node-fetch@2
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Enable CORS for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-user, x-admin-user, x-internal-token');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN; // set in env
const TELEGRAM_SECRET = process.env.TELEGRAM_SECRET_TOKEN || 'change_me';
const PORT = process.env.PORT || 3000;
const INTERNAL_TOKEN = process.env.INTERNAL_TOKEN || 'changeme';

// In production persist mappings in DB
const userToChat = {}; // { link_code: chatId }

// Crypto deposit storage (in production use proper database)
const cryptoWallets = {}; // { crypto_network: { address, label, status } }
const cryptoDeposits = []; // array of deposit objects
let depositIdCounter = 1000;

function telegramApi(method, body){
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/${method}`;
  return fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}).then(r=>r.json());
}

app.post(`/telegram-webhook/${TELEGRAM_SECRET}`, async (req,res)=>{
  try{
    const update = req.body;
    if(update.message){
      const msg = update.message; const chatId = msg.chat.id; const text = msg.text || '';
      if(text.startsWith('/start')){
        const parts = text.split(' ');
        if(parts.length>1){
          const code = parts[1].trim();
          userToChat[code]=chatId;
          await telegramApi('sendMessage',{chat_id:chatId,text:`Linked with code ${code}. You will receive notifications.`});
          return res.sendStatus(200);
        }
      }
      if(text === '/balance'){
        const linked = Object.keys(userToChat).find(k=>userToChat[k]===chatId);
        if(linked){ await telegramApi('sendMessage',{chat_id:chatId,text:`Balance for ${linked}: $1,234.56`}); }
        else { await telegramApi('sendMessage',{chat_id:chatId,text:'No account linked. Use the dashboard "Connect Telegram" button to link.'}); }
        return res.sendStatus(200);
      }
      await telegramApi('sendMessage',{chat_id:chatId,text:'Use /balance or /start <code> to link your account.'});
    }
    res.sendStatus(200);
  }catch(err){ console.error(err); res.sendStatus(500); }
});

// Protected notify endpoint for backend
app.post('/api/notify', async (req,res)=>{
  const token = req.headers['x-internal-token'];
  if(!token || token !== INTERNAL_TOKEN) return res.status(401).json({error:'unauthorized'});
  const { chat_id, text } = req.body; if(!chat_id || !text) return res.status(400).json({error:'chat_id and text required'});
  try{ const r = await telegramApi('sendMessage',{chat_id,text,parse_mode:'Markdown'}); return res.json(r);}catch(err){ console.error(err); return res.status(500).json({error:'send failed'}); }
});

// Crypto deposit API endpoints

// Get wallet address for a crypto/network combination
app.post('/api/crypto/wallet', (req, res) => {
  try {
    const { crypto, network } = req.body;
    if (!crypto || !network) {
      return res.status(400).json({ error: 'crypto and network required' });
    }

    const walletKey = `${crypto}_${network}`;
    const wallet = cryptoWallets[walletKey];
    
    if (wallet && wallet.status === 'active') {
      res.json({ 
        address: wallet.address,
        label: wallet.label 
      });
    } else {
      res.json({ 
        error: 'Wallet not configured or inactive' 
      });
    }
  } catch (error) {
    console.error('Error getting wallet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit crypto deposit
app.post('/api/crypto/deposit', async (req, res) => {
  try {
    const { crypto, network, address, amount, txHash, note } = req.body;
    const user = req.headers['x-user'] || 'Anonymous';
    
    if (!crypto || !network || !address || !amount || !txHash) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const depositId = `DEP${depositIdCounter++}`;
    const deposit = {
      id: depositId,
      user: user,
      crypto: crypto,
      network: network,
      address: address,
      amount: parseFloat(amount),
      txHash: txHash,
      note: note || '',
      status: 'pending',
      timestamp: new Date().toISOString(),
      processedBy: null,
      processedAt: null
    };

    cryptoDeposits.push(deposit);

    // Log the deposit action
    console.log(`New crypto deposit: ${user} - ${amount} ${crypto}/${network} - TXID: ${txHash}`);

    // Send Telegram notification if user is linked
    const linkCode = Object.keys(userToChat).find(code => code.startsWith('user-') && userToChat[code]);
    if (linkCode && BOT_TOKEN) {
      try {
        await telegramApi('sendMessage', {
          chat_id: userToChat[linkCode],
          text: `🏦 *Crypto Deposit Submitted*\n\nAmount: ${amount} ${crypto}\nNetwork: ${network}\nStatus: Pending Review\nDeposit ID: ${depositId}`,
          parse_mode: 'Markdown'
        });
      } catch (telegramError) {
        console.error('Telegram notification failed:', telegramError);
      }
    }

    res.json({ 
      success: true,
      depositId: depositId,
      message: 'Deposit submitted successfully' 
    });
  } catch (error) {
    console.error('Error submitting deposit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user deposits
app.get('/api/crypto/deposits', (req, res) => {
  try {
    const user = req.headers['x-user'] || 'Anonymous';
    const userDeposits = cryptoDeposits
      .filter(deposit => deposit.user === user)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json(userDeposits);
  } catch (error) {
    console.error('Error getting deposits:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin endpoints

// Save/update wallet (admin only)
app.post('/api/admin/wallet', (req, res) => {
  try {
    const adminUser = req.headers['x-admin-user'];
    if (!adminUser) {
      return res.status(401).json({ error: 'Admin access required' });
    }

    const { id, crypto, network, address, label, status } = req.body;
    if (!crypto || !network || !address || !label) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const walletKey = `${crypto}_${network}`;
    const walletId = id || `wallet_${Date.now()}`;
    
    cryptoWallets[walletKey] = {
      id: walletId,
      crypto: crypto,
      network: network,
      address: address,
      label: label,
      status: status || 'active',
      createdBy: adminUser,
      createdAt: new Date().toISOString()
    };

    console.log(`Admin ${adminUser} ${id ? 'updated' : 'created'} wallet: ${crypto}/${network}`);

    res.json({ 
      success: true,
      message: 'Wallet saved successfully',
      walletId: walletId 
    });
  } catch (error) {
    console.error('Error saving wallet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all wallets (admin only)
app.get('/api/admin/wallets', (req, res) => {
  try {
    const adminUser = req.headers['x-admin-user'];
    if (!adminUser) {
      return res.status(401).json({ error: 'Admin access required' });
    }

    const wallets = Object.keys(cryptoWallets).map(key => ({
      ...cryptoWallets[key],
      key: key
    }));

    res.json(wallets);
  } catch (error) {
    console.error('Error getting wallets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete wallet (admin only)
app.delete('/api/admin/wallet/:id', (req, res) => {
  try {
    const adminUser = req.headers['x-admin-user'];
    if (!adminUser) {
      return res.status(401).json({ error: 'Admin access required' });
    }

    const walletId = req.params.id;
    let deleted = false;
    
    // Find and delete wallet by ID
    Object.keys(cryptoWallets).forEach(key => {
      if (cryptoWallets[key].id === walletId) {
        delete cryptoWallets[key];
        deleted = true;
      }
    });

    if (deleted) {
      console.log(`Admin ${adminUser} deleted wallet: ${walletId}`);
      res.json({ success: true, message: 'Wallet deleted successfully' });
    } else {
      res.status(404).json({ error: 'Wallet not found' });
    }
  } catch (error) {
    console.error('Error deleting wallet:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get pending deposits (admin only)
app.get('/api/admin/deposits/pending', (req, res) => {
  try {
    const adminUser = req.headers['x-admin-user'];
    if (!adminUser) {
      return res.status(401).json({ error: 'Admin access required' });
    }

    const pendingDeposits = cryptoDeposits
      .filter(deposit => deposit.status === 'pending')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(pendingDeposits);
  } catch (error) {
    console.error('Error getting pending deposits:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all deposits (admin only)
app.get('/api/admin/deposits/all', (req, res) => {
  try {
    const adminUser = req.headers['x-admin-user'];
    if (!adminUser) {
      return res.status(401).json({ error: 'Admin access required' });
    }

    const allDeposits = cryptoDeposits
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(allDeposits);
  } catch (error) {
    console.error('Error getting all deposits:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update deposit status (admin only)
app.post('/api/admin/deposit/status', async (req, res) => {
  try {
    const adminUser = req.headers['x-admin-user'];
    if (!adminUser) {
      return res.status(401).json({ error: 'Admin access required' });
    }

    const { depositId, status, reason } = req.body;
    if (!depositId || !status) {
      return res.status(400).json({ error: 'depositId and status required' });
    }

    const deposit = cryptoDeposits.find(d => d.id === depositId);
    if (!deposit) {
      return res.status(404).json({ error: 'Deposit not found' });
    }

    if (deposit.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending deposits can be updated' });
    }

    deposit.status = status;
    deposit.processedBy = adminUser;
    deposit.processedAt = new Date().toISOString();
    if (reason) deposit.reason = reason;

    console.log(`Admin ${adminUser} ${status} deposit ${depositId} for user ${deposit.user}`);

    // Send Telegram notification to user if linked
    const linkCode = Object.keys(userToChat).find(code => code.startsWith('user-') && userToChat[code]);
    if (linkCode && BOT_TOKEN) {
      try {
        const statusEmoji = status === 'approved' ? '✅' : '❌';
        const statusText = status === 'approved' ? 'Approved' : 'Rejected';
        let message = `${statusEmoji} *Deposit ${statusText}*\n\nDeposit ID: ${depositId}\nAmount: ${deposit.amount} ${deposit.crypto}\nNetwork: ${deposit.network}`;
        
        if (status === 'approved') {
          message += '\n\n💰 Your account balance has been updated!';
        } else if (reason) {
          message += `\n\nReason: ${reason}`;
        }

        await telegramApi('sendMessage', {
          chat_id: userToChat[linkCode],
          text: message,
          parse_mode: 'Markdown'
        });
      } catch (telegramError) {
        console.error('Telegram notification failed:', telegramError);
      }
    }

    res.json({ 
      success: true,
      message: `Deposit ${status} successfully` 
    });
  } catch (error) {
    console.error('Error updating deposit status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static files
app.use(express.static('.'));

app.listen(PORT,()=>console.log(`Telegram webhook server listening on ${PORT}`));
