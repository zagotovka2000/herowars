const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
const domain = process.env.WEBHOOK_DOMAIN || 'herowars.alwaysdata.net';

if (!token) {
  console.error('❌ BOT_TOKEN is required');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: false });

async function setupWebhook() {
  try {
    const webhookUrl = `https://${domain}/webhook/${token}`;
    
    console.log('🔄 Setting up webhook...');
    console.log('📋 Webhook URL:', webhookUrl);
    
    // Удаляем старый webhook
    await bot.deleteWebHook();
    console.log('✅ Old webhook removed');
    
    // Устанавливаем новый webhook
    const result = await bot.setWebHook(webhookUrl);
    console.log('✅ New webhook set:', result);
    
    // Проверяем информацию о webhook
    const info = await bot.getWebHookInfo();
    console.log('📊 Webhook info:', info);
    
  } catch (error) {
    console.error('❌ Webhook setup failed:', error.message);
  }
}

async function removeWebhook() {
  try {
    console.log('🔄 Removing webhook...');
    const result = await bot.deleteWebHook();
    console.log('✅ Webhook removed:', result);
  } catch (error) {
    console.error('❌ Webhook removal failed:', error.message);
  }
}

async function getWebhookInfo() {
  try {
    const info = await bot.getWebHookInfo();
    console.log('📊 Webhook info:', info);
  } catch (error) {
    console.error('❌ Get webhook info failed:', error.message);
  }
}

// Обработка команд
const command = process.argv[2];
switch (command) {
  case 'set':
    setupWebhook();
    break;
  case 'remove':
    removeWebhook();
    break;
  case 'info':
    getWebhookInfo();
    break;
  default:
    console.log('Usage:');
    console.log('  node webhook-setup.js set    - Set webhook');
    console.log('  node webhook-setup.js remove - Remove webhook');
    console.log('  node webhook-setup.js info   - Get webhook info');
}
