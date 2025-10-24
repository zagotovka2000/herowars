require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
const domain = process.env.WEBHOOK_DOMAIN;

if (!token) {
  console.error('❌ BOT_TOKEN is required');
  process.exit(1);
}

console.log('🔧 Setting up webhook...');
console.log('🤖 Bot token:', token ? '✅ Set' : '❌ Missing');
console.log('🌐 Domain:', domain);

const bot = new TelegramBot(token, { polling: false });

async function setupWebhook() {
  try {
    const webhookUrl = `https://${domain}/webhook/${token}`;
    
    console.log('🔄 Setting webhook URL:', webhookUrl);
    
    // Удаляем старый вебхук
    await bot.deleteWebHook();
    console.log('✅ Old webhook removed');
    
    // Устанавливаем новый
    const result = await bot.setWebHook(webhookUrl);
    console.log('✅ Webhook set successfully');
    
    // Проверяем информацию
    const info = await bot.getWebHookInfo();
    console.log('📊 Webhook info:');
    console.log('  URL:', info.url);
    console.log('  Pending updates:', info.pending_update_count);
    
  } catch (error) {
    console.error('❌ Webhook setup failed:', error.message);
  }
}

setupWebhook();
