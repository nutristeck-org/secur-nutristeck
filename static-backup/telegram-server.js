const express = require('express');
const fetch = require('node-fetch'); // npm i node-fetch@2
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN; // set in env
const TELEGRAM_SECRET = process.env.TELEGRAM_SECRET_TOKEN || 'change_me';
const PORT = process.env.PORT || 3000;
const INTERNAL_TOKEN = process.env.INTERNAL_TOKEN || 'changeme';

// In production persist mappings in DB
const userToChat = {}; // { link_code: chatId }

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

app.listen(PORT,()=>console.log(`Telegram webhook server listening on ${PORT}`));
